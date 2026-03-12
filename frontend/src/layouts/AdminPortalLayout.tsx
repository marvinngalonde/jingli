import { AppShell, Burger, Group, NavLink, Text, ScrollArea, Avatar, Menu, UnstyledButton, ActionIcon, Indicator, Tooltip, Box, Badge, TextInput, ThemeIcon, Divider } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
    IconLayoutDashboard,
    IconChalkboard,
    IconCalendar,
    IconClipboardList,
    IconFiles,
    IconFileAnalytics,
    IconBell,
    IconChevronDown,
    IconLogout,
    IconSettings,
    IconSearch,
    IconMessage,
    IconBrandZoom,
    IconPencil,
    IconTrophy,
    IconChartBar,
    IconArrowLeft,
    IconSchool,
    IconMessageCircle,
    IconBook,
    IconLayoutSidebarLeftCollapse,
    IconLayoutSidebarLeftExpand,
} from '@tabler/icons-react';

import logoFull from '../assets/logos/logo-trans.png';
import jaiLogo from '../assets/logos/jai-trans.png';
import { JingliAIDrawer } from '../components/ai/JingliAIDrawer';
import { NotificationsDrawer } from '../components/notifications/NotificationsDrawer';
import { notificationsService } from '../services/notificationsService';
import { isAdminRole, isTeacherRole } from '../utils/roles';
import { useEffect, useState, useCallback } from 'react';

