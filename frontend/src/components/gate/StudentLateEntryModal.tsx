import React, { useState } from 'react';
import { Modal, Select, TextInput, Button, Group, Stack } from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';

interface StudentLateEntryModalProps {
    opened: boolean;
    onClose: () => void;
}

export function StudentLateEntryModal({ opened, onClose }: StudentLateEntryModalProps) {
    const queryClient = useQueryClient();
    const [studentId, setStudentId] = useState<string | null>(null);
    const [reason, setReason] = useState('');

    const { data: studentsList = [], isLoading } = useQuery({
        queryKey: ['students'],
        queryFn: async () => {
            const { data } = await api.get('/students');
            return data;
        }
    });

    const studentSelectData = studentsList.map((s: any) => ({
        value: s.id,
        label: `${s.firstName} ${s.lastName} (${s.admissionNo})`
    }));

    const mutation = useMutation({
        mutationFn: async () => {
            return api.post('/gate/students/late', { studentId, reason });
        },
        onSuccess: () => {
            notifications.show({
                title: 'Success',
                message: 'Late entry recorded successfully',
                color: 'green',
                icon: <IconCheck size={16} />,
            });
            queryClient.invalidateQueries({ queryKey: ['student-late-today'] });
            setStudentId(null);
            setReason('');
            onClose();
        },
        onError: (error: any) => {
            notifications.show({
                title: 'Error',
                message: error.response?.data?.message || 'Failed to record late entry',
                color: 'red',
                icon: <IconX size={16} />,
            });
        }
    });

    return (
        <Modal opened={opened} onClose={onClose} title="Record Student Late Entry">
            <Stack gap="md">
                <Select
                    label="Select Student"
                    placeholder="Search by name or admission number"
                    data={studentSelectData}
                    value={studentId}
                    onChange={setStudentId}
                    searchable
                    clearable
                    withAsterisk
                    disabled={isLoading}
                />

                <TextInput
                    label="Reason for Delay"
                    placeholder="e.g. Transport issues, Medical, Unknown"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    withAsterisk
                />

                <Group justify="flex-end" mt="md">
                    <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>Cancel</Button>
                    <Button
                        onClick={() => mutation.mutate()}
                        loading={mutation.isPending}
                        disabled={!studentId || !reason.trim()}
                        color="red"
                    >
                        Mark as Late
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
