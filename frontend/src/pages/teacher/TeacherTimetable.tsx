import { Title, Text, Stack, Card, Loader, Center } from '@mantine/core';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { TimetableGrid } from '../../components/timetable/TimetableGrid';
import { EditTimetableEntryModal } from '../../components/timetable/EditTimetableEntryModal';
import { timetableApi, subjectsApi } from '../../services/academics';
import { notifications } from '@mantine/notifications';
import type { TimetableEntry, Subject } from '../../types/academics';

export function TeacherTimetable() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Edit Modal State
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);

    // Queries
    const { data: entriesData = [], isLoading: loadingEntries } = useQuery({
        queryKey: ['teacherTimetable', user?.profile?.id],
        queryFn: () => timetableApi.getAll({ teacherId: user?.profile?.id as string }),
        enabled: !!user?.profile?.id
    });

    const { data: subjects = [] } = useQuery({
        queryKey: ['subjects'],
        queryFn: () => subjectsApi.getAll(),
        enabled: !!user?.profile?.id
    });

    const { data: teachersData = [] } = useQuery({
        queryKey: ['staff'],
        queryFn: () => api.get('/staff').then(res => res.data),
        enabled: !!user?.profile?.id
    });
    const teachers = Array.isArray(teachersData) ? teachersData : (teachersData as any).data || [];

    const entries = entriesData;
    const loading = loadingEntries && !!user?.profile?.id;

    const updateMutation = useMutation({
        mutationFn: ({ id, values }: { id: string; values: any }) => timetableApi.update(id, values),
        onSuccess: () => {
            notifications.show({ title: 'Success', message: 'Timetable entry updated', color: 'green' });
            setEditModalOpen(false);
            setEditingEntry(null);
            queryClient.invalidateQueries({ queryKey: ['teacherTimetable', user?.profile?.id] });
        },
        onError: (error: any) => {
            console.error('Failed to update entry', error);
            notifications.show({
                title: 'Error',
                message: error.response?.data?.message || 'Failed to update entry.',
                color: 'red'
            });
        }
    });

    const handleEditEntry = async (id: string, values: any) => {
        updateMutation.mutate({ id, values });
    };

    const deleteMutation = useMutation({
        mutationFn: (id: string) => timetableApi.delete(id),
        onSuccess: () => {
            notifications.show({ title: 'Success', message: 'Entry deleted', color: 'green' });
            queryClient.invalidateQueries({ queryKey: ['teacherTimetable', user?.profile?.id] });
        },
        onError: (error: any) => {
            console.error('Failed to delete entry', error);
            notifications.show({
                title: 'Error',
                message: error.response?.data?.message || 'Failed to delete entry',
                color: 'red'
            });
        }
    });

    const handleDeleteEntry = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this entry?')) return;
        deleteMutation.mutate(id);
    };

    const openEditModal = (entry: TimetableEntry) => {
        setEditingEntry(entry);
        setEditModalOpen(true);
    };

    const staffId = user?.profile?.id;
    const canEditEntry = (entry: TimetableEntry) => entry.teacherId === staffId;

    if (loading) {
        return (
            <Center h={400}>
                <Loader />
            </Center>
        );
    }

    return (
        <Stack gap="lg" pos="relative">
            <div>
                <Title order={2}>My Timetable</Title>
                <Text c="dimmed">View and edit your assigned class schedule.</Text>
            </div>

            {entries.length === 0 ? (
                <Card withBorder radius="md" p="xl" ta="center">
                    <Text size="lg" fw={500}>No Timetable Entries</Text>
                    <Text c="dimmed">You have not been assigned to any classes in the timetable yet.</Text>
                </Card>
            ) : (
                <TimetableGrid
                    entries={entries}
                    onEdit={openEditModal}
                    onDelete={handleDeleteEntry}
                    canEditEntry={canEditEntry}
                />
            )}

            <EditTimetableEntryModal
                opened={editModalOpen}
                onClose={() => { setEditModalOpen(false); setEditingEntry(null); }}
                onSubmit={handleEditEntry}
                loading={updateMutation.isPending}
                subjects={subjects}
                teachers={teachers}
                entry={editingEntry}
            />
        </Stack>
    );
}
