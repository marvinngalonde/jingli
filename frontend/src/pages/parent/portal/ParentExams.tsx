import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Text, Badge, Group, Paper, Loader, Center, Card, ThemeIcon, SimpleGrid, Table, Stack, Tabs, Divider, Select } from '@mantine/core';
import { IconCalendar, IconClock, IconBook, IconUsers } from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';
import { api } from '../../../services/api';
import { PageHeader } from '../../../components/common/PageHeader';
import { ExamTimetableGrid } from '../../../components/timetable/ExamTimetableGrid';

interface ExamInfo {
    id: string;
    name: string;
    term: { name: string };
    date: string;
    maxMarks: number;
    type: string;
    classLevel?: { name: string; level?: string | number };
    subject?: { name: string; code: string };
}

export default function ParentExams() {
    const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string | null>('schedule');
    const isMobile = useMediaQuery('(max-width: 48em)');

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

    const { data: exams = [], isLoading: loadingExams } = useQuery<ExamInfo[]>({
        queryKey: ['parentChildExams', selectedChildId],
        queryFn: async () => {
            if (!selectedChildId) return [];
            const res = await api.get(`/parent/children/${selectedChildId}/exams`);
            return res.data || [];
        },
        enabled: !!selectedChildId,
        retry: false
    });

    const loading = loadingChildren || (!!selectedChildId && loadingExams);

    if (loading && !exams.length) return <Center h={400}><Loader /></Center>;

    const upcomingExams = exams.filter(e => new Date(e.date) >= new Date(new Date().setHours(0, 0, 0, 0)));
    const pastExams = exams.filter(e => new Date(e.date) < new Date(new Date().setHours(0, 0, 0, 0)));

    const formatDate = (d: string) => {
        try { return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); }
        catch { return d; }
    };

    const ExamTable = ({ data, label }: { data: ExamInfo[]; label: string }) => (
        <Paper withBorder radius="md" bg="var(--app-surface)" p={0}>
            <Group px="lg" py="sm" bg="var(--app-surface-dim)" style={{ borderBottom: '1px solid var(--app-border-light)', borderRadius: 'var(--mantine-radius-md) var(--mantine-radius-md) 0 0' }}>
                <IconCalendar size={18} />
                <Text fw={600}>{label}</Text>
                <Badge variant="light" color="blue" ml="auto">{data.length}</Badge>
            </Group>
            {data.length === 0 ? (
                <Text c="dimmed" ta="center" py="xl">No exams</Text>
            ) : isMobile ? (
                <Stack gap="xs" p="sm">
                    {data.map((exam) => (
                        <Card key={exam.id} withBorder radius="md" p="md">
                            <Group justify="space-between" mb="xs">
                                <Text fw={600} size="sm">{exam.name}</Text>
                                <Badge variant="light" color={exam.type === 'MIDTERM' ? 'blue' : exam.type === 'FINAL' ? 'red' : 'gray'} size="xs">
                                    {exam.type}
                                </Badge>
                            </Group>
                            <Group gap="xs" mb="xs">
                                <Badge variant="light" color="indigo" size="xs">{`${exam.classLevel?.name || ''} ${exam.classLevel?.level || ''}`.trim() || '—'}</Badge>
                                <Badge variant="outline" color="grape" size="xs">{exam.subject?.code || '—'}</Badge>
                                <Text size="xs">{exam.subject?.name || '—'}</Text>
                            </Group>
                            <Divider mb="xs" />
                            <Group justify="space-between" align="center">
                                <Group gap="xs">
                                    <IconClock size={14} color="gray" />
                                    <Text size="xs" c="dimmed">{formatDate(exam.date)}</Text>
                                </Group>
                                <Badge variant="light" color="orange" size="xs">Max: {exam.maxMarks}</Badge>
                            </Group>
                        </Card>
                    ))}
                </Stack>
            ) : (
                <Table striped highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Exam</Table.Th>
                            <Table.Th>Class</Table.Th>
                            <Table.Th>Subject</Table.Th>
                            <Table.Th>Date</Table.Th>
                            <Table.Th>Max Marks</Table.Th>
                            <Table.Th>Type</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {data.map((exam) => (
                            <Table.Tr key={exam.id}>
                                <Table.Td>
                                    <Text fw={500} size="sm">{exam.name}</Text>
                                </Table.Td>
                                <Table.Td>
                                    <Badge variant="light" color="indigo" size="sm">{`${exam.classLevel?.name || ''} ${exam.classLevel?.level || ''}`.trim() || '—'}</Badge>
                                </Table.Td>
                                <Table.Td>
                                    <Group gap="xs">
                                        <Badge variant="outline" color="grape" size="sm">{exam.subject?.code || '—'}</Badge>
                                        <Text size="sm">{exam.subject?.name || '—'}</Text>
                                    </Group>
                                </Table.Td>
                                <Table.Td>
                                    <Group gap="xs">
                                        <IconClock size={14} />
                                        <Text size="sm">{formatDate(exam.date)}</Text>
                                    </Group>
                                </Table.Td>
                                <Table.Td>
                                    <Badge variant="light" color="orange">{exam.maxMarks}</Badge>
                                </Table.Td>
                                <Table.Td>
                                    <Badge variant="light" color={exam.type === 'MIDTERM' ? 'blue' : exam.type === 'FINAL' ? 'red' : 'gray'} size="sm">
                                        {exam.type}
                                    </Badge>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            )}
        </Paper>
    );

    return (
        <Stack gap="lg">
            <Group justify="space-between" align="flex-start">
                <PageHeader
                    title="Exams"
                    subtitle="View your child's upcoming and past exams"
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

            <Tabs value={activeTab} onChange={setActiveTab} radius="md" mb="lg">
                <Tabs.List mb="md">
                    <Tabs.Tab value="schedule" leftSection={<IconCalendar size={16} />}>
                        List View
                    </Tabs.Tab>
                    <Tabs.Tab value="timetable" leftSection={<IconClock size={16} />}>
                        Timetable
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="schedule">
                    {/* Summary */}
                    <SimpleGrid cols={{ base: 1, sm: 3 }} mb="lg">
                        <Paper withBorder radius="md" p="lg" bg="var(--app-surface)">
                            <Group>
                                <ThemeIcon variant="light" color="blue" size="xl" radius="md"><IconCalendar size={24} /></ThemeIcon>
                                <div>
                                    <Text size="xs" tt="uppercase" fw={700} c="dimmed">Total Exams</Text>
                                    <Text size="xl" fw={700}>{exams.length}</Text>
                                </div>
                            </Group>
                        </Paper>
                        <Paper withBorder radius="md" p="lg" bg="var(--app-surface)">
                            <Group>
                                <ThemeIcon variant="light" color="green" size="xl" radius="md"><IconClock size={24} /></ThemeIcon>
                                <div>
                                    <Text size="xs" tt="uppercase" fw={700} c="dimmed">Upcoming</Text>
                                    <Text size="xl" fw={700}>{upcomingExams.length}</Text>
                                </div>
                            </Group>
                        </Paper>
                        <Paper withBorder radius="md" p="lg" bg="var(--app-surface)">
                            <Group>
                                <ThemeIcon variant="light" color="gray" size="xl" radius="md"><IconBook size={24} /></ThemeIcon>
                                <div>
                                    <Text size="xs" tt="uppercase" fw={700} c="dimmed">Completed</Text>
                                    <Text size="xl" fw={700}>{pastExams.length}</Text>
                                </div>
                            </Group>
                        </Paper>
                    </SimpleGrid>

                    <Stack gap="lg">
                        <ExamTable data={upcomingExams} label="Upcoming Exams" />
                        <ExamTable data={pastExams} label="Past Exams" />
                    </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="timetable">
                    <ExamTimetableGrid exams={exams as any} />
                </Tabs.Panel>
            </Tabs>
        </Stack>
    );
}
