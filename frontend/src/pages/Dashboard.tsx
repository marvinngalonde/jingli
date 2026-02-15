import { Title, Text, Grid, Paper, Group, RingProgress, Center, ThemeIcon, rem } from '@mantine/core';
import { IconUserPlus, IconSchool, IconCoin, IconArrowUpRight, IconArrowDownRight } from '@tabler/icons-react';

export function Dashboard() {
    return (
        <div>
            <Title order={2} mb="xl">Dashboard Overview</Title>

            <Grid>
                <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                    <StatsCard title="Total Students" value="1,234" diff={12} icon={IconUserPlus} color="blue" />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                    <StatsCard title="Active Classes" value="42" diff={-2} icon={IconSchool} color="cyan" />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
                    <StatsCard title="Revenue (M)" value="$450k" diff={18} icon={IconCoin} color="green" />
                </Grid.Col>
            </Grid>

            <Grid mt="xl">
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Paper p="md" radius="md" withBorder h={400}>
                        <Title order={4}>Attendance Analytics</Title>
                        <Center h="100%">
                            <Text c="dimmed">Chart Component Placeholder</Text>
                        </Center>
                    </Paper>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Paper p="md" radius="md" withBorder h={400}>
                        <Title order={4}>Recent Activity</Title>
                        <Center h="100%">
                            <Text c="dimmed">List Component Placeholder</Text>
                        </Center>
                    </Paper>
                </Grid.Col>
            </Grid>
        </div>
    );
}

function StatsCard({ title, value, diff, icon: Icon, color }: any) {
    const DiffIcon = diff > 0 ? IconArrowUpRight : IconArrowDownRight;
    const diffColor = diff > 0 ? 'teal' : 'red';

    return (
        <Paper withBorder p="md" radius="md">
            <Group justify="space-between">
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                    {title}
                </Text>
                <ThemeIcon color="gray" variant="light">
                    <Icon style={{ width: rem(18), height: rem(18) }} />
                </ThemeIcon>
            </Group>

            <Group align="flex-end" gap="xs" mt={25}>
                <Text fw={700} size="xl">{value}</Text>
                <Text c={diffColor} fw={700} size="sm" style={{ display: 'flex', alignItems: 'center' }}>
                    <span>{diff}%</span>
                    <DiffIcon size="1rem" stroke={1.5} />
                </Text>
            </Group>

            <Text size="xs" c="dimmed" mt={7}>
                Compared to previous month
            </Text>
        </Paper>
    );
}
