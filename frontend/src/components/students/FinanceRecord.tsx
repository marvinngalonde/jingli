import { Paper, Title, Center, Text, Stack, ThemeIcon, Table, Badge, Button, Group, LoadingOverlay, Drawer, NumberInput, Select, TextInput, Box, Tabs, ActionIcon, Modal } from '@mantine/core';
import { IconCurrencyDollar, IconReceipt, IconEye, IconCreditCard, IconHistory, IconPrinter } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { financeService } from '../../services/financeService';
import type { Invoice, Transaction } from '../../types/finance';
import { notifications } from '@mantine/notifications';

interface FinanceRecordProps {
    studentId: string;
}

export function FinanceRecord({ studentId }: FinanceRecordProps) {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(false);

    // Payment Drawer State
    const [payOpened, { open: openPay, close: closePay }] = useDisclosure(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [payLoading, setPayLoading] = useState(false);

    // Receipt Modal State
    const [receiptOpened, { open: openReceipt, close: closeReceipt }] = useDisclosure(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    useEffect(() => {
        if (studentId) {
            loadInvoices();
        }
    }, [studentId]);

    const loadInvoices = async () => {
        setLoading(true);
        try {
            const result = await financeService.getInvoices('', studentId);
            setInvoices(result);
        } catch (error) {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to load invoices', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    const getTotalDue = () => {
        return invoices
            .filter(inv => inv.status !== 'PAID')
            .reduce((sum, inv) => sum + Number(inv.amount), 0);
    };

    const payForm = useForm({
        initialValues: {
            amount: 0,
            method: 'CASH',
            referenceNo: ''
        },
        validate: {
            amount: (value) => (value <= 0 ? 'Amount must be greater than 0' : null),
            method: (value) => (!value ? 'Payment method is required' : null),
        }
    });

    const handleOpenPay = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        // Calculate remaining amount
        const paidAmount = invoice.transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
        const remaining = Number(invoice.amount) - paidAmount;

        payForm.setValues({
            amount: remaining > 0 ? remaining : 0,
            method: 'CASH',
            referenceNo: ''
        });
        openPay();
    };

    const handlePaySubmit = async (values: typeof payForm.values) => {
        if (!selectedInvoice) return;
        setPayLoading(true);
        try {
            await financeService.collectPayment({
                invoiceId: selectedInvoice.id,
                amount: values.amount,
                method: values.method,
                referenceNo: values.referenceNo
            });
            notifications.show({ title: 'Success', message: 'Payment recorded', color: 'green' });
            closePay();
            await loadInvoices();
        } catch (error) {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to record payment', color: 'red' });
        } finally {
            setPayLoading(false);
        }
    };

    const handleViewReceipt = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        openReceipt();
    };

    // Flatten transactions for history view
    const allTransactions = invoices
        .flatMap(inv => (inv.transactions || []).map(t => ({ ...t, invoice: inv })))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // if (loading && invoices.length === 0) return <LoadingOverlay visible={true} />;

    return (
        <Stack pos="relative">
            <LoadingOverlay visible={loading} overlayProps={{ blur: 1 }} />

            {/* Summary Cards */}
            <Group grow>
                <Paper withBorder p="md" radius="md">
                    <Group justify="space-between">
                        <div>
                            <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Total Due</Text>
                            <Text fw={700} size="xl" c="red">${getTotalDue().toLocaleString()}</Text>
                        </div>
                        <ThemeIcon color="red" variant="light" size={38} radius="md">
                            <IconCurrencyDollar size={24} />
                        </ThemeIcon>
                    </Group>
                </Paper>
                <Paper withBorder p="md" radius="md">
                    <Group justify="space-between">
                        <div>
                            <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Total Invoices</Text>
                            <Text fw={700} size="xl">{invoices.length}</Text>
                        </div>
                        <ThemeIcon color="blue" variant="light" size={38} radius="md">
                            <IconReceipt size={24} />
                        </ThemeIcon>
                    </Group>
                </Paper>
            </Group>

            <Paper withBorder radius="md">
                <Tabs defaultValue="invoices">
                    <Tabs.List>
                        <Tabs.Tab value="invoices" leftSection={<IconReceipt size={14} />}>Invoices</Tabs.Tab>
                        <Tabs.Tab value="history" leftSection={<IconHistory size={14} />}>Payment History</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="invoices" p="md">
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Invoice #</Table.Th>
                                    <Table.Th>Date</Table.Th>
                                    <Table.Th>Due Date</Table.Th>
                                    <Table.Th>Amount</Table.Th>
                                    <Table.Th>Paid</Table.Th>
                                    <Table.Th>Status</Table.Th>
                                    <Table.Th>Action</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {invoices.length === 0 ? (
                                    <Table.Tr>
                                        <Table.Td colSpan={7} align="center">
                                            <Text c="dimmed" py="md">No invoices found.</Text>
                                        </Table.Td>
                                    </Table.Tr>
                                ) : (
                                    invoices.map((inv) => {
                                        const paidAmount = inv.transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
                                        return (
                                            <Table.Tr key={inv.id}>
                                                <Table.Td>{inv.id.substring(0, 8)}</Table.Td>
                                                <Table.Td>{new Date(inv.createdAt).toLocaleDateString()}</Table.Td>
                                                <Table.Td>{new Date(inv.dueDate).toLocaleDateString()}</Table.Td>
                                                <Table.Td>${Number(inv.amount).toLocaleString()}</Table.Td>
                                                <Table.Td>${paidAmount.toLocaleString()}</Table.Td>
                                                <Table.Td>
                                                    <Badge color={inv.status === 'PAID' ? 'green' : inv.status === 'OVERDUE' ? 'red' : 'yellow'}>
                                                        {inv.status}
                                                    </Badge>
                                                </Table.Td>
                                                <Table.Td>
                                                    {inv.status !== 'PAID' && (
                                                        <Button variant="light" size="xs" leftSection={<IconCreditCard size={14} />} onClick={() => handleOpenPay(inv)}>
                                                            Pay
                                                        </Button>
                                                    )}
                                                </Table.Td>
                                            </Table.Tr>
                                        );
                                    })
                                )}
                            </Table.Tbody>
                        </Table>
                    </Tabs.Panel>

                    <Tabs.Panel value="history" p="md">
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Date</Table.Th>
                                    <Table.Th>Invoice #</Table.Th>
                                    <Table.Th>Amount</Table.Th>
                                    <Table.Th>Method</Table.Th>
                                    <Table.Th>Reference</Table.Th>
                                    <Table.Th>Action</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {allTransactions.length === 0 ? (
                                    <Table.Tr>
                                        <Table.Td colSpan={6} align="center">
                                            <Text c="dimmed" py="md">No payments recorded yet.</Text>
                                        </Table.Td>
                                    </Table.Tr>
                                ) : (
                                    allTransactions.map((t) => (
                                        <Table.Tr key={t.id}>
                                            <Table.Td>{new Date(t.date).toLocaleDateString()}</Table.Td>
                                            <Table.Td>{t.invoice.id.substring(0, 8)}</Table.Td>
                                            <Table.Td fw={500}>${Number(t.amount).toLocaleString()}</Table.Td>
                                            <Table.Td>
                                                <Badge variant="outline" color="gray">{t.method}</Badge>
                                            </Table.Td>
                                            <Table.Td>{t.referenceNo || '-'}</Table.Td>
                                            <Table.Td>
                                                <ActionIcon variant="subtle" color="blue" onClick={() => handleViewReceipt(t)}>
                                                    <IconReceipt size={16} />
                                                </ActionIcon>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))
                                )}
                            </Table.Tbody>
                        </Table>
                    </Tabs.Panel>
                </Tabs>
            </Paper>

            {/* Payment Drawer */}
            <Drawer
                opened={payOpened}
                onClose={closePay}
                title={`Collect Payment #${selectedInvoice?.id.substring(0, 8)}`}
                position="right"
                padding="md"
            >
                <form onSubmit={payForm.onSubmit(handlePaySubmit)}>
                    <Stack>
                        <Paper withBorder p="sm" bg="gray.0">
                            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Invoice Amount</Text>
                            <Text size="lg" fw={700}>${selectedInvoice ? Number(selectedInvoice.amount).toLocaleString() : 0}</Text>
                        </Paper>

                        <NumberInput
                            label="Amount Received"
                            prefix="$"
                            placeholder="Enter amount"
                            min={0}
                            {...payForm.getInputProps('amount')}
                        />
                        <Select
                            label="Payment Method"
                            data={['CASH', 'BANK_TRANSFER', 'CHEQUE', 'ONLINE']}
                            {...payForm.getInputProps('method')}
                        />
                        <TextInput
                            label="Reference No. (Optional)"
                            placeholder="Check No, Transaction ID, etc."
                            {...payForm.getInputProps('referenceNo')}
                        />
                        <Button type="submit" loading={payLoading} fullWidth mt="md">Record Payment</Button>
                    </Stack>
                </form>
            </Drawer>

            {/* Receipt Modal */}
            <Modal opened={receiptOpened} onClose={closeReceipt} title="Payment Receipt" centered>
                {selectedTransaction && (
                    <Stack gap="md">
                        <Center>
                            <ThemeIcon size={60} radius={60} color="green" variant="light">
                                <IconReceipt size={32} />
                            </ThemeIcon>
                        </Center>
                        <Text ta="center" size="lg" fw={700}>Payment Successful</Text>
                        <Text ta="center" c="dimmed" size="sm">
                            Receipt #{selectedTransaction.id.substring(0, 8)}
                        </Text>

                        <Paper withBorder p="md" radius="md" mt="sm">
                            <Stack gap="xs">
                                <Group justify="space-between">
                                    <Text size="sm" c="dimmed">Date</Text>
                                    <Text size="sm" fw={500}>{new Date(selectedTransaction.date).toLocaleString()}</Text>
                                </Group>
                                <Group justify="space-between">
                                    <Text size="sm" c="dimmed">Payment Method</Text>
                                    <Text size="sm" fw={500}>{selectedTransaction.method}</Text>
                                </Group>
                                <Group justify="space-between">
                                    <Text size="sm" c="dimmed">Reference</Text>
                                    <Text size="sm" fw={500}>{selectedTransaction.referenceNo || 'N/A'}</Text>
                                </Group>
                                <Group justify="space-between" mt="sm">
                                    <Text size="lg" fw={700}>Amount Paid</Text>
                                    <Text size="lg" fw={700} c="green">${Number(selectedTransaction.amount).toLocaleString()}</Text>
                                </Group>
                            </Stack>
                        </Paper>

                        <Button fullWidth leftSection={<IconPrinter size={16} />} onClick={() => window.print()}>
                            Print Receipt
                        </Button>
                    </Stack>
                )}
            </Modal>
        </Stack>
    );
}
