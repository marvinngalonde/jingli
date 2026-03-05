import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import {
    Text, Card, Group, Badge, Paper, ThemeIcon, Stack, Loader, Center,
    SimpleGrid, Table, Select
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
    IconVideo, IconClock, IconCalendar, IconUsers
} from '@tabler/icons-react';
import { PageHeader } from '../../../components/common/PageHeader';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';

interface LiveClass {
    id: string;
    title: string;
    provider: string;
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

export default function ParentPortalLiveClasses() {
    const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

    const { data: childrenData, isLoading: loadingChildren } = useQuery({
        queryKey: ['parentChildren'],
        queryFn: async () => {
            const res = await api.get('/parent/children');
            return res.data;
        }
    });

    const children = childrenData || [];

    useEffect(() => {
        if (children.length > 0 && !selectedChildId) {
            setSelectedChildId(children[0].id);
        }
    }, [children, selectedChildId]);

    const { data: classesData = [], isLoading: loadingClasses } = useQuery({
        queryKey: ['parentChildLiveClasses', selectedChildId],
        queryFn: async () => {
            if (!selectedChildId) return [];
            try {
                const { data } = await api.get(`/parent/children/${selectedChildId}/live-classes`);
                return Array.isArray(data) ? data : [];
            } catch {
                notifications.show({ title: 'Error', message: 'Failed to load live classes', color: 'red' });
                return [];
            }
        },
        enabled: !!selectedChildId,
        retry: false
    });

    const loading = loadingChildren || (!!selectedChildId && loadingClasses);
    if (loading) return <Center h={400}><Loader /></Center>;

    const classes: LiveClass[] = classesData;
    const upcoming = classes.filter(c => c.status === 'SCHEDULED' || c.status === 'LIVE');
    const past = classes.filter(c => c.status === 'COMPLETED');

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
        </Card>
    );

    return (
        <Stack gap="lg">
            <Group justify="space-between" align="flex-start">
                <PageHeader
                    title="Live Classes Schedule"
                    subtitle="Monitor upcoming online classes for your child."
                />

                {children.length > 0 && (
                    <Select
                        leftSection={<IconUsers size={16} />}
                        placeholder="Select Child"
                        data={children.map((c: any) => ({ value: c.id, label: `${c.firstName} ${c.lastName}` }))}
                        value={selectedChildId}
                        onChange={setSelectedChildId}
                        style={{ width: 250 }}
                    />
                )}
            </Group>

            {upcoming.length === 0 && past.length === 0 ? (
                <Card withBorder radius="md" p="xl" ta="center" bg="var(--app-surface)">
                    <ThemeIcon variant="light" color="gray" size={60} radius="xl" mx="auto" mb="md">
                        <IconVideo size={30} />
                    </ThemeIcon>
                    <Text size="lg" fw={500}>No Live Classes</Text>
                    <Text c="dimmed" mt="xs">Your child has no scheduled live classes.</Text>
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
                        </div>
                    )}
                </Stack>
            )}
        </Stack>
    );
}
