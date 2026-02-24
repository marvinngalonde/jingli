import { Drawer, Select, Button, Group, TextInput, Stack, Box } from '@mantine/core';
import { useForm } from '@mantine/form';
import { TimeInput } from '@mantine/dates';
import { IconClock } from '@tabler/icons-react';
import { useEffect } from 'react';
import type { Subject, DayOfWeek, TimetableEntry } from '../../types/academics';

interface EditTimetableEntryModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (id: string, values: any) => void;
    loading?: boolean;
    subjects: Subject[];
    teachers: any[];
    entry: TimetableEntry | null;
}

const DAYS: { value: DayOfWeek; label: string }[] = [
    { value: 'MON', label: 'Monday' },
    { value: 'TUE', label: 'Tuesday' },
    { value: 'WED', label: 'Wednesday' },
    { value: 'THU', label: 'Thursday' },
    { value: 'FRI', label: 'Friday' },
    { value: 'SAT', label: 'Saturday' },
    { value: 'SUN', label: 'Sunday' },
];

export function EditTimetableEntryModal({ opened, onClose, onSubmit, loading, subjects, teachers, entry }: EditTimetableEntryModalProps) {
    const form = useForm({
        initialValues: {
            subjectId: '',
            teacherId: '',
            day: 'MON' as DayOfWeek,
            startTime: '',
            endTime: '',
            roomNo: '',
        },
        validate: {
            subjectId: (value) => !value ? 'Subject is required' : null,
            teacherId: (value) => !value ? 'Teacher is required' : null,
            startTime: (value) => !value ? 'Start time is required' : null,
            endTime: (value) => !value ? 'End time is required' : null,
        },
    });

    // Populate form when entry changes
    useEffect(() => {
        if (entry) {
            const startTime = new Date(entry.startTime).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
            const endTime = new Date(entry.endTime).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
            form.setValues({
                subjectId: entry.subjectId || '',
                teacherId: entry.teacherId || '',
                day: entry.day,
                startTime,
                endTime,
                roomNo: entry.roomNo || '',
            });
        }
    }, [entry]);

    const handleSubmit = (values: typeof form.values) => {
        if (!entry) return;

        const now = new Date();
        const [startHour, startMinute] = values.startTime.split(':').map(Number);
        const [endHour, endMinute] = values.endTime.split(':').map(Number);

        const startDate = new Date(now);
        startDate.setHours(startHour, startMinute, 0, 0);

        const endDate = new Date(now);
        endDate.setHours(endHour, endMinute, 0, 0);

        onSubmit(entry.id, {
            subjectId: values.subjectId,
            teacherId: values.teacherId,
            day: values.day,
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString(),
            roomNo: values.roomNo,
        });
    };

    return (
        <Drawer opened={opened} onClose={onClose} title="Edit Timetable Entry" position="right" size="md">
            <Box p={0}>
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack gap="md">
                        <Select
                            label="Day"
                            placeholder="Select day"
                            data={DAYS}
                            {...form.getInputProps('day')}
                            allowDeselect={false}
                        />

                        <Select
                            label="Subject"
                            placeholder="Select subject"
                            data={subjects.map(s => ({ value: s.id, label: `${s.name} (${s.code})` }))}
                            searchable
                            {...form.getInputProps('subjectId')}
                            allowDeselect={false}
                        />

                        <Select
                            label="Teacher"
                            placeholder="Select teacher"
                            data={teachers.map(t => ({
                                value: t.id,
                                label: `${t.firstName} ${t.lastName}`
                            }))}
                            searchable
                            {...form.getInputProps('teacherId')}
                            allowDeselect={false}
                        />

                        <Group grow>
                            <TimeInput
                                label="Start Time"
                                leftSection={<IconClock size={16} />}
                                {...form.getInputProps('startTime')}
                            />
                            <TimeInput
                                label="End Time"
                                leftSection={<IconClock size={16} />}
                                {...form.getInputProps('endTime')}
                            />
                        </Group>

                        <TextInput
                            label="Room Number"
                            placeholder="e.g. 101"
                            {...form.getInputProps('roomNo')}
                        />

                        <Group justify="flex-end" mt="md">
                            <Button variant="subtle" onClick={onClose}>Cancel</Button>
                            <Button type="submit" loading={loading}>Save Changes</Button>
                        </Group>
                    </Stack>
                </form>
            </Box>
        </Drawer>
    );
}
