import { useState } from 'react';
import { getDashboardPath } from '../utils/roles';
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
    Image,
    useMantineColorScheme
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { IconEyeCheck, IconEyeOff } from '@tabler/icons-react';

// Import the new smaller transparent images
import whitelogo from '../assets/images/whitelogo.png';
import sideImgTrans from '../assets/images/sideimg-trans.png';

import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export function Login() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const form = useForm({
        initialValues: {
            username: '',
            password: '',
        },
        validate: {
            username: (val) => (val.length >= 3 ? null : 'Username must be at least 3 characters'),
            password: (val) => (val.length <= 6 ? 'Password should include at least 6 characters' : null),
        },
    });

    const handleSubmit = async (values: typeof form.values) => {
        setLoading(true);
        try {
            await login(values.username, values.password);
            notifications.show({
                title: 'Welcome back!',
                message: 'Login successful',
                color: 'green',
            });
            const resolveRes = await api.get('/users/me');
            const role = resolveRes.data.role;

            const targetPath = getDashboardPath(role);

            navigate(targetPath);

        } catch (error: any) {
            notifications.show({
                title: 'Login Failed',
                message: error.message || 'Invalid credentials',
                color: 'red',
            });
        } finally {
            setLoading(false);
        }
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
                background: isDark ? '#1a1b1e' : 'var(--app-surface)',
                color: isDark ? '#c1c2c5' : undefined
            }} className="login-form-container">
                <Box maw={450} w="100%" px="xl" py="xl">
                    <Title order={2} ta="center" mt="md" mb={10} style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: rem(32) }}>
                        Login to Jingli
                    </Title>
                    <Text ta="center" c="dimmed" mb={40}>
                        Enterprise School Management System
                    </Text>

                    <form onSubmit={form.onSubmit(handleSubmit)} style={{ position: 'relative' }}>
                        <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

                        <Stack gap="lg">
                            <TextInput
                                label="Username"
                                placeholder="Enter your username"
                                size="md"
                                radius="md"
                                required
                                {...form.getInputProps('username')}
                                styles={{ input: { backgroundColor: isDark ? '#25262b' : 'var(--app-surface-dim)' } }}
                            />

                            <PasswordInput
                                label="Password"
                                placeholder="Your Password"
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
                                styles={{ input: { backgroundColor: isDark ? '#25262b' : 'var(--app-surface-dim)' } }}
                            />
                        </Stack>

                        <Group justify="flex-end" mt="sm">
                            <Anchor component="button" type="button" size="sm" fw={600} c="brand">
                                Forgot Password?
                            </Anchor>
                        </Group>

                        <Button fullWidth mt="xl" size="lg" radius="xl" type="submit" color="brand" loading={loading}>
                            Login to Dashboard
                        </Button>

                        <Text ta="center" mt="xl" size="sm">
                            Need an account?{' '}
                            <Anchor component="button" type="button" fw={700} c="brand" onClick={() => notifications.show({ title: 'Contact Admin', message: 'Please contact your school administrator to get an account.', color: 'blue' })}>
                                Contact Admin
                            </Anchor>
                        </Text>
                    </form>
                </Box>
            </div>

            {/* RIGHT SIDE: BRANDING & ILLUSTRATION */}
            <div style={{
                flex: '1',
                background: isDark
                    ? 'radial-gradient(circle, #1a3a6e 0%, #0a1e4a 100%)'
                    : 'radial-gradient(circle, #255bb5 0%, #0d328b 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '3rem 2rem',
                position: 'relative'
            }}>
                {/* Top Logo */}
                <Box mt="xl">
                    <Image
                        src={whitelogo}
                        alt="Jingli Logo"
                        w={300} // Adjust this width as needed to match your exact logo size
                        fit="contain"
                    />
                </Box>

                {/* Center Transparent Image */}
                <Box style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                    <Image
                        src={sideImgTrans}
                        alt="Education Management Illustration"
                        w="100%"
                        maw={500} // Limits the max width so it stays crisp
                        fit="contain"
                    />
                </Box>

                {/* Bottom Text */}
                <Text
                    c="white"
                    size="xl"
                    mb="xl"
                    style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 300,
                        letterSpacing: '0.5px'
                    }}
                >
                    Empowering Education, Simplifying Management
                </Text>
            </div>
        </div>
    );
}