import { Paper, Title, Group, Button, Table, Text, Badge } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

export function DisciplinaryRecord() {
    return (
        <Paper withBorder p="md" radius="md">
            <Group justify="space-between" mb="md">
                <Title order={5}>Disciplinary Incidents</Title>
                <Button variant="light" color="red" size="xs" leftSection={<IconPlus size={14} />}>Report Incident</Button>
            </Group>

            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Date</Table.Th>
                        <Table.Th>Incident</Table.Th>
                        <Table.Th>Action Taken</Table.Th>
                        <Table.Th>Status</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    <Table.Tr>
                        <Table.Td>14 Feb 2024</Table.Td>
                        <Table.Td>
                            <Text fw={500} size="sm">Disruptive Behavior</Text>
                            <Text size="xs" c="dimmed">Talking loudly during exam</Text>
                        </Table.Td>
                        <Table.Td>Detention (1 hour)</Table.Td>
                        <Table.Td><Badge color="green">Resolved</Badge></Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                        <Table.Td>02 Dec 2023</Table.Td>
                        <Table.Td>
                            <Text fw={500} size="sm">Late Arrival</Text>
                            <Text size="xs" c="dimmed">3rd offense this month</Text>
                        </Table.Td>
                        <Table.Td>Warning Letter to Parent</Table.Td>
                        <Table.Td><Badge color="green">Sent</Badge></Table.Td>
                    </Table.Tr>
                </Table.Tbody>
            </Table>
        </Paper>
    );
}
