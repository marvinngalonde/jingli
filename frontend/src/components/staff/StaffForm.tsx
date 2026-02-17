import { useForm } from '@mantine/form';
import {
    TextInput,
    Select,
    Button,
    Group,
    Stack,
    Grid,
    Title,
    Divider
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import type { CreateStaffDto } from '../../types/staff';

interface StaffFormProps {
    initialValues?: any;
    onSubmit: (values: any) => void;
    onCancel: () => void;
    loading?: boolean;
    isEditing?: boolean;
}

export function StaffForm({ initialValues, onSubmit, onCancel, loading, isEditing }: StaffFormProps) {
    const form = useForm({
        initialValues: initialValues || {
            employeeId: '',
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            designation: '',
            department: '',
            joinDate: new Date(),
        },
        validate: {
            firstName: (value) => (value?.length < 2 ? 'First name must have at least 2 letters' : null),
            lastName: (value) => (value?.length < 2 ? 'Last name must have at least 2 letters' : null),
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
            employeeId: (value) => (value ? null : 'Employee ID is required'),
            designation: (value) => (value ? null : 'Designation is required'),
            department: (value) => (value ? null : 'Department is required'),
        },
    });

    const handleSubmit = (values: any) => {
        const payload = {
            ...values,
            joinDate: values.joinDate ? values.joinDate.toISOString() : new Date().toISOString(),
        };
        onSubmit(payload);
    };

    return (
        <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
                <Title order={4}>Personal Details</Title>
                <Grid>
                    <Grid.Col span={6}>
                        <TextInput label="Employee ID" placeholder="EMP-001" required {...form.getInputProps('employeeId')} disabled={isEditing} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <TextInput label="Phone" placeholder="+1 234 567 890" {...form.getInputProps('phone')} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <TextInput label="First Name" placeholder="John" required {...form.getInputProps('firstName')} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <TextInput label="Last Name" placeholder="Doe" required {...form.getInputProps('lastName')} />
                    </Grid.Col>
                    <Grid.Col span={12}>
                        <TextInput label="Email" placeholder="john.doe@school.com" description="Used for login credentials" required {...form.getInputProps('email')} disabled={isEditing} />
                    </Grid.Col>
                </Grid>

                <Divider />

                <Title order={4}>Job Details</Title>
                <Grid>
                    <Grid.Col span={6}>
                        <Select
                            label="Designation"
                            placeholder="Select"
                            data={['Principal', 'Teacher', 'Admin', 'Support Staff', 'Librarian']}
                            required
                            {...form.getInputProps('designation')}
                        />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <Select
                            label="Department"
                            placeholder="Select"
                            data={['Administration', 'Science', 'Mathematics', 'English', 'Arts', 'Sports', 'IT']}
                            required
                            {...form.getInputProps('department')}
                        />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <DateInput
                            label="Joining Date"
                            placeholder="Pick date"
                            required
                            {...form.getInputProps('joinDate')}
                            valueFormat="DD MMM YYYY"
                        />
                    </Grid.Col>
                </Grid>

                <Group justify="flex-end" mt="md">
                    <Button variant="default" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" loading={loading}>{isEditing ? 'Update Staff' : 'Add Staff'}</Button>
                </Group>
            </Stack>
        </form>
    );
}
