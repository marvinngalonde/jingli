import {
    Modal,
    TextInput,
    Select,
    Button,
    Group,
    Stack,
    Textarea,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calendar } from 'lucide-react';
import { studentService } from '../services/studentService';
import { showSuccessNotification, showErrorNotification } from '../utils/notifications';

const studentSchema = z.object({
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    dateOfBirth: z.date(),
    gender: z.enum(['male', 'female', 'other']),
    contactNumber: z.string().min(10, 'Valid contact number is required'),
    email: z.string().email('Valid email is required').optional().or(z.literal('')),
    address: z.string().min(5, 'Address is required'),
});

type StudentFormValues = z.infer<typeof studentSchema>;

interface AddStudentModalProps {
    opened: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function AddStudentModal({ opened, onClose, onSuccess }: AddStudentModalProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        control,
    } = useForm<StudentFormValues>({
        resolver: zodResolver(studentSchema),
    });

    const onSubmit = async (values: StudentFormValues) => {
        try {
            // Generate student ID (you can customize this logic)
            const studentId = `STU${Date.now().toString().slice(-6)}`;

            await studentService.create({
                student_id: studentId,
                first_name: values.firstName,
                last_name: values.lastName,
                date_of_birth: values.dateOfBirth.toISOString().split('T')[0],
                gender: values.gender,
                contact_number: values.contactNumber,
                email: values.email || null,
                address: values.address,
                admission_date: new Date().toISOString().split('T')[0],
                status: 'active',
            });

            showSuccessNotification('Student added successfully!');
            reset();
            onClose();
            if (onSuccess) onSuccess();
        } catch (error: any) {
            showErrorNotification(error.message || 'Failed to add student');
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
            title="Add New Student"
            size="lg"
            radius={2}
        >
            <form onSubmit={handleSubmit(onSubmit)}>
                <Stack gap="md">
                    <Group grow>
                        <TextInput
                            label="First Name"
                            placeholder="Enter first name"
                            required
                            size="sm"
                            radius={2}
                            {...register('firstName')}
                            error={errors.firstName?.message}
                        />
                        <TextInput
                            label="Last Name"
                            placeholder="Enter last name"
                            required
                            size="sm"
                            radius={2}
                            {...register('lastName')}
                            error={errors.lastName?.message}
                        />
                    </Group>

                    <Group grow>
                        <Controller
                            name="dateOfBirth"
                            control={control}
                            render={({ field }) => (
                                <DatePickerInput
                                    label="Date of Birth"
                                    placeholder="Pick date"
                                    required
                                    size="sm"
                                    radius={2}
                                    leftSection={<Calendar size={16} />}
                                    value={field.value}
                                    onChange={(date) => {
                                        // Convert to Date object if it's a string
                                        if (date) {
                                            const dateObj = typeof date === 'string' ? new Date(date) : date;
                                            field.onChange(dateObj);
                                        }
                                    }}
                                    error={errors.dateOfBirth?.message}
                                    maxDate={new Date()}
                                    valueFormat="YYYY-MM-DD"
                                    clearable
                                    popoverProps={{ withinPortal: true }}
                                />
                            )}
                        />
                        <Controller
                            name="gender"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    label="Gender"
                                    placeholder="Select gender"
                                    data={[
                                        { value: 'male', label: 'Male' },
                                        { value: 'female', label: 'Female' },
                                        { value: 'other', label: 'Other' },
                                    ]}
                                    required
                                    size="sm"
                                    radius={2}
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={errors.gender?.message}
                                />
                            )}
                        />
                    </Group>

                    <Group grow>
                        <TextInput
                            label="Contact Number"
                            placeholder="Enter phone number"
                            required
                            size="sm"
                            radius={2}
                            {...register('contactNumber')}
                            error={errors.contactNumber?.message}
                        />
                        <TextInput
                            label="Email"
                            placeholder="Enter email (optional)"
                            type="email"
                            size="sm"
                            radius={2}
                            {...register('email')}
                            error={errors.email?.message}
                        />
                    </Group>

                    <Textarea
                        label="Address"
                        placeholder="Enter complete address"
                        required
                        size="sm"
                        radius={2}
                        minRows={2}
                        {...register('address')}
                        error={errors.address?.message}
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
                            Add Student
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
