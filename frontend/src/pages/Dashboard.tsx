import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboardService';
import { api } from '../services/api';
import { Title, Text, Grid, Paper, Group, ThemeIcon, rem, Badge, Timeline, RingProgress, Center, SimpleGrid, Button } from '@mantine/core';
import {
    IconUsers,
    IconCurrencyDollar,
    IconCalendarStats,
    IconPlus,
    IconFileInvoice,
    IconSpeakerphone,
    IconCalendarEvent,
    IconBook,
    IconClock,
    IconSchool,
    IconUserPlus,
    IconSearch,
    IconArrowRight,
    IconHeartbeat,
    IconBus,
    IconBuildingBank,
    IconHome,
} from '@tabler/icons-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RecentNotices } from '../components/communication/RecentNotices';
import { useNavigate } from 'react-router-dom';
import { isTeacherRole } from '../utils/roles';

export function Dashboard() {
    const { user } = useAuth();
    const role = (user?.role || 'admin').toUpperCase();

    if (isTeacherRole(role)) return <TeacherDashboard />;
    if (role === 'STUDENT' || role === 'PARENT') return <StudentDashboard role={role.toLowerCase()} />;
    if (role === 'RECEPTION' || role === 'SENIOR_CLERK' || role === 'SECURITY_GUARD') return <ReceptionDashboard />;

    return <AdminDashboard />;
}

function ReceptionDashboard() {
    return (
        <div>
            <Title order={2} mb="lg">Reception Desk</Title>
            <Grid gutter="lg">
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <StatsCard title="Visitors Today" value="12" subtext="4 Currently In" icon={IconUsers} color="blue" iconBg="blue.1" />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <StatsCard title="Todays Attendance" value="94%" subtext="12 Late Arrivals" icon={IconCalendarStats} color="orange" iconBg="orange.1" />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <StatsCard title="Pending Inquiries" value="5" subtext="New admissions" icon={IconSpeakerphone} color="teal" iconBg="teal.1" />
                </Grid.Col>
            </Grid>
            <Grid mt="xl">
                <Grid.Col span={12}>
                    <Paper p="lg" radius="md" shadow="sm" withBorder>
                        <Title order={4} mb="md">Quick Actions</Title>
                        <Group>
                            <QuickAction title="Check In Visitor" icon={IconUserPlus} color="blue" />
                            <QuickAction title="New Admission" icon={IconPlus} color="green" />
                            <QuickAction title="Student Search" icon={IconSearch} color="violet" />
                            <QuickAction title="Collect Fees" icon={IconCurrencyDollar} color="teal" />
                        </Group>
                    </Paper>
                </Grid.Col>
            </Grid>
        </div>
    )
}

function TeacherDashboard() {
    return (
        <div>
            <Title order={2} mb="lg">Teacher Dashboard</Title>
            <Grid gutter="lg">
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <StatsCard title="My Classes" value="5" subtext="Grade 9 & 10" icon={IconSchool} color="blue" iconBg="blue.1" />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <StatsCard title="Students" value="145" subtext="Total across classes" icon={IconUsers} color="teal" iconBg="teal.1" />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <StatsCard title="Pending Grading" value="3" subtext="Assignments to review" icon={IconBook} color="orange" iconBg="orange.1" />
                </Grid.Col>
            </Grid>

            <Grid mt="xl" gutter="lg">
                <Grid.Col span={{ base: 12, md: 7 }}>
                    <Paper p="lg" radius="md" shadow="sm" withBorder>
                        <Title order={4} mb="md">Today's Schedule</Title>
                        <Timeline active={2} bulletSize={24} lineWidth={2}>
                            <Timeline.Item bullet={<IconClock size={12} />} title="08:00 - 09:00">
                                <Text size="sm">Mathematics - Grade 10A (Rm 101)</Text>
                            </Timeline.Item>
                            <Timeline.Item bullet={<IconClock size={12} />} title="09:00 - 10:00">
                                <Text size="sm">Physics - Grade 10B (Lab 1)</Text>
                            </Timeline.Item>
                            <Timeline.Item bullet={<IconClock size={12} />} title="10:30 - 11:30" lineVariant="dashed">
                                <Text size="sm">Free Period / Prep</Text>
                            </Timeline.Item>
                            <Timeline.Item bullet={<IconClock size={12} />} title="11:30 - 12:30">
                                <Text size="sm">Mathematics - Grade 9A (Rm 201)</Text>
                            </Timeline.Item>
                        </Timeline>
                    </Paper>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 5 }}>
                    <Paper p="lg" radius="md" shadow="sm" withBorder h="100%">
                        <Title order={4} mb="md">Quick Actions</Title>
                        <SimpleGrid cols={1} spacing="xs">
                            <QuickAction title="Mark Attendance" icon={IconCalendarStats} color="blue" />
                            <QuickAction title="Upload Marks" icon={IconFileInvoice} color="indigo" />
                            <QuickAction title="Create Assignment" icon={IconPlus} color="teal" />
                        </SimpleGrid>
                    </Paper>
                </Grid.Col>
            </Grid>
        </div>
    );
}

