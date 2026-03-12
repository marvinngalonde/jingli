import {
    AppShell, Burger, Group, NavLink, Text, ScrollArea, Avatar, Menu,
    UnstyledButton, ActionIcon, Indicator, Tooltip, Box, Badge, TextInput,
    ThemeIcon, Divider
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
    IconLayoutDashboard, IconBook, IconClipboardList, IconFiles,
    IconBell, IconChevronDown, IconLogout, IconSettings, IconSearch,
    IconMessage, IconBrandZoom, IconTrophy, IconArrowLeft, IconSchool,
    IconMessageCircle, IconCalendar, IconBrain, IconUser,
    IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand,
} from '@tabler/icons-react';
import jaiLogo from '../assets/logos/jai-trans.png';
import { JingliAIDrawer } from '../components/ai/JingliAIDrawer';
import { NotificationsDrawer } from '../components/notifications/NotificationsDrawer';
import { notificationsService } from '../services/notificationsService';
import { useEffect, useState, useCallback } from 'react';
import { MobileBottomNav } from '../components/common/MobileBottomNav';
import type { NavItem } from '../types/nav';

const mainNavLinks = [
    { icon: IconLayoutDashboard, label: 'Dashboard', to: '/student-portal/dashboard', color: 'blue' },
    { icon: IconFiles, label: 'Course Materials', to: '/student-portal/materials', color: 'indigo' },
    { icon: IconClipboardList, label: 'Assignments', to: '/student-portal/assignments', color: 'orange' },
    { icon: IconBrain, label: 'CBT Quizzes', to: '/student-portal/cbt', color: 'grape' },
    { icon: IconCalendar, label: 'Exams', to: '/student-portal/exams', color: 'pink' },
    { icon: IconBrandZoom, label: 'Live Classes', to: '/student-portal/live-classes', color: 'cyan' },
];

const communityNavLinks = [
    { icon: IconMessageCircle, label: 'Discussions', to: '/student-portal/discussions', color: 'violet' },
    { icon: IconTrophy, label: 'Leaderboard', to: '/student-portal/leaderboard', color: 'yellow' },
];

const utilityNavLinks = [
    { icon: IconCalendar, label: 'Calendar', to: '/student-portal/calendar', color: 'blue' },
    { icon: IconMessage, label: 'Inbox', to: '/student-portal/inbox', color: 'gray' },
    { icon: IconBook, label: 'Library', to: '/student-portal/library', color: 'orange' },
];

const mobileNavLinks: NavItem[] = [
    { icon: IconLayoutDashboard, label: 'Dashboard', to: '/student-portal/dashboard', color: 'blue' },
    { icon: IconFiles, label: 'Materials', to: '/student-portal/materials', color: 'indigo' },
    { icon: IconClipboardList, label: 'Assignments', to: '/student-portal/assignments', color: 'orange' },
    { icon: IconCalendar, label: 'Exams', to: '/student-portal/exams', color: 'pink' },
    { icon: IconBrain, label: 'CBT', to: '/student-portal/cbt', color: 'grape' },
    { icon: IconMessageCircle, label: 'Discuss', to: '/student-portal/discussions', color: 'violet' },
];

