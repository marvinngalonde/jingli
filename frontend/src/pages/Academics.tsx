import { Tabs, Button, Group, Text, Select, SimpleGrid, Paper, Box, LoadingOverlay } from '@mantine/core';
import { IconBook, IconCalendar, IconPlus, IconClock } from '@tabler/icons-react';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable, type Column } from '../components/common/DataTable';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { subjectsApi } from '../services/academics';
import type { Subject } from '../types/academics';
import { CreateSubjectModal } from '../components/modals/CreateSubjectModal';
import { EditSubjectModal } from '../components/modals/EditSubjectModal';
import { DeleteSubjectModal } from '../components/modals/DeleteSubjectModal';
import { ActionMenu } from '../components/common/ActionMenu';

// --- Timetable Mock Data ---
const timeSlots = ['08:00 - 09:00', '09:00 - 10:00', '10:00 - 10:30', '10:30 - 11:30', '11:30 - 12:30', '12:30 - 13:30'];
const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Simple mock for a specific class timetable (e.g., Grade 10A)
const mockTimetable: Record<string, string[]> = {
    'Monday': ['Math (Rm 101)', 'English (Rm 102)', 'BREAK', 'Physics (Lab 1)', 'History (Rm 103)', 'Biology (Lab 2)'],
    'Tuesday': ['English (Rm 102)', 'Math (Rm 101)', 'BREAK', 'Chemistry (Lab 1)', 'Geography (Rm 104)', 'PE (Field)'],
    'Wednesday': ['Math (Rm 101)', 'Physics (Lab 1)', 'BREAK', 'English (Rm 102)', 'History (Rm 103)', 'Art (Studio)'],
    'Thursday': ['Biology (Lab 2)', 'Chemistry (Lab 1)', 'BREAK', 'Math (Rm 101)', 'English (Rm 102)', 'Music (Rm 201)'],
    'Friday': ['History (Rm 103)', 'Geography (Rm 104)', 'BREAK', 'Math (Rm 101)', 'Physics (Lab 1)', 'Assembly'],
};

