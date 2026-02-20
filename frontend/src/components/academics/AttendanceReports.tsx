import { useState, useEffect } from 'react';
import {
    Paper,
    Group,
    Select,
    Loader,
    Text,
    SimpleGrid,
    RingProgress,
    Stack,
    Center,
    Table,
    Badge
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { academicsService } from '../../services/academics';
import { attendanceService } from '../../services/attendanceService';
import type { AttendanceRecord } from '../../types/attendance';

export function AttendanceReports() {
    // State
    const [classes, setClasses] = useState<{ value: string; label: string }[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
        new Date(new Date().setDate(new Date().getDate() - 7)), // 7 days ago
        new Date()
    ]);
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState<AttendanceRecord[]>([]);

    useEffect(() => {
        loadClasses();
    }, []);

    useEffect(() => {
        if (selectedClassId && dateRange[0] && dateRange[1]) {
            loadReport();
        }
    }, [selectedClassId, dateRange]);

    const loadClasses = async () => {
        try {
            const data = await academicsService.getClasses();
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

    const loadReport = async () => {
        if (!selectedClassId || !dateRange[0] || !dateRange[1]) return;
        setLoading(true);
        try {
            const data = await attendanceService.getAttendanceReport(selectedClassId, dateRange[0], dateRange[1]);
            setRecords(data);
        } catch (error) {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to load report', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    // --- Statistics Calculations ---
    const totalRecords = records.length;

    // Group by Date for Chart
    const chartDataMap: Record<string, { date: string; PRESENT: number; ABSENT: number; LATE: number; EXCUSED: number }> = {};

    records.forEach(r => {
        const dateStr = new Date(r.date).toLocaleDateString();
        if (!chartDataMap[dateStr]) {
            chartDataMap[dateStr] = { date: dateStr, PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0 };
        }
        chartDataMap[dateStr][r.status]++;
    });

    const chartData = Object.values(chartDataMap).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Overall Stats
    const presentCount = records.filter(r => r.status === 'PRESENT').length;
    const absentCount = records.filter(r => r.status === 'ABSENT').length;
    const lateCount = records.filter(r => r.status === 'LATE').length;
    const excusedCount = records.filter(r => r.status === 'EXCUSED').length;

    const attendanceRate = totalRecords > 0 ? Math.round(((presentCount + lateCount + excusedCount) / totalRecords) * 100) : 0;

    // Student Summary (Who has low attendance?)
    const studentStats: Record<string, { name: string; present: number; total: number; absent: number }> = {};
    records.forEach(r => {
        if (!r.student) return; // Should have student relation
        const sid = r.studentId;
        if (!studentStats[sid]) {
            studentStats[sid] = {
                name: `${r.student.firstName} ${r.student.lastName}`,
                present: 0,
                total: 0,
                absent: 0
            };
        }
        studentStats[sid].total++;
        if (r.status === 'PRESENT' || r.status === 'LATE' || r.status === 'EXCUSED') {
            studentStats[sid].present++;
        } else {
            studentStats[sid].absent++;
        }
    });

    const studentList = Object.values(studentStats)
        .sort((a, b) => (a.present / a.total) - (b.present / b.total)) // Sort by lowest attendance first
        .slice(0, 5); // Show top 5 problematic


    return (
        <Stack gap="md">
            <Group>
                <Select
                    placeholder="Select Class"
                    data={classes}
                    value={selectedClassId}
                    onChange={setSelectedClassId}
                    searchable
                    w={250}
                />
                <DatePickerInput
                    type="range"
                    placeholder="Pick dates range"
                    value={dateRange}
                    onChange={setDateRange}
                    w={300}
                />
            </Group>

            {!selectedClassId ? (
                <Center p="xl"><Text c="dimmed">Select a class to view reports</Text></Center>
            ) : loading ? (
                <Center p="xl"><Loader /></Center>
            ) : records.length === 0 ? (
                <Center p="xl"><Text c="dimmed">No attendance data found for this period.</Text></Center>
            ) : (
                <>
                    {/* Summary Cards */}
                    <SimpleGrid cols={{ base: 1, sm: 4 }}>
                        <Paper withBorder p="md" radius="md">
                            <Group>
                                <RingProgress
                                    size={80}
                                    roundCaps
                                    thickness={8}
                                    sections={[{ value: attendanceRate, color: attendanceRate > 75 ? 'green' : 'red' }]}
                                    label={<Center><Text fw={700} size="xl">{attendanceRate}%</Text></Center>}
                                />
                                <div>
                                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Avg Attendance</Text>
                                    <Text size="xs" c="dimmed">Target: 90%</Text>
                                </div>
                            </Group>
                        </Paper>
                        <Paper withBorder p="md" radius="md">
                            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Total Present</Text>
                            <Text fw={700} size="xl" c="green">{presentCount}</Text>
                        </Paper>
                        <Paper withBorder p="md" radius="md">
                            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Total Absent</Text>
                            <Text fw={700} size="xl" c="red">{absentCount}</Text>
                        </Paper>
                        <Paper withBorder p="md" radius="md">
                            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Late / Excused</Text>
                            <Text fw={700} size="xl" c="yellow">{lateCount + excusedCount}</Text>
                        </Paper>
                    </SimpleGrid>

                    {/* Chart */}
                    <Paper p="md" radius="md" withBorder h={400}>
                        <Text mb="md" fw={700}>Attendance Trends</Text>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="PRESENT" stackId="a" fill="#40c057" name="Present" />
                                <Bar dataKey="LATE" stackId="a" fill="#fab005" name="Late" />
                                <Bar dataKey="EXCUSED" stackId="a" fill="#228be6" name="Excused" />
                                <Bar dataKey="ABSENT" stackId="a" fill="#fa5252" name="Absent" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>

                    {/* Low Attendance List */}
                    <Paper p="md" radius="md" withBorder>
                        <Text mb="md" fw={700}>Students with Lowest Attendance (Top 5)</Text>
                        <Table>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Student</Table.Th>
                                    <Table.Th>Present</Table.Th>
                                    <Table.Th>Absent</Table.Th>
                                    <Table.Th>Rate</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {studentList.map(s => {
                                    const rate = Math.round((s.present / s.total) * 100);
                                    return (
                                        <Table.Tr key={s.name}>
                                            <Table.Td>{s.name}</Table.Td>
                                            <Table.Td>{s.present} / {s.total} days</Table.Td>
                                            <Table.Td>{s.absent} days</Table.Td>
                                            <Table.Td>
                                                <Badge color={rate < 75 ? 'red' : rate < 90 ? 'yellow' : 'green'}>{rate}%</Badge>
                                            </Table.Td>
                                        </Table.Tr>
                                    );
                                })}
                            </Table.Tbody>
                        </Table>
                    </Paper>
                </>
            )}
        </Stack>
    );
}