export function StudentPortalLayout() {
    const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
    const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
    const [aiOpened, { open: openAi, close: closeAi }] = useDisclosure(false);
    const [notifOpened, { open: openNotif, close: closeNotif }] = useDisclosure(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const fetchUnreadCount = useCallback(async () => {
        try {
            const { count } = await notificationsService.getUnreadCount();
            setUnreadCount(count);
        } catch { /* ignore */ }
    }, []);

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 60_000);
        return () => clearInterval(interval);
    }, [fetchUnreadCount]);

    const isActive = (to: string) =>
        to === '/student-portal/dashboard'
            ? location.pathname === to
            : location.pathname.startsWith(to);

    const renderNavLink = (link: { icon: any; label: string; to: string; color: string }) => {
        const active = isActive(link.to);
        if (!desktopOpened) {
            return (
                <Tooltip label={link.label} key={link.label} position="right" withArrow>
                    <ActionIcon
                        size="xl"
                        variant={active ? 'light' : 'subtle'}
                        color={link.color}
                        onClick={() => { navigate(link.to); if (mobileOpened) toggleMobile(); }}
                        radius="md" my={2} mx="auto" style={{ display: 'flex' }}
                    >
                        <link.icon size={20} stroke={1.5} />
                    </ActionIcon>
                </Tooltip>
            );
        }
        return (
            <NavLink
                key={link.label}
                label={<Text size="sm" fw={active ? 600 : 400}>{link.label}</Text>}
                leftSection={
                    <ThemeIcon variant={active ? 'filled' : 'light'} color={link.color} size="md" radius="md">
                        <link.icon size={16} stroke={1.5} />
                    </ThemeIcon>
                }
                active={active}
                onClick={() => { navigate(link.to); if (mobileOpened) toggleMobile(); }}
                variant="light"
                color={link.color}
                py={8} my={2}
                style={{ borderRadius: 'var(--mantine-radius-md)', textDecoration: 'none' }}
            />
        );
    };

    return (
        <AppShell
            header={{ height: { base: 56, sm: 64 } }}
            navbar={{
                width: desktopOpened ? 260 : 80,
                breakpoint: 'sm',
                collapsed: { mobile: true }, // Always hide sidebar on mobile
            }}
            padding="md"
            styles={{ main: { background: 'var(--app-surface-dim)' } }}
        >
            {/* HEADER */}
            <AppShell.Header style={{ borderBottom: '1px solid var(--app-border-light)', background: 'var(--app-header-bg)' }}>
                <Group h="100%" px="lg" justify="space-between" wrap="nowrap">
                    <Group wrap="nowrap">
                        <Burger opened={mobileOpened} onClick={toggleMobile} hidden size="sm" />
                        <Group gap="xs" style={{ cursor: 'pointer' }} onClick={() => navigate('/student-portal/dashboard')}>
                            <IconSchool size={24} color="var(--mantine-color-teal-6)" />
                            <Text fw={700} size="lg" style={{ letterSpacing: '-0.02em' }} visibleFrom="xs">
                                <Text span c="teal" inherit>Student</Text> Portal
                            </Text>
                        </Group>
                    </Group>


                    <Group gap="sm" wrap="nowrap">
                        <Badge
                            variant="light"
                            color="blue"
                            size="md"
                            radius="md"
                            leftSection={<IconCalendar size={14} />}
                            styles={{ root: { textTransform: 'none' } }}
                            visibleFrom="sm"
                        >
                            2026 - Term 1
                        </Badge>

                        <ActionIcon variant="subtle" color="gray" size="lg" onClick={openNotif} pos="relative">
                            <Indicator
                                color="red"
                                size={unreadCount > 0 ? 16 : 0}
                                offset={4}
                                processing={unreadCount > 0}
                                label={unreadCount > 9 ? '9+' : unreadCount > 0 ? String(unreadCount) : undefined}
                                disabled={unreadCount === 0}
                            >
                                <IconBell size={20} stroke={1.5} />
                            </Indicator>
                        </ActionIcon>

                        <ActionIcon variant="subtle" color="blue" size="lg" onClick={openAi}>
                            <img src={jaiLogo} alt="AI" style={{ height: 18 }} />
                        </ActionIcon>

                        <Menu shadow="md" width={200} position="bottom-end">
                            <Menu.Target>
                                <UnstyledButton>
                                    <Group gap="xs">
                                        <Avatar radius="md" color="teal" size={32}>
                                            {user?.profile?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                                        </Avatar>
                                        <Box visibleFrom="sm">
                                            <IconChevronDown size={14} color="gray" />
                                        </Box>
                                    </Group>
                                </UnstyledButton>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Label>
                                    <Text size="sm" fw={500}>{user?.profile?.firstName} {user?.profile?.lastName}</Text>
                                    <Text size="xs" c="dimmed">{user?.email}</Text>
                                </Menu.Label>
                                <Menu.Divider />
                                <Menu.Item leftSection={<IconUser size={14} />} onClick={() => navigate('/student/profile')}>My Profile</Menu.Item>
                                <Menu.Item leftSection={<IconSettings size={14} />}>Settings</Menu.Item>
                                <Menu.Item color="red" leftSection={<IconLogout size={14} />} onClick={() => { logout(); navigate('/login'); }}>
                                    Logout
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Group>
                </Group>
            </AppShell.Header>

            {/* SIDEBAR */}
            <AppShell.Navbar style={{ backgroundColor: 'var(--app-sidebar-bg)', borderRight: '1px solid var(--app-border-light)' }} visibleFrom="sm">
                <AppShell.Section p={desktopOpened ? 'md' : 'xs'} style={{ borderBottom: '1px solid var(--app-border-light)' }}>
                    {desktopOpened ? (
                        <Group justify="space-between">
                            <Group>
                                <Avatar radius="md" color="teal" size={36}>
                                    {user?.profile?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                                </Avatar>
                                <div>
                                    <Text size="sm" fw={600} lh={1.2}>{user?.profile?.firstName} {user?.profile?.lastName}</Text>
                                    <Text size="xs" c="dimmed">Student</Text>
                                </div>
                            </Group>
                            <ActionIcon variant="subtle" color="gray" size="sm" onClick={toggleDesktop} visibleFrom="sm">
                                <IconLayoutSidebarLeftCollapse size={18} stroke={1.5} />
                            </ActionIcon>
                        </Group>
                    ) : (
                        <Tooltip label="Expand sidebar" position="right">
                            <ActionIcon variant="subtle" color="gray" size="lg" onClick={toggleDesktop} mx="auto" style={{ display: 'flex' }}>
                                <IconLayoutSidebarLeftExpand size={20} stroke={1.5} />
                            </ActionIcon>
                        </Tooltip>
                    )}
                </AppShell.Section>

                <AppShell.Section grow component={ScrollArea} mt="xs" scrollbarSize={6}>
                    <Box p="sm">
                        {desktopOpened && <Text size="xs" fw={700} c="dimmed" tt="uppercase" px="sm" mb={4}>Learning</Text>}
                        {mainNavLinks.map(renderNavLink)}

                        <Divider my="sm" />

                        {desktopOpened && <Text size="xs" fw={700} c="dimmed" tt="uppercase" px="sm" mb={4}>Community</Text>}
                        {communityNavLinks.map(renderNavLink)}

                        <Divider my="sm" />

                        {desktopOpened && <Text size="xs" fw={700} c="dimmed" tt="uppercase" px="sm" mb={4}>Utilities</Text>}
                        {utilityNavLinks.map(renderNavLink)}
                    </Box>
                </AppShell.Section>

                <AppShell.Section p="sm" style={{ borderTop: '1px solid var(--app-border-light)' }}>
                    {desktopOpened ? (
                        <NavLink
                            label={<Text size="sm" fw={500}>Back to Dashboard</Text>}
                            leftSection={
                                <ThemeIcon variant="light" color="gray" size="md" radius="md">
                                    <IconArrowLeft size={16} stroke={1.5} />
                                </ThemeIcon>
                            }
                            onClick={() => navigate('/student/dashboard')}
                            py={8}
                            style={{ borderRadius: 'var(--mantine-radius-md)' }}
                        />
                    ) : (
                        <Tooltip label="Back to Dashboard" position="right">
                            <ActionIcon variant="subtle" color="gray" size="xl" onClick={() => navigate('/student/dashboard')} mx="auto" style={{ display: 'flex' }}>
                                <IconArrowLeft size={20} stroke={1.5} />
                            </ActionIcon>
                        </Tooltip>
                    )}
                </AppShell.Section>
            </AppShell.Navbar>

            <AppShell.Main>
                <Outlet />
            </AppShell.Main>

            <MobileBottomNav links={mobileNavLinks} />

            <JingliAIDrawer opened={aiOpened} onClose={closeAi} />
            <NotificationsDrawer opened={notifOpened} onClose={closeNotif} />
        </AppShell>
    );
}

export default StudentPortalLayout;
