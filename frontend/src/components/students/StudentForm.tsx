import { useForm } from '@mantine/form';
import {
    TextInput,
    Select,
    Button,
    Group,
    Stack,
    Grid,
    Title,
    Divider,
    NumberInput
} from '@mantine/core';
import { DateInput } from '@mantine/dates';

interface StudentFormProps {
    initialValues?: any;
    onSubmit: (values: any) => void;
    onCancel: () => void;
    loading?: boolean;
}

export function StudentForm({ initialValues, onSubmit, onCancel, loading }: StudentFormProps) {
    const form = useForm({
        initialValues: initialValues || {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            dob: null,
            gender: '',
            address: '',
            grade: '',
            parentName: '',
            parentEmail: '',
            parentPhone: '',
        },
        validate: {
            firstName: (value) => (value.length < 2 ? 'First name must have at least 2 letters' : null),
            lastName: (value) => (value.length < 2 ? 'Last name must have at least 2 letters' : null),
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
        },
    });

    return (
        <form onSubmit={form.onSubmit(onSubmit)}>
            <Stack>
                <Title order={4}>Personal Details</Title>
                <Grid>
                    <Grid.Col span={6}>
                        <TextInput label="First Name" placeholder="John" required {...form.getInputProps('firstName')} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <TextInput label="Last Name" placeholder="Doe" required {...form.getInputProps('lastName')} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <TextInput label="Email" placeholder="student@school.com" required {...form.getInputProps('email')} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <TextInput label="Phone" placeholder="+1 234 567 890" {...form.getInputProps('phone')} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <DateInput label="Date of Birth" placeholder="Pick date" {...form.getInputProps('dob')} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <Select label="Gender" placeholder="Select" data={['Male', 'Female', 'Other']} {...form.getInputProps('gender')} />
                    </Grid.Col>
                    <Grid.Col span={12}>
                        <TextInput label="Address" placeholder="123 Main St" {...form.getInputProps('address')} />
                    </Grid.Col>
                </Grid>

                <Divider />

                <Title order={4}>Academic Info</Title>
                <Grid>
                    <Grid.Col span={6}>
                        <Select label="Grade / Class" placeholder="Select Grade" data={['Grade 9-A', 'Grade 9-B', 'Grade 10-A']} {...form.getInputProps('grade')} />
                    </Grid.Col>
                </Grid>

                <Divider />

                <Title order={4}>Parent / Guardian Info</Title>
                <Grid>
                    <Grid.Col span={6}>
                        <TextInput label="Parent Name" placeholder="Jane Doe" {...form.getInputProps('parentName')} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <TextInput label="Parent Phone" placeholder="+1 987..." {...form.getInputProps('parentPhone')} />
                    </Grid.Col>
                    <Grid.Col span={12}>
                        <TextInput label="Parent Email" placeholder="parent@example.com" {...form.getInputProps('parentEmail')} />
                    </Grid.Col>
                </Grid>

                <Group justify="flex-end" mt="md">
                    <Button variant="default" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" loading={loading}>Save Student</Button>
                </Group>
            </Stack>
        </form>
    );
}
