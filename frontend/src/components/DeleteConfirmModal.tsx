import {
    Modal,
    Text,
    Button,
    Group,
    Stack,
    rem,
} from '@mantine/core';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
    opened: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    itemName?: string;
}

export default function DeleteConfirmModal({
    opened,
    onClose,
    onConfirm,
    title,
    message,
    itemName,
}: DeleteConfirmModalProps) {
    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={title}
            size="sm"
            centered
        >
            <Stack gap="md">
                <Group gap="sm">
                    <AlertTriangle size={24} color="var(--mantine-color-red-6)" />
                    <Text size="sm">{message}</Text>
                </Group>

                {itemName && (
                    <Text size="sm" fw={600} c="dimmed">
                        {itemName}
                    </Text>
                )}

                <Text size="xs" c="dimmed">
                    This action cannot be undone.
                </Text>

                <Group justify="flex-end" mt="md">
                    <Button variant="outline" onClick={onClose} size="sm" radius={2} color="gray">
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        size="sm"
                        radius={2}
                        color="red"
                    >
                        Delete
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
