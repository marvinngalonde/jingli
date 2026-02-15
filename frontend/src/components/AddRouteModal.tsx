import {
    Modal,
    TextInput,
    Button,
    Group,
    Stack,
    Textarea,
    NumberInput,
} from '@mantine/core';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { transportService } from '../services/transportService';
import { showSuccessNotification, showErrorNotification } from '../utils/notifications';

const routeSchema = z.object({
    routeId: z.string().min(2, 'Route ID is required'),
    routeName: z.string().min(2, 'Route name is required'),
    driverName: z.string().min(2, 'Driver name is required'),
    vehicleNumber: z.string().min(2, 'Vehicle number is required'),
    capacity: z.number().min(1, 'Capacity must be at least 1'),
    stops: z.string().min(5, 'At least one stop is required'),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
});

type RouteFormValues = z.infer<typeof routeSchema>;

interface AddRouteModalProps {
    opened: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function AddRouteModal({ opened, onClose, onSuccess }: AddRouteModalProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        control,
    } = useForm<RouteFormValues>({
        resolver: zodResolver(routeSchema),
    });

    const onSubmit = async (values: RouteFormValues) => {
        try {
            // Parse stops from textarea (one per line)
            const stopsArray = values.stops
                .split('\n')
                .map(s => s.trim())
                .filter(s => s.length > 0);

            // Create route (Note: driver_name is stored temporarily, ideally should link to staff table)
            await transportService.create({
                route_id: values.routeId,
                route_name: values.routeName,
                driver_id: null, // TODO: Link to actual staff member
                vehicle_number: values.vehicleNumber,
                capacity: values.capacity,
                stops: stopsArray,
                start_time: values.startTime,
                end_time: values.endTime,
                status: 'active',
            });

            showSuccessNotification('Route added successfully!');
            reset();
            onSuccess?.();
            onClose();
        } catch (error: any) {
            showErrorNotification(error.message || 'Failed to add route');
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
            title="Add New Route"
            size="md"
        >
            <form onSubmit={handleSubmit(onSubmit)}>
                <Stack gap="md">
                    <TextInput
                        label="Route ID"
                        placeholder="e.g., R-05"
                        required
                        size="sm"
                        radius={2}
                        error={errors.routeId?.message}
                        {...register('routeId')}
                    />

                    <TextInput
                        label="Route Name"
                        placeholder="e.g., North Route"
                        required
                        size="sm"
                        radius={2}
                        error={errors.routeName?.message}
                        {...register('routeName')}
                    />

                    <Group grow>
                        <TextInput
                            label="Driver Name"
                            placeholder="Enter driver name"
                            required
                            size="sm"
                            radius={2}
                            error={errors.driverName?.message}
                            {...register('driverName')}
                        />
                        <TextInput
                            label="Vehicle Number"
                            placeholder="e.g., BUS-101"
                            required
                            size="sm"
                            radius={2}
                            error={errors.vehicleNumber?.message}
                            {...register('vehicleNumber')}
                        />
                    </Group>

                    <Controller
                        name="capacity"
                        control={control}
                        render={({ field }) => (
                            <NumberInput
                                {...field}
                                label="Capacity"
                                placeholder="Number of seats"
                                required
                                size="sm"
                                radius={2}
                                min={1}
                                error={errors.capacity?.message}
                            />
                        )}
                    />

                    <Textarea
                        label="Stops (one per line)"
                        placeholder="Enter stop locations"
                        required
                        size="sm"
                        radius={2}
                        minRows={4}
                        error={errors.stops?.message}
                        {...register('stops')}
                    />

                    <Group grow>
                        <TextInput
                            label="Start Time"
                            placeholder="HH:MM (e.g., 07:00)"
                            required
                            size="sm"
                            radius={2}
                            error={errors.startTime?.message}
                            {...register('startTime')}
                        />
                        <TextInput
                            label="End Time"
                            placeholder="HH:MM (e.g., 09:00)"
                            required
                            size="sm"
                            radius={2}
                            error={errors.endTime?.message}
                            {...register('endTime')}
                        />
                    </Group>

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
                            Add Route
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
