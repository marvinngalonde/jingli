import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Title, Paper, Text, Group, Button, Table, Badge, Grid, Card, ThemeIcon, Drawer, Stack, LoadingOverlay, ActionIcon, TextInput, Textarea, Select, NumberInput, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconShield, IconPlus, IconTrash, IconSearch, IconAward, IconAlertTriangle, IconEdit } from '@tabler/icons-react';
import { api } from '../../services/api';
import { StudentPicker } from '../../components/common/StudentPicker';
import { StaffPicker } from '../../components/common/StaffPicker';

export default function Discipline() {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ opened: boolean; id: string; name: string }>({ opened: false, id: '', name: '' });

    // Queries
    const { data: records = [], isLoading: loading } = useQuery({
        queryKey: ['disciplineRecords', typeFilter],
        queryFn: () => {
            const params = new URLSearchParams();
            if (typeFilter) params.append('type', typeFilter);
            return api.get(`/discipline?${params}`).then(res => res.data || []);
        }
    });

    // Mutations
    const recordMutation = useMutation({
        mutationFn: (values: any) => {
            const payload = { ...values, points: Number(values.points) };
            return editingId
                ? api.patch(`/discipline/${editingId}`, payload)
                : api.post('/discipline', payload);
        },
        onSuccess: () => {
            notifications.show({ title: 'Success', message: editingId ? 'Record updated' : 'Record added', color: 'green' });
            queryClient.invalidateQueries({ queryKey: ['disciplineRecords'] });
            closeDrawer();
            form.reset();
            setEditingId(null);
        },
        onError: (err: any) => notifications.show({ title: 'Error', message: err.response?.data?.message || 'Failed to save record', color: 'red' })
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/discipline/${id}`),
        onSuccess: () => {
            notifications.show({ title: 'Deleted', message: 'Record removed', color: 'green' });
            queryClient.invalidateQueries({ queryKey: ['disciplineRecords'] });
            setDeleteModal({ opened: false, id: '', name: '' });
        },
        onError: (err: any) => notifications.show({ title: 'Error', message: err.response?.data?.message || 'Failed', color: 'red' })
    });

    const form = useForm({
        initialValues: { studentId: '', type: 'DEMERIT', category: 'Behaviour', description: '', points: 1, issuedBy: '', actionTaken: '' },
        validate: {
            studentId: (v) => (!v ? 'Please select a student' : null),
            description: (v) => (!v ? 'Description required' : null),
            issuedBy: (v) => (!v ? 'Please select the issuing staff' : null),
        },
    });

    const openEditDrawer = (item?: any) => {
        setEditingId(item?.id || null);
        if (item) {
            form.setValues({
                studentId: item.studentId || '',
                type: item.type || 'DEMERIT',
                category: item.category || 'Behaviour',
                description: item.description || '',
                points: item.points || 1,
                issuedBy: item.issuedBy || '',
                actionTaken: item.actionTaken || '',
            });
        } else {
            form.reset();
        }
        openDrawer();
    };

    const handleSave = (values: typeof form.values) => recordMutation.mutate(values);
    const confirmDelete = (id: string, name: string) => setDeleteModal({ opened: true, id, name });
    const handleDelete = () => deleteMutation.mutate(deleteModal.id);

    const filtered = records.filter((r: any) =>
        (r.student?.firstName + ' ' + r.student?.lastName).toLowerCase().includes(search.toLowerCase()) ||
        r.description?.toLowerCase().includes(search.toLowerCase())
    );

    const merits = records.filter((r: any) => r.type === 'MERIT').length;
    const demerits = records.filter((r: any) => r.type === 'DEMERIT').length;

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
                    <Button leftSection={<IconPlus size={16} />} onClick={() => openEditDrawer()}>Add Record</Button>
                </Group>
                {filtered.length === 0 ? (
                    <Text ta="center" c="dimmed" py="xl">No discipline records found. Click "Add Record" to get started.</Text>
                ) : (
                    <Table striped highlightOnHover>
                        <Table.Thead><Table.Tr><Table.Th>Student</Table.Th><Table.Th>Type</Table.Th><Table.Th>Category</Table.Th><Table.Th>Description</Table.Th><Table.Th>Points</Table.Th><Table.Th>Date</Table.Th><Table.Th>Actions</Table.Th></Table.Tr></Table.Thead>
                        <Table.Tbody>{filtered.map((r: any) => (
                            <Table.Tr key={r.id}>
                                <Table.Td fw={500}>{r.student?.firstName} {r.student?.lastName}</Table.Td>
                                <Table.Td><Badge color={r.type === 'MERIT' ? 'green' : 'red'} variant="light">{r.type}</Badge></Table.Td>
                                <Table.Td>{r.category}</Table.Td>
                                <Table.Td>{r.description}</Table.Td>
                                <Table.Td>{r.points}</Table.Td>
                                <Table.Td>{new Date(r.date).toLocaleDateString()}</Table.Td>
                                <Table.Td>
                                    <Group gap="xs">
                                        <ActionIcon color="blue" variant="subtle" onClick={() => openEditDrawer(r)}><IconEdit size={16} /></ActionIcon>
                                        <ActionIcon color="red" variant="subtle" onClick={() => confirmDelete(r.id, `${r.student?.firstName} ${r.student?.lastName}`)}><IconTrash size={16} /></ActionIcon>
                                    </Group>
                                </Table.Td>
                            </Table.Tr>
                        ))}</Table.Tbody>
                    </Table>
                )}
            </Paper>

            {/* Drawer */}
            <Drawer opened={drawerOpened} onClose={closeDrawer} title={editingId ? 'Edit Discipline Record' : 'Add Discipline Record'} position="right" size="md">
                <form onSubmit={form.onSubmit(handleSave)}>
                    <Stack>
                        <StudentPicker
                            value={form.values.studentId}
                            onChange={(val) => form.setFieldValue('studentId', val || '')}
                            required
                            error={form.errors.studentId as string}
                        />
                        <Select label="Type" data={['MERIT', 'DEMERIT']} required {...form.getInputProps('type')} />
                        <Select label="Category" data={['Academic', 'Behaviour', 'Uniform', 'Attendance', 'Sports', 'Other']} required {...form.getInputProps('category')} />
                        <Textarea label="Description" required {...form.getInputProps('description')} />
                        <NumberInput label="Points" min={1} max={50} {...form.getInputProps('points')} />
                        <StaffPicker
                            label="Issued By"
                            value={form.values.issuedBy}
                            onChange={(val) => form.setFieldValue('issuedBy', val || '')}
                            required
                            error={form.errors.issuedBy as string}
                        />
                        <Textarea label="Action Taken" placeholder="e.g. Detention, Warning, Suspension" {...form.getInputProps('actionTaken')} />
                        <Group justify="flex-end" mt="md"><Button variant="default" onClick={closeDrawer}>Cancel</Button><Button type="submit" loading={recordMutation.isPending}>{editingId ? 'Update' : 'Save'}</Button></Group>
                    </Stack>
                </form>
            </Drawer>

            {/* Delete Confirmation */}
            <Modal opened={deleteModal.opened} onClose={() => setDeleteModal({ ...deleteModal, opened: false })} title="Confirm Deletion">
                <Stack>
                    <Text size="sm">Are you sure you want to delete this discipline record for <b>{deleteModal.name}</b>?</Text>
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={() => setDeleteModal({ ...deleteModal, opened: false })}>Cancel</Button>
                        <Button color="red" loading={deleteMutation.isPending} onClick={handleDelete}>Delete</Button>
                    </Group>
                </Stack>
            </Modal>
        </div>
    );
}
