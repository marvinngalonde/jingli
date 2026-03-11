import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';
import { api } from '../services/api';
import { Title, Text, Grid, Paper, Group, ThemeIcon, rem, Badge, Button } from '@mantine/core';
import {
    IconUsers,
    IconCurrencyDollar,
    IconCalendarStats,
    IconPlus,
    IconFileInvoice,
    IconSpeakerphone,
    IconCalendarEvent,
    IconSchool,
    IconArrowRight,
    IconHeartbeat,
    IconBus,
    IconBuildingBank,
    IconHome,
} from '@tabler/icons-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RecentNotices } from '../components/communication/RecentNotices';
import { useNavigate, Navigate } from 'react-router-dom';
import { StatsCard } from '../components/dashboard/StatsCard';
import { QuickAction } from '../components/dashboard/QuickAction';

export function Dashboard() {
    const { user } = useAuth();
    const role = (user?.role || 'admin').toUpperCase();

    if (['RECEPTION', 'SENIOR_CLERK'].includes(role)) {
        return <Navigate to="/reception/dashboard" replace />;
    }

    if (['BURSAR', 'FINANCE'].includes(role)) {
        return <Navigate to="/finance/dashboard" replace />;
    }

    return <AdminDashboard />;
}

function AdminDashboard() {
    const navigate = useNavigate();

    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: () => dashboardService.getStats(),
        staleTime: 5 * 60 * 1000,
    });

    const { data: moduleStats, isLoading: moduleStatsLoading } = useQuery({
        queryKey: ['dashboard-module-stats'],
        queryFn: async () => {
            const [expenseRes, transportRes, healthRes, hostelRes] = await Promise.allSettled([
                api.get('/expenses/stats'),
                api.get('/transport/stats'),
                api.get('/health/stats'),
                api.get('/hostel/stats'),
            ]);
            return {
                expenses: expenseRes.status === 'fulfilled' ? expenseRes.value.data : null,
                transport: transportRes.status === 'fulfilled' ? transportRes.value.data : null,
                health: healthRes.status === 'fulfilled' ? healthRes.value.data : null,
                hostel: hostelRes.status === 'fulfilled' ? hostelRes.value.data : null,
            };
        },
        staleTime: 5 * 60 * 1000,
    });

    const loading = statsLoading || moduleStatsLoading;

    return (
        <div>
            <Title order={4} mb="md" fw={700} style={{ color: 'var(--mantine-color-dark-8)' }}>
                Admin Dashboard
            </Title>

            {/* Stats Cards */}
            <Grid gutter="lg">
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <StatsCard
                        title="Total Students"
                        value={loading ? '...' : (stats?.students.toLocaleString() || '0')}
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
                        value={loading ? '...' : (stats?.staff.toLocaleString() || '0')}
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
                        value={loading ? '...' : (stats?.classes.toLocaleString() || '0')}
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
                        value={loading ? '...' : `$${(moduleStats?.expenses?.thisMonth || 0).toLocaleString()}`}
                        subtext={`${moduleStats?.expenses?.pending || 0} pending`}
                        subtextColor="orange"
                        icon={IconBuildingBank}
                        color="red"
                        iconBg="red.1"
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 3 }}>
                    <StatsCard
                        title="Active Routes"
                        value={loading ? '...' : String(moduleStats?.transport?.activeRoutes || 0)}
                        subtext={`${moduleStats?.transport?.studentsOnRoutes || 0} students`}
                        subtextColor="teal"
                        icon={IconBus}
                        color="indigo"
                        iconBg="indigo.1"
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 3 }}>
                    <StatsCard
                        title="Clinic Visits Today"
                        value={loading ? '...' : String(moduleStats?.health?.todayVisits || 0)}
                        subtext={`${moduleStats?.health?.totalVisits || 0} total`}
                        subtextColor="c"
                        icon={IconHeartbeat}
                        color="pink"
                        iconBg="pink.1"
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 3 }}>
                    <StatsCard
                        title="Pending Exeats"
                        value={loading ? '...' : String(moduleStats?.hostel?.pendingExeats || 0)}
                        subtext={`${moduleStats?.hostel?.occupiedBeds || 0} beds occupied`}
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
                                <AreaChart data={(stats as any)?.revenueTrend || []}>
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
