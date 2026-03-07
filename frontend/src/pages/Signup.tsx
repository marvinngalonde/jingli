import { useState } from 'react';
import {
    TextInput,
    PasswordInput,
    Button,
    Title,
    Text,
    Anchor,
    Box,
    rem,
    LoadingOverlay,
    Stack,
    Image,
    useMantineColorScheme,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { IconEyeCheck, IconEyeOff } from '@tabler/icons-react';

import whitelogo from '../assets/images/whitelogo.png';
import sideImgTrans from '../assets/images/sideimg-trans.png';

import { supabase } from '../lib/supabase';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function Signup() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { setSkipNextProfileFetch, fetchProfile } = useAuth();
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const form = useForm({
        initialValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
        validate: {
            email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
            password: (val) => (val.length <= 6 ? 'Password should include at least 6 characters' : null),
            confirmPassword: (val, values) => (val !== values.password ? 'Passwords did not match' : null),
        },
    });

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const { name, email, password } = form.values;
            setSkipNextProfileFetch(true);

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { full_name: name } },
            });

            if (error) throw error;

            if (data.session) {
                const token = data.session.access_token;
                await api.post(
                    '/auth/sync',
                    {
                        email,
                        firstName: name.split(' ')[0],
                        lastName: name.split(' ').slice(1).join(' ') || '',
                        role: 'STUDENT',
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                await fetchProfile();
                notifications.show({ title: 'Account Created!', message: 'Welcome to Jingli! Redirecting to dashboard...', color: 'green' });
                navigate('/');
            } else {
                notifications.show({ title: 'Check your email', message: 'A confirmation link has been sent to your email address.', color: 'blue', autoClose: 5000 });
                navigate('/login');
            }
        } catch (error: any) {
            notifications.show({ title: 'Signup Failed', message: error.response?.data?.message || error.message || 'An error occurred during signup', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            {/* LEFT SIDE: FORM */}
            <div
                className="auth-form-panel"
                style={{
                    background: isDark ? '#1a1b1e' : 'var(--app-surface)',
                    color: isDark ? '#c1c2c5' : undefined,
                }}
            >
                <Box maw={450} w="100%" px="xl" py="xl">
                    <Title order={2} ta="center" mt="md" mb={10} style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: rem(28) }}>
                        Create your Jingli Account
                    </Title>
                    <Text ta="center" c="dimmed" mb={40}>
                        Enterprise School Management System
                    </Text>

                    <form onSubmit={form.onSubmit(handleSubmit)} style={{ position: 'relative' }}>
                        <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />

                        <Stack gap="md">
                            <TextInput
                                label="Full Name"
                                placeholder="Full Name"
                                size="md"
                                radius="md"
                                required
                                {...form.getInputProps('name')}
                                styles={{ input: { backgroundColor: isDark ? '#25262b' : 'var(--app-surface-dim)' } }}
                            />
                            <TextInput
                                label="Email Address"
                                placeholder="Email Address"
                                size="md"
                                radius="md"
                                required
                                {...form.getInputProps('email')}
                                styles={{ input: { backgroundColor: isDark ? '#25262b' : 'var(--app-surface-dim)' } }}
                            />
                            <PasswordInput
                                label="Password"
                                placeholder="Password"
                                size="md"
                                radius="md"
                                required
                                visibilityToggleIcon={({ reveal }) =>
                                    reveal ? <IconEyeOff style={{ width: rem(20), height: rem(20) }} /> : <IconEyeCheck style={{ width: rem(20), height: rem(20) }} />
                                }
                                {...form.getInputProps('password')}
                                styles={{ input: { backgroundColor: isDark ? '#25262b' : 'var(--app-surface-dim)' } }}
                            />
                            <PasswordInput
                                label="Confirm Password"
                                placeholder="Confirm Password"
                                size="md"
                                radius="md"
                                required
                                visibilityToggleIcon={({ reveal }) =>
                                    reveal ? <IconEyeOff style={{ width: rem(20), height: rem(20) }} /> : <IconEyeCheck style={{ width: rem(20), height: rem(20) }} />
                                }
                                {...form.getInputProps('confirmPassword')}
                                styles={{ input: { backgroundColor: isDark ? '#25262b' : 'var(--app-surface-dim)' } }}
                            />
                        </Stack>

                        <Button fullWidth mt="xl" size="lg" radius="xl" type="submit" color="brand" loading={loading}>
                            Create Account
                        </Button>

                        <Text ta="center" mt="xl" size="sm">
                            Already have an account?{' '}
                            <Anchor component="button" type="button" fw={700} onClick={() => navigate('/login')} c="brand">
                                Login
                            </Anchor>
                        </Text>
                    </form>
                </Box>
            </div>

            {/* RIGHT SIDE: BRANDING & ILLUSTRATION */}
            <div
                className="auth-brand-panel"
                style={{
                    background: isDark
                        ? 'radial-gradient(circle, #1a3a6e 0%, #0a1e4a 100%)'
                        : 'radial-gradient(circle, #255bb5 0%, #0d328b 100%)',
                }}
            >
                <Box mt="xl" className="auth-brand-top">
                    <Image src={whitelogo} alt="Jingli Logo" w={200} fit="contain" />
                </Box>

                <Box className="auth-brand-illustration" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                    <Image src={sideImgTrans} alt="Education Management Illustration" w="100%" maw={500} fit="contain" />
                </Box>

                <Text
                    c="white"
                    size="xl"
                    mb="xl"
                    className="auth-brand-tagline"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300, letterSpacing: '0.5px', textAlign: 'center' }}
                >
                    Empowering Education, Simplifying Management
                </Text>
            </div>
        </div>
    );
}
