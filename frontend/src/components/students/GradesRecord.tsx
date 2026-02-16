import { Table, Badge, Progress, Paper, Title, Group, Text, Select } from '@mantine/core';

export function GradesRecord() {
    const grades = [
        { subject: 'Mathematics', score: 85, grade: 'A', remarks: 'Excellent' },
        { subject: 'Physics', score: 72, grade: 'B', remarks: 'Good' },
        { subject: 'Chemistry', score: 68, grade: 'C+', remarks: 'Satisfactory' },
        { subject: 'English', score: 90, grade: 'A+', remarks: 'Outstanding' },
        { subject: 'History', score: 78, grade: 'B+', remarks: 'Good' },
        { subject: 'Computer Science', score: 95, grade: 'A+', remarks: 'Excellent' },
    ];

    return (
        <Paper withBorder p="md" radius="md">
            <Group justify="space-between" mb="lg">
                <Title order={5}>Academic Performance - Term 1</Title>
                <Select
                    placeholder="Select Term"
                    defaultValue="Term 1"
                    data={['Term 1', 'Term 2', 'Final Exam']}
                    w={150}
                />
            </Group>

            <Table verticalSpacing="sm">
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Subject</Table.Th>
                        <Table.Th>Score</Table.Th>
                        <Table.Th>Grade</Table.Th>
                        <Table.Th>Performance</Table.Th>
                        <Table.Th>Remarks</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {grades.map((item) => (
                        <Table.Tr key={item.subject}>
                            <Table.Td fw={500}>{item.subject}</Table.Td>
                            <Table.Td>{item.score}%</Table.Td>
                            <Table.Td>
                                <Badge
                                    color={item.score >= 80 ? 'green' : item.score >= 70 ? 'blue' : item.score >= 60 ? 'yellow' : 'red'}
                                    variant="light"
                                >
                                    {item.grade}
                                </Badge>
                            </Table.Td>
                            <Table.Td width="30%">
                                <Progress
                                    value={item.score}
                                    color={item.score >= 80 ? 'green' : item.score >= 70 ? 'blue' : item.score >= 60 ? 'yellow' : 'red'}
                                    size="sm"
                                    radius="xl"
                                />
                            </Table.Td>
                            <Table.Td><Text size="sm" c="dimmed">{item.remarks}</Text></Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </Paper>
    );
}
