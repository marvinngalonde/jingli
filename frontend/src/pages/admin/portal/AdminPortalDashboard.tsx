import { Title, Text, SimpleGrid, Card, Group, ThemeIcon, Stack, Button, LoadingOverlay, Badge, Paper, Grid, Progress, RingProgress, Table, Avatar, Box, ActionIcon } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import {
    IconChalkboard,
    IconClipboardList,
    IconUsers,
    IconUpload,
    IconMessage,
    IconPencil,
    IconBrandZoom,
    IconChevronRight,
    IconCalendarEvent,
} from '@tabler/icons-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface DashboardStats {
    classesToday: number;
    totalStudents: number;
    activeAssignments: number;
    ungraded: number;
}

interface PendingSub {
    id: string;
    submittedAt: string;
    student: { firstName: string; lastName: string; admissionNo: string };
    assignment: { id: string; title: string; maxMarks: number; type: string; subject: { name: string; code: string }; section: { name: string } };
    marks: number | null;
    feedback: string | null;
}

export function AdminPortalDashboard() {
    const isMobile = useMediaQuery('(max-width: 48em)');
    const { user } = useAuth();
    const navigate = useNavigate();

    const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Admin' : 'Admin';
    const today = new Date();
    const hour = today.getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

    const { data: stats = { classesToday: 0, totalStudents: 0, activeAssignments: 0, ungraded: 0 }, isLoading: statsLoading } = useQuery({
        queryKey: ['teacherStats'],
        queryFn: () => api.get('/teacher/dashboard-stats').then(res => res.data)
    });

    const { data: schedule = [], isLoading: scheduleLoading } = useQuery({
        queryKey: ['teacherScheduleToday'],
        queryFn: () => api.get('/teacher/schedule').then(res => res.data || [])
    });

    const { data: pendingSubsRaw = [], isLoading: pendingLoading } = useQuery({
        queryKey: ['teacherPendingSubs'],
        queryFn: () => api.get('/teacher/grading/dashboard-submissions').then(res => Array.isArray(res.data) ? res.data : [])
    });

    const pendingSubs = pendingSubsRaw as PendingSub[];

    const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
        queryKey: ['teacherAnalytics'],
        queryFn: () => api.get('/teacher/analytics').then(res => res.data)
    });

    const { data: examData = [], isLoading: examsLoading } = useQuery({
        queryKey: ['teacherExams'],
        queryFn: () => api.get('/teacher/exams').then(res => res.data || [])
    });

    const loading = statsLoading || scheduleLoading || pendingLoading || analyticsLoading || examsLoading;

    // Split into pending (ungraded) and recently graded
    const ungradedSubs = pendingSubs.filter(s => s.marks === null).slice(0, 5);
    const gradedSubs = pendingSubs.filter(s => s.marks !== null).slice(0, 5);

    // Subject progress from API
    const subjectProgress = analyticsData?.classSyllabus ? (() => {
        const colors = ['blue', 'green', 'orange', 'grape', 'teal', 'cyan', 'red', 'indigo'];
        return analyticsData.classSyllabus.map((s: any, i: number) => ({
            name: s.name,
            progress: s.progress || 0,
            color: colors[i % colors.length],
        }));
    })() : [];
    const overallProgress = subjectProgress.length > 0
        ? Math.round(subjectProgress.reduce((a: number, s: { progress: number }) => a + s.progress, 0) / subjectProgress.length)
        : 0;

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
                                {userName[0]?.toUpperCase()}
                            </Avatar>
                            <div>
                                <Text size="sm" fw={400} opacity={0.85}>{greeting},</Text>
                                <Title order={2} c="white" style={{ textTransform: 'capitalize' }}>{userName}</Title>
                                <Text size="sm" opacity={0.75}>
                                    {today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </Text>
                            </div>
                        </Group>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Group justify="flex-end" visibleFrom="md">
                            <Paper p="md" radius="md" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
                                <Text ta="center" size="xs" fw={500} opacity={0.9}>Pending Reviews</Text>
                                <Text ta="center" fw={800} size="xl">{stats.ungraded}</Text>
                            </Paper>
                            <Paper p="md" radius="md" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
                                <Text ta="center" size="xs" fw={500} opacity={0.9}>Active Assignments</Text>
                                <Text ta="center" fw={800} size="xl">{stats.activeAssignments}</Text>
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

            {/* ─── MAIN GRID: PROGRESS + CALENDAR ─── */}
            <Grid mb="lg">
                <Grid.Col span={{ base: 12, md: 7 }}>
                    <Paper p="lg" radius="md" shadow="sm" withBorder h="100%">
                        <Group justify="space-between" mb="md">
                            <Group gap="xs">
                                <Text fw={600}>Syllabus Coverage</Text>
                            </Group>
                            <Button variant="subtle" size="xs" rightSection={<IconChevronRight size={14} />} onClick={() => navigate('/portal/analytics')}>View All</Button>
                        </Group>
                        <Grid>
                            <Grid.Col span={{ base: 12, sm: 4 }}>
                                <Stack align="center" gap="xs">
                                    <RingProgress
                                        size={isMobile ? 100 : 120} thickness={isMobile ? 8 : 10} roundCaps
                                        sections={[{ value: overallProgress, color: 'brand' }]}
                                        label={<Text ta="center" fw={800} size={isMobile ? "md" : "lg"}>{overallProgress}%</Text>}
                                    />
                                    <Text size="xs" fw={500} c="dimmed">Overall Progress</Text>
                                </Stack>
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 8 }}>
                                <Text fw={500} size="sm" mb="sm">Subject-wise Progress</Text>
                                <Stack gap="sm">
                                    {subjectProgress.map((s: { name: string; progress: number; color: string }) => (
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
                                                <Text size="xs" c="dimmed">{item.section?.classLevel?.name} {item.section?.classLevel?.level ?? ''} {item.section?.name}</Text>
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
                            <Text fw={600} c="orange">Pending Reviews</Text>
                            <Button variant="subtle" size="xs" rightSection={<IconChevronRight size={14} />} onClick={() => navigate('/portal/grading')}>View All</Button>
                        </Group>
                        {ungradedSubs.length === 0 ? (
                            <Text ta="center" c="dimmed" size="sm" py="md">No pending submissions to review</Text>
                        ) : isMobile ? (
                            <Stack gap="xs">
                                {ungradedSubs.map(s => (
                                    <Paper key={s.id} withBorder p="sm" radius="md">
                                        <Group justify="space-between" mb={4}>
                                            <Text size="sm" fw={600}>{s.student?.firstName} {s.student?.lastName}</Text>
                                            <Button size="compact-xs" radius="xl" onClick={() => navigate(`/portal/grading?assignment=${s.assignment?.id}`)}>Review</Button>
                                        </Group>
                                        <Text size="xs" c="dimmed" lineClamp={1}>{s.assignment?.title}</Text>
                                        <Badge variant="light" size="xs" mt={4}>{s.assignment?.subject?.name}</Badge>
                                    </Paper>
                                ))}
                            </Stack>
                        ) : (
                            <Table striped highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Student</Table.Th>
                                        <Table.Th>Assignment</Table.Th>
                                        <Table.Th>Subject</Table.Th>
                                        <Table.Th></Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {ungradedSubs.map(s => (
                                        <Table.Tr key={s.id}>
                                            <Table.Td fw={500}>{s.student?.firstName} {s.student?.lastName}</Table.Td>
                                            <Table.Td><Text size="sm" lineClamp={1}>{s.assignment?.title}</Text></Table.Td>
                                            <Table.Td><Badge variant="light" size="sm">{s.assignment?.subject?.name}</Badge></Table.Td>
                                            <Table.Td>
                                                <Button size="xs" variant="filled" color="brand" radius="xl" onClick={() => navigate(`/portal/grading?assignment=${s.assignment?.id}`)}>
                                                    Review
                                                </Button>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        )}
                    </Paper>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Paper p="lg" radius="md" shadow="sm" withBorder>
                        <Group justify="space-between" mb="md">
                            <Text fw={600} c="teal">Recent Submissions</Text>
                            <Button variant="subtle" size="xs" rightSection={<IconChevronRight size={14} />} onClick={() => navigate('/portal/grading')}>View All</Button>
                        </Group>
                        {gradedSubs.length === 0 && ungradedSubs.length === 0 ? (
                            <Text ta="center" c="dimmed" size="sm" py="md">No recent submissions</Text>
                        ) : isMobile ? (
                            <Stack gap="xs">
                                {(gradedSubs.length > 0 ? gradedSubs : ungradedSubs).map(s => (
                                    <Paper key={s.id} withBorder p="sm" radius="md">
                                        <Group justify="space-between" mb={4}>
                                            <Text size="sm" fw={600}>{s.student?.firstName} {s.student?.lastName}</Text>
                                            <Text size="xs" fw={700}>{s.marks !== null ? `${s.marks}/${s.assignment?.maxMarks}` : '—'}</Text>
                                        </Group>
                                        <Group justify="space-between" align="center">
                                            <Text size="xs" c="dimmed" lineClamp={1} flex={1}>{s.assignment?.title}</Text>
                                            <Badge color={s.marks !== null ? 'green' : 'orange'} variant="light" size="xs">
                                                {s.marks !== null ? 'Graded' : 'Pending'}
                                            </Badge>
                                        </Group>
                                    </Paper>
                                ))}
                            </Stack>
                        ) : (
                            <Table striped highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Student</Table.Th>
                                        <Table.Th>Assignment</Table.Th>
                                        <Table.Th>Marks</Table.Th>
                                        <Table.Th>Status</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {(gradedSubs.length > 0 ? gradedSubs : ungradedSubs).map(s => (
                                        <Table.Tr key={s.id}>
                                            <Table.Td fw={500}>{s.student?.firstName} {s.student?.lastName}</Table.Td>
                                            <Table.Td><Text size="sm" lineClamp={1}>{s.assignment?.title}</Text></Table.Td>
                                            <Table.Td>{s.marks !== null ? `${s.marks}/${s.assignment?.maxMarks}` : '—'}</Table.Td>
                                            <Table.Td>
                                                <Badge color={s.marks !== null ? 'green' : 'orange'} variant="light" size="sm">
                                                    {s.marks !== null ? 'Graded' : 'Pending'}
                                                </Badge>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        )}
                    </Paper>
                </Grid.Col>
            </Grid>

            {/* ─── UPCOMING EXAMS ─── */}
            {(() => {
                const now = new Date();
                const upcomingExams = (examData as any[]).filter(e => new Date(e.date) >= now).slice(0, 5);
                return (
                    <Paper p="lg" radius="md" shadow="sm" withBorder mt="lg">
                        <Group justify="space-between" mb="md">
                            <Text fw={600} c="indigo">Upcoming Exams</Text>
                            <Button variant="subtle" size="xs" rightSection={<IconChevronRight size={14} />} onClick={() => navigate('/teacher/exams')}>View All</Button>
                        </Group>
                        {upcomingExams.length === 0 ? (
                            <Text ta="center" c="dimmed" size="sm" py="md">No upcoming exams scheduled</Text>
                        ) : isMobile ? (
                            <Stack gap="xs">
                                {upcomingExams.map((exam: any) => (
                                    <Paper key={exam.id} withBorder p="sm" radius="md">
                                        <Group justify="space-between" mb={4}>
                                            <Text size="sm" fw={600}>{exam.name}</Text>
                                            <Badge variant="outline" color="orange" size="xs">{exam.maxMarks} pts</Badge>
                                        </Group>
                                        <Group justify="space-between">
                                            <Text size="xs" c="dimmed">{exam.subject?.name || '—'}</Text>
                                            <Text size="xs" fw={500}>{new Date(exam.date).toLocaleDateString('en-GB')}</Text>
                                        </Group>
                                    </Paper>
                                ))}
                            </Stack>
                        ) : (
                            <Table striped highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Exam</Table.Th>
                                        <Table.Th>Subject</Table.Th>
                                        <Table.Th>Class</Table.Th>
                                        <Table.Th>Date</Table.Th>
                                        <Table.Th>Max Marks</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {upcomingExams.map((exam: any) => (
                                        <Table.Tr key={exam.id}>
                                            <Table.Td fw={500}>{exam.name}</Table.Td>
                                            <Table.Td><Badge variant="light" size="sm">{exam.subject?.name || '—'}</Badge></Table.Td>
                                            <Table.Td>{`${exam.classLevel?.name || ''} ${exam.classLevel?.level ?? ''}`.trim() || '—'}</Table.Td>
                                            <Table.Td>{new Date(exam.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</Table.Td>
                                            <Table.Td><Badge variant="outline" color="orange">{exam.maxMarks}</Badge></Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        )}
                    </Paper>
                );
            })()}
        </Box>
    );
}

export default AdminPortalDashboard;
