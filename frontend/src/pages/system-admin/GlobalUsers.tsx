import {
    Box, Group, Title, Text, Table, Badge, TextInput, Card, Skeleton,
    Stack, Center, Pagination, Avatar, Tooltip, Select, Menu, ActionIcon, Modal, Button
} from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { IconSearch, IconUsers, IconBuildingBank, IconDotsVertical, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import dayjs from 'dayjs';
import { notifications } from '@mantine/notifications';

const ROLE_COLOR: Record<string, string> = {
    SYSTEM_ADMIN: 'violet',
    SUPER_ADMIN: 'indigo',
    ADMIN: 'blue',
    TEACHER: 'teal',
    STUDENT: 'cyan',
    PARENT: 'green',
    FINANCE: 'yellow',
    RECEPTION: 'orange',
};

const STATUS_COLOR: Record<string, string> = {
    ACTIVE: 'green',
    INACTIVE: 'gray',
    SUSPENDED: 'red',
};

export default function GlobalUsers() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; user: any } | null>(null);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['system-admin-users', page, search],
        queryFn: async () => {
            const res = await api.get('/system-admin/users', {
                params: { page, pageSize: 25, search }
            });
            return res.data;
        },
        placeholderData: (prev: any) => prev,
    });

    const deleteUserMutation = useMutation({
        mutationFn: async (id: string) => {
            return api.delete(`/system-admin/users/${id}`);
        },
        onSuccess: () => {
            notifications.show({
                title: 'User Deleted',
                message: 'User has been permanently deleted from the platform and Supabase.',
                color: 'red',
            });
            queryClient.invalidateQueries({ queryKey: ['system-admin-users'] });
            queryClient.invalidateQueries({ queryKey: ['system-admin-stats'] });
            setDeleteModal(null);
        },
        onError: () => {
             notifications.show({ title: 'Error', message: 'Failed to delete user.', color: 'red' });
        }
    });

    const users = (data as any)?.data ?? [];
    const totalPages = (data as any)?.totalPages ?? 1;

    const rows = users.map((user: any) => (
        <Table.Tr key={user.id}>
            <Table.Td>
                <Group gap="sm" wrap="nowrap">
                    <Avatar size={32} radius="xl" color="indigo">
                        {user.username?.[0]?.toUpperCase() || 'U'}
                    </Avatar>
                    <Box>
                        <Text size="sm" fw={600}>{user.username}</Text>
                        <Text size="xs" c="dimmed">{user.email || '—'}</Text>
                    </Box>
                </Group>
            </Table.Td>
            <Table.Td>
                <Badge
                    color={ROLE_COLOR[user.role] || 'gray'}
                    variant="light"
                    size="sm"
                    radius="sm"
                >
                    {user.role?.replace(/_/g, ' ')}
                </Badge>
            </Table.Td>
            <Table.Td>
                {user.school ? (
                    <Group gap={6}>
                        <IconBuildingBank size={14} color="gray" />
                        <Text size="sm">{user.school.name}</Text>
                    </Group>
                ) : (
                    <Badge color="violet" variant="dot" size="sm">Platform Admin</Badge>
                )}
            </Table.Td>
            <Table.Td>
                <Badge color={STATUS_COLOR[user.status] || 'gray'} variant="light" size="sm" radius="sm">
                    {user.status}
                </Badge>
            </Table.Td>
            <Table.Td>
                <Text size="sm" c="dimmed">{dayjs(user.createdAt).format('DD MMM YYYY')}</Text>
            </Table.Td>
            <Table.Td>
                <Text size="sm" c="dimmed">
                    {user.lastLogin ? dayjs(user.lastLogin).format('DD MMM, HH:mm') : 'Never'}
                </Text>
            </Table.Td>
            <Table.Td>
                <Menu shadow="md" width={200} position="bottom-end">
                    <Menu.Target>
                        <ActionIcon variant="subtle" color="gray">
                            <IconDotsVertical size={16} />
                        </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item
                            color="red"
                            leftSection={<IconTrash size={14} />}
                            onClick={() => setDeleteModal({ open: true, user })}
                        >
                            Delete User
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <Box p="md">
            <Group justify="space-between" mb="xl">
                <Box>
                    <Title order={2} c="dark.8" fw={800}>Global User Directory</Title>
                    <Text c="dimmed" size="sm" mt={2}>All users across every tenant school on the platform.</Text>
                </Box>
            </Group>

            <Card withBorder radius="lg" shadow="xs" p={0}>
                <Box p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
                    <Group>
                        <TextInput
                            placeholder="Search by username or email..."
                            leftSection={<IconSearch size={16} />}
                            value={search}
                            onChange={(e) => { setSearch(e.currentTarget.value); setPage(1); }}
                            style={{ flex: 1, maxWidth: 380 }}
                        />
                        <Text size="sm" c="dimmed" ml="auto">
                            {(data as any)?.total?.toLocaleString() ?? 0} users total
                        </Text>
                    </Group>
                </Box>

                <Table verticalSpacing="sm" highlightOnHover>
                    <Table.Thead style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
                        <Table.Tr>
                            <Table.Th>User</Table.Th>
                            <Table.Th>Role</Table.Th>
                            <Table.Th>School</Table.Th>
                            <Table.Th>Status</Table.Th>
                            <Table.Th>Joined</Table.Th>
                            <Table.Th>Last Login</Table.Th>
                            <Table.Th>Actions</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {isLoading ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <Table.Tr key={i}>
                                    {Array.from({ length: 7 }).map((_, j) => (
                                        <Table.Td key={j}><Skeleton height={18} radius="sm" /></Table.Td>
                                    ))}
                                </Table.Tr>
                            ))
                        ) : rows.length > 0 ? rows : (
                            <Table.Tr>
                                <Table.Td colSpan={7}>
                                    <Center py="xl">
                                        <Stack align="center" gap="xs">
                                            <IconUsers size={36} color="lightgray" />
                                            <Text c="dimmed">No users found.</Text>
                                        </Stack>
                                    </Center>
                                </Table.Td>
                            </Table.Tr>
                        )}
                    </Table.Tbody>
                </Table>

                {totalPages > 1 && (
                    <Box p="md" style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
                        <Group justify="flex-end">
                            <Pagination value={page} onChange={setPage} total={totalPages} color="indigo" size="sm" />
                        </Group>
                    </Box>
                )}
            </Card>

            {/* Delete Modal */}
            <Modal
                opened={!!deleteModal?.open}
                onClose={() => setDeleteModal(null)}
                title={<Text fw={800} c="red">Permanently Delete User</Text>}
                centered
                size="sm"
            >
                <Text size="sm" mb="md" fw={500}>
                    Are you absolutely sure you want to delete <strong>{deleteModal?.user?.username}</strong>?
                </Text>
                
                <Text size="xs" c="red" mb="xl">
                    <strong>WARNING:</strong> This will completely wipe all data associated with this user, including their files, assignments, logs, and Supabase auth identity. This cannot be undone.
                </Text>
                
                <Group justify="flex-end">
                    <Button variant="default" onClick={() => setDeleteModal(null)}>Cancel</Button>
                    <Button
                        color="red"
                        loading={deleteUserMutation.isPending}
                        onClick={() => {
                            if (deleteModal?.user) {
                                deleteUserMutation.mutate(deleteModal.user.id);
                            }
                        }}
                    >
                        Yes, Delete User
                    </Button>
                </Group>
            </Modal>
        </Box>
    );
}
