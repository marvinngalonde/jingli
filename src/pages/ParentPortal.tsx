import {
    Box,
    Card,
    Table,
    Group,
    Text,
    Title,
    Avatar,
    Badge,
    Stack,
    Grid,
    Progress,
    rem,
} from '@mantine/core';
import { Calendar, TrendingUp, BookOpen, DollarSign } from 'lucide-react';

const studentInfo = {
    name: 'Alex Thompson',
    class: '10-A',
    rollNo: '2023-045',
    admissionDate: 'Jan 15, 2023',
    avatar: null,
};

const attendanceData = {
    present: 142,
    absent: 8,
    late: 5,
    percentage: '91.6%',
};

const academicData = [
    { subject: 'Mathematics', midterm: '85%', finals: '90%', grade: 'A', teacher: 'Mr. Smith' },
    { subject: 'Science', midterm: '78%', finals: '82%', grade: 'B+', teacher: 'Ms. Johnson' },
    { subject: 'English', midterm: '92%', finals: '88%', grade: 'A-', teacher: 'Mrs. Davis' },
    { subject: 'History', midterm: '75%', finals: '79%', grade: 'B', teacher: 'Mr. Wilson' },
];

const feeStatus = {
    totalFees: 12000,
    paid: 9000,
    outstanding: 3000,
    nextDue: 'Jan 15, 2026',
};

const upcomingEvents = [
    { title: 'Parent-Teacher Meeting', date: 'Jan 10, 2026', time: '2:00 PM' },
    { title: 'Mid-Term Exams Begin', date: 'Jan 15, 2026', time: 'All Day' },
    { title: 'Science Fair', date: 'Jan 20, 2026', time: '10:00 AM' },
];

