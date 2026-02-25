import { AppShell, Burger, Group, NavLink, Text, ScrollArea, Avatar, Menu, UnstyledButton, ActionIcon, Indicator, Tooltip, Box, Center, Badge } from '@mantine/core';
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
    IconBell as IconAlertBell,
} from '@tabler/icons-react';

// Import Logos
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
        // Poll every 60 s so the badge stays fresh
        const interval = setInterval(fetchUnreadCount, 60_000);
        return () => clearInterval(interval);
    }, [fetchUnreadCount]);

    const handleCloseNotif = () => {
        closeNotif();
        fetchUnreadCount(); // refresh badge after user has interacted
    };



    const { user, logout } = useAuth();
    const userRole = user?.role || 'admin'; // Default to admin if no user (dev fallback)

    // Role-matching helper
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
        // Allow access if the user's map matches
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
            roles: ['admin', 'teacher', 'student', 'parent', 'reception', 'finance', 'librarian', 'security', 'hr'],
            links: [
                { icon: IconLayoutDashboard, label: 'Dashboard', to: '/dashboard', roles: ['admin', 'teacher', 'student', 'parent', 'reception', 'finance', 'librarian', 'security', 'hr'] },
                { icon: IconCalendar, label: 'Calendar', to: '/calendar', roles: ['admin', 'teacher', 'student', 'parent', 'reception'] },
                { icon: IconSpeakerphone, label: 'Communication', to: '/communication', roles: ['admin', 'teacher', 'student', 'parent', 'reception'] },
            ]
        },
        {
            title: 'Academic',
            roles: ['admin', 'teacher', 'student', 'parent'],
            links: [
                { icon: IconUsers, label: 'Students', to: '/students', roles: ['admin', 'teacher', 'reception'] },
                { icon: IconUsers, label: 'Staff', to: '/staff', roles: ['admin', 'hr'] },
                { icon: IconChalkboard, label: 'Classes', to: '/classes', roles: ['admin', 'teacher'] },
                { icon: IconBook, label: 'Academics', to: '/academics', roles: ['admin', 'teacher', 'student', 'parent'] },
                { icon: IconFileAnalytics, label: 'Exams & Grading', to: '/exams', roles: ['admin', 'teacher', 'student', 'parent'] },
            ]
        },
        {
            title: 'Logistics',
            roles: ['admin', 'teacher', 'reception', 'student', 'librarian', 'security'],
            links: [
                { icon: IconUsers, label: 'Visitors', to: '/reception/visitors', roles: ['admin', 'reception', 'security'] },
                { icon: IconBook, label: 'Library', to: '/library', roles: ['admin', 'teacher', 'student', 'librarian'] },
            ]
        },
        {
            title: 'Finance',
            roles: ['admin', 'finance'],
            links: [
                { icon: IconCurrencyDollar, label: 'Finance', to: '/finance', roles: ['admin', 'finance'] },
                { icon: IconFileAnalytics, label: 'Reports', to: '/reports', roles: ['admin'] },
               
            ]
        },
        {
            title: 'Transport & Ops',
            roles: ['admin', 'reception', 'security'],
            links: [
                { icon: IconBus, label: 'Transport', to: '/transport', roles: ['admin'] },
                { icon: IconBuildingFortress, label: 'Facilities', to: '/facilities', roles: ['admin'] },
            ]
        },
        {
            title: 'Student Welfare',
            roles: ['admin', 'teacher', 'reception'],
            links: [
                { icon: IconHeartbeat, label: 'Health', to: '/health', roles: ['admin', 'reception'] },
                { icon: IconShield, label: 'Discipline', to: '/discipline', roles: ['admin', 'teacher'] },
                { icon: IconHome2, label: 'Hostel', to: '/hostel', roles: ['admin', 'reception'] },
            ]
        },
        {
            title: 'Admin',
            roles: ['admin', 'finance'],
            links: [
                
                { icon: IconUsers, label: 'Users', to: '/admin/users', roles: ['admin'] },
                { icon: IconSettings, label: 'Settings', to: '/settings', roles: ['admin'] },
            ]
        }
    ];

    const linkGroups = allLinkGroups.map(group => ({
        ...group,
        links: group.links.filter(link => link.roles.some(r => hasRole(r)))
    })).filter(group => group.links.length > 0 && group.roles.some(r => hasRole(r)));

    const renderLinks = (group: { title: string, links: any[] }, index: number) => (
        <Box key={index} mb="md">
            {/* Group Heading (Only visible if expanded) */}
            {desktopOpened && (
                <Group justify="space-between" px="md" mb="xs">
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                        {group.title}
                    </Text>
                    {/* Collapse Button: Opposite the FIRST heading */}
                    {index === 0 && (
                        <ActionIcon
                            variant="subtle"
                            color="gray"
                            size="sm"
                            onClick={toggleDesktop}
                            visibleFrom="sm" // Desktop only
                        >
                            <IconLayoutSidebarLeftCollapse size={20} stroke={1.5} />
                        </ActionIcon>
                    )}
                </Group>
            )}

            {/* If collapsed, show the Toggle button centered at the top of the first group */}
            {!desktopOpened && index === 0 && (
                <Center mb="md" visibleFrom="sm">
                    <ActionIcon variant="light" size="md" onClick={toggleDesktop} title="Expand Sidebar">
                        <IconLayoutSidebarLeftExpand size={20} stroke={1.5} />
                    </ActionIcon>
                </Center>
            )}

            {/* Links */}
            {group.links.map((link) => {
                const isActive = location.pathname.startsWith(link.to);
                return activeNavLink(link, isActive, desktopOpened, navigate);
            })}
        </Box>
    );

    return (
        <AppShell
            header={{ height: 70 }}
            navbar={{
                width: desktopOpened ? 240 : 80,
                breakpoint: 'sm',
                collapsed: { mobile: !mobileOpened },
            }}
            padding="md"
            style={{
                background: 'var(--app-surface-dim)',
            }}
        >
            <AppShell.Header style={{ borderBottom: '1px solid var(--app-border-light)', background: 'var(--app-header-bg)' }}>
                <Group h="100%" px="lg" justify="space-between">
                    <Group>
                        {/* Mobile Burger */}
                        <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />

                        {/* LOGO IN HEADER */}
                        <img
                            src={logoFull}
                            alt="Jingli Logo"
                            style={{
                                height: 40,
                                maxWidth: '100%',
                                objectFit: 'contain'
                            }}
                        />
                    </Group>

                    <Group gap="md">
                        {/* REPLACED SEARCH WITH CONTEXT INFO */}
                        <Group visibleFrom="sm" gap="xs">
                            <Badge
                                variant="light"
                                color="blue"
                                size="lg"
                                radius="md"
                                leftSection={<IconCalendar size={14} />}
                                styles={{ root: { textTransform: 'none' } }}
                            >
                                2026 - Term 1
                            </Badge>

                            <Tooltip label="Support & Documentation">
                                <ActionIcon variant="subtle" color="gray" size="lg">
                                    <IconHelp size={20} stroke={1.5} />
                                </ActionIcon>
                            </Tooltip>
                        </Group>

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

                        <Tooltip label="Jingli 1.0 AI Assistant">
                            <ActionIcon variant="subtle" color="blue" size="lg" onClick={openAi}>
                                <img src={jaiLogo} alt="AI" style={{ height: 22 }} />
                            </ActionIcon>
                        </Tooltip>

                        <Menu shadow="md" width={200} position="bottom-end">
                            <Menu.Target>
                                <UnstyledButton>
                                    <Group gap="xs">
                                        <Avatar radius="md" color="brand" size={34}>{user?.email?.[0]?.toUpperCase()}</Avatar>
                                        <div style={{ flex: 1 }}>
                                            <Text size="sm" fw={600} lh={1} visibleFrom="xs">{user?.email}</Text>
                                            <Text size="xs" c="dimmed" visibleFrom="xs">{user?.role}</Text>
                                        </div>
                                        <Box visibleFrom="xs">
                                            <IconChevronDown size={14} color="gray" />
                                        </Box>
                                    </Group>
                                </UnstyledButton>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Item leftSection={<IconSettings size={14} />}>Settings</Menu.Item>
                                <Menu.Item
                                    color="red"
                                    leftSection={<IconLogout size={14} />}
                                    onClick={() => {
                                        logout();
                                        navigate('/login');
                                    }}
                                >
                                    Logout
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Group>
                </Group>
            </AppShell.Header>

            <AppShell.Navbar style={{ backgroundColor: 'var(--app-sidebar-bg)', borderRight: '1px solid var(--app-border-light)' }}>
                {/* Sidebar content starts directly since Logo is moved to Header */}
                <AppShell.Section grow component={ScrollArea} mt="xs" scrollbarSize={6}>
                    <Box p="md">
                        {linkGroups.map((group, i) => renderLinks(group, i))}
                    </Box>
                </AppShell.Section>
            </AppShell.Navbar>

            <AppShell.Main>
                <Outlet />
            </AppShell.Main>

            <ScholarBotDrawer opened={aiOpened} onClose={closeAi} />
            <NotificationsDrawer opened={notifOpened} onClose={handleCloseNotif} />
        </AppShell>
    );
}

// Helper to render NavLink without cluttering main comp
function activeNavLink(link: any, isActive: boolean, expanded: boolean, navigate: any) {
    if (!expanded) {
        return (
            <Tooltip label={link.label} key={link.label} position="right" withArrow>
                <Center my={4}>
                    <ActionIcon
                        size="xl"
                        variant={isActive ? 'light' : 'subtle'}
                        color="brand"
                        onClick={() => navigate(link.to)}
                        radius="md"
                    >
                        <link.icon size="1.2rem" stroke={1.5} />
                    </ActionIcon>
                </Center>
            </Tooltip>
        );
    }

    return (
        <NavLink
            key={link.label}
            label={<Text size="sm" fw={500}>{link.label}</Text>}
            leftSection={<link.icon size="1.1rem" stroke={1.5} />}
            active={isActive}
            onClick={() => navigate(link.to)}
            variant="light"
            color="brand"
            py="xs"
            my={2}
            style={{ borderRadius: 'var(--mantine-radius-md)', textDecoration: 'none' }}
        />
    );
}
