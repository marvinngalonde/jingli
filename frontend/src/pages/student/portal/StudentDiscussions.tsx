import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import {
    Text, Card, Group, Badge, Paper, ThemeIcon, Stack, Loader, Center,
    Button, Textarea, Avatar, Divider, TextInput, SimpleGrid, Modal
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
    IconMessageCircle, IconPin, IconLock, IconSend, IconArrowLeft,
    IconSearch, IconClock, IconUsers, IconPlus,
} from '@tabler/icons-react';
import { PageHeader } from '../../../components/common/PageHeader';
import { useAuth } from '../../../context/AuthContext';

interface Reply {
    id: string;
    author: string;
    role: 'teacher' | 'student';
    content: string;
    createdAt: string;
}

interface Thread {
    id: string;
    title: string;
    body: string;
    subject: string;
    classSection: string;
    author: string;
    authorRole: 'teacher' | 'student';
    replies: Reply[];
    pinned: boolean;
    locked: boolean;
    createdAt: string;
}

export default function StudentDiscussions() {
    const { user } = useAuth();
    const [threads, setThreads] = useState<Thread[]>([]);
    const [loading, setLoading] = useState(true);
    const [active, setActive] = useState<Thread | null>(null);
    const [replyText, setReplyText] = useState('');
    const [search, setSearch] = useState('');
    const [opened, { open, close }] = useDisclosure(false);

    const threadForm = useForm({
        initialValues: { title: '', body: '', subject: '' },
        validate: { title: v => v.length < 3 ? 'Too short' : null, body: v => v.length < 5 ? 'Too short' : null },
    });

    const fetchThreads = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/discussions');
            setThreads(Array.isArray(data) ? data : []);
        } catch {
            notifications.show({ title: 'Error', message: 'Failed to load discussions', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchThreads(); }, []);

    const handleCreateThread = async (values: typeof threadForm.values) => {
        try {
            await api.post('/discussions', { ...values });
            notifications.show({ title: 'Success', message: 'Thread created!', color: 'green' });
            threadForm.reset();
            close();
            fetchThreads();
        } catch {
            notifications.show({ title: 'Error', message: 'Failed to create thread', color: 'red' });
        }
    };

    const handleReply = async () => {
        if (!active || !replyText.trim()) return;
        try {
            await api.post(`/discussions/${active.id}/replies`, { content: replyText });
            setReplyText('');
            // Refresh thread
            const { data } = await api.get(`/discussions/${active.id}`);
            setActive(data);
            fetchThreads();
        } catch {
            notifications.show({ title: 'Error', message: 'Failed to send reply', color: 'red' });
        }
    };

    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const filtered = threads.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.subject?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <Center h={400}><Loader /></Center>;

    // Thread Detail View
    if (active) {
        return (
            <div>
                <Button variant="subtle" leftSection={<IconArrowLeft size={16} />} mb="lg" onClick={() => setActive(null)}>
                    Back to Discussions
                </Button>
                <Paper withBorder radius="md" p="xl" bg="var(--app-surface)" mb="md">
                    <Group justify="space-between" mb="sm">
                        <Group>
                            {active.pinned && <Badge color="yellow" variant="light" leftSection={<IconPin size={12} />}>Pinned</Badge>}
                            {active.locked && <Badge color="gray" variant="light" leftSection={<IconLock size={12} />}>Locked</Badge>}
                        </Group>
                        <Badge variant="outline" color="grape">{active.subject || 'General'}</Badge>
                    </Group>
                    <Text fw={700} size="xl" mb="xs">{active.title}</Text>
                    <Group gap="xs" mb="md">
                        <Avatar color="blue" radius="xl" size="sm">{active.author?.[0]}</Avatar>
                        <Text size="sm" c="dimmed">{active.author} · {formatDate(active.createdAt)}</Text>
                        <Badge variant="light" color={active.authorRole === 'teacher' ? 'blue' : 'teal'} size="xs" tt="capitalize">
                            {active.authorRole}
                        </Badge>
                    </Group>
                    <Text>{active.body}</Text>
                </Paper>

                <Text fw={600} mb="sm">{active.replies?.length || 0} Replies</Text>
                <Stack gap="sm" mb="lg">
                    {(active.replies || []).map(r => (
                        <Paper key={r.id} withBorder radius="md" p="md" bg="var(--app-surface)">
                            <Group mb="xs">
                                <Avatar color={r.role === 'teacher' ? 'blue' : 'teal'} radius="xl" size="sm">{r.author?.[0]}</Avatar>
                                <div>
                                    <Text size="sm" fw={500}>{r.author}</Text>
                                    <Text size="xs" c="dimmed">{formatDate(r.createdAt)}</Text>
                                </div>
                                <Badge variant="light" color={r.role === 'teacher' ? 'blue' : 'teal'} size="xs" tt="capitalize">{r.role}</Badge>
                            </Group>
                            <Text size="sm" ml={40}>{r.content}</Text>
                        </Paper>
                    ))}
                </Stack>

                {!active.locked && (
                    <Paper withBorder radius="md" p="md" bg="var(--app-surface)">
                        <Text fw={500} mb="sm">Add a Reply</Text>
                        <Textarea
                            placeholder="Write your reply..."
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            minRows={3}
                            mb="sm"
                        />
                        <Button leftSection={<IconSend size={16} />} onClick={handleReply} disabled={!replyText.trim()}>
                            Send Reply
                        </Button>
                    </Paper>
                )}
            </div>
        );
    }

    // Thread List
    return (
        <div>
            <PageHeader
                title="Discussions"
                subtitle="Engage in class discussions with your teachers and classmates"
                actions={
                    <Button leftSection={<IconPlus size={18} />} onClick={open}>New Thread</Button>
                }
            />

            <TextInput
                placeholder="Search discussions..."
                leftSection={<IconSearch size={16} />}
                value={search}
                onChange={e => setSearch(e.target.value)}
                mb="lg"
                maw={400}
            />

            {filtered.length === 0 ? (
                <Card withBorder radius="md" p="xl" ta="center" bg="var(--app-surface)">
                    <ThemeIcon variant="light" color="gray" size={60} radius="xl" mx="auto" mb="md">
                        <IconMessageCircle size={30} />
                    </ThemeIcon>
                    <Text size="lg" fw={500}>No Discussions</Text>
                    <Text c="dimmed" mt="xs">No discussion threads found. Start one!</Text>
                </Card>
            ) : (
                <Stack gap="sm">
                    {filtered.map(t => (
                        <Paper
                            key={t.id}
                            withBorder
                            radius="md"
                            p="md"
                            bg="var(--app-surface)"
                            style={{ cursor: 'pointer', transition: 'transform 0.15s' }}
                            onClick={() => setActive(t)}
                            onMouseEnter={e => (e.currentTarget.style.transform = 'translateX(2px)')}
                            onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
                        >
                            <Group justify="space-between">
                                <Group>
                                    <ThemeIcon variant="light" color="blue" size="md" radius="md">
                                        <IconMessageCircle size={16} />
                                    </ThemeIcon>
                                    <div>
                                        <Group gap="xs">
                                            <Text fw={500} size="sm">{t.title}</Text>
                                            {t.pinned && <Badge size="xs" color="yellow">Pinned</Badge>}
                                            {t.locked && <Badge size="xs" color="gray">Locked</Badge>}
                                        </Group>
                                        <Group gap="xs">
                                            <Text size="xs" c="dimmed">{t.subject || 'General'} · {formatDate(t.createdAt)}</Text>
                                        </Group>
                                    </div>
                                </Group>
                                <Group gap="xs">
                                    <Badge variant="light" color="gray" size="sm" leftSection={<IconMessageCircle size={10} />}>
                                        {t.replies?.length || 0}
                                    </Badge>
                                    <Badge variant="light" color={t.authorRole === 'teacher' ? 'blue' : 'teal'} size="xs">
                                        {t.authorRole}
                                    </Badge>
                                </Group>
                            </Group>
                        </Paper>
                    ))}
                </Stack>
            )}

            <Modal opened={opened} onClose={close} title="Start a Discussion" size="md">
                <form onSubmit={threadForm.onSubmit(handleCreateThread)}>
                    <Stack gap="sm">
                        <TextInput label="Title" placeholder="What do you want to discuss?" {...threadForm.getInputProps('title')} />
                        <TextInput label="Subject" placeholder="e.g. Mathematics" {...threadForm.getInputProps('subject')} />
                        <Textarea label="Content" placeholder="Describe your question or topic..." minRows={4} {...threadForm.getInputProps('body')} />
                        <Group justify="flex-end">
                            <Button variant="light" onClick={close}>Cancel</Button>
                            <Button type="submit" leftSection={<IconSend size={16} />}>Post Thread</Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </div>
    );
}
