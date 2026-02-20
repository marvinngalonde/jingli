import { Paper, Title, Center, Text, Stack, ThemeIcon, Group, Badge, SimpleGrid, RingProgress } from '@mantine/core';
import { IconCheckupList, IconCalendar } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { attendanceService } from '../../services/attendanceService';
import type { AttendanceRecord as AttendanceRecordType } from '../../types/attendance';
import { Table } from '@mantine/core';

interface AttendanceRecordProps {
    studentId: string;
}

export function AttendanceRecord({ studentId }: AttendanceRecordProps) {
    const [records, setRecords] = useState<AttendanceRecordType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [studentId]);

    const loadData = async () => {
        try {
            const data = await attendanceService.getStudentAttendance(studentId);
            setRecords(data);
        } catch (error) {
            console.error("Failed to load attendance", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Center p="xl"><Text>Loading attendance...</Text></Center>;
    }

    if (records.length === 0) {
        return (
            <Stack>
                <Paper withBorder p="xl" radius="md">
                    <Center>
                        <Stack align="center" gap="xs">
                            <ThemeIcon size={48} radius="xl" variant="light" color="gray">
                                <IconCheckupList size={24} />
                            </ThemeIcon>
                            <Title order={4}>Attendance Records</Title>
                            <Text c="dimmed" ta="center">No attendance data recorded yet.</Text>
                        </Stack>
                    </Center>
                </Paper>
            </Stack>
        );
    }

    // Stats
    const total = records.length;
    const present = records.filter(r => r.status === 'PRESENT').length;
    const absent = records.filter(r => r.status === 'ABSENT').length;
    const late = records.filter(r => r.status === 'LATE').length;
    const excused = records.filter(r => r.status === 'EXCUSED').length;

    const presentPercentage = total > 0 ? Math.round(((present + late + excused) / total) * 100) : 0;

    return (
        <Stack>
            <SimpleGrid cols={{ base: 1, sm: 3 }}>
                <Paper withBorder p="md" radius="md">
                    <Group>
                        <RingProgress
                            size={80}
                            roundCaps
                            thickness={8}
                            sections={[{ value: presentPercentage, color: 'green' }]}
                            label={
                                <Center>
                                    <Text c="green" fw={700} size="xl">{presentPercentage}%</Text>
                                </Center>
                            }
                        />
                        <div>
                            <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Attendance Rate</Text>
                            <Text fw={700} size="xl">{present + late + excused}/{total}</Text>
                        </div>
                    </Group>
                </Paper>

                <Paper withBorder p="md" radius="md">
                    <Stack gap={0}>
                        <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Present</Text>
                        <Text fw={700} size="xl" c="green">{present}</Text>
                        <Text size="xs" c="dimmed">Late: {late} | Excused: {excused}</Text>
                    </Stack>
                </Paper>

                <Paper withBorder p="md" radius="md">
                    <Stack gap={0}>
                        <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Absent</Text>
                        <Text fw={700} size="xl" c="red">{absent}</Text>
                    </Stack>
                </Paper>
            </SimpleGrid>

            <Paper withBorder radius="md">
                <Table>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Date</Table.Th>
                            <Table.Th>Status</Table.Th>
                            <Table.Th>Remarks</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(record => (
                            <Table.Tr key={record.id}>
                                <Table.Td>
                                    <Group gap="xs">
                                        <IconCalendar size={14} style={{ opacity: 0.5 }} />
                                        <Text size="sm">{new Date(record.date).toLocaleDateString()}</Text>
                                    </Group>
                                </Table.Td>
                                <Table.Td>
                                    <Badge
                                        color={
                                            record.status === 'PRESENT' ? 'green' :
                                                record.status === 'ABSENT' ? 'red' :
                                                    record.status === 'LATE' ? 'yellow' : 'blue'
                                        }
                                    >
                                        {record.status}
                                    </Badge>
                                </Table.Td>
                                <Table.Td>
                                    <Text size="sm" c="dimmed">{record.remarks || '-'}</Text>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </Paper>
        </Stack>
    );
}
