import { useState, useEffect } from 'react';
import { Paper, Title, Center, Text, Stack, ThemeIcon, Table, Group, Badge, Loader } from '@mantine/core';
import { IconSchool, IconFileAnalytics } from '@tabler/icons-react';
import { useParams } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { examsService } from '../../services/examsService';
import type { ExamResult } from '../../types/exams';

export function GradesRecord() {
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<ExamResult[]>([]);

    useEffect(() => {
        if (id) {
            loadResults(id);
        }
    }, [id]);

    const loadResults = async (studentId: string) => {
        try {
            setLoading(true);
            const data = await examsService.getStudentResults(studentId);
            setResults(data);
        } catch (error) {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to load grades', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Center p="xl"><Loader /></Center>;
    }

    if (results.length === 0) {
        return (
            <Stack>
                <Paper withBorder p="xl" radius="md">
                    <Center>
                        <Stack align="center" gap="xs">
                            <ThemeIcon size={48} radius="xl" variant="light" color="gray">
                                <IconSchool size={24} />
                            </ThemeIcon>
                            <Title order={4}>Academic Records</Title>
                            <Text c="dimmed" ta="center">No grades or exam results recorded yet.</Text>
                        </Stack>
                    </Center>
                </Paper>
            </Stack>
        );
    }

    return (
        <Stack>
            <Paper withBorder p="md" radius="md">
                <Group justify="space-between" mb="md">
                    <Group>
                        <ThemeIcon variant="light" color="blue" size="lg">
                            <IconFileAnalytics size={20} />
                        </ThemeIcon>
                        <div>
                            <Title order={5}>Exam Results</Title>
                            <Text size="xs" c="dimmed">Detailed performance history</Text>
                        </div>
                    </Group>
                    <Badge size="lg" variant="light">{results.length} Exams Taken</Badge>
                </Group>

                <Table striped highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Date</Table.Th>
                            <Table.Th>Exam</Table.Th>
                            <Table.Th>Subject</Table.Th>
                            <Table.Th>Marks</Table.Th>
                            <Table.Th>Grade</Table.Th>
                            <Table.Th>Remarks</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {results.map((result: any) => {
                            const max = result.exam?.maxMarks || 100;
                            const percentage = (result.marksObtained / max) * 100;

                            let color = 'green';
                            let grade = 'A';
                            if (percentage < 50) { color = 'red'; grade = 'F'; }
                            else if (percentage < 60) { color = 'orange'; grade = 'D'; }
                            else if (percentage < 75) { color = 'yellow'; grade = 'C'; }
                            else if (percentage < 85) { color = 'blue'; grade = 'B'; }

                            return (
                                <Table.Tr key={result.id}>
                                    <Table.Td>{new Date(result.exam?.date).toLocaleDateString()}</Table.Td>
                                    <Table.Td>
                                        <Text size="sm" fw={500}>{result.exam?.name}</Text>
                                        <Text size="xs" c="dimmed">{result.exam?.term?.name}</Text>
                                    </Table.Td>
                                    <Table.Td>{result.exam?.subject?.name} ({result.exam?.subject?.code})</Table.Td>
                                    <Table.Td>
                                        <Text fw={600}>{result.marksObtained} <Text span size="xs" c="dimmed">/ {max}</Text></Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Badge color={color} variant="light">{grade} ({percentage.toFixed(0)}%)</Badge>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="sm">{result.remarks || '-'}</Text>
                                    </Table.Td>
                                </Table.Tr>
                            );
                        })}
                    </Table.Tbody>
                </Table>
            </Paper>
        </Stack>
    );
}
