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
} from '@mantine/core';
import { Search, Bell, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { showSuccessNotification, showErrorNotification } from '../utils/notifications';


export default function DashboardHeader() {
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState<any>(null);

    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            const profile = await authService.getCurrentProfile();
            setUserProfile(profile);
        } catch (error) {
            console.error('Failed to load user profile:', error);
        }
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
                <Indicator inline processing color="red" size={8} offset={4}>
                    <ActionIcon variant="subtle" color="gray" size="lg">
                        <Bell size={20} />
                    </ActionIcon>
                </Indicator>

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
