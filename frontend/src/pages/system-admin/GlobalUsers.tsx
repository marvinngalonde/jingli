import {
    Box, Group, Title, Text, Table, Badge, TextInput, Card, Skeleton,
    Stack, Center, Pagination, Avatar, Tooltip, Select
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { IconSearch, IconUsers, IconBuildingBank } from '@tabler/icons-react';
import { useState } from 'react';
import dayjs from 'dayjs';

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
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {isLoading ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <Table.Tr key={i}>
                                    {Array.from({ length: 6 }).map((_, j) => (
                                        <Table.Td key={j}><Skeleton height={18} radius="sm" /></Table.Td>
                                    ))}
                                </Table.Tr>
                            ))
                        ) : rows.length > 0 ? rows : (
                            <Table.Tr>
                                <Table.Td colSpan={6}>
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
        </Box>
    );
}
