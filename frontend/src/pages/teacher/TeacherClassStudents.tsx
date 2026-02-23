import { Title, Text, Stack, Card, Group, Avatar, Table, Badge, ActionIcon, LoadingOverlay } from '@mantine/core';
import { IconArrowLeft, IconMessage } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';

interface StudentRosterItem {
    id: string;
    firstName: string;
    lastName: string;
    admissionNo: string;
    rollNo: string | null;
    user: { email: string };
    _count: { attendance: number }; // Absence count
}

export function TeacherClassStudents() {
    const { sectionId } = useParams();
    const navigate = useNavigate();
    const [students, setStudents] = useState<StudentRosterItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudents = async () => {
            if (!sectionId) return;
            try {
                const { data } = await api.get(`/teacher/classes/${sectionId}/students`);
                setStudents(data);
            } catch (error) {
                console.error("Failed to fetch class students", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, [sectionId]);

    return (
        <Stack gap="lg" pos="relative">
            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

            <Group>
                <ActionIcon variant="light" size="lg" onClick={() => navigate('/teacher/classes')}>
                    <IconArrowLeft size={20} />
                </ActionIcon>
                <div>
                    <Title order={2}>Class Roster</Title>
                    <Text c="dimmed">View all students enrolled in this section.</Text>
                </div>
            </Group>

            <Card withBorder radius="md" p={0}>
                {students.length === 0 && !loading ? (
                    <Text p="xl" ta="center" c="dimmed" fs="italic">No students enrolled in this class.</Text>
                ) : (
                    <Table verticalSpacing="sm" striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Student</Table.Th>
                                <Table.Th>Roll No</Table.Th>
                                <Table.Th>Absences</Table.Th>
                                <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {students.map((student) => (
                                <Table.Tr key={student.id}>
                                    <Table.Td>
                                        <Group gap="sm">
                                            <Avatar radius="xl" color="blue">{student.firstName[0]}{student.lastName[0]}</Avatar>
                                            <div>
                                                <Text size="sm" fw={500}>{student.firstName} {student.lastName}</Text>
                                                <Text size="xs" c="dimmed">{student.admissionNo}</Text>
                                            </div>
                                        </Group>
                                    </Table.Td>
                                    <Table.Td>{student.rollNo || '-'}</Table.Td>
                                    <Table.Td>
                                        {student._count.attendance > 3 ? (
                                            <Badge color="red" variant="light">{student._count.attendance} absences</Badge>
                                        ) : (
                                            <Badge color="gray" variant="light">{student._count.attendance} absences</Badge>
                                        )}
                                    </Table.Td>
                                    <Table.Td style={{ textAlign: 'right' }}>
                                        <Group gap="xs" justify="flex-end">
                                            <ActionIcon variant="subtle" color="blue" title="Message Parent/Student" onClick={() => navigate('/messages')}>
                                                <IconMessage size={16} />
                                            </ActionIcon>
                                        </Group>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                )}
            </Card>
        </Stack>
    );
}

export default TeacherClassStudents;
