import { Title, Text, Stack, Card, Group, ActionIcon, LoadingOverlay, Table, Badge, Button, Modal, TextInput, Textarea, Center, Loader, ThemeIcon, Box, Divider } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconArrowLeft, IconCheck, IconUpload } from '@tabler/icons-react';
import { useState } from 'react';
import { api } from '../../../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';
import { format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';

interface Assignment {
    id: string;
    title: string;
    description: string | null;
    dueDate: string | null;
    maxMarks: number | null;
    submissions: any[];
}

export function StudentAssignments() {
    const { subjectId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isMobile = useMediaQuery('(max-width: 48em)');
    const [opened, { open, close }] = useDisclosure(false);
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

    // Submission form
    const [fileUrl, setFileUrl] = useState('');
    const [content, setContent] = useState('');

    const { data: assignments = [], isLoading: loading } = useQuery({
        queryKey: ['studentAssignments', subjectId],
        queryFn: async () => {
            if (!subjectId) return [];
            const { data } = await api.get(`/student/classes/${subjectId}/assignments`);
            return data as Assignment[];
        },
        enabled: !!subjectId,
        staleTime: 5 * 60 * 1000,
    });

    const submitMutation = useMutation({
        mutationFn: async (payload: { assignmentId: string; fileUrl?: string; content?: string }) => {
            const { data } = await api.post(`/student/assignments/${payload.assignmentId}/submit`, {
                fileUrl: payload.fileUrl,
                content: payload.content,
            });
            return data;
        },
        onSuccess: () => {
            notifications.show({
                title: 'Success',
                message: 'Assignment submitted successfully',
                color: 'green'
            });
            queryClient.invalidateQueries({ queryKey: ['studentAssignments', subjectId] });
            close();
        },
        onError: (error: any) => {
            notifications.show({
                title: 'Error',
                message: error.response?.data?.message || 'Failed to submit assignment',
                color: 'red'
            });
        }
    });

    const handleOpenSubmit = (assignment: Assignment) => {
        setSelectedAssignment(assignment);
        setFileUrl('');
        setContent('');
        open();
    };

    const handleSubmit = async () => {
        if (!selectedAssignment || (!fileUrl && !content)) return;
        submitMutation.mutate({
            assignmentId: selectedAssignment.id,
            fileUrl: fileUrl || undefined,
            content: content || undefined,
        });
    };

    return (
        <Stack gap="lg" pos="relative">
            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

            <Group justify="space-between">
                <Group>
                    <ActionIcon variant="light" size="lg" onClick={() => navigate('/student-portal/classes')}>
                        <IconArrowLeft size={20} />
                    </ActionIcon>
                    <div>
                        <Title order={2}>Assignments</Title>
                        <Text c="dimmed">View pending tasks and submit your work.</Text>
                    </div>
                </Group>
            </Group>

            {assignments.length === 0 && !loading ? (
                <Card withBorder radius="md" p="xl" ta="center" bg="var(--app-surface)">
                    <Text c="dimmed" fs="italic">No assignments for this class.</Text>
                </Card>
            ) : (
                isMobile ? (
                    <Stack gap="sm">
                        {assignments.map((a: Assignment) => {
                            const hasSubmitted = a.submissions && a.submissions.length > 0;
                            const isGraded = hasSubmitted && a.submissions[0].marks !== null;

                            return (
                                <Card key={a.id} withBorder radius="md" p="sm">
                                    <Group justify="space-between" mb="xs" wrap="nowrap">
                                        <Text size="sm" fw={600} lineClamp={1}>{a.title}</Text>
                                        <Box>
                                            {isGraded ? (
                                                <Badge color="green" size="xs">Graded</Badge>
                                            ) : hasSubmitted ? (
                                                <Badge color="blue" size="xs">Submitted</Badge>
                                            ) : (
                                                <Badge color="orange" size="xs">Pending</Badge>
                                            )}
                                        </Box>
                                    </Group>

                                    <Group gap="xs" mb="sm">
                                        <Text size="xs" c="dimmed">
                                            Due: {a.dueDate ? format(new Date(a.dueDate), 'MMM dd, h:mm a') : 'No due date'}
                                        </Text>
                                        <Divider orientation="vertical" />
                                        <Text size="xs" c="dimmed">Max: {a.maxMarks || '-'}</Text>
                                    </Group>

                                    {a.description && (
                                        <Text size="xs" c="dimmed" mb="md" lineClamp={2}>
                                            {a.description}
                                        </Text>
                                    )}

                                    {!hasSubmitted ? (
                                        <Button fullWidth size="xs" variant="light" leftSection={<IconUpload size={14} />} onClick={() => handleOpenSubmit(a)}>
                                            Turn In
                                        </Button>
                                    ) : (
                                        <Button fullWidth size="xs" variant="subtle" color="gray" leftSection={<IconCheck size={14} />} disabled>
                                            Submitted {isGraded ? `(${a.submissions[0].marks}/${a.maxMarks})` : ''}
                                        </Button>
                                    )}
                                </Card>
                            );
                        })}
                    </Stack>
                ) : (
                    <Card withBorder radius="md" p={0}>
                        <Table verticalSpacing="md" striped highlightOnHover className="mobile-stack-table">
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Assignment</Table.Th>
                                    <Table.Th>Due Date</Table.Th>
                                    <Table.Th>Max Marks</Table.Th>
                                    <Table.Th>Status</Table.Th>
                                    <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {assignments.map((a: Assignment) => {
                                    const hasSubmitted = a.submissions && a.submissions.length > 0;
                                    const isGraded = hasSubmitted && a.submissions[0].marks !== null;

                                    return (
                                        <Table.Tr key={a.id}>
                                            <Table.Td data-label="Assignment">
                                                <Text size="sm" fw={500}>{a.title}</Text>
                                                <Text size="xs" c="dimmed" lineClamp={1}>{a.description}</Text>
                                            </Table.Td>
                                            <Table.Td data-label="Due Date">
                                                {a.dueDate ? format(new Date(a.dueDate), 'MMM dd, yyyy h:mm a') : 'No due date'}
                                            </Table.Td>
                                            <Table.Td data-label="Max Marks">
                                                {a.maxMarks || '-'}
                                            </Table.Td>
                                            <Table.Td data-label="Status">
                                                {isGraded ? (
                                                    <Badge color="green">Graded ({a.submissions[0].marks}/{a.maxMarks})</Badge>
                                                ) : hasSubmitted ? (
                                                    <Badge color="blue">Submitted</Badge>
                                                ) : (
                                                    <Badge color="orange">Pending</Badge>
                                                )}
                                            </Table.Td>
                                            <Table.Td style={{ textAlign: 'right' }}>
                                                {!hasSubmitted ? (
                                                    <Button size="xs" variant="light" leftSection={<IconUpload size={14} />} onClick={() => handleOpenSubmit(a)}>
                                                        Turn In
                                                    </Button>
                                                ) : (
                                                    <Button size="xs" variant="subtle" color="gray" leftSection={<IconCheck size={14} />}>
                                                        Done
                                                    </Button>
                                                )}
                                            </Table.Td>
                                        </Table.Tr>
                                    );
                                })}
                            </Table.Tbody>
                        </Table>
                    </Card>
                )
            )}

            <Modal opened={opened} onClose={close} title={`Turn in: ${selectedAssignment?.title}`} centered size="lg">
                <Stack>
                    <Text size="sm" c="dimmed">{selectedAssignment?.description}</Text>

                    <TextInput
                        label="File URL"
                        placeholder="Link to Google Doc, Dropbox, etc."
                        value={fileUrl}
                        onChange={(e) => setFileUrl(e.target.value)}
                        description="For MVP, paste a direct link to your file."
                    />
                    <Text ta="center" size="sm" c="dimmed" fw={500}>OR</Text>
                    <Textarea
                        label="Text Response"
                        placeholder="Type your answer here..."
                        minRows={5}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={close}>Cancel</Button>
                        <Button onClick={handleSubmit} loading={submitMutation.isPending} disabled={!fileUrl && !content}>Submit Assignment</Button>
                    </Group>
                </Stack>
            </Modal>
        </Stack>
    );
}

export default StudentAssignments;
