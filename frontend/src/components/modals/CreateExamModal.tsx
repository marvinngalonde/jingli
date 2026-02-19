import { Drawer, TextInput, Select, NumberInput, Group, Button, LoadingOverlay, Stack } from '@mantine/core';
import { DatePickerInput, TimeInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { examsService } from '../../services/examsService';
import { academicsService } from '../../services/academics';
import type { CreateExamDto } from '../../types/exams';
import { useAuth } from '../../context/AuthContext';

interface CreateExamModalProps {
    opened: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function CreateExamModal({ opened, onClose, onSuccess }: CreateExamModalProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [terms, setTerms] = useState<any[]>([]);

    const form = useForm<CreateExamDto>({
        initialValues: {
            name: '',
            subjectId: '',
            classLevelId: '',
            termId: '',
            date: new Date(),
            startTime: new Date(),
            duration: 60,
            maxMarks: 100,
        },
        validate: {
            name: (value) => (value.length < 2 ? 'Name must be at least 2 characters' : null),
            subjectId: (value) => (!value ? 'Subject is required' : null),
            classLevelId: (value) => (!value ? 'Class is required' : null),
            termId: (value) => (!value ? 'Term is required' : null),
        },
    });

    useEffect(() => {
        if (opened) {
            loadDropdowns();
        }
    }, [opened]);

    const loadDropdowns = async () => {
        try {
            const [subjectsData, classesData, termsData] = await Promise.all([
                academicsService.getSubjects(user?.schoolId || ''),
                academicsService.getClasses(user?.schoolId || ''),
                examsService.getTerms(user?.schoolId || ''),
            ]);
            setSubjects(subjectsData.map((s: any) => ({ value: s.id, label: `${s.name} (${s.code})` })));
            setClasses(classesData.map((c: any) => ({ value: c.id, label: c.name })));
            setTerms(termsData.map((t: any) => ({ value: t.id, label: t.name })));
        } catch (error) {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to load options', color: 'red' });
        }
    };

    const handleSubmit = async (values: CreateExamDto) => {
        try {
            setLoading(true);
            const examDate = new Date(values.date);
            let startTime = new Date(values.date);

            if (values.startTime instanceof Date) {
                startTime.setHours(values.startTime.getHours(), values.startTime.getMinutes());
            } else if (typeof values.startTime === 'string') {
                const [hours, minutes] = (values.startTime as string).split(':').map(Number);
                startTime.setHours(hours, minutes);
            }

            if (isNaN(startTime.getTime())) {
                startTime = new Date(values.date);
            }

            await examsService.createExam({
                ...values,
                date: examDate,
                startTime: startTime,
                schoolId: user?.schoolId || ''
            } as any);

            notifications.show({ title: 'Success', message: 'Exam scheduled successfully', color: 'green' });
            onSuccess();
            onClose();
            form.reset();
        } catch (error) {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to create exam', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Drawer
            opened={opened}
            onClose={onClose}
            title="Schedule New Exam"
            position="right"
            size="md"
            padding="lg"
        >
            <LoadingOverlay visible={loading} />
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="sm">
                    <TextInput label="Exam Name" placeholder="e.g. Mid-Term Mathematics" required {...form.getInputProps('name')} />
                    <Select label="Class" placeholder="Select Class" data={classes} required searchable {...form.getInputProps('classLevelId')} />
                    <Select label="Subject" placeholder="Select Subject" data={subjects} required searchable {...form.getInputProps('subjectId')} />
                    <Select label="Term" placeholder="Select Term" data={terms} required searchable {...form.getInputProps('termId')} />

                    <Group grow>
                        <DatePickerInput label="Date" placeholder="Pick date" required {...form.getInputProps('date')} />
                        <TimeInput label="Start Time" required {...form.getInputProps('startTime')} />
                    </Group>

                    <Group grow>
                        <NumberInput label="Duration (mins)" min={15} step={15} required {...form.getInputProps('duration')} />
                        <NumberInput label="Max Marks" min={10} max={100} required {...form.getInputProps('maxMarks')} />
                    </Group>

                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={onClose}>Cancel</Button>
                        <Button type="submit" loading={loading}>Schedule Exam</Button>
                    </Group>
                </Stack>
            </form>
        </Drawer>
    );
}
