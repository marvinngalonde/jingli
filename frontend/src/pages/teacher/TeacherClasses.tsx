import { Title, Text, Stack, Card, Button, SimpleGrid, Group, ThemeIcon, Badge, LoadingOverlay, Menu, ActionIcon } from '@mantine/core';
import { IconBooks, IconUsers, IconDotsVertical, IconEye, IconMessageDots, IconFileDescription, IconClipboardList } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';

interface TeacherClass {
    section: {
        id: string;
        name: string;
        classLevel: { name: string };
        _count: { students: number };
    };
    subjects: { id: string; name: string; code: string }[];
    isClassTeacher?: boolean;
}

export function TeacherClasses() {
    const [classes, setClasses] = useState<TeacherClass[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const { data } = await api.get('/teacher/classes');
                setClasses(data);
            } catch (error) {
                console.error("Failed to fetch classes", error);
            } finally {
                setLoading(false);
            }
        };
        fetchClasses();
    }, []);

    return (
        <Stack gap="lg" pos="relative">
            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

            <Group justify="space-between">
                <div>
                    <Title order={2}>My Classes</Title>
                    <Text c="dimmed">Manage your assigned classes, students, and course materials.</Text>
                </div>
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
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
                    {classes.map((cls) => (
                        <Card key={cls.section.id} withBorder radius="md" p="md" shadow="sm">
                            <Card.Section withBorder inheritPadding py="xs">
                                <Group justify="space-between">
                                    <Badge size="lg" variant="light">
                                        {cls.section.classLevel.name} {cls.section.name}
                                    </Badge>
                                    <Menu withinPortal position="bottom-end" shadow="sm">
                                        <Menu.Target>
                                            <ActionIcon variant="subtle" color="gray">
                                                <IconDotsVertical size={16} />
                                            </ActionIcon>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            <Menu.Item leftSection={<IconEye size={14} />} onClick={() => navigate(`/portal/classes/${cls.section.id}/students`)}>View Roster</Menu.Item>
                                            <Menu.Item leftSection={<IconMessageDots size={14} />}>Message Class</Menu.Item>
                                        </Menu.Dropdown>
                                    </Menu>
                                </Group>
                            </Card.Section>

                            <Stack mt="md" gap="sm">
                                <Group gap="xs">
                                    <IconBooks size={16} color="var(--mantine-color-gray-6)" />
                                    <Text size="sm" fw={500}>Subjects:</Text>
                                    {cls.isClassTeacher && <Badge variant="filled" color="blue" size="sm">Class Teacher</Badge>}
                                    {cls.subjects.map(s => (
                                        <Badge key={s.id} variant="dot" size="sm">{s.name}</Badge>
                                    ))}
                                    {!cls.isClassTeacher && cls.subjects.length === 0 && (
                                        <Text size="sm" c="dimmed">No subjects assigned</Text>
                                    )}
                                </Group>

                                <Group gap="xs">
                                    <IconUsers size={16} color="var(--mantine-color-gray-6)" />
                                    <Text size="sm" c="dimmed">{cls.section._count.students} Students Enrolled</Text>
                                </Group>
                            </Stack>

                            <Group grow mt="xl">
                                <Button variant="light" color="blue" leftSection={<IconUsers size={16} />} onClick={() => navigate(`/portal/classes/${cls.section.id}/students`)}>
                                    Students
                                </Button>
                                <Button variant="light" color="grape" leftSection={<IconFileDescription size={16} />} onClick={() => navigate(`/portal/classes/${cls.section.id}/materials`)}>
                                    Materials
                                </Button>
                                <Button variant="light" color="orange" leftSection={<IconClipboardList size={16} />} onClick={() => navigate(`/portal/classes/${cls.section.id}/assignments`)}>
                                    Assignments
                                </Button>
                            </Group>
                        </Card>
                    ))}
                </SimpleGrid>
            )}
        </Stack>
    );
}

export default TeacherClasses;
