import { Title, Text, Stack, Card, Loader, Center, Badge, Group, Paper, Table, ThemeIcon, SimpleGrid, Progress, Accordion, Avatar } from '@mantine/core';
import { IconCurrencyDollar, IconFileInvoice, IconAlertCircle, IconCheck, IconUser } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../services/api';
import { notifications } from '@mantine/notifications';
import { format } from 'date-fns';

interface ChildInvoice {
    id: string;
    invoiceNo: string;
    totalAmount: number;
    paidAmount: number;
    status: string;
    dueDate: string;
    feeStructure?: { name: string };
}

interface ChildData {
    id: string;
    firstName: string;
    lastName: string;
    admissionNo: string;
    invoices: ChildInvoice[];
}

export default function ParentFees() {
    const { user } = useAuth();
    const [children, setChildren] = useState<ChildData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadChildrenFees();
    }, [user]);

    const loadChildrenFees = async () => {
        try {
            setLoading(true);
            const parentId = user?.profile?.id;
            if (parentId) {
                const res = await api.get(`/parent/children/finances`);
                setChildren(res.data);
            }
        } catch (error) {
            console.error('Failed to load children fees', error);
            notifications.show({ title: 'Error', message: 'Failed to load fee information', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    const grandTotalDue = children.reduce((sum, child) =>
        sum + child.invoices.reduce((s, i) => s + (i.totalAmount - i.paidAmount), 0), 0
    );
    const grandTotalPaid = children.reduce((sum, child) =>
        sum + child.invoices.reduce((s, i) => s + i.paidAmount, 0), 0
    );
    const grandTotal = children.reduce((sum, child) =>
        sum + child.invoices.reduce((s, i) => s + i.totalAmount, 0), 0
    );
    const overallProgress = grandTotal > 0 ? (grandTotalPaid / grandTotal) * 100 : 0;

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
                    <Title order={2}>Children's Fees</Title>
                </Group>
                <Text c="dimmed" ml={48}>Overview of fee invoices for all your children</Text>
            </div>

            {/* Summary Cards */}
            <SimpleGrid cols={{ base: 1, sm: 3 }}>
                <Paper withBorder radius="md" p="lg" bg="var(--app-surface)">
                    <Text size="xs" tt="uppercase" fw={700} c="dimmed">Total Fees</Text>
                    <Text size="xl" fw={700} mt={4}>${grandTotal.toLocaleString()}</Text>
                </Paper>
                <Paper withBorder radius="md" p="lg" bg="var(--app-surface)">
                    <Text size="xs" tt="uppercase" fw={700} c="dimmed">Amount Paid</Text>
                    <Text size="xl" fw={700} mt={4} c="green">${grandTotalPaid.toLocaleString()}</Text>
                </Paper>
                <Paper withBorder radius="md" p="lg" bg="var(--app-surface)">
                    <Text size="xs" tt="uppercase" fw={700} c="dimmed">Balance Due</Text>
                    <Text size="xl" fw={700} mt={4} c={grandTotalDue > 0 ? 'red' : 'green'}>${grandTotalDue.toLocaleString()}</Text>
                </Paper>
            </SimpleGrid>

            {/* Payment Progress */}
            <Paper withBorder radius="md" p="lg" bg="var(--app-surface)">
                <Group justify="space-between" mb="xs">
                    <Text size="sm" fw={500}>Overall Payment Progress</Text>
                    <Text size="sm" c="dimmed">{overallProgress.toFixed(0)}%</Text>
                </Group>
                <Progress value={overallProgress} color={overallProgress >= 100 ? 'green' : 'blue'} size="lg" radius="xl" />
            </Paper>

            {/* Per-Child Invoices */}
            {children.length === 0 ? (
                <Card withBorder radius="md" p="xl" ta="center" bg="var(--app-surface)">
                    <ThemeIcon variant="light" color="gray" size={60} radius="xl" mx="auto" mb="md">
                        <IconFileInvoice size={30} />
                    </ThemeIcon>
                    <Text size="lg" fw={500}>No Fee Records</Text>
                    <Text c="dimmed" mt="xs">No fee invoices found for your children.</Text>
                </Card>
            ) : (
                <Accordion variant="separated" radius="md">
                    {children.map((child) => {
                        const childDue = child.invoices.reduce((s, i) => s + (i.totalAmount - i.paidAmount), 0);
                        return (
                            <Accordion.Item key={child.id} value={child.id}>
                                <Accordion.Control>
                                    <Group>
                                        <Avatar color="brand" radius="xl">{child.firstName[0]}{child.lastName[0]}</Avatar>
                                        <div>
                                            <Text fw={600}>{child.firstName} {child.lastName}</Text>
                                            <Text size="xs" c="dimmed">Adm: {child.admissionNo}</Text>
                                        </div>
                                        <Badge
                                            ml="auto"
                                            color={childDue > 0 ? 'red' : 'green'}
                                            variant="light"
                                        >
                                            {childDue > 0 ? `$${childDue.toLocaleString()} due` : 'Paid'}
                                        </Badge>
                                    </Group>
                                </Accordion.Control>
                                <Accordion.Panel>
                                    {child.invoices.length === 0 ? (
                                        <Text c="dimmed" ta="center" py="md">No invoices</Text>
                                    ) : (
                                        <Table striped highlightOnHover>
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
                                                {child.invoices.map((inv) => (
                                                    <Table.Tr key={inv.id}>
                                                        <Table.Td fw={500}>{inv.invoiceNo}</Table.Td>
                                                        <Table.Td>{inv.feeStructure?.name || 'N/A'}</Table.Td>
                                                        <Table.Td>${inv.totalAmount.toLocaleString()}</Table.Td>
                                                        <Table.Td c="green">${inv.paidAmount.toLocaleString()}</Table.Td>
                                                        <Table.Td c={inv.totalAmount - inv.paidAmount > 0 ? 'red' : 'green'}>
                                                            ${(inv.totalAmount - inv.paidAmount).toLocaleString()}
                                                        </Table.Td>
                                                        <Table.Td>{format(new Date(inv.dueDate), 'dd MMM yyyy')}</Table.Td>
                                                        <Table.Td>
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
                                    )}
                                </Accordion.Panel>
                            </Accordion.Item>
                        );
                    })}
                </Accordion>
            )}
        </Stack>
    );
}
