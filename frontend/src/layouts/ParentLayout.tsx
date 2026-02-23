import { Box, AppShell, Group, Burger, Title, useMantineTheme, Avatar, Text, ActionIcon, Menu, UnstyledButton, Stack } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { IconLayoutDashboard, IconCreditCard, IconSettings, IconLogout, IconMessage, IconChartBar } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import classes from './TeacherLayout.module.css'; // Reusing Teacher layout styles for the bottom bar

export function ParentLayout() {
    const [opened, { toggle }] = useDisclosure();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useMantineTheme();

    // Bottom navigation is only for mobile screens
    const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { icon: IconLayoutDashboard, label: 'Dashboard', path: '/parent/dashboard' },
        { icon: IconChartBar, label: 'Performance', path: '/parent/performance' },
        { icon: IconCreditCard, label: 'Financials', path: '/parent/financials' },
        { icon: IconMessage, label: 'Messages', path: '/parent/messages' },
    ];

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{ width: 250, breakpoint: 'sm', collapsed: { mobile: !opened, desktop: isMobile } }}
            padding="md"
        >
            <AppShell.Header>
                <Group h="100%" px="md" justify="space-between">
                    <Group>
                        {/* Only show burger on desktop since mobile uses bottom nav */}
                        {!isMobile && (
                            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                        )}
                        <Title order={3} style={{ cursor: 'pointer' }} onClick={() => navigate('/parent/dashboard')}>Jingli Parent</Title>
                    </Group>

                    <Group>
                        {/* Action Icons for Desktop */}
                        {!isMobile && (
                            <Group gap="xs" visibleFrom="sm">
                                <ActionIcon variant="light" size="lg" onClick={() => navigate('/parent/messages')}>
                                    <IconMessage size={18} />
                                </ActionIcon>
                                <ActionIcon variant="light" size="lg" onClick={() => navigate('/parent/settings')}>
                                    <IconSettings size={18} />
                                </ActionIcon>
                            </Group>
                        )}

                        <Menu shadow="md" width={200} position="bottom-end">
                            <Menu.Target>
                                <Avatar color="cyan" radius="xl" style={{ cursor: 'pointer' }}>{user?.firstName?.charAt(0).toUpperCase() || 'P'}</Avatar>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Label>Application</Menu.Label>
                                <Menu.Item leftSection={<IconSettings size={14} />} onClick={() => navigate('/parent/settings')}>Settings</Menu.Item>
                                <Menu.Divider />
                                <Menu.Item color="red" leftSection={<IconLogout size={14} />} onClick={handleLogout}>Logout</Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Group>
                </Group>
            </AppShell.Header>

            {/* Desktop Sidebar Navbar */}
            {!isMobile && (
                <AppShell.Navbar p="md">
                    <Stack gap="xs">
                        {navItems.map((item) => (
                            <UnstyledButton
                                key={item.path}
                                onClick={() => {
                                    navigate(item.path);
                                    if (opened) toggle();
                                }}
                                className={classes.navButton}
                                data-active={location.pathname.startsWith(item.path) || undefined}
                            >
                                <Group>
                                    <item.icon size={20} />
                                    <Text size="sm">{item.label}</Text>
                                </Group>
                            </UnstyledButton>
                        ))}
                    </Stack>
                </AppShell.Navbar>
            )}

            <AppShell.Main pb={isMobile ? 80 : undefined}>
                <Box maw={1200} mx="auto">
                    <Outlet />
                </Box>
            </AppShell.Main>

            {/* Mobile Bottom Navigation Bar */}
            {isMobile && (
                <Box className={classes.bottomNav}>
                    <Group grow preventGrowOverflow={false} wrap="nowrap" align="center" h="100%">
                        {navItems.map((item) => {
                            const isActive = location.pathname.startsWith(item.path);
                            return (
                                <Stack
                                    key={item.path}
                                    gap={2}
                                    align="center"
                                    justify="center"
                                    onClick={() => navigate(item.path)}
                                    className={`${classes.bottomNavItem} ${isActive ? classes.bottomNavActive : ''}`}
                                    p={8}
                                >
                                    <item.icon size={24} stroke={isActive ? 2 : 1.5} color={isActive ? theme.colors.blue[6] : theme.colors.gray[6]} />
                                    <Text size="0.65rem" fw={isActive ? 600 : 400} c={isActive ? 'blue.6' : 'dimmed'}>
                                        {item.label}
                                    </Text>
                                </Stack>
                            );
                        })}
                    </Group>
                </Box>
            )}
        </AppShell>
    );
}

export default ParentLayout;