function StudentDashboard({ role }: { role: string }) {
    const navigate = useNavigate();
    return (
        <div>
            <Title order={2} mb="lg">{role === 'parent' ? 'Parent Portal' : 'Student Dashboard'}</Title>
            <Grid gutter="lg">
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <StatsCard title="Attendance" value="92%" subtext="Present 45/49 days" icon={IconCalendarStats} color="green" iconBg="green.1" isProgress />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <StatsCard title="Avg. Grade" value="A-" subtext="GPA: 3.8" icon={IconBook} color="violet" iconBg="violet.1" />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <StatsCard title="Fees Due" value="$0" subtext="All paid" icon={IconCurrencyDollar} color="blue" iconBg="blue.1" />
                </Grid.Col>
            </Grid>

            {/* Timetable or Notices for Students */}
            <Paper p="lg" radius="md" shadow="sm" withBorder mt="xl">
                <Group justify="space-between" mb="md">
                    <Title order={4}>Notice Board</Title>
                    <Button
                        variant="subtle"
                        size="xs"
                        rightSection={<IconArrowRight size={14} />}
                        onClick={() => navigate('/communication')}
                    >
                        View All
                    </Button>
                </Group>
                <RecentNotices />
            </Paper>
        </div>
    );
}

function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>(null);
    const [moduleStats, setModuleStats] = useState<any>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await dashboardService.getStats();
            setStats(data);

            // Load module stats in parallel
            const [expenseRes, transportRes, healthRes, hostelRes] = await Promise.allSettled([
                api.get('/expenses/stats'),
                api.get('/transport/stats'),
                api.get('/health/stats'),
                api.get('/hostel/stats'),
            ]);
            setModuleStats({
                expenses: expenseRes.status === 'fulfilled' ? expenseRes.value.data : null,
                transport: transportRes.status === 'fulfilled' ? transportRes.value.data : null,
                health: healthRes.status === 'fulfilled' ? healthRes.value.data : null,
                hostel: hostelRes.status === 'fulfilled' ? hostelRes.value.data : null,
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Title order={2} mb="lg">Super Admin Dashboard</Title>

            {/* Stats Cards */}
            <Grid gutter="lg">
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <StatsCard
                        title="Total Students"
                        value={loading ? '...' : stats?.students.toLocaleString()}
                        subtext={loading ? '' : "Active Students"}
                        subtextColor="teal"
                        icon={IconUsers}
                        color="blue"
                        iconBg="blue.1"
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <StatsCard
                        title="Total Staff"
                        value={loading ? '...' : stats?.staff.toLocaleString()}
                        subtext="Teachers & Admin"
                        subtextColor="c"
                        icon={IconUsers}
                        color="green"
                        iconBg="green.1"
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <StatsCard
                        title="Total Classes"
                        value={loading ? '...' : stats?.classes.toLocaleString()}
                        isProgress={false}
                        subtext="Active Sections"
                        icon={IconSchool}
                        color="orange"
                        iconBg="orange.1"
                    />
                </Grid.Col>
            </Grid>

            {/* Module Stats Row */}
            <Grid gutter="lg" mt="md">
                <Grid.Col span={{ base: 12, md: 3 }}>
                    <StatsCard
                        title="Expenses This Month"
                        value={loading ? '...' : `$${(moduleStats.expenses?.thisMonth || 0).toLocaleString()}`}
                        subtext={`${moduleStats.expenses?.pending || 0} pending`}
                        subtextColor="orange"
                        icon={IconBuildingBank}
                        color="red"
                        iconBg="red.1"
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 3 }}>
                    <StatsCard
                        title="Active Routes"
                        value={loading ? '...' : String(moduleStats.transport?.activeRoutes || 0)}
                        subtext={`${moduleStats.transport?.studentsOnRoutes || 0} students`}
                        subtextColor="teal"
                        icon={IconBus}
                        color="indigo"
                        iconBg="indigo.1"
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 3 }}>
                    <StatsCard
                        title="Clinic Visits Today"
                        value={loading ? '...' : String(moduleStats.health?.todayVisits || 0)}
                        subtext={`${moduleStats.health?.totalVisits || 0} total`}
                        subtextColor="c"
                        icon={IconHeartbeat}
                        color="pink"
                        iconBg="pink.1"
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 3 }}>
                    <StatsCard
                        title="Pending Exeats"
                        value={loading ? '...' : String(moduleStats.hostel?.pendingExeats || 0)}
                        subtext={`${moduleStats.hostel?.occupiedBeds || 0} beds occupied`}
                        subtextColor="teal"
                        icon={IconHome}
                        color="cyan"
                        iconBg="cyan.1"
                    />
                </Grid.Col>
            </Grid>

            <Group mt="xl" grow>
                <QuickAction title="Add Student" icon={IconPlus} color="blue" onClick={() => navigate('/students')} />
                <QuickAction title="Create Invoice" icon={IconFileInvoice} color="indigo" onClick={() => navigate('/finance')} />
                <QuickAction title="Send Notice" icon={IconSpeakerphone} color="orange" onClick={() => navigate('/communication')} />
                <QuickAction title="View Timetable" icon={IconCalendarEvent} color="teal" onClick={() => navigate('/academics')} />
            </Group>

            {/* Charts & Activity */}
            <Grid mt="xl" gutter="lg">
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Paper p="lg" radius="md" shadow="sm" withBorder h={420}>
                        <Title order={4} mb="md">Revenue Trend (6 Months)</Title>
                        <div style={{ width: '100%', height: 340 }}>
                            <ResponsiveContainer>
                                <AreaChart data={stats?.revenueTrend || []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                                    <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']} />
                                    <Area type="monotone" dataKey="uv" stroke="#3b82f6" fill="#eff6ff" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Paper>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Paper p="lg" radius="md" shadow="sm" withBorder h={420}>
                        <Group justify="space-between" mb="md">
                            <Title order={4}>School Notices</Title>
                            <Button
                                variant="subtle"
                                size="xs"
                                rightSection={<IconArrowRight size={14} />}
                                onClick={() => navigate('/communication')}
                            >
                                View All
                            </Button>
                        </Group>
                        <RecentNotices />
                    </Paper>
                </Grid.Col>
            </Grid>
        </div>
    );
}

