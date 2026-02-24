import { Box, AppShell, Group, Burger, Title, useMantineTheme, Avatar, Text, ActionIcon, Menu, UnstyledButton } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { IconLayoutDashboard, IconBook, IconFileAnalytics, IconSettings, IconLogout, IconMessage } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import classes from './TeacherLayout.module.css'; // Reusing Teacher layout styles for the bottom bar

export function StudentLayout() {
    const [opened, { toggle }] = useDisclosure();
    const theme = useMantineTheme();
    const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const navLinks = [
        { icon: IconLayoutDashboard, label: 'Dashboard', to: '/student/dashboard' },
        { icon: IconBook, label: 'Learn', to: '/student/classes' },
        { icon: IconFileAnalytics, label: 'Grades', to: '/student/grades' },
    ];

    const isPathActive = (path: string) => {
        if (path === '/student/dashboard' && location.pathname === '/student/dashboard') return true;
        if (path !== '/student/dashboard' && location.pathname.startsWith(path)) return true;
        return false;
    };

    const handleSignOut = async () => {
        await logout();
        navigate('/login');
    };

    // Components
    const DesktopNav = () => (
        <Group gap="sm" visibleFrom="sm">
            {navLinks.map((link) => (
                <UnstyledButton
                    key={link.label}
                    className={classes.control}
                    data-active={isPathActive(link.to) || undefined}
                    onClick={() => navigate(link.to)}
                >
                    <link.icon className={classes.linkIcon} stroke={1.5} />
                    <span>{link.label}</span>
                </UnstyledButton>
            ))}
        </Group>
    );

    const MobileBottomNav = () => (
        <Box hiddenFrom="sm" className={classes.mobileBottomNav}>
            {navLinks.map((link) => {
                const active = isPathActive(link.to);
                return (
                    <UnstyledButton
                        key={link.label}
                        className={classes.mobileNavItem}
                        data-active={active || undefined}
                        onClick={() => navigate(link.to)}
                    >
                        <link.icon size={24} stroke={active ? 2 : 1.5} />
                        <Text size="xs" mt={4} fw={active ? 600 : 400}>{link.label}</Text>
                    </UnstyledButton>
                );
            })}
        </Box>
    );

    return (
        <AppShell
            header={{ height: 60 }}
            padding="md"
        >
            <AppShell.Header>
                <Group h="100%" px="md" justify="space-between">
                    <Group>
                        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                        <Title order={3} c="blue.7" style={{ fontFamily: 'Outfit, sans-serif' }}>Student Portal</Title>
                    </Group>

                    <DesktopNav />

                    <Group gap="sm">
                        <ActionIcon variant="light" size="lg" radius="xl" onClick={() => navigate('/messages')} title="Messages">
                            <IconMessage size={20} />
                        </ActionIcon>
                        <Menu shadow="md" width={200} position="bottom-end">
                            <Menu.Target>
                                <UnstyledButton>
                                    <Avatar color="blue" radius="xl" size="sm">
                                        {user?.profile?.firstName?.[0] || 'S'}
                                    </Avatar>
                                </UnstyledButton>
                            </Menu.Target>

                            <Menu.Dropdown>
                                <Menu.Label>
                                    <Text size="sm" fw={500}>{user?.profile?.firstName || 'Student'}</Text>
                                    <Text size="xs" c="dimmed">{user?.email}</Text>
                                </Menu.Label>
                                <Menu.Divider />
                                <Menu.Item leftSection={<IconSettings size={14} />}>Settings</Menu.Item>
                                <Menu.Item color="red" leftSection={<IconLogout size={14} />} onClick={handleSignOut}>
                                    Sign out
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Group>
                </Group>
            </AppShell.Header>

            {/* In a real app, the Burger would open a Drawer or Sidebar on mobile, but for the true mobile-app feel we rely on BottomNav */}

            <AppShell.Main pb={isMobile ? 80 : undefined} bg="gray.0">
                <Box maw={1200} mx="auto">
                    <Outlet />
                </Box>
            </AppShell.Main>

            <MobileBottomNav />
        </AppShell>
    );
}

export default StudentLayout;
