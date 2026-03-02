import { useState, useEffect } from 'react';
import { Title, Text, Card, Group, Badge, Paper, ThemeIcon, Stack, Loader, Center, SimpleGrid, ActionIcon, Tabs, Table, Anchor } from '@mantine/core';
import { IconSchool, IconBook, IconFileDescription, IconClipboardList, IconDownload, IconFile, IconPlayerPlay, IconNotes, IconChevronRight } from '@tabler/icons-react';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { PageHeader } from '../../../components/common/PageHeader';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';

interface SubjectInfo {
    id: string;
    subjectId: string;
    subject: { id: string; name: string; code: string };
    teacher: { firstName: string; lastName: string };
}

interface Material {
    id: string;
    title: string;
    description?: string;
    fileUrl?: string;
    type: string;
    createdAt: string;
    subject?: { name: string; code: string };
}

export default function StudentELearning() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState<SubjectInfo[]>([]);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const classesRes = await api.get('/student/classes');
            const subjectsList = classesRes.data || [];
            setSubjects(subjectsList);

            // Load materials from all subjects
            const allMaterials: Material[] = [];
            for (const subj of subjectsList) {
                try {
                    const matRes = await api.get(`/student/classes/${subj.subject?.id || subj.subjectId}/materials`);
                    if (matRes.data) {
                        allMaterials.push(...matRes.data.map((m: any) => ({
                            ...m,
                            subject: subj.subject,
                        })));
                    }
                } catch { /* skip subjects with no materials */ }
            }
            setMaterials(allMaterials);
        } catch (error) {
            console.error('Failed to load e-learning data', error);
            notifications.show({ title: 'Error', message: 'Failed to load learning resources', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'video': return <IconPlayerPlay size={16} />;
            case 'document': case 'pdf': return <IconFileDescription size={16} />;
            case 'notes': return <IconNotes size={16} />;
            default: return <IconFile size={16} />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'video': return 'red';
            case 'document': case 'pdf': return 'blue';
            case 'notes': return 'green';
            default: return 'gray';
        }
    };

    if (loading) return <Center h={400}><Loader /></Center>;

    return (
        <div>
            <PageHeader
                title="Learning Portal"
                subtitle="Access course materials, resources, and learning content"
            />

            <Tabs defaultValue="subjects">
                <Tabs.List mb="lg">
                    <Tabs.Tab value="subjects" leftSection={<IconBook size={16} />}>My Subjects</Tabs.Tab>
                    <Tabs.Tab value="materials" leftSection={<IconFileDescription size={16} />}>All Materials</Tabs.Tab>
                </Tabs.List>

                {/* Subjects Grid */}
                <Tabs.Panel value="subjects">
                    {subjects.length === 0 ? (
                        <Card withBorder radius="md" p="xl" ta="center" bg="var(--app-surface)">
                            <ThemeIcon variant="light" color="gray" size={60} radius="xl" mx="auto" mb="md">
                                <IconSchool size={30} />
                            </ThemeIcon>
                            <Text size="lg" fw={500}>No Subjects Enrolled</Text>
                            <Text c="dimmed" mt="xs">You are not enrolled in any subjects yet.</Text>
                        </Card>
                    ) : (
                        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
                            {subjects.map((subj) => (
                                <Card
                                    key={subj.id || subj.subjectId}
                                    withBorder
                                    radius="md"
                                    padding="lg"
                                    shadow="sm"
                                    bg="var(--app-surface)"
                                    style={{ cursor: 'pointer', transition: 'transform 0.15s', }}
                                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
                                >
                                    <Group justify="space-between" mb="sm">
                                        <ThemeIcon size="xl" radius="md" variant="light" color="blue">
                                            <IconBook size={24} />
                                        </ThemeIcon>
                                        <Badge variant="outline" color="grape" size="sm">{subj.subject?.code}</Badge>
                                    </Group>
                                    <Text fw={600} size="lg" mt="xs">{subj.subject?.name}</Text>
                                    <Text size="sm" c="dimmed" mb="md">
                                        Teacher: {subj.teacher?.firstName} {subj.teacher?.lastName}
                                    </Text>

                                    <Group grow gap="xs">
                                        <Paper
                                            withBorder
                                            radius="md"
                                            p="xs"
                                            ta="center"
                                            bg="var(--app-surface-dim)"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => navigate(`/student/classes/${subj.subject?.id || subj.subjectId}/materials`)}
                                        >
                                            <IconFileDescription size={16} color="var(--mantine-color-blue-6)" />
                                            <Text size="xs" mt={2}>Materials</Text>
                                        </Paper>
                                        <Paper
                                            withBorder
                                            radius="md"
                                            p="xs"
                                            ta="center"
                                            bg="var(--app-surface-dim)"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => navigate(`/student/classes/${subj.subject?.id || subj.subjectId}/assignments`)}
                                        >
                                            <IconClipboardList size={16} color="var(--mantine-color-orange-6)" />
                                            <Text size="xs" mt={2}>Assignments</Text>
                                        </Paper>
                                    </Group>
                                </Card>
                            ))}
                        </SimpleGrid>
                    )}
                </Tabs.Panel>

                {/* All Materials Tab */}
                <Tabs.Panel value="materials">
                    {materials.length === 0 ? (
                        <Card withBorder radius="md" p="xl" ta="center" bg="var(--app-surface)">
                            <ThemeIcon variant="light" color="gray" size={60} radius="xl" mx="auto" mb="md">
                                <IconFileDescription size={30} />
                            </ThemeIcon>
                            <Text size="lg" fw={500}>No Materials Available</Text>
                            <Text c="dimmed" mt="xs">Your teachers haven't uploaded any materials yet.</Text>
                        </Card>
                    ) : (
                        <Paper withBorder radius="md" bg="var(--app-surface)" p={0}>
                            <Table striped highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Material</Table.Th>
                                        <Table.Th>Subject</Table.Th>
                                        <Table.Th>Type</Table.Th>
                                        <Table.Th>Date</Table.Th>
                                        <Table.Th w={60}></Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {materials.map((mat) => (
                                        <Table.Tr key={mat.id}>
                                            <Table.Td>
                                                <Group gap="sm">
                                                    <ThemeIcon variant="light" color={getTypeColor(mat.type)} size="sm" radius="md">
                                                        {getTypeIcon(mat.type)}
                                                    </ThemeIcon>
                                                    <div>
                                                        <Text size="sm" fw={500}>{mat.title}</Text>
                                                        {mat.description && <Text size="xs" c="dimmed" lineClamp={1}>{mat.description}</Text>}
                                                    </div>
                                                </Group>
                                            </Table.Td>
                                            <Table.Td>
                                                <Badge variant="outline" color="grape" size="sm">{mat.subject?.code || '—'}</Badge>
                                            </Table.Td>
                                            <Table.Td>
                                                <Badge variant="light" color={getTypeColor(mat.type)} size="sm" tt="capitalize">{mat.type || 'File'}</Badge>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm" c="dimmed">
                                                    {new Date(mat.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>
                                                {mat.fileUrl && (
                                                    <ActionIcon variant="light" color="blue" component="a" href={mat.fileUrl} target="_blank">
                                                        <IconDownload size={16} />
                                                    </ActionIcon>
                                                )}
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        </Paper>
                    )}
                </Tabs.Panel>
            </Tabs>
        </div>
    );
}
