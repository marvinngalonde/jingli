import { useState } from 'react';
import { Title, Paper, TextInput, Button, Group, Table, Badge, Text, Modal, NumberInput, Select, Stack, ActionIcon, Tooltip, Box, Divider } from '@mantine/core';
import { IconSearch, IconCash, IconPlus, IconReceipt } from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentService } from '../../services/studentService';
import { financeService } from '../../services/financeService';
import { notifications } from '@mantine/notifications';

export default function FeeCollection() {
    const [search, setSearch] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [paymentModalOpened, setPaymentModalOpened] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [amount, setAmount] = useState<number | string>(0);
    const [method, setMethod] = useState<string>('CASH');

    const queryClient = useQueryClient();

    const { data: students, isLoading: studentsLoading } = useQuery({
        queryKey: ['students-search', search],
        queryFn: () => studentService.getAll(), // Ideally we'd have a search endpoint
        enabled: search.length > 2
    });

    const { data: invoices, isLoading: invoicesLoading } = useQuery({
        queryKey: ['student-invoices', selectedStudent?.id],
        queryFn: () => financeService.getInvoices('', selectedStudent?.id),
        enabled: !!selectedStudent
    });

    const collectPaymentMutation = useMutation({
        mutationFn: (data: any) => financeService.collectPayment({
            invoiceId: data.invoiceId,
            amount: data.amount,
            method: data.method
        }),
        onSuccess: () => {
            notifications.show({ title: 'Success', message: 'Payment recorded successfully', color: 'green' });
            queryClient.invalidateQueries({ queryKey: ['student-invoices', selectedStudent?.id] });
            setPaymentModalOpened(false);
            setSelectedInvoice(null);
            setAmount(0);
        },
        onError: (error: any) => {
            notifications.show({ title: 'Error', message: error.message || 'Failed to record payment', color: 'red' });
        }
    });

    const filteredStudents = students?.filter(s =>
        (s.firstName + ' ' + s.lastName).toLowerCase().includes(search.toLowerCase()) ||
        s.admissionNo?.toLowerCase().includes(search.toLowerCase())
    ) || [];

    const handleOpenPayment = (invoice: any) => {
        setSelectedInvoice(invoice);
        setAmount(invoice.balance);
        setPaymentModalOpened(true);
    };

    const handleRecordPayment = () => {
        if (!selectedInvoice || !amount || Number(amount) <= 0) return;
        collectPaymentMutation.mutate({
            invoiceId: selectedInvoice.id,
            amount: Number(amount),
            method: method
        });
    };

    return (
        <div>
            <Title order={2} mb="lg">Fee Collection</Title>

            <Paper p="md" withBorder radius="md">
                <Group align="flex-end" mb="xl">
                    <TextInput
                        label="Search Student"
                        placeholder="Name or Admission No."
                        value={search}
                        onChange={(e) => setSearch(e.currentTarget.value)}
                        leftSection={<IconSearch size={16} />}
                        style={{ flex: 1 }}
                    />
                </Group>

                {search.length > 0 && search.length <= 2 && (
                    <Text size="sm" c="dimmed">Please enter at least 3 characters to search...</Text>
                )}

                {filteredStudents.length > 0 && !selectedStudent && (
                    <Table verticalSpacing="sm">
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Admission No</Table.Th>
                                <Table.Th>Name</Table.Th>
                                <Table.Th>Class</Table.Th>
                                <Table.Th>Action</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {filteredStudents.map((s) => (
                                <Table.Tr key={s.id}>
                                    <Table.Td>{s.admissionNo}</Table.Td>
                                    <Table.Td>{s.firstName} {s.lastName}</Table.Td>
                                    <Table.Td>
                                        {s.section ? `${s.section.classLevel?.name} ${s.section.classLevel?.level || ''} - ${s.section.name}`.trim() : 'Unassigned'}
                                    </Table.Td>
                                    <Table.Td>
                                        <Button size="xs" onClick={() => setSelectedStudent(s)}>Select</Button>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                )}

                {selectedStudent && (
                    <Stack>
                        <Group justify="space-between" align="center">
                            <Box>
                                <Text fw={700} size="lg">{selectedStudent.firstName} {selectedStudent.lastName}</Text>
                                <Text size="sm" c="dimmed">
                                    {selectedStudent.admissionNo} | {selectedStudent.section ? `${selectedStudent.section.classLevel?.name} ${selectedStudent.section.classLevel?.level || ''} - ${selectedStudent.section.name}`.trim() : 'Unassigned'}
                                </Text>
                            </Box>
                            <Button variant="subtle" size="xs" onClick={() => setSelectedStudent(null)}>Change Student</Button>
                        </Group>

                        <Divider my="sm" />

                        <Title order={4}>Student Invoices</Title>
                        {invoicesLoading ? (
                            <Text>Loading invoices...</Text>
                        ) : invoices?.length === 0 ? (
                            <Text c="dimmed">No pending invoices found for this student. A Bursar must generate an invoice before fees can be collected.</Text>
                        ) : (
                            <Table verticalSpacing="md" withTableBorder withColumnBorders>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Invoice No</Table.Th>
                                        <Table.Th>Total</Table.Th>
                                        <Table.Th>Paid</Table.Th>
                                        <Table.Th>Balance</Table.Th>
                                        <Table.Th>Status</Table.Th>
                                        <Table.Th>Action</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {invoices?.map((inv: any) => {
                                        const totalAmount = Number(inv.amount || 0);
                                        const paidAmount = inv.transactions?.reduce((sum: number, t: any) => sum + Number(t.amount), 0) || 0;
                                        const balance = totalAmount - paidAmount;

                                        return (
                                            <Table.Tr key={inv.id}>
                                                <Table.Td>{inv.invoiceNo || 'N/A'}</Table.Td>
                                                <Table.Td>${totalAmount.toLocaleString()}</Table.Td>
                                                <Table.Td>${paidAmount.toLocaleString()}</Table.Td>
                                                <Table.Td>
                                                    <Text fw={700} color={balance > 0 ? "red" : "green"}>
                                                        ${balance.toLocaleString()}
                                                    </Text>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Badge color={inv.status === 'PAID' ? 'green' : inv.status === 'PARTIAL' ? 'orange' : 'red'}>
                                                        {inv.status}
                                                    </Badge>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Group gap="xs">
                                                        {balance > 0 && (
                                                            <Button size="xs" color="teal" leftSection={<IconCash size={14} />} onClick={() => handleOpenPayment({ ...inv, balance })}>
                                                                Record Payment
                                                            </Button>
                                                        )}
                                                        <Tooltip label="View Details">
                                                            <ActionIcon variant="subtle" color="gray">
                                                                <IconReceipt size={16} />
                                                            </ActionIcon>
                                                        </Tooltip>
                                                    </Group>
                                                </Table.Td>
                                            </Table.Tr>
                                        );
                                    })}
                                </Table.Tbody>
                            </Table>
                        )}
                    </Stack>
                )}
            </Paper>

            <Modal
                opened={paymentModalOpened}
                onClose={() => setPaymentModalOpened(false)}
                title="Record Payment"
                size="md"
            >
                {selectedInvoice && (
                    <Stack>
                        <Box>
                            <Text size="sm" fw={500}>Invoice: {selectedInvoice.invoiceNo}</Text>
                            <Text size="sm" c="dimmed">Student: {selectedStudent?.firstName} {selectedStudent?.lastName}</Text>
                            <Text size="sm" c="dimmed">
                                Class: {selectedStudent?.section ? `${selectedStudent.section.classLevel?.name} ${selectedStudent.section.classLevel?.level || ''} - ${selectedStudent.section.name}`.trim() : 'Unassigned'}
                            </Text>
                            <Text size="sm" fw={700} mt="xs">Outstanding: ${selectedInvoice.balance.toLocaleString()}</Text>
                        </Box>

                        <NumberInput
                            label="Amount to Pay"
                            placeholder="Enter amount"
                            value={amount}
                            onChange={(val) => setAmount(val)}
                            min={0.01}
                            max={selectedInvoice.balance}
                            required
                        />

                        <Select
                            label="Payment Method"
                            data={[
                                { value: 'CASH', label: 'Cash' },
                                { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
                                { value: 'MOBILE_MONEY', label: 'Mobile Money' },
                                { value: 'CHEQUE', label: 'Cheque' }
                            ]}
                            value={method}
                            onChange={(val) => setMethod(val || 'CASH')}
                        />

                        <Button
                            fullWidth
                            mt="md"
                            color="teal"
                            onClick={handleRecordPayment}
                            loading={collectPaymentMutation.isPending}
                        >
                            Confirm Payment
                        </Button>
                    </Stack>
                )}
            </Modal>
        </div>
    );
}
