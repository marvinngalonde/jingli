import { useAuth } from '../../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { IconClipboardList, IconClock, IconCheck, IconAlertCircle, IconUpload } from '@tabler/icons-react';
import { api } from '../../../services/api';
import { PageHeader } from '../../../components/common/PageHeader';
import { Title, Text, Card, Group, Badge, Paper, ThemeIcon, Stack, Loader, Center, Table, ActionIcon, SimpleGrid, Button, Select } from '@mantine/core';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';

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
    subjectId?: string;
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

    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string | null>('All');

    const assignments: Assignment[] = assignmentsData;

    const subjects = useMemo(() => {
        const uniqueSubjects = new Map();
        assignments.forEach(a => {
            const sid = a.subject?.id || a.subjectId;
            if (sid && !uniqueSubjects.has(sid)) {
                uniqueSubjects.set(sid, { value: sid, label: a.subject?.name || 'Unknown Subject' });
            }
        });
        return Array.from(uniqueSubjects.values());
    }, [assignments]);

    if (loading) return <Center h={400}><Loader /></Center>;

    let filteredAssignments = assignments;

    if (selectedSubject) {
        filteredAssignments = filteredAssignments.filter(a => (a.subject?.id || a.subjectId) === selectedSubject);
    }

    if (statusFilter && statusFilter !== 'All') {
        filteredAssignments = filteredAssignments.filter(a => {
            const isSubmitted = !!a.submission;
            const isGraded = !!a.submission?.marks;
            if (statusFilter === 'Submitted') return isSubmitted && !isGraded;
            if (statusFilter === 'Graded') return isGraded;
            if (statusFilter === 'Pending') return !isSubmitted;
            return true;
        });
    }

    const pending = assignments.filter((a: Assignment) => !a.submission);

    return (
        <div>
            <PageHeader
                title="Learning Assignments"
                subtitle="Complete and submit your coursework"
            />

            <Group justify="space-between" align="center" mb="xl">
                <div></div>
                <Group gap="sm">
                    <Select
                        placeholder="Filter by Subject"
                        data={subjects}
                        value={selectedSubject}
                        onChange={setSelectedSubject}
                        clearable
                        w={{ base: '100%', sm: 200 }}
                    />
                    <Select
                        placeholder="Filter by Status"
                        data={['All', 'Pending', 'Submitted', 'Graded']}
                        value={statusFilter}
                        onChange={setStatusFilter}
                        w={{ base: '100%', sm: 200 }}
                    />
                </Group>
            </Group>

            <Paper withBorder radius="md" bg="var(--app-surface)" p={0} mb="xl">
                {filteredAssignments.length === 0 ? (
                    <Card p="xl" ta="center" bg="transparent">
                        <ThemeIcon variant="light" color="gray" size={60} radius="xl" mx="auto" mb="md">
                            <IconClipboardList size={30} />
                        </ThemeIcon>
                        <Text size="lg" fw={500}>No Assignments Found</Text>
                        <Text c="dimmed" mt="xs">No assignments match your current filters.</Text>
                    </Card>
                ) : (
                    <Table striped highlightOnHover verticalSpacing="md">
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Assignment</Table.Th>
                                <Table.Th>Subject</Table.Th>
                                <Table.Th>Due Date</Table.Th>
                                <Table.Th>Max Marks</Table.Th>
                                <Table.Th>Status</Table.Th>
                                <Table.Th style={{ textAlign: 'right' }}>Action</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {filteredAssignments.map((a) => {
                                const isOverdue = !a.submission && new Date(a.dueDate) < new Date();
                                const isSubmitted = !!a.submission;
                                const isGraded = !!a.submission?.marks;

                                return (
                                    <Table.Tr key={a.id}>
                                        <Table.Td>
                                            <Text fw={600} size="sm">{a.title}</Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge variant="outline" color="grape" size="sm">
                                                {a.subject?.name} ({a.subject?.code})
                                            </Badge>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm">
                                                {format(new Date(a.dueDate), 'dd MMM yyyy')}
                                            </Text>
                                            {isOverdue && <Text size="xs" color="red">Overdue</Text>}
                                        </Table.Td>
                                        <Table.Td>
                                            <Text fw={500}>{a.maxMarks}</Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge color={isGraded ? 'green' : isSubmitted ? 'blue' : isOverdue ? 'red' : 'orange'} variant="light">
                                                {isGraded ? 'Graded' : isSubmitted ? 'Submitted' : isOverdue ? 'Overdue' : 'Pending'}
                                            </Badge>
                                        </Table.Td>
                                        <Table.Td style={{ textAlign: 'right' }}>
                                            <Button
                                                size="xs"
                                                variant={isSubmitted ? "subtle" : "filled"}
                                                color={isSubmitted ? "gray" : "teal"}
                                                leftSection={<IconUpload size={14} />}
                                                onClick={() => navigate(`/student-portal/classes/${a.subject?.id || a.subjectId}/assignments`)}
                                            >
                                                {isSubmitted ? 'View Submission' : 'Submit Now'}
                                            </Button>
                                        </Table.Td>
                                    </Table.Tr>
                                );
                            })}
                        </Table.Tbody>
                    </Table>
                )}
            </Paper>
        </div>
    );
}
