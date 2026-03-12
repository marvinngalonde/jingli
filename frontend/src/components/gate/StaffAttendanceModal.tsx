import React, { useState } from 'react';
import { Modal, Select, TextInput, Button, Group, Radio, Stack } from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';

interface StaffAttendanceModalProps {
    opened: boolean;
    onClose: () => void;
}

export function StaffAttendanceModal({ opened, onClose }: StaffAttendanceModalProps) {
    const queryClient = useQueryClient();
    const [staffId, setStaffId] = useState<string | null>(null);
    const [notes, setNotes] = useState('');
    const [action, setAction] = useState<string>('check-in');

    const { data: staffList = [], isLoading } = useQuery({
        queryKey: ['staff'],
        queryFn: async () => {
            const { data } = await api.get('/staff');
            return data;
        }
    });

    const staffSelectData = staffList.map((s: any) => ({
        value: s.id,
        label: `${s.firstName} ${s.lastName} (${s.designation})`
    }));

    const mutation = useMutation({
        mutationFn: async () => {
            if (action === 'check-in') {
                return api.post('/attendance/staff/check-in', { staffId, notes });
            } else {
                return api.post('/attendance/staff/check-out', { staffId });
            }
        },
        onSuccess: () => {
            notifications.show({
                title: 'Success',
                message: `Staff checked ${action === 'check-in' ? 'in' : 'out'} successfully`,
                color: 'green',
                icon: <IconCheck size={16} />,
            });
            queryClient.invalidateQueries({ queryKey: ['staff-attendance-today'] });
            setStaffId(null);
            setNotes('');
            onClose();
        },
        onError: (error: any) => {
            notifications.show({
                title: 'Error',
                message: error.response?.data?.message || 'Failed to record attendance',
                color: 'red',
                icon: <IconX size={16} />,
            });
        }
    });

    return (
        <Modal opened={opened} onClose={onClose} title="Record Staff Gate Attendance">
            <Stack gap="md">
                <Radio.Group
                    value={action}
                    onChange={setAction}
                    name="actionType"
                    label="Action"
                    withAsterisk
                >
                    <Group mt="xs">
                        <Radio value="check-in" label="Check In" />
                        <Radio value="check-out" label="Check Out" />
                    </Group>
                </Radio.Group>

                <Select
                    label="Select Staff Member"
                    placeholder="Search by name"
                    data={staffSelectData}
                    value={staffId}
                    onChange={setStaffId}
                    searchable
                    clearable
                    withAsterisk
                    disabled={isLoading}
                />

                {action === 'check-in' && (
                    <TextInput
                        label="Notes (Optional)"
                        placeholder="e.g. Arrived in personal vehicle"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                )}

                <Group justify="flex-end" mt="md">
                    <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>Cancel</Button>
                    <Button
                        onClick={() => mutation.mutate()}
                        loading={mutation.isPending}
                        disabled={!staffId}
                        color={action === 'check-in' ? 'green' : 'orange'}
                    >
                        {action === 'check-in' ? 'Check In' : 'Check Out'}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
