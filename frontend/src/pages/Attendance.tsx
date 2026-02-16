import { Tabs, Button, Group, Text, Select, Table, Avatar, Badge, SegmentedControl, Paper, Grid, RingProgress, Center, Stack } from '@mantine/core';
import { IconCalendar, IconCheck, IconHistory, IconDeviceFloppy } from '@tabler/icons-react';
import { PageHeader } from '../components/common/PageHeader';
import { useState } from 'react';
import { DatePickerInput } from '@mantine/dates'; // Make sure you have @mantine/dates installed or mock it

// --- Mock Data ---
interface StudentAttendance {
    id: string;
    rollNo: string;
    name: string;
    avatar: string;
    status: 'Present' | 'Absent' | 'Late' | 'Excuse';
}

const mockClassStudents: StudentAttendance[] = [
    { id: '1', rollNo: '10A01', name: 'Alice Johnson', avatar: 'AJ', status: 'Present' },
    { id: '2', rollNo: '10A02', name: 'Bob Smith', avatar: 'BS', status: 'Present' },
    { id: '3', rollNo: '10A03', name: 'Charlie Brown', avatar: 'CB', status: 'Absent' },
    { id: '4', rollNo: '10A04', name: 'David Wilson', avatar: 'DW', status: 'Late' },
    { id: '5', rollNo: '10A05', name: 'Eva Green', avatar: 'EG', status: 'Present' },
    { id: '6', rollNo: '10A06', name: 'Frank White', avatar: 'FW', status: 'Present' },
];

const stats = {
    present: 4,
    absent: 1,
    late: 1,
    total: 6
};

export default function Attendance() {
    const [activeTab, setActiveTab] = useState<string | null>('daily');
    const [date, setDate] = useState<Date | null>(new Date());
    const [students, setStudents] = useState<StudentAttendance[]>(mockClassStudents);
    const [selectedClass, setSelectedClass] = useState<string | null>('Grade 10A');

    const handleStatusChange = (id: string, newStatus: string) => {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, status: newStatus as any } : s));
    };

    const DailyRegisterTab = () => (
        <>
            <Paper p="md" mb="lg" bg="gray.0" withBorder>
                <Group align="flex-end">
                    <Select
                        label="Select Class"
                        data={['Grade 10A', 'Grade 10B', 'Grade 11A']}
                        value={selectedClass}
                        onChange={setSelectedClass}
                    />
                    <DatePickerInput
                        label="Date"
                        placeholder="Pick date"
                        value={date}
                        onChange={setDate}
                    />
                    <Button variant="light">Fetch Class</Button>
                    <div style={{ flex: 1 }}></div>
                    <Button leftSection={<IconDeviceFloppy size={16} />}>Save Attendance</Button>
                </Group>
            </Paper>

            <Grid mb="lg">
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Table verticalSpacing="sm" withTableBorder>
                        <Table.Thead bg="gray.1">
                            <Table.Tr>
                                <Table.Th>Roll No</Table.Th>
                                <Table.Th>Student Name</Table.Th>
                                <Table.Th>Status</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {students.map((student) => (
                                <Table.Tr key={student.id}>
                                    <Table.Td fw={500}>{student.rollNo}</Table.Td>
                                    <Table.Td>
                                        <Group gap="sm">
                                            <Avatar size="sm" radius="xl" color="blue">{student.avatar}</Avatar>
                                            <Text size="sm" fw={500}>{student.name}</Text>
                                        </Group>
                                    </Table.Td>
                                    <Table.Td>
                                        <SegmentedControl
                                            size="xs"
                                            value={student.status}
                                            onChange={(val) => handleStatusChange(student.id, val)}
                                            data={[
                                                { label: 'Present', value: 'Present' },
                                                { label: 'Absent', value: 'Absent' },
                                                { label: 'Late', value: 'Late' },
                                                { label: 'Excuse', value: 'Excuse' },
                                            ]}
                                            color={
                                                student.status === 'Present' ? 'green' :
                                                    student.status === 'Absent' ? 'red' :
                                                        student.status === 'Late' ? 'orange' : 'gray'
                                            }
                                        />
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Paper withBorder p="md" radius="md">
                        <Text fw={700} mb="md" ta="center">Daily Summary for {selectedClass}</Text>
                        <Center>
                            <RingProgress
                                size={180}
                                thickness={16}
                                roundCaps
                                sections={[
                                    { value: (stats.present / stats.total) * 100, color: 'green', tooltip: 'Present' },
                                    { value: (stats.absent / stats.total) * 100, color: 'red', tooltip: 'Absent' },
                                    { value: (stats.late / stats.total) * 100, color: 'orange', tooltip: 'Late' },
                                ]}
                                label={
                                    <Stack gap={0} align="center">
                                        <Text size="xl" fw={700}>{Math.round((stats.present / stats.total) * 100)}%</Text>
                                        <Text size="xs" c="dimmed">Attendance</Text>
                                    </Stack>
                                }
                            />
                        </Center>
                        <Stack mt="md" gap="xs">
                            <Group justify="space-between">
                                <Group gap="xs"><Badge size="dot" color="green">Present</Badge></Group>
                                <Text fw={700}>{stats.present}</Text>
                            </Group>
                            <Group justify="space-between">
                                <Group gap="xs"><Badge size="dot" color="red">Absent</Badge></Group>
                                <Text fw={700}>{stats.absent}</Text>
                            </Group>
                            <Group justify="space-between">
                                <Group gap="xs"><Badge size="dot" color="orange">Late</Badge></Group>
                                <Text fw={700}>{stats.late}</Text>
                            </Group>
                        </Stack>
                    </Paper>
                </Grid.Col>
            </Grid>
        </>
    );

    const HistoryTab = () => (
        <Paper p="xl" withBorder>
            <Center>
                <Stack align="center">
                    <IconCalendar size={48} color="gray" />
                    <Text c="dimmed">Detailed attendance history calendar view will be implemented here.</Text>
                    <Button variant="light">Download Monthly Report</Button>
                </Stack>
            </Center>
        </Paper>
    );

    return (
        <>
            <PageHeader
                title="Attendance"
                subtitle="Track daily student attendance"
            />

            <Tabs value={activeTab} onChange={setActiveTab} radius="md">
                <Tabs.List mb="md">
                    <Tabs.Tab value="daily" leftSection={<IconCheck size={16} />}>Daily Register</Tabs.Tab>
                    <Tabs.Tab value="history" leftSection={<IconHistory size={16} />}>Attendance History</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="daily">
                    <DailyRegisterTab />
                </Tabs.Panel>

                <Tabs.Panel value="history">
                    <HistoryTab />
                </Tabs.Panel>
            </Tabs>
        </>
    );
}
