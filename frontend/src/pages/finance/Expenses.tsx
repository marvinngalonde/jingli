import { Button, Drawer, Box, SimpleGrid, Paper, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus } from '@tabler/icons-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, type Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useState } from 'react';
import { ExpenseForm } from '../../components/finance/ExpenseForm';
import { notifications } from '@mantine/notifications';

interface Expense {
    id: string;
    description: string;
    category: string;
    amount: number;
    date: string;
    status: string;
}

const mockData: Expense[] = [
    { id: '1', description: 'Office Supplies', category: 'Operations', amount: 150, date: '2024-03-10', status: 'Approved' },
    { id: '2', description: 'Plumbing Repair', category: 'Maintenance', amount: 300, date: '2024-03-08', status: 'Paid' },
    { id: '3', description: 'New Projector', category: 'Equipment', amount: 1200, date: '2024-03-05', status: 'Pending' },
    { id: '4', description: 'Electricity Bill', category: 'Utilities', amount: 450, date: '2024-03-01', status: 'Paid' },
];

const columns: Column<Expense>[] = [
    { accessor: 'description', header: 'Description' },
    { accessor: 'category', header: 'Category' },
    { accessor: 'amount', header: 'Amount ($)' },
    { accessor: 'date', header: 'Date' },
    {
        accessor: 'status',
        header: 'Status',
        render: (item) => <StatusBadge status={item.status} />
    },
];

export default function Expenses() {
    const [search, setSearch] = useState('');
    const [opened, { open, close }] = useDisclosure(false);

    const filteredData = mockData.filter(item =>
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase())
    );

    const handleCreate = (values: any) => {
        console.log(values);
        notifications.show({ message: 'Expense recorded successfully', color: 'green' });
        close();
    };

    return (
        <>
            <PageHeader
                title="Expenses"
                subtitle="Track school operational expenses"
                actions={<Button leftSection={<IconPlus size={16} />} onClick={open}>Record Expense</Button>}
            />

            <SimpleGrid cols={{ base: 1, sm: 3 }} mb="lg">
                <Paper withBorder p="md" radius="md">
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Total Expenses</Text>
                    <Text size="xl" fw={700}>$34,200</Text>
                </Paper>
                <Paper withBorder p="md" radius="md">
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>This Month</Text>
                    <Text size="xl" fw={700} c="red">+$4,200</Text>
                </Paper>
                <Paper withBorder p="md" radius="md">
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Budget Utilization</Text>
                    <Text size="xl" fw={700} c="blue">78%</Text>
                </Paper>
            </SimpleGrid>

            <DataTable
                data={filteredData}
                columns={columns}
                search={search}
                onSearchChange={setSearch}
                pagination={{ total: 1, page: 1, onChange: () => { } }}
            />

            <Drawer opened={opened} onClose={close} title="Record New Expense" position="right" size="md">
                <Box p={0}>
                    <ExpenseForm
                        onSubmit={handleCreate}
                        onCancel={close}
                    />
                </Box>
            </Drawer>
        </>
    );
}
