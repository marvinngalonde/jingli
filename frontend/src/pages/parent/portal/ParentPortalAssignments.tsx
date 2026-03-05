import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { IconClipboardList, IconClock, IconCheck, IconAlertCircle, IconUsers } from '@tabler/icons-react';
import { api } from '../../../services/api';
import { PageHeader } from '../../../components/common/PageHeader';
import { Text, Card, Group, Badge, Paper, ThemeIcon, Stack, Loader, Center, Table, SimpleGrid, Select } from '@mantine/core';
import { format } from 'date-fns';

interface Assignment {
    id: string;
    title: string;
    type: string;
    dueDate: string;
    maxMarks: number;
    subject: { name: string; code: string };
    section: { name: string };
    submissions?: {
        id: string;
        submittedAt: string;
        marks: number | null;
        feedback: string | null;
    }[];
}

export default function ParentPortalAssignments() {
    const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

    const { data: childrenData, isLoading: loadingChildren } = useQuery({
        queryKey: ['parentChildren'],
        queryFn: async () => {
            const res = await api.get('/parent/children');
            return res.data;
        }
    });

    const children = childrenData || [];

    useEffect(() => {
        if (children.length > 0 && !selectedChildId) {
            setSelectedChildId(children[0].id);
        }
    }, [children, selectedChildId]);

    const { data: assignmentsData = [], isLoading: loadingAssignments } = useQuery({
        queryKey: ['parentChildAssignments', selectedChildId],
        queryFn: async () => {
            if (!selectedChildId) return [];
            const assignRes = await api.get(`/parent/children/${selectedChildId}/assignments`);
            return assignRes.data || [];
        },
        enabled: !!selectedChildId,
        retry: false
    });

    const assignments: Assignment[] = assignmentsData;

    const loading = loadingChildren || (!!selectedChildId && loadingAssignments);
    if (loading) return <Center h={400}><Loader /></Center>;

    const pending = assignments.filter((a) => !a.submissions || a.submissions.length === 0);
    const submitted = assignments.filter((a) => a.submissions && a.submissions.length > 0 && a.submissions[0].marks === null);
    const graded = assignments.filter((a) => a.submissions && a.submissions.length > 0 && a.submissions[0].marks !== null);

    return (
        <Stack gap="lg">
            <Group justify="space-between" align="flex-start">
                <PageHeader
                    title="Children's Assignments"
                    subtitle="Track your child's pending and completed tasks"
                />

                {children.length > 0 && (
                    <Select
                        leftSection={<IconUsers size={16} />}
                        placeholder="Select Child"
                        data={children.map((c: any) => ({ value: c.id, label: `${c.firstName} ${c.lastName}` }))}
                        value={selectedChildId}
                        onChange={setSelectedChildId}
                        style={{ width: 250 }}
                    />
                )}
            </Group>

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
                    <Text c="dimmed" mt="xs">This child has no assignments at the moment.</Text>
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
                                const submission = a.submissions && a.submissions.length > 0 ? a.submissions[0] : null;

                                if (submission && submission.marks !== null) {
                                    status = 'Graded';
                                    statusColor = 'green';
                                } else if (submission) {
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
                                            {submission?.marks !== null && submission?.marks !== undefined ? (
                                                <Text size="sm" fw={500}>{submission.marks} / {a.maxMarks}</Text>
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
        </Stack>
    );
}
