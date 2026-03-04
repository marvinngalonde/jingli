import { useState } from 'react';
import {
    TextInput,
    PasswordInput,
    Button,
    Title,
    Text,
    Box,
    rem,
    LoadingOverlay,
    Stack,
    Image,
    Stepper,
    Group
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { IconEyeCheck, IconEyeOff } from '@tabler/icons-react';
import { useMantineColorScheme } from '@mantine/core';

// Import the branded images
import whitelogo from '../assets/images/whitelogo.png';
import sideImgTrans from '../assets/images/sideimg-trans.png';

import { api } from '../services/api';

export function Installation() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [active, setActive] = useState(0);
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const form = useForm({
        initialValues: {
            schoolName: '',
            subdomain: '',
            adminFirstName: '',
            adminLastName: '',
            adminUsername: '',
            adminEmail: '',
            adminPassword: '',
        },
        validate: (values) => {
            if (active === 0) {
                return {
                    schoolName: values.schoolName.trim().length < 3 ? 'School Name must be at least 3 characters' : null,
                    subdomain: values.subdomain.trim().length < 3 ? 'Subdomain must be at least 3 characters' : null,
                };
            }
            if (active === 1) {
                return {
                    adminFirstName: values.adminFirstName.trim().length < 2 ? 'First Name required' : null,
                    adminLastName: values.adminLastName.trim().length < 2 ? 'Last Name required' : null,
                    adminUsername: values.adminUsername.trim().length < 3 ? 'Username required' : null,
                    adminEmail: /^\S+@\S+$/.test(values.adminEmail) ? null : 'Invalid email',
                    adminPassword: values.adminPassword.length < 6 ? 'Password must be at least 6 characters' : null,
                };
            }
            return {};
        }
    });

    const nextStep = () => {
        if (!form.validate().hasErrors) {
            setActive((current) => (current < 2 ? current + 1 : current));
        }
    };

    const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

    const handleSubmit = async (values: typeof form.values) => {
        setLoading(true);
        try {
            await api.post('/system/install', values);
            notifications.show({
                title: 'Installation Complete!',
                message: 'You can now log in using your admin credentials.',
                color: 'green',
            });
            // Force reload to re-check status in AuthContext
            window.location.href = '/login';
        } catch (error: any) {
            notifications.show({
                title: 'Installation Failed',
                message: error.response?.data?.message || error.message || 'Something went wrong',
                color: 'red',
            });
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
            }}>
                <Box maw={500} w="100%" px="xl" py="xl">
                    <Title order={2} ta="center" mt="md" mb={10} style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: rem(32) }}>
                        System Installation
                    </Title>
                    <Text ta="center" c="dimmed" mb={40}>
                        Let's set up your Jingli workspace
                    </Text>

                    <Stepper active={active} onStepClick={setActive} allowNextStepsSelect={false} mb={40}>
                        <Stepper.Step label="First step" description="School Profile">
                            <Stack gap="md" mt="md">
                                <TextInput
                                    label="School Name"
                                    placeholder="e.g. Springfield High"
                                    size="md"
                                    radius="md"
                                    required
                                    {...form.getInputProps('schoolName')}
                                    styles={{ input: { backgroundColor: isDark ? '#25262b' : undefined } }}
                                />
                                <TextInput
                                    label="Subdomain"
                                    placeholder="e.g. springfield"
                                    size="md"
                                    radius="md"
                                    required
                                    description="This will be used for your school's custom URL"
                                    {...form.getInputProps('subdomain')}
                                    styles={{ input: { backgroundColor: isDark ? '#25262b' : undefined } }}
                                />
                            </Stack>
                        </Stepper.Step>

                        <Stepper.Step label="Second step" description="Admin Account">
                            <Stack gap="md" mt="md">
                                <Group grow>
                                    <TextInput label="First Name" placeholder="John" required {...form.getInputProps('adminFirstName')} styles={{ input: { backgroundColor: isDark ? '#25262b' : undefined } }} />
                                    <TextInput label="Last Name" placeholder="Doe" required {...form.getInputProps('adminLastName')} styles={{ input: { backgroundColor: isDark ? '#25262b' : undefined } }} />
                                </Group>
                                <TextInput label="Username" placeholder="admin" required {...form.getInputProps('adminUsername')} styles={{ input: { backgroundColor: isDark ? '#25262b' : undefined } }} />
                                <TextInput label="Email Address" placeholder="admin@school.com" required {...form.getInputProps('adminEmail')} styles={{ input: { backgroundColor: isDark ? '#25262b' : undefined } }} />
                                <PasswordInput
                                    label="Password"
                                    placeholder="Strong password"
                                    required
                                    visibilityToggleIcon={({ reveal }) =>
                                        reveal ? <IconEyeOff size={20} /> : <IconEyeCheck size={20} />
                                    }
                                    {...form.getInputProps('adminPassword')}
                                    styles={{ input: { backgroundColor: isDark ? '#25262b' : undefined } }}
                                />
                            </Stack>
                        </Stepper.Step>

                        <Stepper.Completed>
                            <Box ta="center" mt="xl">
                                <Text size="lg" fw={500} mb="md">All set!</Text>
                                <Text c="dimmed">Click the button below to initialize the database and create your account. This may take a moment.</Text>
                            </Box>
                        </Stepper.Completed>
                    </Stepper>

                    <Group justify="space-between" mt="xl">
                        {active !== 0 && (
                            <Button variant="default" onClick={prevStep} size="md">Back</Button>
                        )}
                        {active === 0 && <Box />}

                        {active < 2 ? (
                            <Button onClick={nextStep} size="md" color="brand">Next step</Button>
                        ) : (
                            <Button
                                onClick={() => handleSubmit(form.values)}
                                size="md"
                                color="green"
                                loading={loading}
                            >
                                Install System
                            </Button>
                        )}
                    </Group>
                    <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
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
                        w={300}
                        fit="contain"
                    />
                </Box>

                {/* Center Transparent Image */}
                <Box style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                    <Image
                        src={sideImgTrans}
                        alt="Education Management Illustration"
                        w="100%"
                        maw={500}
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
