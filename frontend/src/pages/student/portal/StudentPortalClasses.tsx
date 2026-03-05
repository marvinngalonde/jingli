import { Title, Text, Stack, Card, SimpleGrid, Group, ThemeIcon, Button, Badge, Loader, Divider } from '@mantine/core';
import { IconBooks, IconFileDescription, IconClipboardList } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/common/PageHeader';

export function StudentPortalClasses() {
    const navigate = useNavigate();
    const { data: classesData = [], isLoading: loading } = useQuery({
        queryKey: ['studentClasses'],
        queryFn: async () => {
            const { data } = await api.get('/student/classes');
            return data;
        }
    });

    return (
        <Stack gap="lg" pos="relative">
            {loading && <Loader pos="absolute" top="50%" left="50%" style={{ transform: 'translate(-50%, -50%)' }} />}

            <PageHeader
                title="My Subjects"
                subtitle="Select a subject to view materials and assignments."
            />

            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
                {classesData.length === 0 && !loading ? (
                    <Text fs="italic" c="dimmed">You are not enrolled in any classes yet.</Text>
                ) : (
                    classesData.map((cls: any) => (
                        <Card
                            key={cls.id}
                            withBorder
                            radius="lg"
                            padding="xl"
                            shadow="sm"
                            bg="var(--app-surface)"
                            style={{
                                transition: 'all 0.2s ease',
                                border: '1px solid var(--app-border-light)',
                            }}
                            onMouseEnter={(e: any) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = 'var(--mantine-shadow-md)';
                                e.currentTarget.style.borderColor = 'var(--mantine-color-blue-3)';
                            }}
                            onMouseLeave={(e: any) => {
                                e.currentTarget.style.transform = 'none';
                                e.currentTarget.style.boxShadow = 'var(--mantine-shadow-sm)';
                                e.currentTarget.style.borderColor = 'var(--app-border-light)';
                            }}
                        >
                            <Group justify="space-between" mb="lg">
                                <ThemeIcon size={48} radius="md" variant="light" color="blue" style={{ background: 'var(--mantine-color-blue-0)' }}>
                                    <IconBooks size={28} />
                                </ThemeIcon>
                                <Badge variant="dot" color="blue" size="lg" radius="sm">
                                    {cls.subject.code}
                                </Badge>
                            </Group>

                            <Stack gap={4} mb="xl">
                                <Text fw={700} size="xl" lh={1.2}>
                                    {cls.subject.name}
                                </Text>
                                <Text size="sm" c="dimmed">
                                    Instructor: {cls.teacher.firstName} {cls.teacher.lastName}
                                </Text>
                            </Stack>

                            <Divider mb="xl" variant="dashed" />

                            <Group grow gap="md">
                                <Button
                                    variant="light"
                                    color="blue"
                                    radius="md"
                                    leftSection={<IconFileDescription size={16} />}
                                    onClick={() => navigate(`/student-portal/classes/${cls.subjectId}/materials`)}
                                    styles={{ root: { height: 44 } }}
                                >
                                    Materials
                                </Button>
                                <Button
                                    variant="light"
                                    color="orange"
                                    radius="md"
                                    leftSection={<IconClipboardList size={16} />}
                                    onClick={() => navigate(`/student-portal/classes/${cls.subjectId}/assignments`)}
                                    styles={{ root: { height: 44 } }}
                                >
                                    Assignments
                                </Button>
                            </Group>
                        </Card>
                    ))
                )}
            </SimpleGrid>
        </Stack>
    );
}

export default StudentPortalClasses;
