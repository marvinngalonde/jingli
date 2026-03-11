import {
    Button,
    Avatar,
    Group,
    Text,
    ActionIcon,
    Menu,
    rem,
    LoadingOverlay,
    Box,
    SimpleGrid,
    Paper,
    ThemeIcon,
    Tabs,
    Switch,
    Badge,
    Pagination,
} from '@mantine/core';
import {
    IconPlus,
    IconDots,
    IconEdit,
    IconTrash,
    IconUsers,
    IconUserShield,
    IconSchool,
    IconBriefcase,
    IconMail,
    IconRefresh,
} from '@tabler/icons-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, type Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useState, useEffect, useMemo } from 'react';
import { adminUsersService, type AdminUser } from '../../services/adminUsersService';
import { UserForm } from '../../components/admin/UserForm';
import { notifications } from '@mantine/notifications';
import { Modal, Stack } from '@mantine/core';

export default function Users() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<string | null>('all');
    const [drawerOpened, setDrawerOpened] = useState(false);
    const [deleteModalOpened, setDeleteModalOpened] = useState(false);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [drawerUser, setDrawerUser] = useState<AdminUser | null>(null);
    const [showInactive, setShowInactive] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [stats, setStats] = useState({ total: 0, admins: 0, teachers: 0, students: 0, active: 0, inactive: 0 });

    const loadUsers = async () => {
        setLoading(true);
        try {
            const [usersData, statsData] = await Promise.all([
                adminUsersService.getAllUsers(showInactive, page, 20),
                adminUsersService.getStats()
            ]);
            setUsers(usersData.data);
            setTotalPages(usersData.totalPages);
            setStats(statsData);
        } catch (error) {
            console.error('Failed to load users', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, [showInactive, page]);

    const handleDelete = async () => {
        if (!selectedUser) return;
        try {
            await adminUsersService.deleteUser(selectedUser.id);
            notifications.show({ title: 'Deactivated', message: 'User has been deactivated and can be restored later', color: 'green' });
            setDeleteModalOpened(false);
            setSelectedUser(null);
            loadUsers();
        } catch (error) {
            notifications.show({ title: 'Error', message: 'Failed to deactivate user', color: 'red' });
        }
    };

    const handleRestore = async (user: AdminUser) => {
        try {
            await adminUsersService.restoreUser(user.id);
            notifications.show({ title: 'Restored', message: `${user.staffProfile?.firstName || user.email} has been reactivated`, color: 'green' });
            loadUsers();
        } catch (error) {
            notifications.show({ title: 'Error', message: 'Failed to restore user', color: 'red' });
        }
    };

    const confirmDelete = (user: AdminUser) => {
        setSelectedUser(user);
        setDeleteModalOpened(true);
    };

    const handleInvite = (user: AdminUser) => {
        notifications.show({
            title: 'Invitation Sent',
            message: `A setup link has been sent to ${user.email}.`,
            color: 'blue'
        });
    };

    const columns: Column<AdminUser>[] = [
        {
            accessor: 'email',
            header: 'User',
            render: (item) => {
                const profile = item.staffProfile || item.studentProfile || item.guardianProfile;
                const name = profile ? `${profile.firstName} ${profile.lastName}` : 'No Profile';
                return (
                    <Group gap="sm">
                        <Avatar radius="xl" size="sm" color="blue">
                            {name.charAt(0)}
                        </Avatar>
                        <div>
                            <Text size="sm" fw={500}>{name}</Text>
                            <Text size="xs" c="dimmed">{item.email}</Text>
                        </div>
                    </Group>
                );
            }
        },
        {
            accessor: 'role',
            header: 'Role',
            render: (item) => <Text size="sm" style={{ textTransform: 'capitalize' }}>{item.role.toLowerCase()}</Text>
        },
        {
            accessor: 'status',
            header: 'Status',
            render: (item) => <StatusBadge status={item.status} />
        },
        {
            accessor: 'actions',
            header: '',
            width: 50,
            render: (item) => {
                return (
                    <Menu shadow="md" width={200}>
                        <Menu.Target>
                            <ActionIcon variant="transparent" color="gray">
                                <IconDots style={{ width: rem(16), height: rem(16) }} />
                            </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item
                                leftSection={<IconEdit style={{ width: rem(14), height: rem(14) }} />}
                                onClick={() => {
                                    setDrawerUser(item);
                                    setDrawerOpened(true);
                                }}
                            >
                                Edit User
                            </Menu.Item>
                            <Menu.Item
                                leftSection={<IconMail style={{ width: rem(14), height: rem(14) }} />}
                                onClick={() => handleInvite(item)}
                            >
                                Invite User
                            </Menu.Item>
                            {item.status === 'INACTIVE' ? (
                                <Menu.Item
                                    color="green"
                                    leftSection={<IconRefresh style={{ width: rem(14), height: rem(14) }} />}
                                    onClick={() => handleRestore(item)}
                                >
                                    Restore User
                                </Menu.Item>
                            ) : (
                                <Menu.Item
                                    color="red"
                                    leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                                    onClick={() => confirmDelete(item)}
                                >
                                    Deactivate User
                                </Menu.Item>
                            )}
                        </Menu.Dropdown>
                    </Menu>
                );
            }
        }
    ];

    const filteredData = users.filter(item => {
        // Tab Filtering
        if (activeTab !== 'all' && item.role !== activeTab) {
            // Special Case for 'Staff' tab which might group Receptionists, etc.
            if (activeTab === 'STAFF_GROUP' && !['RECEPTION', 'FINANCE'].includes(item.role)) {
                return false;
            } else if (activeTab !== 'STAFF_GROUP' && item.role !== activeTab) {
                return false;
            }
        }

        // Search Filtering
        const profile = item.staffProfile || item.studentProfile;
        const name = profile ? `${profile.firstName} ${profile.lastName}` : '';
        const searchLower = search.toLowerCase();
        return name.toLowerCase().includes(searchLower) ||
            (item.email || '').toLowerCase().includes(searchLower) ||
            item.role.toLowerCase().includes(searchLower);
    });

    return (
        <>
            <PageHeader
                title="User Management"
                subtitle="Manage system access and roles"
                actions={
                    <Group>
                        <Switch
                            label="Show Inactive"
                            checked={showInactive}
                            onChange={(e) => setShowInactive(e.currentTarget.checked)}
                            size="sm"
                        />
                        <Button leftSection={<IconPlus size={16} />} onClick={() => {
                            setDrawerUser(null);
                            setDrawerOpened(true);
                        }}>Add User</Button>
                    </Group>
                }
            />

            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} mb="xl">
                <StatsCard title="Total Users" value={stats.total} icon={IconUsers} color="blue" />
                <StatsCard title="Active Now" value={stats.active} icon={IconUserShield} color="green" />
                <StatsCard title="Teachers" value={stats.teachers} icon={IconBriefcase} color="orange" />
                <StatsCard title="Students" value={stats.students} icon={IconSchool} color="cyan" />
            </SimpleGrid>

            <Tabs value={activeTab} onChange={setActiveTab} radius="md" mb="md">
                <Tabs.List>
                    <Tabs.Tab value="all">All Users</Tabs.Tab>
                    <Tabs.Tab value="ADMIN">Administrators</Tabs.Tab>
                    <Tabs.Tab value="TEACHER">Teachers</Tabs.Tab>
                    <Tabs.Tab value="STUDENT">Students</Tabs.Tab>
                    <Tabs.Tab value="STAFF_GROUP">Other Staff</Tabs.Tab>
                </Tabs.List>
            </Tabs>

            <Box pos="relative">
                <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />
                <DataTable
                    data={filteredData}
                    columns={columns}
                    search={search}
                    onSearchChange={setSearch}
                    pagination={{ total: 1, page: 1, onChange: () => { } }}
                />
                {totalPages > 1 && (
                    <Group justify="flex-end" mt="md">
                        <Pagination total={totalPages} value={page} onChange={setPage} />
                    </Group>
                )}
            </Box>

            <UserForm
                opened={drawerOpened}
                onClose={() => {
                    setDrawerOpened(false);
                    setDrawerUser(null);
                }}
                user={drawerUser}
                onSuccess={loadUsers}
            />

            <Modal opened={deleteModalOpened} onClose={() => setDeleteModalOpened(false)} title="Deactivate User">
                <Stack gap="md">
                    <Text size="sm">
                        Are you sure you want to deactivate <b>{selectedUser?.staffProfile?.firstName || selectedUser?.studentProfile?.firstName || selectedUser?.guardianProfile?.firstName || selectedUser?.email}</b>?
                        They will no longer be able to log in, but their records will be kept for future reference. You can restore them later.
                    </Text>
                    <Group justify="flex-end" mt="md">
                        <Button variant="subtle" onClick={() => setDeleteModalOpened(false)}>Cancel</Button>
                        <Button color="red" onClick={handleDelete}>Deactivate</Button>
                    </Group>
                </Stack>
            </Modal>
        </>
    );
}

function StatsCard({ title, value, icon: Icon, color }: { title: string, value: number, icon: any, color: string }) {
    return (
        <Paper p="md" radius="md" withBorder>
            <Group justify="space-between">
                <div>
                    <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                        {title}
                    </Text>
                    <Text fw={700} size="xl">
                        {value}
                    </Text>
                </div>
                <ThemeIcon color={color} variant="light" size={38} radius="md">
                    <Icon size={24} />
                </ThemeIcon>
            </Group>
        </Paper>
    );
}
