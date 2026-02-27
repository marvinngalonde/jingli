import { Title, Text, Stack, Card, Button, Group, ActionIcon, LoadingOverlay, Table, Badge, Textarea, NumberInput, Tabs, Select, SimpleGrid, Paper, ThemeIcon, Drawer, ScrollArea } from '@mantine/core';
import { IconCheck, IconFileDescription, IconUser, IconChartBar, IconDownload, IconSearch, IconPrinter } from '@tabler/icons-react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../../services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { format } from 'date-fns';

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
        user?: { email: string };
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

interface AssignmentOption {
    value: string;
    label: string;
}

export function TeacherGrading() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const assignmentQuery = searchParams.get('assignment');

    const [pendingSubmissions, setPendingSubmissions] = useState<Submission[]>([]);
    const [assignmentSubmissions, setAssignmentSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string | null>(assignmentQuery ? 'assignment' : 'pending');

    // Assignment selector
    const [assignmentOptions, setAssignmentOptions] = useState<AssignmentOption[]>([]);
    const [selectedAssignment, setSelectedAssignment] = useState<string | null>(assignmentQuery);

    // Grading Drawer
    const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
    const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
    const [marks, setMarks] = useState<number | ''>('');
    const [feedback, setFeedback] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchPending = useCallback(async () => {
        try {
            const { data } = await api.get('/teacher/grading/pending');
            setPendingSubmissions(Array.isArray(data) ? data : []);
        } catch { /* ignore */ }
    }, []);

    const fetchAssignments = useCallback(async () => {
        try {
            const { data } = await api.get('/teacher/assignments');
            setAssignmentOptions((Array.isArray(data) ? data : []).map((a: any) => ({
                value: a.id,
                label: `${a.title} — ${a.subject?.name || ''} (${a.section?.name || ''})`,
            })));
        } catch { /* ignore */ }
    }, []);

    const fetchAssignmentSubs = useCallback(async (assignmentId: string) => {
        try {
            const { data } = await api.get(`/teacher/assignments/${assignmentId}/submissions`);
            setAssignmentSubmissions(Array.isArray(data) ? data : []);
        } catch { notifications.show({ title: 'Error', message: 'Failed to load submissions', color: 'red' }); }
    }, []);

    useEffect(() => {
        (async () => {
            setLoading(true);
            await Promise.all([fetchPending(), fetchAssignments()]);
            if (assignmentQuery) await fetchAssignmentSubs(assignmentQuery);
            setLoading(false);
        })();
    }, []);

    // When assignment selection changes
    useEffect(() => {
        if (selectedAssignment && activeTab === 'assignment') {
            fetchAssignmentSubs(selectedAssignment);
            setSearchParams({ assignment: selectedAssignment });
        }
    }, [selectedAssignment, activeTab]);

    const openGrading = (sub: Submission) => {
        setSelectedSub(sub);
        setMarks(sub.marks ?? '');
        setFeedback(sub.feedback || '');
        openDrawer();
    };

    const handleGrade = async () => {
        if (!selectedSub || marks === '') return;
        setSubmitting(true);
        try {
            await api.post(`/teacher/submissions/${selectedSub.id}/grade`, { marks, feedback });
            notifications.show({ title: 'Graded', message: `${selectedSub.student.firstName}'s submission graded`, color: 'green' });

            setPendingSubmissions(prev => prev.filter(s => s.id !== selectedSub.id));
            setAssignmentSubmissions(prev => prev.map(s =>
                s.id === selectedSub.id ? { ...s, marks: Number(marks), feedback } : s
            ));
            closeDrawer();
        } catch { notifications.show({ title: 'Error', message: 'Failed to save grade', color: 'red' }); }
        finally { setSubmitting(false); }
    };

    // ─── Stats calculations ───
    const assignStats = useMemo(() => {
        const subs = assignmentSubmissions;
        if (subs.length === 0) return null;
        const graded = subs.filter(s => s.marks !== null);
        const pending = subs.filter(s => s.marks === null);
        const marks = graded.map(s => s.marks as number);
        const maxMarks = subs[0]?.assignment?.maxMarks || 100;
        const avg = marks.length > 0 ? (marks.reduce((a, b) => a + b, 0) / marks.length).toFixed(1) : '—';
        const highest = marks.length > 0 ? Math.max(...marks) : 0;
        const lowest = marks.length > 0 ? Math.min(...marks) : 0;
        const passRate = marks.length > 0 ? Math.round((marks.filter(m => m >= maxMarks * 0.5).length / marks.length) * 100) : 0;
        return { total: subs.length, graded: graded.length, pending: pending.length, avg, highest, lowest, passRate, maxMarks };
    }, [assignmentSubmissions]);

    // ─── CSV Export ───
    const exportCSV = () => {
        const subs = assignmentSubmissions;
        if (subs.length === 0) return;
        const header = 'Student,Admission No,Assignment,Subject,Marks,Max Marks,Status,Feedback,Submitted';
        const rows = subs.map(s =>
            `"${s.student.firstName} ${s.student.lastName}","${s.student.admissionNo}","${s.assignment?.title}","${s.assignment?.subject?.name}",${s.marks ?? ''},${s.assignment?.maxMarks},${s.marks !== null ? 'Graded' : 'Pending'},"${(s.feedback || '').replace(/"/g, '""')}","${format(new Date(s.submittedAt), 'yyyy-MM-dd HH:mm')}"`
        );
        const csv = [header, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `grades_${selectedAssignment || 'export'}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // ─── Grouped pending ───
    const groupedPending = useMemo(() => {
        const groups: Record<string, { header: string; submissions: Submission[] }> = {};
        pendingSubmissions.forEach(sub => {
            const key = sub.assignment?.id || 'unknown';
            if (!groups[key]) {
                groups[key] = {
                    header: sub.assignment
                        ? `${sub.assignment.title} — ${sub.assignment.section?.name} (${sub.assignment.subject?.name})`
                        : 'Unknown Assignment',
                    submissions: [],
                };
            }
            groups[key].submissions.push(sub);
        });
        return groups;
    }, [pendingSubmissions]);

    return (
        <Stack gap="lg" pos="relative" mb="xl">
            {/* Print styles injected directly */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    .no-print { display: none !important; }
                    .print-only { display: block !important; }
                    body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .mantine-AppShell-navbar, .mantine-AppShell-header, .mantine-Tabs-list { display: none !important; }
                    .mantine-AppShell-main { padding: 0 !important; width: 100% !important; margin: 0 !important; }
                    @page { margin: 20mm; }
                }
            `}} />

            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />

            <Group justify="space-between">
                <div>
                    <Title order={2}>Grading Center</Title>
                    <Text c="dimmed" size="sm">Review submissions, enter marks, and provide feedback.</Text>
                </div>
            </Group>

            {/* ═══════════ TABS ═══════════ */}
            <Tabs value={activeTab} onChange={setActiveTab}>
                <Tabs.List>
                    <Tabs.Tab value="pending" leftSection={<IconFileDescription size={16} />}>
                        Needs Grading <Badge size="xs" color="orange" variant="filled" ml={4}>{pendingSubmissions.length}</Badge>
                    </Tabs.Tab>
                    <Tabs.Tab value="assignment" leftSection={<IconChartBar size={16} />}>
                        By Assignment
                    </Tabs.Tab>
                </Tabs.List>

                {/* ─── PENDING TAB ─── */}
                <Tabs.Panel value="pending" pt="md">
                    {pendingSubmissions.length === 0 ? (
                        <Stack align="center" p="xl">
                            <ThemeIcon size={60} variant="light" color="green" radius="xl"><IconCheck size={30} /></ThemeIcon>
                            <Title order={4}>All Caught Up!</Title>
                            <Text c="dimmed" size="sm">No submissions waiting for grading.</Text>
                        </Stack>
                    ) : (
                        <Stack gap="lg">
                            {Object.values(groupedPending).map((group, idx) => (
                                <Card key={idx} withBorder radius="md" p={0}>
                                    <Group p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)', backgroundColor: 'var(--mantine-color-gray-0)' }}>
                                        <IconFileDescription size={18} color="var(--mantine-color-brand-6)" />
                                        <Text fw={600} size="sm">{group.header}</Text>
                                        <Badge ml="auto" color="orange">{group.submissions.length} pending</Badge>
                                    </Group>
                                    <ScrollArea>
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
                                                {group.submissions.map(s => (
                                                    <Table.Tr key={s.id}>
                                                        <Table.Td>
                                                            <Group gap="sm">
                                                                <ActionIcon variant="light" radius="xl" size="lg"><IconUser size={18} /></ActionIcon>
                                                                <div>
                                                                    <Text size="sm" fw={500}>{s.student.firstName} {s.student.lastName}</Text>
                                                                    <Text size="xs" c="dimmed">{s.student.admissionNo}</Text>
                                                                </div>
                                                            </Group>
                                                        </Table.Td>
                                                        <Table.Td><Text size="sm">{format(new Date(s.submittedAt), 'MMM dd, hh:mm a')}</Text></Table.Td>
                                                        <Table.Td><Badge color="orange" variant="light">Needs Grading</Badge></Table.Td>
                                                        <Table.Td style={{ textAlign: 'right' }}>
                                                            <Button variant="light" size="xs" onClick={() => openGrading(s)}>Grade</Button>
                                                        </Table.Td>
                                                    </Table.Tr>
                                                ))}
                                            </Table.Tbody>
                                        </Table>
                                    </ScrollArea>
                                </Card>
                            ))}
                        </Stack>
                    )}
                </Tabs.Panel>

                {/* ─── BY ASSIGNMENT TAB ─── */}
                <Tabs.Panel value="assignment" pt="md">
                    <Group justify="space-between" mb="md">
                        <Select
                            placeholder="Select an assignment to view submissions..."
                            data={assignmentOptions}
                            value={selectedAssignment}
                            onChange={setSelectedAssignment}
                            searchable
                            style={{ minWidth: 350 }}
                        />
                        {assignmentSubmissions.length > 0 && (
                            <Group className="no-print">
                                <Button variant="light" color="gray" leftSection={<IconPrinter size={16} />} onClick={() => window.print()}>Print / Save PDF</Button>
                                <Button variant="light" leftSection={<IconDownload size={16} />} onClick={exportCSV}>Export CSV</Button>
                            </Group>
                        )}
                    </Group>

                    {/* Stats Panel */}
                    {assignStats && (
                        <SimpleGrid cols={{ base: 2, md: 5 }} mb="md">
                            <Paper p="md" radius="md" shadow="sm" withBorder>
                                <Text size="xs" c="dimmed">Total</Text>
                                <Text fw={700} size="lg">{assignStats.total}</Text>
                            </Paper>
                            <Paper p="md" radius="md" shadow="sm" withBorder>
                                <Text size="xs" c="dimmed">Graded</Text>
                                <Text fw={700} size="lg" c="green">{assignStats.graded}</Text>
                            </Paper>
                            <Paper p="md" radius="md" shadow="sm" withBorder>
                                <Text size="xs" c="dimmed">Average</Text>
                                <Text fw={700} size="lg">{assignStats.avg} / {assignStats.maxMarks}</Text>
                            </Paper>
                            <Paper p="md" radius="md" shadow="sm" withBorder>
                                <Text size="xs" c="dimmed">Highest / Lowest</Text>
                                <Text fw={700} size="lg">{assignStats.highest} / {assignStats.lowest}</Text>
                            </Paper>
                            <Paper p="md" radius="md" shadow="sm" withBorder>
                                <Text size="xs" c="dimmed">Pass Rate</Text>
                                <Text fw={700} size="lg" c={assignStats.passRate >= 50 ? 'green' : 'red'}>{assignStats.passRate}%</Text>
                            </Paper>
                        </SimpleGrid>
                    )}

                    {!selectedAssignment ? (
                        <Stack align="center" p="xl">
                            <ThemeIcon size={60} variant="light" color="blue" radius="xl"><IconSearch size={30} /></ThemeIcon>
                            <Title order={4}>Select an Assignment</Title>
                            <Text c="dimmed" size="sm">Choose an assignment above to view all submissions and grade statistics.</Text>
                        </Stack>
                    ) : assignmentSubmissions.length === 0 ? (
                        <Text ta="center" c="dimmed" p="xl">No submissions for this assignment yet.</Text>
                    ) : (
                        <Card withBorder radius="md" p={0}>
                            <ScrollArea>
                                <Table verticalSpacing="md" striped highlightOnHover>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>Student</Table.Th>
                                            <Table.Th>Submitted</Table.Th>
                                            <Table.Th>Score</Table.Th>
                                            <Table.Th>Status</Table.Th>
                                            <Table.Th style={{ textAlign: 'right' }}>Action</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {assignmentSubmissions.map(s => (
                                            <Table.Tr key={s.id}>
                                                <Table.Td>
                                                    <Group gap="sm">
                                                        <ActionIcon variant="light" radius="xl" size="lg"><IconUser size={18} /></ActionIcon>
                                                        <div>
                                                            <Text size="sm" fw={500}>{s.student.firstName} {s.student.lastName}</Text>
                                                            <Text size="xs" c="dimmed">{s.student.admissionNo}</Text>
                                                        </div>
                                                    </Group>
                                                </Table.Td>
                                                <Table.Td><Text size="sm">{format(new Date(s.submittedAt), 'MMM dd, hh:mm a')}</Text></Table.Td>
                                                <Table.Td>
                                                    {s.marks !== null ? (
                                                        <Badge color="green" variant="filled">{s.marks} / {s.assignment?.maxMarks}</Badge>
                                                    ) : (
                                                        <Text size="sm" c="dimmed">—</Text>
                                                    )}
                                                </Table.Td>
                                                <Table.Td>
                                                    <Badge color={s.marks !== null ? 'green' : 'orange'} variant="light">
                                                        {s.marks !== null ? 'Graded' : 'Pending'}
                                                    </Badge>
                                                </Table.Td>
                                                <Table.Td style={{ textAlign: 'right' }} className="no-print">
                                                    <Button variant={s.marks !== null ? 'subtle' : 'light'} size="xs" onClick={() => openGrading(s)}>
                                                        {s.marks !== null ? 'Re-Grade' : 'Grade'}
                                                    </Button>
                                                </Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>
                            </ScrollArea>
                        </Card>
                    )}
                </Tabs.Panel>
            </Tabs>

            {/* ═══════════ GRADING DRAWER ═══════════ */}
            <Drawer opened={drawerOpened} onClose={closeDrawer} title="Grade Submission" position="right" size="md" padding="lg">
                {selectedSub && (
                    <Stack gap="md">
                        <Group justify="space-between" align="flex-start">
                            <div>
                                <Text fw={600} size="lg">{selectedSub.student.firstName} {selectedSub.student.lastName}</Text>
                                <Text c="dimmed" size="sm">{selectedSub.student.admissionNo}</Text>
                            </div>
                            <Badge size="lg" variant="light" color="blue">Max: {selectedSub.assignment?.maxMarks || 100}</Badge>
                        </Group>

                        <Paper p="sm" radius="md" withBorder>
                            <Text size="sm" fw={500}>{selectedSub.assignment?.title}</Text>
                            <Group gap="xs" mt={4}>
                                <Badge size="xs" variant="light">{selectedSub.assignment?.subject?.name}</Badge>
                                <Badge size="xs" variant="outline">{selectedSub.assignment?.section?.name}</Badge>
                                <Badge size="xs" variant="dot">{selectedSub.assignment?.type}</Badge>
                            </Group>
                        </Paper>

                        {selectedSub.fileUrl && (
                            <Paper p="sm" radius="md" withBorder>
                                <Group justify="space-between">
                                    <Text size="sm"><IconFileDescription size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />Attached File</Text>
                                    <Button variant="light" size="xs" component="a" href={selectedSub.fileUrl} target="_blank">View File</Button>
                                </Group>
                            </Paper>
                        )}

                        <NumberInput
                            label="Marks Awarded"
                            placeholder="Enter score"
                            value={marks}
                            onChange={v => setMarks(typeof v === 'number' ? v : (v === '' ? '' : Number(v)))}
                            min={0}
                            max={selectedSub.assignment?.maxMarks || 100}
                            required
                            size="md"
                        />

                        <Textarea
                            label="Feedback / Comments"
                            placeholder="Great work on... / Could improve by..."
                            value={feedback}
                            onChange={e => setFeedback(e.currentTarget.value)}
                            minRows={4}
                        />

                        <Group justify="flex-end" mt="md">
                            <Button variant="default" onClick={closeDrawer}>Cancel</Button>
                            <Button color="green" onClick={handleGrade} loading={submitting} disabled={marks === ''}>
                                {selectedSub.marks !== null ? 'Update Grade' : 'Submit Grade'}
                            </Button>
                        </Group>
                    </Stack>
                )}
            </Drawer>
        </Stack>
    );
}

export default TeacherGrading;
