import { AppShell, Burger, Group, NavLink, Text, ScrollArea, Avatar, Menu, UnstyledButton, ActionIcon, Tooltip, Box, ThemeIcon, Badge } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Outlet, useLocation, Link } from 'react-router-dom';
import {
    IconDashboard,
    IconBuildingBank,
    IconUsersGroup,
    IconSettings,
    IconLogout,
    IconChevronDown,
    IconLayoutSidebarLeftCollapse,
    IconLayoutSidebarLeftExpand,
    IconWorld
} from '@tabler/icons-react';

import logoFull from '../assets/logos/logo-trans.png';

export function SystemAdminLayout() {
    const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
    const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const links = [
        { icon: IconDashboard, label: 'Global Dashboard', to: '/system-admin' },
        { icon: IconBuildingBank, label: 'Manage Schools', to: '/system-admin/schools' },
        { icon: IconUsersGroup, label: 'Global Users', to: '/system-admin/users' },
        { icon: IconSettings, label: 'Platform Settings', to: '/system-admin/settings' },
    ];

    const renderNavLink = (link: any) => {
        const isActive = location.pathname === link.to || (link.to !== '/system-admin' && location.pathname.startsWith(link.to));

        if (!desktopOpened) {
            return (
                <Tooltip label={link.label} key={link.label} position="right" withArrow>
                    <ActionIcon
                        size="xl"
                        variant={isActive ? 'filled' : 'subtle'}
                        color={isActive ? 'indigo' : 'gray.4'}
                        onClick={() => navigate(link.to)}
                        radius="md"
                        my={4}
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
                label={<Text size="sm" fw={isActive ? 600 : 400} c={isActive ? 'white' : 'gray.3'}>{link.label}</Text>}
                leftSection={
                    <ThemeIcon
                        variant={isActive ? 'filled' : 'transparent'}
                        color={isActive ? 'indigo.7' : 'transparent'}
                        c={isActive ? 'white' : 'gray.4'}
                        size="md"
                        radius="md"
                    >
                        <link.icon size={18} stroke={1.5} />
                    </ThemeIcon>
                }
                active={isActive}
                onClick={() => navigate(link.to)}
                variant="filled"
                color="indigo.9"
                py={10}
                my={4}
                style={{
                    borderRadius: 'var(--mantine-radius-md)',
                    textDecoration: 'none',
                    backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                }}
                className="sysadmin-navlink"
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
                main: { background: '#f4f6f8' }, // Light gray background for contrast
            }}
        >
            {/* ─── HEADER ─── */}
            <AppShell.Header style={{ borderBottom: '1px solid #e0e0e0', background: '#ffffff' }}>
                <Group h="100%" px="lg" justify="space-between">
                    <Group>
                        <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
                        <Link to="/system-admin" style={{ textDecoration: 'none' }}>
                            <Group gap="sm">
                                <img src={logoFull} alt="Jingli Logo" style={{ height: 32, objectFit: 'contain' }} />
                                <Badge color="indigo" variant="light" size="sm" style={{ letterSpacing: 1 }}>SYSTEM ADMIN</Badge>
                            </Group>
                        </Link>
                    </Group>

                    <Group gap="sm">
                        <Menu shadow="md" width={200} position="bottom-end">
                            <Menu.Target>
                                <UnstyledButton>
                                    <Group gap="xs">
                                        <Avatar radius="xl" color="indigo" size={36}>{user?.email?.[0]?.toUpperCase() || 'S'}</Avatar>
                                        <Box visibleFrom="xs">
                                            <Group gap={4}>
                                                <Text size="sm" fw={500} c="dark.8">{user?.email?.split('@')[0] ?? 'System Admin'}</Text>
                                                <IconChevronDown size={14} color="gray" />
                                            </Group>
                                        </Box>
                                    </Group>
                                </UnstyledButton>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Label>{user?.email}</Menu.Label>
                                <Menu.Item leftSection={<IconSettings size={14} />}>Global Settings</Menu.Item>
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

            {/* ─── SIDEBAR (NAVY BLUE VARIANT) ─── */}
            <AppShell.Navbar style={{ backgroundColor: '#0f172a', borderRight: 'none', color: 'white' }}>
                {/* User Profile + Collapse Toggle */}
                <AppShell.Section p={desktopOpened ? 'md' : 'xs'} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    {desktopOpened ? (
                        <Group justify="space-between" wrap="nowrap">
                            <Group wrap="nowrap" gap="sm">
                                <ThemeIcon size="lg" radius="md" variant="gradient" gradient={{ from: 'indigo.6', to: 'blue.8', deg: 45 }}>
                                    <IconWorld stroke={1.5} size={20} />
                                </ThemeIcon>
                                <div>
                                    <Text size="sm" fw={600} lh={1.2} c="white">Jingli HQ</Text>
                                    <Text size="xs" c="indigo.2">Global Command</Text>
                                </div>
                            </Group>
                            <ActionIcon variant="subtle" color="indigo.2" size="sm" onClick={toggleDesktop} visibleFrom="sm" title="Collapse sidebar">
                                <IconLayoutSidebarLeftCollapse size={18} stroke={1.5} />
                            </ActionIcon>
                        </Group>
                    ) : (
                        <Tooltip label="Expand sidebar" position="right">
                            <ActionIcon variant="subtle" color="indigo.2" size="lg" onClick={toggleDesktop} mx="auto" style={{ display: 'flex' }}>
                                <IconLayoutSidebarLeftExpand size={20} stroke={1.5} />
                            </ActionIcon>
                        </Tooltip>
                    )}
                </AppShell.Section>

                {/* Nav Links */}
                <AppShell.Section grow component={ScrollArea} mt="sm" scrollbarSize={6}>
                    <Box p="sm">
                        {desktopOpened && (
                            <Text size="xs" fw={700} c="indigo.3" tt="uppercase" px="sm" mb={8} style={{ letterSpacing: 0.5 }}>
                                Platform Actions
                            </Text>
                        )}
                        {links.map(renderNavLink)}
                    </Box>
                </AppShell.Section>

                <AppShell.Section p="md" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    {desktopOpened ? (
                        <Text size="xs" c="indigo.2" ta="center" truncate>{user?.email ?? 'admin@jingli.co.zw'}</Text>
                    ) : (
                        <Text size="xs" c="indigo.2" ta="center">A</Text>
                    )}
                </AppShell.Section>
            </AppShell.Navbar>

            {/* ─── MAIN CONTENT ─── */}
            <AppShell.Main>
                <Box p="sm">
                    <Outlet />
                </Box>
            </AppShell.Main>
        </AppShell>
    );
}
