import { Title, Text, Grid, Paper, Group, ThemeIcon, rem, Badge, Timeline, RingProgress, Center } from '@mantine/core';
import {
    IconUsers,
    IconCurrencyDollar,
    IconCalendarStats,
    IconPlus,
    IconFileInvoice,
    IconSpeakerphone,
    IconCalendarEvent
} from '@tabler/icons-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Dashboard() {
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
