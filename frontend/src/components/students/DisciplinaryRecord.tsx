import { Paper, Title, Center, Text, Stack, ThemeIcon } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

export function DisciplinaryRecord() {
    return (
        <Stack>
            <Paper withBorder p="xl" radius="md">
                <Center>
                    <Stack align="center" gap="xs">
                        <ThemeIcon size={48} radius="xl" variant="light" color="gray">
                            <IconAlertTriangle size={24} />
                        </ThemeIcon>
                        <Title order={4}>Disciplinary Record</Title>
                        <Text c="dimmed" ta="center">Clean record. No incidents reported.</Text>
                    </Stack>
                </Center>
            </Paper>
        </Stack>
    );
}
