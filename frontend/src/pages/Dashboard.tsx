import { useAuth } from '../context/AuthContext';
import { Title, Text, Grid, Paper, Group, ThemeIcon, rem, Badge, Timeline, RingProgress, Center, SimpleGrid } from '@mantine/core';
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
    IconSchool
} from '@tabler/icons-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Dashboard() {
    const { user } = useAuth();
    const role = user?.role || 'admin';

    if (role === 'teacher') return <TeacherDashboard />;
    if (role === 'student' || role === 'parent') return <StudentDashboard role={role} />;

    return <AdminDashboard />;
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
                <Title order={4} mb="md">Notice Board</Title>
                <Timeline active={0} bulletSize={18} lineWidth={2}>
                    <Timeline.Item bullet={<IconSpeakerphone size={12} />} title="School Trip to Museum">
                        <Text c="dimmed" size="xs" mt={4}>Tomorrow, 08:30 AM</Text>
                        <Text size="sm">Permission slips must be signed by parents.</Text>
                    </Timeline.Item>
                    <Timeline.Item bullet={<IconBook size={12} />} title="Mid-Term Exams Schedule Released">
                        <Text c="dimmed" size="xs" mt={4}>2 days ago</Text>
                    </Timeline.Item>
                </Timeline>
            </Paper>
        </div>
    );
}

function AdminDashboard() {
    return (
        <div>
            <Title order={2} mb="lg">Super Admin Dashboard</Title>

            {/* Stats Cards */}
            <Grid gutter="lg">
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <StatsCard
                        title="Total Students"
                        value="1,450"
                        subtext="+5% vs last month"
                        subtextColor="teal"
                        icon={IconUsers}
                        color="blue"
                        iconBg="blue.1"
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <StatsCard
                        title="Revenue MTD"
                        value="$125,000"
                        subtext="$15k outstanding"
                        subtextColor="c"
                        icon={IconCurrencyDollar}
                        color="green"
                        iconBg="green.1"
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <StatsCard
                        title="Avg. Attendance Today"
                        value="94%"
                        isProgress
                        icon={IconCalendarStats}
                        color="orange"
                        iconBg="orange.1"
                    />
                </Grid.Col>
            </Grid>

            {/* Quick Actions */}
            <Group mt="xl" grow>
                <QuickAction title="Add Student" icon={IconPlus} color="blue" />
                <QuickAction title="Create Invoice" icon={IconFileInvoice} color="indigo" />
                <QuickAction title="Send Notice" icon={IconSpeakerphone} color="orange" />
                <QuickAction title="View Timetable" icon={IconCalendarEvent} color="teal" />
            </Group>

            {/* Charts & Activity */}
            <Grid mt="xl" gutter="lg">
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Paper p="lg" radius="md" shadow="sm" withBorder h={420}>
                        <Title order={4} mb="md">Revenue Trend (Last 6 Months)</Title>
                        <div style={{ width: '100%', height: 340 }}>
                            <ResponsiveContainer>
                                <AreaChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="uv" stroke="#3b82f6" fill="#eff6ff" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Paper>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Paper p="lg" radius="md" shadow="sm" withBorder h={420}>
                        <Title order={4} mb="lg">Recent Activity Feed</Title>

                        <Timeline active={1} bulletSize={18} lineWidth={2}>
                            <Timeline.Item bullet={<div style={{ width: 10, height: 10, borderRadius: 10, background: '#3b82f6' }}></div>} title="John Doe paid invoice #123">
                                <Text c="dimmed" size="xs" mt={4}>14 hours ago</Text>
                            </Timeline.Item>

                            <Timeline.Item bullet={<div style={{ width: 10, height: 10, borderRadius: 10, background: '#3b82f6' }}></div>} title="Teacher Sarah posted Homework">
                                <Text c="dimmed" size="xs" mt={4}>14 hours ago</Text>
                                <Text size="xs" mt={4}>Grade 10B - Mathematics</Text>
                            </Timeline.Item>

                            <Timeline.Item bullet={<div style={{ width: 10, height: 10, borderRadius: 10, background: '#3b82f6' }}></div>} title="New Student Registration" lineVariant="dashed">
                                <Text c="dimmed" size="xs" mt={4}>Yesterday</Text>
                                <Text size="xs" mt={4}>Student: Michael Bay</Text>
                            </Timeline.Item>
                            <Timeline.Item bullet={<div style={{ width: 10, height: 10, borderRadius: 10, background: '#9ca3af' }}></div>} title="System Update">
                                <Text c="dimmed" size="xs" mt={4}>2 days ago</Text>
                            </Timeline.Item>
                        </Timeline>
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

function QuickAction({ title, icon: Icon, color }: any) {
    return (
        <Paper shadow="sm" p="md" radius="md" withBorder style={{ cursor: 'pointer', transition: 'transform 0.2s' }} >
            <Group>
                <ThemeIcon variant="light" color={color} size="lg" radius="md">
                    <Icon size={20} />
                </ThemeIcon>
                <Text fw={600} size="sm">{title}</Text>
            </Group>
        </Paper>
    )
}

const data = [
    { name: 'Jan', uv: 200 },
    { name: 'Feb', uv: 300 },
    { name: 'Mar', uv: 200 },
    { name: 'Apr', uv: 600 },
    { name: 'May', uv: 500 },
    { name: 'Jun', uv: 800 },
];
