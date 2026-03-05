import {
    AppShell, Burger, Group, NavLink, Text, ScrollArea, Avatar, Menu,
    UnstyledButton, ActionIcon, Indicator, Tooltip, Box, Badge, ThemeIcon, Divider,
    TextInput
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
    IconLayoutDashboard,
    IconBook,
    IconFileAnalytics,
    IconSettings,
    IconLogout,
    IconBell,
    IconChevronDown,
    IconCalendar,
    IconCurrencyDollar,
    IconClipboardList,
    IconMessage,
    IconSchool,
    IconMessageCircle,
    IconSearch,
    IconUser,
    IconLayoutSidebarLeftCollapse,
    IconLayoutSidebarLeftExpand,
} from '@tabler/icons-react';

import logoFull from '../assets/logos/logo-trans.png';
import jaiLogo from '../assets/logos/jai-trans.png';
import { ScholarBotDrawer } from '../components/ai/ScholarBotDrawer';
import { NotificationsDrawer } from '../components/notifications/NotificationsDrawer';
import { notificationsService } from '../services/notificationsService';
import { useEffect, useState, useCallback } from 'react';

const sidebarGroups = [
    {
        title: 'Overview',
        links: [
            { icon: IconLayoutDashboard, label: 'Dashboard', to: '/student/dashboard', color: 'blue' },
            { icon: IconUser, label: 'My Profile', to: '/student/profile', color: 'indigo' },
            { icon: IconMessage, label: 'Messages', to: '/student/communication', color: 'grape' },
            { icon: IconSchool, label: 'E-Learning Portal', to: '/student-portal/dashboard', color: 'teal' },
        ],
    },
    {
        title: 'Academic',
        links: [
            { icon: IconBook, label: 'My Subjects', to: '/student/classes', color: 'teal' },
            { icon: IconCalendar, label: 'Timetable', to: '/student/timetable', color: 'indigo' },
            { icon: IconClipboardList, label: 'Assignments', to: '/student/assignments', color: 'orange' },
            { icon: IconFileAnalytics, label: 'Grades & Results', to: '/student/grades', color: 'green' },
        ],
    },
    {
        title: 'Finance',
        links: [
            { icon: IconCurrencyDollar, label: 'Fees & Invoices', to: '/student/fees', color: 'red' },
        ],
    },
];

export function StudentLayout() {
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

    const handleCloseNotif = () => {
        closeNotif();
        fetchUnreadCount();
    };

    const renderNavLink = (link: any) => {
        const isActive = location.pathname === link.to || (link.to !== '/student/dashboard' && location.pathname.startsWith(link.to));

        if (!desktopOpened) {
            return (
                <Tooltip label={link.label} key={link.label} position="right" withArrow>
                    <ActionIcon
                        size="xl"
                        variant={isActive ? 'light' : 'subtle'}
                        color={isActive ? 'brand' : 'gray'}
                        onClick={() => navigate(link.to)}
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
                    <ThemeIcon
                        variant={isActive ? 'filled' : 'light'}
                        color={isActive ? link.color : 'gray'}
                        size="md"
                        radius="md"
                    >
                        <link.icon size={16} stroke={1.5} />
                    </ThemeIcon>
                }
                active={isActive}
                onClick={() => navigate(link.to)}
                variant="light"
                color="brand"
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
                        <Group gap="xs" style={{ cursor: 'pointer' }} onClick={() => navigate('/student/dashboard')}>
                            <img src={logoFull} alt="Logo" height={36} style={{ objectFit: 'contain' }} />
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

                        <Tooltip label="AI Assistant">
                            <ActionIcon variant="subtle" color="blue" size="lg" onClick={openAi}>
                                <img src={jaiLogo} alt="AI" style={{ height: 22 }} />
                            </ActionIcon>
                        </Tooltip>

                        <Menu shadow="md" width={200} position="bottom-end">
                            <Menu.Target>
                                <UnstyledButton>
                                    <Group gap="xs">
                                        <Avatar color="brand" radius="md" size={34}>
                                            {user?.profile?.firstName?.[0]?.toUpperCase() || 'S'}
                                        </Avatar>
                                        <Box visibleFrom="xs">
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
                                <Avatar color="brand" radius="md" size={36}>
                                    {user?.profile?.firstName?.[0]?.toUpperCase() || 'S'}
                                </Avatar>
                                <div>
                                    <Text size="sm" fw={600} lh={1.2}>{user?.profile?.firstName}</Text>
                                    <Text size="xs" c="dimmed">Student</Text>
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

                {/* Nav Links */}
                <AppShell.Section grow component={ScrollArea} mt="xs" scrollbarSize={6}>
                    <Box p="sm">
                        {sidebarGroups.map((group, i) => (
                            <Box key={group.title}>
                                {i > 0 && <Divider my="sm" />}
                                {desktopOpened && (
                                    <Text size="xs" fw={700} c="dimmed" tt="uppercase" px="sm" mb={4}>
                                        {group.title}
                                    </Text>
                                )}
                                {group.links.map(renderNavLink)}
                            </Box>
                        ))}
                    </Box>
                </AppShell.Section>
            </AppShell.Navbar>

            {/* ─── MAIN CONTENT ─── */}
            <AppShell.Main>
                <Outlet />
            </AppShell.Main>

            <ScholarBotDrawer opened={aiOpened} onClose={closeAi} />
            <NotificationsDrawer opened={notifOpened} onClose={handleCloseNotif} />
        </AppShell>
    );
}

export default StudentLayout;
