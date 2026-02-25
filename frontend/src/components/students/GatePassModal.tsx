import { Modal, Stack, Select, TextInput, Group, Button } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';

interface StudentSelectOption {
    value: string;
    label: string;
}

interface GatePassModalProps {
    opened: boolean;
    onClose: () => void;
    form: UseFormReturnType<{ studentId: string; reason: string; guardianName: string }>;
    onSubmit: (values: { studentId: string; reason: string; guardianName: string }) => void;
    studentOptions: StudentSelectOption[];
    submitting: boolean;
}

export function GatePassModal({ opened, onClose, form, onSubmit, studentOptions, submitting }: GatePassModalProps) {
    return (
        <Modal opened={opened} onClose={onClose} title="Issue Gate Pass">
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
                    <TextInput label="Reason" placeholder="Reason for early exit" required {...form.getInputProps('reason')} />
                    <TextInput label="Guardian/Escort" placeholder="Name of person picking up" required {...form.getInputProps('guardianName')} />
                    <Group justify="flex-end">
                        <Button variant="default" onClick={onClose}>Cancel</Button>
                        <Button type="submit" loading={submitting}>Issue Pass</Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
}
