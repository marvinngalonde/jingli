import {
    Title,
    Text,
    Stack,
    Card,
    SimpleGrid,
    Group,
    ThemeIcon,
    Select,
    LoadingOverlay,
    Paper,
    Avatar,
    Badge,
    Button,
    Divider,
    Box,
    Container,
    Grid
} from '@mantine/core';
import {
    IconChartBar,
    IconCalendarEvent,
    IconUsers,
    IconArrowRight,
    IconCurrencyDollar,
    IconMessageCircle,
    IconSpeakerphone,
    IconCircleCheck,
    IconAlertCircle
} from '@tabler/icons-react';
import { useAuth } from '../../../context/AuthContext';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/common/PageHeader';

interface Child {
    id: string;
    firstName: string;
    lastName: string;
    admissionNo: string;
    photoUrl?: string;
    section: {
        name: string;
        classLevel: { name: string };
    };
    attendanceRate?: number;
    overallAverage?: number;
}

export default function ParentDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

    const { data: childrenData, isLoading: loadingChildren } = useQuery({
        queryKey: ['parentChildren'],
        queryFn: async () => {
            const { data } = await api.get('/parent/children');
            return data as Child[];
        },
        retry: false
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
                pendingFees: data.pendingFees || 0,
                unreadMessages: 0,
                classesToday: data.classesToday || 0,
                pendingAssignments: data.pendingAssignmentsCount || 0,
                gradedSubmissions: data.gradedSubmissionsCount || 0
            };
        },
        enabled: !!selectedChildId,
        retry: false
    });

    const { data: noticesData } = useQuery({
        queryKey: ['notices'],
        queryFn: async () => {
            const { data } = await api.get('/notices');
            return data.slice(0, 3);
        }
    });

    const stats = statsData || { upcomingEvents: 0, pendingFees: 0, unreadMessages: 0, classesToday: 0, pendingAssignments: 0, gradedSubmissions: 0 };
    const loading = loadingChildren || (!!selectedChildId && loadingStats);
    const activeChild = children.find(c => c.id === selectedChildId);

    return (
        <Container size="xl" p="md">
            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

            <PageHeader
                title={`Welcome Back, ${user?.firstName || 'Parent'}!`}
                subtitle="Here's a management overview for your children's activities."
            />

            {/* Selection & Header */}
            <Paper p="xl" radius="lg" mb="xl" withBorder style={{
                background: 'linear-gradient(135deg, var(--mantine-color-blue-0) 0%, var(--mantine-color-indigo-0) 100%)',
                borderColor: 'var(--mantine-color-blue-2)'
            }}>
                <Group justify="space-between">
                    <Group gap="lg">
                        <Avatar color="blue" size={60} radius="xl">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </Avatar>
                        <div>
                            <Title order={3}>Account Overview</Title>
                            <Text size="sm" c="dimmed">{children.length} Children Enrolled · Term 1, 2026</Text>
                        </div>
                    </Group>

                    {children.length > 0 && (
                        <Select
                            label="Viewing data for:"
                            placeholder="Select Child"
                            data={children.map(c => ({ value: c.id, label: `${c.firstName} ${c.lastName}` }))}
                            value={selectedChildId}
                            onChange={setSelectedChildId}
                            leftSection={<IconUsers size={16} />}
                            style={{ width: 280 }}
                            radius="md"
                        />
                    )}
                </Group>
            </Paper>

            <Grid gutter="lg">
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Stack gap="lg">
                        {/* Active Child Summary */}
                        {activeChild && (
                            <Card withBorder radius="lg" p="xl" bg="var(--app-surface)">
                                <Group justify="space-between" mb="xl">
                                    <Group gap="md">
                                        <Avatar src={activeChild.photoUrl} size={80} radius="lg" color="blue">
                                            {activeChild.firstName[0]}{activeChild.lastName[0]}
                                        </Avatar>
                                        <div>
                                            <Title order={3}>{activeChild.firstName} {activeChild.lastName}</Title>
                                            <Group gap="xs">
                                                <Badge color="blue" variant="light">{activeChild.section.classLevel.name} {activeChild.section.name}</Badge>
                                                <Text size="xs" c="dimmed">Adm: {activeChild.admissionNo}</Text>
                                            </Group>
                                        </div>
                                    </Group>
                                    <Button
                                        variant="filled"
                                        color="blue"
                                        radius="md"
                                        rightSection={<IconArrowRight size={16} />}
                                        onClick={() => navigate('/parent-portal/dashboard')}
                                    >
                                        Enter Learning Portal
                                    </Button>
                                </Group>

                                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                                    <Paper p="md" radius="md" bg="blue.0">
                                        <Group gap="xs" mb={4}>
                                            <ThemeIcon size="xs" color="blue" variant="transparent"><IconCalendarEvent size={14} /></ThemeIcon>
                                            <Text size="xs" fw={700} tt="uppercase" c="blue.7">Classes Today</Text>
                                        </Group>
                                        <Text fw={700} size="xl">{stats.classesToday}</Text>
                                    </Paper>
                                    <Paper p="md" radius="md" bg="red.0">
                                        <Group gap="xs" mb={4}>
                                            <ThemeIcon size="xs" color="red" variant="transparent"><IconAlertCircle size={14} /></ThemeIcon>
                                            <Text size="xs" fw={700} tt="uppercase" c="red.7">Pending Tasks</Text>
                                        </Group>
                                        <Text fw={700} size="xl">{stats.pendingAssignments}</Text>
                                    </Paper>
                                    <Paper p="md" radius="md" bg="teal.0">
                                        <Group gap="xs" mb={4}>
                                            <ThemeIcon size="xs" color="teal" variant="transparent"><IconCircleCheck size={14} /></ThemeIcon>
                                            <Text size="xs" fw={700} tt="uppercase" c="teal.7">Graded</Text>
                                        </Group>
                                        <Text fw={700} size="xl">{stats.gradedSubmissions}</Text>
                                    </Paper>
                                </SimpleGrid>
                            </Card>
                        )}

                        {/* Financial Quick Glance */}
                        <Card withBorder radius="lg" p="xl" bg="var(--app-surface)">
                            <Group justify="space-between" mb="lg">
                                <Group gap="sm">
                                    <ThemeIcon variant="light" color="red" size="lg" radius="md">
                                        <IconCurrencyDollar size={20} />
                                    </ThemeIcon>
                                    <Title order={4}>Fees & Payments</Title>
                                </Group>
                                <Button variant="subtle" color="red" onClick={() => navigate('/parent/fees')}>Manage Account</Button>
                            </Group>

                            <Paper p="lg" radius="md" withBorder bg="red.0" style={{ borderColor: 'var(--mantine-color-red-2)' }}>
                                <Group justify="space-between">
                                    <div>
                                        <Text size="sm" c="red.9" fw={500}>Outstanding Balance</Text>
                                        <Title order={2} c="red.9">${Number(stats.pendingFees || 0).toFixed(2)}</Title>
                                    </div>
                                    <Button color="red" radius="md">Pay Now</Button>
                                </Group>
                            </Paper>
                        </Card>
                    </Stack>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Stack gap="lg">
                        {/* Notice Board */}
                        <Card withBorder radius="lg" p="xl" bg="var(--app-surface)">
                            <Group mb="lg">
                                <ThemeIcon variant="light" color="orange" size="lg" radius="md">
                                    <IconSpeakerphone size={20} />
                                </ThemeIcon>
                                <Title order={4}>Latest Notices</Title>
                            </Group>

                            <Stack gap="md">
                                {noticesData?.map((notice: any) => (
                                    <Box key={notice.id} p="sm" style={{ borderLeft: '3px solid var(--mantine-color-orange-6)', background: 'var(--mantine-color-gray-0)', borderRadius: 'var(--mantine-radius-md)' }}>
                                        <Text size="sm" fw={600} mb={2} lineClamp={1}>{notice.title}</Text>
                                        <Text size="xs" c="dimmed" mb={4}>{new Date(notice.createdAt).toLocaleDateString()}</Text>
                                        <Text size="xs" c="dimmed" lineClamp={2}>{notice.content}</Text>
                                    </Box>
                                ))}
                                {(!noticesData || noticesData.length === 0) && (
                                    <Text size="sm" c="dimmed" ta="center" py="xl">No recent notices.</Text>
                                )}
                                <Button variant="light" color="orange" fullWidth mt="sm">View All Board</Button>
                            </Stack>
                        </Card>

                        {/* Recent Community Activity */}
                        <Card withBorder radius="lg" p="xl" bg="var(--app-surface)">
                            <Group mb="lg">
                                <ThemeIcon variant="light" color="violet" size="lg" radius="md">
                                    <IconMessageCircle size={20} />
                                </ThemeIcon>
                                <Title order={4}>Recent Discussions</Title>
                            </Group>
                            <Text size="sm" c="dimmed" fs="italic" ta="center" py="xl">
                                Join our school community for latest updates and discussions.
                            </Text>
                            <Button variant="light" color="violet" fullWidth>Open Community</Button>
                        </Card>
                    </Stack>
                </Grid.Col>
            </Grid>
        </Container>
    );
}
