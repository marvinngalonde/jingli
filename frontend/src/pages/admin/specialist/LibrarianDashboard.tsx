import React from 'react';
import { Container, Title, Text, Card, Grid, ThemeIcon, Group, Stack } from '@mantine/core';
import { IconBooks, IconBookOff, IconUsers } from '@tabler/icons-react';

export function LibrarianDashboard() {
    const stats = [
        { title: 'Total Books', value: '1,245', icon: IconBooks, color: 'blue' },
        { title: 'Currently Issued', value: '84', icon: IconUsers, color: 'green' },
        { title: 'Overdue Books', value: '12', icon: IconBookOff, color: 'red' },
    ];

    return (
        <Container size="xl" py="lg">
            <Title order={2} mb="xs">Library Dashboard</Title>
            <Text c="dimmed" mb="xl">Manage the school library inventory and circulations.</Text>

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

            {/* Future implementation: List of overdue books, recent returns, etc. */}
            <Card shadow="sm" padding="lg" radius="md" withBorder mt="xl">
                <Text fw={500} size="lg" mb="md">Recent Activity</Text>
                <Text c="dimmed">Library circulation table will go here.</Text>
            </Card>
        </Container>
    );
}
