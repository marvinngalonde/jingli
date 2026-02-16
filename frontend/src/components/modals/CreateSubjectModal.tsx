import { Drawer, TextInput, Button, Group, Stack, Box } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { subjectsApi } from '../../services/academics';
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
        },
        validate: {
            name: (val) => !val ? 'Subject name is required' : null,
            code: (val) => !val ? 'Subject code is required' : null,
        },
    });

    const handleSubmit = async (values: typeof form.values) => {
        try {
            const dto: CreateSubjectDto = {
                name: values.name,
                code: values.code,
                department: values.department || undefined,
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
