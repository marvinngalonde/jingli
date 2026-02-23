import { Title, Text, Stack, Card, SimpleGrid, Group, ThemeIcon, LoadingOverlay, Button, ActionIcon } from '@mantine/core';
import { IconBooks, IconFileDescription, IconClipboardList } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export function StudentClasses() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [classesData, setClassesData] = useState<any[]>([]);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                // We'll reuse the teacher classes endpoint structure for simplicity in the mockup, 
                // but actually we need a specific student endpoint to fetch enrolled subjects.
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

            <div>
                <Title order={2}>My Classes</Title>
                <Text c="dimmed">Select a class to view materials and assignments.</Text>
            </div>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
                {classesData.length === 0 && !loading ? (
                    <Text fs="italic" c="dimmed">You are not enrolled in any classes yet.</Text>
                ) : (
                    classesData.map((cls) => (
                        <Card key={cls.id} withBorder radius="md" padding="xl" shadow="sm">
                            <Group justify="space-between" mb="xs">
                                <ThemeIcon size="xl" radius="md" variant="light" color="blue">
                                    <IconBooks size={26} />
                                </ThemeIcon>
                            </Group>
                            <Text fw={500} size="lg" mt="md">{cls.subject.name}</Text>
                            <Text size="sm" c="dimmed">{cls.subject.code} • Teacher: {cls.teacher.firstName} {cls.teacher.lastName}</Text>

                            <Group grow mt="xl">
                                <Button variant="light" color="grape" leftSection={<IconFileDescription size={16} />} onClick={() => navigate(`/student/classes/${cls.subjectId}/materials`)}>
                                    Materials
                                </Button>
                                <Button variant="light" color="orange" leftSection={<IconClipboardList size={16} />} onClick={() => navigate(`/student/classes/${cls.subjectId}/assignments`)}>
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

export default StudentClasses;