export default function Academics() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isStudentOrParent = user?.role === 'student' || user?.role === 'parent';

    const [activeTab, setActiveTab] = useState<string | null>(isStudentOrParent ? 'timetable' : 'subjects');
    const [search, setSearch] = useState('');

    // Subjects state
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loadingSubjects, setLoadingSubjects] = useState(true);
    const [createModalOpened, setCreateModalOpened] = useState(false);
    const [editModalOpened, setEditModalOpened] = useState(false);
    const [deleteModalOpened, setDeleteModalOpened] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

    // Fetch subjects on mount
    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            setLoadingSubjects(true);
            const data = await subjectsApi.getAll();
            setSubjects(data);
        } catch (err) {
            console.error('Failed to fetch subjects:', err);
        } finally {
            setLoadingSubjects(false);
        }
    };

    const handleEditSubject = (item: Subject) => {
        setSelectedSubject(item);
        setEditModalOpened(true);
    };

    const handleDeleteSubject = (item: Subject) => {
        setSelectedSubject(item);
        setDeleteModalOpened(true);
    };

    const filteredSubjects = subjects.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.code.toLowerCase().includes(search.toLowerCase()) ||
        (item.department?.toLowerCase().includes(search.toLowerCase()) || false)
    );

    const subjectColumns: Column<Subject>[] = [
        {
            accessor: 'code',
            header: 'Code',
            width: 100,
            render: (item) => <Text fw={500} size="sm">{item.code}</Text>
        },
        {
            accessor: 'name',
            header: 'Subject Name',
            render: (item) => (
                <Text
                    fw={600}
                    size="sm"
                    style={{ cursor: 'pointer' }}
                    c="blue"
                    onClick={() => navigate(`/subjects/${item.id}`)}
                >
                    {item.name}
                </Text>
            )
        },
        {
            accessor: 'department',
            header: 'Department',
            render: (item) => <Text size="sm">{item.department || 'N/A'}</Text>
        },
        {
            accessor: 'level',
            header: 'Level/Grade',
            render: () => <Text size="sm" c="dimmed">All Grades</Text>
        },
        {
            accessor: 'teachers',
            header: 'Teachers',
            render: () => <Text size="sm" c="dimmed">Not assigned</Text>
        },
        {
            accessor: 'actions',
            header: '',
            render: (item) => !isStudentOrParent ? (
                <Group justify="flex-end">
                    <ActionMenu
                        onEdit={() => handleEditSubject(item)}
                        onDelete={() => handleDeleteSubject(item)}
                    />
                </Group>
            ) : null
        }
    ];

    const SubjectsTab = () => (
        <>
            <Group justify="space-between" mb="md">
                <Text size="sm" c="dimmed">
                    {isStudentOrParent ? "Subjects enrolled in for the current academic year." : "Manage subjects and assign them to grades/departments."}
                </Text>
                {!isStudentOrParent && (
                    <Button
                        leftSection={<IconPlus size={16} />}
                        onClick={() => setCreateModalOpened(true)}
                    >
                        Add Subject
                    </Button>
                )}
            </Group>
            <LoadingOverlay visible={loadingSubjects} />
            <DataTable
                data={filteredSubjects}
                columns={subjectColumns}
                search={search}
                onSearchChange={setSearch}
                pagination={{ total: 1, page: 1, onChange: () => { } }}
            />
        </>
    );

    const TimetableTab = () => (
        <>
            <Group mb="lg">
                {isStudentOrParent ? (
                    <Text fw={700} size="lg">My Timetable (Grade 10A)</Text>
                ) : (
                    <Select
                        placeholder="Select Class"
                        data={['Grade 10A', 'Grade 10B', 'Grade 11A']}
                        defaultValue="Grade 10A"
                        label="View Timetable For"
                    />
                )}

                {!isStudentOrParent && (
                    <Button variant="light" mt={isStudentOrParent ? 0 : 24} leftSection={<IconPlus size={16} />}>Edit Schedule</Button>
                )}
            </Group>

            <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
                <Box p="md" bg="gray.1" style={{ overflowX: 'auto' }}>
                    <SimpleGrid cols={6} spacing="xs" style={{ minWidth: 800 }}>
                        {/* Header Row */}
                        <Box fw={700} c="dimmed">Day / Time</Box>
                        {timeSlots.map(time => (
                            <Box key={time} fw={700} ta="center" fz="xs" c="dimmed">
                                <Group justify="center" gap={4}>
                                    <IconClock size={12} />
                                    {time}
                                </Group>
                            </Box>
                        ))}

                        {/* Schedule Rows */}
                        {weekDays.map(day => (
                            <>
                                <Box key={day} fw={700} py="sm" style={{ display: 'flex', alignItems: 'center' }}>
                                    {day}
                                </Box>
                                {mockTimetable[day]?.map((subject, index) => {
                                    const isBreak = subject === 'BREAK';
                                    return (
                                        <Paper
                                            key={`${day}-${index}`}
                                            p="xs"
                                            radius="sm"
                                            bg={isBreak ? 'gray.2' : 'blue.0'}
                                            withBorder={!isBreak}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                minHeight: 60,
                                                opacity: isBreak ? 0.7 : 1
                                            }}
                                        >
                                            <Text ta="center" size="xs" fw={isBreak ? 700 : 500} c={isBreak ? 'dimmed' : 'black'}>
                                                {subject}
                                            </Text>
                                        </Paper>
                                    );
                                })}
                            </>
                        ))}
                    </SimpleGrid>
                </Box>
            </Paper>
        </>
    );

    return (
        <>
            <PageHeader
                title="Academics"
                subtitle={isStudentOrParent ? "My curriculum and schedule" : "Manage subjects, timetables, and curriculum"}
            />

            <Tabs value={activeTab} onChange={setActiveTab} radius="md">
                <Tabs.List mb="md">
                    {/* Re-ordering for students maybe? Or keeping same. Let's keep same for consistency but default to timetable */}
                    {!isStudentOrParent && <Tabs.Tab value="subjects" leftSection={<IconBook size={16} />}>Subjects</Tabs.Tab>}
                    {/* Actually students might want to see subjects too, just read only. Keeping it. */}
                    {isStudentOrParent && <Tabs.Tab value="subjects" leftSection={<IconBook size={16} />}>My Subjects</Tabs.Tab>}

                    <Tabs.Tab value="timetable" leftSection={<IconCalendar size={16} />}>Timetable</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="subjects">
                    <SubjectsTab />
                </Tabs.Panel>

                <Tabs.Panel value="timetable">
                    <TimetableTab />
                </Tabs.Panel>
            </Tabs>

            {/* Subject Modals */}
            <CreateSubjectModal
                opened={createModalOpened}
                onClose={() => setCreateModalOpened(false)}
                onSuccess={fetchSubjects}
            />

            <EditSubjectModal
                opened={editModalOpened}
                onClose={() => {
                    setEditModalOpened(false);
                    setSelectedSubject(null);
                }}
                onSuccess={fetchSubjects}
                subject={selectedSubject}
            />

            <DeleteSubjectModal
                opened={deleteModalOpened}
                onClose={() => {
                    setDeleteModalOpened(false);
                    setSelectedSubject(null);
                }}
                onSuccess={fetchSubjects}
                subjectId={selectedSubject?.id || null}
                subjectName={selectedSubject?.name || null}
            />
        </>
    );
}
