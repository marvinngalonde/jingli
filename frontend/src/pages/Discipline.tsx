import { useState, useEffect } from 'react';
import { Title, Tabs, Paper, Text, Group, Button, Table, Badge, Grid, Card, ThemeIcon, Drawer, Stack, LoadingOverlay, ActionIcon, TextInput, Textarea, Select, NumberInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconShield, IconPlus, IconTrash, IconSearch, IconAward, IconAlertTriangle } from '@tabler/icons-react';
import { api } from '../services/api';

export default function Discipline() {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
    const [typeFilter, setTypeFilter] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const form = useForm({
        initialValues: { studentId: '', type: 'DEMERIT', category: 'Behaviour', description: '', points: 1, issuedBy: '' },
        validate: {
            studentId: (v) => (!v ? 'Student ID required' : null),
            description: (v) => (!v ? 'Description required' : null),
            issuedBy: (v) => (!v ? 'Issuer required' : null),
        },
    });

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (typeFilter) params.append('type', typeFilter);
            const res = await api.get(`/discipline?${params}`);
            setRecords(res.data || []);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    useEffect(() => { fetchRecords(); }, [typeFilter]);

    const handleSave = async (values: typeof form.values) => {
        try {
            await api.post('/discipline', { ...values, points: Number(values.points) });
            notifications.show({ title: 'Success', message: 'Record added', color: 'green' });
            closeDrawer(); form.reset(); fetchRecords();
        } catch (err: any) { notifications.show({ title: 'Error', message: err.response?.data?.message || 'Failed', color: 'red' }); }
    };

    const handleDelete = async (id: string) => {
        try { await api.delete(`/discipline/${id}`); notifications.show({ title: 'Deleted', message: 'Record removed', color: 'green' }); fetchRecords(); }
        catch (err: any) { notifications.show({ title: 'Error', message: err.response?.data?.message || 'Failed', color: 'red' }); }
    };

    const filtered = records.filter(r =>
        (r.student?.firstName + ' ' + r.student?.lastName).toLowerCase().includes(search.toLowerCase()) ||
        r.description?.toLowerCase().includes(search.toLowerCase())
    );

    const merits = records.filter(r => r.type === 'MERIT').length;
    const demerits = records.filter(r => r.type === 'DEMERIT').length;

    return (
        <div>
            <Title order={2} mb="lg">Discipline & Conduct</Title>

            {/* Stats */}
            <Grid mb="lg">
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card shadow="sm" radius="md" p="md" withBorder>
                        <Group justify="space-between" mb="xs"><Text fw={500} c="dimmed">Total Records</Text><ThemeIcon variant="light" color="blue"><IconShield size={16} /></ThemeIcon></Group>
                        <Text fw={700} size="xl">{records.length}</Text>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card shadow="sm" radius="md" p="md" withBorder>
                        <Group justify="space-between" mb="xs"><Text fw={500} c="dimmed">Merits</Text><ThemeIcon variant="light" color="green"><IconAward size={16} /></ThemeIcon></Group>
                        <Text fw={700} size="xl">{merits}</Text>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card shadow="sm" radius="md" p="md" withBorder>
                        <Group justify="space-between" mb="xs"><Text fw={500} c="dimmed">Demerits</Text><ThemeIcon variant="light" color="red"><IconAlertTriangle size={16} /></ThemeIcon></Group>
                        <Text fw={700} size="xl">{demerits}</Text>
                    </Card>
                </Grid.Col>
            </Grid>

            <Paper p="lg" radius="md" shadow="sm" withBorder pos="relative">
                <LoadingOverlay visible={loading} />
                <Group justify="space-between" mb="md">
                    <Group>
                        <TextInput placeholder="Search records..." leftSection={<IconSearch size={16} />} value={search} onChange={e => setSearch(e.target.value)} style={{ minWidth: 250 }} />
                        <Select placeholder="Filter type" data={[{ value: '', label: 'All' }, { value: 'MERIT', label: 'Merits' }, { value: 'DEMERIT', label: 'Demerits' }]} value={typeFilter} onChange={setTypeFilter} clearable w={140} />
                    </Group>
                    <Button leftSection={<IconPlus size={16} />} onClick={openDrawer}>Add Record</Button>
                </Group>
                {filtered.length === 0 ? (
                    <Text ta="center" c="dimmed" py="xl">No discipline records found. Click "Add Record" to get started.</Text>
                ) : (
                    <Table striped highlightOnHover>
                        <Table.Thead><Table.Tr><Table.Th>Student</Table.Th><Table.Th>Type</Table.Th><Table.Th>Category</Table.Th><Table.Th>Description</Table.Th><Table.Th>Points</Table.Th><Table.Th>Date</Table.Th><Table.Th>Actions</Table.Th></Table.Tr></Table.Thead>
                        <Table.Tbody>{filtered.map(r => (
                            <Table.Tr key={r.id}>
                                <Table.Td fw={500}>{r.student?.firstName} {r.student?.lastName}</Table.Td>
                                <Table.Td><Badge color={r.type === 'MERIT' ? 'green' : 'red'} variant="light">{r.type}</Badge></Table.Td>
                                <Table.Td>{r.category}</Table.Td>
                                <Table.Td>{r.description}</Table.Td>
                                <Table.Td>{r.points}</Table.Td>
                                <Table.Td>{new Date(r.date).toLocaleDateString()}</Table.Td>
                                <Table.Td><ActionIcon color="red" variant="subtle" onClick={() => handleDelete(r.id)}><IconTrash size={16} /></ActionIcon></Table.Td>
                            </Table.Tr>
                        ))}</Table.Tbody>
                    </Table>
                )}
            </Paper>

            {/* Drawer */}
            <Drawer opened={drawerOpened} onClose={closeDrawer} title="Add Discipline Record" position="right" size="md">
                <form onSubmit={form.onSubmit(handleSave)}>
                    <Stack>
                        <TextInput label="Student ID" required {...form.getInputProps('studentId')} />
                        <Select label="Type" data={['MERIT', 'DEMERIT']} required {...form.getInputProps('type')} />
                        <Select label="Category" data={['Academic', 'Behaviour', 'Uniform', 'Attendance', 'Sports', 'Other']} required {...form.getInputProps('category')} />
                        <Textarea label="Description" required {...form.getInputProps('description')} />
                        <NumberInput label="Points" min={1} max={50} {...form.getInputProps('points')} />
                        <TextInput label="Issued By (Staff ID)" required {...form.getInputProps('issuedBy')} />
                        <Group justify="flex-end" mt="md"><Button variant="default" onClick={closeDrawer}>Cancel</Button><Button type="submit">Save</Button></Group>
                    </Stack>
                </form>
            </Drawer>
        </div>
    );
}
