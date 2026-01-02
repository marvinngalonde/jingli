import {
    Modal,
    TextInput,
    Select,
    Button,
    Group,
    Stack,
    Textarea,
    rem,
} from '@mantine/core';

interface EditTimetableModalProps {
    opened: boolean;
    onClose: () => void;
    period?: string;
    day?: string;
}

export default function EditTimetableModal({ opened, onClose, period, day }: EditTimetableModalProps) {
    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={`Edit ${period} - ${day}`}
            size="md"
        >
            <Stack gap="md">
                <Group grow>
                    <TextInput
                        label="Period"
                        value={period}
                        disabled
                        size="sm"
                        radius={2}
                    />
                    <TextInput
                        label="Day"
                        value={day}
                        disabled
                        size="sm"
                        radius={2}
                    />
                </Group>

                <Select
                    label="Subject"
                    placeholder="Select subject"
                    data={['Mathematics', 'Science', 'English', 'History', 'Geography', 'Physical Education']}
                    required
                    size="sm"
                    radius={2}
                />

                <Select
                    label="Teacher"
                    placeholder="Select teacher"
                    data={['Mr. Smith', 'Ms. Johnson', 'Mrs. Davis', 'Mr. Wilson']}
                    required
                    size="sm"
                    radius={2}
                />

                <Select
                    label="Room"
                    placeholder="Select room"
                    data={['Room 101', 'Room 102', 'Lab A', 'Lab B', 'Auditorium']}
                    required
                    size="sm"
                    radius={2}
                />

                <Group grow>
                    <TextInput
                        label="Start Time"
                        placeholder="HH:MM"
                        required
                        size="sm"
                        radius={2}
                    />
                    <TextInput
                        label="End Time"
                        placeholder="HH:MM"
                        required
                        size="sm"
                        radius={2}
                    />
                </Group>

                <Textarea
                    label="Notes"
                    placeholder="Additional notes (optional)"
                    size="sm"
                    radius={2}
                    minRows={2}
                />

                <Group justify="flex-end" mt="md">
                    <Button variant="outline" onClick={onClose} size="sm" radius={2} color="gray">
                        Cancel
                    </Button>
                    <Button onClick={onClose} size="sm" radius={2} color="navy.9">
                        Save Changes
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
