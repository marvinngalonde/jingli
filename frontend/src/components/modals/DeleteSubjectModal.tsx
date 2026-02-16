import { Modal, Text, Button, Group, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { subjectsApi } from '../../services/academics';

interface DeleteSubjectModalProps {
    opened: boolean;
    onClose: () => void;
    onSuccess: () => void;
    subjectId: string | null;
    subjectName: string | null;
}

export function DeleteSubjectModal({ opened, onClose, onSuccess, subjectId, subjectName }: DeleteSubjectModalProps) {
    const handleDelete = async () => {
        if (!subjectId) return;

        try {
            await subjectsApi.delete(subjectId);
            notifications.show({
                title: 'Success',
                message: 'Subject deleted successfully',
                color: 'green',
            });
            onSuccess();
            onClose();
        } catch (error: any) {
            notifications.show({
                title: 'Error',
                message: error.response?.data?.message || 'Failed to delete subject',
                color: 'red',
            });
        }
    };

    return (
        <Modal opened={opened} onClose={onClose} title="Delete Subject" size="md">
            <Stack gap="md">
                <Text>
                    Are you sure you want to delete <strong>{subjectName}</strong>? This action cannot be undone.
                </Text>

                <Group justify="flex-end" mt="md">
                    <Button variant="subtle" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button color="red" onClick={handleDelete}>
                        Delete
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
