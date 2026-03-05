import {
    AppShell, Burger, Group, NavLink, Text, ScrollArea, Avatar, Menu,
    UnstyledButton, ActionIcon, Indicator, Tooltip, Box,
    ThemeIcon, Divider, Badge
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
    IconLayoutDashboard, IconChartBar, IconBook, IconClipboardList,
    IconBell, IconChevronDown, IconLogout, IconSettings,
    IconMessage, IconBrandZoom, IconArrowRight, IconSchool, IconUsers,
    IconCurrencyDollar, IconCalendar, IconLayoutSidebarLeftCollapse,
    IconLayoutSidebarLeftExpand,
} from '@tabler/icons-react';
import jaiLogo from '../assets/logos/jai-trans.png';
import { ScholarBotDrawer } from '../components/ai/ScholarBotDrawer';
import { NotificationsDrawer } from '../components/notifications/NotificationsDrawer';
import { notificationsService } from '../services/notificationsService';
import { useEffect, useState, useCallback } from 'react';

const sidebarGroups = [
    {
        title: 'Management',
        links: [
            { icon: IconLayoutDashboard, label: 'Admin Dashboard', to: '/parent/dashboard', color: 'blue' },
            { icon: IconCurrencyDollar, label: 'Fees & Payments', to: '/parent/fees', color: 'red' },
            { icon: IconMessage, label: 'Communication', to: '/parent/communication', color: 'teal' },
        ],
    },
    {
        title: 'Academic Portal',
        links: [
            { icon: IconSchool, label: 'Learning Portal', to: '/parent-portal/dashboard', color: 'indigo' },
            { icon: IconChartBar, label: "Children's Performance", to: '/parent-portal/performance', color: 'cyan' },
        ],
    },
];

