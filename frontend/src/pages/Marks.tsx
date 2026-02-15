import { useState } from 'react';
import {
    Box,
    Card,
    Select,
    Table,
    TextInput,
    Button,
    Group,
    Text,
    Title,
    Switch,
    rem,
} from '@mantine/core';


export default function Marks() {
    const [publishResults, setPublishResults] = useState(false);

    return (
        <Box p="xl">
            <Group justify="space-between" mb="lg">
                <Group>
                    <Select
                        label="Exam:"
                        data={['Mid-Term 1', 'Mid-Term 2', 'Finals', 'Annual']}
                        defaultValue="Mid-Term 1"
                        size="sm"
                        w={rem(150)}
                        radius={2}
                    />
                    <Select
                        label="Class:"
                        data={['5A', '5B', '6A', '6B', '7A']}
                        defaultValue="5A"
                        size="sm"
                        w={rem(120)}
                        radius={2}
                    />
                    <Select
                        label="Subject:"
                        data={['Physics', 'Chemistry', 'Mathematics', 'Biology']}
                        defaultValue="Physics"
                        size="sm"
                        w={rem(150)}
                        radius={2}
                    />
                </Group>
            </Group>

            <Card shadow="sm" padding="lg" radius={2} withBorder>
                <Table>
                    <Table.Thead>
                        <Table.Tr style={{ backgroundColor: '#f8f9fa' }}>
                            <Table.Th>Roll No</Table.Th>
                            <Table.Th>Student Name</Table.Th>
                            <Table.Th style={{ width: 100 }}>Theory (70)</Table.Th>
                            <Table.Th style={{ width: 100 }}>Practical (30)</Table.Th>
                            <Table.Th style={{ width: 100 }}>Total (100)</Table.Th>
                            <Table.Th style={{ width: 80 }}>Grade</Table.Th>
                            <Table.Th style={{ width: 200 }}>Remarks</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        <Table.Tr>
                            <Table.Td colSpan={7} style={{ textAlign: 'center', padding: rem(40) }}>
                                <Text c="dimmed">No marks data available. Please select exam, class, and subject to enter marks.</Text>
                            </Table.Td>
                        </Table.Tr>
                        {/* Empty rows */}
                        {[...Array(5)].map((_, idx) => (
                            <Table.Tr key={`empty-${idx}`}>
                                <Table.Td>
                                    <Text size="sm" c="dimmed"></Text>
                                </Table.Td>
                                <Table.Td></Table.Td>
                                <Table.Td>
                                    <TextInput size="xs" radius={2} />
                                </Table.Td>
                                <Table.Td>
                                    <TextInput size="xs" radius={2} />
                                </Table.Td>
                                <Table.Td>
                                    <Box
                                        style={{
                                            backgroundColor: '#f3f4f6',
                                            padding: `${rem(6)} ${rem(12)}`,
                                            borderRadius: rem(4),
                                            textAlign: 'center',
                                        }}
                                    >
                                        <Text size="sm" c="dimmed">
                                            -
                                        </Text>
                                    </Box>
                                </Table.Td>
                                <Table.Td>
                                    <Box
                                        style={{
                                            backgroundColor: '#f3f4f6',
                                            padding: `${rem(6)} ${rem(12)}`,
                                            borderRadius: rem(4),
                                            textAlign: 'center',
                                        }}
                                    >
                                        <Text size="sm" c="dimmed">
                                            -
                                        </Text>
                                    </Box>
                                </Table.Td>
                                <Table.Td>
                                    <TextInput size="xs" radius={2} />
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>

                <Group justify="space-between" mt="lg">
                    <Group>
                        <Switch
                            label="Publish Results"
                            checked={publishResults}
                            onChange={(event) => setPublishResults(event.currentTarget.checked)}
                            size="sm"
                        />
                    </Group>
                    <Group>
                        <Button variant="outline" size="sm" radius={2} color="gray">
                            Cancel
                        </Button>
                        <Button size="sm" radius={2} color="navy.9">
                            Save Changes
                        </Button>
                    </Group>
                </Group>
            </Card>
        </Box >
    );
}
