import { Title, Text, Stack, Card, Group, Select, LoadingOverlay, Table, Badge, RingProgress, SimpleGrid, ThemeIcon } from '@mantine/core';
import { IconUsers, IconAward } from '@tabler/icons-react';
import { useAuth } from '../../../context/AuthContext';
import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { format } from 'date-fns';

interface Child {
    id: string;
    firstName: string;
    lastName: string;
    admissionNo: string;
}

interface PerformanceData {
    attendancePercentage: number;
    totalClasses: number;
    attendedClasses: number;
    recentGrades: {
        id: string;
        submittedAt: string;
        marks: number | null;
        feedback: string | null;
        assignment: {
            title: string;
            maxMarks: number;
            subject: { name: string; code: string };
        }
    }[];
}

export function ParentPerformance() {
    const { } = useAuth();
    const [children, setChildren] = useState<Child[]>([]);
    const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
    const [data, setData] = useState<PerformanceData>({ attendancePercentage: 0, totalClasses: 0, attendedClasses: 0, recentGrades: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChildren = async () => {
            try {
                const res = await api.get('/parent/children');
                setChildren(res.data);
                if (res.data.length > 0) {
                    setSelectedChildId(res.data[0].id);
                } else {
                    setLoading(false);
                }
            } catch (error) {
                console.error("Failed to fetch children", error);
                setLoading(false);
            }
        };
        fetchChildren();
    }, []);

    useEffect(() => {
        if (!selectedChildId) return;
        const fetchPerformance = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/parent/performance/${selectedChildId}`);
                setData(res.data);
            } catch (error) {
                console.error("Failed to fetch performance stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPerformance();
    }, [selectedChildId]);

    return (
        <Stack gap="lg" pos="relative">
            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

            <Group justify="space-between" align="flex-start">
                <div>
                    <Title order={2}>Performance & Attendance</Title>
                    <Text c="dimmed">Track your child's academic progress and attendance record.</Text>
                </div>

                {children.length > 0 && (
                    <Select
                        leftSection={<IconUsers size={16} />}
                        placeholder="Select Child"
                        data={children.map(c => ({ value: c.id, label: `${c.firstName} ${c.lastName}` }))}
                        value={selectedChildId}
                        onChange={setSelectedChildId}
                        style={{ width: 250 }}
                    />
                )}
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <Card withBorder radius="md" p="md">
                    <Group wrap="nowrap" gap="xl">
                        <RingProgress
                            size={120}
                            roundCaps
                            thickness={10}
                            sections={[{ value: data.attendancePercentage, color: data.attendancePercentage >= 90 ? 'teal' : data.attendancePercentage >= 75 ? 'yellow' : 'red' }]}
                            label={
                                <Text ta="center" size="xl" fw={700}>
                                    {Math.round(data.attendancePercentage)}%
                                </Text>
                            }
                        />
                        <div>
                            <Text tt="uppercase" fz="xs" c="dimmed" fw={700}>Overall Attendance</Text>
                            <Text size="lg" fw={500} mt="xs">
                                {data.attendedClasses} / {data.totalClasses} classes attended
                            </Text>
                            <Group gap="xs" mt="sm">
                                <Badge color="teal" variant="light">Present: {data.attendedClasses}</Badge>
                                <Badge color="red" variant="light">Absent: {data.totalClasses - data.attendedClasses}</Badge>
                            </Group>
                        </div>
                    </Group>
                </Card>

                <Card withBorder radius="md" p="md">
                    <Group justify="space-between" mb="xs">
                        <Text tt="uppercase" fz="xs" c="dimmed" fw={700}>Academic Standing</Text>
                        <ThemeIcon variant="light" color="blue" size="lg" radius="md">
                            <IconAward size={20} />
                        </ThemeIcon>
                    </Group>
                    <Text size="sm" c="dimmed" mb="md">General performance overview based on recent grades.</Text>
                    <Group grow>
                        <Stack gap={0}>
                            <Text size="2xl" fw={700} c="blue">{data.recentGrades.length}</Text>
                            <Text size="xs" c="dimmed">Assignments Graded</Text>
                        </Stack>
                    </Group>
                </Card>
            </SimpleGrid>

            <Card withBorder radius="md" p={0}>
                <div style={{ padding: 'var(--mantine-spacing-md)' }}>
                    <Title order={4}>Recent Grades</Title>
                </div>

                {data.recentGrades.length === 0 && !loading ? (
                    <Text p="xl" ta="center" c="dimmed" fs="italic">No recent grades available.</Text>
                ) : (
                    <Table verticalSpacing="md" striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Assignment</Table.Th>
                                <Table.Th>Subject</Table.Th>
                                <Table.Th>Score</Table.Th>
                                <Table.Th>Feedback</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {data.recentGrades.map((s) => (
                                <Table.Tr key={s.id}>
                                    <Table.Td>
                                        <Text size="sm" fw={500}>{s.assignment.title}</Text>
                                        <Text size="xs" c="dimmed">Submitted: {format(new Date(s.submittedAt), 'MMM dd, yyyy')}</Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Badge variant="light" color="blue">{s.assignment.subject.name}</Badge>
                                    </Table.Td>
                                    <Table.Td>
                                        <Group gap="xs">
                                            <IconAward size={16} color="green" />
                                            <Text fw={700} c="green.7">{s.marks !== null ? `${s.marks} / ${s.assignment.maxMarks}` : 'N/A'}</Text>
                                        </Group>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="sm" fs={s.feedback ? 'normal' : 'italic'} c={s.feedback ? 'dark' : 'dimmed'}>
                                            {s.feedback || '-'}
                                        </Text>
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

export default ParentPerformance;
