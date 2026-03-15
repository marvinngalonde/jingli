import { Box, Group, Title, Text, Card, Stack, ThemeIcon, Button, Center } from '@mantine/core';
import { IconShieldCheck, IconRefresh } from '@tabler/icons-react';

export default function AuditLogs() {
    return (
        <Box p="md">
            <Group justify="space-between" mb="xl">
                <Box>
                    <Title order={2} c="dark.8" fw={800}>Platform Audit Logs</Title>
                    <Text c="dimmed" size="sm" mt={2}>Global security events, login attempts, and administrative actions.</Text>
                </Box>
            </Group>

            <Card withBorder radius="lg" shadow="sm" p="xl" mt="xl">
                <Center py={60}>
                    <Stack align="center" gap="md">
                        <ThemeIcon size={80} radius="100%" color="gray" variant="light">
                            <IconShieldCheck size={40} color="var(--mantine-color-gray-5)" stroke={1.5} />
                        </ThemeIcon>
                        <Title order={3} c="dark.7">Audit Trail Initializing</Title>
                        <Text c="dimmed" ta="center" maw={400}>
                            Security event logging infrastructure is currently being provisioned. Once active, all critical platform mutations will be visible here.
                        </Text>
                        <Button mt="md" variant="light" color="indigo" leftSection={<IconRefresh size={16} />}>
                            Refresh Status
                        </Button>
                    </Stack>
                </Center>
            </Card>
        </Box>
    );
}
