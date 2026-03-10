import {
    Title, Text, Group, Card, SimpleGrid, RingProgress, Stack, Box, Center,
    rem, ThemeIcon, Badge, Skeleton, Progress, Divider, useMantineTheme, Paper
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import {
    IconBuildingBank, IconUsers, IconChalkboard, IconActivity,
    IconArrowUpRight, IconArrowDownRight, IconMinus, IconTrendingUp,
    IconSchool, IconAlertTriangle
} from '@tabler/icons-react';
import { api } from '../../services/api';

// ─── Stat Card ───────────────────────────────────────────────────────────────
interface StatCardProps {
    title: string;
    value: number;
    icon: any;
    color: string;
    newThisMonth: number;
    growthPct: number | null;
    loading: boolean;
}

const StatCard = ({ title, value, icon: Icon, color, newThisMonth, growthPct, loading }: StatCardProps) => {
    const isUp = growthPct !== null && growthPct > 0;
    const isFlat = growthPct === null || growthPct === 0;

    return (
        <Card withBorder radius="lg" p="lg" shadow="xs">
            {loading ? (
                <Stack gap="sm">
                    <Skeleton height={14} width="60%" radius="sm" />
                    <Skeleton height={36} width="40%" radius="sm" />
                    <Skeleton height={12} width="80%" radius="sm" />
                </Stack>
            ) : (
                <>
                    <Group justify="space-between" align="flex-start" mb="xs">
                        <Box>
                            <Text c="dimmed" size="xs" tt="uppercase" fw={700} lts={0.5}>{title}</Text>
                            <Title order={2} mt={4} style={{ fontSize: rem(34), lineHeight: 1 }}>
                                {value.toLocaleString()}
                            </Title>
                        </Box>
                        <ThemeIcon variant="light" color={color} size={52} radius="xl">
                            <Icon size={24} stroke={1.5} />
                        </ThemeIcon>
                    </Group>

                    <Divider my="sm" />

                    <Group gap="xs" justify="space-between">
                        <Group gap={6}>
                            {isFlat ? (
                                <ThemeIcon size="xs" variant="transparent" color="gray"><IconMinus size={12} /></ThemeIcon>
                            ) : isUp ? (
                                <ThemeIcon size="xs" variant="transparent" color="teal"><IconArrowUpRight size={12} /></ThemeIcon>
                            ) : (
                                <ThemeIcon size="xs" variant="transparent" color="red"><IconArrowDownRight size={12} /></ThemeIcon>
                            )}
                            <Text size="xs" c={isFlat ? "dimmed" : isUp ? "teal" : "red"} fw={600}>
                                {isFlat ? 'No change' : `${Math.abs(growthPct!)}% vs last month`}
                            </Text>
                        </Group>
                        <Text size="xs" c="dimmed">+{newThisMonth} this month</Text>
                    </Group>
                </>
            )}
        </Card>
    );
};

// ─── Simple Bar Chart (no library needed) ────────────────────────────────────
const SimpleBarChart = ({ data, color, label }: { data: { month: string; count: number }[], color: string, label: string }) => {
    const max = Math.max(...data.map(d => d.count), 1);
    return (
        <Box>
            <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="sm">{label}</Text>
            <Group align="flex-end" gap={6} style={{ height: 80 }}>
                {data.map((d, i) => (
                    <Stack key={i} align="center" gap={4} style={{ flex: 1 }}>
                        <Box
                            style={{
                                width: '100%',
                                height: `${Math.max((d.count / max) * 64, 4)}px`,
                                background: `var(--mantine-color-${color}-6)`,
                                borderRadius: 4,
                                opacity: i === data.length - 1 ? 1 : 0.5 + (i / data.length) * 0.4,
                                transition: 'height 0.3s ease',
                            }}
                        />
                        <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap', fontSize: 10 }}>{d.month}</Text>
                    </Stack>
                ))}
            </Group>
        </Box>
    );
};

// ─── Global Dashboard ─────────────────────────────────────────────────────────
export default function GlobalDashboard() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['system-admin-stats'],
        queryFn: async () => {
            const res = await api.get('/system-admin/stats');
            return res.data;
        },
        refetchInterval: 60_000,
    });

    const activeRatio = stats
        ? Math.round((stats.activeSchools / Math.max(stats.totalSchools, 1)) * 100)
        : 0;
    const suspendedRatio = stats
        ? Math.round((stats.suspendedSchools / Math.max(stats.totalSchools, 1)) * 100)
        : 0;

    return (
        <Box p="md">
            {/* Header */}
            <Group justify="space-between" mb="xl">
                <Box>
                    <Title order={2} c="dark.8" fw={800}>Global Command Center</Title>
                    <Text c="dimmed" size="sm" mt={2}>Real-time platform overview across all tenant schools.</Text>
                </Box>
                <Badge
                    color="teal"
                    variant="dot"
                    size="lg"
                    style={{ padding: '8px 14px' }}
                >
                    Platform Online
                </Badge>
            </Group>

            {/* Stat Cards */}
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
                <StatCard
                    title="Network Schools"
                    value={stats?.totalSchools ?? 0}
                    icon={IconBuildingBank}
                    color="indigo"
                    newThisMonth={stats?.newSchoolsThisMonth ?? 0}
                    growthPct={stats?.schoolsGrowthPct ?? null}
                    loading={isLoading}
                />
                <StatCard
                    title="Total Students"
                    value={stats?.totalStudents ?? 0}
                    icon={IconSchool}
                    color="teal"
                    newThisMonth={stats?.newStudentsThisMonth ?? 0}
                    growthPct={stats?.studentsGrowthPct ?? null}
                    loading={isLoading}
                />
                <StatCard
                    title="Total Staff"
                    value={stats?.totalStaff ?? 0}
                    icon={IconChalkboard}
                    color="blue"
                    newThisMonth={0}
                    growthPct={null}
                    loading={isLoading}
                />
                <StatCard
                    title="System Users"
                    value={stats?.totalUsers ?? 0}
                    icon={IconUsers}
                    color="grape"
                    newThisMonth={0}
                    growthPct={null}
                    loading={isLoading}
                />
            </SimpleGrid>

            {/* Second Row */}
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg" mt="lg">
                {/* School Health */}
                <Card withBorder radius="lg" shadow="xs">
                    <Title order={5} mb="md" fw={700}>School Network Health</Title>
                    {isLoading ? (
                        <Stack gap="sm">
                            <Skeleton height={16} radius="sm" />
                            <Skeleton height={16} radius="sm" />
                            <Skeleton height={80} radius="sm" />
                        </Stack>
                    ) : (
                        <>
                            <Group justify="space-between" mb="xs">
                                <Text size="sm" c="dimmed">Active Schools</Text>
                                <Badge color="green" variant="light">{stats?.activeSchools ?? 0}</Badge>
                            </Group>
                            <Progress value={activeRatio} color="green" radius="xl" size="md" mb="md" />

                            <Group justify="space-between" mb="xs">
                                <Text size="sm" c="dimmed">Suspended Schools</Text>
                                <Badge color="red" variant="light">{stats?.suspendedSchools ?? 0}</Badge>
                            </Group>
                            <Progress value={suspendedRatio} color="red" radius="xl" size="md" mb="md" />

                            {stats?.suspendedSchools > 0 && (
                                <Group gap={6} mt="sm">
                                    <IconAlertTriangle size={14} color="orange" />
                                    <Text size="xs" c="orange">{stats.suspendedSchools} school(s) suspended — attention required</Text>
                                </Group>
                            )}
                        </>
                    )}
                </Card>

                {/* School Growth Chart */}
                <Card withBorder radius="lg" shadow="xs">
                    <Title order={5} mb="md" fw={700}>New Schools (6 months)</Title>
                    {isLoading ? (
                        <Skeleton height={110} radius="sm" />
                    ) : stats?.monthlySchoolGrowth?.length > 0 ? (
                        <SimpleBarChart data={stats.monthlySchoolGrowth} color="indigo" label="Schools Onboarded" />
                    ) : (
                        <Center h={80}>
                            <Stack align="center" gap="xs">
                                <IconTrendingUp size={32} color="gray" />
                                <Text size="sm" c="dimmed">No data yet</Text>
                            </Stack>
                        </Center>
                    )}
                </Card>

                {/* Student Growth Chart */}
                <Card withBorder radius="lg" shadow="xs">
                    <Title order={5} mb="md" fw={700}>New Students (6 months)</Title>
                    {isLoading ? (
                        <Skeleton height={110} radius="sm" />
                    ) : stats?.monthlyStudentGrowth?.length > 0 ? (
                        <SimpleBarChart data={stats.monthlyStudentGrowth} color="teal" label="Students Enrolled" />
                    ) : (
                        <Center h={80}>
                            <Stack align="center" gap="xs">
                                <IconTrendingUp size={32} color="gray" />
                                <Text size="sm" c="dimmed">No data yet</Text>
                            </Stack>
                        </Center>
                    )}
                </Card>
            </SimpleGrid>

            {/* Quick Stats Row */}
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="lg" mt="lg">
                {[
                    { label: 'Active Schools', value: stats?.activeSchools ?? '-', color: 'green' },
                    { label: 'Suspended', value: stats?.suspendedSchools ?? '-', color: 'red' },
                    { label: 'New This Month (Schools)', value: stats?.newSchoolsThisMonth ?? '-', color: 'indigo' },
                    { label: 'New Students This Month', value: stats?.newStudentsThisMonth ?? '-', color: 'teal' },
                ].map((item, i) => (
                    <Paper key={i} withBorder radius="md" p="md" style={{ borderLeft: `4px solid var(--mantine-color-${item.color}-5)` }}>
                        {isLoading ? <Skeleton height={32} radius="sm" /> : (
                            <>
                                <Title order={3} c={`${item.color}.7`}>{item.value}</Title>
                                <Text size="xs" c="dimmed" mt={4}>{item.label}</Text>
                            </>
                        )}
                    </Paper>
                ))}
            </SimpleGrid>
        </Box>
    );
}
