import { Title, Text, Stack, Card, Group, ActionIcon, LoadingOverlay, Table, Badge, Button, Modal, TextInput, Textarea } from '@mantine/core';
import { IconArrowLeft, IconCheck, IconUpload } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';
import { format } from 'date-fns';

interface Assignment {
    id: string;
    title: string;
    description: string | null;
    dueDate: string | null;
    maxMarks: number | null;
    submissions: any[]; // We'll include the student's submission if it exists
}

export function StudentAssignments() {
    const { subjectId } = useParams();
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);

    const [opened, { open, close }] = useDisclosure(false);
    const [submitting, setSubmitting] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

    // Submission form
    const [fileUrl, setFileUrl] = useState('');
    const [content, setContent] = useState('');

    useEffect(() => {
        const fetchAssignments = async () => {
            if (!subjectId) return;
            try {
                const { data } = await api.get(`/student/classes/${subjectId}/assignments`);
                setAssignments(data);
            } catch (error) {
                console.error("Failed to fetch assignments", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAssignments();
    }, [subjectId]);

    const handleOpenSubmit = (assignment: Assignment) => {
        setSelectedAssignment(assignment);
        setFileUrl('');
        setContent('');
        open();
    };

    const handleSubmit = async () => {
        if (!selectedAssignment || (!fileUrl && !content)) return;
        setSubmitting(true);
        try {
            const { data } = await api.post(`/student/assignments/${selectedAssignment.id}/submit`, {
                fileUrl: fileUrl || undefined,
                content: content || undefined,
            });

            // Update local state to reflect submission
            setAssignments(assignments.map(a =>
                a.id === selectedAssignment.id ? { ...a, submissions: [data] } : a
            ));
            close();
        } catch (error) {
            console.error("Failed to submit assignment", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Stack gap="lg" pos="relative">
            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

            <Group justify="space-between">
                <Group>
                    <ActionIcon variant="light" size="lg" onClick={() => navigate('/student/classes')}>
                        <IconArrowLeft size={20} />
                    </ActionIcon>
                    <div>
                        <Title order={2}>Assignments</Title>
                        <Text c="dimmed">View pending tasks and submit your work.</Text>
                    </div>
                </Group>
            </Group>

            <Card withBorder radius="md" p={0}>
                {assignments.length === 0 && !loading ? (
                    <Text p="xl" ta="center" c="dimmed" fs="italic">No assignments for this class.</Text>
                ) : (
                    <Table verticalSpacing="md" striped highlightOnHover>
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
                            {assignments.map((a) => {
                                const hasSubmitted = a.submissions && a.submissions.length > 0;
                                const isGraded = hasSubmitted && a.submissions[0].marks !== null;

                                return (
                                    <Table.Tr key={a.id}>
                                        <Table.Td>
                                            <Text size="sm" fw={500}>{a.title}</Text>
                                            <Text size="xs" c="dimmed" lineClamp={1}>{a.description}</Text>
                                        </Table.Td>
                                        <Table.Td>
                                            {a.dueDate ? format(new Date(a.dueDate), 'MMM dd, yyyy h:mm a') : 'No due date'}
                                        </Table.Td>
                                        <Table.Td>
                                            {a.maxMarks || '-'}
                                        </Table.Td>
                                        <Table.Td>
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
                )}
            </Card>

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
                        <Button onClick={handleSubmit} loading={submitting} disabled={!fileUrl && !content}>Submit Assignment</Button>
                    </Group>
                </Stack>
            </Modal>
        </Stack>
    );
}

export default StudentAssignments;
