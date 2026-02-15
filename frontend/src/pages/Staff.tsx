import { useState } from 'react';
import {
    Box,
    Table,
    Button,
    Group,
    Text,
    TextInput,
    Badge,
    Avatar,
    Checkbox,
    Tabs,
    ActionIcon,
    Menu,
    Pagination,
    Select,
    rem,
} from '@mantine/core';
import { Search, Filter, MoreVertical, Plus } from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { useEffect } from 'react';
import AddStaffModal from '../components/AddStaffModal';
import { staffService } from '../services/staffService';
import { showErrorNotification } from '../utils/notifications';



export default function Staff() {
    const [selectedRole, setSelectedRole] = useState('All');
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [addModalOpened, { open: openAddModal, close: closeAddModal }] = useDisclosure(false);
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const data = await staffService.getAll();
            setStaff(data || []);
        } catch (error: any) {
            showErrorNotification(error.message || 'Failed to fetch staff');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (!query.trim()) {
            fetchStaff();
            return;
        }
        try {
            const data = await staffService.search(query);
            setStaff(data || []);
        } catch (error: any) {
            showErrorNotification(error.message || 'Search failed');
        }
    };

    const filteredStaff = selectedRole === 'All'
        ? staff
        : staff.filter(s => s.role === selectedRole.toLowerCase().replace(' ', '_'));

    const toggleRow = (id: string) => {
        setSelectedRows((prev) =>
            prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
        );
    };

    const toggleAll = () => {
        setSelectedRows((prev) =>
            prev.length === filteredStaff.length ? [] : filteredStaff.map((s) => s.id)
        );
    };

    return (
        <Box p={{ base: 'sm', md: 'xl' }}>
            {/* Header */}
            <Group justify="space-between" mb="lg" wrap="wrap">
                <TextInput
                    placeholder="Search staff, ID..."
                    leftSection={<Search size={16} />}
                    style={{ width: '100%', maxWidth: rem(300) }}
                    size="sm"
                    radius={2}
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.currentTarget.value)}
                />
                <Group>
                    <Button
                        leftSection={<Plus size={16} />}
                        size="sm"
                        radius={2}
                        color="navy.9"
                        onClick={openAddModal}
                    >
                        Add Staff
                    </Button>
                    <Button
                        size="sm"
                        radius={2}
                        color="blue"
                    >
                        Run Monthly Payroll
                    </Button>
                </Group>
            </Group>

            {/* Role Filter Tabs */}
            <Tabs value={selectedRole} onChange={(value) => setSelectedRole(value || 'All')} mb="md">
                <Tabs.List>
                    <Tabs.Tab value="All">All</Tabs.Tab>
                    <Tabs.Tab value="Teacher">Teacher</Tabs.Tab>
                    <Tabs.Tab value="Admin">Admin</Tabs.Tab>
                    <Tabs.Tab value="Support">Support</Tabs.Tab>
                </Tabs.List>
            </Tabs>

            {/* Table */}
            <Box
                style={{
                    backgroundColor: 'white',
                    borderRadius: rem(4),
                    border: '1px solid var(--mantine-color-gray-2)',
                    overflow: 'auto',
                }}
            >
                <Table highlightOnHover>
                    <Table.Thead>
                        <Table.Tr style={{ backgroundColor: '#f8f9fa' }}>
                            <Table.Th style={{ width: 40 }}>
                                <Checkbox
                                    checked={selectedRows.length === filteredStaff.length && filteredStaff.length > 0}
                                    indeterminate={
                                        selectedRows.length > 0 &&
                                        selectedRows.length < filteredStaff.length
                                    }
                                    onChange={toggleAll}
                                />
                            </Table.Th>
                            <Table.Th style={{ width: 60 }}></Table.Th>
                            <Table.Th>Employee ID</Table.Th>
                            <Table.Th>Full Name</Table.Th>
                            <Table.Th>Role</Table.Th>
                            <Table.Th>Contact Number</Table.Th>
                            <Table.Th>Basic Salary</Table.Th>
                            <Table.Th>Last Paid Status</Table.Th>
                            <Table.Th>Actions</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {loading ? (
                            <Table.Tr>
                                <Table.Td colSpan={9} style={{ textAlign: 'center', padding: rem(40) }}>
                                    <Text c="dimmed">Loading staff...</Text>
                                </Table.Td>
                            </Table.Tr>
                        ) : staff.length === 0 ? (
                            <Table.Tr>
                                <Table.Td colSpan={9} style={{ textAlign: 'center', padding: rem(40) }}>
                                    <Text c="dimmed">No staff members found</Text>
                                </Table.Td>
                            </Table.Tr>
                        ) : (
                            staff.map((member) => (
                                <Table.Tr key={member.id}>
                                    <Table.Td>
                                        <Checkbox
                                            checked={selectedRows.includes(member.id)}
                                            onChange={() => toggleRow(member.id)}
                                        />
                                    </Table.Td>
                                    <Table.Td>
                                        <Avatar size="sm" radius="xl" color="navy">
                                            {member.profile?.full_name?.substring(0, 2).toUpperCase() || 'ST'}
                                        </Avatar>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="sm">{member.employee_id}</Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="sm" fw={500}>
                                            {member.profile?.full_name || 'N/A'}
                                        </Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="sm">{member.role}</Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="sm">{member.profile?.phone || '-'}</Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="sm">${member.salary?.toLocaleString() || '0'}</Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Badge color="green" variant="light" size="sm" radius={2}>
                                            Active
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td>
                                        <ActionIcon variant="subtle" color="gray" size="sm">
                                            <MoreVertical size={16} />
                                        </ActionIcon>
                                    </Table.Td>
                                </Table.Tr>
                            ))
                        )}
                    </Table.Tbody>
                </Table>

                {/* Pagination */}
                <Group justify="space-between" p="md" style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }} wrap="wrap">
                    <Pagination total={5} size="sm" radius={2} />
                    <Group gap="xs">
                        <Text size="sm" c="dimmed">
                            Rows per page:
                        </Text>
                        <Select
                            data={['10', '25', '50']}
                            defaultValue="10"
                            size="xs"
                            w={70}
                            radius={2}
                        />
                    </Group>
                </Group>
            </Box>

            <AddStaffModal
                opened={addModalOpened}
                onClose={closeAddModal}
                onSuccess={fetchStaff}
            />
        </Box>
    );
}
