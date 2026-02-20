import { useState, useEffect } from 'react';
import {
    Table,
    Group,
    Text,
    Button,
    Avatar,
    ActionIcon,
    Loader,
    Badge,
    Paper,
    Select,
    SegmentedControl,
    Center
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconCheck, IconX, IconClock, IconDeviceFloppy } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { attendanceService } from '../../services/attendanceService';
import { academicsService, classesApi } from '../../services/academics';
import type { AttendanceRecord, AttendanceStatus, CreateAttendanceDto } from '../../types/attendance';
import type { Student } from '../../types/students';
import { useAuth } from '../../context/AuthContext';

interface AttendanceSheetProps {
    classId?: string; // Pre-selected class
}

export function AttendanceSheet({ classId: initialClassId }: AttendanceSheetProps) {
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedClassId, setSelectedClassId] = useState<string | null>(initialClassId || null);

    // Data
    const [students, setStudents] = useState<Student[]>([]);
    const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceRecord | null>>({});
    const [classes, setClasses] = useState<{ value: string; label: string }[]>([]);

    // Loading states
    const [loadingData, setLoadingData] = useState(false);
    const [saving, setSaving] = useState(false);

    // Load classes for dropdown
    useEffect(() => {
        loadClasses();
    }, []);

    // Load students and existing attendance when class/date changes
    useEffect(() => {
        if (selectedClassId && selectedDate) {
            loadSheetData();
        }
    }, [selectedClassId, selectedDate]);

    const loadClasses = async () => {
        try {
            // Fetch all sections suitable for attendance
            // Assuming academicsService has a way to get all sections or we use classes endpoint
            const data = await academicsService.getClasses();
            // Flatten to sections for the dropdown: "Grade 10 - A"
            const options = data.flatMap(cls =>
                cls.sections?.map(sec => ({
                    value: sec.id,
                    label: `${cls.name} - ${sec.name}`
                })) || []
            );
            setClasses(options);
        } catch (error) {
            console.error("Failed to load classes", error);
        }
    };

    const loadSheetData = async () => {
        if (!selectedClassId) return;
        setLoadingData(true);
        try {
            // 1. Get Students in Section
            // Direct use of classesApi to avoid stale service object issues in HMR
            const studentList = await classesApi.getStudents(selectedClassId);
            setStudents(studentList.sort((a: any, b: any) => a.lastName.localeCompare(b.lastName)));

            // 2. Get Existing Attendance
            const records = await attendanceService.getClassAttendance(selectedClassId, selectedDate);
            const map: Record<string, AttendanceRecord> = {};
            records.forEach(r => {
                map[r.studentId] = r;
            });
            setAttendanceMap(map);
        } catch (error) {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to load data', color: 'red' });
        } finally {
            setLoadingData(false);
        }
    };

    const handleStatusChange = (studentId: string, status: string) => {
        // Optimistic update map
        setAttendanceMap(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                studentId,
                status: status as AttendanceStatus,
                date: selectedDate.toISOString()
            } as any
        }));
    };

    const handleSave = async () => {
        if (!selectedClassId || !user?.id) return;
        setSaving(true);
        try {
            const records: CreateAttendanceDto[] = students.map(student => {
                const current = attendanceMap[student.id];
                return {
                    studentId: student.id,
                    date: selectedDate,
                    status: current?.status || 'PRESENT', // Default to present if not marked? Or PENDING? Common pattern is default present.
                    remarks: current?.remarks,
                    recordedBy: user.id
                };
            });

            await attendanceService.bulkCreate({ records });
            notifications.show({ title: 'Saved', message: 'Attendance recorded successfully', color: 'green' });
            loadSheetData(); // Refresh to get IDs etc
        } catch (error) {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to save attendance', color: 'red' });
        } finally {
            setSaving(false);
        }
    };

    const markAll = (status: AttendanceStatus) => {
        const newMap = { ...attendanceMap };
        students.forEach(s => {
            newMap[s.id] = {
                ...newMap[s.id],
                studentId: s.id,
                status: status,
                date: selectedDate.toISOString()
            } as any;
        });
        setAttendanceMap(newMap);
    };

    if (classes.length === 0 && !selectedClassId) {
        return <Loader />;
    }

    return (
        <Paper p="md" radius="md" withBorder>
            <Group justify="space-between" mb="md">
                <Group>
                    <Select
                        placeholder="Select Class"
                        data={classes}
                        value={selectedClassId}
                        onChange={setSelectedClassId}
                        searchable
                        w={200}
                    />
                    <DateInput
                        value={selectedDate}
                        onChange={(d) => d && setSelectedDate(d)}
                        placeholder="Date"
                        w={150}
                    />
                </Group>
                <Group>
                    <Button variant="default" size="xs" onClick={() => markAll('PRESENT')}>All Present</Button>
                    <Button
                        leftSection={<IconDeviceFloppy size={16} />}
                        loading={saving}
                        onClick={handleSave}
                        disabled={!selectedClassId || students.length === 0}
                    >
                        Save Attendance
                    </Button>
                </Group>
            </Group>

            {loadingData ? (
                <Center p="xl"><Loader /></Center>
            ) : !selectedClassId ? (
                <Center p="xl"><Text c="dimmed">Select a class to mark attendance</Text></Center>
            ) : students.length === 0 ? (
                <Center p="xl"><Text c="dimmed">No students found in this class.</Text></Center>
            ) : (
                <Table striped verticalSpacing="sm">
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Student</Table.Th>
                            <Table.Th>Status</Table.Th>
                            <Table.Th>Current State</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {students.map(student => {
                            const record = attendanceMap[student.id];
                            const status = record?.status || 'PRESENT'; // Visual default only, not saved yet

                            return (
                                <Table.Tr key={student.id}>
                                    <Table.Td>
                                        <Group gap="sm">
                                            <Avatar src={student.photoUrl} radius="xl" size="sm" color="initials">
                                                {student.firstName[0]}{student.lastName[0]}
                                            </Avatar>
                                            <div>
                                                <Text size="sm" fw={500}>{student.firstName} {student.lastName}</Text>
                                                <Text size="xs" c="dimmed">{student.admissionNo}</Text>
                                            </div>
                                        </Group>
                                    </Table.Td>
                                    <Table.Td>
                                        <SegmentedControl
                                            size="sm"
                                            value={status}
                                            onChange={(val) => handleStatusChange(student.id, val)}
                                            radius="xl"
                                            data={[
                                                { label: 'Present', value: 'PRESENT' },
                                                { label: 'Absent', value: 'ABSENT' },
                                                { label: 'Late', value: 'LATE' },
                                                { label: 'Excused', value: 'EXCUSED' },
                                            ]}
                                            color={
                                                status === 'PRESENT' ? 'green' :
                                                    status === 'ABSENT' ? 'red' :
                                                        status === 'LATE' ? 'yellow' : 'blue'
                                            }
                                        />
                                    </Table.Td>
                                    <Table.Td>
                                        {record ? (
                                            <Badge
                                                color={record.status === 'PRESENT' ? 'green' : record.status === 'ABSENT' ? 'red' : 'yellow'}
                                                variant="light"
                                            >
                                                Saved
                                            </Badge>
                                        ) : (
                                            <Badge color="gray" variant="light">Unsaved</Badge>
                                        )}
                                    </Table.Td>
                                </Table.Tr>
                            );
                        })}
                    </Table.Tbody>
                </Table>
            )}
        </Paper>
    );
}
