import { Modal, Select, Button, Group, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { TimeInput } from '@mantine/dates';
import { IconClock } from '@tabler/icons-react';
import type { Subject, CreateTimetableDto, DayOfWeek } from '../../types/academics';

interface CreateTimetableEntryModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (values: CreateTimetableDto) => void;
    loading?: boolean;
    subjects: Subject[];
    teachers: any[]; // improved type later
    sectionId: string;
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

export function CreateTimetableEntryModal({ opened, onClose, onSubmit, loading, subjects, teachers, sectionId }: CreateTimetableEntryModalProps) {
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

    const handleSubmit = (values: typeof form.values) => {
        // Convert time strings (HH:mm) to full ISO strings for the backend
        // We need to pick a dummy date, backend just needs the time component usually, 
        // but our DTO expects ISO Date string. The backend logic extracts time.
        // Let's use current date but set the time.

        const now = new Date();
        const [startHour, startMinute] = values.startTime.split(':').map(Number);
        const [endHour, endMinute] = values.endTime.split(':').map(Number);

        const startDate = new Date(now);
        startDate.setHours(startHour, startMinute, 0, 0);

        const endDate = new Date(now);
        endDate.setHours(endHour, endMinute, 0, 0);

        const dto: CreateTimetableDto = {
            sectionId,
            subjectId: values.subjectId,
            teacherId: values.teacherId,
            day: values.day,
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString(),
            roomNo: values.roomNo,
        };

        onSubmit(dto);
    };

    return (
        <Modal opened={opened} onClose={onClose} title="Add Timetable Entry" centered zIndex={200}>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Select
                    label="Day"
                    placeholder="Select day"
                    data={DAYS}
                    mb="md"
                    {...form.getInputProps('day')}
                    allowDeselect={false}
                />

                <Select
                    label="Subject"
                    placeholder="Select subject"
                    data={subjects.map(s => ({ value: s.id, label: `${s.name} (${s.code})` }))}
                    mb="md"
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
                    mb="md"
                    searchable
                    {...form.getInputProps('teacherId')}
                    allowDeselect={false}
                />

                <Group grow mb="md">
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
                    mb="lg"
                    {...form.getInputProps('roomNo')}
                />

                <Group justify="flex-end">
                    <Button variant="subtle" onClick={onClose}>Cancel</Button>
                    <Button type="submit" loading={loading}>Add Entry</Button>
                </Group>
            </form>
        </Modal>
    );
}