export function ParentLayout() {
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

    const isPathActive = (to: string) => {
        if (to === '/parent/dashboard') return location.pathname === '/parent/dashboard';
        return location.pathname.startsWith(to);
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
            styles={{ main: { background: 'var(--app-surface-dim)' } }}
        >
            {/* HEADER */}
            <AppShell.Header style={{ borderBottom: '1px solid var(--app-border-light)', background: 'var(--app-header-bg)' }}>
                <Group h="100%" px="lg" justify="space-between">
                    <Group>
                        <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
                        <Group gap="xs" visibleFrom="sm" style={{ cursor: 'pointer' }} onClick={() => navigate('/parent/dashboard')}>
                            <IconSchool size={24} color="var(--mantine-color-cyan-6)" />
                            <Text fw={700} size="lg" style={{ letterSpacing: '-0.02em' }}>
                                <Text span c="cyan" inherit>Parent</Text> Portal
                            </Text>
                        </Group>
                    </Group>

                    <Group gap="sm">
                        <Tooltip label="Notifications">
                            <ActionIcon variant="subtle" color="gray" size="lg" onClick={openNotif} pos="relative">
                                <Indicator color="red" size={unreadCount > 0 ? 16 : 0} offset={4} processing={unreadCount > 0}
                                    label={unreadCount > 9 ? '9+' : unreadCount > 0 ? String(unreadCount) : undefined} disabled={unreadCount === 0}>
                                    <IconBell size={20} stroke={1.5} />
                                </Indicator>
                            </ActionIcon>
                        </Tooltip>

                        <Tooltip label="AI Assistant">
                            <ActionIcon variant="subtle" color="cyan" size="lg" onClick={openAi}>
                                <img src={jaiLogo} alt="AI" style={{ height: 22 }} />
                            </ActionIcon>
                        </Tooltip>

                        <Menu shadow="md" width={200} position="bottom-end">
                            <Menu.Target>
                                <UnstyledButton>
                                    <Group gap="xs">
                                        <Avatar radius="md" color="cyan" size={34}>
                                            {user?.firstName?.[0]?.toUpperCase() || user?.profile?.firstName?.[0]?.toUpperCase() || 'P'}
                                        </Avatar>
                                        <Box visibleFrom="xs"><IconChevronDown size={14} color="gray" /></Box>
                                    </Group>
                                </UnstyledButton>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Label>
                                    <Text size="sm" fw={500}>{user?.firstName || user?.profile?.firstName} {user?.lastName || user?.profile?.lastName}</Text>
                                    <Text size="xs" c="dimmed">{user?.email}</Text>
                                </Menu.Label>
                                <Menu.Divider />
                                <Menu.Item leftSection={<IconSettings size={14} />}>Settings</Menu.Item>
                                <Menu.Item color="red" leftSection={<IconLogout size={14} />} onClick={() => { logout(); navigate('/login'); }}>Logout</Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Group>
                </Group>
            </AppShell.Header>

            {/* SIDEBAR */}
            <AppShell.Navbar style={{ backgroundColor: 'var(--app-sidebar-bg)', borderRight: '1px solid var(--app-border-light)' }}>
                <AppShell.Section p={desktopOpened ? 'md' : 'xs'} style={{ borderBottom: '1px solid var(--app-border-light)' }}>
                    {desktopOpened ? (
                        <Group justify="space-between">
                            <Group>
                                <Avatar radius="md" color="cyan" size={36}>
                                    {user?.firstName?.[0]?.toUpperCase() || user?.profile?.firstName?.[0]?.toUpperCase() || 'P'}
                                </Avatar>
                                <div>
                                    <Text size="sm" fw={600} lh={1.2}>{user?.firstName || user?.profile?.firstName} {user?.lastName || user?.profile?.lastName}</Text>
                                    <Text size="xs" c="dimmed">Parent / Guardian</Text>
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
                        {sidebarGroups.map((group, gidx) => (
                            <Box key={group.title}>
                                {gidx > 0 && <Divider my="sm" />}
                                {desktopOpened && (
                                    <Text size="xs" fw={700} c="dimmed" tt="uppercase" px="sm" mb={4} mt={gidx > 0 ? 4 : 0}>
                                        {group.title}
                                    </Text>
                                )}
                                {group.links.map((link) => {
                                    const active = isPathActive(link.to);
                                    if (!desktopOpened) {
                                        return (
                                            <Tooltip label={link.label} key={link.label} position="right" withArrow>
                                                <ActionIcon
                                                    size="xl" variant={active ? 'light' : 'subtle'} color={link.color}
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
                                            key={link.to}
                                            label={<Text size="sm" fw={active ? 600 : 400}>{link.label}</Text>}
                                            leftSection={
                                                <ThemeIcon variant={active ? 'filled' : 'light'} color={link.color} size="md" radius="md">
                                                    <link.icon size={16} stroke={1.5} />
                                                </ThemeIcon>
                                            }
                                            active={active}
                                            onClick={() => { navigate(link.to); if (mobileOpened) toggleMobile(); }}
                                            variant="light" color={link.color} py={8} my={2}
                                            style={{ borderRadius: 'var(--mantine-radius-md)', textDecoration: 'none' }}
                                        />
                                    );
                                })}
                            </Box>
                        ))}
                    </Box>
                </AppShell.Section>

                <AppShell.Section p="sm" style={{ borderTop: '1px solid var(--app-border-light)' }}>
                    {desktopOpened ? (
                        <NavLink
                            label={<Text size="sm" fw={500}>E-Learning Portal</Text>}
                            leftSection={<ThemeIcon variant="filled" color="cyan" size="md" radius="md"><IconSchool size={16} stroke={1.5} /></ThemeIcon>}
                            rightSection={<IconArrowRight size={14} color="var(--mantine-color-cyan-6)" />}
                            onClick={() => navigate('/parent-portal/dashboard')}
                            py={8} style={{ borderRadius: 'var(--mantine-radius-md)' }}
                        />
                    ) : (
                        <Tooltip label="E-Learning Portal" position="right">
                            <ActionIcon variant="light" color="cyan" size="xl" onClick={() => navigate('/parent-portal/dashboard')} mx="auto" style={{ display: 'flex' }}>
                                <IconSchool size={20} stroke={1.5} />
                            </ActionIcon>
                        </Tooltip>
                    )}
                </AppShell.Section>
            </AppShell.Navbar>

            <AppShell.Main><Outlet /></AppShell.Main>

            <ScholarBotDrawer opened={aiOpened} onClose={closeAi} />
            <NotificationsDrawer opened={notifOpened} onClose={closeNotif} />
        </AppShell>
    );
}

export default ParentLayout;
