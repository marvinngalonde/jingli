import { Paper, Title, Table, Badge, Text, Group, Button, Stack } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';

export function PayrollRecord() {
    return (
        <Stack>
            <Paper withBorder p="md" radius="md">
                <Group justify="space-between" align="flex-start" mb="md">
                    <div>
                        <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Current Base Salary</Text>
                        <Text fw={700} size="xl" c="green">$5,000.00 / month</Text>
                    </div>
                    <Button variant="light" color="blue">View Contract</Button>
                </Group>
            </Paper>

            <Paper withBorder p="md" radius="md">
                <Title order={5} mb="md">Payslip History</Title>
                <Table>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Period</Table.Th>
                            <Table.Th>Date Paid</Table.Th>
                            <Table.Th>Basic</Table.Th>
                            <Table.Th>Allowances</Table.Th>
                            <Table.Th>Deductions</Table.Th>
                            <Table.Th>Net Pay</Table.Th>
                            <Table.Th>Status</Table.Th>
                            <Table.Th>Action</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        <Table.Tr>
                            <Table.Td>Feb 2024</Table.Td>
                            <Table.Td>28 Feb 2024</Table.Td>
                            <Table.Td>$5,000</Table.Td>
                            <Table.Td>$200</Table.Td>
                            <Table.Td>-$500</Table.Td>
                            <Table.Td fw={700}>$4,700</Table.Td>
                            <Table.Td><Badge color="green">Paid</Badge></Table.Td>
                            <Table.Td><Button variant="subtle" size="xs" leftSection={<IconDownload size={14} />}>PDF</Button></Table.Td>
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Td>Jan 2024</Table.Td>
                            <Table.Td>30 Jan 2024</Table.Td>
                            <Table.Td>$5,000</Table.Td>
                            <Table.Td>$200</Table.Td>
                            <Table.Td>-$500</Table.Td>
                            <Table.Td fw={700}>$4,700</Table.Td>
                            <Table.Td><Badge color="green">Paid</Badge></Table.Td>
                            <Table.Td><Button variant="subtle" size="xs" leftSection={<IconDownload size={14} />}>PDF</Button></Table.Td>
                        </Table.Tr>
                    </Table.Tbody>
                </Table>
            </Paper>
        </Stack>
    );
}
