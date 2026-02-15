import {
    TextInput,
    PasswordInput,
    Button,
    Title,
    Text,
    Group,
    Anchor,
    Stack,
    Box,
    rem,
    SimpleGrid,
    Checkbox,
} from '@mantine/core';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { showErrorNotification, showSuccessNotification } from '../utils/notifications';

const signupSchema = z.object({
    schoolName: z.string().min(2, 'School name is required'),
    adminEmail: z.string().email('Invalid email address'),
    phoneNumber: z.string().min(10, 'Required'),
    password: z.string().min(8, 'Minimum 8 characters'),
    terms: z.boolean().refine(val => val === true, 'You must agree to terms'),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function Signup() {
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            schoolName: '',
            adminEmail: '',
            phoneNumber: '',
            password: '',
            terms: false,
        },
    });

    const onSubmit = async (values: SignupFormValues) => {
        try {
            // Create user account and profile
            await authService.signUp(
                values.adminEmail,
                values.password,
                values.schoolName, // Using school name as full name for admin
                'admin' // Default role for signup is admin
            );

            showSuccessNotification(
                'Account created successfully! Please check your email to verify your account.',
                'Welcome to Jingli!'
            );

            // Redirect to login page
            navigate('/login');
        } catch (error: any) {
            showErrorNotification(
                error.message || 'Failed to create account. Please try again.',
                'Signup Failed'
            );
        }
    };

    return (
        <Box
            style={{
                minHeight: '100vh',
                display: 'flex',
            }}
        >
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={0} style={{ width: '100%', minHeight: '100vh' }}>
                {/* Left Side: Branding */}
                <Box
                    bg="navy.9"
                    p={60}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        color: 'white',
                    }}
                >
                    <Box>
                        <Group gap="xs">
                            <Box
                                style={{
                                    backgroundColor: 'white',
                                    borderRadius: '50%',
                                    padding: rem(6),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <GraduationCap size={24} color="var(--mantine-color-navy-9)" />
                            </Box>
                            <Text fw={700} size="xl">Jingli 经理</Text>
                        </Group>
                    </Box>

                    <Stack gap="xs" mb={80}>
                        <Text size={rem(32)} fw={600} style={{ lineHeight: 1.2 }}>
                            Welcome to Jingli 经理.
                        </Text>
                        <Text size="md" c="gray.3" maw={400}>
                            Empower your school's management. Get started today.
                        </Text>
                    </Stack>

                    <Box /> {/* Spacer */}
                </Box>

                {/* Right Side: Form */}
                <Box
                    p={60}
                    bg="white"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <Box w="100%" maw={450}>
                        <Title order={2} size="h3" fw={600} mb="xl">
                            School Registration
                        </Title>

                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Stack gap="md">
                                <TextInput
                                    label={<Text size="xs" fw={500}>School Name</Text>}
                                    placeholder="Enter school name"
                                    required
                                    {...register('schoolName')}
                                    error={errors.schoolName?.message}
                                    size="sm"
                                    radius={2}
                                />

                                <TextInput
                                    label={<Text size="xs" fw={500}>Admin Email</Text>}
                                    placeholder="admin@school.edu"
                                    required
                                    {...register('adminEmail')}
                                    error={errors.adminEmail?.message}
                                    size="sm"
                                    radius={2}
                                />

                                <TextInput
                                    label={<Text size="xs" fw={500}>Phone Number</Text>}
                                    placeholder="+1 (555) 000-0000"
                                    required
                                    {...register('phoneNumber')}
                                    error={errors.phoneNumber?.message}
                                    size="sm"
                                    radius={2}
                                    leftSection={
                                        <Box style={{ display: 'flex', alignItems: 'center', gap: rem(4), borderRight: '1px solid #eee', paddingRight: rem(8), marginLeft: rem(8) }}>
                                            <img src="https://flagcdn.com/w20/us.png" width="16" alt="US" />
                                            <Text size="xs">⌄</Text>
                                        </Box>
                                    }
                                    leftSectionWidth={60}
                                />

                                <PasswordInput
                                    label={<Text size="xs" fw={500}>Create Password</Text>}
                                    placeholder="Minimum 8 characters"
                                    required
                                    {...register('password')}
                                    error={errors.password?.message}
                                    size="sm"
                                    radius={2}
                                />

                                <Checkbox
                                    label={
                                        <Text size="xs">
                                            I agree to the <Anchor size="xs" color="navy.6">Terms of Service</Anchor> and <Anchor size="xs" color="navy.6">Privacy Policy</Anchor>.
                                        </Text>
                                    }
                                    {...register('terms')}
                                    error={errors.terms?.message}
                                    radius={2}
                                />

                                <Button
                                    type="submit"
                                    fullWidth
                                    mt="md"
                                    size="sm"
                                    loading={isSubmitting}
                                    color="navy.9"
                                    radius={2}
                                >
                                    Create Account
                                </Button>

                                <Text ta="center" size="xs" mt="sm">
                                    Already have an account? <Anchor size="xs" fw={600} color="navy.6" onClick={() => navigate('/login')}>Log In</Anchor>
                                </Text>
                            </Stack>
                        </form>

                        <Text c="dimmed" style={{ fontSize: rem(10) }} ta="center" mt={40}>
                            © 2026 Jingli 经理 Systems. All rights reserved.
                        </Text>
                    </Box>
                </Box>
            </SimpleGrid>
        </Box>
    );
}
