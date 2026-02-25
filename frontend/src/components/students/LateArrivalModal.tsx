import { Modal, Stack, Select, TextInput, Group, Button } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';

interface StudentSelectOption {
    value: string;
    label: string;
}

interface LateArrivalModalProps {
    opened: boolean;
    onClose: () => void;
    form: UseFormReturnType<{ studentId: string; reason: string; reportedBy: string }>;
    onSubmit: (values: { studentId: string; reason: string; reportedBy: string }) => void;
    studentOptions: StudentSelectOption[];
    submitting: boolean;
}

export function LateArrivalModal({ opened, onClose, form, onSubmit, studentOptions, submitting }: LateArrivalModalProps) {
    return (
        <Modal opened={opened} onClose={onClose} title="Log Late Arrival">
            <form onSubmit={form.onSubmit(onSubmit)}>
                <Stack>
                    <Select
                        label="Student"
                        placeholder="Select student"
                        data={studentOptions}
                        searchable
                        required
                        {...form.getInputProps('studentId')}
                    />
                    <Select
                        label="Reason"
                        data={['Traffic', 'Bus Delay', 'Overslept', 'Medical', 'Other']}
                        {...form.getInputProps('reason')}
                    />
                    <TextInput label="Reported By" placeholder="e.g. Parent" required {...form.getInputProps('reportedBy')} />
                    <Group justify="flex-end">
                        <Button variant="default" onClick={onClose}>Cancel</Button>
                        <Button type="submit" loading={submitting}>Log Arrival</Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
