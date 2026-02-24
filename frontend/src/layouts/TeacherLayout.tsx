import { AppShell, Group, Text, Avatar, Menu, UnstyledButton, ActionIcon, Indicator, Tooltip, Box, Badge, Container } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Outlet, useLocation, NavLink as RouterNavLink } from 'react-router-dom';
import {
    IconSettings,
    IconLogout,
    IconCalendar,
    IconBook,
    IconMessage,
    IconClipboardList,
    IconFiles,
    IconDots,
    IconBell,
    IconChevronDown,
    IconLayoutDashboard,
    IconChalkboard,
    IconFileAnalytics
} from '@tabler/icons-react';

import logoFull from '../assets/logos/logo-trans.png';
import jaiLogo from '../assets/logos/jai-trans.png';
import { ScholarBotDrawer } from '../components/ai/ScholarBotDrawer';
import { NotificationsDrawer } from '../components/notifications/NotificationsDrawer';
import { notificationsService } from '../services/notificationsService';
import { useEffect, useState, useCallback } from 'react';

export function TeacherLayout() {
    const [aiOpened, { open: openAi, close: closeAi }] = useDisclosure(false);
    const [notifOpened, { open: openNotif, close: closeNotif }] = useDisclosure(false);
    const [moreOpened, { toggle: toggleMore, close: closeMore }] = useDisclosure(false);
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

    const handleCloseNotif = () => {
        closeNotif();
        fetchUnreadCount();
    };

    const navLinks = [
        { icon: IconLayoutDashboard, label: 'Dashboard', to: '/teacher/dashboard' },
        { icon: IconChalkboard, label: 'My Classes', to: '/teacher/classes' },
        { icon: IconCalendar, label: 'My Timetable', to: '/teacher/timetable' },
        { icon: IconMessage, label: 'Inbox', to: '/teacher/inbox' },
        { icon: IconClipboardList, label: 'Assignments', to: '/teacher/assignments' },
        { icon: IconFiles, label: 'Materials', to: '/teacher/materials' },
        { icon: IconFileAnalytics, label: 'Grading', to: '/teacher/grading' },
        { icon: IconBook, label: 'Library', to: '/teacher/library' },
        { icon: IconCalendar, label: 'Calendar', to: '/teacher/calendar' },
    ];

    const mobileVisibleLinks = navLinks.slice(0, 4);
    const mobileMoreLinks = navLinks.slice(4);

    const desktopVisibleLinks = navLinks.slice(0, 4); // Keep first 4 in header
    const desktopMoreLinks = navLinks.slice(4); // Put rest in a dropdown

    return (
        <AppShell
            header={{ height: 60 }}
            padding="md"
            style={{
                background: '#f8fafc', // Slightly lighter than standard dash
            }}
        >
            <AppShell.Header style={{ borderBottom: '1px solid #e2e8f0', background: 'rgba(255,255,255,0.98)' }}>
                <Container size="xl" h="100%">
                    <Group h="100%" justify="space-between">
                        <Group gap="xl">
                            {/* Logo */}
                            <img
                                src={logoFull}
                                alt="Jingli Logo"
                                style={{
                                    height: 36,
                                    maxWidth: '100%',
                                    objectFit: 'contain',
                                    cursor: 'pointer'
                                }}
                                onClick={() => navigate('/teacher/dashboard')}
                            />

                            {/* Top Navigation Links */}
                            <Group gap="sm" visibleFrom="lg">
                                {desktopVisibleLinks.map((link) => {
                                    const isActive = location.pathname.startsWith(link.to);
                                    return (
                                        <UnstyledButton
                                            key={link.to}
                                            component={RouterNavLink}
                                            to={link.to}
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                color: isActive ? 'var(--mantine-color-brand-6)' : 'var(--mantine-color-gray-7)',
                                                backgroundColor: isActive ? 'var(--mantine-color-brand-0)' : 'transparent',
                                                fontWeight: isActive ? 600 : 500,
                                                fontSize: '14px'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isActive) e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-0)';
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                                            }}
                                        >
                                            <link.icon size={18} stroke={isActive ? 2 : 1.5} />
                                            <Text size="sm">{link.label}</Text>
                                        </UnstyledButton>
                                    );
                                })}

                                {/* Desktop More Dropdown */}
                                <Menu shadow="md" width={200} trigger="hover" openDelay={100} closeDelay={200}>
                                    <Menu.Target>
                                        <UnstyledButton
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                color: 'var(--mantine-color-gray-7)',
                                                fontWeight: 500,
                                                fontSize: '14px'
                                            }}
                                        >
                                            <IconDots size={18} stroke={1.5} />
                                            <Text size="sm">More Tools</Text>
                                            <IconChevronDown size={14} />
                                        </UnstyledButton>
                                    </Menu.Target>
                                    <Menu.Dropdown>
                                        <Menu.Label>Teaching Tools</Menu.Label>
                                        {desktopMoreLinks.map((link) => {
                                            const isActive = location.pathname.startsWith(link.to);
                                            return (
                                                <Menu.Item
                                                    key={link.to}
                                                    leftSection={<link.icon size={16} />}
                                                    color={isActive ? 'brand' : undefined}
                                                    onClick={() => navigate(link.to)}
                                                >
                                                    {link.label}
                                                </Menu.Item>
                                            );
                                        })}
                                    </Menu.Dropdown>
                                </Menu>
                            </Group>
                        </Group>

                        {/* Right Action Icons */}
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

                            <Tooltip label="Teacher AI Assistant">
                                <ActionIcon variant="subtle" color="blue" size="lg" onClick={openAi}>
                                    <img src={jaiLogo} alt="AI" style={{ height: 22 }} />
                                </ActionIcon>
                            </Tooltip>

                            <Menu shadow="md" width={200} position="bottom-end">
                                <Menu.Target>
                                    <UnstyledButton>
                                        <Group gap="xs">
                                            <Avatar radius="md" color="brand" size={32}>{user?.email?.[0]?.toUpperCase()}</Avatar>
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
                </Container>
            </AppShell.Header>

            <AppShell.Main>
                <Container size="xl" pt="md" pb={{ base: 80, sm: 'md' }}>
                    <Outlet />
                </Container>
            </AppShell.Main>

            {/* Mobile Bottom Navigation */}
            <Box
                hiddenFrom="sm"
                pos="fixed"
                bottom={0}
                left={0}
                right={0}
                p="xs"
                style={{
                    backgroundColor: 'rgba(255,255,255,0.98)',
                    borderTop: '1px solid #e2e8f0',
                    zIndex: 100,
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)'
                }}
            >
                {mobileVisibleLinks.map((link) => {
                    const isActive = location.pathname.startsWith(link.to);
                    const label = link.label.replace('My ', '');
                    return (
                        <UnstyledButton
                            key={link.to}
                            component={RouterNavLink}
                            to={link.to}
                            onClick={closeMore}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px',
                                color: isActive ? 'var(--mantine-color-brand-6)' : 'var(--mantine-color-gray-5)',
                            }}
                        >
                            <link.icon size={22} stroke={isActive ? 2 : 1.5} />
                            <Text style={{ fontSize: '10px', fontWeight: isActive ? 600 : 500 }}>{label}</Text>
                        </UnstyledButton>
                    );
                })}

                {/* More Drawer Pattern for remaining links */}
                <Menu opened={moreOpened} onChange={toggleMore} position="top-end" offset={15} withArrow>
                    <Menu.Target>
                        <UnstyledButton
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px',
                                color: moreOpened ? 'var(--mantine-color-brand-6)' : 'var(--mantine-color-gray-5)',
                            }}
                        >
                            <IconDots size={22} stroke={moreOpened ? 2 : 1.5} />
                            <Text style={{ fontSize: '10px', fontWeight: moreOpened ? 600 : 500 }}>More</Text>
                        </UnstyledButton>
                    </Menu.Target>
                    <Menu.Dropdown>
                        {mobileMoreLinks.map((link) => {
                            const isActive = location.pathname.startsWith(link.to);
                            return (
                                <Menu.Item
                                    key={link.to}
                                    leftSection={<link.icon size={16} />}
                                    color={isActive ? 'brand' : undefined}
                                    onClick={() => {
                                        navigate(link.to);
                                        closeMore();
                                    }}
                                >
                                    {link.label}
                                </Menu.Item>
                            );
                        })}
                    </Menu.Dropdown>
                </Menu>
            </Box>

            <ScholarBotDrawer opened={aiOpened} onClose={closeAi} />
            <NotificationsDrawer opened={notifOpened} onClose={handleCloseNotif} />
        </AppShell>
    );
}
