import { Paper, Table, Avatar, Group, Text, Button } from '@mantine/core';
import { IconPencil } from '@tabler/icons-react';

interface SubjectAssignment {
    subject: string;
    teacherName: string;
    email: string;
    weeklyHours: number;
}

const mockAssignments: SubjectAssignment[] = [
    { subject: 'Mathematics', teacherName: 'Sarah Connor', email: 'sarah@example.com', weeklyHours: 5 },
    { subject: 'Physics', teacherName: 'Ellen Ripley', email: 'ellen@example.com', weeklyHours: 4 },
    { subject: 'Chemistry', teacherName: 'Kyle Reese', email: 'kyle@example.com', weeklyHours: 4 },
    { subject: 'History', teacherName: 'Marty McFly', email: 'marty@example.com', weeklyHours: 3 },
    { subject: 'English', teacherName: 'James Cameron', email: 'james@example.com', weeklyHours: 5 },
    { subject: 'Physical Ed', teacherName: 'John Rambo', email: 'john@example.com', weeklyHours: 2 },
];

export function SubjectTeacherList() {
    return (
        <Paper withBorder radius="md">
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Subject</Table.Th>
                        <Table.Th>Assigned Teacher</Table.Th>
                        <Table.Th>Weekly Hours</Table.Th>
                        <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {mockAssignments.map((row) => (
                        <Table.Tr key={row.subject}>
                            <Table.Td fw={600}>{row.subject}</Table.Td>
                            <Table.Td>
                                <Group gap="sm">
                                    <Avatar size={30} radius="xl" color="blue">{row.teacherName[0]}</Avatar>
                                    <div>
                                        <Text size="sm" fw={500}>{row.teacherName}</Text>
                                        <Text size="xs" c="dimmed">{row.email}</Text>
                                    </div>
                                </Group>
                            </Table.Td>
                            <Table.Td>{row.weeklyHours} hrs</Table.Td>
                            <Table.Td>
                                <Button variant="subtle" size="xs" leftSection={<IconPencil size={14} />}>
                                    Assign
                                </Button>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </Paper>
    );
}
