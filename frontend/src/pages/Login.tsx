import { useState } from 'react';
import {
    TextInput,
    PasswordInput,
    Button,
    Title,
    Text,
    Group,
    Anchor,
    Box,
    rem,
    LoadingOverlay,
    Stack,
    Image
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { IconEyeCheck, IconEyeOff } from '@tabler/icons-react';
import sideImage from '../assets/images/sideimg.png';

import { useAuth, type UserRole } from '../context/AuthContext';
import { Select } from '@mantine/core';

export function Login() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const form = useForm({
        initialValues: {
            email: '',
            password: '',
            role: 'admin' as UserRole,
        },
        validate: {
            email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
            password: (val) => (val.length <= 6 ? 'Password should include at least 6 characters' : null),
        },
    });

    const handleSubmit = async (values: typeof form.values) => {
        setLoading(true);
        // Simulate login
        setTimeout(() => {
            login(values.role);
            notifications.show({
                title: 'Welcome back!',
                message: `Logged in as ${values.role}`,
                color: 'green',
            });
            navigate('/dashboard');
            setLoading(false);
        }, 1000);
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', overflow: 'hidden', margin: 0, padding: 0 }}>
            {/* LEFT SIDE: FORM */}
            <div style={{
                flex: '0 0 50%',
                maxWidth: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'white'
            }} className="login-form-container">
                <Box maw={450} w="100%" px="xl" py="xl">
                    <Title order={2} ta="center" mt="md" mb={10} style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: rem(32) }}>
                        Login to Jingli
                    </Title>
                    <Text ta="center" c="dimmed" mb={40}>
                        Select a role to demo the portal
                    </Text>

                    <form onSubmit={form.onSubmit(handleSubmit)} style={{ position: 'relative' }}>
                        <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

                        <Stack gap="lg">
                            <Select
                                label="Login As"
                                data={[
                                    { value: 'admin', label: 'Administrator' },
                                    { value: 'teacher', label: 'Teacher' },
                                    { value: 'student', label: 'Student' },
                                    { value: 'parent', label: 'Parent' },
                                    { value: 'reception', label: 'Receptionist' },
                                ]}
                                {...form.getInputProps('role')}
                            />

                            <TextInput
                                label="Email Address"
                                placeholder="Email Address"
                                size="md"
                                radius="md"
                                required
                                {...form.getInputProps('email')}
                                styles={{ input: { backgroundColor: '#f8fafc' } }}
                            />

                            <PasswordInput
                                label="Password"
                                placeholder="Password"
                                size="md"
                                radius="md"
                                required
                                visibilityToggleIcon={({ reveal }) =>
                                    reveal ? (
                                        <IconEyeOff style={{ width: rem(20), height: rem(20) }} />
                                    ) : (
                                        <IconEyeCheck style={{ width: rem(20), height: rem(20) }} />
                                    )
                                }
                                {...form.getInputProps('password')}
                                styles={{ input: { backgroundColor: '#f8fafc' } }}
                            />
                        </Stack>

                        <Group justify="flex-end" mt="sm">
                            <Anchor component="button" type="button" size="sm" fw={600} c="brand">
                                Forgot Password?
                            </Anchor>
                        </Group>

                        <Button fullWidth mt="xl" size="lg" radius="xl" type="submit" color="brand" loading={loading}>
                            Login
                        </Button>

                        <Text ta="center" mt="xl" size="sm">
                            Don't have an account?{' '}
                            <Anchor component="button" type="button" fw={700} onClick={() => navigate('/signup')} c="brand">
                                Sign up
                            </Anchor>
                        </Text>
                    </form>
                </Box>
            </div>

            {/* RIGHT SIDE: IMAGE */}
            <div style={{
                flex: '1',
                background: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
            }}>
                <Image
                    src={sideImage}
                    alt="Login Background"
                    w="100%"
                    h="100%"
                    fit="cover"
                />
            </div>
        </div>
    );
}
