import { useState, useEffect } from 'react';
import {
    Text,
    Paper,
    Group,
    Button,
    Select,
    Loader,
    Center,
    Box
} from '@mantine/core';
import { IconPlus, IconRefresh } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

// Components
import { TimetableGrid } from './TimetableGrid';
import { CreateTimetableEntryModal } from './CreateTimetableEntryModal';

// API
import { classesApi, subjectsApi, timetableApi } from '../../services/academics';
import { api } from '../../services/api';

// Types
import type { ClassLevel, Subject, TimetableEntry, CreateTimetableDto } from '../../types/academics';

interface Teacher {
    id: string;
    firstName: string;
    lastName: string;
}

interface TimetableManagementProps {
    isStudentOrParent?: boolean;
    // We could pass classId/sectionId if we want to default view, but let's stick to simple props for now
}

export function TimetableManagement({ isStudentOrParent = false }: TimetableManagementProps) {
    // State
    const [loading, setLoading] = useState(false);
    const [classes, setClasses] = useState<ClassLevel[]>([]);
    const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

    // Data for Grid/Modal
    const [entries, setEntries] = useState<TimetableEntry[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);

    // UI State
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Initial Load
    useEffect(() => {
        loadInitialData();
    }, []);

    // Load Timetable when Section Changes
    useEffect(() => {
        if (selectedSectionId) {
            loadTimetable(selectedSectionId);
        } else {
            setEntries([]);
        }
    }, [selectedSectionId]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const [classesRes, subjectsRes] = await Promise.all([
                classesApi.getAll(),
                subjectsApi.getAll()
            ]);
            setClasses(classesRes);
            setSubjects(subjectsRes);

            try {
                const staffRes = await api.get('/staff');
                setTeachers(staffRes.data.filter((s: any) => s.role === 'TEACHER' || true));
            } catch (e) {
                console.warn('Failed to load staff list', e);
            }

            setLoading(false);
        } catch (error) {
            console.error('Failed to load initial data', error);
            notifications.show({ title: 'Error', message: 'Failed to load classes or subjects', color: 'red' });
            setLoading(false);
        }
    };

    const loadTimetable = async (sectionId: string) => {
        try {
            setLoading(true);
            const data = await timetableApi.getAll({ sectionId });
            setEntries(data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to load timetable', error);
            notifications.show({ title: 'Error', message: 'Failed to load timetable', color: 'red' });
            setLoading(false);
        }
    };

    const handleCreateEntry = async (values: CreateTimetableDto) => {
        try {
            setSubmitting(true);
            await timetableApi.create(values);
            notifications.show({ title: 'Success', message: 'Timetable entry created', color: 'green' });
            setCreateModalOpen(false);
            if (selectedSectionId) loadTimetable(selectedSectionId);
            setSubmitting(false);
        } catch (error: any) {
            console.error('Failed to create entry', error);
            notifications.show({
                title: 'Error',
                message: error.response?.data?.message || 'Failed to create entry. Check for conflicts.',
                color: 'red'
            });
            setSubmitting(false);
        }
    };

    const handleDeleteEntry = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this entry?')) return;
        try {
            await timetableApi.delete(id);
            notifications.show({ title: 'Success', message: 'Entry deleted', color: 'green' });
            if (selectedSectionId) loadTimetable(selectedSectionId);
        } catch (error) {
            console.error('Failed to delete entry', error);
            notifications.show({ title: 'Error', message: 'Failed to delete entry', color: 'red' });
        }
    };

    // Derived State for Selectors
    const levelOptions = classes.map(c => ({ value: c.id, label: `${c.level} - ${c.name}` }));

    // Find selected level to get its sections
    const selectedLevel = classes.find(c => c.id === selectedLevelId);
    const sectionOptions = selectedLevel?.sections?.map(s => ({ value: s.id, label: s.name })) || [];

    if (isStudentOrParent) {
        return (
            <Center h={200}>
                <Text>Student timetable view coming soon...</Text>
            </Center>
        );
    }

    return (
        <Box>
            <Paper p="md" mb="lg">
                <Group justify="space-between">
                    <Group>
                        <Select
                            label="Class Level"
                            placeholder="Select Level"
                            data={levelOptions}
                            value={selectedLevelId}
                            onChange={(val) => {
                                setSelectedLevelId(val);
                                setSelectedSectionId(null);
                            }}
                            searchable
                        />
                        <Select
                            label="Section"
                            placeholder="Select Section"
                            data={sectionOptions}
                            value={selectedSectionId}
                            onChange={setSelectedSectionId}
                            disabled={!selectedLevelId}
                            searchable
                        />
                        <Button
                            variant="light"
                            leftSection={<IconRefresh size={16} />}
                            onClick={() => selectedSectionId && loadTimetable(selectedSectionId)}
                            disabled={!selectedSectionId}
                            mt={24}
                        >
                            Refresh
                        </Button>
                    </Group>

                    <Button
                        leftSection={<IconPlus size={16} />}
                        onClick={() => setCreateModalOpen(true)}
                        disabled={!selectedSectionId}
                        mt={24}
                    >
                        Add Entry
                    </Button>
                </Group>
            </Paper>

            {!selectedSectionId ? (
                <Center h={200}>
                    <Text c="dimmed">Select a class and section to view timetable</Text>
                </Center>
            ) : loading ? (
                <Center h={200}>
                    <Loader />
                </Center>
            ) : (
                <TimetableGrid
                    entries={entries}
                    onDelete={handleDeleteEntry}
                />
            )}

            {selectedSectionId && (
                <CreateTimetableEntryModal
                    opened={createModalOpen}
                    onClose={() => setCreateModalOpen(false)}
                    onSubmit={handleCreateEntry}
                    loading={submitting}
                    subjects={subjects}
                    teachers={teachers}
                    sectionId={selectedSectionId}
                />
            )}
        </Box>
    );
}
