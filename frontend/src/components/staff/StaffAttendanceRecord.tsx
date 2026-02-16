import { SimpleGrid, Paper, Title, Text, RingProgress, Group, Stack, Table, Badge } from '@mantine/core';

export function StaffAttendanceRecord() {
    return (
        <Stack>
            <SimpleGrid cols={3}>
                <Paper withBorder p="md" radius="md">
                    <Group>
                        <RingProgress
                            size={80}
                            roundCaps
                            thickness={8}
                            sections={[{ value: 98, color: 'blue' }]}
                            label={<Text ta="center" size="xs" fw={700}>98%</Text>}
                        />
                        <div>
                            <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Presence Rate</Text>
                            <Text fw={700} size="xl">185 Days</Text>
                        </div>
                    </Group>
                </Paper>
                <Paper withBorder p="md" radius="md">
                    <Group>
                        <RingProgress
                            size={80}
                            roundCaps
                            thickness={8}
                            sections={[{ value: 5, color: 'orange' }]}
                            label={<Text ta="center" size="xs" fw={700}>2</Text>}
                        />
                        <div>
                            <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Late Arrivals</Text>
                            <Text fw={700} size="xl">2 Days</Text>
                        </div>
                    </Group>
                </Paper>
                <Paper withBorder p="md" radius="md">
                    <Group>
                        <RingProgress
                            size={80}
                            roundCaps
                            thickness={8}
                            sections={[{ value: 10, color: 'green' }]}
                            label={<Text ta="center" size="xs" fw={700}>5</Text>}
                        />
                        <div>
                            <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Leave Balance</Text>
                            <Text fw={700} size="xl">5 Days</Text>
                        </div>
                    </Group>
                </Paper>
            </SimpleGrid>

            <Paper withBorder p="md" radius="md">
                <Title order={5} mb="md">Leave History</Title>
                <Table>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Date</Table.Th>
                            <Table.Th>Type</Table.Th>
                            <Table.Th>Reason</Table.Th>
                            <Table.Th>Status</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        <Table.Tr>
                            <Table.Td>15 Jan 2024</Table.Td>
                            <Table.Td>Sick Leave</Table.Td>
                            <Table.Td>Medical Appointment</Table.Td>
                            <Table.Td><Badge color="green">Approved</Badge></Table.Td>
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Td>20 Dec 2023</Table.Td>
                            <Table.Td>Casual Leave</Table.Td>
                            <Table.Td>Personal</Table.Td>
                            <Table.Td><Badge color="green">Approved</Badge></Table.Td>
                        </Table.Tr>
                    </Table.Tbody>
                </Table>
            </Paper>
        </Stack>
    );
}
