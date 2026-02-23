import { Title, Text, SimpleGrid, Card, Group, ThemeIcon, Stack, Button, LoadingOverlay, Badge, Table, ActionIcon } from '@mantine/core';
import { IconClock, IconUsers, IconFileAnalytics, IconNotebook, IconCalendarEvent, IconPlus, IconUpload, IconMessage, IconArrowRight } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface DashboardStats {
    classesToday: number;
    totalStudents: number;
    activeAssignments: number;
    ungraded: number;
}

interface ScheduleItem {
    id: string;
    startTime: string;
    endTime: string;
    roomNo: string | null;
    subject: {
        name: string;
        code: string;
    };
    section: {
        id: string;
        name: string;
        classLevel: {
            name: string;
        };
    };
}

export function TeacherDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, scheduleRes] = await Promise.all([
                    api.get('/teacher/dashboard-stats'),
                    api.get('/teacher/schedule')
                ]);
                setStats(statsRes.data);
                setSchedule(scheduleRes.data);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);
    return (
        <Stack gap="lg" pos="relative">
            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
            <div>
                <Title order={2}>Welcome back, {user?.profile?.firstName || 'Teacher'}!</Title>
                <Text c="dimmed">Here's your schedule and overview for today.</Text>
            </div>

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
                <Card withBorder radius="md" p="md">
                    <Group>
                        <ThemeIcon size={40} radius="md" variant="light" color="blue">
                            <IconClock size={24} />
                        </ThemeIcon>
                        <div>
                            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Classes Today</Text>
                            <Text size="xl" fw={700}>{stats?.classesToday || 0}</Text>
                        </div>
                    </Group>
                </Card>
                <Card withBorder radius="md" p="md">
                    <Group>
                        <ThemeIcon size={40} radius="md" variant="light" color="green">
                            <IconUsers size={24} />
                        </ThemeIcon>
                        <div>
                            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Total Students</Text>
                            <Text size="xl" fw={700}>{stats?.totalStudents || 0}</Text>
                        </div>
                    </Group>
                </Card>
                <Card withBorder radius="md" p="md">
                    <Group>
                        <ThemeIcon size={40} radius="md" variant="light" color="orange">
                            <IconFileAnalytics size={24} />
                        </ThemeIcon>
                        <div>
                            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Ungraded</Text>
                            <Text size="xl" fw={700}>{stats?.ungraded || 0}</Text>
                        </div>
                    </Group>
                </Card>
                <Card withBorder radius="md" p="md">
                    <Group>
                        <ThemeIcon size={40} radius="md" variant="light" color="grape">
                            <IconNotebook size={24} />
                        </ThemeIcon>
                        <div>
                            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Active Assignments</Text>
                            <Text size="xl" fw={700}>{stats?.activeAssignments || 0}</Text>
                        </div>
                    </Group>
                </Card>
            </SimpleGrid>

            {/* Quick Actions Panel */}
            <Card withBorder radius="md" p="md">
                <Title order={4} mb="md">Quick Actions</Title>
                <Group>
                    <Button
                        variant="light"
                        leftSection={<IconPlus size={16} />}
                        onClick={() => navigate('/teacher/assignments')}
                    >
                        Create Assignment
                    </Button>
                    <Button
                        variant="light"
                        color="grape"
                        leftSection={<IconUpload size={16} />}
                        onClick={() => navigate('/teacher/materials')}
                    >
                        Upload Material
                    </Button>
                    <Button
                        variant="light"
                        color="teal"
                        leftSection={<IconMessage size={16} />}
                        onClick={() => navigate('/teacher/inbox')}
                    >
                        Message Parents
                    </Button>
                </Group>
            </Card>

            <SimpleGrid cols={{ base: 1, lg: 2 }} mt="md">
                <Card withBorder radius="md" p="md">
                    <Group justify="space-between" mb="md">
                        <Group gap="xs">
                            <IconCalendarEvent size={20} color="var(--mantine-color-brand-6)" />
                            <Title order={4}>Today's Schedule</Title>
                        </Group>
                        <Badge variant="light">
                            {format(new Date(), 'EEEE, do MMM')}
                        </Badge>
                    </Group>

                    {schedule.length === 0 ? (
                        <Text c="dimmed" fs="italic" ta="center" py="xl">No classes scheduled for today.</Text>
                    ) : (
                        <Table verticalSpacing="sm">
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Time</Table.Th>
                                    <Table.Th>Subject</Table.Th>
                                    <Table.Th>Class</Table.Th>
                                    <Table.Th>Room</Table.Th>
                                    <Table.Th></Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {schedule.map((item) => (
                                    <Table.Tr key={item.id}>
                                        <Table.Td>
                                            <Text fw={500}>{format(new Date(item.startTime), 'HH:mm')} - {format(new Date(item.endTime), 'HH:mm')}</Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text fw={500}>{item.subject.name}</Text>
                                            <Text size="xs" c="dimmed">{item.subject.code}</Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge variant="dot" color="blue">{item.section.classLevel.name} {item.section.name}</Badge>
                                        </Table.Td>
                                        <Table.Td>{item.roomNo || '-'}</Table.Td>
                                        <Table.Td>
                                            <Button variant="light" size="xs" onClick={() => navigate(`/teacher/classes/${item.section.id}/students`)}>
                                                Take Attendance
                                            </Button>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    )}
                </Card>

                {/* Pending Tasks Placeholder */}
                <Card withBorder radius="md" p="md">
                    <Group justify="space-between" mb="md">
                        <Title order={4}>Needs Grading</Title>
                        <ActionIcon variant="subtle" onClick={() => navigate('/teacher/grading')}>
                            <IconArrowRight size={18} />
                        </ActionIcon>
                    </Group>
                    <Text c="dimmed" fs="italic">You have {stats?.ungraded || 0} submissions waiting to be graded.</Text>
                    {stats?.ungraded ? (
                        <Button mt="md" variant="filled" onClick={() => navigate('/teacher/grading')}>
                            Grade Now
                        </Button>
                    ) : null}
                </Card>
            </SimpleGrid>
        </Stack>
    );
}

export default TeacherDashboard;
