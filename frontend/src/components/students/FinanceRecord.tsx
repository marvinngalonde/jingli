import { Paper, Title, Center, Text, Stack, ThemeIcon } from '@mantine/core';
import { IconCurrencyDollar } from '@tabler/icons-react';

export function FinanceRecord() {
    return (
        <Stack>
            <Paper withBorder p="xl" radius="md">
                <Center>
                    <Stack align="center" gap="xs">
                        <ThemeIcon size={48} radius="xl" variant="light" color="gray">
                            <IconCurrencyDollar size={24} />
                        </ThemeIcon>
                        <Title order={4}>Finance Records</Title>
                        <Text c="dimmed" ta="center">No invoice or payment history found for this student.</Text>
                    </Stack>
                </Center>
            </Paper>
        </Stack>
    );
}
