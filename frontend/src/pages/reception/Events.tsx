import { Title, Paper, Text, Group, Button, Grid, Card, ThemeIcon, Stack, Drawer, TextInput, Textarea, Select, Table, Badge, ActionIcon, LoadingOverlay, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCalendarEvent, IconPlus, IconTrash, IconEdit, IconSearch } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function Events() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [deleteModal, setDeleteModal] = useState<{ opened: boolean; id: string; name: string }>({ opened: false, id: '', name: '' });

    const form = useForm({
        initialValues: { title: '', description: '', date: '', location: '', type: 'GENERAL', status: 'UPCOMING' },
        validate: {
            title: (v) => (!v ? 'Title is required' : null),
            date: (v) => (!v ? 'Date is required' : null),
        },
    });

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await api.get('/events');
            setEvents(res.data || []);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    useEffect(() => { fetchEvents(); }, []);

    const openEditDrawer = (item?: any) => {
        setEditingId(item?.id || null);
        if (item) {
            form.setValues({
                title: item.title || '',
                description: item.description || '',
                date: item.date ? item.date.split('T')[0] : '',
                location: item.location || '',
                type: item.type || 'GENERAL',
                status: item.status || 'UPCOMING',
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
                await api.patch(`/events/${editingId}`, values);
                notifications.show({ title: 'Success', message: 'Event updated', color: 'green' });
            } else {
                await api.post('/events', values);
                notifications.show({ title: 'Success', message: 'Event created', color: 'green' });
            }
            closeDrawer(); form.reset(); setEditingId(null); fetchEvents();
        } catch (err: any) {
            notifications.show({ title: 'Error', message: err.response?.data?.message || 'Failed to save event', color: 'red' });
        } finally { setSubmitting(false); }
    };

    const confirmDelete = (id: string, name: string) => {
        setDeleteModal({ opened: true, id, name });
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/events/${deleteModal.id}`);
            notifications.show({ title: 'Deleted', message: 'Event removed', color: 'green' });
            fetchEvents();
        } catch (err: any) {
            notifications.show({ title: 'Error', message: err.response?.data?.message || 'Failed', color: 'red' });
        } finally {
            setDeleteModal({ opened: false, id: '', name: '' });
        }
    };

    const filtered = events.filter(e =>
        e.title?.toLowerCase().includes(search.toLowerCase()) ||
        e.location?.toLowerCase().includes(search.toLowerCase())
    );

    const upcoming = events.filter(e => e.status === 'UPCOMING').length;
    const completed = events.filter(e => e.status === 'COMPLETED').length;

    return (
        <div>
            <Title order={2} mb="lg">Events Management</Title>

            <Grid mb="lg">
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card shadow="sm" radius="md" p="md" withBorder>
                        <Group justify="space-between" mb="xs"><Text fw={500} c="dimmed">Total Events</Text><ThemeIcon variant="light" color="blue"><IconCalendarEvent size={16} /></ThemeIcon></Group>
                        <Text fw={700} size="xl">{events.length}</Text>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card shadow="sm" radius="md" p="md" withBorder>
                        <Group justify="space-between" mb="xs"><Text fw={500} c="dimmed">Upcoming</Text><ThemeIcon variant="light" color="green"><IconCalendarEvent size={16} /></ThemeIcon></Group>
                        <Text fw={700} size="xl">{upcoming}</Text>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card shadow="sm" radius="md" p="md" withBorder>
                        <Group justify="space-between" mb="xs"><Text fw={500} c="dimmed">Completed</Text><ThemeIcon variant="light" color="orange"><IconCalendarEvent size={16} /></ThemeIcon></Group>
                        <Text fw={700} size="xl">{completed}</Text>
                    </Card>
                </Grid.Col>
            </Grid>

            <Paper p="lg" radius="md" shadow="sm" withBorder pos="relative">
                <LoadingOverlay visible={loading} />
                <Group justify="space-between" mb="md">
                    <TextInput placeholder="Search events..." leftSection={<IconSearch size={16} />} value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, maxWidth: 300 }} />
                    <Button leftSection={<IconPlus size={16} />} onClick={() => openEditDrawer()}>Add Event</Button>
                </Group>
                {filtered.length === 0 ? (
                    <Text ta="center" c="dimmed" py="xl">No events found. Click "Add Event" to get started.</Text>
                ) : (
                    <Table striped highlightOnHover>
                        <Table.Thead><Table.Tr><Table.Th>Title</Table.Th><Table.Th>Date</Table.Th><Table.Th>Location</Table.Th><Table.Th>Type</Table.Th><Table.Th>Status</Table.Th><Table.Th>Actions</Table.Th></Table.Tr></Table.Thead>
                        <Table.Tbody>{filtered.map(e => (
                            <Table.Tr key={e.id}>
                                <Table.Td fw={500}>{e.title}</Table.Td>
                                <Table.Td>{e.date ? new Date(e.date).toLocaleDateString() : '—'}</Table.Td>
                                <Table.Td>{e.location || '—'}</Table.Td>
                                <Table.Td><Badge variant="light">{e.type}</Badge></Table.Td>
                                <Table.Td><Badge color={e.status === 'UPCOMING' ? 'green' : e.status === 'ONGOING' ? 'blue' : 'gray'} variant="light">{e.status}</Badge></Table.Td>
                                <Table.Td>
                                    <Group gap="xs">
                                        <ActionIcon color="blue" variant="subtle" onClick={() => openEditDrawer(e)}><IconEdit size={16} /></ActionIcon>
                                        <ActionIcon color="red" variant="subtle" onClick={() => confirmDelete(e.id, e.title)}><IconTrash size={16} /></ActionIcon>
                                    </Group>
                                </Table.Td>
                            </Table.Tr>
                        ))}</Table.Tbody>
                    </Table>
                )}
            </Paper>

            <Drawer opened={drawerOpened} onClose={closeDrawer} title={editingId ? 'Edit Event' : 'Add Event'} position="right" size="md">
                <form onSubmit={form.onSubmit(handleSave)}>
                    <Stack>
                        <TextInput label="Event Title" required placeholder="e.g. Sports Day" {...form.getInputProps('title')} />
                        <Textarea label="Description" placeholder="Event details" {...form.getInputProps('description')} />
                        <TextInput label="Date" type="date" required {...form.getInputProps('date')} />
                        <TextInput label="Location" placeholder="e.g. Main Hall" {...form.getInputProps('location')} />
                        <Select label="Type" data={['GENERAL', 'ACADEMIC', 'SPORTS', 'CULTURAL', 'MEETING', 'HOLIDAY']} {...form.getInputProps('type')} />
                        <Select label="Status" data={['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED']} {...form.getInputProps('status')} />
                        <Group justify="flex-end" mt="md"><Button variant="default" onClick={closeDrawer}>Cancel</Button><Button type="submit" loading={submitting}>{editingId ? 'Update' : 'Save'}</Button></Group>
                    </Stack>
                </form>
            </Drawer>

            <Modal opened={deleteModal.opened} onClose={() => setDeleteModal({ ...deleteModal, opened: false })} title="Confirm Deletion">
                <Stack>
                    <Text size="sm">Are you sure you want to delete <b>{deleteModal.name}</b>?</Text>
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={() => setDeleteModal({ ...deleteModal, opened: false })}>Cancel</Button>
                        <Button color="red" onClick={handleDelete}>Delete</Button>
                    </Group>
                </Stack>
            </Modal>
        </div>
    );
}
