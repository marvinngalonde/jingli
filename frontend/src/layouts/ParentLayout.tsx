import {
    Box, AppShell, Group, Burger, Title, useMantineTheme, Avatar, Text, Menu,
    UnstyledButton, NavLink, Stack, ScrollArea, ThemeIcon, Divider, Badge
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    IconLayoutDashboard, IconCreditCard, IconSettings, IconLogout,
    IconMessage, IconChartBar, IconCurrencyDollar, IconChevronRight,
    IconSchool, IconArrowRight, IconCalendar,
} from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import logoFull from '../assets/logos/logo-trans.png';

const sidebarGroups = [
    {
        title: 'Overview',
        links: [
            { icon: IconLayoutDashboard, label: 'Dashboard', to: '/parent/dashboard', color: 'cyan' },
            { icon: IconMessage, label: 'Messages', to: '/parent/communication', color: 'grape' },
        ],
    },
    {
        title: 'Children',
        links: [
            { icon: IconChartBar, label: 'Performance', to: '/parent/performance', color: 'teal' },
            { icon: IconCreditCard, label: 'Financials', to: '/parent/financials', color: 'indigo' },
            { icon: IconCurrencyDollar, label: 'Fees', to: '/parent/fees', color: 'red' },
        ],
    },
];

const mobileNavLinks = [
    { icon: IconLayoutDashboard, label: 'Home', to: '/parent/dashboard', color: 'cyan' },
    { icon: IconChartBar, label: 'Progress', to: '/parent/performance', color: 'teal' },
    { icon: IconCurrencyDollar, label: 'Fees', to: '/parent/fees', color: 'red' },
    { icon: IconMessage, label: 'Messages', to: '/parent/communication', color: 'grape' },
    { icon: IconSchool, label: 'Portal', to: '/parent-portal/dashboard', color: 'blue' },
];

export function ParentLayout() {
    const [opened, { toggle, close }] = useDisclosure();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useMantineTheme();
    const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

    const handleLogout = () => { logout(); navigate('/login'); };

    const isPathActive = (path: string) => {
        if (path === '/parent/dashboard') return location.pathname === '/parent/dashboard';
        return location.pathname.startsWith(path);
    };

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{ width: 260, breakpoint: 'sm', collapsed: { mobile: !opened } }}
            padding="md"
        >
            <AppShell.Header>
                <Group h="100%" px="md" justify="space-between">
                    <Group>
                        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                        <Group gap="xs" style={{ cursor: 'pointer' }} onClick={() => navigate('/parent/dashboard')}>
                            <img src={logoFull} alt="Logo" height={32} style={{ objectFit: 'contain' }} />
                            <Title order={4} visibleFrom="xs" style={{ fontFamily: 'Outfit, sans-serif' }}>Parent</Title>
                        </Group>
                    </Group>
                    <Menu shadow="md" width={220} position="bottom-end">
                        <Menu.Target>
                            <UnstyledButton>
                                <Avatar color="cyan" radius="xl" size="sm">
                                    {user?.firstName?.[0] || user?.profile?.firstName?.[0] || 'P'}
                                </Avatar>
                            </UnstyledButton>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Label>
                                <Text size="sm" fw={500}>{user?.firstName || user?.profile?.firstName} {user?.lastName || user?.profile?.lastName}</Text>
                                <Text size="xs" c="dimmed">{user?.email}</Text>
                            </Menu.Label>
                            <Menu.Divider />
                            <Menu.Item leftSection={<IconSettings size={14} />}>Settings</Menu.Item>
                            <Menu.Divider />
                            <Menu.Item color="red" leftSection={<IconLogout size={14} />} onClick={handleLogout}>Sign out</Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Group>
            </AppShell.Header>

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
                    {/* Portal Entry */}
                    <NavLink
                        label={
                            <Group justify="space-between" w="100%">
                                <Text size="sm" fw={600} c="cyan">Parent Portal</Text>
                                <Badge variant="filled" color="cyan" size="xs">Open</Badge>
                            </Group>
                        }
                        leftSection={
                            <ThemeIcon variant="filled" color="cyan" size="sm" radius="md">
                                <IconSchool size={14} stroke={1.5} />
                            </ThemeIcon>
                        }
                        rightSection={<IconArrowRight size={14} color="var(--mantine-color-cyan-6)" />}
                        onClick={() => { navigate('/parent-portal/dashboard'); close(); }}
                        py={8} mb="xs"
                        style={{ borderRadius: 'var(--mantine-radius-md)', textDecoration: 'none' }}
                    />
                    <NavLink
                        label="Sign Out"
                        leftSection={<ThemeIcon variant="light" color="red" size="sm" radius="md"><IconLogout size={14} stroke={1.5} /></ThemeIcon>}
                        onClick={handleLogout}
                        py={8}
                        style={{ borderRadius: 'var(--mantine-radius-md)', textDecoration: 'none' }}
                    />
                </AppShell.Section>
            </AppShell.Navbar>

            <AppShell.Main pb={isMobile ? 80 : undefined}>
                <Box maw={1200} mx="auto"><Outlet /></Box>
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

export default ParentLayout;
