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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { facilitiesService } from '../services/facilitiesService';
import { showSuccessNotification, showErrorNotification } from '../utils/notifications';

const facilitySchema = z.object({
    name: z.string().min(2, 'Facility name is required'),
    type: z.string().min(1, 'Type is required'),
    capacity: z.number().min(1, 'Capacity must be at least 1'),
    status: z.enum(['available', 'occupied', 'maintenance']),
    description: z.string().optional(),
});

type FacilityFormValues = z.infer<typeof facilitySchema>;

interface AddFacilityModalProps {
    opened: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function AddFacilityModal({ opened, onClose, onSuccess }: AddFacilityModalProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        control,
    } = useForm<FacilityFormValues>({
        resolver: zodResolver(facilitySchema),
        defaultValues: {
            status: 'available',
        },
    });

    const onSubmit = async (values: FacilityFormValues) => {
        try {
            // Create facility
            await facilitiesService.create({
                name: values.name,
                type: values.type,
                capacity: values.capacity,
                status: values.status,
                description: values.description || null,
            });

            showSuccessNotification('Facility added successfully!');
            reset();
            onSuccess?.();
            onClose();
        } catch (error: any) {
            showErrorNotification(error.message || 'Failed to add facility');
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
            title="Add New Facility"
            size="md"
        >
            <form onSubmit={handleSubmit(onSubmit)}>
                <Stack gap="md">
                    <TextInput
                        label="Facility Name"
                        placeholder="e.g., Science Lab A"
                        required
                        size="sm"
                        radius={2}
                        error={errors.name?.message}
                        {...register('name')}
                    />

                    <Group grow>
                        <Controller
                            name="type"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    label="Type"
                                    placeholder="Select type"
                                    data={[
                                        'Classroom',
                                        'Laboratory',
                                        'Library',
                                        'Sports Hall',
                                        'Auditorium',
                                        'Conference Room',
                                        'Computer Lab',
                                        'Other'
                                    ]}
                                    required
                                    size="sm"
                                    radius={2}
                                    error={errors.type?.message}
                                />
                            )}
                        />
                        <Controller
                            name="capacity"
                            control={control}
                            render={({ field }) => (
                                <NumberInput
                                    {...field}
                                    label="Capacity"
                                    placeholder="Number of people"
                                    required
                                    size="sm"
                                    radius={2}
                                    min={1}
                                    error={errors.capacity?.message}
                                />
                            )}
                        />
                    </Group>

                    <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                            <Select
                                {...field}
                                label="Status"
                                placeholder="Select status"
                                data={[
                                    { value: 'available', label: 'Available' },
                                    { value: 'occupied', label: 'Occupied' },
                                    { value: 'maintenance', label: 'Under Maintenance' }
                                ]}
                                required
                                size="sm"
                                radius={2}
                                error={errors.status?.message}
                            />
                        )}
                    />

                    <Textarea
                        label="Description"
                        placeholder="Enter facility details (optional)"
                        size="sm"
                        radius={2}
                        minRows={3}
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
                            Add Facility
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
