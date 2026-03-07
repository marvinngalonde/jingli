import { Title, Text, Stack, Card, Loader, Center, Badge, Group, Paper, Table, ThemeIcon, SimpleGrid, Progress } from '@mantine/core';
import { IconCurrencyDollar, IconFileInvoice, IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../services/api';
import { notifications } from '@mantine/notifications';
import { format } from 'date-fns';

import type { Invoice } from '../../../types/finance';

export default function StudentFees() {
    const { user } = useAuth();
    const { data: invoicesData = [], isLoading: loading } = useQuery({
        queryKey: ['studentInvoices', user?.profile?.id],
        queryFn: async () => {
            const studentId = user?.profile?.id;
            if (!studentId) return [];
            const res = await api.get(`/invoices?studentId=${studentId}`);
            return res.data;
        },
        enabled: !!user?.profile?.id,
        staleTime: 5 * 60 * 1000,
    });

    const invoices = (invoicesData as Invoice[]).map(inv => ({
        ...inv,
        amount: Number(inv.amount),
        paidAmount: inv.transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0,
        invoiceNo: inv.id.substring(0, 8),
    }));

    const totalDue = invoices.reduce((sum, i) => sum + (i.amount - i.paidAmount), 0);
    const totalPaid = invoices.reduce((sum, i) => sum + i.paidAmount, 0);
    const totalAmount = invoices.reduce((sum, i) => sum + i.amount, 0);
    const paymentProgress = totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;

    if (loading) {
        return <Center h={400}><Loader /></Center>;
    }

    return (
        <Stack gap="lg">
            <div>
                <Group gap="sm" mb={4}>
                    <ThemeIcon variant="light" color="green" size="lg" radius="md">
                        <IconCurrencyDollar size={20} />
                    </ThemeIcon>
                    <Title order={2}>My Fees</Title>
                </Group>
                <Text c="dimmed" ml={48}>View your fee invoices and payment status</Text>
            </div>

            {/* Summary Cards */}
            <SimpleGrid cols={{ base: 1, sm: 3 }}>
                <Paper withBorder radius="md" p="lg" bg="var(--app-surface)">
                    <Text size="xs" tt="uppercase" fw={700} c="dimmed">Total Fees</Text>
                    <Text size="xl" fw={700} mt={4}>${totalAmount.toLocaleString()}</Text>
                </Paper>
                <Paper withBorder radius="md" p="lg" bg="var(--app-surface)">
                    <Text size="xs" tt="uppercase" fw={700} c="dimmed">Amount Paid</Text>
                    <Text size="xl" fw={700} mt={4} c="green">${totalPaid.toLocaleString()}</Text>
                </Paper>
                <Paper withBorder radius="md" p="lg" bg="var(--app-surface)">
                    <Text size="xs" tt="uppercase" fw={700} c="dimmed">Balance Due</Text>
                    <Text size="xl" fw={700} mt={4} c={totalDue > 0 ? 'red' : 'green'}>${totalDue.toLocaleString()}</Text>
                </Paper>
            </SimpleGrid>

            {/* Payment Progress */}
            <Paper withBorder radius="md" p="lg" bg="var(--app-surface)">
                <Group justify="space-between" mb="xs">
                    <Text size="sm" fw={500}>Payment Progress</Text>
                    <Text size="sm" c="dimmed">{paymentProgress.toFixed(0)}%</Text>
                </Group>
                <Progress value={paymentProgress} color={paymentProgress >= 100 ? 'green' : 'blue'} size="lg" radius="xl" />
            </Paper>

            {/* Invoices Table */}
            {invoices.length === 0 ? (
                <Card withBorder radius="md" p="xl" ta="center" bg="var(--app-surface)">
                    <ThemeIcon variant="light" color="gray" size={60} radius="xl" mx="auto" mb="md">
                        <IconFileInvoice size={30} />
                    </ThemeIcon>
                    <Text size="lg" fw={500}>No Invoices</Text>
                    <Text c="dimmed" mt="xs">You currently have no fee invoices.</Text>
                </Card>
            ) : (
                <Paper withBorder radius="md" p="md" bg="var(--app-surface)">
                    <Table striped highlightOnHover className="mobile-stack-table">
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Invoice #</Table.Th>
                                <Table.Th>Fee Type</Table.Th>
                                <Table.Th>Amount</Table.Th>
                                <Table.Th>Paid</Table.Th>
                                <Table.Th>Balance</Table.Th>
                                <Table.Th>Due Date</Table.Th>
                                <Table.Th>Status</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {invoices.map((inv) => (
                                <Table.Tr key={inv.id}>
                                    <Table.Td data-label="Invoice #" fw={500}>{inv.invoiceNo}</Table.Td>
                                    <Table.Td data-label="Fee Type">{inv.feeStructure?.name || 'N/A'}</Table.Td>
                                    <Table.Td data-label="Amount">${inv.amount.toLocaleString()}</Table.Td>
                                    <Table.Td data-label="Paid" c="green">${inv.paidAmount.toLocaleString()}</Table.Td>
                                    <Table.Td data-label="Balance" c={inv.amount - inv.paidAmount > 0 ? 'red' : 'green'}>
                                        ${(inv.amount - inv.paidAmount).toLocaleString()}
                                    </Table.Td>
                                    <Table.Td data-label="Due Date">{format(new Date(inv.dueDate), 'dd MMM yyyy')}</Table.Td>
                                    <Table.Td data-label="Status">
                                        <Badge
                                            color={inv.status === 'PAID' ? 'green' : inv.status === 'OVERDUE' ? 'red' : 'orange'}
                                            variant="light"
                                            leftSection={inv.status === 'PAID' ? <IconCheck size={12} /> : <IconAlertCircle size={12} />}
                                        >
                                            {inv.status}
                                        </Badge>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Paper>
            )}
        </Stack>
    );
}
