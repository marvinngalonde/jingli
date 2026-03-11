import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Button,
    Group,
    Avatar,
    Text,
    Select,
    Drawer,
    Box,
    Tabs,
    SimpleGrid,
    Paper,
    Stack,
    Modal,
    TextInput,
    Loader,
    Center,
    ActionIcon
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    IconPlus,
    IconFilter,
    IconUsers,
    IconClock,
    IconDoorExit,
    IconPrinter,
    IconDownload
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { StudentForm } from '../../components/students/StudentForm';
import { studentService } from '../../services/studentService';
import { logisticsService } from '../../services/logisticsService';
import { exportToCsv, exportToPdf } from '../../utils/exportUtils';
import type { GatePass, LateArrival } from '../../services/logisticsService';
import type { Student } from '../../types/students';

// Common Components
import { PageHeader } from '../../components/common/PageHeader';
import { LateArrivalModal } from '../../components/students/LateArrivalModal';
import { GatePassModal } from '../../components/students/GatePassModal';
import { DataTable, type Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ActionMenu } from '../../components/common/ActionMenu';
import { useForm } from '@mantine/form';
import { useAuth } from '../../context/AuthContext';

export default function Students() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<string | null>('list');
    const [filteredData, setFilteredData] = useState<Student[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [opened, { open, close }] = useDisclosure(false);
    const [lateOpened, { open: openLate, close: closeLate }] = useDisclosure(false);
    const [passOpened, { open: openPass, close: closePass }] = useDisclosure(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
    const queryClient = useQueryClient();

    const lateForm = useForm({
        initialValues: { studentId: '', reason: '', reportedBy: user?.firstName || '' },
        validate: { studentId: (v) => (!v ? 'Student is required' : null), reason: (v) => (!v ? 'Reason is required' : null) }
    });

    const passForm = useForm({
        initialValues: { studentId: '', reason: '', guardianName: '' },
        validate: { studentId: (v) => (!v ? 'Student is required' : null), reason: (v) => (!v ? 'Reason is required' : null) }
    });

    const { data: studentsData, isLoading: studentsLoading } = useQuery({
        queryKey: ['students'],
        queryFn: () => studentService.getAll()
    });
    const students = studentsData?.data || [];

    const { data: lateArrivals = [], isLoading: lateLoading } = useQuery({
        queryKey: ['lateArrivals'],
        queryFn: () => logisticsService.getLateArrivals()
    });

    const { data: gatePasses = [], isLoading: passesLoading } = useQuery({
        queryKey: ['gatePasses'],
        queryFn: () => logisticsService.getGatePasses()
    });
    const loading = studentsLoading || lateLoading || passesLoading;


    // Filter logic for Student List
    useEffect(() => {
        let result = students;
        if (search) {
            const lowerSearch = search.toLowerCase();
            result = result.filter(item =>
                item.firstName.toLowerCase().includes(lowerSearch) ||
                item.lastName.toLowerCase().includes(lowerSearch) ||
                item.admissionNo.toLowerCase().includes(lowerSearch) ||
                item.user?.email?.toLowerCase().includes(lowerSearch)
            );
        }
        if (statusFilter) {
            result = result.filter(item => item.status === statusFilter);
        }
        setFilteredData(result);
    }, [students, search, statusFilter]);

    const createMutation = useMutation({
        mutationFn: studentService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            notifications.show({ message: 'Student created successfully', color: 'green' });
            closeDrawer();
        },
        onError: () => notifications.show({ title: 'Error', message: 'Failed to create student', color: 'red' })
    });

    const updateMutation = useMutation({
        mutationFn: (values: any) => studentService.update(selectedStudent!.id, values),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            notifications.show({ message: 'Student updated successfully', color: 'green' });
            closeDrawer();
        },
        onError: () => notifications.show({ title: 'Error', message: 'Failed to update student', color: 'red' })
    });

    const deleteMutation = useMutation({
        mutationFn: studentService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            notifications.show({ message: 'Student deleted successfully', color: 'green' });
            setStudentToDelete(null);
        },
        onError: () => notifications.show({ title: 'Error', message: 'Failed to delete student', color: 'red' })
    });

    const lateMutation = useMutation({
        mutationFn: logisticsService.logLateArrival,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lateArrivals'] });
            notifications.show({ title: 'Success', message: 'Late arrival recorded', color: 'green' });
            lateForm.reset();
            closeLate();
        },
        onError: () => notifications.show({ title: 'Error', message: 'Failed to record arrival', color: 'red' })
    });

    const passMutation = useMutation({
        mutationFn: logisticsService.issueGatePass,
        onSuccess: (pass: any) => {
            queryClient.invalidateQueries({ queryKey: ['gatePasses'] });
            notifications.show({ title: 'Success', message: 'Gate pass issued', color: 'green' });
            passForm.reset();
            closePass();
            alert(`Printing Gate Pass\nStudent: ${pass.student.firstName} ${pass.student.lastName}\nTime Out: ${new Date(pass.issuedAt).toLocaleTimeString()}\nReason: ${pass.reason}`);
        },
        onError: () => notifications.show({ title: 'Error', message: 'Failed to issue pass', color: 'red' })
    });
    const handleCreate = (values: any) => createMutation.mutate(values);
    const handleUpdate = (values: any) => updateMutation.mutate(values);
    const confirmDelete = () => { if (studentToDelete) deleteMutation.mutate(studentToDelete.id); };
    const handleLogLate = (values: typeof lateForm.values) => lateMutation.mutate(values);
    const handleIssuePass = (values: typeof passForm.values) => passMutation.mutate(values);
    const handleDeleteClick = (student: Student) => setStudentToDelete(student);
    const submitting = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending || lateMutation.isPending || passMutation.isPending;



    const openEditDrawer = (student: Student) => {
        setSelectedStudent(student);
        open();
    };

    const closeDrawer = () => {
        setSelectedStudent(null);
        close();
    };

    // Stats calculation
    const today = new Date().toDateString();
    const stats = [
        { title: 'Total Students', value: studentsData?.total || students.length, icon: IconUsers, color: 'blue' },
        { title: 'Late Today', value: lateArrivals.filter(l => new Date(l.arrivalTime).toDateString() === today).length, icon: IconClock, color: 'orange' },
        { title: 'Gate Passes Issued', value: gatePasses.filter(p => new Date(p.issuedAt).toDateString() === today).length, icon: IconDoorExit, color: 'teal' },
    ];

    const studentColumns: Column<Student>[] = [
        {
            accessor: 'name',
            header: 'Student',
            render: (item) => (
                <Group gap="sm">
                    <Avatar size={40} src={item.photoUrl} radius={40} color="brand" alt={item.firstName}>
                        {item.firstName[0]}{item.lastName[0]}
                    </Avatar>
                    <div>
                        <Text size="sm" fw={500}>{item.firstName} {item.lastName}</Text>
                        <Text size="xs" c="dimmed">{item.admissionNo}</Text>
                    </div>
                </Group>
            )
        },
        {
            accessor: 'class',
            header: 'Class/Grade',
            render: (item) => <Text size="sm">{item.section ? `${item.section.classLevel?.name || ''} ${item.section.classLevel?.level ?? ''} ${item.section.name || ''}`.trim() : 'Unassigned'}</Text>
        },
        {
            accessor: 'status',
            header: 'Status',
            render: (item) => <StatusBadge status={item.status || 'active'} />
        },
        {
            accessor: 'parents',
            header: 'Parent/s',
            render: (item) => {
                const parents = item.guardians?.map((g: any) => `${g.guardian.firstName} ${g.guardian.lastName}`);
                if (!parents || parents.length === 0) return <Text size="sm" c="dimmed">None</Text>;
                return (
                    <Text size="sm">
                        {parents.join(', ')}
                    </Text>
                );
            }
        },
        {
            accessor: 'actions',
            header: '',
            render: (item) => (
                <Group justify="flex-end">
                    <ActionMenu
                        onView={() => navigate(`/students/${item.id}`)}
                        onEdit={() => openEditDrawer(item)}
                        onDelete={() => handleDeleteClick(item)}
                    />
                </Group>
            )
        }
    ];

    // Export Helpers
    const handleExportStudents = () => {
        const exportData = filteredData.map(s => ({
            'ID': s.admissionNo,
            'First Name': s.firstName,
            'Last Name': s.lastName,
            'Email': s.user?.email || 'N/A',
            'Gender': s.gender,
            'DOB': s.dob ? new Date(s.dob).toLocaleDateString() : 'N/A',
            'Status': s.status,
            'Class/Grade': s.section ? `${s.section.classLevel?.name || ''} ${s.section.classLevel?.level ?? ''} ${s.section.name || ''}`.trim() : 'Unassigned',
            'Enrolled': new Date(s.enrollmentDate).toLocaleDateString()
        }));
        exportToCsv(exportData, 'Jingli_Student_Directory');
        notifications.show({ title: 'Success', message: 'Student directory exported', color: 'green' });
    };

    const handleExportLate = () => {
        const exportData = lateArrivals.map(l => ({
            'Student': `${l.student.firstName} ${l.student.lastName}`,
            'Admission No': l.student.admissionNo,
            'Date/Time': new Date(l.arrivalTime).toLocaleString(),
            'Reason': l.reason,
            'Reported By': l.reportedBy
        }));
        exportToCsv(exportData, 'Jingli_Late_Arrivals');
        notifications.show({ title: 'Success', message: 'Late arrivals exported', color: 'green' });
    };

    const handleExportPasses = () => {
        const exportData = gatePasses.map(p => ({
            'Student': `${p.student.firstName} ${p.student.lastName}`,
            'Admission No': p.student.admissionNo,
            'Issued At': new Date(p.issuedAt).toLocaleString(),
            'Reason': p.reason,
            'Guardian/Escort': p.guardianName
        }));
        exportToCsv(exportData, 'Jingli_Gate_Passes');
        notifications.show({ title: 'Success', message: 'Gate passes exported', color: 'green' });
    };

    const handleExportStudentsPdf = async () => {
        try {
            await exportToPdf('/students/export/pdf', 'Jingli_Student_Directory');
            notifications.show({ title: 'Success', message: 'Student PDF downloaded', color: 'green' });
        } catch {
            notifications.show({ title: 'Error', message: 'Failed to export PDF', color: 'red' });
        }
    };

    return (
        <>
            <PageHeader
                title="Students"
                subtitle="Manage student directory and daily logistics"
                actions={
                    <>
                        <Button variant="light" leftSection={<IconDownload size={18} />} onClick={handleExportStudents}>
                            Export CSV
                        </Button>
                        <Button variant="light" color="red" leftSection={<IconDownload size={18} />} onClick={handleExportStudentsPdf}>
                            Export PDF
                        </Button>
                        <Button leftSection={<IconPlus size={18} />} onClick={open}>
                            Add Student
                        </Button>
                    </>
                }
            />

            <SimpleGrid cols={{ base: 1, sm: 3 }} mb="xl">
                {stats.map((stat) => (
                    <Paper key={stat.title} withBorder p="md" radius="md">
                        <Group justify="space-between">
                            <div>
                                <Text size="xs" c="dimmed" fw={700} tt="uppercase">{stat.title}</Text>
                                <Text fw={700} size="xl">{stat.value}</Text>
                            </div>
                            <stat.icon size={32} stroke={1.5} color={`var(--mantine-color-${stat.color}-6)`} />
                        </Group>
                    </Paper>
                ))}
            </SimpleGrid>

            {loading ? (
                <Center p="xl"><Loader /></Center>
            ) : (
                <Tabs value={activeTab} onChange={setActiveTab} radius="md">
                    <Tabs.List mb="md">
                        <Tabs.Tab value="list" leftSection={<IconUsers size={16} />}>Student Directory</Tabs.Tab>
                        <Tabs.Tab value="late" leftSection={<IconClock size={16} />}>Late Arrivals</Tabs.Tab>
                        <Tabs.Tab value="gatepass" leftSection={<IconDoorExit size={16} />}>Gate Passes</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="list">
                        <DataTable
                            data={filteredData}
                            columns={studentColumns}
                            search={search}
                            onSearchChange={setSearch}
                            filterSlot={
                                <Select
                                    placeholder="Status"
                                    data={['ACTIVE', 'INACTIVE', 'SUSPENDED', 'GRADUATED']}
                                    value={statusFilter}
                                    onChange={setStatusFilter}
                                    clearable
                                    leftSection={<IconFilter size={16} stroke={1.5} />}
                                    w={150}
                                />
                            }
                        />
                    </Tabs.Panel>

                    <Tabs.Panel value="late">
                        <Group justify="space-between" mb="md">
                            <Text size="sm" c="dimmed">Detailed log of student late entry.</Text>
                            <Group>
                                <Button variant="light" size="xs" leftSection={<IconDownload size={14} />} onClick={handleExportLate}>Export</Button>
                                <Button size="xs" leftSection={<IconPlus size={14} />} onClick={openLate}>Log Late</Button>
                            </Group>
                        </Group>
                        <DataTable
                            data={lateArrivals}
                            columns={[
                                {
                                    accessor: 'student',
                                    header: 'Student',
                                    render: (item) => `${item.student.firstName} ${item.student.lastName} (${item.student.admissionNo})`
                                },
                                {
                                    accessor: 'arrivalTime',
                                    header: 'Time',
                                    render: (item) => new Date(item.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                },
                                { accessor: 'reason', header: 'Reason' },
                                { accessor: 'reportedBy', header: 'By' },
                            ]}
                        />
                    </Tabs.Panel>

                    <Tabs.Panel value="gatepass">
                        <Group justify="space-between" mb="md">
                            <Text size="sm" c="dimmed">History of issued early exit passes.</Text>
                            <Group>
                                <Button variant="light" size="xs" leftSection={<IconDownload size={14} />} onClick={handleExportPasses}>Export</Button>
                                <Button size="xs" leftSection={<IconPlus size={14} />} onClick={openPass}>Issue Pass</Button>
                            </Group>
                        </Group>
                        <DataTable
                            data={gatePasses}
                            columns={[
                                {
                                    accessor: 'student',
                                    header: 'Student',
                                    render: (item) => `${item.student.firstName} ${item.student.lastName} (${item.student.admissionNo})`
                                },
                                {
                                    accessor: 'issuedAt',
                                    header: 'Time Out',
                                    render: (item) => new Date(item.issuedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                },
                                { accessor: 'reason', header: 'Reason' },
                                { accessor: 'guardianName', header: 'Guardian/Escort' },
                                {
                                    accessor: 'actions',
                                    header: '',
                                    render: () => (
                                        <ActionIcon variant="subtle" color="blue" onClick={() => alert('Printing Pass...')}>
                                            <IconPrinter size={16} />
                                        </ActionIcon>
                                    )
                                }
                            ]}
                        />
                    </Tabs.Panel>
                </Tabs>
            )}

            {/* Drawers & Modals */}
            <Drawer
                opened={opened}
                onClose={closeDrawer}
                title={<Text fw={600} size="lg">{selectedStudent ? 'Edit Student' : 'Add New Student'}</Text>}
                position="right"
                size="md"
            >
                <Box p={0}>
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

            <Modal
                opened={!!studentToDelete}
                onClose={() => setStudentToDelete(null)}
                title={<Text fw={600} size="lg">Confirm Deletion</Text>}
                centered
            >
                <Text size="sm" mb="lg">
                    Are you sure you want to delete <strong>{studentToDelete?.firstName} {studentToDelete?.lastName}</strong>? This action cannot be undone and will remove all their associated data (attendance, grades, etc.).
                </Text>
                <Group justify="flex-end">
                    <Button variant="subtle" color="gray" onClick={() => setStudentToDelete(null)}>Cancel</Button>
                    <Button color="red" onClick={confirmDelete}>Delete Student</Button>
                </Group>
            </Modal>

            <LateArrivalModal
                opened={lateOpened}
                onClose={closeLate}
                form={lateForm}
                onSubmit={handleLogLate}
                studentOptions={students.map(s => ({ value: s.id, label: `${s.firstName} ${s.lastName} (${s.admissionNo})` }))}
                submitting={submitting}
            />

            <GatePassModal
                opened={passOpened}
                onClose={closePass}
                form={passForm}
                onSubmit={handleIssuePass}
                studentOptions={students.map(s => ({ value: s.id, label: `${s.firstName} ${s.lastName} (${s.admissionNo})` }))}
                submitting={submitting}
            />
        </>
    );
}
