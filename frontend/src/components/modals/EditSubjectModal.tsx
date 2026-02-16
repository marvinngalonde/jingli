import { Drawer, TextInput, Button, Group, Stack, Box } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useEffect } from 'react';
import { subjectsApi } from '../../services/academics';
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
        },
        validate: {
            name: (val) => !val ? 'Subject name is required' : null,
            code: (val) => !val ? 'Subject code is required' : null,
        },
    });

    // Populate form when subject changes
    useEffect(() => {
        if (subject) {
            form.setValues({
                name: subject.name,
                code: subject.code,
                department: subject.department || '',
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
