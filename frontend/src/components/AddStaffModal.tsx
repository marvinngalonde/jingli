import {
    Modal,
    TextInput,
    Select,
    Button,
    Group,
    Stack,
    NumberInput,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calendar } from 'lucide-react';
import { staffService } from '../services/staffService';
import { showSuccessNotification, showErrorNotification } from '../utils/notifications';

const staffSchema = z.object({
    fullName: z.string().min(2, 'Full name is required'),
    role: z.string().min(1, 'Role is required'),
    department: z.string().optional(),
    contactNumber: z.string().min(10, 'Valid contact number is required'),
    email: z.string().email('Valid email is required'),
    dateOfJoining: z.date(),
    salary: z.number().min(0, 'Salary must be positive'),
    qualification: z.string().optional(),
});

type StaffFormValues = z.infer<typeof staffSchema>;

interface AddStaffModalProps {
    opened: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function AddStaffModal({ opened, onClose, onSuccess }: AddStaffModalProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        control,
        setValue,
    } = useForm<StaffFormValues>({
        resolver: zodResolver(staffSchema),
    });

    const onSubmit = async (values: StaffFormValues) => {
        try {
            // Generate employee ID
            const employeeId = `EMP${Date.now().toString().slice(-6)}`;

            // Create staff member
            await staffService.create({
                employee_id: employeeId,
                role: values.role,
                department: values.department || null,
                date_of_joining: values.dateOfJoining.toISOString().split('T')[0],
                salary: values.salary,
                qualification: values.qualification || null,
                profile: {
                    full_name: values.fullName,
                    email: values.email,
                    phone: values.contactNumber,
                },
            });

            showSuccessNotification('Staff member added successfully!');
            reset();
            onSuccess?.();
            onClose();
        } catch (error: any) {
            showErrorNotification(error.message || 'Failed to add staff member');
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
            title="Add New Staff Member"
            size="lg"
        >
            <form onSubmit={handleSubmit(onSubmit)}>
                <Stack gap="md">
                    <Group grow>
                        <TextInput
                            label="Full Name"
                            placeholder="Enter full name"
                            required
                            size="sm"
                            radius={2}
                            error={errors.fullName?.message}
                            {...register('fullName')}
                        />
                        <TextInput
                            label="Employee ID"
                            placeholder="Auto-generated"
                            disabled
                            size="sm"
                            radius={2}
                            value="Auto-generated"
                        />
                    </Group>

                    <Group grow>
                        <Controller
                            name="role"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    label="Role"
                                    placeholder="Select role"
                                    data={['Teacher', 'Senior Teacher', 'Admin Officer', 'Support Staff', 'Other']}
                                    required
                                    size="sm"
                                    radius={2}
                                    error={errors.role?.message}
                                />
                            )}
                        />
                        <Controller
                            name="department"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    label="Department"
                                    placeholder="Select department"
                                    data={['Academic', 'Administration', 'Support', 'Management']}
                                    size="sm"
                                    radius={2}
                                    error={errors.department?.message}
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
                            error={errors.contactNumber?.message}
                            {...register('contactNumber')}
                        />
                        <TextInput
                            label="Email"
                            placeholder="Enter email"
                            type="email"
                            required
                            size="sm"
                            radius={2}
                            error={errors.email?.message}
                            {...register('email')}
                        />
                    </Group>

                    <Group grow>
                        <Controller
                            name="dateOfJoining"
                            control={control}
                            render={({ field }) => (
                                <DatePickerInput
                                    {...field}
                                    label="Date of Joining"
                                    placeholder="Select date"
                                    required
                                    size="sm"
                                    radius={2}
                                    leftSection={<Calendar size={16} />}
                                    error={errors.dateOfJoining?.message}
                                />
                            )}
                        />
                        <Controller
                            name="salary"
                            control={control}
                            render={({ field }) => (
                                <NumberInput
                                    {...field}
                                    label="Basic Salary"
                                    placeholder="Enter salary"
                                    prefix="$"
                                    required
                                    size="sm"
                                    radius={2}
                                    min={0}
                                    error={errors.salary?.message}
                                />
                            )}
                        />
                    </Group>

                    <TextInput
                        label="Qualification"
                        placeholder="Enter qualification"
                        size="sm"
                        radius={2}
                        error={errors.qualification?.message}
                        {...register('qualification')}
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
                            Add Staff
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
