import React from 'react';
import { Container, Title, Text, Card, Group, Stack, ThemeIcon } from '@mantine/core';
import { IconUsers, IconFileText } from '@tabler/icons-react';

export function SenManagement() {
    return (
        <Container size="xl" py="lg">
            <Title order={2} mb="xs">Special Educational Needs (SEN)</Title>
            <Text c="dimmed" mb="xl">Manage Individualized Education Programs (IEPs) and SEN student profiles.</Text>

            <Group grow mb="xl">
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Group justify="space-between">
                        <Stack gap="xs">
                            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>SEN Students</Text>
                            <Text size="xl" fw={700}>28</Text>
                        </Stack>
                        <ThemeIcon color="grape" size="xl" radius="md" variant="light">
                            <IconUsers size={24} />
                        </ThemeIcon>
                    </Group>
                </Card>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Group justify="space-between">
                        <Stack gap="xs">
                            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Active IEPs</Text>
                            <Text size="xl" fw={700}>25</Text>
                        </Stack>
                        <ThemeIcon color="blue" size="xl" radius="md" variant="light">
                            <IconFileText size={24} />
                        </ThemeIcon>
                    </Group>
                </Card>
            </Group>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Text fw={500} size="lg" mb="md">Student Roster</Text>
                <Text c="dimmed">SEN student list and IEP tracking details will go here.</Text>
            </Card>
        </Container>
    );
}
