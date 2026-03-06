import { Title, Grid, Paper, SimpleGrid, useMantineTheme } from '@mantine/core';
import {
    IconUsers,
    IconCalendarStats,
    IconSpeakerphone,
    IconUserPlus,
    IconPlus,
    IconSearch,
    IconCurrencyDollar
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { visitorsService } from '../../services/visitorsService';
import { attendanceService } from '../../services/attendanceService';
import { studentService } from '../../services/studentService';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { QuickAction } from '../../components/dashboard/QuickAction';

export default function ReceptionDashboard() {
    const navigate = useNavigate();
    const theme = useMantineTheme();

    const { data: visitors, isLoading: visitorsLoading } = useQuery({
        queryKey: ['reception-visitors'],
        queryFn: () => visitorsService.getAll(),
    });

    const { data: attendance, isLoading: attendanceLoading } = useQuery({
        queryKey: ['reception-attendance'],
        queryFn: () => attendanceService.getByDate(new Date().toISOString().split('T')[0]),
    });

    const { data: students, isLoading: studentsLoading } = useQuery({
        queryKey: ['reception-students'],
        queryFn: () => studentService.getAll(),
    });

    const visitorsToday = visitors?.filter(v => new Date(v.checkIn).toDateString() === new Date().toDateString()) || [];
    const currentlyIn = visitorsToday.filter(v => v.status === 'IN').length;

    const presentCount = attendance?.filter(a => a.status === 'PRESENT').length || 0;
    const totalCount = attendance?.length || 0;
    const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
    const lateCount = attendance?.filter(a => a.status === 'LATE').length || 0;

    // Estimate pending inquiries
    const pendingAdmissions = students?.filter(s => !s.sectionId).length || 0;

    return (
        <div>
            <Title order={2} mb="lg">Reception Dashboard</Title>

            <Grid gutter="lg">
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <StatsCard
                        title="Visitors Today"
                        value={visitorsLoading ? '...' : String(visitorsToday.length)}
                        subtext={`${currentlyIn} Currently In`}
                        icon={IconUsers}
                        color="blue"
                        iconBg="blue.1"
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <StatsCard
                        title="Todays Attendance"
                        value={attendanceLoading ? '...' : `${attendanceRate}%`}
                        subtext={`${lateCount} Late Arrivals`}
                        icon={IconCalendarStats}
                        color="orange"
                        iconBg="orange.1"
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <StatsCard
                        title="Pending Admissions"
                        value={studentsLoading ? '...' : String(pendingAdmissions)}
                        subtext="Awaiting verification"
                        icon={IconSpeakerphone}
                        color="teal"
                        iconBg="teal.1"
                    />
                </Grid.Col>
            </Grid>

            <Paper p="xl" radius="md" shadow="sm" withBorder mt="xl">
                <Title order={4} mb="lg">Quick Actions</Title>
                <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl">
                    <QuickAction
                        title="Check In Visitor"
                        icon={IconUserPlus}
                        color="blue"
                        onClick={() => navigate('/reception/visitors')}
                    />
                    <QuickAction
                        title="New Admission"
                        icon={IconPlus}
                        color="green"
                        onClick={() => navigate('/reception/admissions')}
                    />
                    <QuickAction
                        title="Student Search"
                        icon={IconSearch}
                        color="violet"
                        onClick={() => navigate('/reception/students')}
                    />
                    <QuickAction
                        title="Collect Fees"
                        icon={IconCurrencyDollar}
                        color="teal"
                        onClick={() => navigate('/reception/fees')}
                    />
                </SimpleGrid>
            </Paper>
        </div>
    );
}
