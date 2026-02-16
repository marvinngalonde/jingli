import { useState, useEffect } from 'react';
import {
    Text,
    Paper,
    Group,
    Tabs,
    Button,
    Box,
    Grid,
    ThemeIcon,
    Loader,
    Center,
    Badge
} from '@mantine/core';
import {
    IconArrowLeft,
    IconUsers,
    IconCalendar,
    IconSchool,
    IconChalkboard
} from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { notifications } from '@mantine/notifications';

// Common Components
import { PageHeader } from '../components/common/PageHeader';
import { DataTable, type Column } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';

// API
import { api } from '../services/api';

interface Student {
    id: string;
    rollNo: string;
    user: {
        email: string;
    };
}

interface TimetableEntry {
    id: string;
    day: string;
    startTime: string;
    endTime: string;
    roomNo?: string;
    subject: {
        name: string;
        code: string;
    };
    teacher: {
        user: {
            email: string;
        };
    };
}

interface Teacher {
    id: string;
    employeeId: string;
    designation: string;
    user: {
        email: string;
    };
    subjects: Array<{
        name: string;
        code: string;
    }>;
}

export default function ClassDetail() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [loading, setLoading] = useState(true);
    const [classData, setClassData] = useState<any>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [activeTab, setActiveTab] = useState<string | null>('students');

    useEffect(() => {
        loadClassData();
    }, [id]);

    const loadClassData = async () => {
        try {
            setLoading(true);

            // Load class details
            const classRes = await api.get(`/classes/${id}`);
            setClassData(classRes.data);

            // Load students
            const studentsRes = await api.get(`/classes/sections/${id}/students`);
            setStudents(studentsRes.data);

            // Load timetable
            const timetableRes = await api.get(`/classes/sections/${id}/timetable`);
            setTimetable(timetableRes.data);

            // Load teachers
            const teachersRes = await api.get(`/classes/sections/${id}/teachers`);
            setTeachers(teachersRes.data);

            setLoading(false);
        } catch (error: any) {
            console.error('Error loading class data:', error);
            notifications.show({
                title: 'Error',
                message: error.response?.data?.message || 'Failed to load class data',
                color: 'red'
            });
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Center h={400}>
                <Loader size="lg" />
            </Center>
        );
    }

    if (!classData) {
        return (
            <Box p="md">
                <Text>Class not found</Text>
                <Button onClick={() => navigate('/classes')} mt="md">Back to Classes</Button>
            </Box>
        );
    }

    const studentColumns: Column<Student>[] = [
        { accessor: 'rollNo', header: 'Roll No.' },
        { accessor: 'user.email', header: 'Email', render: (item) => item.user?.email || 'N/A' },
        {
            accessor: 'id',
            header: 'Status',
            render: () => <StatusBadge status="active" />
        }
    ];

    const timetableColumns: Column<TimetableEntry>[] = [
        { accessor: 'day', header: 'Day' },
        {
            accessor: 'startTime',
            header: 'Time',
            render: (item) => {
                const start = new Date(item.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                const end = new Date(item.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                return `${start} - ${end}`;
            }
        },
        {
            accessor: 'subject.name',
            header: 'Subject',
            render: (item) => (
                <div>
                    <Text fw={500}>{item.subject.name}</Text>
                    <Text size="xs" c="dimmed">{item.subject.code}</Text>
                </div>
            )
        },
        {
            accessor: 'teacher.user.email',
            header: 'Teacher',
            render: (item) => item.teacher?.user?.email || 'N/A'
        },
        { accessor: 'roomNo', header: 'Room', render: (item) => item.roomNo || '-' }
    ];

    const teacherColumns: Column<Teacher>[] = [
        { accessor: 'employeeId', header: 'Employee ID' },
        { accessor: 'user.email', header: 'Email', render: (item) => item.user?.email || 'N/A' },
        { accessor: 'designation', header: 'Designation' },
        {
            accessor: 'subjects',
            header: 'Subjects',
            render: (item: any) => (
                <Group gap="xs">
                    {item.subjects?.map((subject: any, idx: number) => (
                        <Badge key={idx} variant="light" size="sm">
                            {subject.name}
                        </Badge>
                    ))}
                </Group>
            )
        }
    ];

    return (
        <Box p="md">
            <Button
                variant="subtle"
                color="gray"
                leftSection={<IconArrowLeft size={16} />}
                mb="md"
                onClick={() => navigate('/classes')}
            >
                Back to Classes
            </Button>

            <PageHeader
                title={`${classData.classLevel?.name} - Section ${classData.name}`}
                subtitle={`Class Teacher: ${classData.classTeacher?.user?.email || 'Not assigned'}`}
                actions={<Button variant="light">Edit Class</Button>}
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
                                <Text fw={700} size="xl">{students.length}</Text>
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
                                <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Capacity</Text>
                                <Text fw={700} size="xl">{classData.capacity}</Text>
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
                                <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Teachers</Text>
                                <Text fw={700} size="xl">{teachers.length}</Text>
                            </div>
                        </Group>
                    </Paper>
                </Grid.Col>
            </Grid>

            <Tabs value={activeTab} onChange={setActiveTab} variant="outline" radius="md">
                <Tabs.List mb="md">
                    <Tabs.Tab value="students" leftSection={<IconUsers size={16} />}>
                        Students ({students.length})
                    </Tabs.Tab>
                    <Tabs.Tab value="timetable" leftSection={<IconCalendar size={16} />}>
                        Timetable ({timetable.length})
                    </Tabs.Tab>
                    <Tabs.Tab value="teachers" leftSection={<IconSchool size={16} />}>
                        Teachers ({teachers.length})
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="students">
                    <DataTable
                        data={students}
                        columns={studentColumns}
                        loading={loading}
                    />
                </Tabs.Panel>

                <Tabs.Panel value="timetable">
                    {timetable.length === 0 ? (
                        <Paper withBorder p="xl" radius="md">
                            <Center>
                                <Box ta="center">
                                    <IconCalendar size={48} stroke={1.5} style={{ opacity: 0.3 }} />
                                    <Text size="lg" fw={500} mt="md">No timetable entries</Text>
                                    <Text size="sm" c="dimmed">
                                        Timetable entries will appear here once they are created.
                                    </Text>
                                </Box>
                            </Center>
                        </Paper>
                    ) : (
                        <DataTable
                            data={timetable}
                            columns={timetableColumns}
                            loading={loading}
                        />
                    )}
                </Tabs.Panel>

                <Tabs.Panel value="teachers">
                    {teachers.length === 0 ? (
                        <Paper withBorder p="xl" radius="md">
                            <Center>
                                <Box ta="center">
                                    <IconSchool size={48} stroke={1.5} style={{ opacity: 0.3 }} />
                                    <Text size="lg" fw={500} mt="md">No teachers assigned</Text>
                                    <Text size="sm" c="dimmed">
                                        Teachers will appear here once timetable entries are created.
                                    </Text>
                                </Box>
                            </Center>
                        </Paper>
                    ) : (
                        <DataTable
                            data={teachers}
                            columns={teacherColumns}
                            loading={loading}
                        />
                    )}
                </Tabs.Panel>
            </Tabs>
        </Box>
    );
}
