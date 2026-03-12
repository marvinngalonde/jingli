import React from 'react';
import { Container, Title, Text, Card, Group, Stack, ThemeIcon } from '@mantine/core';
import { IconFlask, IconBottle } from '@tabler/icons-react';

export function LabManagement() {
    return (
        <Container size="xl" py="lg">
            <Title order={2} mb="xs">Laboratory Management</Title>
            <Text c="dimmed" mb="xl">Manage lab inventory, chemicals, and equipment bookings.</Text>

            <Group grow mb="xl">
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Group justify="space-between">
                        <Stack gap="xs">
                            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Total Equipment</Text>
                            <Text size="xl" fw={700}>150</Text>
                        </Stack>
                        <ThemeIcon color="blue" size="xl" radius="md" variant="light">
                            <IconFlask size={24} />
                        </ThemeIcon>
                    </Group>
                </Card>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Group justify="space-between">
                        <Stack gap="xs">
                            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Chemical Stocks</Text>
                            <Text size="xl" fw={700}>42</Text>
                        </Stack>
                        <ThemeIcon color="orange" size="xl" radius="md" variant="light">
                            <IconBottle size={24} />
                        </ThemeIcon>
                    </Group>
                </Card>
            </Group>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Text fw={500} size="lg" mb="md">Inventory List</Text>
                <Text c="dimmed">Lab inventory and chemical registry will go here.</Text>
            </Card>
        </Container>
    );
}
