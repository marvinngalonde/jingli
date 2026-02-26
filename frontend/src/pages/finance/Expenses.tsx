import { Title, Paper, Text, Group, Button, Card, ThemeIcon, Grid, Stack, Table, Badge, Drawer, TextInput, NumberInput, Select, ActionIcon, LoadingOverlay, Modal, Tabs, ScrollArea, Textarea } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconReceipt, IconPlus, IconTrash, IconEdit, IconSearch, IconCheck, IconCash, IconFilter } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { api } from '../../services/api';

const CATEGORIES = ['Operations', 'Maintenance', 'Equipment', 'Utilities', 'Supplies', 'Transport', 'Catering', 'Other'];

export default function Expenses() {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [stats, setStats] = useState({ totalExpenses: 0, thisMonth: 0, pendingCount: 0 });
    const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ opened: boolean; id: string; name: string }>({ opened: false, id: '', name: '' });
    const [approveModal, setApproveModal] = useState<{ opened: boolean; id: string; name: string }>({ opened: false, id: '', name: '' });
    const [activeCategory, setActiveCategory] = useState<string | null>('all');
    const [filterStatus, setFilterStatus] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const form = useForm({
        initialValues: { description: '', category: 'Operations', amount: 0, currency: 'USD', date: new Date().toISOString().slice(0, 10), notes: '', receiptUrl: '' },
        validate: {
            description: (v) => (!v ? 'Description required' : null),
            amount: (v) => (v <= 0 ? 'Amount must be > 0' : null),
            date: (v) => (!v ? 'Date required' : null),
        },
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (activeCategory && activeCategory !== 'all') params.category = activeCategory;
            if (filterStatus) params.status = filterStatus;

            const [recordsRes, statsRes] = await Promise.allSettled([
                api.get('/expenses', { params }),
                api.get('/expenses/stats'),
            ]);
            if (recordsRes.status === 'fulfilled') setRecords(recordsRes.value.data || []);
            if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [activeCategory, filterStatus]);

    const openEdit = (item?: any) => {
        setEditingId(item?.id || null);
        if (item) {
            form.setValues({
                description: item.description || '',
                category: item.category || 'Operations',
                amount: item.amount || 0,
                currency: item.currency || 'USD',
                date: item.date ? new Date(item.date).toISOString().slice(0, 10) : '',
                notes: item.notes || '',
                receiptUrl: item.receiptUrl || '',
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
                await api.patch(`/expenses/${editingId}`, values);
                notifications.show({ id: 'exp-update', title: 'Updated', message: 'Expense updated', color: 'green' });
            } else {
                await api.post('/expenses', values);
                notifications.show({ id: 'exp-create', title: 'Recorded', message: 'Expense recorded', color: 'green' });
            }
            closeDrawer(); form.reset(); setEditingId(null); fetchData();
        } catch (err: any) {
            notifications.show({ id: 'exp-err', title: 'Error', message: err.response?.data?.message || 'Failed', color: 'red' });
        } finally { setSubmitting(false); }
    };

    const handleApprove = async () => {
        setSubmitting(true);
        try {
            await api.patch(`/expenses/${approveModal.id}/approve`);
            notifications.show({ id: 'exp-approve', title: 'Approved', message: `"${approveModal.name}" approved`, color: 'green' });
            setApproveModal({ opened: false, id: '', name: '' }); fetchData();
        } catch (err: any) {
            notifications.show({ id: 'exp-approve-err', title: 'Error', message: err.response?.data?.message || 'Failed', color: 'red' });
        } finally { setSubmitting(false); }
    };

    const confirmDelete = (id: string, name: string) => setDeleteModal({ opened: true, id, name });
    const handleDelete = async () => {
        try {
            await api.delete(`/expenses/${deleteModal.id}`);
            notifications.show({ id: 'exp-del', title: 'Deleted', message: 'Expense removed', color: 'green' });
            fetchData();
        } catch (err: any) {
            notifications.show({ id: 'exp-del-err', title: 'Error', message: err.response?.data?.message || 'Failed', color: 'red' });
        } finally { setDeleteModal({ opened: false, id: '', name: '' }); }
    };

    const filtered = records.filter(r => r.description?.toLowerCase().includes(search.toLowerCase()));
    const statusColor = (s: string) => s === 'APPROVED' ? 'green' : s === 'PENDING' ? 'orange' : s === 'REJECTED' ? 'red' : 'gray';

    return (
        <div>
            <Group justify="space-between" mb="lg">
                <Title order={2}>Expenses</Title>
                <Button leftSection={<IconPlus size={16} />} onClick={() => openEdit()}>Record Expense</Button>
            </Group>

            <Grid mb="lg">
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card shadow="sm" radius="md" p="md" withBorder>
                        <Group justify="space-between" mb="xs"><Text fw={500} c="dimmed" size="sm">Total Expenses</Text><ThemeIcon variant="light" color="red"><IconReceipt size={16} /></ThemeIcon></Group>
                        <Text fw={700} size="xl">${stats.totalExpenses.toLocaleString()}</Text>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 6, md: 4 }}>
                    <Card shadow="sm" radius="md" p="md" withBorder>
                        <Group justify="space-between" mb="xs"><Text fw={500} c="dimmed" size="sm">This Month</Text><ThemeIcon variant="light" color="blue"><IconCash size={16} /></ThemeIcon></Group>
                        <Text fw={700} size="xl">${stats.thisMonth.toLocaleString()}</Text>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 6, md: 4 }}>
                    <Card shadow="sm" radius="md" p="md" withBorder>
                        <Group justify="space-between" mb="xs"><Text fw={500} c="dimmed" size="sm">Pending Approval</Text><ThemeIcon variant="light" color="orange"><IconFilter size={16} /></ThemeIcon></Group>
                        <Text fw={700} size="xl">{stats.pendingCount}</Text>
                    </Card>
                </Grid.Col>
            </Grid>

            <Paper p="lg" radius="md" shadow="sm" withBorder pos="relative">
                <LoadingOverlay visible={loading} />

                <Tabs value={activeCategory || 'all'} onChange={setActiveCategory} mb="md">
                    <Tabs.List style={{ overflowX: 'auto' }}>
                        <Tabs.Tab value="all">All</Tabs.Tab>
                        {CATEGORIES.map(c => <Tabs.Tab key={c} value={c}>{c}</Tabs.Tab>)}
                    </Tabs.List>
                </Tabs>

                <Group justify="space-between" mb="md">
                    <TextInput placeholder="Search expenses..." leftSection={<IconSearch size={16} />} value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 300 }} />
                    <Select placeholder="Status" data={['PENDING', 'APPROVED', 'REJECTED']} value={filterStatus} onChange={setFilterStatus} clearable style={{ width: 140 }} />
                </Group>

                {filtered.length === 0 ? (
                    <Text ta="center" c="dimmed" py="xl">No expenses found. Click "Record Expense" to add one.</Text>
                ) : (
                    <ScrollArea>
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>#</Table.Th>
                                    <Table.Th>Description</Table.Th>
                                    <Table.Th>Category</Table.Th>
                                    <Table.Th>Amount</Table.Th>
                                    <Table.Th>Date</Table.Th>
                                    <Table.Th>Status</Table.Th>
                                    <Table.Th>Approver</Table.Th>
                                    <Table.Th>Actions</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {filtered.map((r, idx) => (
                                    <Table.Tr key={r.id}>
                                        <Table.Td>{idx + 1}</Table.Td>
                                        <Table.Td fw={500}>{r.description}</Table.Td>
                                        <Table.Td><Badge variant="light" color="blue" size="sm">{r.category}</Badge></Table.Td>
                                        <Table.Td fw={600}>${Number(r.amount || 0).toLocaleString()}</Table.Td>
                                        <Table.Td>{r.date ? new Date(r.date).toLocaleDateString() : '—'}</Table.Td>
                                        <Table.Td><Badge color={statusColor(r.status)} variant="light">{r.status}</Badge></Table.Td>
                                        <Table.Td><Text size="sm" c="dimmed">{r.approver?.username || '—'}</Text></Table.Td>
                                        <Table.Td>
                                            <Group gap="xs">
                                                {r.status === 'PENDING' && (
                                                    <ActionIcon color="green" variant="subtle" title="Approve" onClick={() => setApproveModal({ opened: true, id: r.id, name: r.description })}>
                                                        <IconCheck size={16} />
                                                    </ActionIcon>
                                                )}
                                                <ActionIcon color="blue" variant="subtle" onClick={() => openEdit(r)}><IconEdit size={16} /></ActionIcon>
                                                <ActionIcon color="red" variant="subtle" onClick={() => confirmDelete(r.id, r.description)}><IconTrash size={16} /></ActionIcon>
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
            <Drawer opened={drawerOpened} onClose={closeDrawer} title={editingId ? 'Edit Expense' : 'Record Expense'} position="right" size="md">
                <form onSubmit={form.onSubmit(handleSave)}>
                    <Stack>
                        <TextInput label="Description" required {...form.getInputProps('description')} />
                        <Select label="Category" data={CATEGORIES} required {...form.getInputProps('category')} />
                        <Group grow>
                            <NumberInput label="Amount ($)" min={0} required {...form.getInputProps('amount')} />
                            <Select label="Currency" data={['USD', 'ZWL', 'ZAR', 'BWP']} {...form.getInputProps('currency')} />
                        </Group>
                        <TextInput label="Date" type="date" required {...form.getInputProps('date')} />
                        <Textarea label="Notes" autosize minRows={2} {...form.getInputProps('notes')} />
                        <TextInput label="Receipt URL (optional)" placeholder="https://..." {...form.getInputProps('receiptUrl')} />
                        <Group justify="flex-end" mt="md">
                            <Button variant="default" onClick={closeDrawer}>Cancel</Button>
                            <Button type="submit" loading={submitting}>{editingId ? 'Update' : 'Save'}</Button>
                        </Group>
                    </Stack>
                </form>
            </Drawer>

            {/* Approve Confirmation */}
            <Modal opened={approveModal.opened} onClose={() => setApproveModal({ ...approveModal, opened: false })} title="Approve Expense" centered>
                <Stack>
                    <Text size="sm">Approve expense: <b>"{approveModal.name}"</b>?</Text>
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={() => setApproveModal({ ...approveModal, opened: false })}>Cancel</Button>
                        <Button color="green" loading={submitting} onClick={handleApprove}>Approve</Button>
                    </Group>
                </Stack>
            </Modal>

            {/* Delete Confirmation */}
            <Modal opened={deleteModal.opened} onClose={() => setDeleteModal({ ...deleteModal, opened: false })} title="Confirm Deletion">
                <Stack>
                    <Text size="sm">Are you sure you want to delete <b>"{deleteModal.name}"</b>?</Text>
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={() => setDeleteModal({ ...deleteModal, opened: false })}>Cancel</Button>
                        <Button color="red" onClick={handleDelete}>Delete</Button>
                    </Group>
                </Stack>
            </Modal>
        </div>
    );
}
