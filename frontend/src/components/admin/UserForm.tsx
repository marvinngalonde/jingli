import { Drawer, Button, TextInput, Select, Stack, Group, PasswordInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { adminUsersService } from '../../services/adminUsersService';
import { notifications } from '@mantine/notifications';
import { useEffect } from 'react';

interface UserFormProps {
    opened: boolean;
    onClose: () => void;
    onSuccess: () => void;
    user?: any; // Add user prop for editing
}

export function UserForm({ opened, onClose, onSuccess, user }: UserFormProps) {
    const isEdit = !!user;

    const form = useForm({
        initialValues: {
            username: user?.username || '',
            email: user?.email || '',
            password: '',
            firstName: user?.staffProfile?.firstName || user?.studentProfile?.firstName || '',
            lastName: user?.staffProfile?.lastName || user?.studentProfile?.lastName || '',
            role: user?.role || 'TEACHER',
        },
        validate: {
            username: (value) => (value.length >= 3 ? null : 'Username must be at least 3 characters'),
            email: (value) => {
                if (!value) return null;
                return /^\S+@\S+$/.test(value) ? null : 'Invalid email';
            },
            password: (value) => {
                if (isEdit && !value) return null; // Optional on edit
                return value.length >= 6 ? null : 'Password must be at least 6 characters';
            },
            firstName: (value) => (value.length > 0 ? null : 'First name is required'),
            lastName: (value) => (value.length > 0 ? null : 'Last name is required'),
        },
    });

    // Reset form when user changes or drawer opens
    useEffect(() => {
        if (opened) {
            form.setValues({
                username: user?.username || '',
                email: user?.email || '',
                password: '',
                firstName: user?.staffProfile?.firstName || user?.studentProfile?.firstName || '',
                lastName: user?.staffProfile?.lastName || user?.studentProfile?.lastName || '',
                role: user?.role || 'TEACHER',
            });
        }
    }, [opened, user]);

    const handleSubmit = async (values: typeof form.values) => {
        try {
            if (isEdit) {
                await adminUsersService.updateUser(user.id, {
                    username: values.username,
                    email: values.email || undefined,
                    password: values.password || undefined,
                    firstName: values.firstName,
                    lastName: values.lastName,
                    role: values.role as any,
                });
                notifications.show({
                    title: 'Success',
                    message: `Account updated for ${values.username}!`,
                    color: 'green',
                });
            } else {
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
            }
            form.reset();
            onSuccess();
            onClose();
        } catch (error: any) {
            notifications.show({
                title: 'Error',
                message: error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} user`,
                color: 'red',
            });
        }
    };

    return (
        <Drawer
            opened={opened}
            onClose={onClose}
            title={isEdit ? "Edit User" : "Create New User"}
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
                        label={isEdit ? "Change Password" : "Initial Password"}
                        placeholder={isEdit ? "Leave blank to keep current" : "Min 6 characters"}
                        required={!isEdit}
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
                        {isEdit ? "Update Account" : "Create Account"}
                    </Button>
                </Stack>
            </form>
        </Drawer>
    );
}
