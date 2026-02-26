import { useState } from 'react';
import { Title, Text, Paper, Group, Button, Stack, TextInput, Select, Card, Badge, Grid, ActionIcon, Table, Modal, Drawer, Tabs, ThemeIcon, SimpleGrid, Box, Divider, ScrollArea, Textarea, NumberInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
    IconPlus, IconTrash, IconEdit, IconSearch, IconBrandZoom,
    IconExternalLink, IconClock, IconUsers, IconVideo, IconCalendar,
    IconCheck, IconPlayerPlay, IconCopy,
} from '@tabler/icons-react';

interface LiveClass {
    id: string;
    title: string;
    subject: string;
    classSection: string;
    platform: 'Zoom' | 'Google Meet' | 'Microsoft Teams';
    meetingLink: string;
    meetingId: string;
    dateTime: string;
    duration: number;
    status: 'SCHEDULED' | 'LIVE' | 'COMPLETED';
    attendees: number;
    notes: string;
}

let nextId = 1;

export default function TeacherLiveClass() {
    const [classes, setClasses] = useState<LiveClass[]>([]);
    const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ opened: boolean; id: string; title: string }>({ opened: false, id: '', title: '' });
    const [search, setSearch] = useState('');
    const [tab, setTab] = useState<string | null>('upcoming');

    const form = useForm({
        initialValues: {
            title: '', subject: '', classSection: '', platform: 'Zoom' as const,
            meetingLink: '', meetingId: '', dateTime: '', duration: 45, notes: '',
        },
        validate: {
            title: (v) => (!v ? 'Title required' : null),
            subject: (v) => (!v ? 'Subject required' : null),
            meetingLink: (v) => (!v ? 'Meeting link required' : null),
            dateTime: (v) => (!v ? 'Date & time required' : null),
        },
    });

    const generateMeetLink = () => {
        const platform = form.values.platform;
        const id = Math.random().toString(36).substring(2, 12);
        if (platform === 'Zoom') {
            form.setFieldValue('meetingLink', `https://zoom.us/j/${id}`);
            form.setFieldValue('meetingId', id);
        } else if (platform === 'Google Meet') {
            form.setFieldValue('meetingLink', `https://meet.google.com/${id.substring(0, 3)}-${id.substring(3, 7)}-${id.substring(7)}`);
            form.setFieldValue('meetingId', id);
        } else {
            form.setFieldValue('meetingLink', `https://teams.microsoft.com/l/meetup-join/${id}`);
            form.setFieldValue('meetingId', id);
        }
    };

    const handleSave = (values: typeof form.values) => {
        if (editingId) {
            setClasses(prev => prev.map(c => c.id === editingId ? { ...c, ...values } : c));
            notifications.show({ id: 'lc-update', title: 'Updated', message: 'Live class updated', color: 'green' });
        } else {
            const newClass: LiveClass = {
                id: `lc-${nextId++}`,
                ...values,
                status: new Date(values.dateTime) <= new Date() ? 'LIVE' : 'SCHEDULED',
                attendees: 0,
            };
            setClasses(prev => [...prev, newClass]);
            notifications.show({ id: 'lc-create', title: 'Scheduled', message: `"${values.title}" scheduled successfully`, color: 'green' });
        }
        closeDrawer();
        form.reset();
        setEditingId(null);
    };

    const openEdit = (cls?: LiveClass) => {
        setEditingId(cls?.id || null);
        if (cls) {
            form.setValues({
                title: cls.title, subject: cls.subject, classSection: cls.classSection,
                platform: cls.platform, meetingLink: cls.meetingLink, meetingId: cls.meetingId,
                dateTime: cls.dateTime, duration: cls.duration, notes: cls.notes,
            });
        } else {
            form.reset();
        }
        openDrawer();
    };

    const markAsCompleted = (id: string) => {
        setClasses(prev => prev.map(c => c.id === id ? { ...c, status: 'COMPLETED' as const } : c));
        notifications.show({ id: 'lc-done', title: 'Completed', message: 'Class marked as completed', color: 'green' });
    };

    const startClass = (id: string) => {
        setClasses(prev => prev.map(c => c.id === id ? { ...c, status: 'LIVE' as const } : c));
        const cls = classes.find(c => c.id === id);
        if (cls?.meetingLink) window.open(cls.meetingLink, '_blank');
    };

    const confirmDelete = (id: string, title: string) => setDeleteModal({ opened: true, id, title });
    const handleDelete = () => {
        setClasses(prev => prev.filter(c => c.id !== deleteModal.id));
        setDeleteModal({ opened: false, id: '', title: '' });
        notifications.show({ id: 'lc-del', title: 'Deleted', message: 'Live class removed', color: 'green' });
    };

    const copyLink = (link: string) => {
        navigator.clipboard.writeText(link);
        notifications.show({ id: 'lc-copy', title: 'Copied', message: 'Meeting link copied to clipboard', color: 'blue' });
    };

    const now = new Date();
    const filtered = classes.filter(c => {
        const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.subject.toLowerCase().includes(search.toLowerCase());
        if (tab === 'upcoming') return matchSearch && c.status === 'SCHEDULED';
        if (tab === 'live') return matchSearch && c.status === 'LIVE';
        if (tab === 'completed') return matchSearch && c.status === 'COMPLETED';
        return matchSearch;
    });

    const platformColor = (p: string) => p === 'Zoom' ? 'blue' : p === 'Google Meet' ? 'green' : 'violet';
    const statusColor = (s: string) => s === 'LIVE' ? 'red' : s === 'SCHEDULED' ? 'blue' : 'gray';
    const platformIcon = (p: string) => p === 'Zoom' ? <IconBrandZoom size={16} /> : <IconVideo size={16} />;

    return (
        <div>
            <Group justify="space-between" mb="lg">
                <div>
                    <Title order={2}>Live Classes</Title>
                    <Text c="dimmed" size="sm">Schedule and manage virtual classes via Zoom, Google Meet, or Microsoft Teams</Text>
                </div>
                <Button leftSection={<IconPlus size={16} />} onClick={() => openEdit()}>Schedule Class</Button>
            </Group>

            <SimpleGrid cols={{ base: 2, md: 4 }} mb="lg">
                <Card shadow="sm" radius="md" p="md" withBorder>
                    <Group justify="space-between" mb="xs"><Text size="sm" c="dimmed" fw={500}>Total Classes</Text><ThemeIcon variant="light" color="blue"><IconVideo size={16} /></ThemeIcon></Group>
                    <Text fw={700} size="xl">{classes.length}</Text>
                </Card>
                <Card shadow="sm" radius="md" p="md" withBorder>
                    <Group justify="space-between" mb="xs"><Text size="sm" c="dimmed" fw={500}>Live Now</Text><ThemeIcon variant="light" color="red"><IconPlayerPlay size={16} /></ThemeIcon></Group>
                    <Text fw={700} size="xl" c="red">{classes.filter(c => c.status === 'LIVE').length}</Text>
                </Card>
                <Card shadow="sm" radius="md" p="md" withBorder>
                    <Group justify="space-between" mb="xs"><Text size="sm" c="dimmed" fw={500}>Upcoming</Text><ThemeIcon variant="light" color="orange"><IconCalendar size={16} /></ThemeIcon></Group>
                    <Text fw={700} size="xl">{classes.filter(c => c.status === 'SCHEDULED').length}</Text>
                </Card>
                <Card shadow="sm" radius="md" p="md" withBorder>
                    <Group justify="space-between" mb="xs"><Text size="sm" c="dimmed" fw={500}>Completed</Text><ThemeIcon variant="light" color="green"><IconCheck size={16} /></ThemeIcon></Group>
                    <Text fw={700} size="xl">{classes.filter(c => c.status === 'COMPLETED').length}</Text>
                </Card>
            </SimpleGrid>

            <Paper p="lg" radius="md" shadow="sm" withBorder>
                <Tabs value={tab} onChange={setTab} mb="md">
                    <Tabs.List>
                        <Tabs.Tab value="upcoming">Upcoming</Tabs.Tab>
                        <Tabs.Tab value="live" color="red">🔴 Live Now</Tabs.Tab>
                        <Tabs.Tab value="completed">Completed</Tabs.Tab>
                        <Tabs.Tab value="all">All</Tabs.Tab>
                    </Tabs.List>
                </Tabs>

                <TextInput placeholder="Search classes..." leftSection={<IconSearch size={16} />} value={search} onChange={e => setSearch(e.target.value)} mb="md" style={{ maxWidth: 300 }} />

                {filtered.length === 0 ? (
                    <Stack align="center" py="xl" gap="xs">
                        <IconVideo size={40} color="var(--mantine-color-gray-4)" />
                        <Text c="dimmed">No classes found. Schedule your first live class!</Text>
                    </Stack>
                ) : (
                    <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }}>
                        {filtered.map(cls => (
                            <Card key={cls.id} shadow="sm" radius="md" withBorder style={{ borderLeft: cls.status === 'LIVE' ? '3px solid var(--mantine-color-red-5)' : undefined }}>
                                <Group justify="space-between" mb="xs">
                                    <Text fw={600}>{cls.title}</Text>
                                    <Badge color={statusColor(cls.status)} size="sm" variant={cls.status === 'LIVE' ? 'filled' : 'light'}>
                                        {cls.status === 'LIVE' ? '🔴 LIVE' : cls.status}
                                    </Badge>
                                </Group>
                                <Text size="sm" c="dimmed" mb="xs">{cls.subject} • {cls.classSection}</Text>

                                <Stack gap="xs" mb="sm">
                                    <Group gap="xs">
                                        <IconCalendar size={14} color="gray" />
                                        <Text size="xs">{cls.dateTime ? new Date(cls.dateTime).toLocaleString() : 'TBD'}</Text>
                                    </Group>
                                    <Group gap="xs">
                                        <IconClock size={14} color="gray" />
                                        <Text size="xs">{cls.duration} minutes</Text>
                                    </Group>
                                    <Group gap="xs">
                                        {platformIcon(cls.platform)}
                                        <Badge size="xs" color={platformColor(cls.platform)} variant="light">{cls.platform}</Badge>
                                    </Group>
                                </Stack>

                                <Divider my="sm" />

                                <Group justify="space-between">
                                    <Group gap="xs">
                                        {cls.status === 'SCHEDULED' && (
                                            <Button size="xs" variant="filled" color="green" leftSection={<IconPlayerPlay size={14} />} onClick={() => startClass(cls.id)}>
                                                Start
                                            </Button>
                                        )}
                                        {cls.status === 'LIVE' && (
                                            <>
                                                <Button size="xs" variant="filled" color="blue" leftSection={<IconExternalLink size={14} />} onClick={() => window.open(cls.meetingLink, '_blank')}>
                                                    Join
                                                </Button>
                                                <Button size="xs" variant="light" color="gray" onClick={() => markAsCompleted(cls.id)}>End</Button>
                                            </>
                                        )}
                                        <ActionIcon variant="subtle" color="blue" title="Copy link" onClick={() => copyLink(cls.meetingLink)}><IconCopy size={16} /></ActionIcon>
                                    </Group>
                                    <Group gap="xs">
                                        <ActionIcon variant="subtle" color="blue" onClick={() => openEdit(cls)}><IconEdit size={16} /></ActionIcon>
                                        <ActionIcon variant="subtle" color="red" onClick={() => confirmDelete(cls.id, cls.title)}><IconTrash size={16} /></ActionIcon>
                                    </Group>
                                </Group>
                            </Card>
                        ))}
                    </SimpleGrid>
                )}
            </Paper>

            {/* Schedule/Edit Drawer */}
            <Drawer opened={drawerOpened} onClose={closeDrawer} title={editingId ? 'Edit Live Class' : 'Schedule Live Class'} position="right" size="md">
                <form onSubmit={form.onSubmit(handleSave)}>
                    <Stack>
                        <TextInput label="Class Title" required placeholder="e.g. Form 2 Algebra Revision" {...form.getInputProps('title')} />
                        <TextInput label="Subject" required placeholder="e.g. Mathematics" {...form.getInputProps('subject')} />
                        <TextInput label="Class / Section" placeholder="e.g. Form 2 Blue" {...form.getInputProps('classSection')} />

                        <Select label="Platform" data={['Zoom', 'Google Meet', 'Microsoft Teams']} required {...form.getInputProps('platform')} />

                        <Group grow align="flex-end">
                            <TextInput label="Meeting Link" required placeholder="https://zoom.us/j/..." {...form.getInputProps('meetingLink')} style={{ flex: 1 }} />
                            <Button variant="light" onClick={generateMeetLink} mb={1}>Generate</Button>
                        </Group>
                        <TextInput label="Meeting ID" placeholder="Auto-generated" {...form.getInputProps('meetingId')} />

                        <TextInput label="Date & Time" type="datetime-local" required {...form.getInputProps('dateTime')} />
                        <NumberInput label="Duration (minutes)" min={15} max={180} required {...form.getInputProps('duration')} />

                        <Textarea label="Notes for Students" placeholder="Bring your textbooks, open page 45..." autosize minRows={2} {...form.getInputProps('notes')} />

                        <Group justify="flex-end" mt="md">
                            <Button variant="default" onClick={closeDrawer}>Cancel</Button>
                            <Button type="submit">{editingId ? 'Update' : 'Schedule Class'}</Button>
                        </Group>
                    </Stack>
                </form>
            </Drawer>

            {/* Delete Modal */}
            <Modal opened={deleteModal.opened} onClose={() => setDeleteModal({ ...deleteModal, opened: false })} title="Delete Live Class">
                <Stack>
                    <Text size="sm">Are you sure you want to delete <b>"{deleteModal.title}"</b>?</Text>
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={() => setDeleteModal({ ...deleteModal, opened: false })}>Cancel</Button>
                        <Button color="red" onClick={handleDelete}>Delete</Button>
                    </Group>
                </Stack>
            </Modal>
        </div>
    );
}
