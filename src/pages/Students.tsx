import { useState } from 'react';
import {
    Box,
    Table,
    TextInput,
    Button,
    Avatar,
    Badge,
    Checkbox,
    Group,
    Text,
    ActionIcon,
    Menu,
    Pagination,
    Select,
    rem,
} from '@mantine/core';
import { Search, Filter, Plus, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';
import { useEffect } from 'react';
import AddStudentModal from '../components/AddStudentModal';
import { studentService } from '../services/studentService';
import { showErrorNotification, showSuccessNotification } from '../utils/notifications';


export default function Students() {
    const navigate = useNavigate();
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [addModalOpened, { open: openAddModal, close: closeAddModal }] = useDisclosure(false);
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch students on mount
    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const data = await studentService.getAll();
            setStudents(data || []);
        } catch (error: any) {
            showErrorNotification(error.message || 'Failed to fetch students');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (!query.trim()) {
            fetchStudents();
            return;
        }
        try {
            const data = await studentService.search(query);
            setStudents(data || []);
        } catch (error: any) {
            showErrorNotification(error.message || 'Search failed');
        }
    };

    const toggleRow = (id: string) => {
        setSelectedRows((prev) =>
            prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
        );
    };

    const toggleAll = () => {
        setSelectedRows((prev) =>
            prev.length === students.length ? [] : students.map((s) => s.id)
        );
    };

    return (
        <Box p="xl">
            {/* Header */}
            <Group justify="space-between" mb="lg">
                <TextInput
                    placeholder="Search..."
                    leftSection={<Search size={16} />}
                    style={{ width: rem(300) }}
                    size="sm"
                    radius={2}
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.currentTarget.value)}
                />
                <Group>
                    <Button
                        variant="outline"
                        leftSection={<Filter size={16} />}
                        size="sm"
                        radius={2}
                        color="gray"
                    >
                        Filter
                    </Button>
                    <Button
                        leftSection={<Plus size={16} />}
                        size="sm"
                        radius={2}
                        color="navy.9"
                        onClick={openAddModal}
                    >
                        Add Student
                    </Button>
                </Group>
            </Group>

            {/* Table */}
            <Box
                style={{
                    backgroundColor: 'white',
                    borderRadius: rem(4),
                    border: '1px solid var(--mantine-color-gray-2)',
                    overflow: 'hidden',
                }}
            >
                <Table highlightOnHover>
                    <Table.Thead>
                        <Table.Tr style={{ backgroundColor: '#f8f9fa' }}>
                            <Table.Th style={{ width: 40 }}>
                                <Checkbox
                                    checked={selectedRows.length === students.length && students.length > 0}
                                    indeterminate={
                                        selectedRows.length > 0 &&
                                        selectedRows.length < students.length
                                    }
                                    onChange={toggleAll}
                                />
                            </Table.Th>
                            <Table.Th style={{ width: 60 }}></Table.Th>
                            <Table.Th>ID No.</Table.Th>
                            <Table.Th>Full Name</Table.Th>
                            <Table.Th>Class</Table.Th>
                            <Table.Th>Parent Contact</Table.Th>
                            <Table.Th>Fee Balance</Table.Th>
                            <Table.Th>Status</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {loading ? (
                            <Table.Tr>
                                <Table.Td colSpan={8} style={{ textAlign: 'center', padding: rem(40) }}>
                                    <Text c="dimmed">Loading students...</Text>
                                </Table.Td>
                            </Table.Tr>
                        ) : students.length === 0 ? (
                            <Table.Tr>
                                <Table.Td colSpan={8} style={{ textAlign: 'center', padding: rem(40) }}>
                                    <Text c="dimmed">No students found</Text>
                                </Table.Td>
                            </Table.Tr>
                        ) : (
                            students.map((student) => (
                                <Table.Tr
                                    key={student.id}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => navigate(`/students/${student.id}`)}
                                >
                                    <Table.Td onClick={(e) => e.stopPropagation()}>
                                        <Checkbox
                                            checked={selectedRows.includes(student.id)}
                                            onChange={() => toggleRow(student.id)}
                                        />
                                    </Table.Td>
                                    <Table.Td>
                                        <Avatar size="sm" radius="xl" color="navy">
                                            {`${student.first_name?.[0] || ''}${student.last_name?.[0] || ''}`.toUpperCase()}
                                        </Avatar>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="sm">{student.student_id}</Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="sm" fw={500}>
                                            {`${student.first_name} ${student.last_name}`}
                                        </Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="sm">{student.class?.name || 'N/A'}</Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="sm">{student.contact_number || 'N/A'}</Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text
                                            size="sm"
                                            c="dimmed"
                                            fw={500}
                                        >
                                            -
                                        </Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Badge color="blue" variant="light" size="sm" radius={2}>
                                            {student.status}
                                        </Badge>
                                    </Table.Td>
                                </Table.Tr>
                            ))
                        )}
                    </Table.Tbody>
                </Table>

                {/* Pagination */}
                <Group justify="space-between" p="md" style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
                    <Group gap="xs">
                        <Pagination total={5} size="sm" radius={2} />
                    </Group>
                    <Group gap="xs">
                        <Text size="sm" c="dimmed">
                            Rows per page:
                        </Text>
                        <Select
                            data={['10', '25', '50', '100']}
                            defaultValue="10"
                            size="xs"
                            w={70}
                            radius={2}
                        />
                    </Group>
                </Group>
            </Box>

            {/* Modals */}
            <AddStudentModal
                opened={addModalOpened}
                onClose={closeAddModal}
                onSuccess={fetchStudents}
            />
        </Box>
    );
}
