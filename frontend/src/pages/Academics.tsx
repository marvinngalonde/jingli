import { Tabs, Button, Group, Text, Select, SimpleGrid, Paper, Badge, Box } from '@mantine/core';
import { IconBook, IconCalendar, IconPlus, IconClock } from '@tabler/icons-react';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable, type Column } from '../components/common/DataTable';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

// --- Subjects Mock Data ---
interface Subject {
    id: string;
    code: string;
    name: string;
    department: string;
    level: string;
    teachers: string;
}

const mockSubjects: Subject[] = [
    { id: '1', code: 'MATH101', name: 'Mathematics', department: 'Science', level: 'Grade 10', teachers: 'Mr. Smith' },
    { id: '2', code: 'ENG101', name: 'English Literature', department: 'Arts', level: 'Grade 10', teachers: 'Mrs. Davis' },
    { id: '3', code: 'PHY101', name: 'Physics', department: 'Science', level: 'Grade 10', teachers: 'Dr. Brown' },
    { id: '4', code: 'HIS101', name: 'History', department: 'Humanities', level: 'Grade 10', teachers: 'Mr. Wilson' },
    { id: '5', code: 'BIO101', name: 'Biology', department: 'Science', level: 'Grade 10', teachers: 'Ms. Clark' },
];

const subjectColumns: Column<Subject>[] = [
    { accessor: 'code', header: 'Code', width: 100 },
    { accessor: 'name', header: 'Subject Name' },
    { accessor: 'department', header: 'Department' },
    { accessor: 'level', header: 'Level/Grade' },
    { accessor: 'teachers', header: 'Teachers' },
];

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
    const isStudentOrParent = user?.role === 'student' || user?.role === 'parent';

    const [activeTab, setActiveTab] = useState<string | null>(isStudentOrParent ? 'timetable' : 'subjects');
    const [search, setSearch] = useState('');

    const filteredSubjects = mockSubjects.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.code.toLowerCase().includes(search.toLowerCase())
    );

    const SubjectsTab = () => (
        <>
            <Group justify="space-between" mb="md">
                <Text size="sm" c="dimmed">
                    {isStudentOrParent ? "Subjects enrolled in for the current academic year." : "Manage subjects and assign them to grades/departments."}
                </Text>
                {!isStudentOrParent && <Button leftSection={<IconPlus size={16} />}>Add Subject</Button>}
            </Group>
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

            <Paper withBorder radius="md" overflow="hidden">
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
        </>
    );
}
