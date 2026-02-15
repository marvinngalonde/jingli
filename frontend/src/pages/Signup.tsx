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
    Image, // Ensure Image is imported
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { IconEyeCheck, IconEyeOff } from '@tabler/icons-react';
import sideImage from '../assets/images/sideimg.png';

export function Signup() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

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
        // Simulate Signup
        setTimeout(() => {
            notifications.show({
                title: 'Account Created!',
                message: 'Please login to continue.',
                color: 'green',
            });
            navigate('/login');
            setLoading(false);
        }, 1500);
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
            }} className="signup-form-container">
                <Box maw={450} w="100%" px="xl" py="xl">
                    <Title order={2} ta="center" mt="md" mb={40} style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: rem(28) }}>
                        Create your Jingli Account
                    </Title>

                    <form onSubmit={form.onSubmit(handleSubmit)} style={{ position: 'relative' }}>
                        <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

                        <Stack gap="md">
                            <TextInput
                                label="Full Name"
                                placeholder="Full Name"
                                size="md"
                                radius="md"
                                required
                                {...form.getInputProps('name')}
                                styles={{ input: { backgroundColor: '#f8fafc' } }}
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

                            <PasswordInput
                                label="Confirm Password"
                                placeholder="Confirm Password"
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
                                {...form.getInputProps('confirmPassword')}
                                styles={{ input: { backgroundColor: '#f8fafc' } }}
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
                    alt="Signup Background"
                    w="100%"
                    h="100%"
                    fit="cover"
                />
            </div>
        </div>
    );
}
