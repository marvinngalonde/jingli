import {
    Box,
    Group,
    TextInput,
    Select,
    Avatar,
    Indicator,
    ActionIcon,
    Menu,
    Text,
    rem,
    Button
} from '@mantine/core';
import { Search, Bell, ChevronDown, LogOut, User, Settings, Check } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../../services/authService';
import { notificationsService, type Notification } from '../../services/notificationsService';
import { showSuccessNotification, showErrorNotification } from '../../utils/notifications';

export default function DashboardHeader() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: userProfile } = useQuery({
        queryKey: ['userProfile'],
        queryFn: () => authService.getCurrentProfile(),
        staleTime: 5 * 60 * 1000, // Cache profile for 5 minutes
    });

    const { data: notificationData } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const [notifs, count] = await Promise.all([
                notificationsService.getAll(),
                notificationsService.getUnreadCount()
            ]);
            return { notifications: notifs, unreadCount: count.count };
        },
        refetchInterval: 60000, // Poll every minute replacing setInterval
    });

    const notifications = notificationData?.notifications || [];
    const unreadCount = notificationData?.unreadCount || 0;

    const markAsReadMutation = useMutation({
        mutationFn: (id: string) => notificationsService.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    const markAllAsReadMutation = useMutation({
        mutationFn: () => notificationsService.markAllAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    const handleMarkAsRead = (id: string) => {
        markAsReadMutation.mutate(id);
    };

    const handleMarkAllAsRead = () => {
        markAllAsReadMutation.mutate();
    };

    const handleLogout = async () => {
        try {
            await authService.signOut();
            showSuccessNotification('Logged out successfully');
            navigate('/login');
        } catch (error: any) {
            showErrorNotification(error.message || 'Failed to logout');
        }
    };

    const getUserInitials = () => {
        if (!userProfile?.full_name) return 'U';
        const names = userProfile.full_name.split(' ');
        return names.length > 1
            ? `${names[0][0]}${names[1][0]}`.toUpperCase()
            : names[0].substring(0, 2).toUpperCase();
    };
    return (
        <Box
            style={{
                height: rem(60),
                borderBottom: '1px solid var(--mantine-color-gray-2)',
                backgroundColor: 'white',
                padding: `0 ${rem(24)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                zIndex: 50,
            }}
        >
            {/* Search */}
            <TextInput
                placeholder="Search student, staff, ID..."
                leftSection={<Search size={16} />}
                style={{ width: rem(300) }}
                size="sm"
                radius={2}
            />

            {/* Right Section */}
            <Group gap="lg">
                {/* Academic Year Selector */}
                <Group gap="xs">
                    <Text size="sm" fw={500}>
                        Academic Year
                    </Text>
                    <Select
                        data={['2023-2024', '2024-2025', '2025-2026']}
                        defaultValue="2023-2024"
                        size="sm"
                        w={rem(120)}
                        radius={2}
                    />
                </Group>

                {/* Notifications */}
                <Menu shadow="md" width={320} position="bottom-end" withinPortal>
                    <Menu.Target>
                        <Indicator inline disabled={unreadCount === 0} label={unreadCount} size={16} color="red" offset={4}>
                            <ActionIcon variant="subtle" color="gray" size="lg">
                                <Bell size={20} />
                            </ActionIcon>
                        </Indicator>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Group justify="space-between" px="md" py="xs" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
                            <Text fw={600}>Notifications</Text>
                            {unreadCount > 0 && (
                                <Button variant="subtle" size="compact-xs" onClick={handleMarkAllAsRead}>
                                    Mark all read
                                </Button>
                            )}
                        </Group>

                        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                            {notifications.length === 0 ? (
                                <Text c="dimmed" size="sm" ta="center" py="xl">No notifications yet</Text>
                            ) : (
                                notifications.map((notif: Notification) => (
                                    <Menu.Item
                                        key={notif.id}
                                        onClick={() => !notif.readStatus && handleMarkAsRead(notif.id)}
                                        style={{
                                            backgroundColor: notif.readStatus ? 'transparent' : 'var(--mantine-color-blue-0)',
                                            borderBottom: '1px solid var(--mantine-color-gray-1)',
                                            padding: '12px 16px',
                                        }}
                                    >
                                        <Group wrap="nowrap" align="flex-start">
                                            <div style={{ flex: 1 }}>
                                                <Group justify="space-between" mb={4}>
                                                    <Text size="sm" fw={notif.readStatus ? 500 : 700} c={notif.readStatus ? 'gray.8' : 'dark'}>
                                                        {notif.title}
                                                    </Text>
                                                    <Text size="xs" c="dimmed">
                                                        {new Date(notif.createdAt).toLocaleDateString()}
                                                    </Text>
                                                </Group>
                                                <Text size="xs" c={notif.readStatus ? 'dimmed' : 'gray.7'} lineClamp={2}>
                                                    {notif.message}
                                                </Text>
                                            </div>
                                            {!notif.readStatus && (
                                                <ActionIcon
                                                    size="sm"
                                                    variant="transparent"
                                                    color="blue"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMarkAsRead(notif.id);
                                                    }}
                                                >
                                                    <Check size={14} />
                                                </ActionIcon>
                                            )}
                                        </Group>
                                    </Menu.Item>
                                ))
                            )}
                        </div>
                    </Menu.Dropdown>
                </Menu>

                {/* User Menu */}
                <Menu shadow="md" width={200} position="bottom-end">
                    <Menu.Target>
                        <Group gap="xs" style={{ cursor: 'pointer' }}>
                            <Avatar
                                src={userProfile?.avatar_url}
                                alt={userProfile?.full_name || 'User'}
                                color="navy"
                                size="sm"
                                radius="xl"
                            >
                                {getUserInitials()}
                            </Avatar>
                            <Text size="sm" fw={500}>
                                {userProfile?.full_name || 'User'}
                            </Text>
                            <ChevronDown size={16} />
                        </Group>
                    </Menu.Target>

                    <Menu.Dropdown>
                        <Menu.Item leftSection={<User size={16} />}>
                            Profile
                        </Menu.Item>
                        <Menu.Item leftSection={<Settings size={16} />}>
                            Settings
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item
                            color="red"
                            leftSection={<LogOut size={16} />}
                            onClick={handleLogout}
                        >
                            Logout
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Group>
        </Box>
    );
}
