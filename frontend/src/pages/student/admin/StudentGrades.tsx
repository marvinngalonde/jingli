import { Title, Text, Stack, Card, Group, LoadingOverlay, Table, Badge, Center, Loader } from '@mantine/core';
import { IconAward } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../services/api';
import { format } from 'date-fns';
import { PageHeader } from '../../../components/common/PageHeader';

interface GradedSubmission {
    id: string;
    submittedAt: string;
    marks: number | null;
    feedback: string | null;
    assignment: {
        title: string;
        maxMarks: number;
        subject: { name: string; code: string };
    }
}

export function StudentGrades() {
    const { data: submissions = [], isLoading: loading } = useQuery({
        queryKey: ['studentGrades'],
        queryFn: async () => {
            const { data } = await api.get(`/student/grades`);
            return data;
        }
    });

    if (loading) return <Center h={400}><Loader /></Center>;

    return (
        <Stack gap="lg" pos="relative">
            <PageHeader
                title="Academic Record"
                subtitle="View your assignment grades and teacher feedback."
            />

            <Card withBorder radius="md" p={0} bg="var(--app-surface)">
                {submissions.length === 0 ? (
                    <Text p="xl" ta="center" c="dimmed" fs="italic">No graded assignments yet.</Text>
                ) : (
                    <Table verticalSpacing="md" striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Assignment</Table.Th>
                                <Table.Th>Subject</Table.Th>
                                <Table.Th>Score</Table.Th>
                                <Table.Th>Feedback</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {submissions.map((s: GradedSubmission) => (
                                <Table.Tr key={s.id}>
                                    <Table.Td>
                                        <Text size="sm" fw={500}>{s.assignment.title}</Text>
                                        <Text size="xs" c="dimmed">Submitted: {format(new Date(s.submittedAt), 'MMM dd, yyyy')}</Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Badge variant="light" color="blue">{s.assignment.subject.name}</Badge>
                                    </Table.Td>
                                    <Table.Td>
                                        <Group gap="xs">
                                            <IconAward size={16} color="green" />
                                            <Text fw={700} c="green.7">{s.marks} / {s.assignment.maxMarks}</Text>
                                        </Group>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="sm" fs={s.feedback ? 'normal' : 'italic'} c={s.feedback ? 'dark' : 'dimmed'}>
                                            {s.feedback || 'No feedback provided.'}
                                        </Text>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                )}
            </Card>
        </Stack>
    );
}

export default StudentGrades;
