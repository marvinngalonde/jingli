import React from 'react';
import { Container, Title, Text, Card, Grid, ThemeIcon, Group, Stack } from '@mantine/core';
import { IconStethoscope, IconBed, IconHeartbeat } from '@tabler/icons-react';

export function NurseDashboard() {
    const stats = [
        { title: 'Clinic Visits Today', value: '4', icon: IconStethoscope, color: 'blue' },
        { title: 'Admitted in Sick Bay', value: '1', icon: IconBed, color: 'orange' },
        { title: 'Critical Profiles', value: '15', icon: IconHeartbeat, color: 'red' },
    ];

    return (
        <Container size="xl" py="lg">
            <Title order={2} mb="xs">Clinic Dashboard</Title>
            <Text c="dimmed" mb="xl">Manage student health profiles and clinic visits.</Text>

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
                <Text fw={500} size="lg" mb="md">Today's Visits</Text>
                <Text c="dimmed">Clinic log table will go here.</Text>
            </Card>
        </Container>
    );
}
