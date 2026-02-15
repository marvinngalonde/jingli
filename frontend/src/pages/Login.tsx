import { useState } from 'react';
import {
    Paper,
    TextInput,
    PasswordInput,
    Button,
    Title,
    Text,
    Container,
    Group,
    Anchor,
    Center,
    Box,
    rem,
    LoadingOverlay,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { IconSchool, IconLock, IconAt } from '@tabler/icons-react';
import { api } from '../services/api';

export function Login() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const form = useForm({
        initialValues: {
            email: '',
            password: '',
        },
        validate: {
            email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
            password: (val) => (val.length <= 6 ? 'Password should include at least 6 characters' : null),
        },
    });

    const handleSubmit = async (values: typeof form.values) => {
        setLoading(true);
        try {
            // TODO: Replace with actual Auth implementation
            // const res = await api.post('/auth/login', values); 
            // localStorage.setItem('token', res.data.token);

            // Simulating login for UI demo
            setTimeout(() => {
                notifications.show({
                    title: 'Welcome back!',
                    message: 'You have successfully logged in.',
                    color: 'green',
                });
                navigate('/dashboard');
                setLoading(false);
            }, 1500);

        } catch (error) {
            notifications.show({
                title: 'Login failed',
                message: 'Please check your credentials and try again.',
                color: 'red',
            });
            setLoading(false);
        }
    };

    return (
        <Box
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #eef3ff 0%, #dce4f5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Decorative Circles */}
            <Box
                style={{
                    position: 'absolute',
                    top: '-10%',
                    left: '-5%',
                    width: rem(500),
                    height: rem(500),
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(95,124,184,0.2) 0%, rgba(255,255,255,0) 70%)',
                    zIndex: 0,
                }}
            />
            <Box
                style={{
                    position: 'absolute',
                    bottom: '-10%',
                    right: '-5%',
                    width: rem(400),
                    height: rem(400),
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(116,141,193,0.2) 0%, rgba(255,255,255,0) 70%)',
                    zIndex: 0,
                }}
            />

            <Container size={420} my={40} style={{ position: 'relative', zIndex: 1 }}>
                <Paper
                    withBorder
                    shadow="xl"
                    p={30}
                    radius="md"
                    mt="xl"
                    style={{
                        backdropFilter: 'blur(10px)',
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    }}
                >
                    <Center mb="md">
                        <ThemeIcon variant="light" size={60} radius="xl" color="brand">
                            <IconSchool size={34} stroke={1.5} />
                        </ThemeIcon>
                    </Center>

                    <Title ta="center" order={2} style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
                        Welcome back
                    </Title>
                    <Text c="dimmed" size="sm" ta="center" mt={5} mb="xl">
                        Sign in to Jingli to continue
                    </Text>

                    <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

                    <form onSubmit={form.onSubmit(handleSubmit)}>
                        <TextInput
                            label="Email"
                            placeholder="you@jingli.school"
                            required
                            leftSection={<IconAt size={16} />}
                            {...form.getInputProps('email')}
                        />
                        <PasswordInput
                            label="Password"
                            placeholder="Your password"
                            required
                            mt="md"
                            leftSection={<IconLock size={16} />}
                            {...form.getInputProps('password')}
                        />
                        <Group justify="space-between" mt="lg">
                            <Anchor component="button" size="sm" type="button" c="dimmed">
                                Forgot password?
                            </Anchor>
                        </Group>
                        <Button fullWidth mt="xl" size="md" type="submit" loading={loading}>
                            Sign in
                        </Button>
                    </form>
                </Paper>
                <Text ta="center" mt="md" size="sm" c="dimmed">
                    © 2026 Jingli School Management
                </Text>
            </Container>
        </Box>
    );
}

import { ThemeIcon } from '@mantine/core';
