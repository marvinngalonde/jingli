import { Title, Text, Stack, Card, SimpleGrid, Group, ThemeIcon, LoadingOverlay, Badge, Divider, Button } from '@mantine/core';
import { IconBooks, IconSchool } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import { PageHeader } from '../../../components/common/PageHeader';

export default function StudentMySubjects() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [classesData, setClassesData] = useState<any[]>([]);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const { data } = await api.get('/student/classes');
                setClassesData(data);
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

            <PageHeader
                title="My Subjects"
                subtitle="Overview of your enrolled subjects and teachers"
            />

            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
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
                                    color="teal"
                                    radius="md"
                                    leftSection={<IconSchool size={16} />}
                                    onClick={() => navigate('/student-portal/classes')}
                                    styles={{ root: { height: 44 } }}
                                >
                                    Access Portal
                                </Button>
                            </Group>
                        </Card>
                    ))
                )}
            </SimpleGrid>
        </Stack>
    );
}
