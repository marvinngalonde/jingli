import { useState } from 'react';
import {
    Box,
    Card,
    Table,
    Button,
    Group,
    Text,
    Title,
    Select,
    Badge,
    Checkbox,
    Stack,
    Grid,
    rem,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { Calendar, Download, Users } from 'lucide-react';
import { useEffect } from 'react';
import { attendanceService } from '../services/attendanceService';
import { showErrorNotification } from '../utils/notifications';


function getStatusColor(status: string) {
    switch (status) {
        case 'Present':
            return 'green';
        case 'Absent':
            return 'red';
        case 'Late':
            return 'orange';
        default:
            return 'gray';
    }
}


export default function Attendance() {
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [selectedClass, setSelectedClass] = useState('10A');
    const [attendance, setAttendance] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedDate) {
            fetchAttendance(selectedDate.toISOString().split('T')[0]);
        }
    }, [selectedDate]);

    const fetchAttendance = async (date: string) => {
        try {
            setLoading(true);
            const data = await attendanceService.getByDate(date);
            setAttendance(data || []);
        } catch (error: any) {
            showErrorNotification(error.message || 'Failed to fetch attendance');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'present':
                return 'green';
            case 'absent':
                return 'red';
            case 'late':
                return 'orange';
            case 'excused':
                return 'blue';
            default:
                return 'gray';
        }
    };

    return (
        <Box p={{ base: 'sm', md: 'xl' }}>
            <Group justify="space-between" mb="lg" wrap="wrap">
                <Title order={2}>Attendance Tracking</Title>
                <Group>
                    <Button
                        leftSection={<Download size={16} />}
                        size="sm"
                        radius={2}
                        variant="outline"
                        color="gray"
                    >
                        Export Report
                    </Button>
                </Group>
            </Group>

            {/* Stats Cards */}
            <Grid gutter="md" mb="lg">
                <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
                    <Card shadow="sm" padding="md" radius={2} withBorder>
                        <Group gap="xs">
                            <Users size={20} color="var(--mantine-color-navy-7)" />
                            <Box>
                                <Text size="xs" c="dimmed">
                                    Total Students
                                </Text>
                                <Title order={3}>{attendance.length}</Title>
                            </Box>
                        </Group>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
                    <Card shadow="sm" padding="md" radius={2} withBorder>
                        <Box>
                            <Text size="xs" c="dimmed">
                                Present
                            </Text>
                            <Title order={3} c="green">
                                {attendance.filter(a => a.status === 'present').length}
                            </Title>
                        </Box>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
                    <Card shadow="sm" padding="md" radius={2} withBorder>
                        <Box>
                            <Text size="xs" c="dimmed">
                                Absent
                            </Text>
                            <Title order={3} c="red">
                                {attendance.filter(a => a.status === 'absent').length}
                            </Title>
                        </Box>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
                    <Card shadow="sm" padding="md" radius={2} withBorder>
                        <Box>
                            <Text size="xs" c="dimmed">
                                Attendance Rate
                            </Text>
                            <Title order={3}>
                                {attendance.length > 0
                                    ? `${Math.round((attendance.filter(a => a.status === 'present').length / attendance.length) * 100)}%`
                                    : '0%'}
                            </Title>
                        </Box>
                    </Card>
                </Grid.Col>
            </Grid>

            {/* Filters */}
            <Card shadow="sm" padding="lg" radius={2} withBorder mb="md">
                <Group wrap="wrap">
                    <DatePickerInput
                        label="Date"
                        placeholder="Select date"
                        value={selectedDate}
                        onChange={setSelectedDate}
                        leftSection={<Calendar size={16} />}
                        size="sm"
                        radius={2}
                        style={{ minWidth: rem(200) }}
                    />
                    <Select
                        label="Class"
                        data={['10A', '10B', '11A', '11B', '12A']}
                        value={selectedClass}
                        onChange={(value) => setSelectedClass(value || '10A')}
                        size="sm"
                        radius={2}
                        style={{ minWidth: rem(150) }}
                    />
                    <Button
                        size="sm"
                        radius={2}
                        color="navy.9"
                        style={{ marginTop: rem(24) }}
                    >
                        Mark All Present
                    </Button>
                </Group>
            </Card>

            {/* Attendance Table */}
            <Card shadow="sm" padding="lg" radius={2} withBorder>
                <Title order={4} mb="md">
                    Class {selectedClass} - {selectedDate?.toLocaleDateString()}
                </Title>

                <Box style={{ overflowX: 'auto' }}>
                    <Table highlightOnHover>
                        <Table.Thead>
                            <Table.Tr style={{ backgroundColor: '#f8f9fa' }}>
                                <Table.Th style={{ width: 40 }}>
                                    <Checkbox />
                                </Table.Th>
                                <Table.Th>Student ID</Table.Th>
                                <Table.Th>Name</Table.Th>
                                <Table.Th>Class</Table.Th>
                                <Table.Th>Status</Table.Th>
                                <Table.Th>Check-in Time</Table.Th>
                                <Table.Th>Actions</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {loading ? (
                                <Table.Tr>
                                    <Table.Td colSpan={7} style={{ textAlign: 'center', padding: rem(40) }}>
                                        <Text c="dimmed">Loading attendance...</Text>
                                    </Table.Td>
                                </Table.Tr>
                            ) : attendance.length === 0 ? (
                                <Table.Tr>
                                    <Table.Td colSpan={7} style={{ textAlign: 'center', padding: rem(40) }}>
                                        <Text c="dimmed">No attendance records for this date</Text>
                                    </Table.Td>
                                </Table.Tr>
                            ) : (
                                attendance.map((record) => (
                                    <Table.Tr key={record.id}>
                                        <Table.Td>
                                            <Checkbox />
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm">{record.student?.student_id || '-'}</Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm" fw={500}>
                                                {record.student?.first_name} {record.student?.last_name}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm">{record.class?.class_name || '-'}</Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge color={getStatusColor(record.status)} variant="light" size="sm" radius={2}>
                                                {record.status}
                                            </Badge>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm">{record.check_in_time || '-'}</Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Group gap="xs">
                                                <Button size="xs" variant="subtle" color="green" radius={2}>
                                                    Present
                                                </Button>
                                                <Button size="xs" variant="subtle" color="red" radius={2}>
                                                    Absent
                                                </Button>
                                            </Group>
                                        </Table.Td>
                                    </Table.Tr>
                                ))
                            )}
                        </Table.Tbody>
                    </Table>
                </Box>

                <Group justify="flex-end" mt="md">
                    <Button size="sm" radius={2} color="navy.9">
                        Save Attendance
                    </Button>
                </Group>
            </Card>
        </Box>
    );
}
