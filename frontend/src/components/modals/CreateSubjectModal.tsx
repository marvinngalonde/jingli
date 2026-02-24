import { Drawer, TextInput, Button, Group, Stack, Box, Select, MultiSelect } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useState, useEffect } from 'react';
import { subjectsApi, classesApi } from '../../services/academics';
import { staffService } from '../../services/staffService';
import type { CreateSubjectDto } from '../../types/academics';

interface CreateSubjectModalProps {
    opened: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function CreateSubjectModal({ opened, onClose, onSuccess }: CreateSubjectModalProps) {
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
                    .filter(s => s.designation?.toLowerCase().includes('teacher') || s.user?.role === 'TEACHER')
                    .map(s => ({ value: s.id, label: `${s.firstName} ${s.lastName}` }))
                );
            }).catch(console.error);
        }
    }, [opened]);

    const handleSubmit = async (values: typeof form.values) => {
        try {
            const dto: CreateSubjectDto = {
                name: values.name,
                code: values.code,
                department: values.department || undefined,
                classLevelIds: values.classLevelIds.length > 0 ? values.classLevelIds : undefined,
                teacherId: values.teacherId || undefined,
            };
            await subjectsApi.create(dto);
            notifications.show({
                title: 'Success',
                message: 'Subject created successfully',
                color: 'green',
            });
            form.reset();
            onSuccess();
            onClose();
        } catch (error: any) {
            notifications.show({
                title: 'Error',
                message: error.response?.data?.message || 'Failed to create subject',
                color: 'red',
            });
        }
    };

    return (
        <Drawer opened={opened} onClose={onClose} title="Add Subject" position="right" size="md">
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
                                Create
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Box>
        </Drawer>
    );
}
