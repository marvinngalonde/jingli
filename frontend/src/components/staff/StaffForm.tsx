import { useForm } from '@mantine/form';
import {
    TextInput,
    Select,
    Button,
    Group,
    Stack,
    Grid,
    Title,
    NumberInput
} from '@mantine/core';
import { DateInput } from '@mantine/dates';

interface StaffFormProps {
    initialValues?: any;
    onSubmit: (values: any) => void;
    onCancel: () => void;
    loading?: boolean;
}

export function StaffForm({ initialValues, onSubmit, onCancel, loading }: StaffFormProps) {
    const form = useForm({
        initialValues: initialValues || {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            dob: null,
            gender: '',
            address: '',
            role: '',
            department: '',
            qualification: '',
            joinDate: null,
            salary: 0,
        },
        validate: {
            firstName: (value) => (value.length < 2 ? 'First name must have at least 2 letters' : null),
            lastName: (value) => (value.length < 2 ? 'Last name must have at least 2 letters' : null),
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
            role: (value) => (!value ? 'Role is required' : null),
        },
    });

    return (
        <form onSubmit={form.onSubmit(onSubmit)}>
            <Stack gap="lg" p="md">
                <Title order={4}>Personal Details</Title>
                <Grid>
                    <Grid.Col span={6}>
                        <TextInput label="First Name" placeholder="John" required {...form.getInputProps('firstName')} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <TextInput label="Last Name" placeholder="Doe" required {...form.getInputProps('lastName')} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <TextInput label="Email" placeholder="john@example.com" required {...form.getInputProps('email')} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <TextInput label="Phone" placeholder="+1 234 567 890" {...form.getInputProps('phone')} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <Select
                            label="Gender"
                            placeholder="Select"
                            data={['Male', 'Female', 'Other']}
                            {...form.getInputProps('gender')}
                        />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <DateInput
                            label="Date of Birth"
                            placeholder="Select date"
                            {...form.getInputProps('dob')}
                        />
                    </Grid.Col>
                    <Grid.Col span={12}>
                        <TextInput label="Address" placeholder="123 Main St" {...form.getInputProps('address')} />
                    </Grid.Col>
                </Grid>

                <Title order={4}>Employment Details</Title>
                <Grid>
                    <Grid.Col span={6}>
                        <Select
                            label="Role"
                            placeholder="Select role"
                            data={['Teacher', 'Administrator', 'Support Staff', 'Principal']}
                            required
                            {...form.getInputProps('role')}
                        />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <Select
                            label="Department"
                            placeholder="Select dept"
                            data={['Science', 'Mathematics', 'Languages', 'Arts', 'Administration', 'Sports']}
                            {...form.getInputProps('department')}
                        />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <DateInput
                            label="Joining Date"
                            placeholder="Select date"
                            {...form.getInputProps('joinDate')}
                        />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <NumberInput
                            label="Base Salary"
                            placeholder="5000"
                            prefix="$"
                            thousandSeparator
                            {...form.getInputProps('salary')}
                        />
                    </Grid.Col>
                    <Grid.Col span={12}>
                        <TextInput label="Qualification" placeholder="e.g. Masters in Education" {...form.getInputProps('qualification')} />
                    </Grid.Col>
                </Grid>

                <Group justify="flex-end" mt="md">
                    <Button variant="default" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" loading={loading} color="brand">Save Staff Member</Button>
                </Group>
            </Stack>
        </form>
    );
}
