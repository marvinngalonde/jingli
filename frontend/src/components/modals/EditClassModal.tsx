import { Drawer, TextInput, NumberInput, Button, Group, Stack, Box, Select } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useEffect } from 'react';
import { classesApi } from '../../services/academics';
import type { ClassSection, ClassLevel } from '../../types/academics';

interface EditClassModalProps {
    opened: boolean;
    onClose: () => void;
    onSuccess: () => void;
    section: ClassSection | null;
    classLevel: ClassLevel | null;
    teachers: any[];
}

export function EditClassModal({ opened, onClose, onSuccess, section, classLevel, teachers }: EditClassModalProps) {
    const form = useForm({
        initialValues: {
            // Level details
            levelName: '',
            levelNumber: 1,
            // Section details
            sectionName: '',
            capacity: 30,
            classTeacherId: '',
        },
        validate: {
            levelName: (val) => !val ? 'Level name is required' : null,
            levelNumber: (val) => (!val || val < 1) ? 'Level number must be at least 1' : null,
            sectionName: (val) => (section && !val) ? 'Section name is required' : null,
            capacity: (val) => (section && (!val || val < 1)) ? 'Capacity must be at least 1' : null,
        },
    });

    // Populate form when section/classLevel changes
    useEffect(() => {
        if (classLevel && !section) {
            form.setValues({
                levelName: classLevel.name,
                levelNumber: classLevel.level,
                sectionName: '',
                capacity: 30,
                classTeacherId: '',
            });
        } else if (section && classLevel) {
            form.setValues({
                levelName: classLevel.name,
                levelNumber: classLevel.level,
                sectionName: section.name,
                capacity: section.capacity,
                classTeacherId: section.classTeacherId || '',
            });
        }
    }, [section, classLevel]);

    const handleSubmit = async (values: typeof form.values) => {
        if (!classLevel) return;

        try {
            // Update class level if changed
            if (values.levelName !== classLevel.name || values.levelNumber !== classLevel.level) {
                await classesApi.updateLevel(classLevel.id, {
                    name: values.levelName,
                    level: values.levelNumber,
                });
            }

            // Update section if changed
            if (section) {
                if (values.sectionName !== section.name || values.capacity !== section.capacity || values.classTeacherId !== (section.classTeacherId || '')) {
                    await classesApi.updateSection(section.id, {
                        name: values.sectionName,
                        capacity: values.capacity,
                        classTeacherId: values.classTeacherId || undefined, // undefined removes assignment
                    });
                }
            }

            notifications.show({
                title: 'Success',
                message: 'Class updated successfully',
                color: 'green',
            });
            form.reset();
            onSuccess();
            onClose();
        } catch (error: any) {
            notifications.show({
                title: 'Error',
                message: error.response?.data?.message || 'Failed to update class',
                color: 'red',
            });
        }
    };

    return (
        <Drawer opened={opened} onClose={onClose} title="Edit Class" position="right" size="md">
            <Box p={0}>
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack gap="md">
                        <TextInput
                            label="Level Name"
                            placeholder="e.g., Grade 1"
                            {...form.getInputProps('levelName')}
                            required
                        />
                        <NumberInput
                            label="Level Number"
                            placeholder="e.g., 1"
                            min={1}
                            max={12}
                            {...form.getInputProps('levelNumber')}
                            required
                        />
                        {section && (
                            <>
                                <TextInput
                                    label="Section Name"
                                    placeholder="e.g., A, B, C"
                                    {...form.getInputProps('sectionName')}
                                    required
                                />
                                <NumberInput
                                    label="Capacity"
                                    placeholder="e.g., 30"
                                    min={1}
                                    {...form.getInputProps('capacity')}
                                    required
                                />
                                <Select
                                    label="Class Teacher (Optional)"
                                    placeholder="Select a teacher"
                                    data={teachers.map(t => ({
                                        value: t.user?.id || t.id,
                                        label: `${t.firstName} ${t.lastName}`
                                    }))}
                                    {...form.getInputProps('classTeacherId')}
                                    searchable
                                    clearable
                                />
                            </>
                        )}

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
