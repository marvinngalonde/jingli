import { Button, Drawer, Box, SimpleGrid, Paper, Text, Select, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconCheck } from '@tabler/icons-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, type Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ActionMenu } from '../../components/common/ActionMenu';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { useState, useEffect } from 'react';
import { ExpenseForm } from '../../components/finance/ExpenseForm';
import { notifications } from '@mantine/notifications';
import { expenseService, type Expense, type ExpenseStats } from '../../services/expenseService';

export default function Expenses() {
    const [search, setSearch] = useState('');
    const [data, setData] = useState<Expense[]>([]);
    const [stats, setStats] = useState<ExpenseStats>({ totalExpenses: 0, thisMonth: 0, pendingCount: 0 });
    const [loading, setLoading] = useState(true);
    const [opened, { open, close }] = useDisclosure(false);
    const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const [expenses, s] = await Promise.all([
                expenseService.getAll(categoryFilter || undefined),
                expenseService.getStats(),
            ]);
            setData(expenses);
            setStats(s);
        } catch (e: any) {
            notifications.show({ message: e.message || 'Failed to load expenses', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [categoryFilter]);

    const handleCreate = async (values: any) => {
        try {
            await expenseService.create(values);
            notifications.show({ message: 'Expense recorded successfully', color: 'green' });
            close();
            loadData();
        } catch (e: any) {
            notifications.show({ message: e.message || 'Failed to create expense', color: 'red' });
        }
    };

    const handleApprove = async (item: Expense) => {
        try {
            await expenseService.approve(item.id);
            notifications.show({ message: 'Expense approved', color: 'green' });
            loadData();
        } catch (e: any) {
            notifications.show({ message: e.message || 'Failed to approve', color: 'red' });
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await expenseService.remove(deleteTarget.id);
            notifications.show({ message: 'Expense deleted', color: 'green' });
            setDeleteTarget(null);
            loadData();
        } catch (e: any) {
            notifications.show({ message: e.message || 'Failed to delete', color: 'red' });
        }
    };

    const filteredData = data.filter(item =>
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase())
    );

    const columns: Column<Expense>[] = [
        { accessor: 'description', header: 'Description' },
        { accessor: 'category', header: 'Category' },
        {
            accessor: 'amount', header: 'Amount',
            render: (item) => <Text size="sm" fw={500}>{item.currency} {Number(item.amount).toLocaleString()}</Text>
        },
        { accessor: 'date', header: 'Date', render: (item) => <Text size="sm">{new Date(item.date).toLocaleDateString()}</Text> },
        {
            accessor: 'status', header: 'Status',
            render: (item) => <StatusBadge status={item.status} />
        },
        {
            accessor: 'actions', header: '',
            render: (item) => (
                <Group gap="xs" justify="flex-end">
                    {item.status === 'PENDING' && (
                        <Button size="xs" variant="light" color="green" leftSection={<IconCheck size={14} />} onClick={() => handleApprove(item)}>
                            Approve
                        </Button>
                    )}
                    <ActionMenu
                        onDelete={() => setDeleteTarget(item)}
                    />
                </Group>
            ),
        },
    ];

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
                    <Text size="xl" fw={700}>${stats.totalExpenses.toLocaleString()}</Text>
                </Paper>
                <Paper withBorder p="md" radius="md">
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>This Month</Text>
                    <Text size="xl" fw={700} c="red">+${stats.thisMonth.toLocaleString()}</Text>
                </Paper>
                <Paper withBorder p="md" radius="md">
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Pending Approval</Text>
                    <Text size="xl" fw={700} c="orange">{stats.pendingCount}</Text>
                </Paper>
            </SimpleGrid>

            <Group mb="md">
                <Select
                    placeholder="Filter by category"
                    clearable
                    data={['Operations', 'Maintenance', 'Equipment', 'Utilities', 'Supplies', 'Transport', 'Catering', 'Other']}
                    value={categoryFilter}
                    onChange={setCategoryFilter}
                    w={200}
                />
            </Group>

            <DataTable
                data={filteredData}
                columns={columns}
                search={search}
                onSearchChange={setSearch}
                loading={loading}
            />

            <Drawer opened={opened} onClose={close} title="Record New Expense" position="right" size="md">
                <Box p={0}>
                    <ExpenseForm
                        onSubmit={handleCreate}
                        onCancel={close}
                    />
                </Box>
            </Drawer>

            <ConfirmModal
                opened={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Delete Expense?"
                message={`Are you sure you want to delete "${deleteTarget?.description}"?`}
            />
        </>
    );
}
