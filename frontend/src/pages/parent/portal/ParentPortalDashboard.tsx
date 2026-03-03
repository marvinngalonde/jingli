import { useQuery } from '@tanstack/react-query';
import {
    SimpleGrid, Paper, Text, Group, ThemeIcon, Badge, Card, Stack,
    Loader, Center, Avatar, Button, Progress, Table, Anchor
} from '@mantine/core';
import {
    IconUsers, IconCurrencyDollar, IconClipboardList, IconBrandZoom,
    IconChevronRight, IconFileAnalytics, IconBook, IconCalendar,
} from '@tabler/icons-react';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
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
}

interface Invoice {
    id: string;
    amount: number;
    status: string;
    dueDate: string;
    title?: string;
}

interface LiveClass {
    id: string;
    title: string;
    subject?: { name: string };
    scheduledFor: string;
    provider: string;
    status: string;
    meetingUrl: string;
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
        }
    });

    const children = dashboardData?.children || [];
    const invoices = dashboardData?.invoices || [];
    const liveClasses = dashboardData?.liveClasses || [];

    if (loading) return <Center h={400}><Loader /></Center>;

    const outstanding = invoices.reduce((s, i) => s + Number(i.amount || 0), 0);

    return (
        <div>
            <PageHeader
                title={`Welcome, ${user?.firstName || user?.profile?.firstName || 'Parent'} 👋`}
                subtitle="Your children's school overview"
            />

            {/* Stat strip */}
            <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="md" mb="xl">
                <Paper withBorder radius="md" p="lg" bg="var(--app-surface)" style={{ cursor: 'pointer' }} onClick={() => navigate('/parent-portal/performance')}>
                    <Group justify="space-between" mb="xs">
                        <ThemeIcon variant="light" color="teal" size="lg" radius="md"><IconUsers size={20} /></ThemeIcon>
                        <IconChevronRight size={14} color="var(--mantine-color-dimmed)" />
                    </Group>
                    <Text size="xl" fw={700}>{children.length}</Text>
                    <Text size="xs" c="dimmed">Children Enrolled</Text>
                </Paper>
                <Paper withBorder radius="md" p="lg" bg="var(--app-surface)" style={{ cursor: 'pointer' }} onClick={() => navigate('/parent-portal/fees')}>
                    <Group justify="space-between" mb="xs">
                        <ThemeIcon variant="light" color="red" size="lg" radius="md"><IconCurrencyDollar size={20} /></ThemeIcon>
                        <IconChevronRight size={14} color="var(--mantine-color-dimmed)" />
                    </Group>
                    <Text size="xl" fw={700}>${outstanding.toFixed(0)}</Text>
                    <Text size="xs" c="dimmed">Outstanding Fees</Text>
                </Paper>
                <Paper withBorder radius="md" p="lg" bg="var(--app-surface)" style={{ cursor: 'pointer' }} onClick={() => navigate('/parent-portal/live-classes')}>
                    <Group justify="space-between" mb="xs">
                        <ThemeIcon variant="light" color="blue" size="lg" radius="md"><IconBrandZoom size={20} /></ThemeIcon>
                        <IconChevronRight size={14} color="var(--mantine-color-dimmed)" />
                    </Group>
                    <Text size="xl" fw={700}>{liveClasses.length}</Text>
                    <Text size="xs" c="dimmed">Upcoming Live Classes</Text>
                </Paper>
            </SimpleGrid>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                {/* Children Cards */}
                <Card withBorder radius="md" p="lg" bg="var(--app-surface)">
                    <Group justify="space-between" mb="md">
                        <Group>
                            <ThemeIcon variant="light" color="teal" size="md" radius="md"><IconUsers size={16} /></ThemeIcon>
                            <Text fw={600}>My Children</Text>
                        </Group>
                        <Button variant="subtle" size="xs" onClick={() => navigate('/parent-portal/performance')}>View progress</Button>
                    </Group>
                    {children.length === 0 ? (
                        <Text c="dimmed" ta="center" py="md" size="sm">No children linked to your account.</Text>
                    ) : (
                        <Stack gap="sm">
                            {children.map(child => {
                                const avg = child.overallAverage ?? 0;
                                return (
                                    <Paper key={child.id} withBorder radius="md" p="md" bg="var(--app-surface-dim)">
                                        <Group justify="space-between">
                                            <Group>
                                                <Avatar radius="xl" color="teal" size="md">
                                                    {child.firstName?.[0]}
                                                </Avatar>
                                                <div>
                                                    <Text size="sm" fw={600}>{child.firstName} {child.lastName}</Text>
                                                    <Text size="xs" c="dimmed">
                                                        {child.section?.classLevel?.name || ''} {child.section?.name || ''} · {child.admissionNo}
                                                    </Text>
                                                </div>
                                            </Group>
                                            <div style={{ textAlign: 'right', minWidth: 80 }}>
                                                <Badge variant="light" color={avg >= 70 ? 'green' : avg >= 50 ? 'yellow' : 'red'} size="sm" mb={4}>
                                                    {avg > 0 ? `${avg.toFixed(0)}%` : 'N/A'}
                                                </Badge>
                                                {child.attendanceRate !== undefined && (
                                                    <Text size="xs" c="dimmed">Att: {child.attendanceRate}%</Text>
                                                )}
                                            </div>
                                        </Group>
                                    </Paper>
                                );
                            })}
                        </Stack>
                    )}
                </Card>

                {/* Outstanding Invoices */}
                <Card withBorder radius="md" p="lg" bg="var(--app-surface)">
                    <Group justify="space-between" mb="md">
                        <Group>
                            <ThemeIcon variant="light" color="red" size="md" radius="md"><IconCurrencyDollar size={16} /></ThemeIcon>
                            <Text fw={600}>Outstanding Fees</Text>
                        </Group>
                        <Button variant="subtle" size="xs" onClick={() => navigate('/parent-portal/fees')}>Pay now</Button>
                    </Group>
                    {invoices.length === 0 ? (
                        <Text c="dimmed" ta="center" py="md" size="sm">No outstanding fees 🎉</Text>
                    ) : (
                        <Stack gap="xs">
                            {invoices.map(inv => (
                                <Paper key={inv.id} withBorder radius="md" p="sm" bg="var(--app-surface-dim)">
                                    <Group justify="space-between">
                                        <div>
                                            <Text size="sm" fw={500}>{inv.title || 'Invoice'}</Text>
                                            <Text size="xs" c="dimmed">
                                                Due: {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'N/A'}
                                            </Text>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <Text fw={700} size="sm">${Number(inv.amount).toFixed(2)}</Text>
                                            <Badge variant="light" color={inv.status === 'OVERDUE' ? 'red' : 'orange'} size="xs">{inv.status}</Badge>
                                        </div>
                                    </Group>
                                </Paper>
                            ))}
                        </Stack>
                    )}
                </Card>

                {/* Upcoming Live Classes */}
                <Card withBorder radius="md" p="lg" bg="var(--app-surface)">
                    <Group justify="space-between" mb="md">
                        <Group>
                            <ThemeIcon variant="light" color="blue" size="md" radius="md"><IconBrandZoom size={16} /></ThemeIcon>
                            <Text fw={600}>Upcoming Live Classes</Text>
                        </Group>
                        <Button variant="subtle" size="xs" onClick={() => navigate('/parent-portal/live-classes')}>All classes</Button>
                    </Group>
                    {liveClasses.length === 0 ? (
                        <Text c="dimmed" ta="center" py="md" size="sm">No upcoming live classes</Text>
                    ) : (
                        <Stack gap="xs">
                            {liveClasses.map(c => (
                                <Paper key={c.id} withBorder radius="md" p="sm" bg="var(--app-surface-dim)">
                                    <Group justify="space-between">
                                        <div>
                                            <Text size="sm" fw={500}>{c.title}</Text>
                                            <Text size="xs" c="dimmed">{c.subject?.name} · {c.provider}</Text>
                                        </div>
                                        <Badge variant={c.status === 'LIVE' ? 'filled' : 'light'} color={c.status === 'LIVE' ? 'green' : 'blue'} size="xs">
                                            {c.status === 'LIVE' ? '● LIVE' : new Date(c.scheduledFor).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                        </Badge>
                                    </Group>
                                </Paper>
                            ))}
                        </Stack>
                    )}
                </Card>

                {/* Quick Links */}
                <Card withBorder radius="md" p="lg" bg="var(--app-surface)">
                    <Text fw={600} mb="md">Quick Access</Text>
                    <SimpleGrid cols={2} spacing="sm">
                        {[
                            { label: "Children's Progress", icon: IconUsers, to: '/parent-portal/performance', color: 'teal' },
                            { label: 'Report Cards', icon: IconFileAnalytics, to: '/parent-portal/reports', color: 'green' },
                            { label: 'Subjects & Materials', icon: IconBook, to: '/parent-portal/subjects', color: 'indigo' },
                            { label: 'School Calendar', icon: IconCalendar, to: '/parent-portal/calendar', color: 'blue' },
                        ].map(q => (
                            <Paper
                                key={q.label}
                                withBorder radius="md" p="md" ta="center" bg="var(--app-surface-dim)"
                                style={{ cursor: 'pointer', transition: 'transform 0.15s' }}
                                onClick={() => navigate(q.to)}
                                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')}
                                onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
                            >
                                <ThemeIcon variant="light" color={q.color} size="lg" radius="md" mx="auto" mb="xs">
                                    <q.icon size={20} />
                                </ThemeIcon>
                                <Text size="xs" fw={500}>{q.label}</Text>
                            </Paper>
                        ))}
                    </SimpleGrid>
                </Card>
            </SimpleGrid>
        </div>
    );
}
