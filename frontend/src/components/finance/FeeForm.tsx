import { useForm } from '@mantine/form';
import {
    Select,
    Button,
    Group,
    Stack,
    NumberInput,
    Textarea
} from '@mantine/core';
import { DateInput } from '@mantine/dates';

interface FeeFormProps {
    initialValues?: any;
    onSubmit: (values: any) => void;
    onCancel: () => void;
    loading?: boolean;
}

export function FeeForm({ initialValues, onSubmit, onCancel, loading }: FeeFormProps) {
    const form = useForm({
        initialValues: initialValues || {
            studentId: '',
            type: '',
            description: '',
            amount: 0,
            dueDate: null,
            status: 'Pending',
        },
        validate: {
            studentId: (value) => (!value ? 'Student is required' : null),
            type: (value) => (!value ? 'Fee type is required' : null),
            amount: (value) => (value <= 0 ? 'Amount must be greater than 0' : null),
            dueDate: (value) => (!value ? 'Due date is required' : null),
        },
    });

    return (
        <form onSubmit={form.onSubmit(onSubmit)}>
            <Stack gap="md" p="md">
                <Select
                    label="Student"
                    placeholder="Select student"
                    searchable
                    data={['John Doe (Grade 10)', 'Jane Smith (Grade 11)', 'Bob Brown (Grade 9)']}
                    required
                    {...form.getInputProps('studentId')}
                />

                <Select
                    label="Fee Type"
                    placeholder="Select type"
                    data={['Tuition Fee', 'Transport Fee', 'Library Fine', 'Exam Fee', 'Uniform', 'Other']}
                    required
                    {...form.getInputProps('type')}
                />

                <NumberInput
                    label="Amount"
                    placeholder="0.00"
                    prefix="$"
                    decimalScale={2}
                    fixedDecimalScale
                    required
                    {...form.getInputProps('amount')}
                />

                <DateInput
                    label="Due Date"
                    placeholder="Select date"
                    required
                    {...form.getInputProps('dueDate')}
                />

                <Textarea
                    label="Description / Notes"
                    placeholder="Additional details..."
                    {...form.getInputProps('description')}
                />

                <Select
                    label="Status"
                    placeholder="Select status"
                    data={['Pending', 'Paid', 'Overdue', 'Partially Paid']}
                    required
                    {...form.getInputProps('status')}
                />

                <Group justify="flex-end" mt="md">
                    <Button variant="default" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" loading={loading}>Save Invoice</Button>
                </Group>
            </Stack>
        </form>
    );
}
