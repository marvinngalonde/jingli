import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import {
    Text, Card, Group, Badge, Paper, ThemeIcon, Stack, Loader, Center,
    Button, Avatar, SimpleGrid, Table, Anchor, ActionIcon, Tooltip, Box
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
    IconVideo, IconBrandZoom, IconExternalLink, IconClock,
    IconCalendar, IconPlayerPlay, IconCheck, IconUsers,
} from '@tabler/icons-react';
import { PageHeader } from '../../../components/common/PageHeader';
import { format, isPast } from 'date-fns';

interface LiveClass {
    id: string;
    title: string;
    provider: string;
    meetingUrl: string;
    meetingId: string;
    scheduledFor: string;
    duration: number;
    status: 'SCHEDULED' | 'LIVE' | 'COMPLETED';
    description: string;
    subject?: { name: string; code: string };
    section?: { name: string; classLevel: { name: string } };
}

const platformColor = (p: string) =>
    p?.includes('Zoom') ? 'blue' : p?.includes('Meet') ? 'green' : p?.includes('Teams') ? 'indigo' : 'gray';

const statusColor = (s: string) =>
    s === 'LIVE' ? 'green' : s === 'SCHEDULED' ? 'blue' : 'gray';

export default function StudentLiveClasses() {
    const isMobile = useMediaQuery('(max-width: 48em)');
    const [classes, setClasses] = useState<LiveClass[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await api.get('/student/live-classes');
                setClasses(Array.isArray(data) ? data : []);
            } catch {
                notifications.show({ title: 'Error', message: 'Failed to load live classes', color: 'red' });
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    if (loading) return <Center h={400}><Loader /></Center>;

    const upcoming = classes.filter(c => c.status === 'SCHEDULED' || c.status === 'LIVE');
    const past = classes.filter(c => c.status === 'COMPLETED');

    const joinClass = (meetingUrl: string) => window.open(meetingUrl, '_blank');

    const ClassCard = ({ cls }: { cls: LiveClass }) => (
        <Card withBorder radius="md" p="lg" shadow="sm" bg="var(--app-surface)">
            <Group justify="space-between" mb="sm">
                <Group>
                    <ThemeIcon variant="light" color={platformColor(cls.provider)} size="lg" radius="md">
                        <IconVideo size={20} />
                    </ThemeIcon>
                    <div>
                        <Text fw={600} size="sm">{cls.title}</Text>
                        <Text size="xs" c="dimmed">{cls.subject?.name || '—'}</Text>
                    </div>
                </Group>
                <Badge color={statusColor(cls.status)} variant={cls.status === 'LIVE' ? 'filled' : 'light'}>
                    {cls.status === 'LIVE' ? '● LIVE' : cls.status}
                </Badge>
            </Group>

            <Group gap="sm" mb="md">
                <Badge variant="outline" color={platformColor(cls.provider)} size="sm">
                    {cls.provider}
                </Badge>
                <Group gap={4}>
                    <IconClock size={13} color="var(--mantine-color-dimmed)" />
                    <Text size="xs" c="dimmed">{cls.duration} min</Text>
                </Group>
                <Group gap={4}>
                    <IconCalendar size={13} color="var(--mantine-color-dimmed)" />
                    <Text size="xs" c="dimmed">
                        {format(new Date(cls.scheduledFor), 'dd MMM, h:mm a')}
                    </Text>
                </Group>
            </Group>

            {cls.description && <Text size="xs" c="dimmed" lineClamp={2} mb="md">{cls.description}</Text>}

            <Button
                fullWidth
                color={cls.status === 'LIVE' ? 'green' : 'blue'}
                leftSection={cls.status === 'LIVE' ? <IconPlayerPlay size={16} /> : <IconExternalLink size={16} />}
                disabled={cls.status === 'COMPLETED'}
                onClick={() => joinClass(cls.meetingUrl)}
            >
                {cls.status === 'LIVE' ? 'Join Now' : cls.status === 'COMPLETED' ? 'Ended' : 'Join Class'}
            </Button>
        </Card>
    );

    return (
        <div>
            <PageHeader
                title="Live Classes"
                subtitle="Join scheduled online classes with your teachers"
            />

            {upcoming.length === 0 && past.length === 0 ? (
                <Card withBorder radius="md" p="xl" ta="center" bg="var(--app-surface)">
                    <ThemeIcon variant="light" color="gray" size={60} radius="xl" mx="auto" mb="md">
                        <IconVideo size={30} />
                    </ThemeIcon>
                    <Text size="lg" fw={500}>No Live Classes</Text>
                    <Text c="dimmed" mt="xs">Your teachers haven't scheduled any live classes yet.</Text>
                </Card>
            ) : (
                <Stack gap="xl">
                    {upcoming.length > 0 && (
                        <div>
                            <Text fw={700} size="sm" tt="uppercase" c="dimmed" mb="sm">Upcoming & Live</Text>
                            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
                                {upcoming.map(c => <ClassCard key={c.id} cls={c} />)}
                            </SimpleGrid>
                        </div>
                    )}
                    {past.length > 0 && (
                        <div>
                            <Text fw={700} size="sm" tt="uppercase" c="dimmed" mb="sm">Past Classes</Text>
                            {isMobile ? (
                                <Stack gap="sm">
                                    {past.map(c => (
                                        <Card key={c.id} withBorder radius="md" p="sm">
                                            <Group justify="space-between" mb="xs">
                                                <Text size="sm" fw={600}>{c.title}</Text>
                                                <Badge variant="outline" color="grape" size="xs">{c.subject?.code || '—'}</Badge>
                                            </Group>
                                            <Group gap="xs">
                                                <Badge variant="light" color={platformColor(c.provider)} size="xs">{c.provider}</Badge>
                                                <Text size="xs" c="dimmed">{format(new Date(c.scheduledFor), 'dd MMM yyyy')}</Text>
                                            </Group>
                                        </Card>
                                    ))}
                                </Stack>
                            ) : (
                                <Paper withBorder radius="md" bg="var(--app-surface)" p={0}>
                                    <Table striped highlightOnHover>
                                        <Table.Thead>
                                            <Table.Tr>
                                                <Table.Th>Title</Table.Th>
                                                <Table.Th>Subject</Table.Th>
                                                <Table.Th>Platform</Table.Th>
                                                <Table.Th>Date</Table.Th>
                                                <Table.Th>Duration</Table.Th>
                                            </Table.Tr>
                                        </Table.Thead>
                                        <Table.Tbody>
                                            {past.map(c => (
                                                <Table.Tr key={c.id}>
                                                    <Table.Td><Text size="sm" fw={500}>{c.title}</Text></Table.Td>
                                                    <Table.Td><Badge variant="outline" color="grape" size="sm">{c.subject?.code || '—'}</Badge></Table.Td>
                                                    <Table.Td><Badge variant="light" color={platformColor(c.provider)} size="sm">{c.provider}</Badge></Table.Td>
                                                    <Table.Td><Text size="sm" c="dimmed">{format(new Date(c.scheduledFor), 'dd MMM yyyy')}</Text></Table.Td>
                                                    <Table.Td><Text size="sm" c="dimmed">{c.duration} min</Text></Table.Td>
                                                </Table.Tr>
                                            ))}
                                        </Table.Tbody>
                                    </Table>
                                </Paper>
                            )}
                        </div>
                    )}
                </Stack>
            )}
        </div>
    );
}