function StatsCard({ title, value, subtext, subtextColor, icon: Icon, color, iconBg, isProgress }: any) {
    return (
        <Paper shadow="sm" p="lg" radius="md" withBorder>
            <Group align="flex-start" mb="xs">
                <ThemeIcon size={42} radius="md" color={iconBg || 'gray.1'}>
                    <Icon style={{ width: rem(24), height: rem(24) }} color={`var(--mantine-color-${color}-6)`} />
                </ThemeIcon>
                <div style={{ flex: 1 }}>
                    <Text size="sm" c="dimmed" fw={500}>
                        {title}
                    </Text>
                </div>
            </Group>

            {isProgress ? (
                <Group justify="center" mt="md">
                    <RingProgress
                        size={100}
                        roundCaps
                        thickness={8}
                        sections={[{ value: 94, color: color }]}
                        label={
                            <Center>
                                <Text c="dark" fw={700} size="xl">
                                    94%
                                </Text>
                            </Center>
                        }
                    />
                </Group>
            ) : (
                <div>
                    <Text fw={700} style={{ fontSize: rem(32), lineHeight: 1 }}>{value}</Text>
                    {subtext && (
                        <Badge variant="light" color={subtextColor || 'gray'} mt="sm" size="lg" radius="sm">
                            {subtext}
                        </Badge>
                    )}
                </div>
            )}
        </Paper>
    );
}

function QuickAction({ title, icon: Icon, color, onClick }: any) {
    return (
        <Paper shadow="sm" p="md" radius="md" withBorder style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onClick={onClick}>
            <Group>
                <ThemeIcon variant="light" color={color} size="lg" radius="md">
                    <Icon size={20} />
                </ThemeIcon>
                <Text fw={600} size="sm">{title}</Text>
            </Group>
        </Paper>
    )
}


