import { useQuery } from '@tanstack/react-query';
import {
    SimpleGrid, Paper, Text, Group, ThemeIcon, Badge, Card, Stack,
    Loader, Center, Avatar, Button, Progress, Table, Anchor, Container, Grid,
    LoadingOverlay, Title
} from '@mantine/core';
import {
    IconUsers, IconCurrencyDollar, IconClipboardList, IconBrandZoom,
    IconChevronRight, IconFileAnalytics, IconBook, IconCalendar,
    IconTrophy, IconBrain, IconArrowRight
} from '@tabler/icons-react';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/common/PageHeader';

interface Child {
    id: string;
    firstName: string;
    lastName: string;
    admissionNo?: string;
    section?: { name: string; classLevel?: { name: string } };
    overallAverage?: number;
    attendanceRate?: number;
    pendingAssignments?: number;
    photoUrl?: string;
}

export default function ParentPortalDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { data: dashboardData, isLoading: loading } = useQuery({
        queryKey: ['parentPortalDashboard'],
        queryFn: async () => {
            const [childrenRes, invoiceRes, liveRes] = await Promise.allSettled([
                api.get('/parent/children'),
                api.get('/invoices'),
                api.get('/live-classes'),
            ]);

            const ch = childrenRes.status === 'fulfilled' ? (childrenRes.value.data || []) : [];
            const inv = invoiceRes.status === 'fulfilled' ? (invoiceRes.value.data || []) : [];
            const live = liveRes.status === 'fulfilled' ? (liveRes.value.data || []) : [];

            return {
                children: Array.isArray(ch) ? ch : [],
                invoices: Array.isArray(inv) ? inv.filter((i: any) => i.status === 'UNPAID' || i.status === 'OVERDUE').slice(0, 5) : [],
                liveClasses: Array.isArray(live) ? live.filter((l: any) => l.status === 'SCHEDULED' || l.status === 'LIVE').slice(0, 3) : []
            };
        },
        retry: false
    });

    const children = dashboardData?.children || [];
    const invoices = dashboardData?.invoices || [];
    const liveClasses = dashboardData?.liveClasses || [];

    return (
        <Container size="xl" p="md">
            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

            <PageHeader
                title={`Academic Hub 🧠`}
                subtitle={`Welcome, ${user?.firstName || 'Parent'}. Monitoring your children's educational progress.`}
            />

            <Grid gutter="lg">
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Stack gap="lg">
                        {/* Children Progress Explorer */}
                        <Card withBorder radius="lg" p="xl" bg="var(--app-surface)">
                            <Group justify="space-between" mb="xl">
                                <Group gap="sm">
                                    <ThemeIcon variant="light" color="teal" size="lg" radius="md">
                                        <IconUsers size={20} />
                                    </ThemeIcon>
                                    <Title order={4}>My Children's Progress</Title>
                                </Group>
                                <Button variant="subtle" size="xs" onClick={() => navigate('/parent-portal/performance')}>Deep Analysis</Button>
                            </Group>

                            {children.length === 0 ? (
                                <Text c="dimmed" ta="center" py="xl">No children linked to your account.</Text>
                            ) : (
                                <Stack gap="md">
                                    {children.map(child => {
                                        const avg = child.overallAverage ?? 0;
                                        return (
                                            <Paper key={child.id} withBorder radius="lg" p="lg" bg="var(--app-surface-dim)" style={{
                                                transition: 'transform 0.1s',
                                                cursor: 'pointer'
                                            }} onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                                                onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
                                                onClick={() => navigate('/parent-portal/performance')}
                                            >
                                                <Group justify="space-between" wrap="nowrap">
                                                    <Group wrap="nowrap">
                                                        <Avatar src={child.photoUrl} radius="lg" color="teal" size={60}>
                                                            {child.firstName?.[0]}
                                                        </Avatar>
                                                        <div>
                                                            <Text size="md" fw={700}>{child.firstName} {child.lastName}</Text>
                                                            <Text size="xs" c="dimmed" mb={4}>
                                                                {child.section?.classLevel?.name || ''} {child.section?.name || ''}
                                                            </Text>
                                                            <Group gap="xs">
                                                                <Badge variant="light" color="teal" size="xs">Att: {child.attendanceRate || 0}%</Badge>
                                                                <Badge variant="light" color="blue" size="xs">{child.pendingAssignments || 0} Pending</Badge>
                                                            </Group>
                                                        </div>
                                                    </Group>

                                                    <Stack gap={2} align="flex-end">
                                                        <Text size="xs" fw={700} c="dimmed" tt="uppercase">Overall Avg</Text>
                                                        <Title order={2} c={avg >= 70 ? 'teal' : avg >= 50 ? 'orange' : 'red'}>
                                                            {avg > 0 ? `${avg.toFixed(0)}%` : 'N/A'}
                                                        </Title>
                                                    </Stack>
                                                </Group>
                                                <Progress value={avg} color={avg >= 70 ? 'teal' : avg >= 50 ? 'orange' : 'red'} mt="md" radius="xl" size="sm" />
                                            </Paper>
                                        );
                                    })}
                                </Stack>
                            )}
                        </Card>

                        {/* Recent Academic Activity */}
                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                            <Card withBorder radius="lg" p="xl" bg="var(--app-surface)">
                                <Group mb="md">
                                    <ThemeIcon variant="light" color="blue" size="md" radius="md"><IconBrandZoom size={18} /></ThemeIcon>
                                    <Text fw={600}>Live Classes</Text>
                                </Group>
                                {liveClasses.length === 0 ? (
                                    <Text size="sm" c="dimmed" ta="center" py="md">No classes scheduled</Text>
                                ) : (
                                    <Stack gap="xs">
                                        {liveClasses.map(l => (
                                            <Paper key={l.id} p="sm" radius="md" bg="var(--app-surface-dim)" withBorder>
                                                <Text size="xs" fw={700} c="blue">{l.subject?.name}</Text>
                                                <Text size="sm" fw={500} lineClamp={1}>{l.title}</Text>
                                                <Text size="xs" c="dimmed">{new Date(l.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                            </Paper>
                                        ))}
                                    </Stack>
                                )}
                                <Button variant="light" mt="md" fullWidth color="blue" onClick={() => navigate('/parent-portal/live-classes')}>View Schedule</Button>
                            </Card>

                            <Card withBorder radius="lg" p="xl" bg="var(--app-surface)">
                                <Group mb="md">
                                    <ThemeIcon variant="light" color="orange" size="md" radius="md"><IconClipboardList size={18} /></ThemeIcon>
                                    <Text fw={600}>Assignments</Text>
                                </Group>
                                <Text size="sm" c="dimmed" mb="lg">Review upcoming deadlines and recently submitted work for all children.</Text>
                                <Button variant="light" fullWidth color="orange" onClick={() => navigate('/parent-portal/assignments')}>Open Assignments</Button>
                            </Card>
                        </SimpleGrid>
                    </Stack>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Stack gap="lg">
                        {/* Achievements Snippet */}
                        <Card withBorder radius="lg" p="xl" bg="var(--app-surface)" style={{ background: 'linear-gradient(135deg, var(--mantine-color-yellow-0) 0%, var(--mantine-color-orange-0) 100%)' }}>
                            <Group mb="md">
                                <ThemeIcon variant="light" color="yellow.7" size="lg" radius="md">
                                    <IconTrophy size={22} />
                                </ThemeIcon>
                                <Title order={4} c="yellow.9">Leaderboards</Title>
                            </Group>
                            <Text size="sm" c="yellow.9" mb="lg">See where your children stand in their respective classes and houses.</Text>
                            <Button variant="filled" color="yellow.7" fullWidth onClick={() => navigate('/parent-portal/performance')}>View Leaderboards</Button>
                        </Card>

                        {/* Learning Materials */}
                        <Card withBorder radius="lg" p="xl" bg="var(--app-surface)">
                            <Group mb="md">
                                <ThemeIcon variant="light" color="indigo" size="lg" radius="md">
                                    <IconBook size={20} />
                                </ThemeIcon>
                                <Title order={4}>Subject Resources</Title>
                            </Group>
                            <Text size="sm" c="dimmed" mb="lg">Access curriculum materials, lecture notes, and study guides.</Text>
                            <Button variant="outline" color="indigo" fullWidth leftSection={<IconBrain size={16} />} onClick={() => navigate('/parent-portal/subjects')}>Material Library</Button>
                        </Card>

                        {/* Quick Actions */}
                        <Card withBorder radius="lg" p="xl" bg="var(--app-surface)">
                            <Title order={5} mb="md">Management Links</Title>
                            <Stack gap="xs">
                                <Button variant="subtle" fullWidth color="red" justify="flex-start" leftSection={<IconCurrencyDollar size={16} />} onClick={() => navigate('/parent/fees')}>Fees & Invoices</Button>
                                <Button variant="subtle" fullWidth color="blue" justify="flex-start" leftSection={<IconCalendar size={16} />} onClick={() => navigate('/parent-portal/calendar')}>School Calendar</Button>
                                <Button variant="subtle" fullWidth color="teal" justify="flex-start" leftSection={<IconArrowRight size={16} />} onClick={() => navigate('/parent/dashboard')}>Admin Overview</Button>
                            </Stack>
                        </Card>
                    </Stack>
                </Grid.Col>
            </Grid>
        </Container>
    );
}
