import { SimpleGrid, Paper, Title, Text, RingProgress, Group, Stack, Table, Badge } from '@mantine/core';

export function AttendanceRecord() {
    return (
        <Stack>
            <SimpleGrid cols={3}>
                <Paper withBorder p="md" radius="md">
                    <Group>
                        <RingProgress
                            size={80}
                            roundCaps
                            thickness={8}
                            sections={[{ value: 92, color: 'blue' }]}
                            label={<Text ta="center" size="xs" fw={700}>92%</Text>}
                        />
                        <div>
                            <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Total Presence</Text>
                            <Text fw={700} size="xl">142 Days</Text>
                        </div>
                    </Group>
                </Paper>

                <Paper withBorder p="md" radius="md">
                    <Group>
                        <RingProgress
                            size={80}
                            roundCaps
                            thickness={8}
                            sections={[{ value: 5, color: 'red' }]}
                            label={<Text ta="center" size="xs" fw={700}>5%</Text>}
                        />
                        <div>
                            <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Total Absence</Text>
                            <Text fw={700} size="xl">8 Days</Text>
                        </div>
                    </Group>
                </Paper>

                <Paper withBorder p="md" radius="md">
                    <Group>
                        <RingProgress
                            size={80}
                            roundCaps
                            thickness={8}
                            sections={[{ value: 3, color: 'orange' }]}
                            label={<Text ta="center" size="xs" fw={700}>3%</Text>}
                        />
                        <div>
                            <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Late Arrival</Text>
                            <Text fw={700} size="xl">4 Days</Text>
                        </div>
                    </Group>
                </Paper>
            </SimpleGrid>

            <Paper withBorder p="md" radius="md">
                <Title order={5} mb="md">Recent Absences</Title>
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
                            <Table.Td>12 Feb 2024</Table.Td>
                            <Table.Td>Sick Leave</Table.Td>
                            <Table.Td>Flu symptoms</Table.Td>
                            <Table.Td><Badge color="green">Excused</Badge></Table.Td>
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Td>20 Jan 2024</Table.Td>
                            <Table.Td>Unaccounted</Table.Td>
                            <Table.Td>-</Table.Td>
                            <Table.Td><Badge color="red">Unexcused</Badge></Table.Td>
                        </Table.Tr>
                    </Table.Tbody>
                </Table>
            </Paper>
        </Stack>
    );
}
