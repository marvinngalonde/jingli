import { Button, SimpleGrid, Paper, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconCurrencyDollar } from '@tabler/icons-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, type Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';

interface Salary {
    id: string;
    staffName: string;
    role: string;
    amount: number;
    paymentDate: string;
    status: string;
}

const mockData: Salary[] = [
    { id: '1', staffName: 'Sarah Wilson', role: 'Teacher', amount: 3000, paymentDate: '2024-02-28', status: 'Paid' },
    { id: '2', staffName: 'Mike Jones', role: 'Janitor', amount: 1500, paymentDate: '2024-02-28', status: 'Paid' },
    { id: '3', staffName: 'Emily Davis', role: 'Admin', amount: 2800, paymentDate: '2024-02-28', status: 'Processing' },
    { id: '4', staffName: 'David Lee', role: 'Teacher', amount: 3100, paymentDate: '2024-02-28', status: 'Paid' },
];

const columns: Column<Salary>[] = [
    { accessor: 'staffName', header: 'Staff Name' },
    { accessor: 'role', header: 'Role' },
    { accessor: 'amount', header: 'Amount ($)' },
    { accessor: 'paymentDate', header: 'Payment Date' },
    {
        accessor: 'status',
        header: 'Status',
        render: (item) => <StatusBadge status={item.status} />
    },
];

export default function Salaries() {
    const [search, setSearch] = useState('');
    const [confirmOpened, { open: openConfirm, close: closeConfirm }] = useDisclosure(false);

    const filteredData = mockData.filter(item =>
        item.staffName.toLowerCase().includes(search.toLowerCase()) ||
        item.role.toLowerCase().includes(search.toLowerCase())
    );

    const handleRunPayroll = () => {
        closeConfirm();
        notifications.show({ title: 'Payroll Started', message: 'Payroll processing for March 2024 has started.', color: 'blue', loading: true });

        setTimeout(() => {
            notifications.show({ title: 'Success', message: 'Payroll processed successfully for 45 staff members.', color: 'green' });
        }, 2000);
    };

    return (
        <>
            <PageHeader
                title="Salaries & Payroll"
                subtitle="Manage staff salaries and payroll history"
                actions={<Button leftSection={<IconCurrencyDollar size={16} />} onClick={openConfirm}>Run Payroll</Button>}
            />

            <SimpleGrid cols={{ base: 1, sm: 3 }} mb="lg">
                <Paper withBorder p="md" radius="md">
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Total Payroll</Text>
                    <Text size="xl" fw={700}>$185,000</Text>
                </Paper>
                <Paper withBorder p="md" radius="md">
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Staff Count</Text>
                    <Text size="xl" fw={700}>45</Text>
                </Paper>
                <Paper withBorder p="md" radius="md">
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Pending Disbursal</Text>
                    <Text size="xl" fw={700} c="orange">$2,800</Text>
                </Paper>
            </SimpleGrid>

            <DataTable
                data={filteredData}
                columns={columns}
                search={search}
                onSearchChange={setSearch}
                pagination={{ total: 1, page: 1, onChange: () => { } }}
            />

            <ConfirmModal
                opened={confirmOpened}
                onClose={closeConfirm}
                onConfirm={handleRunPayroll}
                title="Run Payroll?"
                message="Are you sure you want to run payroll for the current month? This will generate payslips and initiate transfers for all active staff."
                confirmLabel="Yes, Run Payroll"
            />
        </>
    );
}
