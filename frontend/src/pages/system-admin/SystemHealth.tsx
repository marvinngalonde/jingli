import { Box, Group, Title, Text, Card, Stack, ThemeIcon, Button, Center } from '@mantine/core';
import { IconActivity, IconRefresh } from '@tabler/icons-react';

export default function SystemHealth() {
    return (
        <Box p="md">
            <Group justify="space-between" mb="xl">
                <Box>
                    <Title order={2} c="dark.8" fw={800}>System Health</Title>
                    <Text c="dimmed" size="sm" mt={2}>Database connections, server latency, and background worker status.</Text>
                </Box>
            </Group>

            <Card withBorder radius="lg" shadow="sm" p="xl" mt="xl">
                <Center py={60}>
                    <Stack align="center" gap="md">
                        <ThemeIcon size={80} radius="100%" color="green" variant="light">
                            <IconActivity size={40} color="var(--mantine-color-green-6)" stroke={1.5} />
                        </ThemeIcon>
                        <Title order={3} c="dark.7">All Systems Operational</Title>
                        <Text c="dimmed" ta="center" maw={400}>
                            The core metrics dashboard is under construction. Currently, API servers, PostgreSQL databases, and real-time sockets are functioning within normal parameters.
                        </Text>
                        <Button mt="md" variant="light" color="green" leftSection={<IconRefresh size={16} />}>
                            Run Health Check
                        </Button>
                    </Stack>
                </Center>
            </Card>
        </Box>
    );
}
