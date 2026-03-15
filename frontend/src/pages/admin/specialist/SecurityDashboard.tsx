import React, { useState } from 'react';
import { Container, Grid, Paper, Text, Stack, Card, Group, Button, Badge, ThemeIcon, Table, ActionIcon, ScrollArea } from '@mantine/core';
import { IconShieldCheck, IconUsers, IconUserExclamation, IconCar, IconPlus, IconDeviceTablet } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../services/api';
import { StaffAttendanceModal } from '../../../components/gate/StaffAttendanceModal';
import { StudentLateEntryModal } from '../../../components/gate/StudentLateEntryModal';

import { useNavigate } from 'react-router-dom';

export function SecurityDashboard() {
    const navigate = useNavigate();
    const [staffModalOpen, setStaffModalOpen] = useState(false);
    const [studentLateModalOpen, setStudentLateModalOpen] = useState(false);

    // Fetch Staff Attendance Today
    const { data: staffAttendance = [], isLoading: staffLoading } = useQuery({
        queryKey: ['staff-attendance-today'],
        queryFn: async () => {
            const { data } = await api.get('/attendance/staff/today');
            return data;
        }
    });

    // Fetch Student Late Entries Today
    const { data: lateEntries = [], isLoading: lateLoading } = useQuery({
        queryKey: ['student-late-today'],
        queryFn: async () => {
            const { data } = await api.get('/gate/students/late/today');
            return data;
        }
    });

    // Fetch Expected Visitors Today
    const { data: visitors = [], isLoading: visitorsLoading } = useQuery({
        queryKey: ['visitors-today'],
        queryFn: async () => {
            const { data } = await api.get('/visitors', {
                params: { date: new Date().toISOString() } // simplified
            });
            return data.data || [];
        }
    });

    // Aggregate stats
    const staffOnPremise = staffAttendance.filter((r: any) => !r.checkOutTime).length;
    const staffDeparted = staffAttendance.filter((r: any) => !!r.checkOutTime).length;
    const totalLate = lateEntries.length;
    const activeVisitors = visitors.filter((v: any) => v.status === 'IN').length;

    const stats = [
        { title: 'Staff On Premise', value: staffOnPremise, icon: IconShieldCheck, color: 'green' },
        { title: 'Late Students Today', value: totalLate, icon: IconUserExclamation, color: 'red' },
        { title: 'Active Visitors', value: activeVisitors, icon: IconUsers, color: 'blue' },
        { title: 'Expected Vehicles', value: '4', icon: IconCar, color: 'grape' }, // Placeholder
    ];

    const formatTime = (isoString: string) => {
        if (!isoString) return '--:--';
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <Container size="xl" py="lg">
            <Group justify="space-between" align="center" mb="xl">
                <div>
                    <Text size="xl" fw={700}>Gate Operations</Text>
                    <Text c="dimmed" size="sm">Manage entry and exit for staff, students, and visitors.</Text>
                </div>
                <Group>
                    <Button
                        leftSection={<IconPlus size={16} />}
                        color="red"
                        onClick={() => setStudentLateModalOpen(true)}
                    >
                        Student Late Entry
                    </Button>
                    <Button
                        leftSection={<IconShieldCheck size={16} />}
                        color="green"
                        onClick={() => setStaffModalOpen(true)}
                    >
                        Staff In / Out
                    </Button>
                    <Button
                        leftSection={<IconDeviceTablet size={16} />}
                        variant="light"
                        onClick={() => navigate('/dashboard/gate-kiosk')}
                    >
                        Launch Kiosk Mode
                    </Button>
                </Group>
            </Group>

            <Grid mb="xl">
                {stats.map((stat) => (
                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }} key={stat.title}>
                        <Card shadow="sm" padding="lg" radius="md" withBorder>
                            <Group justify="space-between">
                                <Stack gap="xs">
                                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                        {stat.title}
                                    </Text>
                                    <Text size="xl" fw={700}>
                                        {stat.value}
                                    </Text>
                                </Stack>
                                <ThemeIcon color={stat.color} size="xl" radius="md" variant="light">
                                    <stat.icon size={24} />
                                </ThemeIcon>
                            </Group>
                        </Card>
                    </Grid.Col>
                ))}
            </Grid>

            <Grid>
                {/* Staff Attendance Table */}
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Paper withBorder radius="md" p="md">
                        <Group justify="space-between" mb="md">
                            <Text fw={600} size="lg">Today's Staff Logs</Text>
                            <Badge variant="light">{staffAttendance.length} records</Badge>
                        </Group>
                        <ScrollArea h={300}>
                            <Table striped highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Name</Table.Th>
                                        <Table.Th>Check In</Table.Th>
                                        <Table.Th>Check Out</Table.Th>
                                        <Table.Th>Status</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {staffAttendance.map((log: any) => (
                                        <Table.Tr key={log.id}>
                                            <Table.Td>{log.staff?.firstName} {log.staff?.lastName}</Table.Td>
                                            <Table.Td>{formatTime(log.checkInTime)}</Table.Td>
                                            <Table.Td>{formatTime(log.checkOutTime)}</Table.Td>
                                            <Table.Td>
                                                {log.checkOutTime ? (
                                                    <Badge color="gray">Departed</Badge>
                                                ) : (
                                                    <Badge color="green">On Premise</Badge>
                                                )}
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                    {staffAttendance.length === 0 && (
                                        <Table.Tr>
                                            <Table.Td colSpan={4} align="center">
                                                <Text c="dimmed" py="sm">No staff check-ins today</Text>
                                            </Table.Td>
                                        </Table.Tr>
                                    )}
                                </Table.Tbody>
                            </Table>
                        </ScrollArea>
                    </Paper>
                </Grid.Col>

                {/* Late Students Table */}
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Paper withBorder radius="md" p="md">
                        <Group justify="space-between" mb="md">
                            <Text fw={600} size="lg">Late Students Today</Text>
                            <Badge variant="light" color="red">{lateEntries.length} records</Badge>
                        </Group>
                        <ScrollArea h={300}>
                            <Table striped highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Name</Table.Th>
                                        <Table.Th>Admission No</Table.Th>
                                        <Table.Th>Time</Table.Th>
                                        <Table.Th>Reason</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {lateEntries.map((log: any) => (
                                        <Table.Tr key={log.id}>
                                            <Table.Td>{log.student?.firstName} {log.student?.lastName}</Table.Td>
                                            <Table.Td>{log.student?.admissionNo}</Table.Td>
                                            <Table.Td fw={500} c="red">{formatTime(log.arrivalTime)}</Table.Td>
                                            <Table.Td>{log.reason}</Table.Td>
                                        </Table.Tr>
                                    ))}
                                    {lateEntries.length === 0 && (
                                        <Table.Tr>
                                            <Table.Td colSpan={4} align="center">
                                                <Text c="dimmed" py="sm">No late students today</Text>
                                            </Table.Td>
                                        </Table.Tr>
                                    )}
                                </Table.Tbody>
                            </Table>
                        </ScrollArea>
                    </Paper>
                </Grid.Col>
            </Grid>

            {/* Modals */}
            <StaffAttendanceModal opened={staffModalOpen} onClose={() => setStaffModalOpen(false)} />
            <StudentLateEntryModal opened={studentLateModalOpen} onClose={() => setStudentLateModalOpen(false)} />
        </Container>
    );
}
