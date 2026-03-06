import { useState, useEffect } from 'react';
import { Title, Text, Card, Group, Badge, SimpleGrid, Paper, ThemeIcon, Stack, Loader, Center, Avatar, Table, ActionIcon, Tooltip, Progress } from '@mantine/core';
import { IconSchool, IconUsers, IconBook, IconChevronRight, IconCalendar } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { PageHeader } from '../../../components/common/PageHeader';
import { notifications } from '@mantine/notifications';

interface TeacherClassInfo {
    section: {
        id: string;
        name: string;
        classLevel: { id: string; name: string; level?: number };
        _count?: { students: number };
    };
    subjects: { id: string; name: string; code: string }[];
    isClassTeacher: boolean;
}

export default function TeacherMyClasses() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [classes, setClasses] = useState<TeacherClassInfo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadClasses();
    }, []);

    const loadClasses = async () => {
        try {
            setLoading(true);
            const res = await api.get('/teacher/classes');
            setClasses(res.data || []);
        } catch (error) {
            console.error('Failed to load classes', error);
            notifications.show({ title: 'Error', message: 'Failed to load your classes', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Center h={400}><Loader /></Center>;

    // Group by class level
    const grouped = classes.reduce((acc, cls) => {
        const key = `${cls.section?.classLevel?.name || 'Unknown'} ${cls.section?.classLevel?.level ?? ''}`.trim();
        if (!acc[key]) acc[key] = [];
        acc[key].push(cls);
        return acc;
    }, {} as Record<string, TeacherClassInfo[]>);

    const totalStudents = classes.reduce((sum, c) => sum + (c.section?._count?.students || 0), 0);
    const uniqueSections = new Set(classes.map(c => c.section?.id).filter(Boolean)).size;
    const allSubjects = classes.flatMap(c => c.subjects || []);
    const uniqueSubjects = new Set(allSubjects.map(s => s.id)).size;

    return (
        <div>
            <PageHeader
                title="My Classes"
                subtitle="View all classes and sections assigned to you"
            />

            {/* Summary Stats */}
            <SimpleGrid cols={{ base: 1, sm: 3 }} mb="lg">
                <Paper withBorder radius="md" p="lg" bg="var(--app-surface)">
                    <Group>
                        <ThemeIcon variant="light" color="blue" size="xl" radius="md">
                            <IconSchool size={24} />
                        </ThemeIcon>
                        <div>
                            <Text size="xs" tt="uppercase" fw={700} c="dimmed">Sections</Text>
                            <Text size="xl" fw={700}>{uniqueSections}</Text>
                        </div>
                    </Group>
                </Paper>
                <Paper withBorder radius="md" p="lg" bg="var(--app-surface)">
                    <Group>
                        <ThemeIcon variant="light" color="teal" size="xl" radius="md">
                            <IconUsers size={24} />
                        </ThemeIcon>
                        <div>
                            <Text size="xs" tt="uppercase" fw={700} c="dimmed">Total Students</Text>
                            <Text size="xl" fw={700}>{totalStudents}</Text>
                        </div>
                    </Group>
                </Paper>
                <Paper withBorder radius="md" p="lg" bg="var(--app-surface)">
                    <Group>
                        <ThemeIcon variant="light" color="grape" size="xl" radius="md">
                            <IconBook size={24} />
                        </ThemeIcon>
                        <div>
                            <Text size="xs" tt="uppercase" fw={700} c="dimmed">Subjects</Text>
                            <Text size="xl" fw={700}>{uniqueSubjects}</Text>
                        </div>
                    </Group>
                </Paper>
            </SimpleGrid>

            {classes.length === 0 ? (
                <Card withBorder radius="md" p="xl" ta="center" bg="var(--app-surface)">
                    <ThemeIcon variant="light" color="gray" size={60} radius="xl" mx="auto" mb="md">
                        <IconSchool size={30} />
                    </ThemeIcon>
                    <Text size="lg" fw={500}>No Classes Assigned</Text>
                    <Text c="dimmed" mt="xs">You have not been assigned to any classes yet.</Text>
                </Card>
            ) : (
                <Stack gap="lg">
                    {Object.entries(grouped).map(([levelName, items]) => (
                        <Paper key={levelName} withBorder radius="md" bg="var(--app-surface)" p={0}>
                            <Group px="lg" py="sm" bg="var(--app-surface-dim)" style={{ borderBottom: '1px solid var(--app-border-light)', borderRadius: 'var(--mantine-radius-md) var(--mantine-radius-md) 0 0' }}>
                                <IconSchool size={18} />
                                <Text fw={600}>{levelName}</Text>
                                <Badge variant="light" color="blue" ml="auto">{items.length} section(s)</Badge>
                            </Group>
                            <Table striped highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Section</Table.Th>
                                        <Table.Th>Subjects</Table.Th>
                                        <Table.Th>Students</Table.Th>
                                        <Table.Th>Role</Table.Th>
                                        <Table.Th w={50}></Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {items.map((cls) => (
                                        <Table.Tr key={cls.section?.id || Math.random()} style={{ cursor: 'pointer' }} onClick={() => navigate(`/teacher/classes/${cls.section?.id}/students`)}>
                                            <Table.Td>
                                                <Group gap="sm">
                                                    <Avatar color="blue" radius="md" size="sm">{cls.section?.name?.charAt(0) || '?'}</Avatar>
                                                    <Text fw={500}>{cls.section?.name || 'Unknown'}</Text>
                                                </Group>
                                            </Table.Td>
                                            <Table.Td>
                                                <Group gap={4} wrap="wrap">
                                                    {(cls.subjects || []).map((subj) => (
                                                        <Badge key={subj.id} variant="outline" color="grape" size="sm">{subj.code || subj.name}</Badge>
                                                    ))}
                                                    {(!cls.subjects || cls.subjects.length === 0) && (
                                                        <Text size="sm" c="dimmed">Class Teacher only</Text>
                                                    )}
                                                </Group>
                                            </Table.Td>
                                            <Table.Td>
                                                <Badge variant="light" color="teal">{cls.section?._count?.students || 0} students</Badge>
                                            </Table.Td>
                                            <Table.Td>
                                                {cls.isClassTeacher ? (
                                                    <Badge variant="filled" color="blue" size="sm">Class Teacher</Badge>
                                                ) : (
                                                    <Badge variant="light" color="gray" size="sm">Subject Teacher</Badge>
                                                )}
                                            </Table.Td>
                                            <Table.Td>
                                                <ActionIcon variant="subtle" color="gray">
                                                    <IconChevronRight size={16} />
                                                </ActionIcon>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        </Paper>
                    ))}
                </Stack>
            )}
        </div>
    );
}
