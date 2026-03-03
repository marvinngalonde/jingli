import { useAuth } from '../../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { IconClipboardList, IconClock, IconCheck, IconAlertCircle, IconChevronRight } from '@tabler/icons-react';
import { api } from '../../../services/api';
import { PageHeader } from '../../../components/common/PageHeader';
import { Title, Text, Card, Group, Badge, Paper, ThemeIcon, Stack, Loader, Center, Table, Avatar, ActionIcon, SimpleGrid } from '@mantine/core';
import { format } from 'date-fns';

interface Assignment {
    id: string;
    title: string;
    type: string;
    dueDate: string;
    maxMarks: number;
    subject: { name: string; code: string };
    section: { name: string };
    submission?: {
        id: string;
        submittedAt: string;
        marks: number | null;
        feedback: string | null;
    } | null;
}

export default function StudentAllAssignments() {
    const { user } = useAuth();
    const { data: assignmentsData = [], isLoading: loading } = useQuery({
        queryKey: ['studentAllAssignments'],
        queryFn: async () => {
            const classesRes = await api.get('/student/classes');
            const subjects = classesRes.data || [];
            const allAssignments: Assignment[] = [];

            for (const subj of subjects) {
                try {
                    const assignRes = await api.get(`/student/classes/${subj.subject?.id || subj.id}/assignments`);
                    if (assignRes.data) {
                        allAssignments.push(...assignRes.data);
                    }
                } catch { /* skip subjects with no assignments */ }
            }

            return allAssignments;
        }
    });

    const assignments = assignmentsData;

    if (loading) return <Center h={400}><Loader /></Center>;

    const pending = assignments.filter(a => !a.submission);
    const submitted = assignments.filter(a => a.submission && a.submission.marks === null);
    const graded = assignments.filter(a => a.submission && a.submission.marks !== null);

    return (
        <div>
            <PageHeader
                title="My Assignments"
                subtitle="View and track all your assignments"
            />

            <SimpleGrid cols={{ base: 1, sm: 3 }} mb="lg">
                <Paper withBorder radius="md" p="lg" bg="var(--app-surface)">
                    <Group>
                        <ThemeIcon variant="light" color="orange" size="xl" radius="md"><IconAlertCircle size={24} /></ThemeIcon>
                        <div>
                            <Text size="xs" tt="uppercase" fw={700} c="dimmed">Pending</Text>
                            <Text size="xl" fw={700}>{pending.length}</Text>
                        </div>
                    </Group>
                </Paper>
                <Paper withBorder radius="md" p="lg" bg="var(--app-surface)">
                    <Group>
                        <ThemeIcon variant="light" color="blue" size="xl" radius="md"><IconClock size={24} /></ThemeIcon>
                        <div>
                            <Text size="xs" tt="uppercase" fw={700} c="dimmed">Submitted</Text>
                            <Text size="xl" fw={700}>{submitted.length}</Text>
                        </div>
                    </Group>
                </Paper>
                <Paper withBorder radius="md" p="lg" bg="var(--app-surface)">
                    <Group>
                        <ThemeIcon variant="light" color="green" size="xl" radius="md"><IconCheck size={24} /></ThemeIcon>
                        <div>
                            <Text size="xs" tt="uppercase" fw={700} c="dimmed">Graded</Text>
                            <Text size="xl" fw={700}>{graded.length}</Text>
                        </div>
                    </Group>
                </Paper>
            </SimpleGrid>

            {assignments.length === 0 ? (
                <Card withBorder radius="md" p="xl" ta="center" bg="var(--app-surface)">
                    <ThemeIcon variant="light" color="gray" size={60} radius="xl" mx="auto" mb="md">
                        <IconClipboardList size={30} />
                    </ThemeIcon>
                    <Text size="lg" fw={500}>No Assignments</Text>
                    <Text c="dimmed" mt="xs">You have no assignments at the moment.</Text>
                </Card>
            ) : (
                <Paper withBorder radius="md" bg="var(--app-surface)" p={0}>
                    <Table striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Assignment</Table.Th>
                                <Table.Th>Subject</Table.Th>
                                <Table.Th>Due Date</Table.Th>
                                <Table.Th>Status</Table.Th>
                                <Table.Th>Marks</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {assignments.map((a) => {
                                let status = 'Pending';
                                let statusColor = 'orange';
                                if (a.submission && a.submission.marks !== null) {
                                    status = 'Graded';
                                    statusColor = 'green';
                                } else if (a.submission) {
                                    status = 'Submitted';
                                    statusColor = 'blue';
                                } else if (new Date(a.dueDate) < new Date()) {
                                    status = 'Overdue';
                                    statusColor = 'red';
                                }

                                return (
                                    <Table.Tr key={a.id}>
                                        <Table.Td>
                                            <Text fw={500} size="sm">{a.title}</Text>
                                            <Text size="xs" c="dimmed" tt="capitalize">{a.type}</Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge variant="outline" color="grape" size="sm">{a.subject?.code || a.subject?.name || '—'}</Badge>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm">{format(new Date(a.dueDate), 'dd MMM yyyy')}</Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge variant="light" color={statusColor}>{status}</Badge>
                                        </Table.Td>
                                        <Table.Td>
                                            {a.submission?.marks !== null && a.submission?.marks !== undefined ? (
                                                <Text size="sm" fw={500}>{a.submission.marks} / {a.maxMarks}</Text>
                                            ) : (
                                                <Text size="sm" c="dimmed">—</Text>
                                            )}
                                        </Table.Td>
                                    </Table.Tr>
                                );
                            })}
                        </Table.Tbody>
                    </Table>
                </Paper>
            )}
        </div>
    );
}
