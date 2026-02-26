import { Title, Text, SimpleGrid, Card, Group, ThemeIcon, Stack, Button, LoadingOverlay, Badge, Paper, Grid, Progress, RingProgress, Table, ActionIcon, Avatar, Box, Divider } from '@mantine/core';
import {
    IconChalkboard,
    IconClipboardList,
    IconUsers,
    IconTrendingUp,
    IconPlus,
    IconUpload,
    IconMessage,
    IconPencil,
    IconBrandZoom,
    IconTrophy,
    IconChevronRight,
    IconClock,
    IconCalendarEvent,
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
    classesToday: number;
    totalStudents: number;
    activeAssignments: number;
    ungraded: number;
}

export function TeacherDashboard() {
    const [stats, setStats] = useState<DashboardStats>({ classesToday: 0, totalStudents: 0, activeAssignments: 0, ungraded: 0 });
    const [schedule, setSchedule] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    const teacherName = user?.email?.split('@')[0] || 'Teacher';
    const today = new Date();
    const greeting = today.getHours() < 12 ? 'Good Morning' : today.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, scheduleRes] = await Promise.allSettled([
                    api.get('/teacher/dashboard-stats'),
                    api.get('/teacher/schedule/today'),
                ]);
                if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
                if (scheduleRes.status === 'fulfilled') setSchedule(scheduleRes.value.data || []);
            } catch { /* ignore */ }
            finally { setLoading(false); }
        };
        fetchData();
    }, []);

    // Mock data for subjects — in production these come from API
    const subjectProgress = [
        { name: 'Mathematics', progress: 78, color: 'blue' },
        { name: 'English', progress: 85, color: 'green' },
        { name: 'Science', progress: 62, color: 'orange' },
        { name: 'History', progress: 45, color: 'grape' },
        { name: 'Geography', progress: 70, color: 'teal' },
    ];

    const pendingWork = [
        { title: 'Form 2 Maths Assignment', subject: 'Mathematics', due: 'Today', points: 10 },
        { title: 'Science Lab Report Review', subject: 'Science', due: 'Tomorrow', points: 15 },
        { title: 'English Essay Marking', subject: 'English', due: 'Feb 28', points: 20 },
    ];

    const recentSubmissions = [
        { student: 'John M.', title: 'Algebra Worksheet', subject: 'Mathematics', points: 10, status: 'Pending' },
        { student: 'Sarah K.', title: 'Lab Report #3', subject: 'Science', points: 15, status: 'Graded' },
        { student: 'David L.', title: 'Book Review', subject: 'English', points: 20, status: 'Pending' },
    ];

    const overallProgress = Math.round(subjectProgress.reduce((a, s) => a + s.progress, 0) / subjectProgress.length);

    return (
        <Box pos="relative">
            <LoadingOverlay visible={loading} />

            {/* ─── WELCOME BANNER ─── */}
            <Paper
                radius="lg"
                p="xl"
                mb="lg"
                style={{
                    background: 'linear-gradient(135deg, var(--mantine-color-brand-6) 0%, var(--mantine-color-indigo-5) 100%)',
                    color: 'white',
                }}
            >
                <Grid align="center">
                    <Grid.Col span={{ base: 12, md: 8 }}>
                        <Group>
                            <Avatar size={64} radius="xl" color="white" variant="filled" styles={{ root: { color: 'var(--mantine-color-brand-6)' } }}>
                                {teacherName[0]?.toUpperCase()}
                            </Avatar>
                            <div>
                                <Text size="sm" fw={400} opacity={0.85}>{greeting},</Text>
                                <Title order={2} c="white" style={{ textTransform: 'capitalize' }}>{teacherName}</Title>
                                <Text size="sm" opacity={0.75}>
                                    {today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </Text>
                            </div>
                        </Group>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Group justify="flex-end" visibleFrom="md">
                            <Paper p="md" radius="md" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
                                <Text ta="center" size="xs" fw={500} opacity={0.9}>Engagement Score</Text>
                                <Text ta="center" fw={800} size="xl">92%</Text>
                            </Paper>
                            <Paper p="md" radius="md" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
                                <Text ta="center" size="xs" fw={500} opacity={0.9}>Total Points</Text>
                                <Text ta="center" fw={800} size="xl">1,240</Text>
                            </Paper>
                        </Group>
                    </Grid.Col>
                </Grid>
            </Paper>

            {/* ─── STAT CARDS ─── */}
            <SimpleGrid cols={{ base: 2, md: 4 }} mb="lg">
                <Card shadow="sm" radius="md" p="md" withBorder>
                    <Group justify="space-between" mb="xs">
                        <Text size="sm" c="dimmed" fw={500}>Classes Today</Text>
                        <ThemeIcon variant="light" color="blue" size="md"><IconChalkboard size={16} /></ThemeIcon>
                    </Group>
                    <Text fw={700} size="xl">{stats.classesToday}</Text>
                </Card>
                <Card shadow="sm" radius="md" p="md" withBorder>
                    <Group justify="space-between" mb="xs">
                        <Text size="sm" c="dimmed" fw={500}>Active Assignments</Text>
                        <ThemeIcon variant="light" color="orange" size="md"><IconClipboardList size={16} /></ThemeIcon>
                    </Group>
                    <Text fw={700} size="xl">{stats.activeAssignments}</Text>
                </Card>
                <Card shadow="sm" radius="md" p="md" withBorder>
                    <Group justify="space-between" mb="xs">
                        <Text size="sm" c="dimmed" fw={500}>Pending Reviews</Text>
                        <ThemeIcon variant="light" color="red" size="md"><IconPencil size={16} /></ThemeIcon>
                    </Group>
                    <Text fw={700} size="xl">{stats.ungraded}</Text>
                </Card>
                <Card shadow="sm" radius="md" p="md" withBorder>
                    <Group justify="space-between" mb="xs">
                        <Text size="sm" c="dimmed" fw={500}>Total Students</Text>
                        <ThemeIcon variant="light" color="green" size="md"><IconUsers size={16} /></ThemeIcon>
                    </Group>
                    <Text fw={700} size="xl">{stats.totalStudents}</Text>
                </Card>
            </SimpleGrid>

            {/* ─── QUICK ACTIONS ─── */}
            <Paper p="md" radius="md" shadow="sm" withBorder mb="lg">
                <Text fw={600} mb="sm">Quick Actions</Text>
                <Group>
                    <Button variant="light" color="teal" leftSection={<IconUpload size={16} />} radius="md" onClick={() => navigate('/portal/materials')}>
                        Upload Material
                    </Button>
                    <Button variant="light" color="orange" leftSection={<IconClipboardList size={16} />} radius="md" onClick={() => navigate('/portal/assignments')}>
                        Create Assignment
                    </Button>
                    <Button variant="light" color="grape" leftSection={<IconPencil size={16} />} radius="md" onClick={() => navigate('/portal/cbt')}>
                        Create Quiz
                    </Button>
                    <Button variant="light" color="cyan" leftSection={<IconBrandZoom size={16} />} radius="md" onClick={() => navigate('/portal/live-classes')}>
                        Schedule Live Class
                    </Button>
                    <Button variant="light" color="violet" leftSection={<IconMessage size={16} />} radius="md" onClick={() => navigate('/portal/discussions')}>
                        Start Discussion
                    </Button>
                </Group>
            </Paper>

            {/* ─── MAIN GRID: PROGRESS + CALENDAR ─── */}
            <Grid mb="lg">
                <Grid.Col span={{ base: 12, md: 7 }}>
                    <Paper p="lg" radius="md" shadow="sm" withBorder h="100%">
                        <Group justify="space-between" mb="md">
                            <Text fw={600}>Syllabus Coverage</Text>
                            <Button variant="subtle" size="xs" rightSection={<IconChevronRight size={14} />} onClick={() => navigate('/portal/analytics')}>
                                View All
                            </Button>
                        </Group>
                        <Grid>
                            <Grid.Col span={4}>
                                <Stack align="center" gap="xs">
                                    <RingProgress
                                        size={120}
                                        thickness={10}
                                        roundCaps
                                        sections={[{ value: overallProgress, color: 'brand' }]}
                                        label={
                                            <Text ta="center" fw={800} size="lg">{overallProgress}%</Text>
                                        }
                                    />
                                    <Text size="sm" fw={500} c="dimmed">Overall Progress</Text>
                                </Stack>
                            </Grid.Col>
                            <Grid.Col span={8}>
                                <Text fw={500} size="sm" mb="sm">Subject-wise Progress</Text>
                                <Stack gap="sm">
                                    {subjectProgress.map(s => (
                                        <div key={s.name}>
                                            <Group justify="space-between" mb={2}>
                                                <Text size="xs" fw={500}>{s.name}</Text>
                                                <Text size="xs" fw={600}>{s.progress}%</Text>
                                            </Group>
                                            <Progress value={s.progress} color={s.color} size="md" radius="xl" />
                                        </div>
                                    ))}
                                </Stack>
                            </Grid.Col>
                        </Grid>
                    </Paper>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 5 }}>
                    <Paper p="lg" radius="md" shadow="sm" withBorder h="100%">
                        <Group justify="space-between" mb="md">
                            <Text fw={600}>Today's Schedule</Text>
                            <Badge variant="light" size="sm">{schedule.length} classes</Badge>
                        </Group>
                        {schedule.length === 0 ? (
                            <Stack align="center" py="xl" gap="xs">
                                <IconCalendarEvent size={40} color="var(--mantine-color-gray-4)" />
                                <Text c="dimmed" size="sm">No classes scheduled for today</Text>
                            </Stack>
                        ) : (
                            <Stack gap="sm">
                                {schedule.slice(0, 5).map((item: any, i: number) => (
                                    <Paper key={i} p="sm" radius="md" withBorder style={{ borderLeft: '3px solid var(--mantine-color-brand-5)' }}>
                                        <Group justify="space-between">
                                            <div>
                                                <Text size="sm" fw={600}>{item.subject?.name || item.name || 'Class'}</Text>
                                                <Text size="xs" c="dimmed">{item.section?.classLevel?.name} {item.section?.name}</Text>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <Badge variant="light" size="sm">{item.startTime}-{item.endTime}</Badge>
                                                {item.roomNo && <Text size="xs" c="dimmed">Room {item.roomNo}</Text>}
                                            </div>
                                        </Group>
                                    </Paper>
                                ))}
                            </Stack>
                        )}
                    </Paper>
                </Grid.Col>
            </Grid>

            {/* ─── TABLES: PENDING + RECENT ─── */}
            <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Paper p="lg" radius="md" shadow="sm" withBorder>
                        <Group justify="space-between" mb="md">
                            <Text fw={600} c="orange">Pending Work</Text>
                            <Button variant="subtle" size="xs" rightSection={<IconChevronRight size={14} />} onClick={() => navigate('/portal/assignments')}>
                                View All
                            </Button>
                        </Group>
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>No.</Table.Th>
                                    <Table.Th>Title</Table.Th>
                                    <Table.Th>Subject</Table.Th>
                                    <Table.Th>Points</Table.Th>
                                    <Table.Th></Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {pendingWork.map((w, i) => (
                                    <Table.Tr key={i}>
                                        <Table.Td>{i + 1}</Table.Td>
                                        <Table.Td fw={500}>{w.title}</Table.Td>
                                        <Table.Td>{w.subject}</Table.Td>
                                        <Table.Td>{w.points}</Table.Td>
                                        <Table.Td><Button size="xs" variant="filled" color="brand" radius="xl">Review</Button></Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    </Paper>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Paper p="lg" radius="md" shadow="sm" withBorder>
                        <Group justify="space-between" mb="md">
                            <Text fw={600} c="teal">Recent Submissions</Text>
                            <Button variant="subtle" size="xs" rightSection={<IconChevronRight size={14} />} onClick={() => navigate('/portal/grading')}>
                                View All
                            </Button>
                        </Group>
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>No.</Table.Th>
                                    <Table.Th>Student</Table.Th>
                                    <Table.Th>Subject</Table.Th>
                                    <Table.Th>Points</Table.Th>
                                    <Table.Th>Status</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {recentSubmissions.map((s, i) => (
                                    <Table.Tr key={i}>
                                        <Table.Td>{i + 1}</Table.Td>
                                        <Table.Td fw={500}>{s.student}</Table.Td>
                                        <Table.Td>{s.subject}</Table.Td>
                                        <Table.Td>{s.points}</Table.Td>
                                        <Table.Td><Badge color={s.status === 'Graded' ? 'green' : 'orange'} variant="light" size="sm">{s.status}</Badge></Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    </Paper>
                </Grid.Col>
            </Grid>
        </Box>
    );
}

export default TeacherDashboard;
