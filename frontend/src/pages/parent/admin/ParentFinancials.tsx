import { Title, Text, Stack, Card, Group, Select, LoadingOverlay, Table, Badge, Button, SimpleGrid, ThemeIcon } from '@mantine/core';
import { IconUsers, IconCreditCard, IconReceipt } from '@tabler/icons-react';
import { useAuth } from '../../../context/AuthContext';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../services/api';
import { format } from 'date-fns';

interface Child {
    id: string;
    firstName: string;
    lastName: string;
    admissionNo: string;
}

interface FinancialData {
    pendingAmount: number;
    totalPaid: number;
    invoices: {
        id: string;
        title: string;
        amount: number;
        dueDate: string;
        status: 'PENDING' | 'PAID' | 'OVERDUE' | 'PARTIAL';
    }[];
    transactions: {
        id: string;
        amount: number;
        date: string;
        paymentMethod: string;
        status: string;
    }[];
}

export function ParentFinancials() {
    const { } = useAuth();
    const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

    const { data: childrenData, isLoading: loadingChildren } = useQuery({
        queryKey: ['parentChildren'],
        queryFn: async () => {
            const res = await api.get('/parent/children');
            return res.data as Child[];
        }
    });

    const children = childrenData || [];

    useEffect(() => {
        if (children.length > 0 && !selectedChildId) {
            setSelectedChildId(children[0].id);
        }
    }, [children, selectedChildId]);

    const { data: financialData, isLoading: loadingFinancials } = useQuery({
        queryKey: ['parentFinancials', selectedChildId],
        queryFn: async () => {
            const res = await api.get(`/parent/financials/${selectedChildId}`);
            return res.data as FinancialData;
        },
        enabled: !!selectedChildId
    });

    const data = financialData || { pendingAmount: 0, totalPaid: 0, invoices: [], transactions: [] };
    const loading = loadingChildren || (!!selectedChildId && loadingFinancials);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID': return 'teal';
            case 'PENDING': return 'yellow';
            case 'OVERDUE': return 'red';
            case 'PARTIAL': return 'blue';
            default: return 'gray';
        }
    };

    return (
        <Stack gap="lg" pos="relative">
            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

            <Group justify="space-between" align="flex-start">
                <div>
                    <Title order={2}>Financial Overview</Title>
                    <Text c="dimmed">View pending fees, invoices, and payment history.</Text>
                </div>

                {children.length > 0 && (
                    <Select
                        leftSection={<IconUsers size={16} />}
                        placeholder="Select Child"
                        data={children.map(c => ({ value: c.id, label: `${c.firstName} ${c.lastName}` }))}
                        value={selectedChildId}
                        onChange={setSelectedChildId}
                        style={{ width: 250 }}
                    />
                )}
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <Card withBorder radius="md" p="md" bg="red.0">
                    <Group justify="space-between" mb="xs">
                        <Text tt="uppercase" fz="xs" c="red.9" fw={700}>Total Pending</Text>
                        <ThemeIcon variant="light" color="red" size="lg" radius="md">
                            <IconCreditCard size={20} />
                        </ThemeIcon>
                    </Group>
                    <Text size="3xl" fw={700} c="red.7">${data.pendingAmount.toFixed(2)}</Text>
                    <Text size="sm" c="red.9" mt="sm">Total outstanding balance across all invoices.</Text>
                </Card>

                <Card withBorder radius="md" p="md" bg="teal.0">
                    <Group justify="space-between" mb="xs">
                        <Text tt="uppercase" fz="xs" c="teal.9" fw={700}>Total Paid (YTD)</Text>
                        <ThemeIcon variant="light" color="teal" size="lg" radius="md">
                            <IconReceipt size={20} />
                        </ThemeIcon>
                    </Group>
                    <Text size="3xl" fw={700} c="teal.7">${data.totalPaid.toFixed(2)}</Text>
                    <Text size="sm" c="teal.9" mt="sm">Total payments successfully processed this year.</Text>
                </Card>
            </SimpleGrid>

            {/* Invoices */}
            <Card withBorder radius="md" p={0}>
                <div style={{ padding: 'var(--mantine-spacing-md)', borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
                    <Group justify="space-between">
                        <Title order={4}>Current Invoices</Title>
                        {data.pendingAmount > 0 && <Button size="xs" color="blue">Pay Pending</Button>}
                    </Group>
                </div>

                {data.invoices.length === 0 && !loading ? (
                    <Text p="xl" ta="center" c="dimmed" fs="italic">No invoices found for this student.</Text>
                ) : (
                    <Table verticalSpacing="md" striped>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Description</Table.Th>
                                <Table.Th>Amount</Table.Th>
                                <Table.Th>Due Date</Table.Th>
                                <Table.Th>Status</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {data.invoices.map((inv) => (
                                <Table.Tr key={inv.id}>
                                    <Table.Td fw={500}>{inv.title}</Table.Td>
                                    <Table.Td fw={700}>${inv.amount.toFixed(2)}</Table.Td>
                                    <Table.Td>{format(new Date(inv.dueDate), 'MMM dd, yyyy')}</Table.Td>
                                    <Table.Td>
                                        <Badge variant="light" color={getStatusColor(inv.status)}>{inv.status}</Badge>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                )}
            </Card>

            {/* Payment History */}
            <Card withBorder radius="md" p={0}>
                <div style={{ padding: 'var(--mantine-spacing-md)', borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
                    <Title order={4}>Recent Transactions</Title>
                </div>

                {data.transactions.length === 0 && !loading ? (
                    <Text p="xl" ta="center" c="dimmed" fs="italic">No transaction history.</Text>
                ) : (
                    <Table verticalSpacing="sm" striped>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Date</Table.Th>
                                <Table.Th>Method</Table.Th>
                                <Table.Th>Amount</Table.Th>
                                <Table.Th>Status</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {data.transactions.map((tx) => (
                                <Table.Tr key={tx.id}>
                                    <Table.Td>{format(new Date(tx.date), 'MMM dd, yyyy')}</Table.Td>
                                    <Table.Td>{tx.paymentMethod}</Table.Td>
                                    <Table.Td fw={700} c="teal.7">${tx.amount.toFixed(2)}</Table.Td>
                                    <Table.Td><Badge color="teal" variant="dot">{tx.status}</Badge></Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                )}
            </Card>

        </Stack>
    );
}

export default ParentFinancials;
