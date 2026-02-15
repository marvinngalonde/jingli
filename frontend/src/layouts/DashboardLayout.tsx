import { AppShell, Burger, Group, NavLink, Text, ThemeIcon, ScrollArea, Avatar, Menu, UnstyledButton, rem } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
    IconHome,
    IconUsers,
    IconSchool,
    IconCalendar,
    IconCoin,
    IconSettings,
    IconLogout,
    IconChevronRight
} from '@tabler/icons-react';

export function DashboardLayout() {
    const [opened, { toggle }] = useDisclosure();
    const navigate = useNavigate();
    const location = useLocation();

    const links = [
        { icon: IconHome, label: 'Dashboard', to: '/dashboard' },
        { icon: IconUsers, label: 'Students', to: '/students' },
        { icon: IconSchool, label: 'Classes', to: '/classes' },
        { icon: IconUsers, label: 'Staff', to: '/staff' },
        { icon: IconCalendar, label: 'Academic Years', to: '/academic-years' },
        { icon: IconCoin, label: 'Finance', to: '/finance' },
        { icon: IconSettings, label: 'Settings', to: '/settings' },
    ];

    const mainLinks = links.map((link) => (
        <NavLink
            key={link.label}
            label={link.label}
            leftSection={<link.icon size="1.2rem" stroke={1.5} />}
            active={location.pathname.startsWith(link.to)}
            onClick={() => {
                navigate(link.to);
                if (window.innerWidth < 768) toggle(); // Close on mobile
            }}
            variant="light"
            color="brand"
            py="md"
            my={4}
            style={{ borderRadius: 'var(--mantine-radius-md)' }}
        />
    ));

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{
                width: 300,
                breakpoint: 'sm',
                collapsed: { mobile: !opened },
            }}
            padding="md"
            style={{
                background: 'linear-gradient(135deg, #f8f9fa 0%, #eef3ff 100%)', // Subtle background
            }}
        >
            <AppShell.Header>
                <Group h="100%" px="md" justify="space-between">
                    <Group>
                        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                        <ThemeIcon variant="gradient" gradient={{ from: 'brand', to: 'cyan' }} size="lg" radius="xl">
                            <IconSchool size={20} stroke={1.5} />
                        </ThemeIcon>
                        <Text fw={700} size="xl" style={{ fontFamily: 'Inter, sans-serif' }}>Jingli</Text>
                    </Group>

                    <Menu shadow="md" width={200}>
                        <Menu.Target>
                            <UnstyledButton>
                                <Group>
                                    <Avatar radius="xl" color="brand">AD</Avatar>
                                    <div style={{ flex: 1 }}>
                                        <Text size="sm" fw={500}>Admin User</Text>
                                        <Text c="dimmed" size="xs">admin@school.com</Text>
                                    </div>
                                </Group>
                            </UnstyledButton>
                        </Menu.Target>

                        <Menu.Dropdown>
                            <Menu.Label>Application</Menu.Label>
                            <Menu.Item leftSection={<IconSettings size={14} />}>Settings</Menu.Item>
                            <Menu.Divider />
                            <Menu.Item
                                color="red"
                                leftSection={<IconLogout size={14} />}
                                onClick={() => navigate('/login')}
                            >
                                Logout
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Group>
            </AppShell.Header>

            <AppShell.Navbar p="md">
                <AppShell.Section grow component={ScrollArea}>
                    {mainLinks}
                </AppShell.Section>
                <AppShell.Section>
                    <Text c="dimmed" size="xs" ta="center" mt="md">v2.0.0 (Beta)</Text>
                </AppShell.Section>
            </AppShell.Navbar>

            <AppShell.Main>
                <Outlet />
            </AppShell.Main>
        </AppShell>
    );
}
