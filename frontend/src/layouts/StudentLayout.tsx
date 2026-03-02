import {
    Box, AppShell, Group, Burger, Title, useMantineTheme, Avatar, Text, Menu,
    UnstyledButton, NavLink, Stack, ScrollArea, ThemeIcon, Divider, Badge
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    IconLayoutDashboard, IconBook, IconFileAnalytics, IconSettings,
    IconLogout, IconCalendar, IconCurrencyDollar, IconClipboardList,
    IconChevronRight, IconMessage, IconSchool, IconArrowRight,
} from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import logoFull from '../assets/logos/logo-trans.png';

const sidebarGroups = [
    {
        title: 'Overview',
        links: [
            { icon: IconLayoutDashboard, label: 'Dashboard', to: '/student/dashboard', color: 'blue' },
            { icon: IconMessage, label: 'Messages', to: '/student/communication', color: 'grape' },
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

// Bottom nav — 5 most important for admin area
const mobileNavLinks = [
    { icon: IconLayoutDashboard, label: 'Home', to: '/student/dashboard', color: 'blue' },
    { icon: IconBook, label: 'Subjects', to: '/student/classes', color: 'teal' },
    { icon: IconCalendar, label: 'Timetable', to: '/student/timetable', color: 'indigo' },
    { icon: IconFileAnalytics, label: 'Grades', to: '/student/grades', color: 'green' },
    { icon: IconSchool, label: 'E-Learn', to: '/student-portal/dashboard', color: 'cyan' },
];

export function StudentLayout() {
    const [opened, { toggle, close }] = useDisclosure();
    const theme = useMantineTheme();
    const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const isPathActive = (path: string) => {
        if (path === '/student/dashboard') return location.pathname === '/student/dashboard';
        return location.pathname.startsWith(path);
    };

    const handleSignOut = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{ width: 260, breakpoint: 'sm', collapsed: { mobile: !opened } }}
            padding="md"
        >
            {/* Header */}
            <AppShell.Header>
                <Group h="100%" px="md" justify="space-between">
                    <Group>
                        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                        <Group gap="xs" style={{ cursor: 'pointer' }} onClick={() => navigate('/student/dashboard')}>
                            <img src={logoFull} alt="Logo" height={32} style={{ objectFit: 'contain' }} />
                            <Title order={4} visibleFrom="xs" style={{ fontFamily: 'Outfit, sans-serif' }}>Student</Title>
                        </Group>
                    </Group>

                    <Group gap="sm">
                        <Menu shadow="md" width={220} position="bottom-end">
                            <Menu.Target>
                                <UnstyledButton>
                                    <Avatar color="blue" radius="xl" size="sm">
                                        {user?.profile?.firstName?.[0] || 'S'}
                                    </Avatar>
                                </UnstyledButton>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Label>
                                    <Text size="sm" fw={500}>{user?.profile?.firstName} {user?.profile?.lastName}</Text>
                                    <Text size="xs" c="dimmed">{user?.email}</Text>
                                </Menu.Label>
                                <Menu.Divider />
                                <Menu.Item leftSection={<IconSettings size={14} />}>Settings</Menu.Item>
                                <Menu.Divider />
                                <Menu.Item color="red" leftSection={<IconLogout size={14} />} onClick={handleSignOut}>Sign out</Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Group>
                </Group>
            </AppShell.Header>

            {/* Sidebar */}
            <AppShell.Navbar p="sm" style={{ backgroundColor: 'var(--app-sidebar-bg)' }}>
                <AppShell.Section grow component={ScrollArea}>
                    <Stack gap={0}>
                        {sidebarGroups.map((group, gidx) => (
                            <Box key={group.title}>
                                {gidx > 0 && <Divider my="xs" />}
                                <Text size="xs" fw={700} c="dimmed" tt="uppercase" px="sm" mb={4} mt={gidx > 0 ? 4 : 0}>
                                    {group.title}
                                </Text>
                                {group.links.map((link) => {
                                    const active = isPathActive(link.to);
                                    return (
                                        <NavLink
                                            key={link.to}
                                            label={link.label}
                                            leftSection={
                                                <ThemeIcon variant={active ? 'filled' : 'light'} color={link.color} size="sm" radius="md">
                                                    <link.icon size={14} stroke={1.5} />
                                                </ThemeIcon>
                                            }
                                            rightSection={active ? <IconChevronRight size={14} /> : null}
                                            active={active}
                                            onClick={() => { navigate(link.to); close(); }}
                                            py={8}
                                            style={{ borderRadius: 'var(--mantine-radius-md)', textDecoration: 'none' }}
                                        />
                                    );
                                })}
                            </Box>
                        ))}
                    </Stack>
                </AppShell.Section>

                <AppShell.Section>
                    <Divider my="sm" />
                    {/* E-Learning Portal Entry */}
                    <NavLink
                        label={
                            <Group justify="space-between" w="100%">
                                <Text size="sm" fw={600} c="teal">E-Learning Portal</Text>
                                <Badge variant="filled" color="teal" size="xs">Open</Badge>
                            </Group>
                        }
                        leftSection={
                            <ThemeIcon variant="filled" color="teal" size="sm" radius="md">
                                <IconSchool size={14} stroke={1.5} />
                            </ThemeIcon>
                        }
                        rightSection={<IconArrowRight size={14} color="var(--mantine-color-teal-6)" />}
                        onClick={() => { navigate('/student-portal/dashboard'); close(); }}
                        py={8}
                        mb="xs"
                        style={{ borderRadius: 'var(--mantine-radius-md)', textDecoration: 'none' }}
                    />
                    <NavLink
                        label="Sign Out"
                        leftSection={
                            <ThemeIcon variant="light" color="red" size="sm" radius="md">
                                <IconLogout size={14} stroke={1.5} />
                            </ThemeIcon>
                        }
                        onClick={handleSignOut}
                        py={8}
                        style={{ borderRadius: 'var(--mantine-radius-md)', textDecoration: 'none' }}
                    />
                </AppShell.Section>
            </AppShell.Navbar>

            {/* Main Content */}
            <AppShell.Main pb={isMobile ? 80 : undefined}>
                <Box maw={1200} mx="auto">
                    <Outlet />
                </Box>
            </AppShell.Main>

            {/* Mobile Bottom Nav */}
            {isMobile && (
                <Box
                    style={{
                        position: 'fixed', bottom: 0, left: 0, right: 0, height: 70,
                        background: 'var(--mantine-color-body)',
                        borderTop: '1px solid var(--mantine-color-default-border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
                        zIndex: 200, paddingBottom: 'env(safe-area-inset-bottom)',
                    }}
                >
                    {mobileNavLinks.map((link) => {
                        const active = isPathActive(link.to);
                        return (
                            <UnstyledButton
                                key={link.to}
                                onClick={() => { navigate(link.to); close(); }}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flex: 1, padding: '8px 4px' }}
                            >
                                <link.icon size={22} stroke={active ? 2 : 1.5}
                                    color={active ? theme.colors[link.color]?.[6] || theme.colors.blue[6] : theme.colors.gray[5]} />
                                <Text size="0.6rem" fw={active ? 700 : 400}
                                    c={active ? `${link.color}.6` : 'dimmed'} ta="center" lineClamp={1}>
                                    {link.label}
                                </Text>
                            </UnstyledButton>
                        );
                    })}
                </Box>
            )}
        </AppShell>
    );
}

export default StudentLayout;
