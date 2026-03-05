import { useAuth } from '../../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { IconClipboardList, IconClock, IconCheck, IconAlertCircle, IconUpload } from '@tabler/icons-react';
import { api } from '../../../services/api';
import { PageHeader } from '../../../components/common/PageHeader';
import { Title, Text, Card, Group, Badge, Paper, ThemeIcon, Stack, Loader, Center, Table, ActionIcon, SimpleGrid, Button } from '@mantine/core';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface Assignment {
    id: string;
    title: string;
    type: string;
    dueDate: string;
    maxMarks: number;
    subject: { id: string; name: string; code: string };
    submission?: {
        id: string;
        submittedAt: string;
        marks: number | null;
        feedback: string | null;
    } | null;
}

export default function StudentPortalAssignments() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { data: assignmentsData = [], isLoading: loading } = useQuery({
        queryKey: ['studentPortalAssignments'],
        queryFn: async () => {
            const assignRes = await api.get('/student/assignments');
            return assignRes.data || [];
        }
    });

    const assignments: Assignment[] = assignmentsData;

    if (loading) return <Center h={400}><Loader /></Center>;

    const pending = assignments.filter((a: Assignment) => !a.submission);

    return (
        <div>
            <PageHeader
                title="Learning Assignments"
                subtitle="Complete and submit your coursework"
            />

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" mb="xl">
                {assignments.length === 0 ? (
                    <Card withBorder radius="md" p="xl" ta="center" bg="var(--app-surface)">
                        <ThemeIcon variant="light" color="gray" size={60} radius="xl" mx="auto" mb="md">
                            <IconClipboardList size={30} />
                        </ThemeIcon>
                        <Text size="lg" fw={500}>No Assignments</Text>
                        <Text c="dimmed" mt="xs">You have no assignments at the moment.</Text>
                    </Card>
                ) : (
                    assignments.map((a) => {
                        const isOverdue = !a.submission && new Date(a.dueDate) < new Date();
                        const isSubmitted = !!a.submission;
                        const isGraded = !!a.submission?.marks;

                        return (
                            <Card key={a.id} withBorder radius="md" p="lg" bg="var(--app-surface)">
                                <Group justify="space-between" mb="xs">
                                    <Badge color={isGraded ? 'green' : isSubmitted ? 'blue' : isOverdue ? 'red' : 'orange'} variant="light">
                                        {isGraded ? 'Graded' : isSubmitted ? 'Submitted' : isOverdue ? 'Overdue' : 'Pending'}
                                    </Badge>
                                    <Text size="xs" c="dimmed">
                                        Due: {format(new Date(a.dueDate), 'dd MMM yyyy')}
                                    </Text>
                                </Group>

                                <Text fw={600} size="lg" mb={4}>{a.title}</Text>
                                <Text size="sm" c="dimmed" mb="md">{a.subject?.name} ({a.subject?.code})</Text>

                                <Group justify="space-between" mt="auto">
                                    <div>
                                        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Max Marks</Text>
                                        <Text fw={500}>{a.maxMarks}</Text>
                                    </div>
                                    <Button
                                        variant={isSubmitted ? "light" : "filled"}
                                        color={isSubmitted ? "blue" : "teal"}
                                        leftSection={<IconUpload size={16} />}
                                        onClick={() => navigate(`/student-portal/classes/${a.subject.id}/assignments`)}
                                    >
                                        {isSubmitted ? 'View Submission' : 'Submit Now'}
                                    </Button>
                                </Group>
                            </Card>
                        );
                    })
                )}
            </SimpleGrid>
        </div>
    );
}
