import {
    TextInput,
    PasswordInput,
    Button,
    Paper,
    Title,
    Text,
    Container,
    Group,
    Anchor,
    Center,
    Stack,
    Box,
    rem,
} from '@mantine/core';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import { authService } from '../services/authService';
import { showErrorNotification, showSuccessNotification } from '../utils/notifications';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
    const navigate = useNavigate();
    const [forgotPasswordOpened, setForgotPasswordOpened] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (values: LoginFormValues) => {
        try {
            await authService.signIn(values.email, values.password);
            showSuccessNotification('Login successful!');
            navigate('/dashboard');
        } catch (error: any) {
            showErrorNotification(error.message || 'Login failed. Please check your credentials.');
        }
    };

    return (
        <Box
            bg="navy.0"
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                paddingBottom: rem(40)
            }}
        >
            <Container size="sm" style={{ display: 'flex', justifyContent: 'center' }}>
                <Paper withBorder shadow="sm" p={40} radius={2} bg="white" w={450}>
                    <Stack align="center" gap="xs" mb={40}>
                        {/* Logo placeholder mimicking the image */}
                        <Box
                            style={{
                                color: 'var(--mantine-color-navy-9)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}
                        >
                            <GraduationCap size={42} strokeWidth={1.5} />
                            <Box
                                mt={-8}
                                style={{
                                    width: rem(34),
                                    height: rem(3),
                                    backgroundColor: 'var(--mantine-color-navy-7)',
                                    borderRadius: rem(1),
                                }}
                            />
                        </Box>

                        <Title order={2} ta="center" fw={500} mt="md" size="h3">
                            Jingli Portal Login
                        </Title>
                    </Stack>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Stack gap="md">
                            <TextInput
                                label={<Text size="xs" fw={500}>Email</Text>}
                                placeholder="user@school.edu"
                                required
                                {...register('email')}
                                error={errors.email?.message}
                                size="sm"
                                radius={2}
                            />

                            <PasswordInput
                                label={<Text size="xs" fw={500}>Password</Text>}
                                placeholder="••••••••••••"
                                required
                                {...register('password')}
                                error={errors.password?.message}
                                size="sm"
                                radius={2}
                            />

                            <Button
                                type="submit"
                                fullWidth
                                mt="lg"
                                size="sm"
                                loading={isSubmitting}
                                color="navy.9"
                                radius={2}
                            >
                                Sign In
                            </Button>
                        </Stack>
                    </form>

                    <Center mt="xl">
                        <Stack gap="xs" align="center">
                            <Anchor component="button" size="xs" color="navy.7" onClick={() => setForgotPasswordOpened(true)}>
                                Forgot Password?
                            </Anchor>
                            <Text size="xs">
                                Don't have an account? <Anchor size="xs" fw={600} color="navy.6" onClick={() => navigate('/signup')}>Create one</Anchor>
                            </Text>
                        </Stack>
                    </Center>

                    <Text c="dimmed" style={{ fontSize: rem(10) }} ta="center" mt={40}>
                        © 2026 Jingli 经理 Systems. All rights reserved.
                    </Text>
                </Paper>
            </Container>

            <ForgotPasswordModal
                opened={forgotPasswordOpened}
                onClose={() => setForgotPasswordOpened(false)}
            />
        </Box>
    );
}
