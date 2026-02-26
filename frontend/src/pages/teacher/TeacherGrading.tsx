import { Title, Text, Stack, Card, Button, Group, ActionIcon, LoadingOverlay, Table, Badge, Modal, Textarea, NumberInput, Tabs } from '@mantine/core';
import { IconArrowLeft, IconCheck, IconFileDescription, IconUser } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';
import { format } from 'date-fns';
import { useMemo } from 'react';

interface Submission {
    id: string;
    submittedAt: string;
    fileUrl: string | null;
    marks: number | null;
    feedback: string | null;
    student: {
        firstName: string;
        lastName: string;
        admissionNo: string;
        user: { email: string };
    };
    assignment: {
        id: string;
        title: string;
        maxMarks: number;
        type: string;
        subject: { name: string; code: string };
        section: { name: string };
    };
}

export function TeacherGrading() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const assignmentQuery = searchParams.get('assignment');

    const [pendingSubmissions, setPendingSubmissions] = useState<Submission[]>([]);
    const [assignmentSubmissions, setAssignmentSubmissions] = useState<Submission[]>([]);

    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string | null>(assignmentQuery ? 'assignment' : 'pending');

    // Grading Modal State
    const [opened, { open, close }] = useDisclosure(false);
    const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
    const [marks, setMarks] = useState<number | ''>('');
    const [feedback, setFeedback] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (assignmentQuery) {
                    const { data } = await api.get(`/teacher/assignments/${assignmentQuery}/submissions`);
                    setAssignmentSubmissions(data);
                    // Fetch corresponding assignment details (mocked by getting from first sub for now, or just fetching pending)
                    const pendingRes = await api.get('/teacher/grading/pending');
                    setPendingSubmissions(pendingRes.data);
                } else {
                    const { data } = await api.get('/teacher/grading/pending');
                    setPendingSubmissions(data);
                }
            } catch (error) {
                console.error("Failed to fetch grading data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [assignmentQuery]);

    const openGrading = (sub: Submission) => {
        setSelectedSub(sub);
        setMarks(sub.marks ?? '');
        setFeedback(sub.feedback || '');
        open();
    };

    const handleGrade = async () => {
        if (!selectedSub || marks === '') return;
        setSubmitting(true);
        try {
            await api.post(`/teacher/submissions/${selectedSub.id}/grade`, {
                marks,
                feedback
            });

            // Remove from pending locally
            setPendingSubmissions(pendingSubmissions.filter(s => s.id !== selectedSub.id));

            // Update in assignment submissions if exists
            setAssignmentSubmissions(assignmentSubmissions.map(s =>
                s.id === selectedSub.id ? { ...s, marks: Number(marks), feedback } : s
            ));

            close();
        } catch (error) {
            console.error("Failed to grade", error);
        } finally {
            setSubmitting(false);
        }
    };

    const groupedPending = useMemo(() => {
        const groups: Record<string, { assignmentHeader: string; submissions: Submission[] }> = {};
        pendingSubmissions.forEach(sub => {
            const key = sub.assignment ? sub.assignment.id : 'unknown';
            if (!groups[key]) {
                groups[key] = {
                    assignmentHeader: sub.assignment
                        ? `${sub.assignment.title} - ${sub.assignment.section.name} (${sub.assignment.subject.name})`
                        : 'Unknown Assignment',
                    submissions: []
                };
            }
            groups[key].submissions.push(sub);
        });
        return groups;
    }, [pendingSubmissions]);

    const renderSubmissionList = (submissions: Submission[], isPendingView: boolean = false) => {
        if (submissions.length === 0) {
            return <Text p="xl" ta="center" c="dimmed" fs="italic">No submissions found.</Text>;
        }

        if (isPendingView) {
            return (
                <Stack gap="xl">
                    {Object.values(groupedPending).map((group, idx) => (
                        <Card key={idx} withBorder radius="md" p={0}>
                            <Group p="md" style={{ borderBottom: '1px solid var(--app-border-light)', backgroundColor: 'var(--app-surface-dim)' }}>
                                <IconFileDescription size={20} color="var(--mantine-color-brand-6)" />
                                <Title order={5}>{group.assignmentHeader}</Title>
                                <Badge ml="auto" color="orange">{group.submissions.length} Pending</Badge>
                            </Group>
                            <Table verticalSpacing="md" striped highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Student</Table.Th>
                                        <Table.Th>Submitted</Table.Th>
                                        <Table.Th>Status</Table.Th>
                                        <Table.Th style={{ textAlign: 'right' }}>Action</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {group.submissions.map((s) => (
                                        <Table.Tr key={s.id}>
                                            <Table.Td>
                                                <Group gap="sm">
                                                    <ActionIcon variant="light" radius="xl" size="lg">
                                                        <IconUser size={20} />
                                                    </ActionIcon>
                                                    <div>
                                                        <Text size="sm" fw={500}>{s.student.firstName} {s.student.lastName}</Text>
                                                        <Text size="xs" c="dimmed">{s.student.admissionNo}</Text>
                                                    </div>
                                                </Group>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm">{format(new Date(s.submittedAt), 'MMM dd, hh:mm a')}</Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Badge color="orange" variant="light">Needs Grading</Badge>
                                            </Table.Td>
                                            <Table.Td style={{ textAlign: 'right' }}>
                                                <Button variant="light" size="xs" onClick={() => openGrading(s)}>Grade</Button>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        </Card>
                    ))}
                </Stack>
            );
        }

        return (
            <Card withBorder radius="md" p={0}>
                <Table verticalSpacing="md" striped highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Student</Table.Th>
                            <Table.Th>Submitted</Table.Th>
                            <Table.Th>Status/Score</Table.Th>
                            <Table.Th style={{ textAlign: 'right' }}>Action</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {submissions.map((s) => (
                            <Table.Tr key={s.id}>
                                <Table.Td>
                                    <Group gap="sm">
                                        <ActionIcon variant="light" radius="xl" size="lg">
                                            <IconUser size={20} />
                                        </ActionIcon>
                                        <div>
                                            <Text size="sm" fw={500}>{s.student.firstName} {s.student.lastName}</Text>
                                            <Text size="xs" c="dimmed">{s.student.admissionNo}</Text>
                                        </div>
                                    </Group>
                                </Table.Td>
                                <Table.Td>
                                    <Text size="sm" fw={500}>{s.assignment?.title || 'Unknown'}</Text>
                                    {s.assignment && (
                                        <Group gap="xs" mt={4}>
                                            <Badge size="xs" variant="light" color="blue">{s.assignment.subject.name}</Badge>
                                            <Badge size="xs" variant="outline">{s.assignment.section.name}</Badge>
                                        </Group>
                                    )}
                                </Table.Td>
                                <Table.Td>
                                    <Text size="sm">{format(new Date(s.submittedAt), 'MMM dd, hh:mm a')}</Text>
                                </Table.Td>
                                <Table.Td>
                                    {s.marks !== null ? (
                                        <Badge color="green" variant="filled">{s.marks} / {s.assignment?.maxMarks || 100}</Badge>
                                    ) : (
                                        <Badge color="orange" variant="light">Needs Grading</Badge>
                                    )}
                                </Table.Td>
                                <Table.Td style={{ textAlign: 'right' }}>
                                    {s.marks === null ? (
                                        <Button variant="light" size="xs" onClick={() => openGrading(s)}>Grade</Button>
                                    ) : (
                                        <Button variant="subtle" size="xs" onClick={() => openGrading(s)}>Edit Grade</Button>
                                    )}
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </Card>
        );
    };

    return (
        <Stack gap="lg" pos="relative">
            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

            <Group justify="space-between">
                <Group>
                  
                    <div>
                        <Title order={2}>Grading Center</Title>
                        <Text c="dimmed">Review submissions and enter marks.</Text>
                    </div>
                </Group>
            </Group>

            <Card withBorder radius="md" p={0}>
                <Tabs value={activeTab} onChange={setActiveTab} mt="md">
                    <Tabs.List>
                        <Tabs.Tab value="pending" leftSection={<IconFileDescription size={14} />}>
                            Needs Grading <Badge size="xs" color="orange" circle>{pendingSubmissions.length}</Badge>
                        </Tabs.Tab>
                        {assignmentQuery && (
                            <Tabs.Tab value="assignment" leftSection={<IconCheck size={14} />}>
                                Assignment Context
                            </Tabs.Tab>
                        )}
                    </Tabs.List>

                    <Tabs.Panel value="pending" pt="md">
                        {renderSubmissionList(pendingSubmissions, true)}
                    </Tabs.Panel>

                    <Tabs.Panel value="assignment" pt="md">
                        <Card withBorder radius="md" p={0}>
                            {renderSubmissionList(assignmentSubmissions, false)}
                        </Card>
                    </Tabs.Panel>
                </Tabs>
            </Card>

            <Modal opened={opened} onClose={close} title="Grade Submission" centered size="lg">
                <Stack gap="md">
                    {selectedSub && (
                        <>
                            <Group justify="space-between" align="flex-start">
                                <div>
                                    <Text fw={500} size="lg">{selectedSub.student.firstName} {selectedSub.student.lastName}</Text>
                                    <Text c="dimmed" size="sm">{selectedSub.assignment?.title}</Text>
                                </div>
                                <Badge size="lg" variant="light" color="blue">Max: {selectedSub.assignment?.maxMarks || 100}</Badge>
                            </Group>

                            {selectedSub.fileUrl && (
                                <Card padding="xs" radius="sm" withBorder>
                                    <Group justify="space-between">
                                        <Text size="sm"><IconFileDescription size={16} style={{ verticalAlign: 'middle', marginRight: 8 }} /> Attached File</Text>
                                        <Button variant="light" size="xs" component="a" href={selectedSub.fileUrl} target="_blank">View File</Button>
                                    </Group>
                                </Card>
                            )}

                            <Group grow>
                                <NumberInput
                                    label="Marks Awarded"
                                    placeholder="Enter score"
                                    value={marks}
                                    onChange={(v) => setMarks(typeof v === 'number' ? v : (v === '' ? '' : Number(v)))}
                                    min={0}
                                    max={selectedSub.assignment?.maxMarks || 100}
                                    required
                                    size="md"
                                />
                            </Group>
                            <Textarea
                                label="Feedback / Comments"
                                placeholder="Great work on..."
                                value={feedback}
                                onChange={(e) => setFeedback(e.currentTarget.value)}
                                minRows={4}
                            />

                            <Group justify="flex-end" mt="md">
                                <Button variant="default" onClick={close}>Cancel</Button>
                                <Button color="green" onClick={handleGrade} loading={submitting} disabled={marks === ''}>Submit Grade</Button>
                            </Group>
                        </>
                    )}
                </Stack>
            </Modal>
        </Stack>
    );
}

export default TeacherGrading;
