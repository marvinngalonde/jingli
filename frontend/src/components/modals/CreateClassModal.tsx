import { Drawer, TextInput, NumberInput, Button, Group, Stack, Select, Box } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { classesApi } from '../../services/academics';
import type { ClassLevel, CreateClassLevelDto, CreateClassSectionDto } from '../../types/academics';

interface CreateClassModalProps {
    opened: boolean;
    onClose: () => void;
    onSuccess: () => void;
    classLevels: ClassLevel[];
}

export function CreateClassModal({ opened, onClose, onSuccess, classLevels }: CreateClassModalProps) {
    const form = useForm({
        initialValues: {
            type: 'section', // 'level' or 'section'
            // For level
            levelName: '',
            levelNumber: 1,
            // For section
            classLevelId: '',
            sectionName: '',
            capacity: 30,
        },
        validate: {
            levelName: (val, values) => values.type === 'level' && !val ? 'Level name is required' : null,
            levelNumber: (val, values) => values.type === 'level' && (!val || val < 1) ? 'Level number must be at least 1' : null,
            classLevelId: (val, values) => values.type === 'section' && !val ? 'Please select a class level' : null,
            sectionName: (val, values) => values.type === 'section' && !val ? 'Section name is required' : null,
            capacity: (val, values) => values.type === 'section' && (!val || val < 1) ? 'Capacity must be at least 1' : null,
        },
    });

    const handleSubmit = async (values: typeof form.values) => {
        try {
            if (values.type === 'level') {
                const dto: CreateClassLevelDto = {
                    name: values.levelName,
                    level: values.levelNumber,
                };
                await classesApi.createLevel(dto);
                notifications.show({
                    title: 'Success',
                    message: 'Class level created successfully',
                    color: 'green',
                });
            } else {
                const dto: CreateClassSectionDto = {
                    classLevelId: values.classLevelId,
                    name: values.sectionName,
                    capacity: values.capacity,
                };
                await classesApi.createSection(dto);
                notifications.show({
                    title: 'Success',
                    message: 'Class section created successfully',
                    color: 'green',
                });
            }
            form.reset();
            onSuccess();
            onClose();
        } catch (error: any) {
            notifications.show({
                title: 'Error',
                message: error.response?.data?.message || 'Failed to create class',
                color: 'red',
            });
        }
    };

    return (
        <Drawer opened={opened} onClose={onClose} title="Add Class" position="right" size="md">
            <Box p={0}>
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack gap="md">
                        <Select
                            label="Type"
                            placeholder="Select type"
                            data={[
                                { value: 'section', label: 'Class Section (e.g., Grade 1-A)' },
                                { value: 'level', label: 'Class Level (e.g., Grade 1)' },
                            ]}
                            {...form.getInputProps('type')}
                            required
                        />

                        {form.values.type === 'level' ? (
                            <>
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
                            </>
                        ) : (
                            <>
                                <Select
                                    label="Class Level"
                                    placeholder="Select class level"
                                    data={classLevels.map(level => ({
                                        value: level.id,
                                        label: level.name,
                                    }))}
                                    {...form.getInputProps('classLevelId')}
                                    required
                                    searchable
                                />
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
                            </>
                        )}

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
