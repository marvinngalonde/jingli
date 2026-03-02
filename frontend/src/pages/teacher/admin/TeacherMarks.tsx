import { useState, useEffect } from 'react';
import { Button, Group, Select, NumberInput, TextInput, Text, Avatar, Badge, Paper } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { useAuth } from '../../../context/AuthContext';
import { examsService } from '../../../services/examsService';
import { api } from '../../../services/api';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable, type Column } from '../../../components/common/DataTable';

interface StudentMark {
    id: string;
    studentId: string;
    studentName: string;
    admissionNo: string;
    section: string;
    marksObtained: number;
    remarks: string;
    isNew?: boolean;
}

interface ExamOption {
    id: string;
    name: string;
    maxMarks: number;
    classLevel: string;
    subject: string;
}

export default function TeacherMarks() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [exams, setExams] = useState<ExamOption[]>([]);
    const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
    const [students, setStudents] = useState<StudentMark[]>([]);
    const [search, setSearch] = useState('');

    const selectedExam = exams.find(e => e.id === selectedExamId);

    useEffect(() => {
        loadTeacherExams();
    }, []);

    useEffect(() => {
        if (selectedExamId) {
            loadGradebook(selectedExamId);
        } else {
            setStudents([]);
        }
    }, [selectedExamId]);

    const loadTeacherExams = async () => {
        try {
            // Load exams for the school and filter to teacher's subjects later
            const data = await examsService.getExams(user?.schoolId || '');
            const examOpts: ExamOption[] = data.map((e: any) => ({
                id: e.id,
                name: e.name,
                maxMarks: e.maxMarks,
                classLevel: e.classLevel?.name || '',
                subject: e.subject?.name || '',
            }));
            setExams(examOpts);
        } catch (error) {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to load exams', color: 'red' });
        }
    };

    const loadGradebook = async (examId: string) => {
        try {
            setLoading(true);
            const rawExams = await examsService.getExams(user?.schoolId || '');
            const exam = rawExams.find((e: any) => e.id === examId);
            if (!exam) return;

            const [existingResults, sectionStudents] = await Promise.all([
                examsService.getExamResults(examId),
                // Get students from all teacher's classes for this exam's class level
                api.get(`/students?classLevelId=${exam.classLevelId}`).then(r => r.data)
            ]);

            const gradebook: StudentMark[] = (sectionStudents || []).map((s: any) => {
                const result = existingResults.find((r: any) => r.studentId === s.id);
                return {
                    id: s.id,
                    studentId: s.id,
                    studentName: `${s.firstName} ${s.lastName}`,
                    admissionNo: s.admissionNo || '',
                    section: s.section?.name || 'Unknown',
                    marksObtained: result ? Number(result.marksObtained) : 0,
                    remarks: result ? (result.remarks || '') : '',
                    isNew: !result,
                };
            });

            setStudents(gradebook.sort((a, b) => a.studentName.localeCompare(b.studentName)));
        } catch (error) {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to load gradebook', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    const handleMarkChange = (studentId: string, val: number | string) => {
        setStudents(current => current.map(s =>
            s.studentId === studentId ? { ...s, marksObtained: Number(val) } : s
        ));
    };

    const handleRemarkChange = (studentId: string, val: string) => {
        setStudents(current => current.map(s =>
            s.studentId === studentId ? { ...s, remarks: val } : s
        ));
    };

    const handleSave = async () => {
        if (!selectedExamId) return;
        try {
            setLoading(true);
            const payload = students.map(s => ({
                studentId: s.studentId,
                marksObtained: s.marksObtained,
                remarks: s.remarks,
                gradedBy: user?.id || 'unknown',
            }));

            await examsService.submitBulkResults(selectedExamId, payload);
            notifications.show({ title: 'Success', message: 'Marks saved successfully', color: 'green' });
            loadGradebook(selectedExamId);
        } catch (error) {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to save marks', color: 'red' });
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(s =>
        s.studentName.toLowerCase().includes(search.toLowerCase()) ||
        s.admissionNo.toLowerCase().includes(search.toLowerCase())
    );

    const columns: Column<StudentMark>[] = [
        {
            accessor: 'studentName',
            header: 'Student',
            render: (item) => (
                <Group gap="sm">
                    <Avatar radius="xl" size="sm" color="blue">
                        {item.studentName.charAt(0)}
                    </Avatar>
                    <div>
                        <Text size="sm" fw={500}>{item.studentName}</Text>
                        <Text size="xs" c="dimmed">{item.section}</Text>
                    </div>
                </Group>
            ),
        },
        {
            accessor: 'admissionNo',
            header: 'Admission No',
            render: (item) => <Text size="sm">{item.admissionNo}</Text>,
        },
        {
            accessor: 'marksObtained',
            header: `Marks (Max: ${selectedExam?.maxMarks ?? '—'})`,
            width: 160,
            render: (item) => (
                <NumberInput
                    value={item.marksObtained}
                    onChange={(val) => handleMarkChange(item.studentId, val)}
                    min={0}
                    max={selectedExam?.maxMarks}
                    hideControls
                    size="xs"
                />
            ),
        },
        {
            accessor: 'percentage',
            header: 'Percentage',
            render: (item) => {
                if (!selectedExam) return <Text size="sm">—</Text>;
                const pct = ((item.marksObtained / selectedExam.maxMarks) * 100).toFixed(1);
                const color = Number(pct) < 50 ? 'red' : Number(pct) < 75 ? 'orange' : 'green';
                return <Badge color={color} variant="light">{pct}%</Badge>;
            },
        },
        {
            accessor: 'remarks',
            header: 'Remarks',
            render: (item) => (
                <TextInput
                    value={item.remarks}
                    onChange={(e) => handleRemarkChange(item.studentId, e.currentTarget.value)}
                    placeholder="Excellent..."
                    size="xs"
                />
            ),
        },
    ];

    return (
        <div>
            <PageHeader
                title="Marks Entry"
                subtitle="Enter and manage exam marks for your students"
            />

            <Paper withBorder radius="md" p="md" mb="lg" bg="var(--app-surface)">
                <Group justify="space-between">
                    <Select
                        label="Select Exam"
                        placeholder="Choose an exam"
                        data={exams.map(e => ({ value: e.id, label: `${e.name} — ${e.classLevel} (${e.subject})` }))}
                        value={selectedExamId}
                        onChange={setSelectedExamId}
                        searchable
                        w={400}
                    />
                    <Button
                        leftSection={<IconDeviceFloppy size={16} />}
                        onClick={handleSave}
                        disabled={!selectedExamId || loading}
                        loading={loading}
                        mt={24}
                    >
                        Save All Marks
                    </Button>
                </Group>
            </Paper>

            <DataTable
                data={filteredStudents}
                columns={columns}
                loading={loading}
                search={search}
                onSearchChange={setSearch}
                pagination={{ total: 1, page: 1, onChange: () => { } }}
            />
        </div>
    );
}
