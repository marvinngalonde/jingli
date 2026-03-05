import { Title, Text, Stack, Button, Group, ActionIcon, LoadingOverlay, Table, Badge, TextInput, Select, NumberInput, Tabs, Drawer, Card, ThemeIcon, Textarea, ScrollArea, SimpleGrid, Paper, Modal } from '@mantine/core';
import { IconPlus, IconClipboardList, IconTrash, IconEye, IconEdit, IconSearch, IconAlertTriangle, IconClipboardCheck } from '@tabler/icons-react';
import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { format, isPast } from 'date-fns';

interface Assignment {
    id: string;
    title: string;
    description: string | null;
    dueDate: string;
    maxMarks: number;
    type: string;
    subject: { name: string; code: string };
    section?: { name: string; classLevel?: { name: string } };
    _count: { submissions: number };
}

interface CalaRecord {
    id: string;
    title: string;
    task: string;
    competency: string;
    maxMarks: number;
    marks?: number;
    comment?: string;
    subject: { id: string; name: string };
    student: { id: string; firstName: string; lastName: string; admissionNo: string };
    term?: { id: string; name: string };
    createdAt: string;
}

const ASSIGNMENT_TYPES = [
    { value: 'HOMEWORK', label: 'Homework' },
    { value: 'CLASSWORK', label: 'Classwork' },
    { value: 'PROJECT', label: 'Project' },
    { value: 'QUIZ', label: 'Quiz' },
    { value: 'EXAM', label: 'Exam' },
    { value: 'CALA', label: 'CALA' },
];

