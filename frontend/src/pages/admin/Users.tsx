import { Button, Avatar, Group, Text, ActionIcon, Menu, rem } from '@mantine/core';
import { IconPlus, IconDots, IconEdit, IconTrash } from '@tabler/icons-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, type Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useState } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    avatar: string;
}

const mockData: User[] = [
    { id: '1', name: 'John Admin', email: 'john@example.com', role: 'Administrator', status: 'Active', avatar: '' },
    { id: '2', name: 'Sarah Teacher', email: 'sarah@example.com', role: 'Teacher', status: 'Active', avatar: '' },
    { id: '3', name: 'Mike Temporary', email: 'mike@example.com', role: 'Guest', status: 'Inactive', avatar: '' },
];

const columns: Column<User>[] = [
    {
        accessor: 'name',
        header: 'User',
        render: (item) => (
            <Group gap="sm">
                <Avatar src={item.avatar} alt={item.name} radius="xl" size="sm" />
                <div>
                    <Text size="sm" fw={500}>{item.name}</Text>
                    <Text size="xs" c="dimmed">{item.email}</Text>
                </div>
            </Group>
        )
    },
    { accessor: 'role', header: 'Role' },
    {
        accessor: 'status',
        header: 'Status',
        render: (item) => <StatusBadge status={item.status} />
    },
    {
        accessor: 'actions',
        header: '',
        width: 50,
        render: () => (
            <Menu shadow="md" width={200}>
                <Menu.Target>
                    <ActionIcon variant="transparent" color="gray">
                        <IconDots style={{ width: rem(16), height: rem(16) }} />
                    </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                    <Menu.Item leftSection={<IconEdit style={{ width: rem(14), height: rem(14) }} />}>
                        Edit User
                    </Menu.Item>
                    <Menu.Item color="red" leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}>
                        Delete User
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
        )
    }
];

export default function Users() {
    const [search, setSearch] = useState('');

    const filteredData = mockData.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.email.toLowerCase().includes(search.toLowerCase()) ||
        item.role.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <PageHeader
                title="User Management"
                subtitle="Manage system access and roles"
                actions={<Button leftSection={<IconPlus size={16} />}>Add User</Button>}
            />
            <DataTable
                data={filteredData}
                columns={columns}
                search={search}
                onSearchChange={setSearch}
                pagination={{ total: 1, page: 1, onChange: () => { } }}
            />
        </>
    );
}
