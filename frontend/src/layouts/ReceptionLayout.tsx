import { AppShell, Burger, Group, NavLink, Text, ScrollArea, Avatar, Menu, UnstyledButton, ActionIcon, Indicator, Tooltip, Box, Badge, ThemeIcon, Divider } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
    IconLayoutDashboard,
    IconUsers,
    IconCurrencyDollar,
    IconLogout,
    IconBell,
    IconChevronDown,
    IconCalendar,
    IconLayoutSidebarLeftCollapse,
    IconLayoutSidebarLeftExpand,
    IconSpeakerphone,
    IconBus,
    IconHeartbeat,
    IconShield,
    IconHome2,
    IconCalendarEvent,
    IconUserPlus,
    IconClipboardCheck,
    IconSearch,
    IconBuildingFortress,
    IconSettings,
} from '@tabler/icons-react';

import logoFull from '../assets/logos/logo-trans.png';
import jaiLogo from '../assets/logos/jai-trans.png';
import { JingliAIDrawer } from '../components/ai/JingliAIDrawer';
import { NotificationsDrawer } from '../components/notifications/NotificationsDrawer';
import { notificationsService } from '../services/notificationsService';
import { useEffect, useState, useCallback } from 'react';
import { MobileBottomNav } from '../components/common/MobileBottomNav';
import type { NavItem } from '../types/nav';

export function ReceptionLayout() {
    const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
    const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
    const [aiOpened, { open: openAi, close: closeAi }] = useDisclosure(false);
    const [notifOpened, { open: openNotif, close: closeNotif }] = useDisclosure(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const aiEnabled = user?.school?.aiEnabled ?? false;

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

    const linkGroups = [
        {
            title: 'Overview', links: [
                { icon: IconLayoutDashboard, label: 'Dashboard', to: '/reception/dashboard' },
                { icon: IconCalendar, label: 'Calendar', to: '/reception/calendar' },
                { icon: IconSpeakerphone, label: 'Communication', to: '/reception/communication' },
            ]
        },
        {
            title: 'Front Desk', links: [
                { icon: IconUserPlus, label: 'Visitors', to: '/reception/visitors' },
                { icon: IconClipboardCheck, label: 'Admissions', to: '/reception/admissions' },
                { icon: IconCurrencyDollar, label: 'Fee Collection', to: '/reception/fees' },
                { icon: IconSearch, label: 'Student Search', to: '/reception/students' },
            ]
        },
        {
            title: 'Welfare', links: [
                { icon: IconHeartbeat, label: 'Health', to: '/reception/health' },
                { icon: IconShield, label: 'Discipline', to: '/reception/discipline' },
                { icon: IconHome2, label: 'Hostel', to: '/reception/hostel' },
                { icon: IconCalendarEvent, label: 'Events', to: '/reception/events' },
            ]
        },
        {
            title: 'Logistics', links: [
                { icon: IconBus, label: 'Transport', to: '/reception/transport' },
                { icon: IconBuildingFortress, label: 'Facilities', to: '/reception/facilities' },
            ]
        }
    ];

    const mobileNavLinks: NavItem[] = [
        { icon: IconLayoutDashboard, label: 'Home', to: '/reception/dashboard', color: 'blue' },
        { icon: IconHeartbeat, label: 'Health', to: '/reception/health', color: 'red' },
        { icon: IconShield, label: 'Conduct', to: '/reception/discipline', color: 'orange' },
        { icon: IconHome2, label: 'Hostel', to: '/reception/hostel', color: 'indigo' },
        { icon: IconUserPlus, label: 'Visitors', to: '/reception/visitors', color: 'teal' },
    ];

    const renderNavLink = (link: any) => {
        const isActive = location.pathname === link.to ||
            (link.to !== '/reception/dashboard' && location.pathname.startsWith(link.to));

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
                            styles={{ root: { textTransform: 'none' } }}
                            visibleFrom="md"
                        >
                            Reception Desk
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
                                        <Avatar radius="md" color="brand" size={34}>{user?.email?.[0]?.toUpperCase()}</Avatar>
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
                                <Avatar radius="md" color="brand" size={36}>{user?.email?.[0]?.toUpperCase()}</Avatar>
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

            <MobileBottomNav links={mobileNavLinks} />

            <JingliAIDrawer opened={aiOpened} onClose={closeAi} />
            <NotificationsDrawer opened={notifOpened} onClose={handleCloseNotif} />
        </AppShell>
    );
}

export default ReceptionLayout;
