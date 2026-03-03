import { Title, Text, Stack, Card, SimpleGrid, Group, ThemeIcon, Select, LoadingOverlay } from '@mantine/core';
import { IconChartBar, IconCalendarEvent, IconUsers } from '@tabler/icons-react';
import { useAuth } from '../../../context/AuthContext';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../services/api';

interface Child {
    id: string;
    firstName: string;
    lastName: string;
    admissionNo: string;
    section: {
        name: string;
        classLevel: { name: string };
    };
}

export function ParentDashboard() {
    const { user } = useAuth();
    const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

    const { data: childrenData, isLoading: loadingChildren } = useQuery({
        queryKey: ['parentChildren'],
        queryFn: async () => {
            const { data } = await api.get('/parent/children');
            return data as Child[];
        }
    });

    const children = childrenData || [];

    useEffect(() => {
        if (children.length > 0 && !selectedChildId) {
            setSelectedChildId(children[0].id);
        }
    }, [children, selectedChildId]);

    const { data: statsData, isLoading: loadingStats } = useQuery({
        queryKey: ['parentDashboardStats', selectedChildId],
        queryFn: async () => {
            const { data } = await api.get(`/parent/dashboard-stats/${selectedChildId}`);
            return {
                upcomingEvents: 0,
                pendingFees: '$0',
                unreadMessages: 0,
                classesToday: data.classesToday || 0,
                pendingAssignments: data.pendingAssignmentsCount || 0,
                gradedSubmissions: data.gradedSubmissionsCount || 0
            };
        },
        enabled: !!selectedChildId
    });

    const stats = statsData || { upcomingEvents: 0, pendingFees: '$0', unreadMessages: 0, classesToday: 0, pendingAssignments: 0, gradedSubmissions: 0 };
    const loading = loadingChildren || (!!selectedChildId && loadingStats);

    const activeChild = children.find(c => c.id === selectedChildId);

    return (
        <Stack gap="lg" pos="relative">
            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

            <Group justify="space-between" align="flex-start">
                <div>
                    <Title order={2}>Welcome, {user?.firstName || 'Parent'}!</Title>
                    <Text c="dimmed">Here's an overview of your child's activities.</Text>
                </div>

                {children.length > 0 && (
                    <Select
                        leftSection={<IconUsers size={16} />}
                        placeholder="Select Child"
                        data={children.map(c => ({ value: c.id, label: `${c.firstName} ${c.lastName}` }))}
                        value={selectedChildId}
                        onChange={setSelectedChildId}
                        style={{ width: 250 }}
                    />
                )}
            </Group>

            {activeChild && (
                <Card withBorder radius="md" p="md" bg="blue.0">
                    <Group align="center">
                        <ThemeIcon size={50} radius="100%" color="blue" variant="light">
                            <IconUsers size={28} />
                        </ThemeIcon>
                        <div>
                            <Text size="xl" fw={700}>{activeChild.firstName} {activeChild.lastName}</Text>
                            <Group gap="xs">
                                <Text size="sm" c="dimmed">Enrolled in:</Text>
                                <Text size="sm" fw={500} c="dark">{activeChild.section.classLevel.name} - {activeChild.section.name}</Text>
                            </Group>
                        </div>
                    </Group>
                </Card>
            )}

            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                <Card withBorder radius="md" p="md">
                    <Group justify="space-between">
                        <div>
                            <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Classes Today</Text>
                            <Text fw={700} size="xl">{stats.classesToday}</Text>
                        </div>
                        <ThemeIcon color="blue" variant="light" size={38} radius="md">
                            <IconCalendarEvent size={24} />
                        </ThemeIcon>
                    </Group>
                </Card>

                <Card withBorder radius="md" p="md">
                    <Group justify="space-between">
                        <div>
                            <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Pending Homework</Text>
                            <Text fw={700} size="xl" c={stats.pendingAssignments > 0 ? 'red' : 'dark'}>{stats.pendingAssignments}</Text>
                        </div>
                        <ThemeIcon color="red" variant="light" size={38} radius="md">
                            <IconChartBar size={24} />
                        </ThemeIcon>
                    </Group>
                </Card>

                <Card withBorder radius="md" p="md">
                    <Group justify="space-between">
                        <div>
                            <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Recent Grades</Text>
                            <Text fw={700} size="xl">{stats.gradedSubmissions}</Text>
                        </div>
                        <ThemeIcon color="grape" variant="light" size={38} radius="md">
                            <IconChartBar size={24} />
                        </ThemeIcon>
                    </Group>
                </Card>
            </SimpleGrid>

            {/* Quick Actions / Activity Feed placeholder */}
            <Card withBorder radius="md" p="md" mt="md">
                <Title order={4} mb="md">Recent Activity</Title>
                <Text c="dimmed" fs="italic">No recent activity found for {activeChild?.firstName || 'this child'}.</Text>
            </Card>
        </Stack>
    );
}

export default ParentDashboard;
