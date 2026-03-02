import { useState, useEffect } from 'react';
import {
    SimpleGrid, Paper, Text, Group, ThemeIcon, Badge, Card, Stack,
    Loader, Center, Progress, Divider, Button, Table
} from '@mantine/core';
import {
    IconBook, IconClipboardList, IconBrain, IconTrophy,
    IconCalendar, IconFileAnalytics, IconChevronRight, IconBrandZoom,
} from '@tabler/icons-react';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { PageHeader } from '../../../components/common/PageHeader';

interface DashboardStats {
    totalSubjects: number;
    pendingAssignments: number;
    availableQuizzes: number;
    upcomingLiveClasses: number;
}

interface Assignment {
    id: string;
    title: string;
    subject: string;
    dueDate: string;
    status: string;
}

interface GradeEntry {
    subject: string;
    score: number;
    total: number;
    grade: string;
}

interface LiveClass {
    id: string;
    title: string;
    subject?: { name: string };
    scheduledFor: string;
    provider: string;
    status: string;
    meetingUrl: string;
}

export default function StudentPortalDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats>({ totalSubjects: 0, pendingAssignments: 0, availableQuizzes: 0, upcomingLiveClasses: 0 });
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [grades, setGrades] = useState<GradeEntry[]>([]);
    const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadAll(); }, []);

    const loadAll = async () => {
        try {
            setLoading(true);
            const [classesRes, assignRes, quizRes, liveRes, gradesRes] = await Promise.allSettled([
                api.get('/student/classes'),
                api.get('/student/assignments'),
                api.get('/cbt/quizzes'),
                api.get('/live-classes'),
                api.get('/student/grades'),
            ]);

            const subjects = classesRes.status === 'fulfilled' ? (classesRes.value.data || []) : [];
            const allAssign = assignRes.status === 'fulfilled' ? (assignRes.value.data || []) : [];
            const allQuizzes = quizRes.status === 'fulfilled' ? (quizRes.value.data || []) : [];
            const allLive = liveRes.status === 'fulfilled' ? (liveRes.value.data || []) : [];
            const allGrades = gradesRes.status === 'fulfilled' ? (gradesRes.value.data || []) : [];

            const pending = allAssign.filter((a: any) => a.status === 'PENDING' || a.status === 'ASSIGNED');
            const upcoming = allLive.filter((l: any) => l.status === 'SCHEDULED' || l.status === 'LIVE');
            const published = allQuizzes.filter((q: any) => q.isPublished);

            setStats({
                totalSubjects: subjects.length,
                pendingAssignments: pending.length,
                availableQuizzes: published.length,
                upcomingLiveClasses: upcoming.length,
            });
            setAssignments(pending.slice(0, 5));
            setLiveClasses(upcoming.slice(0, 3));
            setGrades(Array.isArray(allGrades) ? allGrades.slice(0, 5) : []);
        } catch (e) {
            notifications.show({ title: 'Error', message: 'Failed to load portal data', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Center h={400}><Loader /></Center>;

    const statCards = [
        { label: 'My Subjects', value: stats.totalSubjects, icon: IconBook, color: 'teal', to: '/student-portal/classes' },
        { label: 'Pending Assignments', value: stats.pendingAssignments, icon: IconClipboardList, color: 'orange', to: '/student-portal/assignments' },
        { label: 'Available Quizzes', value: stats.availableQuizzes, icon: IconBrain, color: 'grape', to: '/student-portal/cbt' },
        { label: 'Upcoming Live', value: stats.upcomingLiveClasses, icon: IconBrandZoom, color: 'cyan', to: '/student-portal/live-classes' },
    ];

    const getStatusColor = (s: string) => s === 'SUBMITTED' ? 'green' : s === 'GRADED' ? 'blue' : 'orange';

    return (
        <div>
            <PageHeader
                title={`Welcome back, ${user?.profile?.firstName || 'Student'} 👋`}
                subtitle="Your learning portal overview"
            />

            {/* Stat Cards */}
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb="xl">
                {statCards.map(card => (
                    <Paper
                        key={card.label}
                        withBorder radius="md" p="lg" shadow="sm"
                        bg="var(--app-surface)"
                        style={{ cursor: 'pointer', transition: 'transform 0.15s' }}
                        onClick={() => navigate(card.to)}
                        onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                        onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
                    >
                        <Group justify="space-between" mb="xs">
                            <ThemeIcon variant="light" color={card.color} size="lg" radius="md">
                                <card.icon size={20} />
                            </ThemeIcon>
                            <IconChevronRight size={14} color="var(--mantine-color-dimmed)" />
                        </Group>
                        <Text size="xl" fw={700}>{card.value}</Text>
                        <Text size="xs" c="dimmed" mt={2}>{card.label}</Text>
                    </Paper>
                ))}
            </SimpleGrid>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                {/* Pending Assignments */}
                <Card withBorder radius="md" p="lg" bg="var(--app-surface)">
                    <Group justify="space-between" mb="md">
                        <Group>
                            <ThemeIcon variant="light" color="orange" size="md" radius="md">
                                <IconClipboardList size={16} />
                            </ThemeIcon>
                            <Text fw={600}>Pending Assignments</Text>
                        </Group>
                        <Button variant="subtle" size="xs" onClick={() => navigate('/student-portal/assignments')}>
                            View all
                        </Button>
                    </Group>
                    {assignments.length === 0 ? (
                        <Text c="dimmed" size="sm" ta="center" py="md">No pending assignments 🎉</Text>
                    ) : (
                        <Stack gap="xs">
                            {assignments.map(a => (
                                <Paper key={a.id} withBorder radius="md" p="sm" bg="var(--app-surface-dim)">
                                    <Group justify="space-between">
                                        <div>
                                            <Text size="sm" fw={500} lineClamp={1}>{a.title}</Text>
                                            <Text size="xs" c="dimmed">{a.subject}</Text>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <Badge variant="light" color={getStatusColor(a.status)} size="xs">{a.status}</Badge>
                                            {a.dueDate && (
                                                <Text size="xs" c="dimmed" mt={2}>
                                                    {new Date(a.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                                </Text>
                                            )}
                                        </div>
                                    </Group>
                                </Paper>
                            ))}
                        </Stack>
                    )}
                </Card>

                {/* Upcoming Live Classes */}
                <Card withBorder radius="md" p="lg" bg="var(--app-surface)">
                    <Group justify="space-between" mb="md">
                        <Group>
                            <ThemeIcon variant="light" color="cyan" size="md" radius="md">
                                <IconBrandZoom size={16} />
                            </ThemeIcon>
                            <Text fw={600}>Upcoming Live Classes</Text>
                        </Group>
                        <Button variant="subtle" size="xs" onClick={() => navigate('/student-portal/live-classes')}>
                            View all
                        </Button>
                    </Group>
                    {liveClasses.length === 0 ? (
                        <Text c="dimmed" size="sm" ta="center" py="md">No upcoming live classes</Text>
                    ) : (
                        <Stack gap="xs">
                            {liveClasses.map(c => (
                                <Paper key={c.id} withBorder radius="md" p="sm" bg="var(--app-surface-dim)">
                                    <Group justify="space-between">
                                        <div>
                                            <Text size="sm" fw={500} lineClamp={1}>{c.title}</Text>
                                            <Text size="xs" c="dimmed">{c.subject?.name} · {c.provider}</Text>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <Badge variant={c.status === 'LIVE' ? 'filled' : 'light'} color={c.status === 'LIVE' ? 'green' : 'blue'} size="xs">
                                                {c.status === 'LIVE' ? '● LIVE' : new Date(c.scheduledFor).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                            </Badge>
                                        </div>
                                    </Group>
                                </Paper>
                            ))}
                        </Stack>
                    )}
                </Card>

                {/* Recent Grades */}
                <Card withBorder radius="md" p="lg" bg="var(--app-surface)">
                    <Group justify="space-between" mb="md">
                        <Group>
                            <ThemeIcon variant="light" color="green" size="md" radius="md">
                                <IconFileAnalytics size={16} />
                            </ThemeIcon>
                            <Text fw={600}>Recent Grades</Text>
                        </Group>
                        <Button variant="subtle" size="xs" onClick={() => navigate('/student/grades')}>
                            Full report
                        </Button>
                    </Group>
                    {grades.length === 0 ? (
                        <Text c="dimmed" size="sm" ta="center" py="md">No grades available yet</Text>
                    ) : (
                        <Stack gap="xs">
                            {grades.map((g, i) => {
                                const pct = Math.round((g.score / g.total) * 100);
                                return (
                                    <div key={i}>
                                        <Group justify="space-between" mb={4}>
                                            <Text size="sm" fw={500}>{g.subject}</Text>
                                            <Group gap="xs">
                                                <Badge variant="light" color={pct >= 70 ? 'green' : pct >= 50 ? 'yellow' : 'red'} size="sm">
                                                    {g.grade || `${pct}%`}
                                                </Badge>
                                                <Text size="xs" c="dimmed">{g.score}/{g.total}</Text>
                                            </Group>
                                        </Group>
                                        <Progress value={pct} size="xs" color={pct >= 70 ? 'green' : pct >= 50 ? 'yellow' : 'red'} radius="xl" />
                                    </div>
                                );
                            })}
                        </Stack>
                    )}
                </Card>

                {/* Quick Links */}
                <Card withBorder radius="md" p="lg" bg="var(--app-surface)">
                    <Text fw={600} mb="md">Quick Access</Text>
                    <SimpleGrid cols={2} spacing="sm">
                        {[
                            { label: 'My Subjects', icon: IconBook, to: '/student-portal/classes', color: 'teal' },
                            { label: 'CBT Quizzes', icon: IconBrain, to: '/student-portal/cbt', color: 'grape' },
                            { label: 'Leaderboard', icon: IconTrophy, to: '/student-portal/leaderboard', color: 'yellow' },
                            { label: 'Calendar', icon: IconCalendar, to: '/student-portal/calendar', color: 'blue' },
                        ].map(q => (
                            <Paper
                                key={q.label}
                                withBorder radius="md" p="md" ta="center" bg="var(--app-surface-dim)"
                                style={{ cursor: 'pointer', transition: 'transform 0.15s' }}
                                onClick={() => navigate(q.to)}
                                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')}
                                onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
                            >
                                <ThemeIcon variant="light" color={q.color} size="lg" radius="md" mx="auto" mb="xs">
                                    <q.icon size={20} />
                                </ThemeIcon>
                                <Text size="xs" fw={500}>{q.label}</Text>
                            </Paper>
                        ))}
                    </SimpleGrid>
                </Card>
            </SimpleGrid>
        </div>
    );
}
