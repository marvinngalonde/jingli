import { SimpleGrid, Paper, Text } from '@mantine/core';
import type { ReportStats } from '../../services/reportsService';

interface ReportStatsGridProps {
    stats: ReportStats | null;
}

export function ReportStatsGrid({ stats }: ReportStatsGridProps) {
    return (
        <SimpleGrid cols={{ base: 1, sm: 4 }} mb="lg">
            <Paper withBorder p="md" radius="md">
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Reports Generated</Text>
                <Text size="xl" fw={700}>{stats?.totalGenerated || 0}</Text>
            </Paper>
            <Paper withBorder p="md" radius="md">
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Downloads</Text>
                <Text size="xl" fw={700}>{stats?.downloads || 0}</Text>
            </Paper>
            <Paper withBorder p="md" radius="md">
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Pending</Text>
                <Text size="xl" fw={700} c="orange">{stats?.pending || 0}</Text>
            </Paper>
            <Paper withBorder p="md" radius="md">
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Storage Used</Text>
                <Text size="xl" fw={700} c="blue">{stats?.storageUsed || '0.0 GB'}</Text>
            </Paper>
        </SimpleGrid>
    );
}
