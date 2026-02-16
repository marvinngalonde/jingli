import { Paper, Title, Table, Badge, Text, Group, Button, Stack } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';

export function FinanceRecord() {
    return (
        <Stack>
            <Paper withBorder p="md" radius="md">
                <Group justify="space-between" align="flex-start" mb="md">
                    <div>
                        <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Outstanding Balance</Text>
                        <Text fw={700} size="xl" c="red">$2,500.00</Text>
                    </div>
                    <Button variant="light" color="blue">Make Payment</Button>
                </Group>
            </Paper>

            <Paper withBorder p="md" radius="md">
                <Title order={5} mb="md">Invoice History</Title>
                <Table>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Invoice ID</Table.Th>
                            <Table.Th>Date</Table.Th>
                            <Table.Th>Description</Table.Th>
                            <Table.Th>Amount</Table.Th>
                            <Table.Th>Status</Table.Th>
                            <Table.Th>Action</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        <Table.Tr>
                            <Table.Td>#INV-2024-001</Table.Td>
                            <Table.Td>01 Mar 2024</Table.Td>
                            <Table.Td>Term 2 Tuition Fee</Table.Td>
                            <Table.Td>$1,500.00</Table.Td>
                            <Table.Td><Badge color="red">Unpaid</Badge></Table.Td>
                            <Table.Td><Button variant="subtle" size="xs" leftSection={<IconDownload size={14} />}>PDF</Button></Table.Td>
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Td>#INV-2024-002</Table.Td>
                            <Table.Td>01 Mar 2024</Table.Td>
                            <Table.Td>Bus Transport (Mar)</Table.Td>
                            <Table.Td>$250.00</Table.Td>
                            <Table.Td><Badge color="red">Unpaid</Badge></Table.Td>
                            <Table.Td><Button variant="subtle" size="xs" leftSection={<IconDownload size={14} />}>PDF</Button></Table.Td>
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Td>#INV-2023-099</Table.Td>
                            <Table.Td>01 Jan 2024</Table.Td>
                            <Table.Td>Term 1 Tuition Fee</Table.Td>
                            <Table.Td>$1,500.00</Table.Td>
                            <Table.Td><Badge color="green">Paid</Badge></Table.Td>
                            <Table.Td><Button variant="subtle" size="xs" leftSection={<IconDownload size={14} />}>PDF</Button></Table.Td>
                        </Table.Tr>
                    </Table.Tbody>
                </Table>
            </Paper>
        </Stack>
    );
}
