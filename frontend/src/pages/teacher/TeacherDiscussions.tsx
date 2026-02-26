import { useState } from 'react';
import { Title, Text, Paper, Group, Button, Stack, Card, Badge, Grid, ActionIcon, Tabs, ThemeIcon, SimpleGrid, Box, Avatar, Textarea, TextInput, Divider, ScrollArea, Modal, Select } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
    IconPlus, IconSearch, IconMessageCircle, IconPin, IconLock,
    IconMessage, IconUsers, IconSend, IconArrowLeft, IconClock,
} from '@tabler/icons-react';

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

let nextThreadId = 1;
let nextReplyId = 1;

const mockThreads: Thread[] = [
    {
        id: 't-1', title: 'Tips for Form 2 Mathematics Mid-Term', body: 'Hello class! Here are some tips for the upcoming mid-term:\n\n1. Review Chapter 3-5 thoroughly\n2. Practice past papers (2024 papers are available in the Content Library)\n3. Focus on algebra and geometry\n\nFeel free to ask any questions below!',
        subject: 'Mathematics', classSection: 'Form 2 Blue', author: 'Mr. Chikwanha', authorRole: 'teacher',
        replies: [
            { id: 'r-1', author: 'Takudzwa M.', role: 'student', content: 'Thank you sir! Can you also upload the 2023 past papers?', createdAt: '2026-02-25T10:30:00Z' },
            { id: 'r-2', author: 'Mr. Chikwanha', role: 'teacher', content: 'Yes, I will upload them this afternoon. Check the Content Library.', createdAt: '2026-02-25T11:00:00Z' },
        ],
        pinned: true, locked: false, createdAt: '2026-02-24T09:00:00Z',
    },
    {
        id: 't-2', title: 'Science Lab Report Format', body: 'Reminder: All lab reports must follow the standard format:\n- Title\n- Aim\n- Apparatus\n- Method\n- Observations\n- Conclusion\n\nReports not following this format will be returned.',
        subject: 'Science', classSection: 'Form 2 Red', author: 'Mrs. Dube', authorRole: 'teacher',
        replies: [{ id: 'r-3', author: 'Rudo C.', role: 'student', content: 'Is there a template we can download?', createdAt: '2026-02-25T14:00:00Z' }],
        pinned: false, locked: false, createdAt: '2026-02-25T08:00:00Z',
    },
    {
        id: 't-3', title: 'Book Club: February Read - Things Fall Apart', body: 'This month we are reading "Things Fall Apart" by Chinua Achebe. Please complete chapters 1-5 by next Monday and share your thoughts in this thread.',
        subject: 'English', classSection: 'Form 3 Green', author: 'Mr. Sibanda', authorRole: 'teacher',
        replies: [], pinned: false, locked: false, createdAt: '2026-02-23T12:00:00Z',
    },
];

