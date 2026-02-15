import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import AddTransactionModal from '../components/AddTransactionModal';
import {
    Box,
    Table,
    Badge,
    Button,
    Group,
    Text,
    TextInput,
    Select,
    NumberInput,
    Modal,
    Stack,
    Card,
    Title,
    Pagination,
    Grid,
    rem,
} from '@mantine/core';
import { Search, Filter, Download } from 'lucide-react';
import { useEffect } from 'react';
import { financeService } from '../services/financeService';
import { showErrorNotification, showSuccessNotification } from '../utils/notifications';


function getStatusColor(status: string) {
    switch (status) {
        case 'Paid':
            return 'green';
        case 'Overdue':
            return 'red';
        case 'Partial':
            return 'orange';
        default:
            return 'gray';
    }
}


export default function Finance() {
    const [paymentModalOpened, setPaymentModalOpened] = useState(false);
    const [addTransactionOpened, { open: openAddTransaction, close: closeAddTransaction }] = useDisclosure(false);
    const [selectedStudent, setSelectedStudent] = useState('Emma Davis (ID: 2023-045)');
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const data = await financeService.getAll();
            setTransactions(data || []);
        } catch (error: any) {
            showErrorNotification(error.message || 'Failed to fetch transactions');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'green';
            case 'pending':
                return 'orange';
            case 'failed':
                return 'red';
            default:
                return 'gray';
        }
    };

    return (
        <Box p="xl">
            <Title order={2} mb="lg">
                Fee Transaction Ledger
            </Title>

            <Group justify="space-between" mb="lg">
                <Group>
                    <TextInput
                        placeholder="Search invoices, students..."
                        leftSection={<Search size={16} />}
                        style={{ width: rem(300) }}
                        size="sm"
                        radius={2}
                    />
                </Group>
                <Group>
                    <Button
                        variant="outline"
                        leftSection={<Filter size={16} />}
                        size="sm"
                        radius={2}
                        color="gray"
                    >
                        Filter
                    </Button>
                    <Button
                        leftSection={<Download size={16} />}
                        size="sm"
                        radius={2}
                        color="navy.9"
                        onClick={openAddTransaction}
                    >
                        Add Transaction
                    </Button>
                </Group>
            </Group>

            <Grid gutter="md">
                <Grid.Col span={{ base: 12, lg: 8 }}>
                    <Card shadow="sm" padding="lg" radius={2} withBorder>
                        <Title order={4} mb="md">
                            Fee Transactions
                        </Title>
                        <Table highlightOnHover>
                            <Table.Thead>
                                <Table.Tr style={{ backgroundColor: '#f8f9fa' }}>
                                    <Table.Th>Invoice #</Table.Th>
                                    <Table.Th>Student Name</Table.Th>
                                    <Table.Th>Fee Type</Table.Th>
                                    <Table.Th>Date</Table.Th>
                                    <Table.Th>Amount</Table.Th>
                                    <Table.Th>Status</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {loading ? (
                                    <Table.Tr>
                                        <Table.Td colSpan={6} style={{ textAlign: 'center', padding: rem(40) }}>
                                            <Text c="dimmed">Loading transactions...</Text>
                                        </Table.Td>
                                    </Table.Tr>
                                ) : transactions.length === 0 ? (
                                    <Table.Tr>
                                        <Table.Td colSpan={6} style={{ textAlign: 'center', padding: rem(40) }}>
                                            <Text c="dimmed">No transactions found</Text>
                                        </Table.Td>
                                    </Table.Tr>
                                ) : (
                                    transactions.map((txn) => (
                                        <Table.Tr key={txn.id}>
                                            <Table.Td>
                                                <Text size="sm">{txn.reference_number || '-'}</Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm">
                                                    {txn.student?.first_name} {txn.student?.last_name}
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm">{txn.fee_type}</Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm">
                                                    {new Date(txn.payment_date).toLocaleDateString()}
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm" fw={500}>
                                                    ${txn.amount}
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Badge
                                                    color={getStatusColor(txn.status)}
                                                    variant="light"
                                                    size="sm"
                                                    radius={2}
                                                >
                                                    {txn.status}
                                                </Badge>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))
                                )}
                            </Table.Tbody>
                        </Table>

                        <Group justify="center" mt="md">
                            <Pagination total={10} size="sm" radius={2} />
                        </Group>
                    </Card>
                </Grid.Col>

                <Grid.Col span={{ base: 12, lg: 4 }}>
                    <Card shadow="sm" padding="lg" radius={2} withBorder>
                        <Title order={4} mb="md">
                            Receive Payment
                        </Title>
                        <Stack gap="md">
                            <TextInput
                                label="Student ID"
                                placeholder="Enter ID or Name"
                                size="sm"
                                radius={2}
                                leftSection={<Search size={16} />}
                            />

                            <Select
                                label="Payment Mode"
                                placeholder="Select mode"
                                data={['Cash', 'Bank Transfer', 'Cheque', 'Online']}
                                size="sm"
                                radius={2}
                            />

                            <NumberInput
                                label="Amount"
                                placeholder="0.00"
                                prefix="$ "
                                size="sm"
                                radius={2}
                            />

                            <TextInput
                                label="Reference #"
                                placeholder="Reference #"
                                size="sm"
                                radius={2}
                            />

                            <Button fullWidth size="sm" radius={2} color="navy.9">
                                Record Payment
                            </Button>

                            <Box mt="md" p="md" style={{ backgroundColor: '#f8f9fa', borderRadius: rem(4) }}>
                                <Text size="sm" c="dimmed" mb="xs">
                                    Selected Student: {selectedStudent}
                                </Text>
                                <Text size="sm" fw={500} mb="xs">
                                    Total Outstanding Debt
                                </Text>
                                <Title order={3} c="red">
                                    $300.00
                                </Title>
                                <Text
                                    size="xs"
                                    c="blue"
                                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                    mt="xs"
                                >
                                    View Student's Full Financial History
                                </Text>
                            </Box>
                        </Stack>
                    </Card>
                </Grid.Col>
            </Grid>

            <AddTransactionModal
                opened={addTransactionOpened}
                onClose={closeAddTransaction}
                onSuccess={fetchTransactions}
            />
        </Box>
    );
}
