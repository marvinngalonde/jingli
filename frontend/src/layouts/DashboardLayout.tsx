import { AppShell, Burger, Group, NavLink, Text, ScrollArea, Avatar, Menu, UnstyledButton, ActionIcon, Indicator, Tooltip, Box, Badge, ThemeIcon, Divider } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
    IconLayoutDashboard,
    IconUsers,
    IconChalkboard,
    IconCurrencyDollar,
    IconFileAnalytics,
    IconSettings,
    IconLogout,
    IconBell,
    IconChevronDown,
    IconHelp,
    IconCalendar,
    IconBook,
    IconLayoutSidebarLeftCollapse,
    IconLayoutSidebarLeftExpand,
    IconSpeakerphone,
    IconBus,
    IconBuildingFortress,
    IconHeartbeat,
    IconShield,
    IconHome2,
    IconCalendarEvent,
    IconSchool,
    IconWallet,
    IconReceipt,
    IconClipboardCheck,
    IconClipboardList,
    IconPencil,
    IconChartBar,
    IconMessage,
} from '@tabler/icons-react';

import logoFull from '../assets/logos/logo-trans.png';
import jaiLogo from '../assets/logos/jai-trans.png';
import { ScholarBotDrawer } from '../components/ai/ScholarBotDrawer';
import { NotificationsDrawer } from '../components/notifications/NotificationsDrawer';
import { notificationsService } from '../services/notificationsService';
import { isAdminRole, isTeacherRole } from '../utils/roles';
import { useEffect, useState, useCallback } from 'react';

