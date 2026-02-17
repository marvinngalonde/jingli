import { useState, useEffect } from 'react';
import {
    Button,
    Group,
    Avatar,
    Text,
    Select,
    rem,
    Drawer,
    Box,
    Badge
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    IconPlus,
    IconFilter,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { StudentForm } from '../components/students/StudentForm';
import { studentService } from '../services/studentService';
import type { Student } from '../types/students';

// Common Components
import { PageHeader } from '../components/common/PageHeader';
import { DataTable, type Column } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { ActionMenu } from '../components/common/ActionMenu';

export default function Students() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<Student[]>([]);
    const [filteredData, setFilteredData] = useState<Student[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [opened, { open, close }] = useDisclosure(false);

    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    useEffect(() => {
        loadStudents();
    }, []);

    // Filter logic
    useEffect(() => {
        let result = data;

        if (search) {
            const lowerSearch = search.toLowerCase();
            result = result.filter(item =>
                item.firstName.toLowerCase().includes(lowerSearch) ||
                item.lastName.toLowerCase().includes(lowerSearch) ||
                item.admissionNo.toLowerCase().includes(lowerSearch) ||
                item.user?.email.toLowerCase().includes(lowerSearch)
            );
        }

        if (statusFilter) {
            result = result.filter(item => item.status === statusFilter);
        }

        setFilteredData(result);
    }, [data, search, statusFilter]);


    const loadStudents = async () => {
        setLoading(true);
        try {
            const students = await studentService.getAll();
            setData(students);
            setFilteredData(students);
        } catch (error) {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to load students', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (values: any) => {
        setLoading(true);
        try {
            await studentService.create(values);
            notifications.show({ message: 'Student created successfully', color: 'green' });
            closeDrawer();
            loadStudents();
        } catch (error) {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to create student', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (values: any) => {
        if (!selectedStudent) return;
        setLoading(true);
        try {
            await studentService.update(selectedStudent.id, values);
            notifications.show({ message: 'Student updated successfully', color: 'green' });
            closeDrawer();
            loadStudents();
        } catch (error) {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to update student', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this student?')) return;

        try {
            await studentService.delete(id);
            notifications.show({ message: 'Student deleted successfully', color: 'green' });
            loadStudents();
        } catch (error) {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to delete student', color: 'red' });
        }
    }

    const openEditDrawer = (student: Student) => {
        setSelectedStudent(student);
        open();
    };

    const closeDrawer = () => {
        setSelectedStudent(null);
        close();
    };

    const columns: Column<Student>[] = [
        {
            accessor: 'name',
            header: 'Student',
            render: (item) => (
                <Group gap="sm">
                    <Avatar size={40} src={item.photoUrl} radius={40} color="brand" alt={item.firstName}>
                        {item.firstName[0]}{item.lastName[0]}
                    </Avatar>
                    <div>
                        <Text size="sm" fw={500}>
                            {item.firstName} {item.lastName}
                        </Text>
                        <Text size="xs" c="dimmed">
                            {item.admissionNo}
                        </Text>
                    </div>
                </Group>
            )
        },
        {
            accessor: 'class',
            header: 'Class/Grade',
            render: (item) => <Text size="sm">{item.section?.classLevel?.name || ''} - {item.section?.name || 'Unassigned'}</Text>
        },
        {
            accessor: 'feesStatus',
            header: 'Fees Status',
            render: (item) => {
                // Mock fees status based on admission number or random logic for now
                const statuses = ['PAID', 'PENDING', 'OVERDUE', 'PAID', 'PAID'];
                const status = statuses[item.admissionNo.length % statuses.length];
                const color = status === 'PAID' ? 'green' : status === 'PENDING' ? 'yellow' : 'red';

                return <Badge color={color} variant="light">{status}</Badge>;
            }
        },
        {
            accessor: 'status',
            header: 'Status',
            render: (item) => <StatusBadge status={item.status || 'active'} />
        },
        {
            accessor: 'actions',
            header: '',
            render: (item) => (
                <Group justify="flex-end">
                    <ActionMenu
                        onView={() => navigate(`/students/${item.id}`)}
                        onEdit={() => openEditDrawer(item)}
                        onDelete={() => handleDelete(item.id)}
                    />
                </Group>
            )
        }
    ];

    return (
        <>
            <PageHeader
                title="Students"
                subtitle="Manage your student directory"
                actions={
                    <Button leftSection={<IconPlus size={18} />} onClick={open}>
                        Add Student
                    </Button>
                }
            />

            <DataTable
                data={filteredData}
                columns={columns}
                loading={loading}
                search={search}
                onSearchChange={setSearch}
                pagination={{
                    total: Math.ceil(filteredData.length / 10),
                    page: 1,
                    onChange: () => { }
                }}
                filterSlot={
                    <Select
                        placeholder="Status"
                        data={['ACTIVE', 'INACTIVE', 'SUSPENDED', 'GRADUATED']}
                        value={statusFilter}
                        onChange={setStatusFilter}
                        clearable
                        leftSection={<IconFilter style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                        w={150}
                    />
                }
                onExport={() => notifications.show({ message: 'Exporting...' })}
            />

            <Drawer opened={opened} onClose={closeDrawer} title={selectedStudent ? "Edit Student" : "Add New Student"} position="right" size="md">
                <Box p={0}>
                    {/* Re-render form when selectedStudent changes to ensure initialValues update */}
                    <StudentForm
                        key={selectedStudent ? selectedStudent.id : 'new'}
                        initialValues={selectedStudent ? {
                            firstName: selectedStudent.firstName,
                            lastName: selectedStudent.lastName,
                            email: selectedStudent.user?.email || '',
                            dob: selectedStudent.dob ? new Date(selectedStudent.dob) : undefined,
                            gender: selectedStudent.gender,
                            address: selectedStudent.address || '',
                            sectionId: selectedStudent.sectionId,
                            admissionNo: selectedStudent.admissionNo,
                            rollNo: selectedStudent.rollNo || '',
                            enrollmentDate: new Date(selectedStudent.enrollmentDate)
                        } : undefined}
                        onSubmit={selectedStudent ? handleUpdate : handleCreate}
                        onCancel={closeDrawer}
                        loading={loading}
                        isEditing={!!selectedStudent}
                    />
                </Box>
            </Drawer>
        </>
    );
}
