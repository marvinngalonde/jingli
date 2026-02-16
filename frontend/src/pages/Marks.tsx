import { Tabs, Button, Group, Text, Select, TextInput, NumberInput, Paper, Table, Badge, ActionIcon, Avatar } from '@mantine/core';
import { IconClipboardList, IconTypography, IconDeviceFloppy, IconEye, IconPrinter } from '@tabler/icons-react';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable, type Column } from '../components/common/DataTable';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// --- Marks Mock Data ---
interface StudentMark {
    id: string;
    studentName: string;
    rollNo: string;
    avatar: string; // url or initials
    marks: number | '';
    maxMarks: number;
    grade: string;
    status: string;
}

const mockStudents: StudentMark[] = [
    { id: '1', studentName: 'Alice Johnson', rollNo: '10A01', avatar: 'AJ', marks: 85, maxMarks: 100, grade: 'A', status: 'Pass' },
    { id: '2', studentName: 'Bob Smith', rollNo: '10A02', avatar: 'BS', marks: 92, maxMarks: 100, grade: 'A+', status: 'Pass' },
    { id: '3', studentName: 'Charlie Brown', rollNo: '10A03', avatar: 'CB', marks: 68, maxMarks: 100, grade: 'B', status: 'Pass' },
    { id: '4', studentName: 'David Wilson', rollNo: '10A04', avatar: 'DW', marks: 45, maxMarks: 100, grade: 'D', status: 'Pass' },
    { id: '5', studentName: 'Eva Green', rollNo: '10A05', avatar: 'EG', marks: 32, maxMarks: 100, grade: 'F', status: 'Fail' },
];

