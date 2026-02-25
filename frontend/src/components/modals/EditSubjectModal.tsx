import { Drawer, TextInput, Button, Group, Stack, Box, Select, MultiSelect } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useEffect, useState } from 'react';
import { subjectsApi, classesApi } from '../../services/academics';
import { staffService } from '../../services/staffService';
import type { Subject } from '../../types/academics';

interface EditSubjectModalProps {
    opened: boolean;
    onClose: () => void;
    onSuccess: () => void;
    subject: Subject | null;
}

export function EditSubjectModal({ opened, onClose, onSuccess, subject }: EditSubjectModalProps) {
    const form = useForm({
        initialValues: {
            name: '',
            code: '',
            department: '',
            classLevelIds: [] as string[],
            teacherId: '',
        },
        validate: {
            name: (val) => !val ? 'Subject name is required' : null,
            code: (val) => !val ? 'Subject code is required' : null,
        },
    });

    const [classes, setClasses] = useState<{ value: string; label: string }[]>([]);
    const [teachers, setTeachers] = useState<{ value: string; label: string }[]>([]);

    useEffect(() => {
        if (opened) {
            Promise.all([classesApi.getAll(), staffService.getAll()]).then(([clsData, staffData]) => {
                setClasses(clsData.map(c => ({ value: c.id, label: c.name })));
                setTeachers(staffData
                    .filter(s => s.designation?.toLowerCase().includes('teacher') || ['TEACHER', 'SUBJECT_TEACHER', 'CLASS_TEACHER', 'SENIOR_TEACHER', 'HOD'].includes(s.user?.role || ''))
                    .map(s => ({ value: s.id, label: `${s.firstName} ${s.lastName}` }))
                );
            }).catch(console.error);
        }
    }, [opened]);

    // Populate form when subject changes
    useEffect(() => {
        if (subject) {
            form.setValues({
                name: subject.name,
                code: subject.code,
                department: subject.department || '',
                classLevelIds: subject.classLevels?.map(c => c.id) || [],
                teacherId: subject.teacherId || '',
            });
        }
    }, [subject]);

    const handleSubmit = async (values: typeof form.values) => {
        if (!subject) return;

        try {
            await subjectsApi.update(subject.id, {
                name: values.name,
                code: values.code,
                department: values.department || undefined,
                classLevelIds: values.classLevelIds.length > 0 ? values.classLevelIds : undefined,
                teacherId: values.teacherId || undefined,
            });
            notifications.show({
                title: 'Success',
                message: 'Subject updated successfully',
                color: 'green',
            });
            form.reset();
            onSuccess();
            onClose();
        } catch (error: any) {
            notifications.show({
                title: 'Error',
                message: error.response?.data?.message || 'Failed to update subject',
                color: 'red',
            });
        }
    };

    return (
        <Drawer opened={opened} onClose={onClose} title="Edit Subject" position="right" size="md">
            <Box p={0}>
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack gap="md">
                        <TextInput
                            label="Subject Name"
                            placeholder="e.g., Mathematics"
                            {...form.getInputProps('name')}
                            required
                        />
                        <TextInput
                            label="Subject Code"
                            placeholder="e.g., MATH101"
                            {...form.getInputProps('code')}
                            required
                        />
                        <TextInput
                            label="Department"
                            placeholder="e.g., Science (optional)"
                            {...form.getInputProps('department')}
                        />
                        <MultiSelect
                            label="Level/Grade"
                            placeholder="Select grades (optional)"
                            data={classes}
                            clearable
                            searchable
                            {...form.getInputProps('classLevelIds')}
                        />
                        <Select
                            label="Coordinator/Teacher"
                            placeholder="Assign primary teacher (optional)"
                            data={teachers}
                            clearable
                            searchable
                            {...form.getInputProps('teacherId')}
                        />

                        <Group justify="flex-end" mt="md">
                            <Button variant="subtle" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                Update
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Box>
        </Drawer>
    );
}
