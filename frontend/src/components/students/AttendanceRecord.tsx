import { Paper, Title, Center, Text, Stack, ThemeIcon } from '@mantine/core';
import { IconCheckupList } from '@tabler/icons-react';

export function AttendanceRecord() {
    return (
        <Stack>
            <Paper withBorder p="xl" radius="md">
                <Center>
                    <Stack align="center" gap="xs">
                        <ThemeIcon size={48} radius="xl" variant="light" color="gray">
                            <IconCheckupList size={24} />
                        </ThemeIcon>
                        <Title order={4}>Attendance Records</Title>
                        <Text c="dimmed" ta="center">No attendance data recorded yet.</Text>
                    </Stack>
                </Center>
            </Paper>
        </Stack>
    );
}
