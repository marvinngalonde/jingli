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
import { visitorService } from '../services/visitorService';
import { showSuccessNotification, showErrorNotification } from '../utils/notifications';

const visitorSchema = z.object({
    visitorName: z.string().min(2, 'Visitor name is required'),
    purpose: z.string().min(2, 'Purpose is required'),
    meetingWith: z.string().min(2, 'Meeting person is required'),
    contactNumber: z.string().min(10, 'Valid contact number is required'),
    checkInDate: z.date(),
    checkInTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    notes: z.string().optional(),
});

type VisitorFormValues = z.infer<typeof visitorSchema>;

interface AddVisitorModalProps {
    opened: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function AddVisitorModal({ opened, onClose, onSuccess }: AddVisitorModalProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        control,
    } = useForm<VisitorFormValues>({
        resolver: zodResolver(visitorSchema),
        defaultValues: {
            checkInDate: new Date(),
            checkInTime: new Date().toTimeString().slice(0, 5), // Current time in HH:MM
        },
    });

    const onSubmit = async (values: VisitorFormValues) => {
        try {
            // Create visitor log
            await visitorService.checkIn({
                visitor_name: values.visitorName,
                purpose: values.purpose,
                person_to_meet: values.meetingWith,
                contact_number: values.contactNumber,
                check_in_time: `${values.checkInDate.toISOString().split('T')[0]} ${values.checkInTime}`,
                check_out_time: null,
                id_proof_type: 'Other', // Default value
                id_proof_number: `GP${Date.now().toString().slice(-6)}`, // Use as gate pass ID
            });

            showSuccessNotification('Visitor logged successfully!');
            reset();
            onSuccess?.();
            onClose();
        } catch (error: any) {
            showErrorNotification(error.message || 'Failed to log visitor');
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
            title="Add Visitor Log"
            size="md"
        >
            <form onSubmit={handleSubmit(onSubmit)}>
                <Stack gap="md">
                    <Group grow>
                        <TextInput
                            label="Visitor Name"
                            placeholder="Enter visitor name"
                            required
                            size="sm"
                            radius={2}
                            error={errors.visitorName?.message}
                            {...register('visitorName')}
                        />
                        <TextInput
                            label="Gate Pass ID"
                            placeholder="Auto-generated"
                            disabled
                            size="sm"
                            radius={2}
                            value="Auto-generated"
                        />
                    </Group>

                    <TextInput
                        label="Purpose of Visit"
                        placeholder="e.g., Meeting, Interview, Delivery"
                        required
                        size="sm"
                        radius={2}
                        error={errors.purpose?.message}
                        {...register('purpose')}
                    />

                    <Group grow>
                        <TextInput
                            label="Meeting With"
                            placeholder="Staff/Student name"
                            required
                            size="sm"
                            radius={2}
                            error={errors.meetingWith?.message}
                            {...register('meetingWith')}
                        />
                        <TextInput
                            label="Contact Number"
                            placeholder="Enter phone number"
                            required
                            size="sm"
                            radius={2}
                            error={errors.contactNumber?.message}
                            {...register('contactNumber')}
                        />
                    </Group>

                    <Group grow>
                        <Controller
                            name="checkInDate"
                            control={control}
                            render={({ field }) => (
                                <DatePickerInput
                                    {...field}
                                    label="Check-in Date"
                                    placeholder="Select date"
                                    required
                                    size="sm"
                                    radius={2}
                                    leftSection={<Calendar size={16} />}
                                    error={errors.checkInDate?.message}
                                />
                            )}
                        />
                        <TextInput
                            label="Check-in Time"
                            placeholder="HH:MM (e.g., 14:30)"
                            required
                            size="sm"
                            radius={2}
                            error={errors.checkInTime?.message}
                            {...register('checkInTime')}
                        />
                    </Group>

                    <Textarea
                        label="Notes"
                        placeholder="Additional information (optional)"
                        size="sm"
                        radius={2}
                        minRows={2}
                        error={errors.notes?.message}
                        {...register('notes')}
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
                            Log Visitor
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
