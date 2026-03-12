import { Title, Text, Stack, Card, Group, ActionIcon, LoadingOverlay, Table, Badge, Button, Drawer, TextInput, FileInput, Center, Loader, ThemeIcon, Box, Divider, Paper } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconArrowLeft, IconCheck, IconUpload } from '@tabler/icons-react';
import { useState } from 'react';
import { api } from '../../../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';
import { format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { storageService } from '../../../services/storageService';
import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';

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
    const [file, setFile] = useState<File | null>(null);
    const [content, setContent] = useState('');

    const editor = useEditor({
        extensions: [
            StarterKit,
            Link,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
        ],
        content,
        onUpdate: ({ editor }) => {
            setContent(editor.getHTML());
        },
    });

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
            let uploadedUrl = payload.fileUrl;
            if (file) {
                const path = await storageService.uploadDocument('documents', file.name, file);
                uploadedUrl = storageService.getPublicUrl('documents', path);
            }

            const { data } = await api.post(`/student/assignments/${payload.assignmentId}/submit`, {
                fileUrl: uploadedUrl,
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
        const hasSubmitted = assignment.submissions && assignment.submissions.length > 0;

        if (hasSubmitted) {
            const sub = assignment.submissions[0];
            setFileUrl(sub.fileUrl || '');
            setContent(sub.content || '');
            editor?.setEditable(false);
            editor?.commands.setContent(sub.content || '');
            setFile(null);
        } else {
            setFileUrl('');
            setFile(null);
            setContent('');
            editor?.setEditable(true);
            editor?.commands.setContent('');
        }
        open();
    };

    const handleSubmit = async () => {
        if (!selectedAssignment || (!fileUrl && !file && !content.replace(/<[^>]+>/g, '').trim())) return;
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
                                        <Button fullWidth size="xs" variant="subtle" color="gray" leftSection={<IconCheck size={14} />} onClick={() => handleOpenSubmit(a)}>
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
                                                    <Button size="xs" variant="subtle" color="gray" leftSection={<IconCheck size={14} />} onClick={() => handleOpenSubmit(a)}>
                                                        View Submission
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

            <Drawer opened={opened} onClose={close} title={(selectedAssignment?.submissions?.length ?? 0) > 0 ? `Submission: ${selectedAssignment?.title}` : `Turn in: ${selectedAssignment?.title}`} position="right" size="lg" padding="md">
                <Stack>
                    <Text size="sm" c="dimmed">{selectedAssignment?.description}</Text>

                    {(selectedAssignment?.submissions?.length ?? 0) > 0 && selectedAssignment?.submissions?.[0]?.feedback && (
                        <Paper p="sm" radius="md" withBorder bg="var(--mantine-color-blue-0)">
                            <Text size="sm" fw={600} mb={4} c="blue">Teacher Feedback:</Text>
                            <Text size="sm" c="dimmed">{selectedAssignment.submissions[0].feedback}</Text>
                        </Paper>
                    )}

                    {!((selectedAssignment?.submissions?.length ?? 0) > 0) && (
                        <FileInput
                            label="Upload File"
                            placeholder="Select file from computer"
                            value={file}
                            onChange={setFile}
                            leftSection={<IconUpload size={14} />}
                            description="Upload your local assignment file here."
                            clearable
                            required={!fileUrl}
                        />
                    )}

                    <TextInput
                        label={(selectedAssignment?.submissions?.length ?? 0) > 0 ? "Attached File URL" : "External URL (Optional)"}
                        placeholder="https://link-to-your-file.pdf"
                        value={fileUrl}
                        onChange={(e) => setFileUrl(e.target.value)}
                        description={(selectedAssignment?.submissions?.length ?? 0) > 0 ? "" : "Or optionally paste a direct web link."}
                        disabled={!!file || (selectedAssignment?.submissions?.length ?? 0) > 0}
                        mt="xs"
                        style={{ display: (selectedAssignment?.submissions?.length ?? 0) > 0 && !fileUrl ? 'none' : 'block' }}
                    />

                    {(selectedAssignment?.submissions?.length ?? 0) > 0 ? (
                        content ? (
                            <div>
                                <Text size="sm" fw={500} mb={4}>Your Text Response</Text>
                                <RichTextEditor editor={editor}>
                                    <RichTextEditor.Content />
                                </RichTextEditor>
                            </div>
                        ) : null
                    ) : (
                        <>
                            <Text ta="center" size="sm" c="dimmed" fw={500} mt="md">OR ADD A TEXT RESPONSE</Text>

                            <div>
                                <Text size="sm" fw={500} mb={4}>Text Response</Text>
                                <RichTextEditor editor={editor}>
                                    <RichTextEditor.Toolbar sticky stickyOffset={60}>
                                        <RichTextEditor.ControlsGroup>
                                            <RichTextEditor.Bold />
                                            <RichTextEditor.Italic />
                                            <RichTextEditor.Strikethrough />
                                            <RichTextEditor.ClearFormatting />
                                        </RichTextEditor.ControlsGroup>
                                        <RichTextEditor.ControlsGroup>
                                            <RichTextEditor.H1 />
                                            <RichTextEditor.H2 />
                                            <RichTextEditor.H3 />
                                        </RichTextEditor.ControlsGroup>
                                        <RichTextEditor.ControlsGroup>
                                            <RichTextEditor.Blockquote />
                                            <RichTextEditor.Hr />
                                            <RichTextEditor.BulletList />
                                            <RichTextEditor.OrderedList />
                                        </RichTextEditor.ControlsGroup>
                                        <RichTextEditor.ControlsGroup>
                                            <RichTextEditor.Link />
                                            <RichTextEditor.Unlink />
                                        </RichTextEditor.ControlsGroup>
                                        <RichTextEditor.ControlsGroup>
                                            <RichTextEditor.AlignLeft />
                                            <RichTextEditor.AlignCenter />
                                            <RichTextEditor.AlignRight />
                                        </RichTextEditor.ControlsGroup>
                                    </RichTextEditor.Toolbar>
                                    <RichTextEditor.Content />
                                </RichTextEditor>
                            </div>
                        </>
                    )}

                    <Group justify="flex-end" mt="xl">
                        <Button variant="default" onClick={close}>{(selectedAssignment?.submissions?.length ?? 0) > 0 ? 'Close' : 'Cancel'}</Button>
                        {!((selectedAssignment?.submissions?.length ?? 0) > 0) && (
                            <Button onClick={handleSubmit} loading={submitMutation.isPending} disabled={!fileUrl && !file && !content.replace(/<[^>]+>/g, '').trim()}>
                                Submit Assignment
                            </Button>
                        )}
                    </Group>
                </Stack>
            </Drawer>
        </Stack>
    );
}

export default StudentAssignments;
