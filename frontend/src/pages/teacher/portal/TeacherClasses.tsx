import { Title, Text, Stack, Card, Button, SimpleGrid, Group, ThemeIcon, Badge, LoadingOverlay, Menu, ActionIcon, Paper, TextInput } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconBooks, IconUsers, IconDotsVertical, IconEye, IconMessageDots, IconFileDescription, IconClipboardList, IconSearch } from '@tabler/icons-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../services/api';
import { useNavigate, useLocation } from 'react-router-dom';

interface TeacherClass {
    section: {
        id: string;
        name: string;
        classLevel: { name: string; level?: number };
        _count: { students: number };
    };
    subjects: { id: string; name: string; code: string }[];
    isClassTeacher?: boolean;
}

export function TeacherClasses() {
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useMediaQuery('(max-width: 48em)');
    const basePath = location.pathname.startsWith('/teacher') ? '/teacher' : '/portal';
    const [searchQuery, setSearchQuery] = useState('');

    const { data: classes = [] as TeacherClass[], isLoading: loading } = useQuery<TeacherClass[]>({
        queryKey: ['teacherClasses'],
        queryFn: () => api.get('/teacher/classes').then(res => res.data)
    });

    const filteredClasses = classes.filter(cls => {
        const query = searchQuery.toLowerCase();
        const className = `${cls.section.classLevel.name} ${cls.section.classLevel.level || ""} ${cls.section.name}`.toLowerCase();
        const subjectMatch = cls.subjects.some(s => s.name.toLowerCase().includes(query) || s.code.toLowerCase().includes(query));
        return className.includes(query) || subjectMatch;
    });

    return (
        <Stack gap="lg" pos="relative">
            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

            <Group justify="space-between">
                <div>
                    <Title order={2}>My Classes</Title>
                    <Text c="dimmed">Manage your assigned classes, students, and course materials.</Text>
                </div>
                <TextInput
                    placeholder="Search classes or subjects..."
                    leftSection={<IconSearch size={16} />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.currentTarget.value)}
                    style={{ flex: 1, maxWidth: 300 }}
                />
            </Group>

            {classes.length === 0 && !loading ? (
                <Card withBorder radius="md" p="xl" ta="center">
                    <ThemeIcon size={60} radius="xl" variant="light" color="gray" mx="auto" mb="md">
                        <IconBooks size={30} />
                    </ThemeIcon>
                    <Title order={4}>No Classes Found</Title>
                    <Text c="dimmed">You have not been allocated any subjects or sections yet.</Text>
                </Card>
            ) : (
                <Stack gap="sm">
                    {filteredClasses.length === 0 && (
                        <Text c="dimmed" ta="center" py="xl">No classes match your search criteria.</Text>
                    )}
                    {filteredClasses.map((cls: TeacherClass) => (
                        <Paper key={cls.section.id} withBorder radius="md" p="md" shadow="sm" bg="var(--app-surface)">
                            <Group justify="space-between" align="center" wrap="wrap">
                                {/* Left side: Class Info & Subjects */}
                                <Stack gap="xs" style={{ flex: '1 1 300px' }}>
                                    <Group gap="sm">
                                        <Badge size="lg" variant="light" color="blue">
                                            {cls.section.classLevel.name} {cls.section.classLevel.level || ""} {cls.section.name}
                                        </Badge>
                                        <Group gap="xs">
                                            <IconUsers size={16} color="var(--mantine-color-gray-6)" />
                                            <Text size="sm" c="dimmed" fw={500}>{cls.section._count.students} Students</Text>
                                        </Group>
                                    </Group>

                                    <Group gap="xs">
                                        <Text size="xs" fw={600} tt="uppercase" c="dimmed">Subjects:</Text>
                                        {cls.isClassTeacher && <Badge variant="filled" color="blue" size="xs">Class Teacher</Badge>}
                                        {cls.subjects.map((s: any) => (
                                            <Badge key={s.id} variant="outline" size="sm" color="gray">{s.name}</Badge>
                                        ))}
                                        {!cls.isClassTeacher && cls.subjects.length === 0 && (
                                            <Text size="sm" c="dimmed">No subjects assigned</Text>
                                        )}
                                    </Group>
                                </Stack>

                                {/* Right side: Actions */}
                                <Group gap="sm">
                                    <Button variant="light" color="blue" leftSection={<IconUsers size={16} />} onClick={() => navigate(`${basePath}/classes/${cls.section.id}/students`)} size="sm">
                                        Students
                                    </Button>
                                    <Button variant="light" color="grape" leftSection={<IconFileDescription size={16} />} onClick={() => navigate(`${basePath}/classes/${cls.section.id}/materials`)} size="sm">
                                        Materials
                                    </Button>
                                    <Button variant="light" color="orange" leftSection={<IconClipboardList size={16} />} onClick={() => navigate(`${basePath}/classes/${cls.section.id}/assignments`)} size="sm">
                                        Assignments
                                    </Button>
                                    <Menu withinPortal position="bottom-end" shadow="sm">
                                        <Menu.Target>
                                            <ActionIcon variant="subtle" color="gray">
                                                <IconDotsVertical size={16} />
                                            </ActionIcon>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            <Menu.Item leftSection={<IconEye size={14} />} onClick={() => navigate(`${basePath}/classes/${cls.section.id}/students`)}>View Roster</Menu.Item>
                                            <Menu.Item leftSection={<IconMessageDots size={14} />} onClick={() => navigate('/communication')}>Message Class</Menu.Item>
                                        </Menu.Dropdown>
                                    </Menu>
                                </Group>
                            </Group>
                        </Paper>
                    ))}
                </Stack>
            )}
        </Stack>
    );
}

export default TeacherClasses;
