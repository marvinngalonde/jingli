import { Drawer, Button, TextInput, Select, Stack, Group, PasswordInput, Text, rem } from '@mantine/core';
import { useForm } from '@mantine/form';
import { adminUsersService } from '../../services/adminUsersService';
import { notifications } from '@mantine/notifications';

interface UserFormProps {
    opened: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function UserForm({ opened, onClose, onSuccess }: UserFormProps) {
    const form = useForm({
        initialValues: {
            username: '',
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            role: 'TEACHER',
        },
        validate: {
            username: (value) => (value.length >= 3 ? null : 'Username must be at least 3 characters'),
            email: (value) => {
                if (!value) return null;
                return /^\S+@\S+$/.test(value) ? null : 'Invalid email';
            },
            password: (value) => (value.length >= 6 ? null : 'Password must be at least 6 characters'),
            firstName: (value) => (value.length > 0 ? null : 'First name is required'),
            lastName: (value) => (value.length > 0 ? null : 'Last name is required'),
        },
    });

    const handleSubmit = async (values: typeof form.values) => {
        try {
            await adminUsersService.createUser({
                username: values.username,
                email: values.email || undefined,
                password: values.password,
                firstName: values.firstName,
                lastName: values.lastName,
                role: values.role as any,
            });

            notifications.show({
                title: 'Success',
                message: `Account created for ${values.username}!`,
                color: 'green',
                autoClose: 5000,
            });
            form.reset();
            onSuccess();
            onClose();
        } catch (error: any) {
            notifications.show({
                title: 'Error',
                message: error.response?.data?.message || 'Failed to create user',
                color: 'red',
            });
        }
    };

    return (
        <Drawer
            opened={opened}
            onClose={onClose}
            title="Create New User"
            position="right"
            size="md"
        >
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack>
                    <TextInput
                        label="Username"
                        placeholder="e.g. jdoe_teacher"
                        required
                        {...form.getInputProps('username')}
                        description="This will be the login ID"
                    />

                    <TextInput
                        label="Email Address (Optional)"
                        placeholder="user@school.com"
                        {...form.getInputProps('email')}
                    />

                    <PasswordInput
                        label="Initial Password"
                        placeholder="Min 6 characters"
                        required
                        {...form.getInputProps('password')}
                    />

                    <Group grow>
                        <TextInput
                            label="First Name"
                            placeholder="John"
                            required
                            {...form.getInputProps('firstName')}
                        />
                        <TextInput
                            label="Last Name"
                            placeholder="Doe"
                            required
                            {...form.getInputProps('lastName')}
                        />
                    </Group>
                    <Select
                        label="System Role"
                        placeholder="Pick one"
                        data={[
                            { value: 'ADMIN', label: 'Administrator' },
                            { value: 'TEACHER', label: 'Teacher' },
                            { value: 'STUDENT', label: 'Student' },
                            { value: 'RECEPTION', label: 'Receptionist' },
                            { value: 'FINANCE', label: 'Finance Officer' },
                        ]}
                        required
                        {...form.getInputProps('role')}
                    />
                    <Button type="submit" fullWidth mt="md">
                        Create Account
                    </Button>
                </Stack>
            </form>
        </Drawer>
    );
}
