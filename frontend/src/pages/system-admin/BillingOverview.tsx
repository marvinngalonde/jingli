import { Box, Group, Title, Text, Card, Stack, ThemeIcon, Button, Center } from '@mantine/core';
import { IconReceipt, IconRefresh } from '@tabler/icons-react';

export default function BillingOverview() {
    return (
        <Box p="md">
            <Group justify="space-between" mb="xl">
                <Box>
                    <Title order={2} c="dark.8" fw={800}>Billing & Subscriptions</Title>
                    <Text c="dimmed" size="sm" mt={2}>Manage tenant subscriptions, invoicing, and revenue streams.</Text>
                </Box>
            </Group>

            <Card withBorder radius="lg" shadow="sm" p="xl" mt="xl">
                <Center py={60}>
                    <Stack align="center" gap="md">
                        <ThemeIcon size={80} radius="100%" color="gray" variant="light">
                            <IconReceipt size={40} color="var(--mantine-color-gray-5)" stroke={1.5} />
                        </ThemeIcon>
                        <Title order={3} c="dark.7">Billing Engine In Development</Title>
                        <Text c="dimmed" ta="center" maw={400}>
                            The global billing and subscription management module is currently being finalized. Check back soon for Stripe integration and revenue analytics.
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
