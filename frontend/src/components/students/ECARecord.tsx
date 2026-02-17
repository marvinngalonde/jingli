import { Paper, Title, Center, Text, Stack, ThemeIcon } from '@mantine/core';
import { IconTrophy } from '@tabler/icons-react';

export function ECARecord() {
    return (
        <Stack>
            <Paper withBorder p="xl" radius="md">
                <Center>
                    <Stack align="center" gap="xs">
                        <ThemeIcon size={48} radius="xl" variant="light" color="gray">
                            <IconTrophy size={24} />
                        </ThemeIcon>
                        <Title order={4}>Co-Curricular Activities</Title>
                        <Text c="dimmed" ta="center">No activities or clubs recorded yet.</Text>
                    </Stack>
                </Center>
            </Paper>
        </Stack>
    );
}
