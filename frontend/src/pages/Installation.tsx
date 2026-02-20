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
import sideImage from '../assets/images/sideimg.png';
import { api } from '../services/api';

export function Installation() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [active, setActive] = useState(0);

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
                background: 'white'
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
                                />
                                <TextInput
                                    label="Subdomain"
                                    placeholder="e.g. springfield"
                                    size="md"
                                    radius="md"
                                    required
                                    description="This will be used for your school's custom URL"
                                    {...form.getInputProps('subdomain')}
                                />
                            </Stack>
                        </Stepper.Step>

                        <Stepper.Step label="Second step" description="Admin Account">
                            <Stack gap="md" mt="md">
                                <Group grow>
                                    <TextInput label="First Name" placeholder="John" required {...form.getInputProps('adminFirstName')} />
                                    <TextInput label="Last Name" placeholder="Doe" required {...form.getInputProps('adminLastName')} />
                                </Group>
                                <TextInput label="Username" placeholder="admin" required {...form.getInputProps('adminUsername')} />
                                <TextInput label="Email Address" placeholder="admin@school.com" required {...form.getInputProps('adminEmail')} />
                                <PasswordInput
                                    label="Password"
                                    placeholder="Strong password"
                                    required
                                    visibilityToggleIcon={({ reveal }) =>
                                        reveal ? <IconEyeOff size={20} /> : <IconEyeCheck size={20} />
                                    }
                                    {...form.getInputProps('adminPassword')}
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
                    alt="Installation Background"
                    w="100%"
                    h="100%"
                    fit="cover"
                />
            </div>
        </div>
    );
}
