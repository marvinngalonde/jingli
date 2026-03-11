import { Drawer, Button, TextInput, Select, Stack, Group, PasswordInput, MultiSelect } from '@mantine/core';
import { useForm } from '@mantine/form';
import { adminUsersService } from '../../services/adminUsersService';
import { studentService } from '../../services/studentService';
import { notifications } from '@mantine/notifications';
import { useEffect, useState } from 'react';

interface UserFormProps {
    opened: boolean;
    onClose: () => void;
    onSuccess: () => void;
    user?: any; // Add user prop for editing
}

export function UserForm({ opened, onClose, onSuccess, user }: UserFormProps) {
    const isEdit = !!user;
    const [students, setStudents] = useState<any[]>([]);

    const form = useForm({
        initialValues: {
            username: user?.username || '',
            email: user?.email || '',
            password: '',
            firstName: user?.staffProfile?.firstName || user?.studentProfile?.firstName || '',
            lastName: user?.staffProfile?.lastName || user?.studentProfile?.lastName || '',
            role: user?.role || 'TEACHER',
            studentIds: [] as string[],
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
                firstName: user?.staffProfile?.firstName || user?.studentProfile?.firstName || user?.guardianProfile?.firstName || '',
                lastName: user?.staffProfile?.lastName || user?.studentProfile?.lastName || user?.guardianProfile?.lastName || '',
                role: user?.role || 'TEACHER',
                studentIds: [],
            });

            // Fetch students for parent linking
            studentService.getAll({ limit: 1000 }).then(result => setStudents(result.data)).catch(console.error);
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
                    studentIds: values.role === 'PARENT' ? values.studentIds : undefined,
                });

                notifications.show({
                    title: 'Success',
                    message: `Account created for ${values.username}!`,
                    color: 'green',
                    autoClose: 5000,
                });
            }
            form.reset();
            onClose();       // Close drawer FIRST to remove backdrop
            onSuccess();     // Then reload data (may trigger LoadingOverlay)
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
                            {
                                group: 'Administration',
                                items: [
                                    { value: 'SUPER_ADMIN', label: 'Super Admin' },
                                    { value: 'ADMIN', label: 'Administrator' },
                                    { value: 'SCHOOL_HEAD', label: 'School Head / Principal' },
                                    { value: 'DEPUTY_HEAD', label: 'Deputy Head' },
                                    { value: 'BURSAR', label: 'Bursar' },
                                    { value: 'FINANCE', label: 'Finance Officer' },
                                    { value: 'HR_MANAGER', label: 'HR Manager' },
                                    { value: 'SENIOR_CLERK', label: 'Senior Clerk' },
                                    { value: 'RECEPTION', label: 'Receptionist' },
                                    { value: 'ICT_COORDINATOR', label: 'ICT Coordinator' },
                                    { value: 'SDC_MEMBER', label: 'SDC Member' },
                                ]
                            },
                            {
                                group: 'Teaching Staff',
                                items: [
                                    { value: 'HOD', label: 'Head of Department' },
                                    { value: 'SENIOR_TEACHER', label: 'Senior Teacher' },
                                    { value: 'CLASS_TEACHER', label: 'Class Teacher' },
                                    { value: 'SUBJECT_TEACHER', label: 'Subject Teacher' },
                                    { value: 'TEACHER', label: 'Teacher' },
                                    { value: 'SEN_COORDINATOR', label: 'Special Needs Coordinator' },
                                ]
                            },
                            {
                                group: 'Specialist Staff',
                                items: [
                                    { value: 'LIBRARIAN', label: 'Librarian' },
                                    { value: 'LAB_TECHNICIAN', label: 'Lab Technician' },
                                    { value: 'SCHOOL_NURSE', label: 'School Nurse' },
                                    { value: 'SPORTS_DIRECTOR', label: 'Sports Director' },
                                    { value: 'HOSTEL_WARDEN', label: 'Hostel Warden' },
                                    { value: 'TRANSPORT_MANAGER', label: 'Transport Manager' },
                                    { value: 'SECURITY_GUARD', label: 'Security Guard' },
                                ]
                            },
                            {
                                group: 'Other',
                                items: [
                                    { value: 'STUDENT', label: 'Student' },
                                    { value: 'PARENT', label: 'Parent / Guardian' },
                                ]
                            }
                        ]}
                        required
                        {...form.getInputProps('role')}
                    />

                    {form.values.role === 'PARENT' && !isEdit && (
                        <MultiSelect
                            label="Link to Students"
                            description="Select the children/students this parent will oversee"
                            placeholder="Search by name or admission number"
                            data={students.map(s => ({
                                value: s.id,
                                label: `${s.firstName} ${s.lastName} (${s.admissionNo})`,
                            }))}
                            searchable
                            clearable
                            {...form.getInputProps('studentIds')}
                        />
                    )}

                    <Button type="submit" fullWidth mt="md">
                        {isEdit ? "Update Account" : "Create Account"}
                    </Button>
                </Stack>
            </form>
        </Drawer>
    );
}
