import React from 'react';
import { Container, Title, Text, Card, Grid, ThemeIcon, Group, Stack } from '@mantine/core';
import { IconBuilding, IconBed, IconWalk } from '@tabler/icons-react';

export function HostelWardenDashboard() {
    const stats = [
        { title: 'Total Beds', value: '250', icon: IconBuilding, color: 'blue' },
        { title: 'Occupied Beds', value: '210', icon: IconBed, color: 'green' },
        { title: 'Active Exeats', value: '5', icon: IconWalk, color: 'orange' },
    ];

    return (
        <Container size="xl" py="lg">
            <Title order={2} mb="xs">Hostel Management</Title>
            <Text c="dimmed" mb="xl">Monitor hostel occupancy, exeats, and room allocations.</Text>

            <Grid>
                {stats.map((stat) => (
                    <Grid.Col span={{ base: 12, sm: 4 }} key={stat.title}>
                        <Card shadow="sm" padding="lg" radius="md" withBorder>
                            <Group justify="space-between">
                                <Stack gap="xs">
                                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                        {stat.title}
                                    </Text>
                                    <Text size="xl" fw={700}>
                                        {stat.value}
                                    </Text>
                                </Stack>
                                <ThemeIcon color={stat.color} size="xl" radius="md" variant="light">
                                    <stat.icon size={24} />
                                </ThemeIcon>
                            </Group>
                        </Card>
                    </Grid.Col>
                ))}
            </Grid>

            <Card shadow="sm" padding="lg" radius="md" withBorder mt="xl">
                <Text fw={500} size="lg" mb="md">Recent Exeats</Text>
                <Text c="dimmed">Student exeat table will go here.</Text>
            </Card>
        </Container>
    );
}
