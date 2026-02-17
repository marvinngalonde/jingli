import { Paper, Title, Center, Text, Stack, ThemeIcon } from '@mantine/core';
import { IconFirstAidKit } from '@tabler/icons-react';

export function HealthRecord() {
    return (
        <Stack>
            <Paper withBorder p="xl" radius="md">
                <Center>
                    <Stack align="center" gap="xs">
                        <ThemeIcon size={48} radius="xl" variant="light" color="gray">
                            <IconFirstAidKit size={24} />
                        </ThemeIcon>
                        <Title order={4}>Medical Records</Title>
                        <Text c="dimmed" ta="center">No medical conditions or allergies recorded.</Text>
                    </Stack>
                </Center>
            </Paper>
        </Stack>
    );
}
