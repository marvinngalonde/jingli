import { Title, Text, Stack, Card, Loader, Center } from '@mantine/core';
import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { TimetableGrid } from '../../components/timetable/TimetableGrid';
import { EditTimetableEntryModal } from '../../components/timetable/EditTimetableEntryModal';
import { timetableApi, subjectsApi } from '../../services/academics';
import { notifications } from '@mantine/notifications';
import type { TimetableEntry, Subject } from '../../types/academics';

export function TeacherTimetable() {
    const { user } = useAuth();
    const [entries, setEntries] = useState<TimetableEntry[]>([]);
    const [loading, setLoading] = useState(true);

    // Edit Modal State
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Reference Data for editing
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);

    useEffect(() => {
        if (user?.profile?.id) {
            loadTeacherTimetable(user.profile.id);
            loadReferenceData();
        }
    }, [user]);

    const loadTeacherTimetable = async (teacherId: string) => {
        try {
            setLoading(true);
            const data = await timetableApi.getAll({ teacherId });
            setEntries(data);
        } catch (error) {
            console.error('Failed to load timetable', error);
            notifications.show({ title: 'Error', message: 'Failed to load your timetable', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    const loadReferenceData = async () => {
        try {
            const [subjectsRes, staffRes] = await Promise.all([
                subjectsApi.getAll(),
                api.get('/staff')
            ]);
            setSubjects(subjectsRes);
            setTeachers(staffRes.data);
        } catch (e) {
            console.warn('Could not load subjects or staff for editing', e);
        }
    };

    const handleEditEntry = async (id: string, values: any) => {
        try {
            setSubmitting(true);
            await timetableApi.update(id, values);
            notifications.show({ title: 'Success', message: 'Timetable entry updated', color: 'green' });
            setEditModalOpen(false);
            setEditingEntry(null);
            if (user?.profile?.id) {
                loadTeacherTimetable(user.profile.id);
            }
        } catch (error: any) {
            console.error('Failed to update entry', error);
            notifications.show({
                title: 'Error',
                message: error.response?.data?.message || 'Failed to update entry.',
                color: 'red'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteEntry = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this entry?')) return;
        try {
            await timetableApi.delete(id);
            notifications.show({ title: 'Success', message: 'Entry deleted', color: 'green' });
            if (user?.profile?.id) {
                loadTeacherTimetable(user.profile.id);
            }
        } catch (error: any) {
            console.error('Failed to delete entry', error);
            notifications.show({
                title: 'Error',
                message: error.response?.data?.message || 'Failed to delete entry',
                color: 'red'
            });
        }
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
                loading={submitting}
                subjects={subjects}
                teachers={teachers}
                entry={editingEntry}
            />
        </Stack>
    );
}
