import {
    Modal,
    TextInput,
    Select,
    Button,
    Group,
    Stack,
    NumberInput,
    rem,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';

interface PaymentModalProps {
    opened: boolean;
    onClose: () => void;
    studentName?: string;
    outstandingAmount?: number;
}

export default function PaymentModal({ opened, onClose, studentName, outstandingAmount }: PaymentModalProps) {
    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Record Payment"
            size="md"
        >
            <Stack gap="md">
                <TextInput
                    label="Student Name"
                    value={studentName || ''}
                    disabled
                    size="sm"
                    radius={2}
                />

                <Group grow>
                    <NumberInput
                        label="Amount"
                        placeholder="Enter amount"
                        prefix="$"
                        required
                        size="sm"
                        radius={2}
                        min={0}
                        max={outstandingAmount}
                    />
                    <Select
                        label="Payment Mode"
                        placeholder="Select mode"
                        data={['Cash', 'Card', 'Bank Transfer', 'Cheque', 'Online']}
                        required
                        size="sm"
                        radius={2}
                    />
                </Group>

                <Group grow>
                    <DateInput
                        label="Payment Date"
                        placeholder="Select date"
                        defaultValue={new Date()}
                        required
                        size="sm"
                        radius={2}
                    />
                    <TextInput
                        label="Reference Number"
                        placeholder="Enter reference #"
                        size="sm"
                        radius={2}
                    />
                </Group>

                <Select
                    label="Fee Type"
                    placeholder="Select fee type"
                    data={['Tuition Fee', 'Transport Fee', 'Library Fee', 'Exam Fee', 'Other']}
                    required
                    size="sm"
                    radius={2}
                />

                <TextInput
                    label="Remarks"
                    placeholder="Additional notes (optional)"
                    size="sm"
                    radius={2}
                />

                <Group justify="flex-end" mt="md">
                    <Button variant="outline" onClick={onClose} size="sm" radius={2} color="gray">
                        Cancel
                    </Button>
                    <Button onClick={onClose} size="sm" radius={2} color="navy.9">
                        Record Payment
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
