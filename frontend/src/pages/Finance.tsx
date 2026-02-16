import { Tabs, Title, Text, SimpleGrid, Paper, Group, RingProgress } from '@mantine/core';
import { IconCurrencyDollar, IconTrendingUp, IconTrendingDown, IconUsers } from '@tabler/icons-react';
import Fees from './finance/Fees';
import Expenses from './finance/Expenses';
import Salaries from './finance/Salaries';
import { useState } from 'react';

// Stats Card Component for reusability
interface StatsCardProps {
    title: string;
    value: string;
    diff: number;
    icon: React.ElementType;
    color: string;
}

function StatsCard({ title, value, diff, icon: Icon, color }: StatsCardProps) {
    return (
        <Paper withBorder p="md" radius="md">
            <Group justify="space-between">
                <div>
                    <Text c="dimmed" tt="uppercase" fw={700} fz="xs">
                        {title}
                    </Text>
                    <Text fw={700} fz="xl">
                        {value}
                    </Text>
                </div>
                <RingProgress
                    size={80}
                    roundCaps
                    thickness={8}
                    sections={[{ value: diff, color: color }]}
                    label={
                        <Center>
                            <Icon size={20} stroke={1.5} />
                        </Center>
                    }
                />
            </Group>
            <Text c="dimmed" fz="xs" mt="sm">
                <Text component="span" c={diff > 0 ? 'teal' : 'red'} fw={700}>
                    {diff}%
                </Text>{' '}
                {diff > 0 ? 'increase' : 'decrease'} compared to last month
            </Text>
        </Paper>
    );
}

import { Center } from '@mantine/core';

export default function Finance() {
    const [activeTab, setActiveTab] = useState<string | null>('fees');

    return (
        <>
            <Title order={2} mb="md">Finance Overview</Title>

            <SimpleGrid cols={{ base: 1, sm: 3 }} mb="lg">
                <StatsCard
                    title="Total Revenue"
                    value="$128,430"
                    diff={12}
                    icon={IconCurrencyDollar}
                    color="teal"
                />
                <StatsCard
                    title="Total Expenses"
                    value="$42,500"
                    diff={-5}
                    icon={IconTrendingDown}
                    color="red"
                />
                <StatsCard
                    title="Net Profit"
                    value="$85,930"
                    diff={18}
                    icon={IconTrendingUp}
                    color="blue"
                />
            </SimpleGrid>

            <Tabs value={activeTab} onChange={setActiveTab} radius="md">
                <Tabs.List mb="md">
                    <Tabs.Tab value="fees" leftSection={<IconCurrencyDollar size={16} />}>
                        Fees Collection
                    </Tabs.Tab>
                    <Tabs.Tab value="expenses" leftSection={<IconTrendingDown size={16} />}>
                        Expenses
                    </Tabs.Tab>
                    <Tabs.Tab value="salaries" leftSection={<IconUsers size={16} />}>
                        Salaries & Payroll
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="fees">
                    <Fees />
                </Tabs.Panel>

                <Tabs.Panel value="expenses">
                    <Expenses />
                </Tabs.Panel>

                <Tabs.Panel value="salaries">
                    <Salaries />
                </Tabs.Panel>
            </Tabs>
        </>
    );
}
