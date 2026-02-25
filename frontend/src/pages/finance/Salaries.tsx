import { Button, SimpleGrid, Paper, Text, Group, Select, Badge } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconCurrencyDollar, IconCheck } from '@tabler/icons-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, type Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { useState, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import { salaryService, type SalaryPayment, type PayrollStats } from '../../services/salaryService';

const MONTHS = [
    { value: '1', label: 'January' }, { value: '2', label: 'February' },
    { value: '3', label: 'March' }, { value: '4', label: 'April' },
    { value: '5', label: 'May' }, { value: '6', label: 'June' },
    { value: '7', label: 'July' }, { value: '8', label: 'August' },
    { value: '9', label: 'September' }, { value: '10', label: 'October' },
    { value: '11', label: 'November' }, { value: '12', label: 'December' },
];

export default function Salaries() {
    const [search, setSearch] = useState('');
    const [data, setData] = useState<SalaryPayment[]>([]);
    const [stats, setStats] = useState<PayrollStats>({ totalPayroll: 0, thisMonth: 0, pendingDisbursal: 0, staffCount: 0 });
    const [loading, setLoading] = useState(true);
    const [confirmOpened, { open: openConfirm, close: closeConfirm }] = useDisclosure(false);
    const [monthFilter, setMonthFilter] = useState<string | null>(String(new Date().getMonth() + 1));
    const [yearFilter, setYearFilter] = useState<string | null>(String(new Date().getFullYear()));

    const loadData = async () => {
        try {
            setLoading(true);
            const [salaries, s] = await Promise.all([
                salaryService.getAll(
                    monthFilter ? parseInt(monthFilter) : undefined,
                    yearFilter ? parseInt(yearFilter) : undefined,
                ),
                salaryService.getStats(),
            ]);
            setData(salaries);
            setStats(s);
        } catch (e: any) {
            notifications.show({ message: e.message || 'Failed to load salaries', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [monthFilter, yearFilter]);

    const handleRunPayroll = async () => {
        closeConfirm();
        try {
            const month = monthFilter ? parseInt(monthFilter) : new Date().getMonth() + 1;
            const year = yearFilter ? parseInt(yearFilter) : new Date().getFullYear();
            const result = await salaryService.runPayroll({ month, year });
            notifications.show({ title: 'Payroll Created', message: result.message, color: 'green' });
            loadData();
        } catch (e: any) {
            notifications.show({ message: e.message || 'Failed to run payroll', color: 'red' });
        }
    };

    const handleMarkPaid = async (item: SalaryPayment) => {
        try {
            await salaryService.markAsPaid(item.id);
            notifications.show({ message: `Marked ${item.staff.firstName} ${item.staff.lastName} as paid`, color: 'green' });
            loadData();
        } catch (e: any) {
            notifications.show({ message: e.message || 'Failed to mark as paid', color: 'red' });
        }
    };

    const filteredData = data.filter(item =>
        `${item.staff?.firstName} ${item.staff?.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        item.staff?.employeeId?.toLowerCase().includes(search.toLowerCase()) ||
        item.staff?.designation?.toLowerCase().includes(search.toLowerCase())
    );

    const columns: Column<SalaryPayment>[] = [
        {
            accessor: 'staffName', header: 'Staff',
            render: (item) => (
                <div>
                    <Text size="sm" fw={500}>{item.staff?.firstName} {item.staff?.lastName}</Text>
                    <Text size="xs" c="dimmed">{item.staff?.employeeId}</Text>
                </div>
            ),
        },
        { accessor: 'designation', header: 'Role', render: (item) => <Text size="sm">{item.staff?.designation}</Text> },
        {
            accessor: 'amount', header: 'Amount',
            render: (item) => <Text size="sm" fw={500}>{item.currency} {Number(item.amount).toLocaleString()}</Text>,
        },
        {
            accessor: 'period', header: 'Period',
            render: (item) => <Badge variant="light" size="sm">{MONTHS.find(m => m.value === String(item.month))?.label} {item.year}</Badge>,
        },
        { accessor: 'status', header: 'Status', render: (item) => <StatusBadge status={item.status} /> },
        {
            accessor: 'actions', header: '',
            render: (item) => (
                <Group gap="xs" justify="flex-end">
                    {item.status === 'PENDING' && (
                        <Button size="xs" variant="light" color="green" leftSection={<IconCheck size={14} />} onClick={() => handleMarkPaid(item)}>
                            Mark Paid
                        </Button>
                    )}
                </Group>
            ),
        },
    ];

    return (
        <>
            <PageHeader
                title="Salaries & Payroll"
                subtitle="Manage staff salaries and payroll history"
                actions={<Button leftSection={<IconCurrencyDollar size={16} />} onClick={openConfirm}>Run Payroll</Button>}
            />

            <SimpleGrid cols={{ base: 1, sm: 4 }} mb="lg">
                <Paper withBorder p="md" radius="md">
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Total Payroll (Paid)</Text>
                    <Text size="xl" fw={700}>${stats.totalPayroll.toLocaleString()}</Text>
                </Paper>
                <Paper withBorder p="md" radius="md">
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>This Month</Text>
                    <Text size="xl" fw={700}>${stats.thisMonth.toLocaleString()}</Text>
                </Paper>
                <Paper withBorder p="md" radius="md">
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Pending Disbursal</Text>
                    <Text size="xl" fw={700} c="orange">${stats.pendingDisbursal.toLocaleString()}</Text>
                </Paper>
                <Paper withBorder p="md" radius="md">
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Staff Count</Text>
                    <Text size="xl" fw={700}>{stats.staffCount}</Text>
                </Paper>
            </SimpleGrid>

            <Group mb="md">
                <Select placeholder="Month" data={MONTHS} value={monthFilter} onChange={setMonthFilter} w={140} clearable />
                <Select placeholder="Year" data={['2024', '2025', '2026', '2027']} value={yearFilter} onChange={setYearFilter} w={100} clearable />
            </Group>

            <DataTable
                data={filteredData}
                columns={columns}
                search={search}
                onSearchChange={setSearch}
                loading={loading}
            />

            <ConfirmModal
                opened={confirmOpened}
                onClose={closeConfirm}
                onConfirm={handleRunPayroll}
                title="Run Payroll?"
                message={`This will create payroll entries for all active staff for ${MONTHS.find(m => m.value === monthFilter)?.label || 'the selected month'} ${yearFilter || new Date().getFullYear()}. Staff who already have entries will be skipped.`}
                confirmLabel="Yes, Run Payroll"
            />
        </>
    );
}
