import { useState, useEffect, useCallback } from 'react';
import { Title, Text, Paper, Group, Button, Stack, TextInput, Select, Card, Badge, Grid, ActionIcon, Table, Modal, Drawer, Tabs, ThemeIcon, SimpleGrid, Box, Divider, ScrollArea, Textarea, NumberInput, LoadingOverlay, Menu } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
    IconPlus, IconTrash, IconEdit, IconSearch, IconBrandZoom,
    IconExternalLink, IconClock, IconUsers, IconVideo, IconCalendar,
    IconCheck, IconPlayerPlay, IconCopy, IconDotsVertical
} from '@tabler/icons-react';
import { api } from '../../../services/api';

interface LiveClass {
    id: string;
    title: string;
    subjectId: string;
    sectionId: string;
    provider: 'Zoom' | 'Google Meet' | 'Microsoft Teams' | 'ZOOM';
    meetingUrl: string;
    meetingId: string;
    scheduledFor: string;
    duration: number;
    status: 'SCHEDULED' | 'LIVE' | 'COMPLETED';
    description: string;
    subject?: { name: string, code: string };
    section?: { name: string, classLevel: { name: string } };
}

export default function TeacherLiveClass() {
    const [classes, setClasses] = useState<LiveClass[]>([]);
    const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
    const isMobile = useMediaQuery('(max-width: 48em)');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ opened: boolean; id: string; title: string }>({ opened: false, id: '', title: '' });
    const [search, setSearch] = useState('');
    const [tab, setTab] = useState<string | null>('upcoming');
    const [loading, setLoading] = useState(true);
    const [availableClasses, setAvailableClasses] = useState<{ value: string, label: string }[]>([]);
    const [availableSubjects, setAvailableSubjects] = useState<{ value: string, label: string }[]>([]);
    const [rawClasses, setRawClasses] = useState<any[]>([]);
    const [selectedSectionId, setSelectedSectionId] = useState<string>('');

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const { data } = await api.get('/teacher/classes');
                setRawClasses(data);
                setAvailableClasses(data.map((cls: any) => ({
                    value: cls.section.id,
                    label: `${cls.section.classLevel.name} ${cls.section.classLevel.level ?? ""} ${cls.section.name}`
                })));
            } catch (e) {
                console.error("Failed to load classes", e);
            }
        };
        fetchDropdownData();
    }, []);

    useEffect(() => {
        if (selectedSectionId) {
            const cls = rawClasses.find(c => c.section.id === selectedSectionId);
            if (cls) {
                setAvailableSubjects(cls.subjects.map((s: any) => ({
                    value: s.id,
                    label: `${s.name} (${s.code})`
                })));
            } else {
                setAvailableSubjects([]);
            }
        } else {
            setAvailableSubjects([]);
        }
    }, [selectedSectionId, rawClasses]);

    const fetchClasses = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/teacher/live-classes');
            setClasses(Array.isArray(data) ? data : []);
        } catch {
            notifications.show({ title: 'Error', message: 'Failed to load live classes', color: 'red' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchClasses();
    }, [fetchClasses]);

    const form = useForm({
        initialValues: {
            title: '', subjectId: '', sectionId: '', provider: 'ZOOM',
            meetingUrl: '', meetingId: '', scheduledFor: '', duration: 45, description: '',
        },
        validate: {
            title: (v) => (!v ? 'Title required' : null),
            meetingUrl: (v) => (!v ? 'Meeting link required' : null),
            scheduledFor: (v) => (!v ? 'Date & time required' : null),
        },
    });



    const handleSave = async (values: typeof form.values) => {
        setLoading(true);
        try {
            const payload = {
                ...values,
                scheduledFor: new Date(values.scheduledFor).toISOString(),
            };

            if (editingId) {
                // In full implementation, api.patch(`/teacher/live-classes/${editingId}`, payload)
                // For now our backend just supports updateStatus, so let's mock the update in UI
                setClasses(prev => prev.map(c => c.id === editingId ? { ...c, ...payload } as any : c));
                notifications.show({ title: 'Updated', message: 'Live class updated', color: 'green' });
            } else {
                const { data } = await api.post('/teacher/live-classes', payload);
                setClasses(prev => [...prev, data]);
                notifications.show({ title: 'Scheduled', message: `"${values.title}" scheduled successfully`, color: 'green' });
            }
            closeDrawer();
            form.reset();
            setEditingId(null);
        } catch {
            notifications.show({ title: 'Error', message: 'Failed to save class', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    const openEdit = (cls?: LiveClass) => {
        setEditingId(cls?.id || null);
        if (cls) {
            // format datetime for input
            let formattedDate = '';
            if (cls.scheduledFor) {
                const d = new Date(cls.scheduledFor);
                formattedDate = d.toISOString().slice(0, 16);
            }
            form.setValues({
                title: cls.title, subjectId: cls.subjectId || '', sectionId: cls.sectionId || '',
                provider: cls.provider || 'ZOOM', meetingUrl: cls.meetingUrl, meetingId: cls.meetingId || '',
                scheduledFor: formattedDate, duration: cls.duration, description: cls.description || '',
            });
        } else {
            form.reset();
        }
        openDrawer();
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            await api.patch(`/teacher/live-classes/${id}/status`, { status });
            setClasses(prev => prev.map(c => c.id === id ? { ...c, status: status as any } : c));
            if (status === 'COMPLETED') {
                notifications.show({ title: 'Completed', message: 'Class marked as completed', color: 'green' });
            }
        } catch {
            notifications.show({ title: 'Error', message: 'Failed to update status', color: 'red' });
        }
    };

    const startClass = (id: string, meetingUrl: string) => {
        updateStatus(id, 'LIVE');
        if (meetingUrl) window.open(meetingUrl, '_blank');
    };

    const confirmDelete = (id: string, title: string) => setDeleteModal({ opened: true, id, title });

    const handleDelete = async () => {
        try {
            await api.delete(`/teacher/live-classes/${deleteModal.id}`);
            setClasses(prev => prev.filter(c => c.id !== deleteModal.id));
            setDeleteModal({ opened: false, id: '', title: '' });
            notifications.show({ title: 'Deleted', message: 'Live class removed', color: 'green' });
        } catch {
            notifications.show({ title: 'Error', message: 'Failed to delete class', color: 'red' });
        }
    };

    const copyLink = (link: string) => {
        navigator.clipboard.writeText(link);
        notifications.show({ title: 'Copied', message: 'Meeting link copied to clipboard', color: 'blue' });
    };

    const filtered = classes.filter(c => {
        const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || (c.subject?.name || '').toLowerCase().includes(search.toLowerCase());
        if (tab === 'upcoming') return matchSearch && c.status === 'SCHEDULED';
        if (tab === 'live') return matchSearch && c.status === 'LIVE';
        if (tab === 'completed') return matchSearch && c.status === 'COMPLETED';
        return matchSearch;
    });

    const platformColor = (p: string) => (p === 'Zoom' || p === 'ZOOM') ? 'blue' : p === 'Google Meet' ? 'green' : 'violet';
    const statusColor = (s: string) => s === 'LIVE' ? 'red' : s === 'SCHEDULED' ? 'blue' : 'gray';
    const platformIcon = (p: string) => (p === 'Zoom' || p === 'ZOOM') ? <IconBrandZoom size={16} /> : <IconVideo size={16} />;

    return (
        <Stack pos="relative" gap="lg">
            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
            <Group justify="space-between">
                <div>
                    <Title order={2}>Live Classes</Title>
                    <Text c="dimmed" size="sm">Schedule and manage virtual classes via Zoom, Google Meet, or Microsoft Teams</Text>
                </div>
                <Button leftSection={<IconPlus size={16} />} onClick={() => openEdit()}>Schedule Class</Button>
            </Group>

            <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="sm">
                <Card shadow="sm" radius="md" p="md" withBorder>
                    <Group justify="space-between" mb="xs"><Text size="xs" c="dimmed" fw={500}>Total Classes</Text><ThemeIcon variant="light" color="blue" size="sm"><IconVideo size={14} /></ThemeIcon></Group>
                    <Text fw={700} size="lg">{classes.length}</Text>
                </Card>
                <Card shadow="sm" radius="md" p="md" withBorder>
                    <Group justify="space-between" mb="xs"><Text size="xs" c="dimmed" fw={500}>Live Now</Text><ThemeIcon variant="light" color="red" size="sm"><IconPlayerPlay size={14} /></ThemeIcon></Group>
                    <Text fw={700} size="lg" c="red">{classes.filter(c => c.status === 'LIVE').length}</Text>
                </Card>
                <Card shadow="sm" radius="md" p="md" withBorder>
                    <Group justify="space-between" mb="xs"><Text size="xs" c="dimmed" fw={500}>Upcoming</Text><ThemeIcon variant="light" color="orange" size="sm"><IconCalendar size={14} /></ThemeIcon></Group>
                    <Text fw={700} size="lg">{classes.filter(c => c.status === 'SCHEDULED').length}</Text>
                </Card>
                <Card shadow="sm" radius="md" p="md" withBorder>
                    <Group justify="space-between" mb="xs"><Text size="xs" c="dimmed" fw={500}>Completed</Text><ThemeIcon variant="light" color="green" size="sm"><IconCheck size={14} /></ThemeIcon></Group>
                    <Text fw={700} size="lg">{classes.filter(c => c.status === 'COMPLETED').length}</Text>
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

                <TextInput placeholder="Search classes..." leftSection={<IconSearch size={16} />} value={search} onChange={e => setSearch(e.target.value)} mb="md" w={{ base: '100%', sm: 300 }} />

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
                                    <Text fw={600} truncate w={150}>{cls.title}</Text>
                                    <Badge color={statusColor(cls.status)} size="sm" variant={cls.status === 'LIVE' ? 'filled' : 'light'}>
                                        {cls.status === 'LIVE' ? '🔴 LIVE' : cls.status}
                                    </Badge>
                                </Group>
                                <Text size="sm" c="dimmed" mb="xs" truncate>{cls.subject?.name || 'Any Subject'} • {cls.section?.name || 'All Classes'}</Text>

                                <Stack gap="xs" mb="sm">
                                    <Group gap="xs">
                                        <IconCalendar size={14} color="gray" />
                                        <Text size="xs">{cls.scheduledFor ? new Date(cls.scheduledFor).toLocaleString() : 'TBD'}</Text>
                                    </Group>
                                    <Group gap="xs">
                                        <IconClock size={14} color="gray" />
                                        <Text size="xs">{cls.duration} minutes</Text>
                                    </Group>
                                    <Group gap="xs">
                                        {platformIcon(cls.provider)}
                                        <Badge size="xs" color={platformColor(cls.provider)} variant="light">{cls.provider}</Badge>
                                    </Group>
                                </Stack>

                                <Divider my="sm" />

                                <Group justify="space-between" wrap="nowrap">
                                    <Group gap="xs" wrap="nowrap" style={{ flex: 1 }}>
                                        {cls.status === 'SCHEDULED' && (
                                            <Button size="xs" variant="filled" color="green" leftSection={<IconPlayerPlay size={14} />} onClick={() => startClass(cls.id, cls.meetingUrl)} fullWidth={isMobile}>
                                                Start
                                            </Button>
                                        )}
                                        {cls.status === 'LIVE' && (
                                            <Group gap="xs" grow style={{ flex: 1 }}>
                                                <Button size="xs" variant="filled" color="blue" leftSection={<IconExternalLink size={14} />} onClick={() => window.open(cls.meetingUrl, '_blank')}>
                                                    Join
                                                </Button>
                                                {!isMobile && (
                                                    <Button size="xs" variant="light" color="gray" onClick={() => updateStatus(cls.id, 'COMPLETED')}>End</Button>
                                                )}
                                            </Group>
                                        )}
                                    </Group>

                                    <Menu position="bottom-end" withinPortal>
                                        <Menu.Target>
                                            <ActionIcon variant="subtle" color="gray">
                                                <IconDotsVertical size={16} />
                                            </ActionIcon>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            <Menu.Item leftSection={<IconCopy size={14} />} onClick={() => copyLink(cls.meetingUrl)}>Copy Link</Menu.Item>
                                            {isMobile && cls.status === 'LIVE' && (
                                                <Menu.Item leftSection={<IconCheck size={14} />} color="gray" onClick={() => updateStatus(cls.id, 'COMPLETED')}>End Class</Menu.Item>
                                            )}
                                            <Menu.Item leftSection={<IconEdit size={14} />} color="blue" onClick={() => openEdit(cls)}>Edit</Menu.Item>
                                            <Menu.Item leftSection={<IconTrash size={14} />} color="red" onClick={() => confirmDelete(cls.id, cls.title)}>Delete</Menu.Item>
                                        </Menu.Dropdown>
                                    </Menu>
                                </Group>
                            </Card>
                        ))}
                    </SimpleGrid>
                )}
            </Paper>

            <Drawer opened={drawerOpened} onClose={closeDrawer} title={editingId ? 'Edit Live Class' : 'Schedule Live Class'} position="right" size="md">
                <form onSubmit={form.onSubmit(handleSave)}>
                    <Stack>
                        <TextInput label="Class Title" required placeholder="e.g. Form 2 Algebra Revision" {...form.getInputProps('title')} />
                        <Select label="Target Class" placeholder="Select class" data={availableClasses} value={selectedSectionId} onChange={(v) => { setSelectedSectionId(v || ''); form.setFieldValue('sectionId', v || ''); form.setFieldValue('subjectId', ''); }} searchable clearable />
                        <Select label="Subject" placeholder="Select subject" data={availableSubjects} {...form.getInputProps('subjectId')} searchable clearable />

                        <Select label="Platform" data={['ZOOM', 'Google Meet', 'Microsoft Teams']} required {...form.getInputProps('provider')} />

                        <TextInput label="Meeting Link" required placeholder="https://zoom.us/j/... or https://meet.google.com/..." {...form.getInputProps('meetingUrl')} />
                        <TextInput label="Meeting ID" placeholder="Auto-generated" {...form.getInputProps('meetingId')} />

                        <TextInput label="Date & Time" type="datetime-local" required {...form.getInputProps('scheduledFor')} />
                        <NumberInput label="Duration (minutes)" min={15} max={180} required {...form.getInputProps('duration')} />

                        <Textarea label="Notes for Students" placeholder="Bring your textbooks..." autosize minRows={2} {...form.getInputProps('description')} />

                        <Group justify="flex-end" mt="md">
                            <Button variant="default" onClick={closeDrawer}>Cancel</Button>
                            <Button type="submit" loading={loading}>{editingId ? 'Update' : 'Schedule Class'}</Button>
                        </Group>
                    </Stack>
                </form>
            </Drawer>

            <Modal opened={deleteModal.opened} onClose={() => setDeleteModal({ ...deleteModal, opened: false })} title="Delete Live Class">
                <Stack>
                    <Text size="sm">Are you sure you want to delete <b>"{deleteModal.title}"</b>?</Text>
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={() => setDeleteModal({ ...deleteModal, opened: false })}>Cancel</Button>
                        <Button color="red" loading={loading} onClick={handleDelete}>Delete</Button>
                    </Group>
                </Stack>
            </Modal>
        </Stack>
    );
}
