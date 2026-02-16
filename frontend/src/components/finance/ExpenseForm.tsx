import { useForm } from '@mantine/form';
import {
    TextInput,
    Select,
    Button,
    Group,
    Stack,
    NumberInput,
    Textarea,
    FileInput
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconUpload } from '@tabler/icons-react';

interface ExpenseFormProps {
    initialValues?: any;
    onSubmit: (values: any) => void;
    onCancel: () => void;
    loading?: boolean;
}

export function ExpenseForm({ initialValues, onSubmit, onCancel, loading }: ExpenseFormProps) {
    const form = useForm({
        initialValues: initialValues || {
            title: '',
            category: '',
            amount: 0,
            date: new Date(),
            vendor: '',
            description: '',
            status: 'Pending',
        },
        validate: {
            title: (value) => (value.length < 3 ? 'Title is too short' : null),
            category: (value) => (!value ? 'Category is required' : null),
            amount: (value) => (value <= 0 ? 'Amount must be greater than 0' : null),
            date: (value) => (!value ? 'Date is required' : null),
        },
    });

    return (
        <form onSubmit={form.onSubmit(onSubmit)}>
            <Stack gap="md" p="md">
                <TextInput
                    label="Expense Title"
                    placeholder="e.g. Office Supplies"
                    required
                    {...form.getInputProps('title')}
                />

                <Select
                    label="Category"
                    placeholder="Select category"
                    data={['Operations', 'Maintenance', 'Utilities', 'Salaries', 'Events', 'Equipment', 'Other']}
                    required
                    {...form.getInputProps('category')}
                />

                <Grid grow>
                    <Grid.Col span={6}>
                        <NumberInput
                            label="Amount"
                            placeholder="0.00"
                            prefix="$"
                            decimalScale={2}
                            fixedDecimalScale
                            required
                            {...form.getInputProps('amount')}
                        />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <DateInput
                            label="Date Incurred"
                            placeholder="Select date"
                            required
                            {...form.getInputProps('date')}
                        />
                    </Grid.Col>
                </Grid>

                <TextInput
                    label="Vendor / Payee"
                    placeholder="e.g. Staples, Electric Co."
                    {...form.getInputProps('vendor')}
                />

                <Textarea
                    label="Description"
                    placeholder="Details about the expense..."
                    {...form.getInputProps('description')}
                />

                <FileInput
                    label="Receipt / Invoice"
                    placeholder="Upload file"
                    leftSection={<IconUpload size={14} />}
                />

                <Select
                    label="Status"
                    placeholder="Select status"
                    data={['Pending', 'Approved', 'Paid', 'Rejected']}
                    required
                    {...form.getInputProps('status')}
                />

                <Group justify="flex-end" mt="md">
                    <Button variant="default" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" loading={loading} color="red">Record Expense</Button>
                </Group>
            </Stack>
        </form>
    );
}

import { Grid } from '@mantine/core'; // Added missing import
