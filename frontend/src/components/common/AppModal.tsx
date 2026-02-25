import { Modal, Group, Button, Text, Stack, type ModalProps } from '@mantine/core';
import type { ReactNode } from 'react';

/**
 * AppModal — Chief modal component with standardized layout.
 *
 * Provides consistent header, body, and footer action buttons.
 * All modals in the app should use this wrapper instead of raw Modal.
 */

interface AppModalProps extends Omit<ModalProps, 'children'> {
    /** Main content */
    children: ReactNode;
    /** Primary action button label */
    confirmLabel?: string;
    /** Cancel button label */
    cancelLabel?: string;
    /** Called when primary action is clicked */
    onConfirm?: () => void;
    /** Whether confirm action is loading */
    confirmLoading?: boolean;
    /** Color of confirm button (default: brand) */
    confirmColor?: string;
    /** Whether to show footer action buttons */
    showActions?: boolean;
    /** Optional subtitle under the title */
    subtitle?: string;
    /** Disable the confirm button */
    confirmDisabled?: boolean;
}

export function AppModal({
    children,
    confirmLabel = 'Save',
    cancelLabel = 'Cancel',
    onConfirm,
    onClose,
    confirmLoading = false,
    confirmColor = 'brand',
    showActions = true,
    subtitle,
    confirmDisabled = false,
    ...props
}: AppModalProps) {
    return (
        <Modal
            onClose={onClose}
            size="lg"
            {...props}
        >
            <Stack gap="md">
                {subtitle && (
                    <Text size="sm" c="dimmed">{subtitle}</Text>
                )}

                {children}

                {showActions && (
                    <Group justify="flex-end" mt="md">
                        <Button
                            variant="default"
                            onClick={onClose}
                            disabled={confirmLoading}
                        >
                            {cancelLabel}
                        </Button>
                        {onConfirm && (
                            <Button
                                color={confirmColor}
                                onClick={onConfirm}
                                loading={confirmLoading}
                                disabled={confirmDisabled}
                            >
                                {confirmLabel}
                            </Button>
                        )}
                    </Group>
                )}
            </Stack>
        </Modal>
    );
}
