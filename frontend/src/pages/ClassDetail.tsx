import { useState } from 'react';
import {
    Text,
    Grid,
    Paper,
    Group,
    Tabs,
    Button,
    Box,
    ThemeIcon,
    Modal,
    TextInput,
    Textarea,
    NumberInput,
    Badge,
    ActionIcon
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { DatePickerInput } from '@mantine/dates';
import {
    IconArrowLeft,
    IconUsers,
    IconCalendar,
    IconSchool,
    IconChalkboard,
    IconBook,
    IconPlus,
    IconPencil,
    IconTrash
} from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';

// Common Components
import { PageHeader } from '../components/common/PageHeader';
import { DataTable } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';

// Sub-components
import { TimetableView } from '../components/classes/TimetableView';
import { SubjectTeacherList } from '../components/classes/SubjectTeacherList';

export default function ClassDetail() {
    const navigate = useNavigate();
    const { id } = useParams();
    // Silencing unused var warning by using it in a console log or just ignoring
    console.log("Class ID:", id);

    const [activeTab, setActiveTab] = useState<string | null>('assignments'); // Default to assignments for visibility

    // ... prior state
    const [assignmentsTabOpened, { open: openAssignmentModal, close: closeAssignmentModal }] = useDisclosure(false);
    const [gradingModalOpened, { open: openGradingModal, close: closeGradingModal }] = useDisclosure(false);
    const [resourceModalOpened, { open: openResourceModal, close: closeResourceModal }] = useDisclosure(false);
    const [remarkModalOpened, { open: openRemarkModal, close: closeRemarkModal }] = useDisclosure(false);

    const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
    const [selectedStudentForRemark, setSelectedStudentForRemark] = useState<any>(null);

    // Mock Class Info
    const classInfo = {
        name: 'Grade 10-A',
        teacher: 'Sarah Connor',
        room: '101',
        studentCount: 28,
        academicYear: '2023-2024'
    };

    // Mock Student List
    const students = [
        { id: '1', name: 'John Doe', rollNo: '1001', status: 'Active' },
        { id: '2', name: 'Jane Smith', rollNo: '1002', status: 'Active' },
        { id: '3', name: 'Bob Brown', rollNo: '1003', status: 'Active' },
        { id: '4', name: 'Alice White', rollNo: '1004', status: 'Absent' },
    ];

    const studentColumns = [
        { accessor: 'rollNo', header: 'Roll No.' },
        { accessor: 'name', header: 'Student Name' },
        {
            accessor: 'status',
            header: 'Status',
            render: (item: any) => <StatusBadge status={item.status} />
        }
    ];

    // Mock Assignments
    const [assignments] = useState([
        { id: '1', title: 'Algebra Quiz', dueDate: '2024-03-20', status: 'Active', submissions: 25, total: 28 },
        { id: '2', title: 'Essay: Romeo & Juliet', dueDate: '2024-03-25', status: 'Draft', submissions: 0, total: 28 },
    ]);

    // Mock Resources
    const [resources] = useState([
        { id: '1', title: 'Lecture 1: Intro to Algebra', type: 'PDF', date: '2024-03-01', size: '2.5 MB' },
        { id: '2', title: 'Calculus cheatsheet', type: 'Image', date: '2024-03-05', size: '1.2 MB' },
    ]);

    // Mock Syllabus
    const [syllabus] = useState([
        { id: '1', topic: 'Algebra: Linear Equations', status: 'Completed', date: '2024-02-15' },
        { id: '2', topic: 'Algebra: Quadratic Functions', status: 'In Progress', date: '2024-03-10' },
        { id: '3', topic: 'Geometry: Triangles', status: 'Pending', date: '-' },
    ]);

    const handleCreateAssignment = () => { closeAssignmentModal(); };
    const handleUploadResource = () => { closeResourceModal(); };
    const handleSaveRemark = () => { closeRemarkModal(); };

    const AssignmentsTab = () => (
        <>
            <Group justify="space-between" mb="md">
                <Text size="sm" c="dimmed">Manage class assignments and homework.</Text>
                <Button leftSection={<IconPlus size={16} />} onClick={openAssignmentModal}>Create Assignment</Button>
            </Group>

            <DataTable
                data={assignments}
                columns={[
                    { accessor: 'title', header: 'Title', render: (item) => <Text fw={500}>{item.title}</Text> },
                    { accessor: 'dueDate', header: 'Due Date' },
                    {
                        accessor: 'status',
                        header: 'Status',
                        render: (item) => <Badge color={item.status === 'Active' ? 'green' : 'gray'}>{item.status}</Badge>
                    },
                    {
                        accessor: 'submissions',
                        header: 'Submissions/Graded',
                        render: (item) => <Text size="sm">{item.submissions} / {item.total}</Text>
                    },
                    {
                        accessor: 'actions',
                        header: 'Actions',
                        render: (item) => (
                            <Group gap="xs">
                                <Button size="compact-xs" variant="light" onClick={() => { setSelectedAssignment(item); openGradingModal(); }}>Grade</Button>
                                <ActionIcon variant="subtle" color="blue" size="sm"><IconPencil size={14} /></ActionIcon>
                                <ActionIcon variant="subtle" color="red" size="sm"><IconTrash size={14} /></ActionIcon>
                            </Group>
                        )
                    }
                ]}
                pagination={{ total: 1, page: 1, onChange: () => { } }}
            />
        </>
    );

    const ResourcesTab = () => (
        <>
            <Group justify="space-between" mb="md">
                <Text size="sm" c="dimmed">Upload study materials, notes, and handouts for students.</Text>
                <Button leftSection={<IconPlus size={16} />} onClick={openResourceModal}>Upload Resource</Button>
            </Group>
            <DataTable
                data={resources}
                columns={[
                    { accessor: 'title', header: 'File Name', render: (item) => <Text fw={500}>{item.title}</Text> },
                    { accessor: 'type', header: 'Type', render: (item) => <Badge variant="outline">{item.type}</Badge> },
                    { accessor: 'date', header: 'Uploaded Date' },
                    { accessor: 'size', header: 'Size' },
                    {
                        accessor: 'actions',
                        header: 'Actions',
                        render: (item) => (
                            <Group gap="xs">
                                <ActionIcon variant="subtle" color="blue" size="sm"><IconPencil size={14} /></ActionIcon>
                                <ActionIcon variant="subtle" color="red" size="sm"><IconTrash size={14} /></ActionIcon>
                            </Group>
                        )
                    }
                ]}
                pagination={{ total: 1, page: 1, onChange: () => { } }}
            />
        </>
    );

    const SyllabusTab = () => (
        <>
            <Group justify="space-between" mb="md">
                <Text size="sm" c="dimmed">Track syllabus coverage and lesson progress.</Text>
                <Button leftSection={<IconPlus size={16} />}>Add Topic</Button>
            </Group>
            <DataTable
                data={syllabus}
                columns={[
                    { accessor: 'topic', header: 'Topic/Chapter', render: (item) => <Text fw={500}>{item.topic}</Text> },
                    {
                        accessor: 'status',
                        header: 'Status',
                        render: (item) => (
                            <Badge color={item.status === 'Completed' ? 'green' : item.status === 'In Progress' ? 'blue' : 'gray'}>
                                {item.status}
                            </Badge>
                        )
                    },
                    { accessor: 'date', header: 'Completion Date' },
                    {
                        accessor: 'actions',
                        header: 'Actions',
                        render: (item) => <Button size="compact-xs" variant="light">Update Status</Button>
                    }
                ]}
                pagination={{ total: 1, page: 1, onChange: () => { } }}
            />
        </>
    );

    return (
        <Box p="md">
            <Button variant="subtle" color="gray" leftSection={<IconArrowLeft size={16} />} mb="md" onClick={() => navigate('/classes')}>
                Back to Classes
            </Button>

            <PageHeader
                title={classInfo.name}
                subtitle={`Class Teacher: ${classInfo.teacher}`}
                actions={<Button variant="light">Edit Class Settings</Button>}
            />

            <Grid mb="lg">
                <Grid.Col span={4}>
                    <Paper withBorder p="md" radius="md">
                        <Group>
                            <ThemeIcon size="lg" radius="md" variant="light" color="blue">
                                <IconUsers size={20} />
                            </ThemeIcon>
                            <div>
                                <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Students</Text>
                                <Text fw={700} size="xl">{classInfo.studentCount}</Text>
                            </div>
                        </Group>
                    </Paper>
                </Grid.Col>
                <Grid.Col span={4}>
                    <Paper withBorder p="md" radius="md">
                        <Group>
                            <ThemeIcon size="lg" radius="md" variant="light" color="orange">
                                <IconChalkboard size={20} />
                            </ThemeIcon>
                            <div>
                                <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Room</Text>
                                <Text fw={700} size="xl">{classInfo.room}</Text>
                            </div>
                        </Group>
                    </Paper>
                </Grid.Col>
                <Grid.Col span={4}>
                    <Paper withBorder p="md" radius="md">
                        <Group>
                            <ThemeIcon size="lg" radius="md" variant="light" color="green">
                                <IconSchool size={20} />
                            </ThemeIcon>
                            <div>
                                <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Year</Text>
                                <Text fw={700} size="xl">{classInfo.academicYear}</Text>
                            </div>
                        </Group>
                    </Paper>
                </Grid.Col>
            </Grid>

            <Tabs value={activeTab} onChange={setActiveTab} variant="outline" radius="md">
                <Tabs.List mb="md">
                    <Tabs.Tab value="assignments" leftSection={<IconBook size={16} />}>
                        Assignments & Homework
                    </Tabs.Tab>
                    <Tabs.Tab value="resources" leftSection={<IconBook size={16} />}>
                        Study Materials
                    </Tabs.Tab>
                    <Tabs.Tab value="syllabus" leftSection={<IconChalkboard size={16} />}>
                        Syllabus Tracker
                    </Tabs.Tab>
                    <Tabs.Tab value="students" leftSection={<IconUsers size={16} />}>
                        Students & Remarks
                    </Tabs.Tab>
                    <Tabs.Tab value="timetable" leftSection={<IconCalendar size={16} />}>
                        Timetable
                    </Tabs.Tab>
                    <Tabs.Tab value="teachers" leftSection={<IconSchool size={16} />}>
                        Subject Teachers
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="assignments">
                    <AssignmentsTab />
                </Tabs.Panel>

                <Tabs.Panel value="resources">
                    <ResourcesTab />
                </Tabs.Panel>

                <Tabs.Panel value="syllabus">
                    <SyllabusTab />
                </Tabs.Panel>

                <Tabs.Panel value="students">
                    <DataTable
                        data={students}
                        columns={[
                            ...studentColumns,
                            {
                                accessor: 'actions',
                                header: 'Actions',
                                render: (item) => <Button size="compact-xs" variant="subtle" onClick={() => { setSelectedStudentForRemark(item); openRemarkModal(); }}>Log Remark</Button>
                            }
                        ]}
                        pagination={{ total: 1, page: 1, onChange: () => { } }}
                    />
                </Tabs.Panel>

                <Tabs.Panel value="timetable">
                    <TimetableView />
                </Tabs.Panel>

                <Tabs.Panel value="teachers">
                    <SubjectTeacherList />
                </Tabs.Panel>
            </Tabs>

            {/* Create Assignment Modal */}
            <Modal opened={assignmentsTabOpened} onClose={closeAssignmentModal} title="Create New Assignment">
                <TextInput label="Title" placeholder="e.g., Algebra Quiz" mb="md" />
                <Textarea label="Description" placeholder="Instructions for students..." mb="md" />
                <DatePickerInput label="Due Date" placeholder="Select date" mb="md" />
                <NumberInput label="Max Marks" defaultValue={100} mb="lg" />
                <Group justify="flex-end">
                    <Button variant="default" onClick={closeAssignmentModal}>Cancel</Button>
                    <Button onClick={handleCreateAssignment}>Create</Button>
                </Group>
            </Modal>

            {/* Upload Resource Modal */}
            <Modal opened={resourceModalOpened} onClose={closeResourceModal} title="Upload Study Material">
                <TextInput label="Title" placeholder="e.g., Chapter 1 Notes" mb="md" />
                <Textarea label="Description" placeholder="Description of the file..." mb="md" />
                <Button variant="light" mb="md" fullWidth leftSection={<IconPlus size={16} />}>Select File</Button>
                <Group justify="flex-end">
                    <Button variant="default" onClick={closeResourceModal}>Cancel</Button>
                    <Button onClick={handleUploadResource}>Upload</Button>
                </Group>
            </Modal>

            {/* Grading Modal */}
            <Modal opened={gradingModalOpened} onClose={closeGradingModal} title={`Grading: ${selectedAssignment?.title}`} size="lg">
                <DataTable
                    data={students} // Reusing student list
                    columns={[
                        { accessor: 'name', header: 'Student' },
                        {
                            accessor: 'marks',
                            header: 'Marks',
                            render: () => <NumberInput size="xs" w={80} min={0} max={100} />
                        },
                        {
                            accessor: 'feedback',
                            header: 'Feedback',
                            render: () => <TextInput size="xs" placeholder="Good job..." />
                        }
                    ]}
                    pagination={{ total: 1, page: 1, onChange: () => { } }}
                />
                <Group justify="flex-end" mt="md">
                    <Button onClick={closeGradingModal}>Save Grades</Button>
                </Group>
            </Modal>

            {/* Remark Modal */}
            <Modal opened={remarkModalOpened} onClose={closeRemarkModal} title={`Log Remark for ${selectedStudentForRemark?.name}`}>
                <TextInput label="Subject" placeholder="e.g., Behavior, Improvement" mb="md" />
                <Textarea label="Remark" placeholder="Details..." mb="md" />
                <Group justify="flex-end">
                    <Button variant="default" onClick={closeRemarkModal}>Cancel</Button>
                    <Button color="red" onClick={handleSaveRemark}>Log Remark</Button>
                </Group>
            </Modal>
        </Box>
    );
}
