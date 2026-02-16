import { useState, useEffect, useMemo } from 'react';
import {
    Button,
    Group,
    Avatar,
    Text,
    Select,
    rem,
    Drawer,
    Box,
    Badge
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    IconPlus,
    IconFilter,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';

// Common Components
import { PageHeader } from '../components/common/PageHeader';
import { DataTable, type Column } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { ActionMenu } from '../components/common/ActionMenu';
import { StaffForm } from '../components/staff/StaffForm';

export default function Staff() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string | null>(null);
    const [opened, { open, close }] = useDisclosure(false);

    // Mock Data
    const mockStaff = [
        { id: '1', first_name: 'Sarah', last_name: 'Connor', email: 'sarah@example.com', role: 'Teacher', department: 'Science', status: 'active', avatar_url: null },
        { id: '2', first_name: 'James', last_name: 'Cameron', email: 'james@example.com', role: 'Administrator', department: 'Management', status: 'active', avatar_url: null },
        { id: '3', first_name: 'Kyle', last_name: 'Reese', email: 'kyle@example.com', role: 'Support Staff', department: 'Facilities', status: 'on_leave', avatar_url: null },
        { id: '4', first_name: 'Ellen', last_name: 'Ripley', email: 'ellen@example.com', role: 'Teacher', department: 'Science', status: 'active', avatar_url: null },
        { id: '5', first_name: 'Marty', last_name: 'McFly', email: 'marty@example.com', role: 'Teacher', department: 'History', status: 'inactive', avatar_url: null },
    ];

    useEffect(() => {
        loadStaff();
    }, []);

    const loadStaff = async () => {
        setLoading(true);
        try {
            // Simulate API call
            setTimeout(() => {
                setData(mockStaff);
                setLoading(false);
            }, 800);
        } catch (error) {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to load staff', color: 'red' });
            setLoading(false);
        }
    };

    const handleCreate = (values: any) => {
        console.log(values);
        notifications.show({ message: 'Staff member added successfully', color: 'green' });
        close();
    };

    const filteredData = useMemo(() => {
        return data.filter(item => {
            const matchesSearch =
                item.first_name.toLowerCase().includes(search.toLowerCase()) ||
                item.last_name.toLowerCase().includes(search.toLowerCase()) ||
                item.email.toLowerCase().includes(search.toLowerCase());
            const matchesRole = roleFilter ? item.role === roleFilter : true;
            return matchesSearch && matchesRole;
        });
    }, [data, search, roleFilter]);

    const columns: Column<any>[] = [
        {
            accessor: 'name',
            header: 'Staff Member',
            render: (item) => (
                <Group gap="sm">
                    <Avatar size={40} src={item.avatar_url} radius={40} color="blue" alt={item.first_name}>
                        {item.first_name[0]}{item.last_name[0]}
                    </Avatar>
                    <div>
                        <Text size="sm" fw={500}>
                            {item.first_name} {item.last_name}
                        </Text>
                        <Text size="xs" c="dimmed">
                            {item.email}
                        </Text>
                    </div>
                </Group>
            )
        },
        {
            accessor: 'role',
            header: 'Role',
            render: (item) => <Badge variant="light" color="gray">{item.role}</Badge>
        },
        {
            accessor: 'department',
            header: 'Department',
            render: (item) => <Text size="sm">{item.department}</Text>
        },
        {
            accessor: 'status',
            header: 'Status',
            render: (item) => <StatusBadge status={item.status} />
        },
        {
            accessor: 'actions',
            header: '',
            render: (item) => (
                <Group justify="flex-end">
                    <ActionMenu
                        onView={() => navigate(`/staff/${item.id}`)}
                        onEdit={() => notifications.show({ message: 'Edit Component Coming Soon' })} // Will be wired to detail page or drawer
                        onDelete={() => notifications.show({ message: 'Delete Staff - Coming Soon', color: 'red' })}
                    />
                </Group>
            )
        }
    ];

    return (
        <>
            <PageHeader
                title="Staff Directory"
                subtitle="Manage teachers, administrators, and support staff"
                actions={
                    <Button leftSection={<IconPlus size={18} />} onClick={open}>
                        Add Staff
                    </Button>
                }
            />

            <DataTable
                data={filteredData}
                columns={columns}
                loading={loading}
                search={search}
                onSearchChange={setSearch}
                pagination={{
                    total: 1,
                    page: 1,
                    onChange: () => { }
                }}
                filterSlot={
                    <Select
                        placeholder="Role"
                        data={['Teacher', 'Administrator', 'Support Staff']}
                        value={roleFilter}
                        onChange={setRoleFilter}
                        clearable
                        leftSection={<IconFilter style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                        w={150}
                    />
                }
                onExport={() => notifications.show({ message: 'Exporting...' })}
            />

            <Drawer opened={opened} onClose={close} title="Add New Staff" position="right" size="md">
                <Box p={0}>
                    <StaffForm
                        onSubmit={handleCreate}
                        onCancel={close}
                    />
                </Box>
            </Drawer>
        </>
    );
}