export function TeacherAssignments() {
    const queryClient = useQueryClient();
    const { sectionId } = useParams();
    const navigate = useNavigate();

    const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Assignment Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [maxMarks, setMaxMarks] = useState<number | ''>(100);
    const [type, setType] = useState('HOMEWORK');
    const [subjectId, setSubjectId] = useState('');
    const [selectedGlobalSectionId, setSelectedGlobalSectionId] = useState<string | null>(null);

    // ─── CALA state ───
    const [calaDrawerOpened, { open: openCalaDrawer, close: closeCalaDrawer }] = useDisclosure(false);
    const [calaEditingId, setCalaEditingId] = useState<string | null>(null);
    const [calaDeleteTarget, setCalaDeleteTarget] = useState<{ id: string; title: string } | null>(null);

    // CALA Form state
    const [calaTaskName, setCalaTaskName] = useState('');
    const [calaScore, setCalaScore] = useState<number | ''>('');
    const [calaMaxMarks, setCalaMaxMarks] = useState<number | ''>(50);
    const [calaSubjectId, setCalaSubjectId] = useState('');
    const [calaStudentId, setCalaStudentId] = useState('');
    const [calaTermId, setCalaTermId] = useState('');
    const [calaDate, setCalaDate] = useState('');
    const [calaTeacherRemarks, setCalaTeacherRemarks] = useState('');

    // CALA Filters
    const [calaClassFilter, setCalaClassFilter] = useState<string | null>(null);
    const [calaSubjectFilter, setCalaSubjectFilter] = useState<string | null>(null);

    // ─── Active Tab ───
    const [activeTab, setActiveTab] = useState<string | null>('assignments');

    // ─── Queries ───
    const { data: classesData = [], isLoading: classesLoading } = useQuery({
        queryKey: ['teacherClasses'],
        queryFn: () => api.get('/teacher/classes').then(res => res.data)
    });

    const { data: assignmentsData = [], isLoading: assignmentsLoading } = useQuery({
        queryKey: ['teacherAssignments', sectionId],
        queryFn: () => {
            if (sectionId) return api.get(`/teacher/classes/${sectionId}/assignments`).then(res => res.data);
            return api.get('/teacher/assignments').then(res => res.data);
        }
    });

    const { data: calaData = [], isLoading: calaLoading } = useQuery({
        queryKey: ['teacherCala'],
        queryFn: () => api.get('/cala').then(res => Array.isArray(res.data) ? res.data : []),
        enabled: activeTab === 'cala'
    });

    const assignments = assignmentsData as Assignment[];
    const calaRecords = calaData as CalaRecord[];
    const loading = classesLoading || assignmentsLoading;

    // ─── Derived Dropdowns ───
    const availableClasses = useMemo(() => {
        if (sectionId) return [];
        return classesData.map((c: any) => ({ value: c.section.id, label: `${c.section.classLevel.name} ${c.section.classLevel.level ?? ""} ${c.section.name}` }));
    }, [classesData, sectionId]);

    const targetSectionId = activeTab === 'cala' && calaClassFilter ? calaClassFilter : (sectionId || selectedGlobalSectionId);

    const { data: studentsData = [] } = useQuery({
        queryKey: ['teacherClassStudents', targetSectionId],
        queryFn: () => api.get(`/teacher/classes/${targetSectionId}/students`).then(res => res.data),
        enabled: !!targetSectionId
    });

    const { data: termsData = [] } = useQuery({
        queryKey: ['examTerms'],
        queryFn: () => api.get('/exams/terms').then(res => Array.isArray(res.data) ? res.data : [])
    });

    const availableStudents = useMemo(() => studentsData.map((s: any) => ({ value: s.id, label: `${s.firstName} ${s.lastName} (${s.admissionNo})` })), [studentsData]);
    const availableTerms = useMemo(() => termsData.map((t: any) => ({ value: t.id, label: t.name })), [termsData]);

    const availableSubjects = useMemo(() => {
        if (!targetSectionId) return [];
        const cls = classesData.find((c: any) => c.section.id === targetSectionId);
        if (cls) return cls.subjects.map((s: any) => ({ value: s.id, label: `${s.name} (${s.code})` }));
        return [];
    }, [classesData, targetSectionId]);

    useEffect(() => {
        if (availableSubjects.length > 0 && !subjectId && !editingId && activeTab === 'assignments') {
            setSubjectId(availableSubjects[0].value);
        }
    }, [availableSubjects, subjectId, editingId, activeTab]);

    // ─── Assignment CRUD ───
    const resetAssignmentForm = () => { setTitle(''); setDescription(''); setDueDate(''); setMaxMarks(100); setType('HOMEWORK'); setSubjectId(''); setEditingId(null); if (!sectionId) setSelectedGlobalSectionId(null); };

    const openCreateAssignment = () => { resetAssignmentForm(); openDrawer(); };

    const openEditAssignment = (a: Assignment) => {
        setEditingId(a.id);
        setTitle(a.title);
        setDescription(a.description || '');
        setDueDate(a.dueDate ? format(new Date(a.dueDate), 'yyyy-MM-dd') : '');
        setMaxMarks(a.maxMarks);
        setType(a.type);
        openDrawer();
    };

    const saveAssignmentMutation = useMutation({
        mutationFn: async () => {
            const target = sectionId || selectedGlobalSectionId;
            if (editingId) {
                return api.patch(`/assignments/${editingId}`, { title, description, dueDate, maxMarks, type });
            } else {
                if (!subjectId || !target) throw new Error('Missing target segment');
                return api.post(`/teacher/classes/${target}/assignments`, { title, description, dueDate, maxMarks, type, subjectId });
            }
        },
        onSuccess: () => {
            notifications.show({ title: 'Success', message: `Assignment ${editingId ? 'updated' : 'created'}`, color: 'green' });
            closeDrawer();
            resetAssignmentForm();
            queryClient.invalidateQueries({ queryKey: ['teacherAssignments'] });
        },
        onError: () => {
            notifications.show({ title: 'Error', message: 'Failed to save assignment', color: 'red' });
        }
    });

    const handleSaveAssignment = () => {
        if (!title || !dueDate || maxMarks === '') return;
        saveAssignmentMutation.mutate();
    };

    const deleteAssignmentMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/teacher/assignments/${id}`),
        onSuccess: () => {
            notifications.show({ title: 'Deleted', message: `"${deleteTarget?.title}" deleted`, color: 'orange' });
            queryClient.invalidateQueries({ queryKey: ['teacherAssignments'] });
            setDeleteTarget(null);
        },
        onError: () => {
            notifications.show({ title: 'Error', message: 'Failed to delete', color: 'red' });
            setDeleteTarget(null);
        }
    });

    const handleDeleteAssignment = () => {
        if (!deleteTarget) return;
        deleteAssignmentMutation.mutate(deleteTarget.id);
    };

    // ─── CALA CRUD ───
    const resetCalaForm = () => { setCalaTaskName(''); setCalaScore(''); setCalaDate(''); setCalaTeacherRemarks(''); setCalaMaxMarks(50); setCalaSubjectId(''); setCalaStudentId(''); setCalaTermId(''); setCalaEditingId(null); };

    const openCreateCala = () => { resetCalaForm(); openCalaDrawer(); };

    const openEditCala = (c: CalaRecord) => {
        setCalaEditingId(c.id);
        setCalaTaskName(c.taskName || c.title || '');
        setCalaScore(c.score || c.marks || '');
        setCalaMaxMarks(c.maxScore || c.maxMarks || 50);
        setCalaSubjectId(c.subject?.id || '');
        setCalaStudentId(c.student?.id || '');
        setCalaTermId(c.term?.id || '');
        setCalaDate(c.date ? new Date(c.date).toISOString().split('T')[0] : '');
        setCalaTeacherRemarks(c.teacherRemarks || c.comment || '');
        openCalaDrawer();
    };

    const saveCalaMutation = useMutation({
        mutationFn: async () => {
            const payload = {
                taskName: calaTaskName,
                score: Number(calaScore),
                maxScore: Number(calaMaxMarks),
                subjectId: calaSubjectId,
                studentId: calaStudentId,
                termId: calaTermId,
                date: calaDate,
                teacherRemarks: calaTeacherRemarks
            };
            if (calaEditingId) return api.patch(`/cala/${calaEditingId}`, payload);
            return api.post('/cala', payload);
        },
        onSuccess: () => {
            notifications.show({ title: 'Success', message: `CALA ${calaEditingId ? 'updated' : 'created'}`, color: 'green' });
            closeCalaDrawer();
            resetCalaForm();
            queryClient.invalidateQueries({ queryKey: ['teacherCala'] });
        },
        onError: () => {
            notifications.show({ title: 'Error', message: 'Failed to save CALA record', color: 'red' });
        }
    });

    const handleSaveCala = () => {
        if (!calaTaskName || calaScore === '' || calaMaxMarks === '' || !calaStudentId || !calaTermId || !calaDate) return;
        saveCalaMutation.mutate();
    };

    const deleteCalaMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/cala/${id}`),
        onSuccess: () => {
            notifications.show({ title: 'Deleted', message: `"${calaDeleteTarget?.title}" deleted`, color: 'orange' });
            queryClient.invalidateQueries({ queryKey: ['teacherCala'] });
            setCalaDeleteTarget(null);
        },
        onError: () => {
            notifications.show({ title: 'Error', message: 'Failed to delete', color: 'red' });
            setCalaDeleteTarget(null);
        }
    });

    const handleDeleteCala = () => {
        if (!calaDeleteTarget) return;
        deleteCalaMutation.mutate(calaDeleteTarget.id);
    };

    // ─── Filter ───
    const filteredAssignments = assignments.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()));
    const overdueCount = assignments.filter(a => isPast(new Date(a.dueDate))).length;

    const filteredCalaRecords = calaRecords.filter(c => {
        let matchSubject = true;
        let matchClass = true;
        if (calaSubjectFilter) {
            matchSubject = c.subject?.id === calaSubjectFilter;
        }
        if (calaClassFilter && availableStudents.length > 0) {
            matchClass = availableStudents.some(s => s.value === c.student?.id);
        }
        return matchSubject && matchClass;
    });

    return (
        <Stack gap="lg" pos="relative">
            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />

            <Group justify="space-between">
                <div>
                    <Title order={2}>Assignments & CALA</Title>
                    <Text c="dimmed" size="sm">Manage assignments, projects, and Continuous Assessment Learning Activities.</Text>
                </div>
            </Group>

            {/* Stats Cards */}
            <SimpleGrid cols={{ base: 2, md: 4 }}>
                <Paper p="md" radius="md" shadow="sm" withBorder>
                    <Group>
                        <ThemeIcon variant="light" color="blue" size="lg"><IconClipboardList size={18} /></ThemeIcon>
                        <div>
                            <Text size="xs" c="dimmed">Total Assignments</Text>
                            <Text fw={700} size="lg">{assignments.length}</Text>
                        </div>
                    </Group>
                </Paper>
                <Paper p="md" radius="md" shadow="sm" withBorder>
                    <Group>
                        <ThemeIcon variant="light" color="red" size="lg"><IconAlertTriangle size={18} /></ThemeIcon>
                        <div>
                            <Text size="xs" c="dimmed">Overdue</Text>
                            <Text fw={700} size="lg" c="red">{overdueCount}</Text>
                        </div>
                    </Group>
                </Paper>
                <Paper p="md" radius="md" shadow="sm" withBorder>
                    <Group>
                        <ThemeIcon variant="light" color="green" size="lg"><IconClipboardCheck size={18} /></ThemeIcon>
                        <div>
                            <Text size="xs" c="dimmed">CALA Records</Text>
                            <Text fw={700} size="lg">{filteredCalaRecords.length}</Text>
                        </div>
                    </Group>
                </Paper>
                <Paper p="md" radius="md" shadow="sm" withBorder>
                    <Group>
                        <ThemeIcon variant="light" color="orange" size="lg"><IconEye size={18} /></ThemeIcon>
                        <div>
                            <Text size="xs" c="dimmed">Total Submissions</Text>
                            <Text fw={700} size="lg">{assignments.reduce((s, a) => s + a._count.submissions, 0)}</Text>
                        </div>
                    </Group>
                </Paper>
            </SimpleGrid>

            {/* Tabs */}
            <Tabs value={activeTab} onChange={setActiveTab}>
                <Tabs.List>
                    <Tabs.Tab value="assignments" leftSection={<IconClipboardList size={16} />}>
                        Assignments <Badge size="xs" variant="filled" ml={4}>{assignments.length}</Badge>
                    </Tabs.Tab>
                    <Tabs.Tab value="cala" leftSection={<IconClipboardCheck size={16} />}>
                        CALA Records <Badge size="xs" variant="filled" color="green" ml={4}>{filteredCalaRecords.length}</Badge>
                    </Tabs.Tab>
                </Tabs.List>

                {/* ═══════════ ASSIGNMENTS TAB ═══════════ */}
                <Tabs.Panel value="assignments" pt="md">
                    <Group justify="space-between" mb="md">
                        <TextInput placeholder="Search assignments..." leftSection={<IconSearch size={16} />} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ minWidth: 250 }} />
                        <Button leftSection={<IconPlus size={16} />} onClick={openCreateAssignment}>Create Assignment</Button>
                    </Group>

                    <Card withBorder radius="md" p={0}>
                        {filteredAssignments.length === 0 && !loading ? (
                            <Text p="xl" ta="center" c="dimmed" fs="italic">No assignments found.</Text>
                        ) : (
                            <ScrollArea>
                                <Table verticalSpacing="md" striped highlightOnHover>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>Assignment</Table.Th>
                                            <Table.Th>Subject</Table.Th>
                                            <Table.Th>Type</Table.Th>
                                            <Table.Th>Due Date</Table.Th>
                                            <Table.Th>Submissions</Table.Th>
                                            <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {filteredAssignments.map(a => {
                                            const overdue = isPast(new Date(a.dueDate));
                                            const typeColor = a.type === 'EXAM' ? 'red' : a.type === 'CALA' ? 'green' : a.type === 'PROJECT' ? 'orange' : 'blue';
                                            return (
                                                <Table.Tr key={a.id}>
                                                    <Table.Td>
                                                        <Group gap="sm">
                                                            <ThemeIcon variant="light" color={typeColor} size="lg" radius="md">
                                                                <IconClipboardList size={18} />
                                                            </ThemeIcon>
                                                            <div>
                                                                <Text size="sm" fw={500}>{a.title}</Text>
                                                                <Text size="xs" c="dimmed">{a.maxMarks} marks</Text>
                                                            </div>
                                                        </Group>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Group gap="xs">
                                                            <Badge variant="light" color="grape">{a.subject?.name || '—'}</Badge>
                                                            {!sectionId && a.section && (
                                                                <Badge variant="outline" color="gray" size="xs">{a.section.classLevel?.name} {a.section.classLevel?.level ?? ''} {a.section.name}</Badge>
                                                            )}
                                                        </Group>
                                                    </Table.Td>
                                                    <Table.Td><Badge variant="dot" color={typeColor}>{a.type}</Badge></Table.Td>
                                                    <Table.Td>
                                                        <Group gap={4}>
                                                            <Text size="sm" c={overdue ? 'red' : undefined} fw={overdue ? 600 : 400}>
                                                                {format(new Date(a.dueDate), 'MMM dd, yyyy')}
                                                            </Text>
                                                            {overdue && <Badge size="xs" color="red" variant="filled">Overdue</Badge>}
                                                        </Group>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Badge variant="filled" color={a._count.submissions > 0 ? 'green' : 'gray'}>
                                                            {a._count.submissions} submitted
                                                        </Badge>
                                                    </Table.Td>
                                                    <Table.Td style={{ textAlign: 'right' }}>
                                                        <Group gap="xs" justify="flex-end">
                                                            <ActionIcon variant="subtle" color="blue" title="View Submissions" onClick={() => navigate(`/portal/grading?assignment=${a.id}`)}>
                                                                <IconEye size={16} />
                                                            </ActionIcon>
                                                            <ActionIcon variant="subtle" color="orange" title="Edit" onClick={() => openEditAssignment(a)}>
                                                                <IconEdit size={16} />
                                                            </ActionIcon>
                                                            <ActionIcon variant="subtle" color="red" title="Delete" onClick={() => setDeleteTarget({ id: a.id, title: a.title })}>
                                                                <IconTrash size={16} />
                                                            </ActionIcon>
                                                        </Group>
                                                    </Table.Td>
                                                </Table.Tr>
                                            );
                                        })}
                                    </Table.Tbody>
                                </Table>
                            </ScrollArea>
                        )}
                    </Card>
                </Tabs.Panel>

                {/* ═══════════ CALA TAB ═══════════ */}
                <Tabs.Panel value="cala" pt="md">
                    <LoadingOverlay visible={calaLoading} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} pos="relative" />
                    <Group justify="space-between" mb="md">
                        <Text size="sm" c="dimmed">Continuous Assessment Learning Activities — track student competencies and practical tasks.</Text>
                        <Group>
                            <Select placeholder="Filter by Class" data={availableClasses} value={calaClassFilter} onChange={setCalaClassFilter} clearable searchable w={200} />
                            <Select placeholder="Filter by Subject" data={availableSubjects} value={calaSubjectFilter} onChange={setCalaSubjectFilter} clearable searchable w={200} />
                            <Button leftSection={<IconPlus size={16} />} color="green" onClick={openCreateCala}>Add CALA Record</Button>
                        </Group>
                    </Group>

                    <Card withBorder radius="md" p={0}>
                        {filteredCalaRecords.length === 0 && !calaLoading ? (
                            <Stack align="center" p="xl">
                                <ThemeIcon size={60} variant="light" color="green" radius="xl"><IconClipboardCheck size={30} /></ThemeIcon>
                                <Title order={4}>No CALA Records</Title>
                                <Text c="dimmed" size="sm">Create your first CALA record to start tracking student competencies.</Text>
                                <Button variant="light" color="green" onClick={openCreateCala}>Add CALA Record</Button>
                            </Stack>
                        ) : (
                            <ScrollArea>
                                <Table verticalSpacing="md" striped highlightOnHover>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>Task Name</Table.Th>
                                            <Table.Th>Subject</Table.Th>
                                            <Table.Th>Student</Table.Th>
                                            <Table.Th>Term</Table.Th>
                                            <Table.Th>Score</Table.Th>
                                            <Table.Th>Date</Table.Th>
                                            <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {filteredCalaRecords.map((c: any) => (
                                            <Table.Tr key={c.id}>
                                                <Table.Td><Text size="sm" fw={500}>{c.taskName || c.title}</Text></Table.Td>
                                                <Table.Td><Badge variant="light" color="grape">{c.subject?.name || '—'}</Badge></Table.Td>
                                                <Table.Td><Text size="sm">{c.student ? `${c.student.firstName} ${c.student.lastName}` : '—'}</Text></Table.Td>
                                                <Table.Td><Text size="sm">{c.term?.name || '—'}</Text></Table.Td>
                                                <Table.Td><Text size="sm" fw={600}>{c.score || c.marks} / {c.maxScore || c.maxMarks}</Text></Table.Td>
                                                <Table.Td><Text size="sm">{c.date ? format(new Date(c.date), 'MMM dd, yyyy') : '—'}</Text></Table.Td>
                                                <Table.Td style={{ textAlign: 'right' }}>
                                                    <Group gap="xs" justify="flex-end">
                                                        <ActionIcon variant="subtle" color="orange" title="Edit" onClick={() => openEditCala(c)}>
                                                            <IconEdit size={16} />
                                                        </ActionIcon>
                                                        <ActionIcon variant="subtle" color="red" title="Delete" onClick={() => setCalaDeleteTarget({ id: c.id, title: c.title })}>
                                                            <IconTrash size={16} />
                                                        </ActionIcon>
                                                    </Group>
                                                </Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>
                            </ScrollArea>
                        )}
                    </Card>
                </Tabs.Panel>
            </Tabs>

            {/* ═══════════ ASSIGNMENT DRAWER ═══════════ */}
            <Drawer opened={drawerOpened} onClose={closeDrawer} title={editingId ? 'Edit Assignment' : 'Create Assignment'} position="right" size="md" padding="lg">
                <Stack gap="md">
                    {!sectionId && !editingId && (
                        <Select label="Target Class" placeholder="Select class" data={availableClasses} value={selectedGlobalSectionId} onChange={setSelectedGlobalSectionId} required searchable />
                    )}
                    {!editingId && (
                        <Select label="Subject" placeholder="Select subject" data={availableSubjects} value={subjectId} onChange={v => setSubjectId(v || '')} required searchable />
                    )}
                    <TextInput label="Title" placeholder="E.g., Intro to Algebra Worksheet" value={title} onChange={e => setTitle(e.target.value)} required />
                    <Textarea label="Description" placeholder="Instructions for students..." value={description} onChange={e => setDescription(e.target.value)} minRows={3} />
                    <Group grow>
                        <Select label="Type" data={ASSIGNMENT_TYPES} value={type} onChange={v => setType(v || 'HOMEWORK')} />
                        <NumberInput label="Max Marks" placeholder="100" value={maxMarks} onChange={v => setMaxMarks(typeof v === 'string' ? (v === '' ? '' : Number(v)) : v)} required min={1} />
                    </Group>
                    <TextInput label="Due Date" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={closeDrawer}>Cancel</Button>
                        <Button onClick={handleSaveAssignment} loading={saveAssignmentMutation.isPending} disabled={!title || !dueDate || maxMarks === ''}>
                            {editingId ? 'Update' : 'Create'}
                        </Button>
                    </Group>
                </Stack>
            </Drawer>

            {/* ═══════════ CALA DRAWER ═══════════ */}
            <Drawer opened={calaDrawerOpened} onClose={closeCalaDrawer} title={calaEditingId ? 'Edit CALA Record' : 'Add CALA Record'} position="right" size="md" padding="lg">
                <Stack gap="md">
                    <TextInput label="Task Name" placeholder="E.g., Practical Investigation — Acids" value={calaTaskName} onChange={e => setCalaTaskName(e.target.value)} required />

                    {!sectionId && !calaEditingId && (
                        <Select label="Target Class" placeholder="Select class" data={availableClasses} value={selectedGlobalSectionId} onChange={setSelectedGlobalSectionId} searchable />
                    )}

                    <Select label="Student" placeholder="Select student" data={availableStudents} value={calaStudentId} onChange={v => setCalaStudentId(v || '')} required searchable />
                    <Select label="Subject" placeholder="Select subject" data={availableSubjects} value={calaSubjectId} onChange={v => setCalaSubjectId(v || '')} searchable required />
                    <Select label="Term" placeholder="Select EXAM term" data={availableTerms} value={calaTermId} onChange={v => setCalaTermId(v || '')} searchable required />

                    <Group grow>
                        <NumberInput label="Score" placeholder="Earned marks" value={calaScore} onChange={v => setCalaScore(typeof v === 'string' ? (v === '' ? '' : Number(v)) : v)} required min={0} />
                        <NumberInput label="Max Score" placeholder="50" value={calaMaxMarks} onChange={v => setCalaMaxMarks(typeof v === 'string' ? (v === '' ? '' : Number(v)) : v)} required min={1} />
                    </Group>

                    <TextInput label="Date" type="date" value={calaDate} onChange={e => setCalaDate(e.target.value)} required />
                    <Textarea label="Teacher Remarks" placeholder="Comments..." value={calaTeacherRemarks} onChange={e => setCalaTeacherRemarks(e.target.value)} minRows={2} />

                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={closeCalaDrawer}>Cancel</Button>
                        <Button color="green" onClick={handleSaveCala} loading={saveCalaMutation.isPending} disabled={!calaTaskName || calaScore === '' || calaMaxMarks === '' || !calaStudentId || !calaTermId || !calaDate}>
                            {calaEditingId ? 'Update' : 'Create'}
                        </Button>
                    </Group>
                </Stack>
            </Drawer>

            {/* ═══════════ DELETE CONFIRM (Assignment) ═══════════ */}
            <Modal opened={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Assignment" centered size="sm">
                <Text size="sm">Are you sure you want to delete <b>"{deleteTarget?.title}"</b>? This action cannot be undone.</Text>
                <Group justify="flex-end" mt="lg">
                    <Button variant="default" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                    <Button color="red" onClick={handleDeleteAssignment} loading={deleteAssignmentMutation.isPending}>Delete</Button>
                </Group>
            </Modal>

            {/* ═══════════ DELETE CONFIRM (CALA) ═══════════ */}
            <Modal opened={!!calaDeleteTarget} onClose={() => setCalaDeleteTarget(null)} title="Delete CALA Record" centered size="sm">
                <Text size="sm">Are you sure you want to delete <b>"{calaDeleteTarget?.title}"</b>? This action cannot be undone.</Text>
                <Group justify="flex-end" mt="lg">
                    <Button variant="default" onClick={() => setCalaDeleteTarget(null)}>Cancel</Button>
                    <Button color="red" onClick={handleDeleteCala} loading={deleteCalaMutation.isPending}>Delete</Button>
                </Group>
            </Modal>
        </Stack>
    );
}

export default TeacherAssignments;
