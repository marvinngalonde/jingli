import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
    Center,
    Stack
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { DateInput } from '@mantine/dates';
import { IconCheck, IconX, IconClock, IconDeviceFloppy } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { attendanceService } from '../../services/attendanceService';
import { academicsService, classesApi } from '../../services/academics';
import type { AttendanceRecord, AttendanceStatus, CreateAttendanceDto } from '../../types/attendance';
import type { Student } from '../../types/students';
import { useAuth } from '../../context/AuthContext';
import { isTeacherRole } from '../../utils/roles';

interface AttendanceSheetProps {
    classId?: string; // Pre-selected class
}

export function AttendanceSheet({ classId: initialClassId }: AttendanceSheetProps) {
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedClassId, setSelectedClassId] = useState<string | null>(initialClassId || null);
    const isMobile = useMediaQuery('(max-width: 48em)');

    // Data
    const [students, setStudents] = useState<Student[]>([]);
    const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceRecord | null>>({});
    const [modifiedRecords, setModifiedRecords] = useState<Set<string>>(new Set());
    const queryClient = useQueryClient();

    const { data: classesRaw = [], isLoading: classesLoading } = useQuery({
        queryKey: ['attendanceClasses', user?.id],
        queryFn: () => {
            const filters = isTeacherRole(user?.role || '') ? { teacherId: user?.id } : undefined;
            return academicsService.getClasses(filters);
        }
    });

    const classes = useMemo(() => {
        return classesRaw.flatMap((cls: any) =>
            cls.sections?.map((sec: any) => ({
                value: sec.id,
                label: `${cls.name} ${cls.level || ''} - ${sec.name}`.trim()
            })) || []
        );
    }, [classesRaw]);

    const { data: sheetData, isLoading: sheetLoading } = useQuery({
        queryKey: ['attendanceSheet', selectedClassId, selectedDate.toISOString().split('T')[0]],
        queryFn: async () => {
            if (!selectedClassId) return null;
            const [studentList, records] = await Promise.all([
                classesApi.getStudents(selectedClassId),
                attendanceService.getClassAttendance(selectedClassId, selectedDate)
            ]);

            const sortedStudents = studentList.sort((a: any, b: any) => a.lastName.localeCompare(b.lastName));
            const map: Record<string, AttendanceRecord> = {};
            records.forEach((r: any) => {
                map[r.studentId] = r;
            });

            return { students: sortedStudents, attendanceMap: map };
        },
        enabled: !!selectedClassId
    });

    useEffect(() => {
        if (sheetData) {
            setStudents(sheetData.students);
            setAttendanceMap(sheetData.attendanceMap as any);
            setModifiedRecords(new Set());
        }
    }, [sheetData]);

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
        setModifiedRecords(prev => new Set(prev).add(studentId));
    };

    const saveMutation = useMutation({
        mutationFn: (records: CreateAttendanceDto[]) => attendanceService.bulkCreate({ records }),
        onSuccess: () => {
            notifications.show({ title: 'Saved', message: 'Attendance recorded successfully', color: 'green' });
            setModifiedRecords(new Set());
            queryClient.invalidateQueries({ queryKey: ['attendanceSheet'] });
        },
        onError: () => notifications.show({ title: 'Error', message: 'Failed to save attendance', color: 'red' })
    });

    const handleSave = () => {
        if (!selectedClassId || !user?.id) return;
        const records: CreateAttendanceDto[] = students.map(student => {
            const current = attendanceMap[student.id];
            return {
                studentId: student.id,
                date: selectedDate,
                status: current?.status || 'PRESENT',
                remarks: current?.remarks,
                recordedBy: user.id
            };
        });

        saveMutation.mutate(records);
    };

    const markAll = (status: AttendanceStatus) => {
        const newMap = { ...attendanceMap };
        const newModified = new Set(modifiedRecords);
        students.forEach(s => {
            newMap[s.id] = {
                ...newMap[s.id],
                studentId: s.id,
                status: status,
                date: selectedDate.toISOString()
            } as any;
            newModified.add(s.id);
        });
        setAttendanceMap(newMap);
        setModifiedRecords(newModified);
    };

    if (classes.length === 0 && !selectedClassId) {
        return <Loader />;
    }

    return (
        <Paper p="md" radius="md" withBorder>
            <Group justify="space-between" mb="md" gap="md">
                <Group style={{ flex: 1 }} gap="xs">
                    <Select
                        placeholder="Select Class"
                        data={classes}
                        value={selectedClassId}
                        onChange={setSelectedClassId}
                        searchable
                        flex={1}
                        miw={isMobile ? '100%' : 200}
                    />
                    <DateInput
                        value={selectedDate}
                        onChange={(d) => d && setSelectedDate(d)}
                        placeholder="Date"
                        flex={1}
                        miw={isMobile ? '100%' : 150}
                    />
                </Group>
                <Group justify={isMobile ? 'space-between' : 'flex-end'} w={isMobile ? '100%' : 'auto'}>
                    <Button variant="default" size="sm" onClick={() => markAll('PRESENT')} flex={isMobile ? 1 : undefined}>All Present</Button>
                    <Button
                        leftSection={<IconDeviceFloppy size={16} />}
                        loading={saveMutation.isPending}
                        onClick={handleSave}
                        disabled={!selectedClassId || students.length === 0}
                        flex={isMobile ? 1 : undefined}
                    >
                        Save
                    </Button>
                </Group>
            </Group>

            {sheetLoading || classesLoading ? (
                <Center p="xl"><Loader /></Center>
            ) : !selectedClassId ? (
                <Center p="xl"><Text c="dimmed">Select a class to mark attendance</Text></Center>
            ) : students.length === 0 ? (
                <Center p="xl"><Text c="dimmed">No students found in this class.</Text></Center>
            ) : (
                isMobile ? (
                    <Stack gap="sm">
                        {students.map(student => {
                            const record = attendanceMap[student.id];
                            const status = record?.status || 'PRESENT';

                            return (
                                <Paper key={student.id} p="sm" withBorder radius="md">
                                    <Group justify="space-between" mb="xs">
                                        <Group gap="sm">
                                            <Avatar src={student.photoUrl} radius="xl" size="md" color="initials">
                                                {student.firstName[0]}{student.lastName[0]}
                                            </Avatar>
                                            <div>
                                                <Text size="sm" fw={600}>{student.firstName} {student.lastName}</Text>
                                                <Text size="xs" c="dimmed">{student.admissionNo}</Text>
                                            </div>
                                        </Group>
                                        {modifiedRecords.has(student.id) ? (
                                            <Badge color="yellow" variant="light">Pending</Badge>
                                        ) : record ? (
                                            <Badge color="green" variant="light">Saved</Badge>
                                        ) : (
                                            <Badge color="gray" variant="light">Unsaved</Badge>
                                        )}
                                    </Group>

                                    <SegmentedControl
                                        fullWidth
                                        size="xs"
                                        value={status}
                                        onChange={(val) => handleStatusChange(student.id, val)}
                                        radius="md"
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
                                </Paper>
                            );
                        })}
                    </Stack>
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
                                const status = record?.status || 'PRESENT';

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
                                            {modifiedRecords.has(student.id) ? (
                                                <Badge color="yellow" variant="light">Pending</Badge>
                                            ) : record ? (
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
                )
            )}
        </Paper>
    );
}
