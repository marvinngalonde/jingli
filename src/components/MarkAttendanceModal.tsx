import {
    Modal,
    Select,
    Button,
    Group,
    Stack,
    Table,
    Checkbox,
    Text,
    Badge,
    rem,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { attendanceService } from '../services/attendanceService';
import { studentService } from '../services/studentService';
import { showSuccessNotification, showErrorNotification } from '../utils/notifications';

interface Student {
    id: string;
    student_id: string;
    profile?: {
        full_name: string;
    };
}

interface AttendanceRecord {
    studentId: string;
    studentName: string;
    status: 'present' | 'absent' | 'late';
}

interface MarkAttendanceModalProps {
    opened: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function MarkAttendanceModal({ opened, onClose, onSuccess }: MarkAttendanceModalProps) {
    const [date, setDate] = useState<Date>(new Date());
    const [classFilter, setClassFilter] = useState<string>('');
    const [students, setStudents] = useState<Student[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (opened) {
            fetchStudents();
        }
    }, [opened]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const data = await studentService.getAll();
            setStudents(data || []);

            // Initialize attendance records
            const initialAttendance: AttendanceRecord[] = (data || []).map(student => ({
                studentId: student.id,
                studentName: student.profile?.full_name || 'Unknown',
                status: 'present' as const,
            }));
            setAttendance(initialAttendance);
        } catch (error: any) {
            showErrorNotification(error.message || 'Failed to fetch students');
        } finally {
            setLoading(false);
        }
    };

    const updateAttendanceStatus = (studentId: string, status: 'present' | 'absent' | 'late') => {
        setAttendance(prev =>
            prev.map(record =>
                record.studentId === studentId ? { ...record, status } : record
            )
        );
    };

    const markAllPresent = () => {
        setAttendance(prev => prev.map(record => ({ ...record, status: 'present' as const })));
    };

    const markAllAbsent = () => {
        setAttendance(prev => prev.map(record => ({ ...record, status: 'absent' as const })));
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);

            // Create attendance records for all students
            const attendanceRecords = attendance.map(record => ({
                student_id: record.studentId,
                date: date.toISOString().split('T')[0],
                status: record.status,
                remarks: null,
            }));

            await attendanceService.bulkMarkAttendance(attendanceRecords);

            showSuccessNotification(`Attendance marked for ${attendance.length} students!`);
            onSuccess?.();
            handleClose();
        } catch (error: any) {
            showErrorNotification(error.message || 'Failed to mark attendance');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setDate(new Date());
        setClassFilter('');
        setAttendance([]);
        onClose();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'present':
                return 'green';
            case 'absent':
                return 'red';
            case 'late':
                return 'yellow';
            default:
                return 'gray';
        }
    };

    const presentCount = attendance.filter(r => r.status === 'present').length;
    const absentCount = attendance.filter(r => r.status === 'absent').length;
    const lateCount = attendance.filter(r => r.status === 'late').length;

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            title="Mark Attendance"
            size="xl"
        >
            <Stack gap="md">
                <Group grow>
                    <DatePickerInput
                        label="Date"
                        placeholder="Select date"
                        value={date}
                        onChange={(val) => setDate(val || new Date())}
                        required
                        size="sm"
                        radius={2}
                        leftSection={<Calendar size={16} />}
                    />
                    <Select
                        label="Class Filter"
                        placeholder="All classes"
                        value={classFilter}
                        onChange={(val) => setClassFilter(val || '')}
                        data={['All', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5']}
                        size="sm"
                        radius={2}
                    />
                </Group>

                {/* Quick Actions */}
                <Group>
                    <Button size="xs" variant="light" color="green" onClick={markAllPresent}>
                        Mark All Present
                    </Button>
                    <Button size="xs" variant="light" color="red" onClick={markAllAbsent}>
                        Mark All Absent
                    </Button>
                </Group>

                {/* Summary */}
                <Group>
                    <Badge color="green" variant="light">Present: {presentCount}</Badge>
                    <Badge color="red" variant="light">Absent: {absentCount}</Badge>
                    <Badge color="yellow" variant="light">Late: {lateCount}</Badge>
                    <Badge color="gray" variant="light">Total: {attendance.length}</Badge>
                </Group>

                {/* Students Table */}
                <div style={{ maxHeight: rem(400), overflowY: 'auto' }}>
                    <Table striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Student Name</Table.Th>
                                <Table.Th>Present</Table.Th>
                                <Table.Th>Absent</Table.Th>
                                <Table.Th>Late</Table.Th>
                                <Table.Th>Status</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {loading ? (
                                <Table.Tr>
                                    <Table.Td colSpan={5} style={{ textAlign: 'center' }}>
                                        <Text c="dimmed">Loading students...</Text>
                                    </Table.Td>
                                </Table.Tr>
                            ) : attendance.length === 0 ? (
                                <Table.Tr>
                                    <Table.Td colSpan={5} style={{ textAlign: 'center' }}>
                                        <Text c="dimmed">No students found</Text>
                                    </Table.Td>
                                </Table.Tr>
                            ) : (
                                attendance.map((record) => (
                                    <Table.Tr key={record.studentId}>
                                        <Table.Td>
                                            <Text size="sm" fw={500}>{record.studentName}</Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Checkbox
                                                checked={record.status === 'present'}
                                                onChange={() => updateAttendanceStatus(record.studentId, 'present')}
                                                color="green"
                                            />
                                        </Table.Td>
                                        <Table.Td>
                                            <Checkbox
                                                checked={record.status === 'absent'}
                                                onChange={() => updateAttendanceStatus(record.studentId, 'absent')}
                                                color="red"
                                            />
                                        </Table.Td>
                                        <Table.Td>
                                            <Checkbox
                                                checked={record.status === 'late'}
                                                onChange={() => updateAttendanceStatus(record.studentId, 'late')}
                                                color="yellow"
                                            />
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge color={getStatusColor(record.status)} size="sm">
                                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                            </Badge>
                                        </Table.Td>
                                    </Table.Tr>
                                ))
                            )}
                        </Table.Tbody>
                    </Table>
                </div>

                <Group justify="flex-end" mt="md">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        size="sm"
                        radius={2}
                        color="gray"
                        disabled={submitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        size="sm"
                        radius={2}
                        color="navy.9"
                        loading={submitting}
                        disabled={loading || attendance.length === 0}
                    >
                        Save Attendance
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
