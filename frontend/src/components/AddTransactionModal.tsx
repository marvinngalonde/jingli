import {
    Modal,
    TextInput,
    Select,
    Button,
    Group,
    Stack,
    NumberInput,
    Textarea,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calendar } from 'lucide-react';
import { financeService } from '../services/financeService';
import { showSuccessNotification, showErrorNotification } from '../utils/notifications';

const transactionSchema = z.object({
    studentName: z.string().min(2, 'Student name is required'),
    feeType: z.enum(['tuition', 'transport', 'library', 'exam', 'other']),
    amount: z.number().min(0.01, 'Amount must be greater than 0'),
    paymentMode: z.enum(['cash', 'card', 'bank_transfer', 'cheque', 'online']),
    transactionDate: z.date(),
    status: z.enum(['pending', 'completed', 'failed']),
    description: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface AddTransactionModalProps {
    opened: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function AddTransactionModal({ opened, onClose, onSuccess }: AddTransactionModalProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        control,
    } = useForm<TransactionFormValues>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            status: 'pending',
            transactionDate: new Date(),
        },
    });

    const onSubmit = async (values: TransactionFormValues) => {
        try {
            // Generate transaction ID
            const transactionId = `TXN${Date.now().toString().slice(-8)}`;

            // Create transaction
            await financeService.create({
                student_id: null, // TODO: Link to actual student
                transaction_type: 'fee_payment',
                fee_type: values.feeType,
                amount: values.amount,
                payment_mode: values.paymentMode,
                payment_date: values.transactionDate.toISOString().split('T')[0],
                reference_number: transactionId,
                status: values.status,
                remarks: values.description || null,
            });

            showSuccessNotification('Transaction added successfully!');
            reset();
            onSuccess?.();
            onClose();
        } catch (error: any) {
            showErrorNotification(error.message || 'Failed to add transaction');
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title="Add New Transaction"
            size="md"
        >
            <form onSubmit={handleSubmit(onSubmit)}>
                <Stack gap="md">
                    <TextInput
                        label="Student Name"
                        placeholder="Enter student name"
                        required
                        size="sm"
                        radius={2}
                        error={errors.studentName?.message}
                        {...register('studentName')}
                        description="Note: Will be linked to student records in future update"
                    />

                    <Group grow>
                        <Controller
                            name="feeType"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    label="Fee Type"
                                    placeholder="Select fee type"
                                    data={[
                                        'Tuition Fee',
                                        'Library Fee',
                                        'Transport Fee',
                                        'Exam Fee',
                                        'Lab Fee',
                                        'Sports Fee',
                                        'Other'
                                    ]}
                                    required
                                    size="sm"
                                    radius={2}
                                    error={errors.feeType?.message}
                                />
                            )}
                        />
                        <Controller
                            name="amount"
                            control={control}
                            render={({ field }) => (
                                <NumberInput
                                    {...field}
                                    label="Amount"
                                    placeholder="Enter amount"
                                    prefix="$"
                                    required
                                    size="sm"
                                    radius={2}
                                    min={0}
                                    decimalScale={2}
                                    error={errors.amount?.message}
                                />
                            )}
                        />
                    </Group>

                    <Group grow>
                        <Controller
                            name="paymentMode"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    label="Payment Method"
                                    placeholder="Select method"
                                    data={['cash', 'card', 'bank_transfer', 'cheque', 'online']}
                                    required
                                    size="sm"
                                    radius={2}
                                    error={errors.paymentMode?.message}
                                />
                            )}
                        />
                        <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    label="Status"
                                    placeholder="Select status"
                                    data={[
                                        { value: 'pending', label: 'Pending' },
                                        { value: 'completed', label: 'Completed' },
                                        { value: 'failed', label: 'Failed' }
                                    ]}
                                    required
                                    size="sm"
                                    radius={2}
                                    error={errors.status?.message}
                                />
                            )}
                        />
                    </Group>

                    <Controller
                        name="transactionDate"
                        control={control}
                        render={({ field }) => (
                            <DatePickerInput
                                {...field}
                                label="Transaction Date"
                                placeholder="Select date"
                                required
                                size="sm"
                                radius={2}
                                leftSection={<Calendar size={16} />}
                                error={errors.transactionDate?.message}
                            />
                        )}
                    />

                    <Textarea
                        label="Description"
                        placeholder="Enter additional notes (optional)"
                        size="sm"
                        radius={2}
                        minRows={2}
                        error={errors.description?.message}
                        {...register('description')}
                    />

                    <Group justify="flex-end" mt="md">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            size="sm"
                            radius={2}
                            color="gray"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            radius={2}
                            color="navy.9"
                            loading={isSubmitting}
                        >
                            Add Transaction
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
