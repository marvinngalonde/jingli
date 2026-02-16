import { Modal, Text, Button, Group, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { classesApi } from '../../services/academics';

interface DeleteClassModalProps {
    opened: boolean;
    onClose: () => void;
    onSuccess: () => void;
    sectionId: string | null;
    sectionName: string | null;
}

export function DeleteClassModal({ opened, onClose, onSuccess, sectionId, sectionName }: DeleteClassModalProps) {
    const handleDelete = async () => {
        if (!sectionId) return;

        try {
            await classesApi.delete(sectionId);
            notifications.show({
                title: 'Success',
                message: 'Class section deleted successfully',
                color: 'green',
            });
            onSuccess();
            onClose();
        } catch (error: any) {
            notifications.show({
                title: 'Error',
                message: error.response?.data?.message || 'Failed to delete class',
                color: 'red',
            });
        }
    };

    return (
        <Modal opened={opened} onClose={onClose} title="Delete Class Section" size="md">
            <Stack gap="md">
                <Text>
                    Are you sure you want to delete <strong>{sectionName}</strong>? This action cannot be undone.
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