export default function ParentPortal() {
    return (
        <Box
            style={{
                minHeight: '100vh',
                backgroundColor: '#f0f2f5',
                padding: rem(20),
            }}
        >
            <Box style={{ maxWidth: rem(1200), margin: '0 auto' }}>
                <Title order={2} mb="lg">
                    Parent Portal
                </Title>

                {/* Student Info Card */}
                <Card shadow="sm" padding="lg" radius={2} withBorder mb="md">
                    <Group>
                        <Avatar size="xl" radius="xl" color="navy">
                            {studentInfo.name.substring(0, 2).toUpperCase()}
                        </Avatar>
                        <Box style={{ flex: 1 }}>
                            <Title order={3}>{studentInfo.name}</Title>
                            <Text size="sm" c="dimmed">
                                Class: {studentInfo.class} | Roll No: {studentInfo.rollNo}
                            </Text>
                            <Text size="sm" c="dimmed">
                                Admission Date: {studentInfo.admissionDate}
                            </Text>
                        </Box>
                    </Group>
                </Card>

                <Grid gutter="md">
                    {/* Attendance Summary */}
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Card shadow="sm" padding="lg" radius={2} withBorder>
                            <Group mb="md">
                                <Calendar size={20} color="var(--mantine-color-navy-7)" />
                                <Title order={4}>Attendance Summary</Title>
                            </Group>

                            <Stack gap="md">
                                <Group justify="space-between">
                                    <Text size="sm">Present</Text>
                                    <Text size="sm" fw={600} c="green">
                                        {attendanceData.present} days
                                    </Text>
                                </Group>
                                <Group justify="space-between">
                                    <Text size="sm">Absent</Text>
                                    <Text size="sm" fw={600} c="red">
                                        {attendanceData.absent} days
                                    </Text>
                                </Group>
                                <Group justify="space-between">
                                    <Text size="sm">Late</Text>
                                    <Text size="sm" fw={600} c="orange">
                                        {attendanceData.late} days
                                    </Text>
                                </Group>
                                <Box>
                                    <Group justify="space-between" mb="xs">
                                        <Text size="sm" fw={500}>
                                            Attendance Rate
                                        </Text>
                                        <Text size="sm" fw={600}>
                                            {attendanceData.percentage}
                                        </Text>
                                    </Group>
                                    <Progress value={91.6} color="green" size="md" radius={2} />
                                </Box>
                            </Stack>
                        </Card>
                    </Grid.Col>

                    {/* Fee Status */}
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Card shadow="sm" padding="lg" radius={2} withBorder>
                            <Group mb="md">
                                <DollarSign size={20} color="var(--mantine-color-navy-7)" />
                                <Title order={4}>Fee Status</Title>
                            </Group>

                            <Stack gap="md">
                                <Group justify="space-between">
                                    <Text size="sm">Total Fees</Text>
                                    <Text size="sm" fw={600}>
                                        ${feeStatus.totalFees}
                                    </Text>
                                </Group>
                                <Group justify="space-between">
                                    <Text size="sm">Paid</Text>
                                    <Text size="sm" fw={600} c="green">
                                        ${feeStatus.paid}
                                    </Text>
                                </Group>
                                <Group justify="space-between">
                                    <Text size="sm">Outstanding</Text>
                                    <Text size="sm" fw={600} c="red">
                                        ${feeStatus.outstanding}
                                    </Text>
                                </Group>
                                <Box>
                                    <Group justify="space-between" mb="xs">
                                        <Text size="sm" fw={500}>
                                            Payment Progress
                                        </Text>
                                        <Text size="sm" fw={600}>
                                            75%
                                        </Text>
                                    </Group>
                                    <Progress value={75} color="blue" size="md" radius={2} />
                                </Box>
                                <Text size="xs" c="dimmed">
                                    Next payment due: {feeStatus.nextDue}
                                </Text>
                            </Stack>
                        </Card>
                    </Grid.Col>

                    {/* Academic Performance */}
                    <Grid.Col span={{ base: 12, lg: 8 }}>
                        <Card shadow="sm" padding="lg" radius={2} withBorder>
                            <Group mb="md">
                                <BookOpen size={20} color="var(--mantine-color-navy-7)" />
                                <Title order={4}>Academic Performance</Title>
                            </Group>

                            <Box style={{ overflowX: 'auto' }}>
                                <Table>
                                    <Table.Thead>
                                        <Table.Tr style={{ backgroundColor: '#f8f9fa' }}>
                                            <Table.Th>Subject</Table.Th>
                                            <Table.Th>Teacher</Table.Th>
                                            <Table.Th>Midterm</Table.Th>
                                            <Table.Th>Finals</Table.Th>
                                            <Table.Th>Grade</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {academicData.map((subject) => (
                                            <Table.Tr key={subject.subject}>
                                                <Table.Td>
                                                    <Text size="sm" fw={500}>
                                                        {subject.subject}
                                                    </Text>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Text size="sm">{subject.teacher}</Text>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Text size="sm">{subject.midterm}</Text>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Text size="sm">{subject.finals}</Text>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Badge color="blue" variant="light" size="sm" radius={2}>
                                                        {subject.grade}
                                                    </Badge>
                                                </Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>
                            </Box>
                        </Card>
                    </Grid.Col>

                    {/* Upcoming Events */}
                    <Grid.Col span={{ base: 12, lg: 4 }}>
                        <Card shadow="sm" padding="lg" radius={2} withBorder>
                            <Group mb="md">
                                <TrendingUp size={20} color="var(--mantine-color-navy-7)" />
                                <Title order={4}>Upcoming Events</Title>
                            </Group>

                            <Stack gap="sm">
                                {upcomingEvents.map((event, idx) => (
                                    <Box
                                        key={idx}
                                        p="sm"
                                        style={{
                                            backgroundColor: '#f9fafb',
                                            borderRadius: rem(4),
                                        }}
                                    >
                                        <Text size="sm" fw={600}>
                                            {event.title}
                                        </Text>
                                        <Text size="xs" c="dimmed">
                                            {event.date} at {event.time}
                                        </Text>
                                    </Box>
                                ))}
                            </Stack>
                        </Card>
                    </Grid.Col>
                </Grid>
            </Box>
        </Box>
    );
}
