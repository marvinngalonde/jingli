import { Button, Drawer, Box, SimpleGrid, Paper, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus } from '@tabler/icons-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, type Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useState } from 'react';
import { FeeForm } from '../../components/finance/FeeForm';
import { notifications } from '@mantine/notifications';

interface Fee {
    id: string;
    studentName: string;
    grade: string;
    amount: number;
    dueDate: string;
    status: string;
    type: string;
}

const mockData: Fee[] = [
    { id: '1', studentName: 'John Doe', grade: '10A', amount: 500, dueDate: '2024-03-01', status: 'Pending', type: 'Tuition' },
    { id: '2', studentName: 'Jane Smith', grade: '10B', amount: 500, dueDate: '2024-03-01', status: 'Paid', type: 'Tuition' },
    { id: '3', studentName: 'Alice Johnson', grade: '9A', amount: 50, dueDate: '2024-02-01', status: 'Overdue', type: 'Library Fine' },
    { id: '4', studentName: 'Bob Brown', grade: '11C', amount: 550, dueDate: '2024-03-15', status: 'Paid', type: 'Tuition' },
    { id: '5', studentName: 'Charlie Davis', grade: '8B', amount: 400, dueDate: '2024-03-10', status: 'Pending', type: 'Tuition' },
];

const columns: Column<Fee>[] = [
    { accessor: 'studentName', header: 'Student Name' },
    { accessor: 'type', header: 'Type' },
    { accessor: 'grade', header: 'Class' },
    { accessor: 'amount', header: 'Amount ($)' },
    { accessor: 'dueDate', header: 'Due Date' },
    {
        accessor: 'status',
        header: 'Status',
        render: (item) => <StatusBadge status={item.status} />
    },
];

export default function Fees() {
    const [search, setSearch] = useState('');
    const [opened, { open, close }] = useDisclosure(false);

    const filteredData = mockData.filter(item =>
        item.studentName.toLowerCase().includes(search.toLowerCase()) ||
        item.status.toLowerCase().includes(search.toLowerCase()) ||
        item.type.toLowerCase().includes(search.toLowerCase())
    );

    const handleCreate = (values: any) => {
        console.log(values);
        notifications.show({ message: 'Invoice created successfully', color: 'green' });
        close();
    };

    return (
        <>
            <PageHeader
                title="Fees Management"
                subtitle="Track and manage student fee payments"
                actions={<Button leftSection={<IconPlus size={16} />} onClick={open}>Create Invoice</Button>}
            />

            <SimpleGrid cols={{ base: 1, sm: 3 }} mb="lg">
                <Paper withBorder p="md" radius="md">
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Total Collected</Text>
                    <Text size="xl" fw={700}>$1,250,500</Text>
                </Paper>
                <Paper withBorder p="md" radius="md">
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Pending Fees</Text>
                    <Text size="xl" fw={700} c="orange">$45,200</Text>
                </Paper>
                <Paper withBorder p="md" radius="md">
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Overdue</Text>
                    <Text size="xl" fw={700} c="red">$12,400</Text>
                </Paper>
            </SimpleGrid>

            <DataTable
                data={filteredData}
                columns={columns}
                search={search}
                onSearchChange={setSearch}
                pagination={{ total: 1, page: 1, onChange: () => { } }}
            />

            <Drawer opened={opened} onClose={close} title="Create New Invoice" position="right" size="md">
                <Box p={0}>
                    <FeeForm
                        onSubmit={handleCreate}
                        onCancel={close}
                    />
                </Box>
            </Drawer>
        </>
    );
}
