import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Title, Text, Paper, Group, Card, Badge, Grid, ThemeIcon, SimpleGrid, Progress, RingProgress, Stack, Select, Table, Box, ScrollArea } from '@mantine/core';
import {
    IconChartBar, IconUsers, IconTrendingUp, IconAlertTriangle,
    IconClipboardList, IconClock, IconFlame, IconSchool,
    IconChevronUp, IconChevronDown,
} from '@tabler/icons-react';



export default function TeacherAnalytics() {
    const [period, setPeriod] = useState<string | null>('this-term');

    const { data, isLoading } = useQuery({
        queryKey: ['teacherAnalytics', period],
        queryFn: () => api.get('/teacher/analytics').then(res => res.data)
    });

    if (isLoading || !data) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: 50 }}>Loading analytics...</div>;

    const { overallStats, classSyllabus, assignmentStats, atRiskStudents, weeklyActivity, subjectPerformance } = data;

    const maxLogins = Math.max(...weeklyActivity.map((w: any) => w.logins));

    return (
        <div>
            <Group justify="space-between" mb="lg">
                <div>
                    <Title order={2}>Analytics & Insights</Title>
                    <Text c="dimmed" size="sm">Track student engagement, syllabus coverage, and identify at-risk students</Text>
                </div>
                <Select
                    data={[
                        { value: 'this-week', label: 'This Week' },
                        { value: 'this-month', label: 'This Month' },
                        { value: 'this-term', label: 'This Term' },
                        { value: 'this-year', label: 'This Year' },
                    ]}
                    value={period}
                    onChange={setPeriod}
                    style={{ width: 150 }}
                />
            </Group>

            {/* Overview Stats */}
            <SimpleGrid cols={{ base: 2, md: 4 }} mb="lg">
                <Card shadow="sm" radius="md" p="md" withBorder>
                    <Group justify="space-between" mb="xs">
                        <Text size="sm" c="dimmed" fw={500}>Total Students</Text>
                        <ThemeIcon variant="light" color="blue"><IconUsers size={16} /></ThemeIcon>
                    </Group>
                    <Text fw={700} size="xl">{overallStats.totalStudents}</Text>
                </Card>
                <Card shadow="sm" radius="md" p="md" withBorder>
                    <Group justify="space-between" mb="xs">
                        <Text size="sm" c="dimmed" fw={500}>Avg Engagement</Text>
                        <ThemeIcon variant="light" color="green"><IconTrendingUp size={16} /></ThemeIcon>
                    </Group>
                    <Text fw={700} size="xl">{overallStats.avgEngagement}%</Text>
                    <Progress value={overallStats.avgEngagement} size="xs" mt="xs" color="green" />
                </Card>
                <Card shadow="sm" radius="md" p="md" withBorder>
                    <Group justify="space-between" mb="xs">
                        <Text size="sm" c="dimmed" fw={500}>Syllabus Coverage</Text>
                        <ThemeIcon variant="light" color="orange"><IconSchool size={16} /></ThemeIcon>
                    </Group>
                    <Text fw={700} size="xl">{overallStats.syllabusCompletion}%</Text>
                    <Progress value={overallStats.syllabusCompletion} size="xs" mt="xs" color="orange" />
                </Card>
                <Card shadow="sm" radius="md" p="md" withBorder>
                    <Group justify="space-between" mb="xs">
                        <Text size="sm" c="dimmed" fw={500}>At-Risk Students</Text>
                        <ThemeIcon variant="light" color="red"><IconAlertTriangle size={16} /></ThemeIcon>
                    </Group>
                    <Text fw={700} size="xl" c="red">{overallStats.atRiskCount}</Text>
                </Card>
            </SimpleGrid>

            <Grid mb="lg">
                {/* Weekly Activity */}
                <Grid.Col span={{ base: 12, md: 7 }}>
                    <Paper p="lg" radius="md" shadow="sm" withBorder h="100%">
                        <Text fw={600} mb="md">Weekly Activity</Text>
                        <Stack gap="sm">
                            {weeklyActivity.map((day: any) => (
                                <Group key={day.day} gap="sm">
                                    <Text size="sm" fw={500} w={35}>{day.day}</Text>
                                    <Box style={{ flex: 1 }}>
                                        <Progress.Root size="xl" radius="md">
                                            <Progress.Section value={(day.logins / maxLogins) * 60} color="blue">
                                                <Progress.Label>{day.logins} logins</Progress.Label>
                                            </Progress.Section>
                                            <Progress.Section value={(day.submissions / maxLogins) * 60} color="green">
                                                <Progress.Label>{day.submissions}</Progress.Label>
                                            </Progress.Section>
                                            <Progress.Section value={(day.quizzes / maxLogins) * 60} color="grape">
                                                <Progress.Label>{day.quizzes}</Progress.Label>
                                            </Progress.Section>
                                        </Progress.Root>
                                    </Box>
                                </Group>
                            ))}
                        </Stack>
                        <Group mt="md" gap="lg">
                            <Group gap={4}><Box w={12} h={12} bg="blue" style={{ borderRadius: 2 }} /><Text size="xs">Logins</Text></Group>
                            <Group gap={4}><Box w={12} h={12} bg="green" style={{ borderRadius: 2 }} /><Text size="xs">Submissions</Text></Group>
                            <Group gap={4}><Box w={12} h={12} bg="grape" style={{ borderRadius: 2 }} /><Text size="xs">Quizzes</Text></Group>
                        </Group>
                    </Paper>
                </Grid.Col>

                {/* Engagement Ring */}
                <Grid.Col span={{ base: 12, md: 5 }}>
                    <Paper p="lg" radius="md" shadow="sm" withBorder h="100%">
                        <Text fw={600} mb="md">Subject Performance</Text>
                        <Stack gap="sm">
                            {subjectPerformance.map((s: any) => (
                                <Paper key={s.subject} p="sm" withBorder radius="md">
                                    <Group justify="space-between">
                                        <div>
                                            <Group gap="xs" mb={2}>
                                                <Text size="sm" fw={600}>{s.subject}</Text>
                                                {s.trend === 'up' && <IconChevronUp size={14} color="green" />}
                                                {s.trend === 'down' && <IconChevronDown size={14} color="red" />}
                                            </Group>
                                            <Text size="xs" c="dimmed">Top: {s.topStudent} · Weak: {s.weakArea}</Text>
                                        </div>
                                        <RingProgress size={48} thickness={5} roundCaps
                                            sections={[{ value: s.avgScore, color: s.avgScore >= 75 ? 'green' : s.avgScore >= 60 ? 'orange' : 'red' }]}
                                            label={<Text ta="center" size="xs" fw={700}>{s.avgScore}%</Text>}
                                        />
                                    </Group>
                                </Paper>
                            ))}
                        </Stack>
                    </Paper>
                </Grid.Col>
            </Grid>

            {/* Syllabus Coverage */}
            <Paper p="lg" radius="md" shadow="sm" withBorder mb="lg">
                <Text fw={600} mb="md">Syllabus Coverage by Class</Text>
                <SimpleGrid cols={{ base: 1, md: 2 }}>
                    {classSyllabus.map((c: any) => (
                        <Paper key={c.name} p="md" withBorder radius="md">
                            <Group justify="space-between" mb="xs">
                                <Text size="sm" fw={600}>{c.name}</Text>
                                <Badge size="sm" color={c.progress >= 80 ? 'green' : c.progress >= 60 ? 'orange' : 'red'}>{c.progress}%</Badge>
                            </Group>
                            <Progress value={c.progress} size="lg" radius="xl" color={c.progress >= 80 ? 'green' : c.progress >= 60 ? 'orange' : 'red'} />
                            <Text size="xs" c="dimmed" mt="xs">{c.completedTopics} of {c.totalTopics} topics completed</Text>
                        </Paper>
                    ))}
                </SimpleGrid>
            </Paper>

            {/* Assignment Completion */}
            <Paper p="lg" radius="md" shadow="sm" withBorder mb="lg">
                <Text fw={600} mb="md">Assignment Completion Rates</Text>
                <ScrollArea>
                    <Table striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Assignment</Table.Th>
                                <Table.Th>Subject</Table.Th>
                                <Table.Th>Submitted</Table.Th>
                                <Table.Th>Rate</Table.Th>
                                <Table.Th>Avg Score</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {assignmentStats.map((a: any, i: number) => {
                                const rate = Math.round((a.submitted / a.total) * 100);
                                return (
                                    <Table.Tr key={i}>
                                        <Table.Td fw={500}>{a.name}</Table.Td>
                                        <Table.Td><Badge size="sm" variant="light">{a.subject}</Badge></Table.Td>
                                        <Table.Td>{a.submitted}/{a.total}</Table.Td>
                                        <Table.Td>
                                            <Group gap="xs">
                                                <Progress value={rate} size="sm" w={60} color={rate >= 90 ? 'green' : rate >= 75 ? 'orange' : 'red'} />
                                                <Text size="xs" fw={600}>{rate}%</Text>
                                            </Group>
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge color={a.avgScore >= 75 ? 'green' : a.avgScore >= 60 ? 'orange' : 'red'} variant="light">{a.avgScore}%</Badge>
                                        </Table.Td>
                                    </Table.Tr>
                                );
                            })}
                        </Table.Tbody>
                    </Table>
                </ScrollArea>
            </Paper>

            {/* At-Risk Students */}
            <Paper p="lg" radius="md" shadow="sm" withBorder style={{ borderLeft: '4px solid var(--mantine-color-red-5)' }}>
                <Group mb="md">
                    <ThemeIcon color="red" variant="light" size="lg"><IconAlertTriangle size={18} /></ThemeIcon>
                    <div>
                        <Text fw={600} c="red">Students At Risk</Text>
                        <Text size="xs" c="dimmed">These students need immediate attention based on engagement and performance metrics</Text>
                    </div>
                </Group>
                <SimpleGrid cols={{ base: 1, md: 2 }}>
                    {atRiskStudents.map((s: any) => (
                        <Paper key={s.name} p="md" withBorder radius="md">
                            <Group justify="space-between" mb="xs">
                                <Text fw={600}>{s.name}</Text>
                                <Badge size="sm" variant="outline">{s.class}</Badge>
                            </Group>
                            <Group gap="lg" mb="xs">
                                <div>
                                    <Text size="xs" c="dimmed">Attendance</Text>
                                    <Text size="sm" fw={600} c={s.attendance >= 80 ? 'green' : 'red'}>{s.attendance}%</Text>
                                </div>
                                <div>
                                    <Text size="xs" c="dimmed">Avg Score</Text>
                                    <Text size="sm" fw={600} c={s.avgScore >= 50 ? 'orange' : 'red'}>{s.avgScore}%</Text>
                                </div>
                                <div>
                                    <Text size="xs" c="dimmed">Last Active</Text>
                                    <Text size="sm" fw={500}>{s.lastActive}</Text>
                                </div>
                            </Group>
                            <Group gap={4}>
                                {s.issues.map((issue: any) => <Badge key={issue} size="xs" color="red" variant="light">{issue}</Badge>)}
                            </Group>
                        </Paper>
                    ))}
                </SimpleGrid>
            </Paper>
        </div>
    );
}
