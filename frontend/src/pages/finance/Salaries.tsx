import { Title, Paper, Text, Group, Button, Card, ThemeIcon, Grid, Stack, Table, Badge, Drawer, TextInput, NumberInput, Select, ActionIcon, LoadingOverlay, Modal, Tabs, ScrollArea } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconWallet, IconPlus, IconTrash, IconEdit, IconSearch, IconCheck, IconPlayerPlay, IconCash } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StaffPicker } from '../../components/common/StaffPicker';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function Salaries() {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [stats, setStats] = useState({ totalPayroll: 0, thisMonth: 0, pendingDisbursal: 0, staffCount: 0 });
    const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
    const [payrollModal, setPayrollModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ opened: boolean; id: string; name: string }>({ opened: false, id: '', name: '' });
    const [payModal, setPayModal] = useState<{ opened: boolean; id: string; name: string }>({ opened: false, id: '', name: '' });
    const [filterMonth, setFilterMonth] = useState<string | null>(null);
    const [filterYear, setFilterYear] = useState<string | null>(String(new Date().getFullYear()));
    const [search, setSearch] = useState('');

    const form = useForm({
        initialValues: { staffId: '', amount: 0, baseSalary: 0, allowances: 0, deductions: 0, month: new Date().getMonth() + 1, year: new Date().getFullYear(), method: 'BANK_TRANSFER', currency: 'USD', notes: '' },
        validate: {
            staffId: (v) => (!v ? 'Staff member required' : null),
            amount: (v) => (v <= 0 ? 'Amount must be > 0' : null),
        },
    });

    const payrollForm = useForm({
        initialValues: { month: new Date().getMonth() + 1, year: new Date().getFullYear(), currency: 'USD' },
    });

    const payRefForm = useForm({ initialValues: { referenceNo: '' } });

    const fetchData = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (filterMonth) params.month = filterMonth;
            if (filterYear) params.year = filterYear;

            const [recordsRes, statsRes] = await Promise.allSettled([
                api.get('/salaries', { params }),
                api.get('/salaries/stats'),
            ]);
            if (recordsRes.status === 'fulfilled') setRecords(recordsRes.value.data || []);
            if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [filterMonth, filterYear]);

    const openEdit = (item?: any) => {
        setEditingId(item?.id || null);
        if (item) {
            form.setValues({
                staffId: item.staffId || '',
                amount: item.amount || 0,
                month: item.month || new Date().getMonth() + 1,
                year: item.year || new Date().getFullYear(),
                method: item.method || 'BANK_TRANSFER',
                currency: item.currency || 'USD',
                baseSalary: item.baseSalary || 0,
                allowances: item.allowances || 0,
                deductions: item.deductions || 0,
                notes: item.notes || '',
            });
        } else {
            form.reset();
        }
        openDrawer();
    };

    const handleSave = async (values: typeof form.values) => {
        setSubmitting(true);
        try {
            if (editingId) {
                await api.patch(`/salaries/${editingId}`, {
                    amount: values.amount,
                    baseSalary: values.baseSalary,
                    allowances: values.allowances,
                    deductions: values.deductions,
                    method: values.method,
                    notes: values.notes
                });
                notifications.show({ id: 'sal-update', title: 'Updated', message: 'Salary record updated', color: 'green' });
            } else {
                await api.post('/salaries', values);
                notifications.show({ id: 'sal-create', title: 'Created', message: 'Salary record created', color: 'green' });
            }
            closeDrawer(); form.reset(); setEditingId(null); fetchData();
        } catch (err: any) {
            notifications.show({ id: 'sal-err', title: 'Error', message: err.response?.data?.message || 'Failed', color: 'red' });
        } finally { setSubmitting(false); }
    };

    const handleRunPayroll = async (values: typeof payrollForm.values) => {
        setSubmitting(true);
        try {
            const res = await api.post('/salaries/run-payroll', values);
            notifications.show({ id: 'payroll-run', title: 'Payroll Generated', message: res.data.message || `Created ${res.data.count} entries`, color: 'green' });
            setPayrollModal(false); payrollForm.reset(); fetchData();
        } catch (err: any) {
            notifications.show({ id: 'payroll-err', title: 'Error', message: err.response?.data?.message || 'Failed to run payroll', color: 'red' });
        } finally { setSubmitting(false); }
    };

    const handleMarkAsPaid = async () => {
        setSubmitting(true);
        try {
            await api.patch(`/salaries/${payModal.id}/pay`, { referenceNo: payRefForm.values.referenceNo });
            notifications.show({ id: 'sal-paid', title: 'Paid', message: `${payModal.name} marked as paid`, color: 'green' });
            setPayModal({ opened: false, id: '', name: '' }); payRefForm.reset(); fetchData();
        } catch (err: any) {
            notifications.show({ id: 'sal-pay-err', title: 'Error', message: err.response?.data?.message || 'Failed', color: 'red' });
        } finally { setSubmitting(false); }
    };

    const confirmDelete = (id: string, name: string) => setDeleteModal({ opened: true, id, name });
    const handleDelete = async () => {
        try {
            await api.delete(`/salaries/${deleteModal.id}`);
            notifications.show({ id: 'sal-del', title: 'Deleted', message: 'Record removed', color: 'green' });
            fetchData();
        } catch (err: any) {
            notifications.show({ id: 'sal-del-err', title: 'Error', message: err.response?.data?.message || 'Failed', color: 'red' });
        } finally { setDeleteModal({ opened: false, id: '', name: '' }); }
    };

    const filtered = records.filter(r => {
        const staffName = `${r.staff?.firstName || ''} ${r.staff?.lastName || ''}`.toLowerCase();
        return staffName.includes(search.toLowerCase()) || r.staff?.employeeId?.toLowerCase().includes(search.toLowerCase());
    });

    const statusColor = (s: string) => s === 'PAID' ? 'green' : s === 'PENDING' ? 'orange' : 'gray';

    return (
        <div>
            <Group justify="space-between" mb="lg">
                <Title order={2}>Salaries & Payroll</Title>
                <Group>
                    <Button variant="light" color="violet" leftSection={<IconPlayerPlay size={16} />} onClick={() => setPayrollModal(true)}>Run Payroll</Button>
                    <Button leftSection={<IconPlus size={16} />} onClick={() => openEdit()}>Add Record</Button>
                </Group>
            </Group>

            <Grid mb="lg">
                <Grid.Col span={{ base: 6, md: 3 }}>
                    <Card shadow="sm" radius="md" p="md" withBorder>
                        <Group justify="space-between" mb="xs"><Text fw={500} c="dimmed" size="sm">Total Payroll</Text><ThemeIcon variant="light" color="blue"><IconWallet size={16} /></ThemeIcon></Group>
                        <Text fw={700} size="xl">${stats.totalPayroll.toLocaleString()}</Text>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 6, md: 3 }}>
                    <Card shadow="sm" radius="md" p="md" withBorder>
                        <Group justify="space-between" mb="xs"><Text fw={500} c="dimmed" size="sm">This Month</Text><ThemeIcon variant="light" color="green"><IconCash size={16} /></ThemeIcon></Group>
                        <Text fw={700} size="xl">${stats.thisMonth.toLocaleString()}</Text>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 6, md: 3 }}>
                    <Card shadow="sm" radius="md" p="md" withBorder>
                        <Group justify="space-between" mb="xs"><Text fw={500} c="dimmed" size="sm">Pending</Text><ThemeIcon variant="light" color="orange"><IconWallet size={16} /></ThemeIcon></Group>
                        <Text fw={700} size="xl">${stats.pendingDisbursal.toLocaleString()}</Text>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 6, md: 3 }}>
                    <Card shadow="sm" radius="md" p="md" withBorder>
                        <Group justify="space-between" mb="xs"><Text fw={500} c="dimmed" size="sm">Staff Count</Text><ThemeIcon variant="light" color="grape"><IconWallet size={16} /></ThemeIcon></Group>
                        <Text fw={700} size="xl">{stats.staffCount}</Text>
                    </Card>
                </Grid.Col>
            </Grid>

            <Paper p="lg" radius="md" shadow="sm" withBorder pos="relative">
                <LoadingOverlay visible={loading} />
                <Group justify="space-between" mb="md">
                    <Group>
                        <TextInput placeholder="Search staff..." leftSection={<IconSearch size={16} />} value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 250 }} />
                        <Select placeholder="Month" data={MONTHS.map((m, i) => ({ value: String(i + 1), label: m }))} value={filterMonth} onChange={setFilterMonth} clearable style={{ width: 140 }} />
                        <Select placeholder="Year" data={['2024', '2025', '2026'].map(y => ({ value: y, label: y }))} value={filterYear} onChange={setFilterYear} clearable style={{ width: 100 }} />
                    </Group>
                </Group>

                {filtered.length === 0 ? (
                    <Text ta="center" c="dimmed" py="xl">No salary records found. Use "Run Payroll" to generate entries for all staff.</Text>
                ) : (
                    <ScrollArea>
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Staff</Table.Th>
                                    <Table.Th>Emp. ID</Table.Th>
                                    <Table.Th>Department</Table.Th>
                                    <Table.Th>Period</Table.Th>
                                    <Table.Th>Base</Table.Th>
                                    <Table.Th>Allowances</Table.Th>
                                    <Table.Th>Deductions</Table.Th>
                                    <Table.Th>Net Amount</Table.Th>
                                    <Table.Th>Status</Table.Th>
                                    <Table.Th>Actions</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {filtered.map(r => (
                                    <Table.Tr key={r.id}>
                                        <Table.Td fw={500}>{r.staff?.firstName} {r.staff?.lastName}</Table.Td>
                                        <Table.Td><Text size="sm" c="dimmed">{r.staff?.employeeId || '—'}</Text></Table.Td>
                                        <Table.Td>{r.staff?.department || '—'}</Table.Td>
                                        <Table.Td>{MONTHS[(r.month || 1) - 1]?.slice(0, 3)} {r.year}</Table.Td>
                                        <Table.Td>${Number(r.baseSalary || 0).toLocaleString()}</Table.Td>
                                        <Table.Td c="green">+${Number(r.allowances || 0).toLocaleString()}</Table.Td>
                                        <Table.Td c="red">-${Number(r.deductions || 0).toLocaleString()}</Table.Td>
                                        <Table.Td fw={600}>${Number(r.amount || 0).toLocaleString()}</Table.Td>
                                        <Table.Td><Badge color={statusColor(r.status)} variant="light">{r.status}</Badge></Table.Td>
                                        <Table.Td>
                                            <Group gap="xs">
                                                {r.status === 'PENDING' && (
                                                    <ActionIcon color="green" variant="subtle" title="Mark as Paid" onClick={() => setPayModal({ opened: true, id: r.id, name: `${r.staff?.firstName} ${r.staff?.lastName}` })}>
                                                        <IconCheck size={16} />
                                                    </ActionIcon>
                                                )}
                                                <ActionIcon color="blue" variant="subtle" onClick={() => openEdit(r)}><IconEdit size={16} /></ActionIcon>
                                                <ActionIcon color="red" variant="subtle" onClick={() => confirmDelete(r.id, `${r.staff?.firstName} ${r.staff?.lastName}`)}><IconTrash size={16} /></ActionIcon>
                                            </Group>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    </ScrollArea>
                )}
            </Paper>

            {/* Create/Edit Drawer */}
            <Drawer opened={drawerOpened} onClose={closeDrawer} title={editingId ? 'Edit Salary Record' : 'Add Salary Record'} position="right" size="md">
                <form onSubmit={form.onSubmit(handleSave)}>
                    <Stack>
                        {!editingId && <StaffPicker value={form.values.staffId} onChange={(v) => form.setFieldValue('staffId', v || '')} label="Staff Member" required />}
                        <Group grow>
                            <NumberInput label="Base Salary ($)" min={0} required {...form.getInputProps('baseSalary')} />
                            <NumberInput label="Net Amount ($)" min={0} description="Calculated automatically if left alone" {...form.getInputProps('amount')} />
                        </Group>
                        <Group grow>
                            <NumberInput label="Allowances (+)" min={0} {...form.getInputProps('allowances')} />
                            <NumberInput label="Deductions (-)" min={0} {...form.getInputProps('deductions')} />
                        </Group>
                        <Group grow>
                            <Select label="Month" data={MONTHS.map((m, i) => ({ value: String(i + 1), label: m }))} required {...form.getInputProps('month')} />
                            <NumberInput label="Year" min={2020} max={2030} required {...form.getInputProps('year')} />
                        </Group>
                        <Select label="Payment Method" data={['BANK_TRANSFER', 'CASH', 'CHEQUE', 'MOBILE_MONEY']} {...form.getInputProps('method')} />
                        <Select label="Currency" data={['USD', 'ZWL', 'ZAR', 'BWP']} {...form.getInputProps('currency')} />
                        <TextInput label="Notes" {...form.getInputProps('notes')} />
                        <Group justify="flex-end" mt="md">
                            <Button variant="default" onClick={closeDrawer}>Cancel</Button>
                            <Button type="submit" loading={submitting}>{editingId ? 'Update' : 'Save'}</Button>
                        </Group>
                    </Stack>
                </form>
            </Drawer>

            {/* Run Payroll Modal */}
            <Modal opened={payrollModal} onClose={() => setPayrollModal(false)} title="Run Payroll" centered>
                <form onSubmit={payrollForm.onSubmit(handleRunPayroll)}>
                    <Stack>
                        <Text size="sm" c="dimmed">This will create salary entries for all active staff for the selected period.</Text>
                        <Group grow>
                            <Select label="Month" data={MONTHS.map((m, i) => ({ value: String(i + 1), label: m }))} required {...payrollForm.getInputProps('month')} />
                            <NumberInput label="Year" min={2020} max={2030} required {...payrollForm.getInputProps('year')} />
                        </Group>
                        <Select label="Currency" data={['USD', 'ZWL', 'ZAR', 'BWP']} {...payrollForm.getInputProps('currency')} />
                        <Group justify="flex-end" mt="md">
                            <Button variant="default" onClick={() => setPayrollModal(false)}>Cancel</Button>
                            <Button type="submit" loading={submitting} color="violet">Generate Payroll</Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>

            {/* Mark as Paid Modal */}
            <Modal opened={payModal.opened} onClose={() => setPayModal({ ...payModal, opened: false })} title="Mark as Paid" centered>
                <Stack>
                    <Text size="sm">Mark payment for <b>{payModal.name}</b> as paid?</Text>
                    <TextInput label="Reference Number (optional)" placeholder="e.g. TXN-2026-001" {...payRefForm.getInputProps('referenceNo')} />
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={() => setPayModal({ ...payModal, opened: false })}>Cancel</Button>
                        <Button color="green" loading={submitting} onClick={handleMarkAsPaid}>Confirm Payment</Button>
                    </Group>
                </Stack>
            </Modal>

            {/* Delete Confirmation */}
            <Modal opened={deleteModal.opened} onClose={() => setDeleteModal({ ...deleteModal, opened: false })} title="Confirm Deletion">
                <Stack>
                    <Text size="sm">Are you sure you want to delete the salary record for <b>{deleteModal.name}</b>?</Text>
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={() => setDeleteModal({ ...deleteModal, opened: false })}>Cancel</Button>
                        <Button color="red" onClick={handleDelete}>Delete</Button>
                    </Group>
                </Stack>
            </Modal>
        </div>
    );
}
