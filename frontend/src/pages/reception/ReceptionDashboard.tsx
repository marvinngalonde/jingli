import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    Grid, Paper, Text, Group, ThemeIcon, Badge, Button, Table, ScrollArea,
    Stack, Avatar, ActionIcon, Skeleton, SimpleGrid
} from '@mantine/core';
import {
    IconUsers,
    IconCalendarStats,
    IconUserPlus,
    IconPlus,
    IconSearch,
    IconCurrencyDollar,
    IconHeartbeat,
    IconShield,
    IconArrowRight,
    IconHome2,
    IconEye,
    IconSpeakerphone,
} from '@tabler/icons-react';
import { visitorsService } from '../../services/visitorsService';
import { attendanceService } from '../../services/attendanceService';
import { studentService } from '../../services/studentService';
import { PageHeader } from '../../components/common/PageHeader';
import { StatsCard } from '../../components/dashboard/StatsCard';

const QUICK_ACTIONS = [
    { title: 'Check In Visitor', icon: IconUserPlus, color: 'blue', to: '/reception/visitors' },
    { title: 'New Admission', icon: IconPlus, color: 'green', to: '/reception/admissions' },
    { title: 'Student Search', icon: IconSearch, color: 'violet', to: '/reception/students' },
    { title: 'Collect Fees', icon: IconCurrencyDollar, color: 'teal', to: '/reception/fees' },
    { title: 'Health / Clinic', icon: IconHeartbeat, color: 'red', to: '/reception/health' },
    { title: 'Discipline', icon: IconShield, color: 'orange', to: '/reception/discipline' },
    { title: 'Hostel', icon: IconHome2, color: 'indigo', to: '/reception/hostel' },
    { title: 'Communication', icon: IconSpeakerphone, color: 'grape', to: '/reception/communication' },
];

export default function ReceptionDashboard() {
    const navigate = useNavigate();

    const { data: visitorsData, isLoading: visitorsLoading } = useQuery({
        queryKey: ['reception-visitors'],
        queryFn: () => visitorsService.getAll(undefined, 1, 100),
    });

    const visitors = visitorsData?.data;

    const { data: attendance, isLoading: attendanceLoading } = useQuery({
        queryKey: ['reception-attendance'],
        queryFn: () => attendanceService.getByDate(new Date().toISOString().split('T')[0]),
    });

    const { data: studentsData, isLoading: studentsLoading } = useQuery({
        queryKey: ['reception-students'],
        queryFn: () => studentService.getAll({ limit: 1000 }),
    });

    const students = studentsData?.data;

    const visitorsToday = visitors?.filter(v => new Date(v.checkIn).toDateString() === new Date().toDateString()) || [];
    const currentlyIn = visitorsToday.filter(v => v.status === 'IN').length;

    const presentCount = attendance?.filter(a => a.status === 'PRESENT').length || 0;
    const totalCount = attendance?.length || 0;
    const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
    const lateCount = attendance?.filter(a => a.status === 'LATE').length || 0;
    const pendingAdmissions = students?.filter((s: any) => !s.sectionId).length || 0;
    const recentVisitors = visitorsToday.slice(0, 5);

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div>
            <PageHeader
                title="Reception Dashboard"
                subtitle={`${dateStr} · ${timeStr}`}
            />

            {/* Stats Row */}
            <Grid gutter="lg" mb="lg">
                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                    <StatsCard
                        title="Visitors Today"
                        value={visitorsLoading ? '...' : String(visitorsToday.length)}
                        subtext={`${currentlyIn} Currently In`}
                        subtextColor="blue"
                        icon={IconUsers}
                        color="blue"
                        iconBg="blue.1"
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                    <StatsCard
                        title="Today's Attendance"
                        value={attendanceLoading ? '...' : `${attendanceRate}%`}
                        subtext={`${lateCount} Late Arrivals`}
                        subtextColor="orange"
                        icon={IconCalendarStats}
                        color="orange"
                        iconBg="orange.1"
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                    <StatsCard
                        title="Pending Admissions"
                        value={studentsLoading ? '...' : String(pendingAdmissions)}
                        subtext="Awaiting Verification"
                        subtextColor="teal"
                        icon={IconUserPlus}
                        color="teal"
                        iconBg="teal.1"
                    />
                </Grid.Col>
            </Grid>

            {/* Quick Actions */}
            <Paper p="lg" radius="md" shadow="sm" withBorder mb="lg">
                <Text fw={600} size="sm" c="dimmed" tt="uppercase" mb="md">Quick Actions</Text>
                <SimpleGrid cols={{ base: 2, xs: 4, md: 8 }} spacing="sm">
                    {QUICK_ACTIONS.map(action => (
                        <Stack
                            key={action.title}
                            align="center"
                            gap={6}
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigate(action.to)}
                        >
                            <ActionIcon
                                size={48}
                                radius="xl"
                                variant="light"
                                color={action.color}
                            >
                                <action.icon size={22} />
                            </ActionIcon>
                            <Text size="xs" ta="center" fw={500} c="dimmed">{action.title}</Text>
                        </Stack>
                    ))}
                </SimpleGrid>
            </Paper>

            {/* Recent Visitors */}
            <Paper p="lg" radius="md" shadow="sm" withBorder>
                <Group justify="space-between" mb="md">
                    <Text fw={600} size="sm" c="dimmed" tt="uppercase">Recent Visitors Today</Text>
                    <Button
                        variant="subtle"
                        size="xs"
                        rightSection={<IconArrowRight size={14} />}
                        onClick={() => navigate('/reception/visitors')}
                    >
                        View All
                    </Button>
                </Group>

                {visitorsLoading ? (
                    <Stack gap="xs">
                        {[1, 2, 3].map(i => <Skeleton key={i} height={40} radius="md" />)}
                    </Stack>
                ) : recentVisitors.length === 0 ? (
                    <Text c="dimmed" ta="center" py="xl" size="sm">No visitors yet today</Text>
                ) : (
                    <ScrollArea>
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Visitor</Table.Th>
                                    <Table.Th>Purpose</Table.Th>
                                    <Table.Th>Check In</Table.Th>
                                    <Table.Th>Status</Table.Th>
                                    <Table.Th></Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {recentVisitors.map((v: any) => (
                                    <Table.Tr key={v.id}>
                                        <Table.Td>
                                            <Group gap="sm">
                                                <Avatar radius="xl" size="sm" color="blue">
                                                    {v.name?.[0]?.toUpperCase()}
                                                </Avatar>
                                                <div>
                                                    <Text size="sm" fw={600}>{v.name}</Text>
                                                    <Text size="xs" c="dimmed">{v.phone || v.idNumber || '—'}</Text>
                                                </div>
                                            </Group>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm">{v.purpose || '—'}</Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm">
                                                {new Date(v.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge
                                                color={v.status === 'IN' ? 'green' : 'gray'}
                                                variant="light"
                                                size="sm"
                                            >
                                                {v.status === 'IN' ? 'In Premises' : 'Checked Out'}
                                            </Badge>
                                        </Table.Td>
                                        <Table.Td>
                                            <ActionIcon
                                                variant="subtle"
                                                color="gray"
                                                size="sm"
                                                onClick={() => navigate('/reception/visitors')}
                                            >
                                                <IconEye size={14} />
                                            </ActionIcon>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    </ScrollArea>
                )}
            </Paper>
        </div>
    );
}
