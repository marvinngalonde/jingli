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
    Badge,
    Avatar,
    Stack,
    RingProgress
} from '@mantine/core';
import {
    IconArrowLeft,
    IconUsers,
    IconCalendar,
    IconSchool,
    IconChalkboard,
    IconBook
} from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { notifications } from '@mantine/notifications';

// Common Components
import { PageHeader } from '../components/common/PageHeader';
import { ClassOverviewStats } from '../components/classes/ClassOverviewStats';
import { DataTable, type Column } from '../components/common/DataTable';
import { TimetableGrid } from '../components/timetable/TimetableGrid';

// API
import { api } from '../services/api';

interface Student {
    id: string;
    admissionNo: string;
    rollNo: string;
    firstName: string;
    lastName: string;
    gender?: string;
    dob?: string;
    user: {
        email: string;
        username?: string;
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
        firstName: string;
        lastName: string;
        user: {
            email: string;
        };
    };
}

interface Teacher {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    designation: string;
    phone?: string;
    user: {
        email: string;
    };
    subjects: Array<{
        name: string;
        code: string;
    }>;
}

const DAY_ORDER: Record<string, number> = { MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6, SUN: 7 };

export default function ClassDetail() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [loading, setLoading] = useState(true);
    const [classData, setClassData] = useState<any>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [activeTab, setActiveTab] = useState<string | null>('students');
    const [studentSearch, setStudentSearch] = useState('');
    const [timetableSearch, setTimetableSearch] = useState('');
    const [teacherSearch, setTeacherSearch] = useState('');

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
                <Button onClick={() => navigate('/academics')} mt="md">Back to Academics</Button>
            </Box>
        );
    }

    // Compute stats
    const capacity = classData.capacity || 30;
    const occupancyPercent = capacity > 0 ? Math.round((students.length / capacity) * 100) : 0;
    const uniqueSubjects = new Set(timetable.map(t => t.subject?.code)).size;
    const classTeacherName = classData.classTeacher
        ? `${classData.classTeacher.firstName} ${classData.classTeacher.lastName}`
        : 'Not assigned';

    // ═══════════════════ Students Tab ═══════════════════
    const filteredStudents = students.filter(s =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.admissionNo?.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.rollNo?.toLowerCase().includes(studentSearch.toLowerCase())
    );

    const studentColumns: Column<Student>[] = [
        {
            accessor: 'rollNo',
            header: 'Roll No.',
            width: 90,
            render: (item) => <Badge variant="light" size="sm">{item.rollNo || '—'}</Badge>
        },
        {
            accessor: 'name',
            header: 'Student Name',
            render: (item) => (
                <Group gap="sm">
                    <Avatar size="sm" radius="xl" color="blue">
                        {item.firstName?.[0]}{item.lastName?.[0]}
                    </Avatar>
                    <div>
                        <Text fw={500} size="sm">{item.firstName} {item.lastName}</Text>
                        <Text size="xs" c="dimmed">{item.admissionNo}</Text>
                    </div>
                </Group>
            )
        },
        {
            accessor: 'gender',
            header: 'Gender',
            width: 100,
            render: (item) => <Text size="sm" tt="capitalize">{item.gender || '—'}</Text>
        },
        {
            accessor: 'email',
            header: 'Email',
            render: (item) => <Text size="sm">{item.user?.email || '—'}</Text>
        }
    ];

    // ═══════════════════ Timetable Tab ═══════════════════
    const filteredTimetable = timetable
        .filter(t =>
            t.subject?.name.toLowerCase().includes(timetableSearch.toLowerCase()) ||
            t.day?.toLowerCase().includes(timetableSearch.toLowerCase()) ||
            `${t.teacher?.firstName} ${t.teacher?.lastName}`.toLowerCase().includes(timetableSearch.toLowerCase())
        )
        .sort((a, b) => (DAY_ORDER[a.day] || 99) - (DAY_ORDER[b.day] || 99));

    const timetableColumns: Column<TimetableEntry>[] = [
        {
            accessor: 'day',
            header: 'Day',
            width: 80,
            render: (item) => <Badge variant="outline" size="sm">{item.day}</Badge>
        },
        {
            accessor: 'startTime',
            header: 'Time',
            render: (item) => {
                const start = new Date(item.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                const end = new Date(item.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                return <Text size="sm">{start} – {end}</Text>;
            }
        },
        {
            accessor: 'subject.name',
            header: 'Subject',
            render: (item) => (
                <Group gap="xs">
                    <IconBook size={14} />
                    <div>
                        <Text fw={500} size="sm">{item.subject?.name}</Text>
                        <Text size="xs" c="dimmed">{item.subject?.code}</Text>
                    </div>
                </Group>
            )
        },
        {
            accessor: 'teacher',
            header: 'Teacher',
            render: (item) => (
                <Text size="sm">{item.teacher?.firstName} {item.teacher?.lastName}</Text>
            )
        },
        {
            accessor: 'roomNo',
            header: 'Room',
            width: 80,
            render: (item) => <Text size="sm">{item.roomNo || '—'}</Text>
        }
    ];

    // ═══════════════════ Teachers Tab ═══════════════════
    const filteredTeachers = teachers.filter(t =>
        `${t.firstName} ${t.lastName}`.toLowerCase().includes(teacherSearch.toLowerCase()) ||
        t.employeeId?.toLowerCase().includes(teacherSearch.toLowerCase()) ||
        t.subjects?.some(s => s.name.toLowerCase().includes(teacherSearch.toLowerCase()))
    );

    const teacherColumns: Column<Teacher>[] = [
        {
            accessor: 'name',
            header: 'Teacher Name',
            render: (item) => (
                <Group gap="sm">
                    <Avatar size="sm" radius="xl" color="teal">
                        {item.firstName?.[0]}{item.lastName?.[0]}
                    </Avatar>
                    <div>
                        <Text fw={500} size="sm">{item.firstName} {item.lastName}</Text>
                        <Text size="xs" c="dimmed">{item.employeeId}</Text>
                    </div>
                </Group>
            )
        },
        {
            accessor: 'designation',
            header: 'Designation',
            render: (item) => <Text size="sm">{item.designation}</Text>
        },
        {
            accessor: 'contact',
            header: 'Contact',
            render: (item) => (
                <Stack gap={2}>
                    <Text size="sm">{item.user?.email || '—'}</Text>
                    {item.phone && <Text size="xs" c="dimmed">{item.phone}</Text>}
                </Stack>
            )
        },
        {
            accessor: 'subjects',
            header: 'Subjects',
            render: (item: any) => (
                <Group gap={4} wrap="wrap">
                    {item.subjects?.length > 0
                        ? item.subjects.map((subject: any, idx: number) => (
                            <Badge key={idx} variant="light" size="sm" color="violet">{subject.name}</Badge>
                        ))
                        : <Text size="sm" c="dimmed">—</Text>
                    }
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
                onClick={() => navigate('/academics')}
            >
                Back to Academics
            </Button>

            <PageHeader
                title={`${classData.classLevel?.name || 'Class'} — Section ${classData.name}`}
                subtitle={`Class Teacher: ${classTeacherName}`}
            />

            <ClassOverviewStats
                studentCount={students.length}
                capacity={capacity}
                teacherCount={teachers.length}
                subjectCount={uniqueSubjects}
            />

            {/* ═══════════ Tabs ═══════════ */}
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
                        data={filteredStudents}
                        columns={studentColumns}
                        search={studentSearch}
                        onSearchChange={setStudentSearch}
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
                                        Timetable entries will appear here once created in the Academics Hub.
                                    </Text>
                                </Box>
                            </Center>
                        </Paper>
                    ) : (
                        <Box mt="md">
                            <TimetableGrid
                                entries={timetable as any}
                            // No onEdit or onDelete passed here since this is a read-only view
                            // editing happens in Academics Hub or Teacher Portal
                            />
                        </Box>
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
                                        Teachers will appear here once timetable entries or subject allocations are created.
                                    </Text>
                                </Box>
                            </Center>
                        </Paper>
                    ) : (
                        <DataTable
                            data={filteredTeachers}
                            columns={teacherColumns}
                            search={teacherSearch}
                            onSearchChange={setTeacherSearch}
                            loading={loading}
                        />
                    )}
                </Tabs.Panel>
            </Tabs>
        </Box>
    );
}
