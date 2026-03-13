import {
    Box, Group, Title, Text, Table, Badge, Button, ActionIcon, Menu, TextInput,
    ThemeIcon, Card, Skeleton, Stack, Center, Pagination, Modal, Tooltip, Switch
} from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import {
    IconSearch, IconDotsVertical, IconBan, IconCheck,
    IconExternalLink, IconBuildingBank, IconPlus, IconUsers, IconChalkboard, IconRefresh, IconRobot
} from '@tabler/icons-react';
import { useState } from 'react';
import dayjs from 'dayjs';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { IconTrash } from '@tabler/icons-react';

const STATUS_COLOR: Record<string, string> = {
    ACTIVE: 'green',
    SUSPENDED: 'red',
    TRIAL: 'yellow',
};

export default function SchoolManager() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [confirmModal, setConfirmModal] = useState<{ open: boolean; school: any; newStatus: string } | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; school: any } | null>(null);
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['system-admin-schools', page, search],
        queryFn: async () => {
            const res = await api.get('/system-admin/schools', {
                params: { page, pageSize: 15, search }
            });
            return res.data;
        },
        placeholderData: (prev: any) => prev,
    });

    const toggleStatus = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            return api.patch(`/system-admin/schools/${id}/status`, { status });
        },
        onSuccess: (_, vars) => {
            notifications.show({
                title: vars.status === 'SUSPENDED' ? 'School Suspended' : 'School Activated',
                message: `Status updated successfully.`,
                color: vars.status === 'SUSPENDED' ? 'red' : 'green',
            });
            queryClient.invalidateQueries({ queryKey: ['system-admin-schools'] });
            queryClient.invalidateQueries({ queryKey: ['system-admin-stats'] });
            setConfirmModal(null);
        },
        onError: () => {
            notifications.show({ title: 'Error', message: 'Failed to update school status.', color: 'red' });
        },
    });

    const toggleAi = useMutation({
        mutationFn: async ({ id, aiEnabled }: { id: string; aiEnabled: boolean }) => {
            return api.patch(`/system-admin/schools/${id}/ai`, { aiEnabled });
        },
        onSuccess: (_, vars) => {
            notifications.show({
                title: vars.aiEnabled ? 'AI Enabled' : 'AI Disabled',
                message: `Jingli AI access has been ${vars.aiEnabled ? 'enabled' : 'disabled'} for this school.`,
                color: vars.aiEnabled ? 'violet' : 'gray',
            });
            queryClient.invalidateQueries({ queryKey: ['system-admin-schools'] });
        },
        onError: () => {
            notifications.show({ title: 'Error', message: 'Failed to update AI access.', color: 'red' });
        },
    });

    const deleteSchoolMutation = useMutation({
        mutationFn: async (id: string) => {
            return api.delete(`/system-admin/schools/${id}`);
        },
        onSuccess: () => {
            notifications.show({
                title: 'School Deleted',
                message: 'School and all associated data have been permanently deleted.',
                color: 'red',
            });
            queryClient.invalidateQueries({ queryKey: ['system-admin-schools'] });
            queryClient.invalidateQueries({ queryKey: ['system-admin-stats'] });
            setDeleteModal(null);
        },
        onError: () => {
             notifications.show({ title: 'Error', message: 'Failed to delete school.', color: 'red' });
        }
    });

    const schools = data?.data ?? [];
    const totalPages = data?.totalPages ?? 1;

    const rows = schools.map((school: any) => (
        <Table.Tr key={school.id}>
            <Table.Td>
                <Group gap="sm" wrap="nowrap">
                    <ThemeIcon variant="light" color="indigo" size={36} radius="xl">
                        <IconBuildingBank size={18} />
                    </ThemeIcon>
                    <Box>
                        <Text size="sm" fw={600}>{school.name}</Text>
                        <Text size="xs" c="dimmed">{school.subdomain}.jingli.co.zw</Text>
                    </Box>
                </Group>
            </Table.Td>
            <Table.Td>
                <Group gap={4}>
                    <IconUsers size={14} color="gray" />
                    <Text size="sm">{school._count?.students ?? 0}</Text>
                </Group>
            </Table.Td>
            <Table.Td>
                <Group gap={4}>
                    <IconChalkboard size={14} color="gray" />
                    <Text size="sm">{school._count?.staff ?? 0}</Text>
                </Group>
            </Table.Td>
            <Table.Td>
                <Text size="sm">{school._count?.users ?? 0}</Text>
            </Table.Td>
            <Table.Td>
                <Text size="sm" c="dimmed">{dayjs(school.createdAt).format('DD MMM YYYY')}</Text>
            </Table.Td>
            <Table.Td>
                <Badge color={STATUS_COLOR[school.status] || 'gray'} variant="light" radius="sm">
                    {school.status || 'ACTIVE'}
                </Badge>
            </Table.Td>
            <Table.Td>
                <Tooltip label={school.aiEnabled ? 'Disable Jingli AI' : 'Enable Jingli AI'} withArrow>
                    <Switch
                        size="sm"
                        color="violet"
                        checked={!!school.aiEnabled}
                        thumbIcon={<IconRobot size={10} />}
                        onChange={(e) => toggleAi.mutate({ id: school.id, aiEnabled: e.currentTarget.checked })}
                        label={<Text size="xs" c={school.aiEnabled ? 'violet' : 'dimmed'}>{school.aiEnabled ? 'On' : 'Off'}</Text>}
                    />
                </Tooltip>
            </Table.Td>
            <Table.Td>
                <Menu shadow="md" width={210} position="bottom-end">
                    <Menu.Target>
                        <ActionIcon variant="subtle" color="gray">
                            <IconDotsVertical size={16} />
                        </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item
                            leftSection={<IconExternalLink size={14} />}
                            onClick={() => window.open(`https://${school.subdomain}.jingli.co.zw`, '_blank')}
                        >
                            Open School Portal
                        </Menu.Item>
                        <Menu.Divider />
                        {school.status !== 'SUSPENDED' ? (
                            <Menu.Item
                                color="red"
                                leftSection={<IconBan size={14} />}
                                onClick={() => setConfirmModal({ open: true, school, newStatus: 'SUSPENDED' })}
                            >
                                Suspend Operations
                            </Menu.Item>
                        ) : (
                            <Menu.Item
                                color="green"
                                leftSection={<IconCheck size={14} />}
                                onClick={() => setConfirmModal({ open: true, school, newStatus: 'ACTIVE' })}
                            >
                                Reactivate School
                            </Menu.Item>
                        )}
                        <Menu.Divider />
                        <Menu.Item
                            color="red"
                            leftSection={<IconTrash size={14} />}
                            onClick={() => setDeleteModal({ open: true, school })}
                        >
                            Delete School
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <Box p="md">
            {/* Header */}
            <Group justify="space-between" mb="xl">
                <Box>
                    <Title order={2} c="dark.8" fw={800}>School Network</Title>
                    <Text c="dimmed" size="sm" mt={2}>Manage all tenant schools — suspend, reactivate, and monitor activity.</Text>
                </Box>
                <Group>
                    <Tooltip label="Refresh data">
                        <ActionIcon variant="light" color="indigo" size="lg" onClick={() => refetch()}>
                            <IconRefresh size={18} />
                        </ActionIcon>
                    </Tooltip>
                    <Button color="indigo" leftSection={<IconPlus size={16} />} variant="filled">
                        Provision New School
                    </Button>
                </Group>
            </Group>

            <Card withBorder radius="lg" shadow="xs" p={0}>
                {/* Search Bar */}
                <Box p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
                    <Group>
                        <TextInput
                            placeholder="Search by school name or subdomain..."
                            leftSection={<IconSearch size={16} />}
                            value={search}
                            onChange={(e) => { setSearch(e.currentTarget.value); setPage(1); }}
                            style={{ flex: 1, maxWidth: 380 }}
                        />
                        <Text size="sm" c="dimmed" ml="auto">
                            {data?.total ?? 0} school{data?.total !== 1 ? 's' : ''} found
                        </Text>
                    </Group>
                </Box>

                {/* Table */}
                <Table verticalSpacing="sm" highlightOnHover>
                    <Table.Thead style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
                        <Table.Tr>
                            <Table.Th>School</Table.Th>
                            <Table.Th>Students</Table.Th>
                            <Table.Th>Staff</Table.Th>
                            <Table.Th>Total Users</Table.Th>
                            <Table.Th>Onboarded</Table.Th>
                            <Table.Th>Status</Table.Th>
                            <Table.Th>Jingli AI</Table.Th>
                            <Table.Th>Actions</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {isLoading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <Table.Tr key={i}>
                                    {Array.from({ length: 8 }).map((_, j) => (
                                        <Table.Td key={j}><Skeleton height={18} radius="sm" /></Table.Td>
                                    ))}
                                </Table.Tr>
                            ))
                        ) : rows.length > 0 ? rows : (
                            <Table.Tr>
                                <Table.Td colSpan={7}>
                                    <Center py="xl">
                                        <Stack align="center" gap="xs">
                                            <IconBuildingBank size={36} color="lightgray" />
                                            <Text c="dimmed">No schools found{search ? ' matching your search' : ''}.</Text>
                                        </Stack>
                                    </Center>
                                </Table.Td>
                            </Table.Tr>
                        )}
                    </Table.Tbody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                    <Box p="md" style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
                        <Group justify="flex-end">
                            <Pagination value={page} onChange={setPage} total={totalPages} color="indigo" size="sm" />
                        </Group>
                    </Box>
                )}
            </Card>

            {/* Confirm Modal */}
            <Modal
                opened={!!confirmModal?.open}
                onClose={() => setConfirmModal(null)}
                title={
                    <Text fw={700} c={confirmModal?.newStatus === 'SUSPENDED' ? 'red' : 'green'}>
                        {confirmModal?.newStatus === 'SUSPENDED' ? 'Suspend School' : 'Reactivate School'}
                    </Text>
                }
                centered
                size="sm"
            >
                <Text size="sm" mb="xl">
                    Are you sure you want to <strong>{confirmModal?.newStatus === 'SUSPENDED' ? 'suspend' : 'reactivate'}</strong>{' '}
                    <strong>{confirmModal?.school?.name}</strong>?
                    {confirmModal?.newStatus === 'SUSPENDED' && (
                        <Text size="xs" c="red" mt="xs">This will restrict access for all users of this school.</Text>
                    )}
                </Text>
                <Group justify="flex-end">
                    <Button variant="default" onClick={() => setConfirmModal(null)}>Cancel</Button>
                    <Button
                        color={confirmModal?.newStatus === 'SUSPENDED' ? 'red' : 'green'}
                        loading={toggleStatus.isPending}
                        onClick={() => {
                            if (confirmModal?.school) {
                                toggleStatus.mutate({ id: confirmModal.school.id, status: confirmModal.newStatus });
                            }
                        }}
                    >
                        Confirm {confirmModal?.newStatus === 'SUSPENDED' ? 'Suspension' : 'Reactivation'}
                    </Button>
                </Group>
            </Modal>

            {/* Delete Modal */}
            <Modal
                opened={!!deleteModal?.open}
                onClose={() => setDeleteModal(null)}
                title={<Text fw={800} c="red">Permanently Delete School</Text>}
                centered
                size="sm"
            >
                <Text size="sm" mb="md" fw={500}>
                    Are you absolutely sure you want to delete <strong>{deleteModal?.school?.name}</strong>?
                </Text>
                
                <Text size="xs" c="red" mb="xl">
                    <strong>WARNING:</strong> This is a highly destructive action. It will instantly cascade and permanently delete all students, teachers, finances, attendance records, and history associated with this school. This cannot be undone.
                </Text>
                
                <Group justify="flex-end">
                    <Button variant="default" onClick={() => setDeleteModal(null)}>Cancel</Button>
                    <Button
                        color="red"
                        loading={deleteSchoolMutation.isPending}
                        onClick={() => {
                            if (deleteModal?.school) {
                                deleteSchoolMutation.mutate(deleteModal.school.id);
                            }
                        }}
                    >
                        Yes, Delete School
                    </Button>
                </Group>
            </Modal>
        </Box>
    );
}