export default function TeacherDiscussions() {
    const [threads, setThreads] = useState<Thread[]>(mockThreads);
    const [activeThread, setActiveThread] = useState<Thread | null>(null);
    const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
    const [search, setSearch] = useState('');
    const [filterSubject, setFilterSubject] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [createModal, setCreateModal] = useState(false);

    const threadForm = useForm({
        initialValues: { title: '', body: '', subject: '', classSection: '' },
        validate: {
            title: (v) => (!v ? 'Title required' : null),
            body: (v) => (!v ? 'Content required' : null),
            subject: (v) => (!v ? 'Subject required' : null),
        },
    });

    const handleCreateThread = (values: typeof threadForm.values) => {
        const thread: Thread = {
            id: `t-${nextThreadId++}`,
            title: values.title,
            body: values.body,
            subject: values.subject,
            classSection: values.classSection,
            author: 'You',
            authorRole: 'teacher',
            replies: [],
            pinned: false,
            locked: false,
            createdAt: new Date().toISOString(),
        };
        setThreads(prev => [thread, ...prev]);
        setCreateModal(false);
        threadForm.reset();
        notifications.show({ id: 'thread-create', title: 'Posted', message: 'Discussion thread created', color: 'green' });
    };

    const handleReply = () => {
        if (!replyText.trim() || !activeThread) return;
        const reply: Reply = {
            id: `r-${nextReplyId++}`,
            author: 'You (Teacher)',
            role: 'teacher',
            content: replyText,
            createdAt: new Date().toISOString(),
        };
        const updated = { ...activeThread, replies: [...activeThread.replies, reply] };
        setActiveThread(updated);
        setThreads(prev => prev.map(t => t.id === updated.id ? updated : t));
        setReplyText('');
    };

    const togglePin = (thread: Thread) => {
        const updated = { ...thread, pinned: !thread.pinned };
        setThreads(prev => prev.map(t => t.id === updated.id ? updated : t));
        if (activeThread?.id === updated.id) setActiveThread(updated);
        notifications.show({ id: 'pin', title: updated.pinned ? 'Pinned' : 'Unpinned', message: `Thread ${updated.pinned ? 'pinned' : 'unpinned'}`, color: 'blue' });
    };

    const toggleLock = (thread: Thread) => {
        const updated = { ...thread, locked: !thread.locked };
        setThreads(prev => prev.map(t => t.id === updated.id ? updated : t));
        if (activeThread?.id === updated.id) setActiveThread(updated);
        notifications.show({ id: 'lock', title: updated.locked ? 'Locked' : 'Unlocked', message: `Thread ${updated.locked ? 'locked' : 'unlocked'}`, color: 'orange' });
    };

    const uniqueSubjects = [...new Set(threads.map(t => t.subject))];
    const filtered = threads.filter(t => {
        if (filterSubject && t.subject !== filterSubject) return false;
        return t.title.toLowerCase().includes(search.toLowerCase());
    }).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    // ─── Thread Detail View ───
    if (activeThread) {
        return (
            <div>
                <Group mb="lg">
                    <Button variant="subtle" leftSection={<IconArrowLeft size={16} />} onClick={() => setActiveThread(null)}>Back</Button>
                </Group>

                <Paper p="xl" radius="md" shadow="sm" withBorder mb="md">
                    <Group justify="space-between" mb="md">
                        <div>
                            <Group gap="xs" mb="xs">
                                {activeThread.pinned && <Badge size="xs" color="blue" leftSection={<IconPin size={10} />}>Pinned</Badge>}
                                {activeThread.locked && <Badge size="xs" color="red" leftSection={<IconLock size={10} />}>Locked</Badge>}
                                <Badge size="xs" variant="light">{activeThread.subject}</Badge>
                                {activeThread.classSection && <Badge size="xs" variant="outline">{activeThread.classSection}</Badge>}
                            </Group>
                            <Title order={3}>{activeThread.title}</Title>
                        </div>
                        <Group gap="xs">
                            <ActionIcon variant="subtle" color="blue" onClick={() => togglePin(activeThread)} title={activeThread.pinned ? 'Unpin' : 'Pin'}>
                                <IconPin size={16} />
                            </ActionIcon>
                            <ActionIcon variant="subtle" color="orange" onClick={() => toggleLock(activeThread)} title={activeThread.locked ? 'Unlock' : 'Lock'}>
                                <IconLock size={16} />
                            </ActionIcon>
                        </Group>
                    </Group>

                    <Group gap="xs" mb="md">
                        <Avatar size={28} radius="xl" color={activeThread.authorRole === 'teacher' ? 'brand' : 'gray'}>
                            {activeThread.author[0]}
                        </Avatar>
                        <Text size="sm" fw={600}>{activeThread.author}</Text>
                        <Badge size="xs" color={activeThread.authorRole === 'teacher' ? 'brand' : 'gray'}>{activeThread.authorRole}</Badge>
                        <Text size="xs" c="dimmed">{formatDate(activeThread.createdAt)}</Text>
                    </Group>

                    <Text style={{ whiteSpace: 'pre-wrap' }}>{activeThread.body}</Text>
                </Paper>

                {/* Replies */}
                <Text fw={600} mb="sm">{activeThread.replies.length} Replies</Text>
                <Stack gap="sm" mb="lg">
                    {activeThread.replies.map(reply => (
                        <Paper key={reply.id} p="md" radius="md" withBorder style={{
                            borderLeft: `3px solid var(--mantine-color-${reply.role === 'teacher' ? 'brand' : 'gray'}-4)`,
                        }}>
                            <Group gap="xs" mb="xs">
                                <Avatar size={24} radius="xl" color={reply.role === 'teacher' ? 'brand' : 'gray'}>
                                    {reply.author[0]}
                                </Avatar>
                                <Text size="sm" fw={600}>{reply.author}</Text>
                                <Badge size="xs" color={reply.role === 'teacher' ? 'brand' : 'gray'}>{reply.role}</Badge>
                                <Text size="xs" c="dimmed">{formatDate(reply.createdAt)}</Text>
                            </Group>
                            <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{reply.content}</Text>
                        </Paper>
                    ))}
                </Stack>

                {/* Reply Input */}
                {!activeThread.locked ? (
                    <Paper p="md" radius="md" withBorder>
                        <Textarea
                            placeholder="Write a reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            autosize
                            minRows={2}
                            mb="sm"
                        />
                        <Group justify="flex-end">
                            <Button leftSection={<IconSend size={16} />} onClick={handleReply} disabled={!replyText.trim()}>Reply</Button>
                        </Group>
                    </Paper>
                ) : (
                    <Paper p="md" radius="md" withBorder style={{ background: 'var(--mantine-color-gray-0)' }}>
                        <Group justify="center" gap="xs">
                            <IconLock size={16} color="gray" />
                            <Text c="dimmed" size="sm">This thread is locked. No new replies can be added.</Text>
                        </Group>
                    </Paper>
                )}
            </div>
        );
    }

    // ─── Thread List ───
    return (
        <div>
            <Group justify="space-between" mb="lg">
                <div>
                    <Title order={2}>Discussions</Title>
                    <Text c="dimmed" size="sm">Subject-based forums for teacher-student communication</Text>
                </div>
                <Button leftSection={<IconPlus size={16} />} onClick={() => setCreateModal(true)}>New Discussion</Button>
            </Group>

            <SimpleGrid cols={{ base: 2, md: 3 }} mb="lg">
                <Card shadow="sm" radius="md" p="md" withBorder>
                    <Group justify="space-between" mb="xs"><Text size="sm" c="dimmed" fw={500}>Total Threads</Text><ThemeIcon variant="light" color="violet"><IconMessageCircle size={16} /></ThemeIcon></Group>
                    <Text fw={700} size="xl">{threads.length}</Text>
                </Card>
                <Card shadow="sm" radius="md" p="md" withBorder>
                    <Group justify="space-between" mb="xs"><Text size="sm" c="dimmed" fw={500}>Total Replies</Text><ThemeIcon variant="light" color="blue"><IconMessage size={16} /></ThemeIcon></Group>
                    <Text fw={700} size="xl">{threads.reduce((a, t) => a + t.replies.length, 0)}</Text>
                </Card>
                <Card shadow="sm" radius="md" p="md" withBorder>
                    <Group justify="space-between" mb="xs"><Text size="sm" c="dimmed" fw={500}>Active Participants</Text><ThemeIcon variant="light" color="green"><IconUsers size={16} /></ThemeIcon></Group>
                    <Text fw={700} size="xl">{new Set(threads.flatMap(t => [t.author, ...t.replies.map(r => r.author)])).size}</Text>
                </Card>
            </SimpleGrid>

            <Paper p="lg" radius="md" shadow="sm" withBorder>
                <Group justify="space-between" mb="md">
                    <TextInput placeholder="Search discussions..." leftSection={<IconSearch size={16} />} value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 300 }} />
                    <Select placeholder="Subject" data={uniqueSubjects} value={filterSubject} onChange={setFilterSubject} clearable style={{ width: 160 }} />
                </Group>

                {filtered.length === 0 ? (
                    <Stack align="center" py="xl" gap="xs">
                        <IconMessageCircle size={40} color="var(--mantine-color-gray-4)" />
                        <Text c="dimmed">No discussions yet. Start a conversation!</Text>
                    </Stack>
                ) : (
                    <Stack gap="sm">
                        {filtered.map(thread => (
                            <Paper
                                key={thread.id}
                                p="md"
                                withBorder
                                radius="md"
                                onClick={() => setActiveThread(thread)}
                                style={{
                                    cursor: 'pointer',
                                    borderLeft: thread.pinned ? '3px solid var(--mantine-color-blue-5)' : undefined,
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--mantine-color-gray-0)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = ''}
                            >
                                <Group justify="space-between">
                                    <div style={{ flex: 1 }}>
                                        <Group gap="xs" mb={4}>
                                            {thread.pinned && <Badge size="xs" color="blue" variant="light">📌 Pinned</Badge>}
                                            {thread.locked && <Badge size="xs" color="red" variant="light">🔒 Locked</Badge>}
                                            <Badge size="xs" variant="light">{thread.subject}</Badge>
                                            {thread.classSection && <Badge size="xs" variant="outline">{thread.classSection}</Badge>}
                                        </Group>
                                        <Text fw={600} mb={2}>{thread.title}</Text>
                                        <Text size="xs" c="dimmed" lineClamp={1}>{thread.body}</Text>
                                    </div>
                                    <Stack align="flex-end" gap={4}>
                                        <Group gap={4}>
                                            <IconMessageCircle size={14} color="gray" />
                                            <Text size="xs" c="dimmed">{thread.replies.length}</Text>
                                        </Group>
                                        <Group gap={4}>
                                            <IconClock size={14} color="gray" />
                                            <Text size="xs" c="dimmed">{formatDate(thread.createdAt)}</Text>
                                        </Group>
                                        <Text size="xs" c="dimmed">by {thread.author}</Text>
                                    </Stack>
                                </Group>
                            </Paper>
                        ))}
                    </Stack>
                )}
            </Paper>

            {/* Create Thread Modal */}
            <Modal opened={createModal} onClose={() => setCreateModal(false)} title="New Discussion Thread" size="lg">
                <form onSubmit={threadForm.onSubmit(handleCreateThread)}>
                    <Stack>
                        <TextInput label="Title" required placeholder="e.g. Tips for Mid-Term Exam" {...threadForm.getInputProps('title')} />
                        <Group grow>
                            <TextInput label="Subject" required placeholder="e.g. Mathematics" {...threadForm.getInputProps('subject')} />
                            <TextInput label="Class / Section" placeholder="e.g. Form 2 Blue" {...threadForm.getInputProps('classSection')} />
                        </Group>
                        <Textarea label="Content" required autosize minRows={4} placeholder="Write your discussion post..." {...threadForm.getInputProps('body')} />
                        <Group justify="flex-end" mt="md">
                            <Button variant="default" onClick={() => setCreateModal(false)}>Cancel</Button>
                            <Button type="submit">Post Discussion</Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </div>
    );
}
