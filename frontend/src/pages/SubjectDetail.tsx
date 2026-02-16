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
import { subjectsApi } from '../services/academics';
import type { Subject } from '../types/academics';
import { EditSubjectModal } from '../components/modals/EditSubjectModal';
import { DeleteSubjectModal } from '../components/modals/DeleteSubjectModal';
import { useAuth } from '../context/AuthContext';

export default function SubjectDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [subject, setSubject] = useState<Subject | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editModalOpened, setEditModalOpened] = useState(false);
    const [deleteModalOpened, setDeleteModalOpened] = useState(false);

    useEffect(() => {
        if (id) {
            fetchSubject();
        }
    }, [id]);

    const fetchSubject = async () => {
        if (!id) return;

        try {
            setLoading(true);
            setError(null);
            const data = await subjectsApi.getOne(id);
            setSubject(data);
        } catch (err: any) {
            console.error('Failed to fetch subject:', err);
            setError(err.response?.data?.message || 'Failed to load subject');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSuccess = () => {
        navigate('/academics');
    };

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
                            <Alert color="blue" mb="md">
                                Grade assignments will be automatically populated when timetables are created.
                            </Alert>
                            <Box style={{ overflowX: 'auto' }}>
                                <Table striped highlightOnHover>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>Grade Level</Table.Th>
                                            <Table.Th>Sections</Table.Th>
                                            <Table.Th>Teachers</Table.Th>
                                            <Table.Th>Weekly Hours</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        <Table.Tr>
                                            <Table.Td colSpan={4}>
                                                <Text c="dimmed" ta="center" py="xl">
                                                    No timetable assignments yet. Create timetables to see grade assignments.
                                                </Text>
                                            </Table.Td>
                                        </Table.Tr>
                                    </Table.Tbody>
                                </Table>
                            </Box>
                        </Paper>
                    </Tabs.Panel>

                    <Tabs.Panel value="teachers" pt="md">
                        <Paper withBorder p="md">
                            <Text fw={600} mb="md">Teachers Assigned to This Subject</Text>
                            <Alert color="blue" mb="md">
                                Teacher assignments will be automatically populated when timetables are created.
                            </Alert>
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
                                        <Table.Tr>
                                            <Table.Td colSpan={4}>
                                                <Text c="dimmed" ta="center" py="xl">
                                                    No teacher assignments yet. Create timetables to see teacher assignments.
                                                </Text>
                                            </Table.Td>
                                        </Table.Tr>
                                    </Table.Tbody>
                                </Table>
                            </Box>
                        </Paper>
                    </Tabs.Panel>
                </Tabs>
            </Stack>

            <EditSubjectModal
                opened={editModalOpened}
                onClose={() => setEditModalOpened(false)}
                onSuccess={fetchSubject}
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
    );
}
