import { Title, Text, Stack, Card, SimpleGrid, Group, ThemeIcon, LoadingOverlay, Badge, Timeline } from '@mantine/core';
import { IconCalendarEvent, IconBook, IconFileDescription, IconSchool } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { format } from 'date-fns';
import { PageHeader } from '../../../components/common/PageHeader';

export function StudentDashboard() {
    const { user } = useAuth();
    const { data, isLoading: loading } = useQuery({
        queryKey: ['studentDashboardStats'],
        queryFn: async () => {
            const [statsRes, scheduleRes] = await Promise.all([
                api.get('/student/dashboard-stats'),
                api.get('/student/schedule')
            ]);
            return { stats: statsRes.data, schedule: scheduleRes.data };
        }
    });

    const stats = data?.stats || {
        classesToday: 0,
        pendingAssignmentsCount: 0,
        gradedSubmissionsCount: 0
    };
    const schedule = data?.schedule || [];

    return (
        <Stack gap="lg" pos="relative">
            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

            <PageHeader
                title={`Welcome back, ${user?.profile?.firstName || 'Student'}!`}
                subtitle="Here's your learning overview for today."
            />

            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
                <Card withBorder radius="md" padding="xl" bg="gray.0">
                    <Group>
                        <ThemeIcon size="xl" radius="md" variant="light" color="blue">
                            <IconCalendarEvent size={26} />
                        </ThemeIcon>
                        <div>
                            <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Classes Today</Text>
                            <Text fw={700} size="xl">{stats.classesToday}</Text>
                        </div>
                    </Group>
                </Card>
                <Card withBorder radius="md" padding="xl" bg="gray.0">
                    <Group>
                        <ThemeIcon size="xl" radius="md" variant="light" color="orange">
                            <IconFileDescription size={26} />
                        </ThemeIcon>
                        <div>
                            <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Pending Tasks</Text>
                            <Text fw={700} size="xl">{stats.pendingAssignmentsCount}</Text>
                        </div>
                    </Group>
                </Card>
                <Card withBorder radius="md" padding="xl" bg="gray.0">
                    <Group>
                        <ThemeIcon size="xl" radius="md" variant="light" color="green">
                            <IconBook size={26} />
                        </ThemeIcon>
                        <div>
                            <Text c="dimmed" size="xs" tt="uppercase" fw={700}>New Grades</Text>
                            <Text fw={700} size="xl">{stats.gradedSubmissionsCount}</Text>
                        </div>
                    </Group>
                </Card>
            </SimpleGrid>

            {/* Timetable / Schedule */}
            <Title order={3} mt="md">Today's Schedule</Title>
            <Card withBorder radius="md" p="xl" bg="gray.0">
                {schedule.length === 0 ? (
                    <Text c="dimmed" fs="italic">You have no classes scheduled for today.</Text>
                ) : (
                    <Timeline active={-1} bulletSize={30} lineWidth={2}>
                        {schedule.map((period: any, index: number) => {
                            return (
                                <Timeline.Item
                                    key={index}
                                    bullet={<IconSchool size={16} />}
                                    title={<Text fw={500}>{period.subject.name} - <Badge size="sm" variant="outline">{period.subject.code}</Badge></Text>}
                                >
                                    <Text c="dimmed" size="sm" mt={4}>
                                        {format(new Date(`1970-01-01T${period.startTime}`), 'hh:mm a')} - {format(new Date(`1970-01-01T${period.endTime}`), 'hh:mm a')}
                                    </Text>
                                    <Text size="sm" mt={4}>
                                        <b>Teacher:</b> {period.teacher.firstName} {period.teacher.lastName}
                                        {period.room && ` | Room: ${period.room}`}
                                    </Text>
                                </Timeline.Item>
                            );
                        })}
                    </Timeline>
                )}
            </Card>

        </Stack>
    );
}

export default StudentDashboard;
