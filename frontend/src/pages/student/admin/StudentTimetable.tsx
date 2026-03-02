import { Title, Text, Stack, Card, Loader, Center, Badge, Group, Paper, Table, ThemeIcon } from '@mantine/core';
import { IconCalendar, IconClock } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { timetableApi } from '../../../services/academics';
import { TimetableGrid } from '../../../components/timetable/TimetableGrid';
import { notifications } from '@mantine/notifications';
import type { TimetableEntry } from '../../../types/academics';

export default function StudentTimetable() {
    const { user } = useAuth();
    const [entries, setEntries] = useState<TimetableEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTimetable();
    }, [user]);

    const loadTimetable = async () => {
        try {
            setLoading(true);
            // Student timetable is based on their enrolled section
            const sectionId = user?.profile?.sectionId;
            if (sectionId) {
                const data = await timetableApi.getAll({ sectionId });
                setEntries(data);
            }
        } catch (error) {
            console.error('Failed to load timetable', error);
            notifications.show({ title: 'Error', message: 'Failed to load your timetable', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Center h={400}>
                <Loader />
            </Center>
        );
    }

    return (
        <Stack gap="lg">
            <div>
                <Group gap="sm" mb={4}>
                    <ThemeIcon variant="light" color="blue" size="lg" radius="md">
                        <IconCalendar size={20} />
                    </ThemeIcon>
                    <Title order={2}>My Timetable</Title>
                </Group>
                <Text c="dimmed" ml={48}>View your weekly class schedule</Text>
            </div>

            {entries.length === 0 ? (
                <Card withBorder radius="md" p="xl" ta="center" bg="var(--app-surface)">
                    <ThemeIcon variant="light" color="gray" size={60} radius="xl" mx="auto" mb="md">
                        <IconClock size={30} />
                    </ThemeIcon>
                    <Text size="lg" fw={500}>No Timetable Available</Text>
                    <Text c="dimmed" mt="xs">Your timetable has not been set up yet. Please check with your class teacher.</Text>
                </Card>
            ) : (
                <Paper withBorder radius="md" p="md" bg="var(--app-surface)">
                    <TimetableGrid
                        entries={entries}
                        canEditEntry={() => false}
                    />
                </Paper>
            )}
        </Stack>
    );
}
