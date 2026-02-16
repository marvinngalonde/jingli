import { useState, useEffect, useMemo } from 'react';
import {
    Button,
    Group,
    Avatar,
    Text,
    Select,
    rem,
    Drawer,
    Box
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    IconPlus,
    IconFilter,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { StudentForm } from '../components/students/StudentForm';
// import { studentService } from '../services/studentService'; // Unused until API is ready

// Common Components
import { PageHeader } from '../components/common/PageHeader';
import { DataTable, type Column } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { ActionMenu } from '../components/common/ActionMenu';

export default function Students() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [opened, { open, close }] = useDisclosure(false);

    // Mock Data
    const mockStudents = [
        { id: '1', first_name: 'Alice', last_name: 'Johnson', email: 'alice@example.com', status: 'active', class: { name: 'Grade 10-A' }, avatar_url: null },
        { id: '2', first_name: 'Bob', last_name: 'Smith', email: 'bob@example.com', status: 'inactive', class: { name: 'Grade 9-B' }, avatar_url: null },
        { id: '3', first_name: 'Charlie', last_name: 'Brown', email: 'charlie@example.com', status: 'active', class: { name: 'Grade 11-C' }, avatar_url: null },
        { id: '4', first_name: 'Diana', last_name: 'Prince', email: 'diana@example.com', status: 'suspended', class: { name: 'Grade 12-A' }, avatar_url: null },
        { id: '5', first_name: 'Evan', last_name: 'Wright', email: 'evan@example.com', status: 'active', class: { name: 'Grade 10-A' }, avatar_url: null },
    ];

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        setLoading(true);
        try {
            setTimeout(() => {
                setData(mockStudents);
                setLoading(false);
            }, 800);
        } catch (error) {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to load students', color: 'red' });
            setLoading(false);
        }
    };

    const handleCreate = (values: any) => {
        console.log(values);
        notifications.show({ message: 'Student created successfully', color: 'green' });
        close();
    };

    const filteredData = useMemo(() => {
        return data.filter(item => {
            const matchesSearch =
                item.first_name.toLowerCase().includes(search.toLowerCase()) ||
                item.last_name.toLowerCase().includes(search.toLowerCase()) ||
                item.email.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter ? item.status === statusFilter : true;
            return matchesSearch && matchesStatus;
        });
    }, [data, search, statusFilter]);

    const columns: Column<any>[] = [
        {
            accessor: 'name',
            header: 'Student',
            render: (item) => (
                <Group gap="sm">
                    <Avatar size={40} src={item.avatar_url} radius={40} color="brand" alt={item.first_name}>
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
            accessor: 'class',
            header: 'Class/Grade',
            render: (item) => <Text size="sm">{item.class?.name || 'Unassigned'}</Text>
        },
        {
            accessor: 'balance',
            header: 'Balance',
            render: () => <Text size="sm">$0.00</Text>
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
                        onView={() => navigate(`/students/${item.id}`)}
                        onEdit={() => notifications.show({ message: 'Edit Student - Coming Soon' })}
                        onDelete={() => notifications.show({ message: 'Delete Student - Coming Soon', color: 'red' })}
                    />
                </Group>
            )
        }
    ];

    return (
        <>
            <PageHeader
                title="Students"
                subtitle="Manage your student directory"
                actions={
                    <Button leftSection={<IconPlus size={18} />} onClick={open}>
                        Add Student
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
                        placeholder="Status"
                        data={['active', 'inactive', 'suspended']}
                        value={statusFilter}
                        onChange={setStatusFilter}
                        clearable
                        leftSection={<IconFilter style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                        w={150}
                    />
                }
                onExport={() => notifications.show({ message: 'Exporting...' })}
            />

            <Drawer opened={opened} onClose={close} title="Add New Student" position="right" size="md">
                <Box p={0}>
                    <StudentForm
                        onSubmit={handleCreate}
                        onCancel={close}
                    />
                </Box>
            </Drawer>
        </>
    );
}
