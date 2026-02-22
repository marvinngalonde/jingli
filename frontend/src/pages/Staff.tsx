import { useState, useEffect } from 'react';
import {
    Button,
    Group,
    Avatar,
    Text,
    Drawer,
    Box,
    Badge,
    Select,
    rem
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconFilter, IconDownload } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { StaffForm } from '../components/staff/StaffForm';
import { staffService } from '../services/staffService';
import { exportToCsv, exportToPdf } from '../utils/exportUtils';
import type { Staff } from '../types/staff'; // Assuming type exists
import { PageHeader } from '../components/common/PageHeader';
import { DataTable, type Column } from '../components/common/DataTable';
import { ActionMenu } from '../components/common/ActionMenu';

export default function StaffPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<Staff[]>([]);
    const [filteredData, setFilteredData] = useState<Staff[]>([]);
    const [search, setSearch] = useState('');
    const [deptFilter, setDeptFilter] = useState<string | null>(null);
    const [opened, { open, close }] = useDisclosure(false);
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

    useEffect(() => {
        loadStaff();
    }, []);

    useEffect(() => {
        let result = data;
        if (search) {
            const lowerSearch = search.toLowerCase();
            result = result.filter(item =>
                item.firstName.toLowerCase().includes(lowerSearch) ||
                item.lastName.toLowerCase().includes(lowerSearch) ||
                item.user?.email.toLowerCase().includes(lowerSearch)
            );
        }
        if (deptFilter) {
            result = result.filter(item => item.department === deptFilter);
        }
        setFilteredData(result);
    }, [data, search, deptFilter]);

    const loadStaff = async () => {
        setLoading(true);
        try {
            const staffList = await staffService.getAll();
            setData(staffList);
            setFilteredData(staffList);
        } catch (error) {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to load staff', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (values: any) => {
        setLoading(true);
        try {
            await staffService.create(values);
            notifications.show({ message: 'Staff added successfully', color: 'green' });
            closeDrawer();
            loadStaff();
        } catch (error) {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to add staff', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (values: any) => {
        if (!selectedStaff) return;
        setLoading(true);
        try {
            await staffService.update(selectedStaff.id, values);
            notifications.show({ message: 'Staff updated successfully', color: 'green' });
            closeDrawer();
            loadStaff();
        } catch (error) {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to update staff', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure? This action is irreversible.')) return;
        try {
            await staffService.delete(id);
            notifications.show({ message: 'Staff deleted', color: 'green' });
            loadStaff();
        } catch (error) {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to delete staff', color: 'red' });
        }
    };

    const openEditDrawer = (staff: Staff) => {
        setSelectedStaff(staff);
        open();
    };

    const closeDrawer = () => {
        setSelectedStaff(null);
        close();
    };

    const columns: Column<Staff>[] = [
        {
            accessor: 'name',
            header: 'Staff Member',
            render: (item) => (
                <Group gap="sm">
                    <Avatar size={40} radius={40} color="blue">{item.firstName[0]}{item.lastName[0]}</Avatar>
                    <div>
                        <Text size="sm" fw={500}>{item.firstName} {item.lastName}</Text>
                        <Text size="xs" c="dimmed">{item.designation}</Text>
                    </div>
                </Group>
            )
        },
        {
            accessor: 'department',
            header: 'Department',
            render: (item) => <Badge variant="light" color="gray">{item.department}</Badge>
        },
        {
            accessor: 'email',
            header: 'Email',
            render: (item) => <Text size="sm">{item.user?.email || item.employeeId}</Text>
        },
        {
            accessor: 'actions',
            header: '',
            render: (item) => (
                <Group justify="flex-end">
                    <ActionMenu
                        onView={() => navigate(`/staff/${item.id}`)}
                        onEdit={() => openEditDrawer(item)}
                        onDelete={() => handleDelete(item.id)}
                    />
                </Group>
            )
        }
    ];

    const handleExport = () => {
        const exportData = filteredData.map(s => ({
            'Employee ID': s.employeeId,
            'First Name': s.firstName,
            'Last Name': s.lastName,
            'Email': s.user?.email || 'N/A',
            'Department': s.department,
            'Designation': s.designation,
            'Joined Date': new Date(s.joinDate).toLocaleDateString()
        }));
        exportToCsv(exportData, 'Jingli_Staff_Directory');
        notifications.show({ title: 'Success', message: 'Staff directory exported', color: 'green' });
    };

    const handleExportPdf = async () => {
        try {
            await exportToPdf('/staff/export/pdf', 'Jingli_Staff_Directory');
            notifications.show({ title: 'Success', message: 'Staff PDF downloaded', color: 'green' });
        } catch {
            notifications.show({ title: 'Error', message: 'Failed to export PDF', color: 'red' });
        }
    };

    return (
        <>
            <PageHeader
                title="Staff Directory"
                subtitle="Manage teachers and school staff"
                actions={
                    <>
                        <Button variant="light" leftSection={<IconDownload size={18} />} onClick={handleExport}>
                            Export CSV
                        </Button>
                        <Button variant="light" color="red" leftSection={<IconDownload size={18} />} onClick={handleExportPdf}>
                            Export PDF
                        </Button>
                        <Button leftSection={<IconPlus size={18} />} onClick={open}>
                            Add Staff
                        </Button>
                    </>
                }
            />

            <DataTable
                data={filteredData}
                columns={columns}
                loading={loading}
                search={search}
                onSearchChange={setSearch}
                pagination={{
                    total: Math.ceil(filteredData.length / 10),
                    page: 1,
                    onChange: () => { }
                }}
                filterSlot={
                    <Select
                        placeholder="Department"
                        data={['Administration', 'Science', 'Mathematics', 'English', 'Arts', 'Sports', 'IT']}
                        value={deptFilter}
                        onChange={setDeptFilter}
                        clearable
                        leftSection={<IconFilter style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                        w={150}
                    />
                }
            />

            <Drawer opened={opened} onClose={closeDrawer} title={selectedStaff ? "Edit Staff" : "Add New Staff"} position="right" size="md">
                <Box p={0}>
                    <StaffForm
                        key={selectedStaff ? selectedStaff.id : 'new'}
                        initialValues={selectedStaff ? {
                            ...selectedStaff,
                            email: selectedStaff.user?.email || '',
                            joinDate: new Date(selectedStaff.joinDate)
                        } : undefined}
                        onSubmit={selectedStaff ? handleUpdate : handleCreate}
                        onCancel={closeDrawer}
                        loading={loading}
                        isEditing={!!selectedStaff}
                    />
                </Box>
            </Drawer>
        </>
    );
}
