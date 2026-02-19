import { useState, useEffect } from 'react';
import { Button, Group, Select, NumberInput, TextInput, Text, Avatar, Badge } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import { examsService } from '../services/examsService';
import { academicsService } from '../services/academics';
import { studentService } from '../services/studentService';
import type { Exam } from '../types/exams';
import { DataTable, type Column } from '../components/common/DataTable';

interface StudentMark {
    id: string; // alias for studentId — required by DataTable
    studentId: string;
    studentName: string;
    admissionNo: string;
    section: string;
    marksObtained: number;
    remarks: string;
    isNew?: boolean;
}

export default function Marks() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [exams, setExams] = useState<Exam[]>([]);
    const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
    const [students, setStudents] = useState<StudentMark[]>([]);
    const [search, setSearch] = useState('');

    const selectedExam = exams.find(e => e.id === selectedExamId);

    useEffect(() => {
        loadExams();
    }, []);

    useEffect(() => {
        if (selectedExamId) {
            loadGradebook(selectedExamId);
        } else {
            setStudents([]);
        }
    }, [selectedExamId]);

    const loadExams = async () => {
        try {
            const data = await examsService.getExams(user?.schoolId || '');
            setExams(data);
        } catch (error) {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to load exams', color: 'red' });
        }
    };

    const loadGradebook = async (examId: string) => {
        try {
            setLoading(true);
            const exam = exams.find(e => e.id === examId);
            if (!exam) return;

            const [classData, allStudents, existingResults] = await Promise.all([
                academicsService.getClass(exam.classLevelId),
                studentService.getAll({ schoolId: user?.schoolId }),
                examsService.getExamResults(examId)
            ]);

            const validSectionIds = classData.sections?.map((s: any) => s.id) || [];
            const roster = allStudents.filter((s: any) => validSectionIds.includes(s.sectionId)).map((s: any) => ({
                id: s.id,
                name: `${s.firstName} ${s.lastName}`,
                admissionNo: s.admissionNo,
                sectionName: s.section?.name || 'Unknown',
            }));

            const gradebook: StudentMark[] = roster.map((student: any) => {
                const result = existingResults.find((r: any) => r.studentId === student.id);
                return {
                    id: student.id,
                    studentId: student.id,
                    studentName: student.name,
                    admissionNo: student.admissionNo,
                    section: student.sectionName,
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
            <Group justify="space-between" mb="md">
                <Text fw={500} c="dimmed">Select an exam to view and enter marks.</Text>
                <Group>
                    <Select
                        placeholder="Select Exam"
                        data={exams.map(e => ({ value: e.id, label: `${e.name} (${e.classLevel?.name})` }))}
                        value={selectedExamId}
                        onChange={setSelectedExamId}
                        searchable
                        w={300}
                    />
                    <Button
                        leftSection={<IconDeviceFloppy size={16} />}
                        onClick={handleSave}
                        disabled={!selectedExamId || loading}
                        loading={loading}
                    >
                        Save All
                    </Button>
                </Group>
            </Group>

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