function AdminPortalLayout() {
    const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
    const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
    const [aiOpened, { open: openAi, close: closeAi }] = useDisclosure(false);
    const [notifOpened, { open: openNotif, close: closeNotif }] = useDisclosure(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const userRole = user?.role || 'teacher';
    const isAdmin = isAdminRole(userRole);
    const isTeacher = isTeacherRole(userRole);
    const aiEnabled = user?.school?.aiEnabled ?? false;

    const hasRole = (check: string) => {
        const lcCheck = check.toLowerCase();
        if (lcCheck === 'admin') return isAdmin;
        if (lcCheck === 'teacher') return isTeacher;
        return userRole.toLowerCase() === lcCheck;
    };

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

    const handleCloseNotif = () => {
        closeNotif();
        fetchUnreadCount();
    };

    const mainNavLinks = [
        { icon: IconLayoutDashboard, label: 'Dashboard', to: '/admin-portal/dashboard', color: 'blue', roles: ['admin'] },
        { icon: IconChalkboard, label: 'Classes & Material', to: '/admin-portal/classes', color: 'indigo', roles: ['admin'] },
        { icon: IconFiles, label: 'Content Library', to: '/admin-portal/materials', color: 'teal', roles: ['admin'] },
        { icon: IconClipboardList, label: 'Assignments', to: '/admin-portal/assignments', color: 'orange', roles: ['admin'] },
        { icon: IconPencil, label: 'CBT / Quizzes', to: '/admin-portal/cbt', color: 'grape', roles: ['admin'] },
        { icon: IconCalendar, label: 'Exams Calendar', to: '/admin-portal/exams', color: 'indigo', roles: ['admin'] },
        { icon: IconBrandZoom, label: 'Live Classes', to: '/admin-portal/live-classes', color: 'cyan', roles: ['admin'] },
    ].filter(link => link.roles.some(r => hasRole(r)));

    const communityNavLinks = [
        { icon: IconMessageCircle, label: 'Discussions', to: '/admin-portal/discussions', color: 'violet', roles: ['admin'] },
        { icon: IconChartBar, label: 'Analytics', to: '/admin-portal/analytics', color: 'green', roles: ['admin'] },
        { icon: IconTrophy, label: 'Leaderboard', to: '/admin-portal/leaderboard', color: 'yellow', roles: ['admin'] },
    ].filter(link => link.roles.some(r => hasRole(r)));

    const utilityNavLinks = [
        { icon: IconCalendar, label: 'Calendar', to: '/admin-portal/calendar', color: 'blue', roles: ['admin'] },
        { icon: IconMessage, label: 'Inbox', to: '/admin-portal/inbox', color: 'gray', roles: ['admin'] },
        { icon: IconBook, label: 'Library', to: '/admin-portal/library', color: 'orange', roles: ['admin'] },
    ].filter(link => link.roles.some(r => hasRole(r)));

    const renderNavLink = (link: any) => {
        const isActive = location.pathname === link.to || (link.to !== '/admin-portal/dashboard' && location.pathname.startsWith(link.to));

        if (!desktopOpened) {
            return (
                <Tooltip label={link.label} key={link.label} position="right" withArrow>
                    <ActionIcon
                        size="xl"
                        variant={isActive ? 'light' : 'subtle'}
                        color={link.color}
                        onClick={() => { navigate(link.to); if (mobileOpened) toggleMobile(); }}
                        radius="md"
                        my={2}
                        mx="auto"
                        style={{ display: 'flex' }}
                    >
                        <link.icon size={20} stroke={1.5} />
                    </ActionIcon>
                </Tooltip>
            );
        }

        return (
            <NavLink
                key={link.label}
                label={<Text size="sm" fw={isActive ? 600 : 400}>{link.label}</Text>}
                leftSection={
                    <ThemeIcon variant={isActive ? 'filled' : 'light'} color={link.color} size="md" radius="md">
                        <link.icon size={16} stroke={1.5} />
                    </ThemeIcon>
                }
                active={isActive}
                onClick={() => { navigate(link.to); if (mobileOpened) toggleMobile(); }}
                variant="light"
                color={link.color}
                py={8}
                my={2}
                style={{ borderRadius: 'var(--mantine-radius-md)', textDecoration: 'none' }}
            />
        );
    };

    return (
        <AppShell
            header={{ height: 64 }}
            navbar={{
                width: desktopOpened ? 260 : 80,
                breakpoint: 'sm',
                collapsed: { mobile: !mobileOpened },
            }}
            padding="md"
            styles={{
                main: { background: 'var(--app-surface-dim)' },
            }}
        >
            {/* ─── HEADER ─── */}
            <AppShell.Header style={{ borderBottom: '1px solid var(--app-border-light)', background: 'var(--app-header-bg)' }}>
                <Group h="100%" px="lg" justify="space-between">
                    <Group>
                        <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
                        <Group gap="xs" visibleFrom="sm" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin-portal/dashboard')}>
                            <IconSchool size={24} color="var(--mantine-color-brand-6)" />
                            <Text fw={700} size="lg" style={{ letterSpacing: '-0.02em' }}>
                                <Text span c="brand" inherit>Admin</Text> Portal
                            </Text>
                        </Group>
                    </Group>


                    <Group gap="sm">
                        <Badge
                            variant="light"
                            color="blue"
                            size="lg"
                            radius="md"
                            leftSection={<IconCalendar size={14} />}
                            styles={{ root: { textTransform: 'none' } }}
                            visibleFrom="md"
                        >
                            2026 - Term 1
                        </Badge>

                        <Tooltip label="Notifications">
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
                        </Tooltip>

                        {aiEnabled && (
                            <Tooltip label="AI Assistant">
                                <ActionIcon variant="subtle" color="blue" size="lg" onClick={openAi}>
                                    <img src={jaiLogo} alt="AI" style={{ height: 22 }} />
                                </ActionIcon>
                            </Tooltip>
                        )}

                        <Menu shadow="md" width={200} position="bottom-end">
                            <Menu.Target>
                                <UnstyledButton>
                                    <Group gap="xs">
                                        <Avatar src={isAdmin ? "/adminicon.png" : undefined} radius="md" color="brand" size={34}>{user?.email?.[0]?.toUpperCase()}</Avatar>
                                        <Box visibleFrom="xs">
                                            <IconChevronDown size={14} color="gray" />
                                        </Box>
                                    </Group>
                                </UnstyledButton>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Label>{user?.email}</Menu.Label>
                                <Menu.Item leftSection={<IconSettings size={14} />}>Settings</Menu.Item>
                                <Menu.Divider />
                                <Menu.Item
                                    color="red"
                                    leftSection={<IconLogout size={14} />}
                                    onClick={() => { logout(); navigate('/login'); }}
                                >
                                    Logout
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Group>
                </Group>
            </AppShell.Header>

            {/* ─── SIDEBAR ─── */}
            <AppShell.Navbar style={{ backgroundColor: 'var(--app-sidebar-bg)', borderRight: '1px solid var(--app-border-light)' }}>
                {/* User Profile + Collapse Toggle */}
                <AppShell.Section p={desktopOpened ? 'md' : 'xs'} style={{ borderBottom: '1px solid var(--app-border-light)' }}>
                    {desktopOpened ? (
                        <Group justify="space-between">
                            <Group>
                                <Avatar src={isAdmin ? "/adminicon.png" : undefined} radius="md" color="brand" size={36}>{user?.email?.[0]?.toUpperCase()}</Avatar>
                                <div>
                                    <Text size="sm" fw={600} lh={1.2}>{user?.firstName || user?.profile?.firstName} {user?.lastName || user?.profile?.lastName}</Text>
                                    <Text size="xs" c="dimmed" tt="capitalize">Administrator</Text>
                                </div>
                            </Group>
                            <ActionIcon variant="subtle" color="gray" size="sm" onClick={toggleDesktop} visibleFrom="sm" title="Collapse sidebar">
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
                        {desktopOpened && <Text size="xs" fw={700} c="dimmed" tt="uppercase" px="sm" mb={4}>Teaching</Text>}
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
                            label={<Text size="sm" fw={500}>Back to Admin Dashboard</Text>}
                            leftSection={<ThemeIcon variant="light" color="gray" size="md" radius="md"><IconArrowLeft size={16} stroke={1.5} /></ThemeIcon>}
                            onClick={() => navigate('/dashboard')}
                            py={8}
                            style={{ borderRadius: 'var(--mantine-radius-md)' }}
                        />
                    ) : (
                        <Tooltip label="Back to Admin Dashboard" position="right">
                            <ActionIcon variant="subtle" color="gray" size="xl" onClick={() => navigate('/dashboard')} mx="auto" style={{ display: 'flex' }}>
                                <IconArrowLeft size={20} stroke={1.5} />
                            </ActionIcon>
                        </Tooltip>
                    )}
                </AppShell.Section>
            </AppShell.Navbar>

            {/* ─── MAIN CONTENT ─── */}
            <AppShell.Main>
                <Outlet />
            </AppShell.Main>

            <JingliAIDrawer opened={aiOpened} onClose={closeAi} />
            <NotificationsDrawer opened={notifOpened} onClose={handleCloseNotif} />
        </AppShell>
    );
}

export default AdminPortalLayout;
