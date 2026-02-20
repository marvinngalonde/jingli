import { useForm } from '@mantine/form';
import {
    TextInput,
    Textarea,
    Select,
    Button,
    Stack,
    Group,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { noticesService } from '../../services/noticesService';
import type { Notice, NoticeAudience } from '../../types/notices';

interface NoticeFormProps {
    initialData?: Notice | null;
    onSuccess: () => void;
}

export function NoticeForm({ initialData, onSuccess }: NoticeFormProps) {
    const form = useForm({
        initialValues: {
            title: initialData?.title || '',
            content: initialData?.content || '',
            targetAudience: initialData?.targetAudience || 'ALL' as NoticeAudience,
            expiresAt: initialData?.expiresAt ? new Date(initialData.expiresAt) : null,
        },
        validate: {
            title: (value) => (value.length < 5 ? 'Title must be at least 5 characters' : null),
            content: (value) => (value.length < 10 ? 'Content must be at least 10 characters' : null),
            targetAudience: (value) => (!value ? 'Target audience is required' : null),
        },
    });

    const handleSubmit = async (values: typeof form.values) => {
        try {
            const dto = {
                ...values,
                expiresAt: values.expiresAt ? values.expiresAt.toISOString() : undefined,
            };

            if (initialData) {
                await noticesService.update(initialData.id, dto);
                notifications.show({ title: 'Updated', message: 'Notice updated successfully', color: 'green' });
            } else {
                await noticesService.create(dto);
                notifications.show({ title: 'Posted', message: 'Notice posted successfully', color: 'green' });
            }
            onSuccess();
        } catch (error) {
            console.error("Failed to save notice", error);
            notifications.show({ title: 'Error', message: 'Failed to save notice', color: 'red' });
        }
    };

    return (
        <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
                <TextInput
                    label="Notice Title"
                    placeholder="e.g. Annual Sports Day 2024"
                    required
                    {...form.getInputProps('title')}
                />

                <Select
                    label="Target Audience"
                    placeholder="Who should see this?"
                    required
                    data={[
                        { value: 'ALL', label: 'All (Everyone)' },
                        { value: 'STUDENTS', label: 'Students Only' },
                        { value: 'STAFF', label: 'Staff Only' },
                        { value: 'PARENTS', label: 'Parents Only' },
                    ]}
                    {...form.getInputProps('targetAudience')}
                />

                <DateInput
                    label="Expiry Date (Optional)"
                    placeholder="When should this notice disappear?"
                    clearable
                    {...form.getInputProps('expiresAt')}
                />

                <Textarea
                    label="Content"
                    placeholder="Write the full notice details here..."
                    required
                    minRows={8}
                    {...form.getInputProps('content')}
                />

                <Group justify="flex-end" mt="md">
                    <Button type="submit" size="md">
                        {initialData ? 'Update Notice' : 'Post Notice'}
                    </Button>
                </Group>
            </Stack>
        </form>
    );
}