export function DashboardLayout() {
    const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
    const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
    const [aiOpened, { open: openAi, close: closeAi }] = useDisclosure(false);
    const [notifOpened, { open: openNotif, close: closeNotif }] = useDisclosure(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();

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

    const { user, logout } = useAuth();
    const userRole = user?.role || 'admin';
    const r = userRole;
    const isAdmin = isAdminRole(r);
    const isTeacher = isTeacherRole(r);
    const isFinance = ['BURSAR', 'FINANCE'].includes(r.toUpperCase());
    const isLibrarian = r.toUpperCase() === 'LIBRARIAN';
    const isSecurity = r.toUpperCase() === 'SECURITY_GUARD';
    const isSeniorClerk = r.toUpperCase() === 'SENIOR_CLERK';
    const isHR = r.toUpperCase() === 'HR_MANAGER';
    const isStudent = r.toLowerCase() === 'student';
    const isParent = r.toLowerCase() === 'parent';
    const isReception = r.toLowerCase() === 'reception' || isSeniorClerk;

    const hasRole = (check: string) => {
        const lcCheck = check.toLowerCase();
        if (lcCheck === 'admin') return isAdmin;
        if (lcCheck === 'teacher') return isTeacher;
        if (lcCheck === 'student') return isStudent;
        if (lcCheck === 'parent') return isParent;
        if (lcCheck === 'reception') return isReception;
        if (lcCheck === 'finance') return isFinance;
        if (lcCheck === 'librarian') return isLibrarian;
        if (lcCheck === 'security') return isSecurity;
        if (lcCheck === 'hr') return isHR;
        return r.toLowerCase() === lcCheck;
    };

    const allLinkGroups = [
        {
            title: 'Overview',
            roles: ['admin', 'teacher', 'reception', 'finance', 'librarian', 'security', 'hr'],
            links: [
                { icon: IconLayoutDashboard, label: 'Dashboard', to: '/dashboard', roles: ['admin', 'reception', 'finance', 'librarian', 'security', 'hr'] },
                { icon: IconLayoutDashboard, label: 'Dashboard', to: '/teacher/dashboard', roles: ['teacher'] },
                { icon: IconCalendar, label: 'Calendar', to: '/calendar', roles: ['admin', 'teacher', 'reception'] },
                { icon: IconSpeakerphone, label: 'Communication', to: '/communication', roles: ['admin', 'reception'] },
                { icon: IconMessage, label: 'Messages', to: '/teacher/communication', roles: ['teacher'] },
                { icon: IconSchool, label: 'E-Learning Portal', to: '/portal/dashboard', roles: ['teacher'] },
            ]
        },
        {
            title: 'My Teaching',
            roles: ['teacher'],
            links: [
                { icon: IconChalkboard, label: 'My Classes', to: '/teacher/classes', roles: ['teacher'] },
                { icon: IconUsers, label: 'My Students', to: '/teacher/students', roles: ['teacher'] },
                { icon: IconCalendarEvent, label: 'Timetable', to: '/teacher/timetable', roles: ['teacher'] },
                { icon: IconClipboardCheck, label: 'Attendance', to: '/teacher/attendance', roles: ['teacher'] },
                { icon: IconPencil, label: 'Marks Entry', to: '/teacher/marks', roles: ['teacher'] },
                { icon: IconFileAnalytics, label: 'Exam Schedule', to: '/teacher/exams', roles: ['teacher'] },
            ]
        },
        {
            title: 'Academic',
            roles: ['admin', 'teacher', 'student', 'parent'],
            links: [
                { icon: IconUsers, label: 'Students', to: '/students', roles: ['admin', 'reception'] },
                { icon: IconUsers, label: 'Staff', to: '/staff', roles: ['admin', 'hr'] },
                { icon: IconBook, label: 'Academics', to: '/academics', roles: ['admin', 'student', 'parent'] },
                { icon: IconFileAnalytics, label: 'Exams & Grading', to: '/exams', roles: ['admin', 'student', 'parent'] },
                { icon: IconClipboardCheck, label: 'Attendance', to: '/attendance', roles: ['admin'] },
                { icon: IconCalendarEvent, label: 'Events', to: '/reception/events', roles: ['admin', 'reception'] },
            ]
        },
        {
            title: 'Logistics',
            roles: ['admin', 'reception', 'student', 'librarian', 'security'],
            links: [
                { icon: IconUsers, label: 'Visitors', to: '/reception/visitors', roles: ['admin', 'reception', 'security'] },
                { icon: IconBook, label: 'Library', to: '/library', roles: ['admin', 'student', 'librarian'] },
            ]
        },
        {
            title: 'Finance',
            roles: ['admin', 'finance'],
            links: [
                { icon: IconCurrencyDollar, label: 'Finance', to: '/finance/dashboard', roles: ['admin', 'finance'] },
                { icon: IconWallet, label: 'Salaries', to: '/finance/salaries', roles: ['admin', 'finance'] },
                { icon: IconReceipt, label: 'Expenses', to: '/finance/expenses', roles: ['admin', 'finance'] },
                { icon: IconFileAnalytics, label: 'Reports', to: '/reports', roles: ['admin'] },
            ]
        },
        {
            title: 'Transport & Ops',
            roles: ['admin', 'reception', 'security'],
            links: [
                { icon: IconBus, label: 'Transport', to: '/reception/transport', roles: ['admin'] },
                { icon: IconBuildingFortress, label: 'Facilities', to: '/reception/facilities', roles: ['admin'] },
            ]
        },
        {
            title: 'Student Welfare',
            roles: ['admin', 'teacher', 'reception'],
            links: [
                { icon: IconHeartbeat, label: 'Health', to: '/reception/health', roles: ['admin', 'reception'] },
                { icon: IconShield, label: 'Discipline', to: '/reception/discipline', roles: ['admin', 'teacher'] },
                { icon: IconHome2, label: 'Hostel', to: '/reception/hostel', roles: ['admin', 'reception'] },
            ]
        },
        {
            title: 'Admin',
            roles: ['admin', 'finance'],
            links: [
                { icon: IconUsers, label: 'Users', to: '/admin/users', roles: ['admin'] },
                { icon: IconCalendar, label: 'Academic Years', to: '/admin/academic-years', roles: ['admin'] },
                { icon: IconSettings, label: 'Settings', to: '/settings', roles: ['admin'] },
            ]
        }
    ];

    const linkGroups = allLinkGroups.map(group => ({
        ...group,
        links: group.links.filter(link => link.roles.some(r => hasRole(r)))
    })).filter(group => group.links.length > 0 && group.roles.some(r => hasRole(r)));

    const renderNavLink = (link: any) => {
        const isActive = location.pathname === link.to ||
            (link.to !== '/dashboard' && location.pathname.startsWith(link.to));

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
                        color={isActive ? 'brand' : 'gray'}
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
                        <img
                            src={logoFull}
                            alt="Jingli Logo"
                            style={{ height: 36, maxWidth: '100%', objectFit: 'contain' }}
                        />
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
                                    <Text size="sm" fw={600} lh={1.2}>{user?.email?.split('@')[0]}</Text>
                                    <Text size="xs" c="dimmed">{user?.role?.replace(/_/g, ' ')}</Text>
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
                        {linkGroups.map((group, i) => (
                            <Box key={i}>
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
