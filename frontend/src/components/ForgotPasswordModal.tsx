import { Modal, TextInput, Button, Stack, Text, Box, rem } from '@mantine/core';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Lock } from 'lucide-react';
import { authService } from '../services/authService';
import { showErrorNotification, showSuccessNotification } from '../utils/notifications';

const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordModalProps {
    opened: boolean;
    onClose: () => void;
}

export default function ForgotPasswordModal({ opened, onClose }: ForgotPasswordModalProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: '',
        },
    });

    const onSubmit = async (values: ForgotPasswordFormValues) => {
        try {
            await authService.resetPassword(values.email);
            showSuccessNotification(
                'Password reset link has been sent to your email.',
                'Check Your Email'
            );
            reset();
            onClose();
        } catch (error: any) {
            showErrorNotification(
                error.message || 'Failed to send reset link. Please try again.',
                'Reset Failed'
            );
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            centered
            size={400}
            padding={40}
            radius={2}
            withCloseButton={false}
            overlayProps={{
                backgroundOpacity: 0.7,
                blur: 4,
            }}
        >
            <Stack align="center" gap="md">
                <Box
                    style={{
                        width: rem(60),
                        height: rem(60),
                        borderRadius: '50%',
                        border: '2px solid var(--mantine-color-gray-3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--mantine-color-gray-6)',
                    }}
                >
                    <Lock size={28} strokeWidth={1.5} />
                </Box>

                <Text size="lg" fw={600} ta="center">
                    Password Recovery
                </Text>

                <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
                    <Stack gap="md">
                        <TextInput
                            label={<Text size="xs" fw={500}>Enter Registered Email</Text>}
                            placeholder="email@example.com"
                            required
                            {...register('email')}
                            error={errors.email?.message}
                            size="sm"
                            radius={2}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            size="sm"
                            loading={isSubmitting}
                            color="navy.9"
                            radius={2}
                        >
                            Send Reset Link
                        </Button>

                        <Text
                            ta="center"
                            size="xs"
                            c="dimmed"
                            style={{ cursor: 'pointer' }}
                            onClick={onClose}
                        >
                            Back to Login
                        </Text>
                    </Stack>
                </form>
            </Stack>
        </Modal>
    );
}
