import {
    Box,
    Card,
    Title,
    Stack,
    Textarea,
    Button,
    Group,
    Text,
    Select,
    Badge,
    rem,
} from '@mantine/core';
import { Send } from 'lucide-react';

const broadcastHistory = [
    { date: 'Dec 30', target: 'All Parents', subject: 'SMS: 95% Delivered (Holiday Notice)', status: 'Delivered' },
    { date: 'Dec 29', target: 'Staff Only', subject: 'Email: 95% Opened (Year-end Notice)', status: 'Opened' },
    { date: 'Dec 28', target: 'Class 10 Students', subject: 'SMS: 100% Delivered (Exam Schedule)', status: 'Delivered' },
];

export default function Communication() {
    return (
        <Box p={{ base: 'sm', md: 'xl' }}>
            <Title order={2} mb="lg">
                Communication Center
            </Title>

            <Group align="flex-start" gap="md" wrap="wrap-reverse">
                {/* Compose Broadcast */}
                <Card shadow="sm" padding="lg" radius={2} withBorder style={{ flex: 1, minWidth: rem(300) }}>
                    <Title order={4} mb="md">
                        Compose Broadcast
                    </Title>

                    <Stack gap="md">
                        <Select
                            label="Send History"
                            placeholder="Select template"
                            data={['Holiday Notice', 'Exam Schedule', 'Fee Reminder']}
                            size="sm"
                            radius={2}
                        />

                        <Select
                            label="Target Audience"
                            placeholder="Select audience"
                            data={['All Parents', 'Staff Only', 'Class 10 Students']}
                            defaultValue="All Parents"
                            size="sm"
                            radius={2}
                        />

                        <Textarea
                            label="Message Body"
                            placeholder="Type your message..."
                            minRows={6}
                            size="sm"
                            radius={2}
                        />

                        <Text size="xs" c="dimmed">
                            Subject_Line
                        </Text>

                        <Button
                            fullWidth
                            leftSection={<Send size={16} />}
                            size="sm"
                            radius={2}
                            color="navy.9"
                        >
                            Send Broadcast
                        </Button>
                    </Stack>
                </Card>

                {/* Recent Broadcast Status */}
                <Card shadow="sm" padding="lg" radius={2} withBorder style={{ flex: 1, minWidth: rem(300) }}>
                    <Title order={4} mb="md">
                        Recent Broadcast Status
                    </Title>

                    <Stack gap="sm">
                        {broadcastHistory.map((broadcast, idx) => (
                            <Box
                                key={idx}
                                p="sm"
                                style={{
                                    backgroundColor: '#f9fafb',
                                    borderRadius: rem(4),
                                }}
                            >
                                <Group justify="space-between" mb="xs">
                                    <Text size="xs" c="dimmed">
                                        {broadcast.date}
                                    </Text>
                                    <Badge color="green" variant="light" size="xs" radius={2}>
                                        {broadcast.status}
                                    </Badge>
                                </Group>
                                <Text size="sm" fw={500}>
                                    {broadcast.target}
                                </Text>
                                <Text size="xs" c="dimmed">
                                    {broadcast.subject}
                                </Text>
                            </Box>
                        ))}
                    </Stack>
                </Card>
            </Group>
        </Box>
    );
}
