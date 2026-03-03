import { Title, Paper, Text, Group, Button, Grid, Card, ThemeIcon, Stack, Drawer, TextInput, Textarea, Select, Table, Badge, ActionIcon, LoadingOverlay, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCalendarEvent, IconPlus, IconTrash, IconEdit, IconSearch } from '@tabler/icons-react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';

export default function Events() {
    const queryClient = useQueryClient();
    const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [deleteModal, setDeleteModal] = useState<{ opened: boolean; id: string; name: string }>({ opened: false, id: '', name: '' });

    const form = useForm({
        initialValues: { title: '', description: '', startDate: '', endDate: '', location: '', type: 'GENERAL', allDay: true },
        validate: {
            title: (v) => (!v ? 'Title is required' : null),
            startDate: (v) => (!v ? 'Start Date is required' : null),
            endDate: (v) => (!v ? 'End Date is required' : null),
        },
    });

    const { data: events = [], isLoading: loading } = useQuery({
        queryKey: ['events'],
        queryFn: async () => {
            const res = await api.get('/events');
            return res.data || [];
        }
    });

    const openEditDrawer = (item?: any) => {
        setEditingId(item?.id || null);
        if (item) {
            form.setValues({
                title: item.title || '',
                description: item.description || '',
                startDate: item.startDate ? item.startDate.split('T')[0] : '',
                endDate: item.endDate ? item.endDate.split('T')[0] : '',
                location: item.location || '',
                type: item.type || 'GENERAL',
                allDay: item.allDay !== undefined ? item.allDay : true,
            });
        } else {
            form.reset();
        }
        openDrawer();
    };

    const saveMutation = useMutation({
        mutationFn: async (values: typeof form.values) => {
            if (editingId) {
                return api.patch(`/events/${editingId}`, values);
            } else {
                return api.post('/events', values);
            }
        },
        onSuccess: () => {
            notifications.show({ title: 'Success', message: `Event ${editingId ? 'updated' : 'created'}`, color: 'green' });
            closeDrawer();
            form.reset();
            setEditingId(null);
            queryClient.invalidateQueries({ queryKey: ['events'] });
        },
        onError: (err: any) => {
            notifications.show({ title: 'Error', message: err.response?.data?.message || 'Failed to save event', color: 'red' });
        }
    });

    const handleSave = (values: typeof form.values) => {
        saveMutation.mutate(values);
    };

    const confirmDelete = (id: string, name: string) => {
        setDeleteModal({ opened: true, id, name });
    };

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/events/${id}`),
        onSuccess: () => {
            notifications.show({ title: 'Deleted', message: 'Event removed', color: 'green' });
            queryClient.invalidateQueries({ queryKey: ['events'] });
            setDeleteModal({ opened: false, id: '', name: '' });
        },
        onError: (err: any) => {
            notifications.show({ title: 'Error', message: err.response?.data?.message || 'Failed', color: 'red' });
            setDeleteModal({ opened: false, id: '', name: '' });
        }
    });

    const handleDelete = () => {
        deleteMutation.mutate(deleteModal.id);
    };

    const filtered = events.filter(e =>
        e.title?.toLowerCase().includes(search.toLowerCase()) ||
        e.location?.toLowerCase().includes(search.toLowerCase())
    );

    const now = new Date();
    const upcoming = events.filter(e => new Date(e.startDate) > now).length;
    const completed = events.filter(e => new Date(e.endDate) < now).length;

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
                                <Table.Td>{e.startDate ? new Date(e.startDate).toLocaleDateString() : '—'} {e.endDate && e.startDate.split('T')[0] !== e.endDate.split('T')[0] ? `- ${new Date(e.endDate).toLocaleDateString()}` : ''}</Table.Td>
                                <Table.Td>{e.location || '—'}</Table.Td>
                                <Table.Td><Badge variant="light">{e.type}</Badge></Table.Td>
                                <Table.Td>
                                    {(() => {
                                        const eventStart = new Date(e.startDate);
                                        const eventEnd = new Date(e.endDate);
                                        const isUpcoming = eventStart > now;
                                        const isCompleted = eventEnd < now;
                                        const status = isCompleted ? 'COMPLETED' : isUpcoming ? 'UPCOMING' : 'ONGOING';
                                        return <Badge color={status === 'UPCOMING' ? 'green' : status === 'ONGOING' ? 'blue' : 'gray'} variant="light">{status}</Badge>;
                                    })()}
                                </Table.Td>
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
                        <Group grow>
                            <TextInput label="Start Date" type="date" required {...form.getInputProps('startDate')} />
                            <TextInput label="End Date" type="date" required {...form.getInputProps('endDate')} />
                        </Group>
                        <TextInput label="Location" placeholder="e.g. Main Hall" {...form.getInputProps('location')} />
                        <Select label="Type" data={['GENERAL', 'ACADEMIC', 'SPORTS', 'CULTURAL', 'MEETING', 'HOLIDAY']} {...form.getInputProps('type')} />
                        <Group justify="flex-end" mt="md"><Button variant="default" onClick={closeDrawer}>Cancel</Button><Button type="submit" loading={saveMutation.isPending}>{editingId ? 'Update' : 'Save'}</Button></Group>
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
