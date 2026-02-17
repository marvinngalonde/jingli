import { Paper, Title, Center, Text, Stack, ThemeIcon } from '@mantine/core';
import { IconSchool } from '@tabler/icons-react';

export function GradesRecord() {
    return (
        <Stack>
            <Paper withBorder p="xl" radius="md">
                <Center>
                    <Stack align="center" gap="xs">
                        <ThemeIcon size={48} radius="xl" variant="light" color="gray">
                            <IconSchool size={24} />
                        </ThemeIcon>
                        <Title order={4}>Academic Records</Title>
                        <Text c="dimmed" ta="center">No grades or exam results recorded yet.</Text>
                    </Stack>
                </Center>
            </Paper>
        </Stack>
    );
}
