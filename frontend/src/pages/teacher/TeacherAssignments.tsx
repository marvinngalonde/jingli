import { Title, Text, Stack, Card, Button, Group, ActionIcon, LoadingOverlay, Table, Badge, TextInput, Select, Modal, NumberInput } from '@mantine/core';
import { IconArrowLeft, IconPlus, IconClipboardList, IconTrash, IconEye } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';
import { format } from 'date-fns';

interface Assignment {
    id: string;
    title: string;
    description: string | null;
    dueDate: string;
    maxMarks: number;
    type: string;
    subject: { name: string; code: string };
    section?: { name: string };
    _count: { submissions: number };
}

export function TeacherAssignments() {
    const { sectionId } = useParams();
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);

    const [opened, { open, close }] = useDisclosure(false);
    const [creating, setCreating] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [maxMarks, setMaxMarks] = useState<number | ''>(100);
    const [type, setType] = useState('HOMEWORK');
    const [subjectId, setSubjectId] = useState('');
    const [selectedGlobalSectionId, setSelectedGlobalSectionId] = useState<string | null>(null);
    const [availableSubjects, setAvailableSubjects] = useState<{ value: string, label: string }[]>([]);
    const [availableClasses, setAvailableClasses] = useState<{ value: string, label: string }[]>([]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                if (sectionId) {
                    const [assignRes, classesRes] = await Promise.all([
                        api.get(`/teacher/classes/${sectionId}/assignments`),
                        api.get('/teacher/classes')
                    ]);
                    setAssignments(assignRes.data);

                    const thisClass = classesRes.data.find((c: any) => c.section.id === sectionId);
                    if (thisClass) {
                        setAvailableSubjects(thisClass.subjects.map((s: any) => ({
                            value: s.id,
                            label: `${s.name} (${s.code})`
                        })));
                        if (thisClass.subjects.length > 0) {
                            setSubjectId(thisClass.subjects[0].id);
                        }
                    }
                } else {
                    // Global view
                    const [assignRes, classesRes] = await Promise.all([
                        api.get('/teacher/assignments'),
                        api.get('/teacher/classes')
                    ]);
                    setAssignments(assignRes.data);

                    setAvailableClasses(classesRes.data.map((c: any) => ({
                        value: c.section.id,
                        label: `${c.section.classLevel.name} ${c.section.name}`
                    })));
                }
            } catch (error) {
                console.error("Failed to fetch assignments", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [sectionId]);

    const handleCreate = async () => {
        const targetSectionId = sectionId || selectedGlobalSectionId;
        if (!title || !dueDate || !subjectId || maxMarks === '' || !targetSectionId) return;
        setCreating(true);
        try {
            const { data } = await api.post(`/teacher/classes/${targetSectionId}/assignments`, {
                title,
                description,
                dueDate,
                maxMarks,
                type,
                subjectId
            });
            setAssignments([...assignments, { ...data, _count: { submissions: 0 } }]);
            close();
            // Reset
            setTitle('');
            setDescription('');
            setDueDate('');
            setType('HOMEWORK');
            if (!sectionId) {
                setSelectedGlobalSectionId(null);
            }
        } catch (error) {
            console.error("Failed to create assignment", error);
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this assignment?')) return;
        try {
            await api.delete(`/teacher/assignments/${id}`);
            setAssignments(assignments.filter(a => a.id !== id));
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    // Effect to fetch subjects when selectedGlobalSectionId changes in global view
    useEffect(() => {
        if (sectionId || !selectedGlobalSectionId) return;
        const fetchSubjects = async () => {
            try {
                const classesRes = await api.get('/teacher/classes');
                const thisClass = classesRes.data.find((c: any) => c.section.id === selectedGlobalSectionId);
                if (thisClass) {
                    setAvailableSubjects(thisClass.subjects.map((s: any) => ({
                        value: s.id,
                        label: `${s.name} (${s.code})`
                    })));
                    if (thisClass.subjects.length > 0) {
                        setSubjectId(thisClass.subjects[0].id);
                    }
                }
            } catch (err) { }
        };
        fetchSubjects();
    }, [selectedGlobalSectionId, sectionId]);

    return (
        <Stack gap="lg" pos="relative">
            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

            <Group justify="space-between">
                <Group>
                    <ActionIcon variant="light" size="lg" onClick={() => navigate('/teacher/classes')}>
                        <IconArrowLeft size={20} />
                    </ActionIcon>
                    <div>
                        <Title order={2}>{sectionId ? 'Class Assignments' : 'All Assignments'}</Title>
                        <Text c="dimmed">
                            {sectionId ? 'Create and manage assignments for this class.' : 'View all assignments across your classes.'}
                        </Text>
                    </div>
                </Group>
                <Button leftSection={<IconPlus size={16} />} onClick={open}>
                    Create Assignment
                </Button>
            </Group>

            <Card withBorder radius="md" p={0}>
                {assignments.length === 0 && !loading ? (
                    <Text p="xl" ta="center" c="dimmed" fs="italic">No assignments created yet.</Text>
                ) : (
                    <Table verticalSpacing="md" striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Assignment</Table.Th>
                                <Table.Th>Subject</Table.Th>
                                <Table.Th>Due Date</Table.Th>
                                <Table.Th>Submissions</Table.Th>
                                <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {assignments.map((a) => {
                                const isOverdue = new Date(a.dueDate) < new Date();
                                return (
                                    <Table.Tr key={a.id}>
                                        <Table.Td>
                                            <Group gap="sm">
                                                <ActionIcon variant="light" color={type === 'EXAM' ? 'red' : 'blue'} size="lg">
                                                    <IconClipboardList size={20} />
                                                </ActionIcon>
                                                <div>
                                                    <Text size="sm" fw={500}>{a.title} <Badge size="xs" variant="dot" color={a.type === 'EXAM' ? 'red' : 'gray'}>{a.type}</Badge></Text>
                                                    <Text size="xs" c="dimmed">{a.maxMarks} Marks</Text>
                                                </div>
                                            </Group>
                                        </Table.Td>
                                        <Table.Td>
                                            <Group gap="xs">
                                                <Badge variant="light" color="grape">{a.subject?.name || 'Unknown'}</Badge>
                                                {!sectionId && a.section && (
                                                    <Badge variant="outline" color="gray">{a.section.name}</Badge>
                                                )}
                                            </Group>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm" c={isOverdue ? 'red' : undefined} fw={isOverdue ? 600 : 400}>
                                                {format(new Date(a.dueDate), 'MMM dd, yyyy')}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge variant="filled" color={a._count.submissions > 0 ? 'green' : 'gray'}>
                                                {a._count.submissions} Submitted
                                            </Badge>
                                        </Table.Td>
                                        <Table.Td style={{ textAlign: 'right' }}>
                                            <Group gap="xs" justify="flex-end">
                                                <ActionIcon variant="subtle" color="blue" title="View Submissions" onClick={() => navigate(`/teacher/grading?assignment=${a.id}`)}>
                                                    <IconEye size={16} />
                                                </ActionIcon>
                                                <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(a.id)} title="Delete">
                                                    <IconTrash size={16} />
                                                </ActionIcon>
                                            </Group>
                                        </Table.Td>
                                    </Table.Tr>
                                )
                            })}
                        </Table.Tbody>
                    </Table>
                )}
            </Card>

            <Modal opened={opened} onClose={close} title="Create New Assignment" centered>
                <Stack gap="md">
                    <Select
                        label="Subject"
                        placeholder="Select subject"
                        data={availableSubjects}
                        value={subjectId}
                        onChange={(v) => setSubjectId(v || '')}
                        required
                    />
                    {!sectionId && (
                        <Select
                            label="Target Class"
                            placeholder="Select class"
                            data={availableClasses}
                            value={selectedGlobalSectionId}
                            onChange={setSelectedGlobalSectionId}
                            required
                        />
                    )}
                    <TextInput
                        label="Title"
                        placeholder="E.g., Intro to Algebra Worksheet"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                    <TextInput
                        label="Description"
                        placeholder="Instructions for students"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <Group grow>
                        <Select
                            label="Type"
                            data={[
                                { value: 'HOMEWORK', label: 'Homework' },
                                { value: 'PROJECT', label: 'Project' },
                                { value: 'QUIZ', label: 'Quiz' },
                                { value: 'EXAM', label: 'Exam' },
                            ]}
                            value={type}
                            onChange={(v) => setType(v || 'HOMEWORK')}
                        />
                        <NumberInput
                            label="Max Marks"
                            placeholder="100"
                            value={maxMarks}
                            onChange={(v) => setMaxMarks(typeof v === 'string' ? (v === '' ? '' : Number(v)) : v)}
                            required
                        />
                    </Group>
                    <TextInput
                        label="Due Date"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        required
                    />

                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={close}>Cancel</Button>
                        <Button onClick={handleCreate} loading={creating} disabled={!title || !dueDate || !subjectId || maxMarks === ''}>Create</Button>
                    </Group>
                </Stack>
            </Modal>
        </Stack>
    );
}

export default TeacherAssignments;
