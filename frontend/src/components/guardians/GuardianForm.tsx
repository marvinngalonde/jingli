import { useForm } from '@mantine/form';
import {
    TextInput,
    Button,
    Group,
    Stack,
    Grid,
    Title,
    Divider,
    Textarea
} from '@mantine/core';

interface GuardianFormProps {
    initialValues?: any;
    onSubmit: (values: any) => void;
    onCancel: () => void;
    loading?: boolean;
    isEditing?: boolean;
}

export function GuardianForm({ initialValues, onSubmit, onCancel, loading, isEditing }: GuardianFormProps) {
    const form = useForm({
        initialValues: initialValues || {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            relationship: '',
            address: '',
            occupation: '',
        },
        validate: {
            firstName: (value) => (value?.length < 2 ? 'First name must have at least 2 letters' : null),
            lastName: (value) => (value?.length < 2 ? 'Last name must have at least 2 letters' : null),
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
            relationship: (value) => (value ? null : 'Relationship is required'),
        },
    });

    return (
        <form onSubmit={form.onSubmit(onSubmit)}>
            <Stack>
                <Title order={4}>Guardian Details</Title>
                <Grid>
                    <Grid.Col span={6}>
                        <TextInput label="First Name" placeholder="Jane" required {...form.getInputProps('firstName')} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <TextInput label="Last Name" placeholder="Doe" required {...form.getInputProps('lastName')} />
                    </Grid.Col>
                    <Grid.Col span={12}>
                        <TextInput label="Email" placeholder="jane.doe@email.com" description="Used for login credentials" required {...form.getInputProps('email')} disabled={isEditing} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <TextInput label="Phone" placeholder="+1 234 567 890" {...form.getInputProps('phone')} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <TextInput label="Relationship" placeholder="Mother, Father, Uncle..." required {...form.getInputProps('relationship')} />
                    </Grid.Col>
                    <Grid.Col span={12}>
                        <TextInput label="Occupation" placeholder="Engineer, Teacher, Farmer..." {...form.getInputProps('occupation')} />
                    </Grid.Col>
                    <Grid.Col span={12}>
                        <Textarea label="Address" placeholder="123 School St, City" autosize minRows={2} {...form.getInputProps('address')} />
                    </Grid.Col>
                </Grid>

                <Group justify="flex-end" mt="md">
                    <Button variant="default" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" loading={loading}>{isEditing ? 'Update Guardian' : 'Add Guardian'}</Button>
                </Group>
            </Stack>
        </form>
    );
}
