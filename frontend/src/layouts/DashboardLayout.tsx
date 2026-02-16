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
    IconDoorExit
} from '@tabler/icons-react';

// Import Logos
import logoFull from '../assets/logos/logo-trans.png';

export function DashboardLayout() {
    const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
    const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
    const navigate = useNavigate();
    const location = useLocation();

    // Sidebar Groups
    const allLinkGroups = [
        {
            title: 'Overview',
            roles: ['admin', 'teacher', 'student', 'parent', 'reception'],
            links: [
                { icon: IconLayoutDashboard, label: 'Dashboard', to: '/dashboard', roles: ['admin', 'teacher', 'student', 'parent', 'reception'] },
                { icon: IconSpeakerphone, label: 'Communication', to: '/communication', roles: ['admin', 'teacher', 'student', 'parent', 'reception'] },
            ]
        },
        {
            title: 'Academic',
            roles: ['admin', 'teacher', 'student', 'parent'],
            links: [
                { icon: IconUsers, label: 'Students', to: '/students', roles: ['admin', 'teacher', 'reception'] },
                { icon: IconUsers, label: 'Teachers', to: '/staff', roles: ['admin', 'reception'] },
                { icon: IconChalkboard, label: 'Classes', to: '/classes', roles: ['admin', 'teacher'] },
                { icon: IconBook, label: 'Academics', to: '/academics', roles: ['admin', 'teacher', 'student', 'parent'] }, // Timetables etc
                { icon: IconFileAnalytics, label: 'Marks & Exams', to: '/marks', roles: ['admin', 'teacher', 'student', 'parent'] },
            ]
        },
        {
            title: 'Logistics',
            roles: ['admin', 'teacher', 'reception', 'student'],
            links: [
                { icon: IconCalendar, label: 'Attendance', to: '/attendance', roles: ['admin', 'teacher', 'reception', 'student', 'parent'] },
                { icon: IconUsers, label: 'Visitors', to: '/reception/visitors', roles: ['admin', 'reception'] },
                { icon: IconDoorExit, label: 'Student Logistics', to: '/reception/logistics', roles: ['admin', 'reception'] },
                { icon: IconBook, label: 'Library', to: '/library', roles: ['admin', 'teacher', 'student'] },
            ]
        },
        {
            title: 'Finance & Admin',
            roles: ['admin', 'finance', 'reception'], // Reception needs cash desk maybe
            links: [
                { icon: IconCurrencyDollar, label: 'Finance', to: '/finance', roles: ['admin', 'reception'] }, // Reception sees fees only? handled in page
                { icon: IconFileAnalytics, label: 'Reports', to: '/reports', roles: ['admin'] },
                { icon: IconUsers, label: 'Users', to: '/admin/users', roles: ['admin'] },
                { icon: IconSettings, label: 'Settings', to: '/settings', roles: ['admin'] },
            ]
        }
    ];

    const { user, logout } = useAuth();
    const userRole = user?.role || 'admin'; // Default to admin if no user (dev fallback)

    const linkGroups = allLinkGroups.map(group => ({
        ...group,
        links: group.links.filter(link => link.roles.includes(userRole))
    })).filter(group => group.links.length > 0 && group.roles.includes(userRole));

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
                background: '#f1f5f9',
            }}
        >
            <AppShell.Header style={{ borderBottom: '1px solid #e2e8f0', background: 'rgba(255,255,255,0.95)' }}>
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
                                2024 - Term 1
                            </Badge>

                            <Tooltip label="Support & Documentation">
                                <ActionIcon variant="subtle" color="gray" size="lg">
                                    <IconHelp size={20} stroke={1.5} />
                                </ActionIcon>
                            </Tooltip>
                        </Group>

                        <ActionIcon variant="light" color="gray" size="lg" radius="md">
                            <Indicator color="red" size={6} offset={4} processing>
                                <IconBell size={20} stroke={1.5} />
                            </Indicator>
                        </ActionIcon>

                        <Menu shadow="md" width={200} position="bottom-end">
                            <Menu.Target>
                                <UnstyledButton>
                                    <Group gap="xs">
                                        <Avatar radius="md" color="brand" size={34}>{user?.avatar}</Avatar>
                                        <div style={{ flex: 1 }}>
                                            <Text size="sm" fw={600} lh={1} visibleFrom="xs">{user?.name}</Text>
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

            <AppShell.Navbar style={{ backgroundColor: 'white', borderRight: '1px solid #e2e8f0' }}>
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
                        variant={isActive ? 'filled' : 'subtle'}
                        color="brand"
                        onClick={() => navigate(link.to)}
                        radius="md"
                    >
                        <link.icon size="1.4rem" stroke={1.5} />
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
            style={{ borderRadius: 'var(--mantine-radius-md)' }}
        />
    );
}