export default function Marks() {
    const { user } = useAuth();
    const isStudent = user?.role === 'student' || user?.role === 'parent';

    const [activeTab, setActiveTab] = useState<string | null>('marks-entry');
    const [selectedClass, setSelectedClass] = useState<string | null>('Grade 10A');
    const [selectedSubject, setSelectedSubject] = useState<string | null>('Mathematics');
    const [studentData, setStudentData] = useState<StudentMark[]>(mockStudents);

    // Forces tab switch for students
    useEffect(() => {
        if (isStudent) {
            setActiveTab('report-cards');
        }
    }, [isStudent]);

    const handleMarkChange = (id: string, value: number | '') => {
        setStudentData(prev => prev.map(student => {
            if (student.id === id) {
                const marks = value === '' ? 0 : value;
                // Simple auto-grading logic
                let grade = 'F';
                let status = 'Fail';
                const percentage = (marks / student.maxMarks) * 100;

                if (percentage >= 90) grade = 'A+';
                else if (percentage >= 80) grade = 'A';
                else if (percentage >= 70) grade = 'B';
                else if (percentage >= 60) grade = 'C';
                else if (percentage >= 40) grade = 'D';

                if (percentage >= 40) status = 'Pass';

                return { ...student, marks: value, grade, status };
            }
            return student;
        }));
    };

    const MarksEntryTab = () => (
        <>
            <Paper p="md" mb="lg" bg="gray.0" withBorder>
                <Group align="flex-end">
                    <Select
                        label="Class"
                        data={['Grade 10A', 'Grade 10B', 'Grade 11A']}
                        value={selectedClass}
                        onChange={setSelectedClass}
                    />
                    <Select
                        label="Subject"
                        data={['Mathematics', 'English', 'Science', 'History']}
                        value={selectedSubject}
                        onChange={setSelectedSubject}
                    />
                    <Select
                        label="Exam Term"
                        data={['Term 1', 'Mid-Term', 'Finals']}
                        defaultValue="Term 1"
                    />
                    <Button leftSection={<IconDeviceFloppy size={16} />}>Save Marks</Button>
                </Group>
            </Paper>

            <Table verticalSpacing="sm" withTableBorder>
                <Table.Thead bg="gray.1">
                    <Table.Tr>
                        <Table.Th>Roll No</Table.Th>
                        <Table.Th>Student Name</Table.Th>
                        <Table.Th>Marks Obtained</Table.Th>
                        <Table.Th>Max Marks</Table.Th>
                        <Table.Th>Grade</Table.Th>
                        <Table.Th>Status</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {studentData.map((student) => (
                        <Table.Tr key={student.id}>
                            <Table.Td fw={500}>{student.rollNo}</Table.Td>
                            <Table.Td>
                                <Group gap="sm">
                                    <Avatar size="sm" radius="xl">{student.avatar}</Avatar>
                                    <Text size="sm" fw={500}>{student.studentName}</Text>
                                </Group>
                            </Table.Td>
                            <Table.Td>
                                <NumberInput
                                    value={student.marks}
                                    onChange={(val) => handleMarkChange(student.id, val)}
                                    min={0}
                                    max={student.maxMarks}
                                    w={100}
                                />
                            </Table.Td>
                            <Table.Td>{student.maxMarks}</Table.Td>
                            <Table.Td>
                                <Badge variant="light" color={student.grade === 'F' ? 'red' : 'blue'}>
                                    {student.grade}
                                </Badge>
                            </Table.Td>
                            <Table.Td>
                                <Badge variant="filled" color={student.status === 'Pass' ? 'green' : 'red'}>
                                    {student.status}
                                </Badge>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </>
    );

    const ReportCardsTab = () => (
        <>
            <Group mb="lg" justify="space-between">
                <Group>
                    {!isStudent && <Select label="Class" data={['Grade 10A', 'Grade 10B']} defaultValue="Grade 10A" />}
                    <Select label="Exam Term" data={['Term 1', 'Finals']} defaultValue="Term 1" />
                </Group>
                {!isStudent && <Button mt={24} leftSection={<IconPrinter size={16} />}>Print All Reports</Button>}
                {isStudent && <Button mt={24} leftSection={<IconPrinter size={16} />}>Download My Report</Button>}
            </Group>

            {/* For Students, we simulate filtering to only show their "own" record if we had real auth data. 
                For now we just show the table but with limited actions. */}

            <DataTable
                data={isStudent ? mockStudents.slice(0, 1) : mockStudents} // Demonstrate filtering for student
                columns={[
                    { accessor: 'rollNo', header: 'Roll No', width: 100 },
                    { accessor: 'studentName', header: 'Student Name' },
                    {
                        accessor: 'status',
                        header: 'Term Status',
                        render: (item) => <Badge color={item.status === 'Pass' ? 'green' : 'red'}>{item.status}</Badge>
                    },
                    {
                        accessor: 'actions',
                        header: 'Actions',
                        render: () => (
                            <Group gap={4}>
                                <Button size="xs" variant="light" leftSection={<IconEye size={14} />}>View Report</Button>
                                {isStudent && <ActionIcon size="sm" variant="subtle" color="gray"><IconPrinter size={14} /></ActionIcon>}
                            </Group>
                        )
                    }
                ]}
                search=""
                onSearchChange={() => { }}
                pagination={{ total: 1, page: 1, onChange: () => { } }}
            />
        </>
    );

    return (
        <>
            <PageHeader
                title={isStudent ? "My Performance" : "Marks & Examinations"}
                subtitle={isStudent ? "View your grades and download report cards" : "Enter marks, manage grading, and generate report cards"}
            />

            <Tabs value={activeTab} onChange={setActiveTab} radius="md">
                <Tabs.List mb="md">
                    {!isStudent && <Tabs.Tab value="marks-entry" leftSection={<IconClipboardList size={16} />}>Marks Entry</Tabs.Tab>}
                    <Tabs.Tab value="report-cards" leftSection={<IconTypography size={16} />}>Report Cards</Tabs.Tab>
                </Tabs.List>

                {!isStudent && (
                    <Tabs.Panel value="marks-entry">
                        <MarksEntryTab />
                    </Tabs.Panel>
                )}

                <Tabs.Panel value="report-cards">
                    <ReportCardsTab />
                </Tabs.Panel>
            </Tabs>
        </>
    );
}
