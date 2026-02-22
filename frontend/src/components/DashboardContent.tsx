import {
    Box,
    Grid,
    Card,
    Text,
    Title,
    Stack,
    Group,
    Progress,
    Loader,
} from '@mantine/core';
import { AlertTriangle, Users, DollarSign, BookOpen } from 'lucide-react';
import { useEffect, useState } from 'react';
import { studentService } from '../services/studentService';
import { staffService } from '../services/staffService';
import { financeService } from '../services/financeService';
import { attendanceService } from '../services/attendanceService';
import { showErrorNotification } from '../utils/notifications';

export default function DashboardContent() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalStaff: 0,
        todayAttendance: 0,
        attendanceRate: 0,
        monthlyRevenue: 0,
        pendingFees: 0,
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch all data in parallel
            const [students, staff, transactions, attendance] = await Promise.all([
                studentService.getAll(),
                staffService.getAll(),
                financeService.getAll(),
                attendanceService.getByDate(new Date().toISOString().split('T')[0]),
            ]);

            // Calculate stats
            const totalStudents = students?.length || 0;
            const totalStaff = staff?.length || 0;
            const presentToday = attendance?.filter(a => a.status === 'PRESENT').length || 0;
            const attendanceRate = attendance?.length > 0
                ? Math.round((presentToday / attendance.length) * 100)
                : 0;

            // Calculate monthly revenue (current month)
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const monthlyTransactions = transactions?.filter((t: any) => {
                const transDate = new Date(t.transaction_date);
                return transDate.getMonth() === currentMonth &&
                    transDate.getFullYear() === currentYear &&
                    t.status === 'paid';
            }) || [];

            const monthlyRevenue = monthlyTransactions.reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

            // Calculate pending fees
            const pendingTransactions = transactions?.filter((t: any) =>
                t.status === 'pending' || t.status === 'overdue'
            ) || [];
            const pendingFees = pendingTransactions.reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

            setStats({
                totalStudents,
                totalStaff,
                todayAttendance: presentToday,
                attendanceRate,
                monthlyRevenue,
                pendingFees,
            });
        } catch (error: any) {
            showErrorNotification(error.message || 'Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box p="xl" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Loader size="lg" />
            </Box>
        );
    }

    return (
        <Box p="xl">
            <Title order={2} mb="xl">Dashboard Overview</Title>

            <Grid gutter="md">
                {/* Stats Cards */}
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <Card shadow="sm" padding="lg" radius={2} withBorder>
                        <Group gap="xs">
                            <Users size={24} color="var(--mantine-color-blue-6)" />
                            <Box>
                                <Text size="xs" c="dimmed">
                                    Total Students
                                </Text>
                                <Title order={3}>{stats.totalStudents}</Title>
                            </Box>
                        </Group>
                    </Card>
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <Card shadow="sm" padding="lg" radius={2} withBorder>
                        <Group gap="xs">
                            <Users size={24} color="var(--mantine-color-green-6)" />
                            <Box>
                                <Text size="xs" c="dimmed">
                                    Total Staff
                                </Text>
                                <Title order={3}>{stats.totalStaff}</Title>
                            </Box>
                        </Group>
                    </Card>
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <Card shadow="sm" padding="lg" radius={2} withBorder>
                        <Group gap="xs">
                            <BookOpen size={24} color="var(--mantine-color-teal-6)" />
                            <Box>
                                <Text size="xs" c="dimmed">
                                    Today's Attendance
                                </Text>
                                <Title order={3}>{stats.todayAttendance}</Title>
                                <Text size="xs" c="dimmed" mt={4}>
                                    {stats.attendanceRate}% present
                                </Text>
                            </Box>
                        </Group>
                    </Card>
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <Card shadow="sm" padding="lg" radius={2} withBorder>
                        <Group gap="xs">
                            <DollarSign size={24} color="var(--mantine-color-yellow-6)" />
                            <Box>
                                <Text size="xs" c="dimmed">
                                    Monthly Revenue
                                </Text>
                                <Title order={3}>${stats.monthlyRevenue.toLocaleString()}</Title>
                            </Box>
                        </Group>
                    </Card>
                </Grid.Col>

                {/* Financial Overview */}
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Card shadow="sm" padding="lg" radius={2} withBorder>
                        <Stack gap="md">
                            <Text size="lg" fw={600}>
                                Financial Overview
                            </Text>
                            <Box>
                                <Group justify="space-between" mb="xs">
                                    <Text size="sm">Monthly Revenue</Text>
                                    <Text size="sm" fw={600}>${stats.monthlyRevenue.toLocaleString()}</Text>
                                </Group>
                                <Progress value={75} color="teal" size="sm" radius={2} />
                            </Box>
                            <Box>
                                <Group justify="space-between">
                                    <Text size="sm" c="orange">Pending Fees</Text>
                                    <Text size="sm" fw={600} c="orange">${stats.pendingFees.toLocaleString()}</Text>
                                </Group>
                            </Box>
                        </Stack>
                    </Card>
                </Grid.Col>

                {/* Quick Stats */}
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Card shadow="sm" padding="lg" radius={2} withBorder>
                        <Stack gap="md">
                            <Text size="lg" fw={600}>
                                Quick Stats
                            </Text>
                            <Group justify="space-between">
                                <Text size="sm">Active Students</Text>
                                <Text size="sm" fw={600} c="green">{stats.totalStudents}</Text>
                            </Group>
                            <Group justify="space-between">
                                <Text size="sm">Staff Members</Text>
                                <Text size="sm" fw={600}>{stats.totalStaff}</Text>
                            </Group>
                            <Group justify="space-between">
                                <Text size="sm">Attendance Rate</Text>
                                <Text size="sm" fw={600} c={stats.attendanceRate >= 90 ? 'green' : 'orange'}>
                                    {stats.attendanceRate}%
                                </Text>
                            </Group>
                        </Stack>
                    </Card>
                </Grid.Col>

                {/* Alerts */}
                {stats.pendingFees > 0 && (
                    <Grid.Col span={12}>
                        <Card shadow="sm" padding="lg" radius={2} withBorder style={{ borderLeft: '4px solid orange' }}>
                            <Group gap="xs">
                                <AlertTriangle size={20} color="orange" />
                                <Box>
                                    <Text size="sm" fw={600}>
                                        Pending Fee Collection
                                    </Text>
                                    <Text size="sm" c="dimmed">
                                        ${stats.pendingFees.toLocaleString()} in pending and overdue fees
                                    </Text>
                                </Box>
                            </Group>
                        </Card>
                    </Grid.Col>
                )}
            </Grid>
        </Box>
    );
}
