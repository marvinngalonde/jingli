import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
    Paper,
    Text,
    Group,
    Button,
    Stack,
    Badge,
    LoadingOverlay,
    Alert,
    Tabs,
    Table,
    Box
} from '@mantine/core';
import {
    IconArrowLeft,
    IconEdit,
    IconTrash,
    IconAlertCircle,
    IconBook,
    IconUsers,
    IconCalendar
} from '@tabler/icons-react';
import { PageHeader } from '../components/common/PageHeader';
import { subjectsApi, timetableApi } from '../services/academics';
import type { Subject, TimetableEntry } from '../types/academics';
import { EditSubjectModal } from '../components/modals/EditSubjectModal';
import { DeleteSubjectModal } from '../components/modals/DeleteSubjectModal';
import { useAuth } from '../context/AuthContext';

export default function SubjectDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [subject, setSubject] = useState<Subject | null>(null);
    const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editModalOpened, setEditModalOpened] = useState(false);
    const [deleteModalOpened, setDeleteModalOpened] = useState(false);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        if (!id) return;

        try {
            setLoading(true);
            setError(null);

            const [subjectData, timetableData] = await Promise.all([
                subjectsApi.getOne(id),
                timetableApi.getAll({ subjectId: id })
            ]);

            setSubject(subjectData);
            setTimetableEntries(timetableData);
        } catch (err: any) {
            console.error('Failed to fetch subject data:', err);
            setError(err.response?.data?.message || 'Failed to load subject data');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSuccess = () => {
        navigate('/academics');
    };

    // Calculate Grade Assignments (Group by Class Section -> Class Level)
    const gradeAssignments = Object.values(timetableEntries.reduce((acc, entry) => {
        if (!entry.section) return acc;

        const sectionId = entry.section.id;
        if (!acc[sectionId]) {
            acc[sectionId] = {
                id: sectionId,
                grade: entry.section.classLevel?.name || `Grade ${entry.section.classLevel?.level}`, // Need classLevel included
                section: entry.section.name,
                teachers: new Set<string>(),
                hours: 0
            };
        }

        if (entry.teacher) {
            acc[sectionId].teachers.add(`${entry.teacher.firstName} ${entry.teacher.lastName}`);
        }

        // Calculate duration (assuming 1 hour slots for simplicity or calculate diff)
        const start = new Date(entry.startTime);
        const end = new Date(entry.endTime);
        const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        acc[sectionId].hours += durationHours;

        return acc;
    }, {} as Record<string, any>));

    // Calculate Teacher Assignments
    const teacherAssignments = Object.values(timetableEntries.reduce((acc, entry) => {
        if (!entry.teacher) return acc;

        const teacherId = entry.teacher.id;
        if (!acc[teacherId]) {
            acc[teacherId] = {
                id: teacherId,
                name: `${entry.teacher.firstName} ${entry.teacher.lastName}`,
                grades: new Set<string>(),
                classes: 0,
                hours: 0
            };
        }

        if (entry.section?.classLevel) {
            acc[teacherId].grades.add(entry.section.classLevel.name);
        } else if (entry.section) {
            acc[teacherId].grades.add(entry.section.name);
        }

        acc[teacherId].classes += 1;

        const start = new Date(entry.startTime);
        const end = new Date(entry.endTime);
        const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        acc[teacherId].hours += durationHours;

        return acc;
    }, {} as Record<string, any>));

    if (loading) {
        return <LoadingOverlay visible />;
    }

    if (error || !subject) {
        return (
            <>
                <PageHeader
                    title="Subject Not Found"
                    subtitle="The requested subject could not be loaded"
                />
                <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mb="md">
                    {error || 'Subject not found'}
                </Alert>
                <Button leftSection={<IconArrowLeft size={16} />} onClick={() => navigate('/academics')}>
                    Back to Academics
                </Button>
            </>
        );
    }

    return (
        <>
            <PageHeader
                title={subject.name}
                subtitle={`Subject Code: ${subject.code}`}
                actions={
                    <Group>
                        <Button
                            variant="light"
                            leftSection={<IconArrowLeft size={16} />}
                            onClick={() => navigate('/academics')}
                        >
                            Back
                        </Button>
                        {user?.role !== 'teacher' && (
                            <>
                                <Button
                                    variant="light"
                                    leftSection={<IconEdit size={16} />}
                                    onClick={() => setEditModalOpened(true)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    color="red"
                                    variant="light"
                                    leftSection={<IconTrash size={16} />}
                                    onClick={() => setDeleteModalOpened(true)}
                                >
                                    Delete
                                </Button>
                            </>
                        )}
                    </Group>
                }
            />

            <Stack gap="md">
                {/* Subject Information */}
                <Paper withBorder p="md">
                    <Group mb="md">
                        <IconBook size={20} />
                        <Text fw={600} size="lg">Subject Information</Text>
                    </Group>
                    <Stack gap="sm">
                        <Group>
                            <Text fw={500} w={120}>Code:</Text>
                            <Badge variant="light" color="blue" size="lg">{subject.code}</Badge>
                        </Group>
                        <Group>
                            <Text fw={500} w={120}>Name:</Text>
                            <Text>{subject.name}</Text>
                        </Group>
                        <Group>
                            <Text fw={500} w={120}>Department:</Text>
                            <Text>{subject.department || 'N/A'}</Text>
                        </Group>
                    </Stack>
                </Paper>

                {/* Tabs for Assignments */}
                <Tabs defaultValue="grades">
                    <Tabs.List>
                        <Tabs.Tab value="grades" leftSection={<IconCalendar size={16} />}>
                            Grade Assignments
                        </Tabs.Tab>
                        <Tabs.Tab value="teachers" leftSection={<IconUsers size={16} />}>
                            Teacher Assignments
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="grades" pt="md">
                        <Paper withBorder p="md">
                            <Text fw={600} mb="md">Grades Teaching This Subject</Text>
                            {gradeAssignments.length === 0 ? (
                                <Alert color="blue" mb="md">
                                    No timetable assignments yet. Create timetables to see grade assignments.
                                </Alert>
                            ) : (
                                <Box style={{ overflowX: 'auto' }}>
                                    <Table striped highlightOnHover>
                                        <Table.Thead>
                                            <Table.Tr>
                                                <Table.Th>Grade / Level</Table.Th>
                                                <Table.Th>Section</Table.Th>
                                                <Table.Th>Teachers</Table.Th>
                                                <Table.Th>Weekly Hours</Table.Th>
                                            </Table.Tr>
                                        </Table.Thead>
                                        <Table.Tbody>
                                            {gradeAssignments.map((assignment: any) => (
                                                <Table.Tr key={assignment.id}>
                                                    <Table.Td>{assignment.grade}</Table.Td>
                                                    <Table.Td>{assignment.section}</Table.Td>
                                                    <Table.Td>{Array.from(assignment.teachers).join(', ')}</Table.Td>
                                                    <Table.Td>{assignment.hours.toFixed(1)} hrs</Table.Td>
                                                </Table.Tr>
                                            ))}
                                        </Table.Tbody>
                                    </Table>
                                </Box>
                            )}
                        </Paper>
                    </Tabs.Panel>

                    <Tabs.Panel value="teachers" pt="md">
                        <Paper withBorder p="md">
                            <Text fw={600} mb="md">Teachers Assigned to This Subject</Text>
                            {teacherAssignments.length === 0 ? (
                                <Alert color="blue" mb="md">
                                    No teacher assignments yet. Create timetables to see teacher assignments.
                                </Alert>
                            ) : (
                                <Box style={{ overflowX: 'auto' }}>
                                    <Table striped highlightOnHover>
                                        <Table.Thead>
                                            <Table.Tr>
                                                <Table.Th>Teacher Name</Table.Th>
                                                <Table.Th>Grades Teaching</Table.Th>
                                                <Table.Th>Total Classes</Table.Th>
                                                <Table.Th>Weekly Hours</Table.Th>
                                            </Table.Tr>
                                        </Table.Thead>
                                        <Table.Tbody>
                                            {teacherAssignments.map((assignment: any) => (
                                                <Table.Tr key={assignment.id}>
                                                    <Table.Td>{assignment.name}</Table.Td>
                                                    <Table.Td>{Array.from(assignment.grades).join(', ')}</Table.Td>
                                                    <Table.Td>{assignment.classes}</Table.Td>
                                                    <Table.Td>{assignment.hours.toFixed(1)} hrs</Table.Td>
                                                </Table.Tr>
                                            ))}
                                        </Table.Tbody>
                                    </Table>
                                </Box>
                            )}
                        </Paper>
                    </Tabs.Panel>
                </Tabs>
            </Stack>

            {subject && (
                <>
                    <EditSubjectModal
                        opened={editModalOpened}
                        onClose={() => setEditModalOpened(false)}
                        onSuccess={fetchData}
                        subject={subject}
                    />

                    <DeleteSubjectModal
                        opened={deleteModalOpened}
                        onClose={() => setDeleteModalOpened(false)}
                        onSuccess={handleDeleteSuccess}
                        subjectId={subject.id}
                        subjectName={subject.name}
                    />
                </>
            )}
        </>
    );
}
