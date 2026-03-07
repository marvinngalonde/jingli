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
} from '@tabler/icons-react';

import logoFull from '../assets/logos/logo-trans.png';
import jaiLogo from '../assets/logos/jai-trans.png';
import { ScholarBotDrawer } from '../components/ai/ScholarBotDrawer';
import { NotificationsDrawer } from '../components/notifications/NotificationsDrawer';
import { notificationsService } from '../services/notificationsService';
import { useEffect, useState, useCallback } from 'react';
import { MobileBottomNav } from '../components/common/MobileBottomNav';

export function ReceptionLayout() {
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

    const links = [
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

    const mobileNavLinks = [
        { icon: IconLayoutDashboard, label: 'Home', to: '/reception/dashboard', color: 'blue' },
        { icon: IconHeartbeat, label: 'Health', to: '/reception/health', color: 'red' },
        { icon: IconShield, label: 'Conduct', to: '/reception/discipline', color: 'orange' },
        { icon: IconHome2, label: 'Hostel', to: '/reception/hostel', color: 'indigo' },
        { icon: IconUserPlus, label: 'Visitors', to: '/reception/visitors', color: 'teal' },
    ];

    const renderNavLink = (link: any) => {
        const isActive = location.pathname === link.to;

        return (
            <NavLink
                key={link.label}
                label={<Text size="sm" fw={isActive ? 600 : 400}>{link.label}</Text>}
                leftSection={
                    <ThemeIcon
                        variant={isActive ? 'filled' : 'light'}
                        color={isActive ? 'blue' : 'gray'}
                        size="md"
                        radius="md"
                    >
                        <link.icon size={16} stroke={1.5} />
                    </ThemeIcon>
                }
                active={isActive}
                onClick={() => navigate(link.to)}
                variant="light"
                py={8}
                my={2}
                style={{ borderRadius: 'var(--mantine-radius-md)', textDecoration: 'none' }}
            />
        );
    };

    return (
        <AppShell
            header={{ height: 64 }}
            navbar={{ width: 260, breakpoint: 'sm', collapsed: { mobile: true } }}
            padding="md"
            styles={{ main: { background: 'var(--app-surface-dim)' } }}
        >
            <AppShell.Header px="md">
                <Group h="100%" justify="space-between">
                    <Group>
                        <img src={logoFull} alt="Logo" style={{ height: 36 }} />
                    </Group>
                    <Group gap="sm">
                        <Badge variant="light" color="blue" size="lg" hiddenFrom="sm">Reception</Badge>
                        <Badge variant="light" color="blue" size="lg" visibleFrom="sm">Reception Desk</Badge>
                        <Tooltip label="Notifications">
                            <ActionIcon variant="subtle" color="gray" size="lg" onClick={openNotif}>
                                <Indicator color="red" label={unreadCount} disabled={unreadCount === 0} size={16}>
                                    <IconBell size={20} />
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
                                    <Avatar color="brand" radius="md">{user?.email?.[0]?.toUpperCase()}</Avatar>
                                </UnstyledButton>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Label>{user?.email}</Menu.Label>
                                <Menu.Item leftSection={<IconLogout size={14} />} color="red" onClick={() => { logout(); navigate('/login'); }}>Logout</Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Group>
                </Group>
            </AppShell.Header>

            <AppShell.Navbar p="sm" style={{ background: 'var(--app-sidebar-bg)' }}>
                <AppShell.Section grow component={ScrollArea}>
                    {links.map((group, i) => (
                        <Box key={i} mb="lg">
                            <Text size="xs" fw={700} c="dimmed" tt="uppercase" px="sm" mb={4}>{group.title}</Text>
                            {group.links.map(renderNavLink)}
                            {i < links.length - 1 && <Divider my="sm" variant="dotted" />}
                        </Box>
                    ))}
                </AppShell.Section>
            </AppShell.Navbar>

            <AppShell.Main>
                <Outlet />
            </AppShell.Main>

            <MobileBottomNav links={mobileNavLinks} />

            <ScholarBotDrawer opened={aiOpened} onClose={closeAi} />
            <NotificationsDrawer opened={notifOpened} onClose={closeNotif} />
        </AppShell>
    );
}

export default ReceptionLayout;
