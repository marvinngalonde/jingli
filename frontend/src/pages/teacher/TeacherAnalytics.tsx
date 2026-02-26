import { useState } from 'react';
import { Title, Text, Paper, Group, Card, Badge, Grid, ThemeIcon, SimpleGrid, Progress, RingProgress, Stack, Select, Table, Box, ScrollArea } from '@mantine/core';
import {
    IconChartBar, IconUsers, IconTrendingUp, IconAlertTriangle,
    IconClipboardList, IconClock, IconFlame, IconSchool,
    IconChevronUp, IconChevronDown,
} from '@tabler/icons-react';

// Mock analytics data
const overallStats = {
    totalStudents: 124,
    avgEngagement: 78,
    syllabusCompletion: 72,
    atRiskCount: 8,
};

const classSyllabus = [
    { name: 'Form 2 Blue - Mathematics', teacher: 'You', progress: 85, totalTopics: 24, completedTopics: 20 },
    { name: 'Form 2 Blue - Science', teacher: 'You', progress: 72, totalTopics: 20, completedTopics: 14 },
    { name: 'Form 2 Red - Mathematics', teacher: 'You', progress: 68, totalTopics: 24, completedTopics: 16 },
    { name: 'Form 3 Green - Mathematics', teacher: 'You', progress: 55, totalTopics: 28, completedTopics: 15 },
];

const assignmentStats = [
    { name: 'Algebra Worksheet 3', subject: 'Mathematics', submitted: 28, total: 32, avgScore: 76 },
    { name: 'Lab Report: Acids & Bases', subject: 'Science', submitted: 30, total: 32, avgScore: 82 },
    { name: 'Essay: Climate Change', subject: 'English', submitted: 25, total: 32, avgScore: 68 },
    { name: 'History Timeline Project', subject: 'History', submitted: 22, total: 30, avgScore: 74 },
    { name: 'Geography Map Exercise', subject: 'Geography', submitted: 29, total: 32, avgScore: 80 },
];

const atRiskStudents = [
    { name: 'Grace Mapfumo', class: 'Form 2 Blue', attendance: 62, avgScore: 35, lastActive: '5 days ago', issues: ['Low attendance', 'Missing 4 assignments'] },
    { name: 'Peter Nyoni', class: 'Form 2 Red', attendance: 70, avgScore: 42, lastActive: '3 days ago', issues: ['Low quiz scores', 'No CALA submissions'] },
    { name: 'Tinashe Guta', class: 'Form 3 Green', attendance: 55, avgScore: 38, lastActive: '1 week ago', issues: ['Absent from live classes', 'Low engagement'] },
    { name: 'Mercy Hove', class: 'Form 2 Blue', attendance: 72, avgScore: 45, lastActive: '2 days ago', issues: ['Declining grades', 'Missing labs'] },
];

const weeklyActivity = [
    { day: 'Mon', logins: 98, submissions: 12, quizzes: 3 },
    { day: 'Tue', logins: 105, submissions: 8, quizzes: 5 },
    { day: 'Wed', logins: 112, submissions: 15, quizzes: 2 },
    { day: 'Thu', logins: 95, submissions: 10, quizzes: 4 },
    { day: 'Fri', logins: 88, submissions: 18, quizzes: 1 },
    { day: 'Sat', logins: 42, submissions: 5, quizzes: 0 },
    { day: 'Sun', logins: 38, submissions: 3, quizzes: 0 },
];

const subjectPerformance = [
    { subject: 'Mathematics', avgScore: 72, topStudent: 'Takudzwa M.', weakArea: 'Geometry', trend: 'up' as const },
    { subject: 'Science', avgScore: 78, topStudent: 'Rudo C.', weakArea: 'Physics', trend: 'up' as const },
    { subject: 'English', avgScore: 68, topStudent: 'Blessing M.', weakArea: 'Grammar', trend: 'down' as const },
    { subject: 'History', avgScore: 74, topStudent: 'Tatenda S.', weakArea: 'World History', trend: 'same' as const },
    { subject: 'Geography', avgScore: 70, topStudent: 'Nyasha C.', weakArea: 'Map Skills', trend: 'up' as const },
];

export default function TeacherAnalytics() {
    const [period, setPeriod] = useState<string | null>('this-term');

    const maxLogins = Math.max(...weeklyActivity.map(w => w.logins));

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
                            {weeklyActivity.map(day => (
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
                            {subjectPerformance.map(s => (
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
                    {classSyllabus.map(c => (
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
                            {assignmentStats.map((a, i) => {
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
                    {atRiskStudents.map(s => (
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
                                {s.issues.map(issue => <Badge key={issue} size="xs" color="red" variant="light">{issue}</Badge>)}
                            </Group>
                        </Paper>
                    ))}
                </SimpleGrid>
            </Paper>
        </div>
    );
}
