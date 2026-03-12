import { Title, Text, Stack, Card, Group, Avatar, Table, Badge, ActionIcon, LoadingOverlay, Button, ScrollArea } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconArrowLeft, IconMessage, IconPrinter } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
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
    const isMobile = useMediaQuery('(max-width: 48em)');
    const { data: students = [], isLoading: loadingStudents } = useQuery({
        queryKey: ['teacherClassStudents', sectionId],
        queryFn: async () => {
            const { data } = await api.get(`/teacher/classes/${sectionId}/students`);
            return data.data ? data.data : data;
        },
        enabled: !!sectionId
    });

    const { data: classesData = [], isLoading: loadingClasses } = useQuery({
        queryKey: ['teacherClasses'],
        queryFn: () => api.get('/teacher/classes').then(res => res.data)
    });

    const loading = loadingStudents || loadingClasses;

    const className = useMemo(() => {
        const thisClass = classesData.find((c: any) => c.section.id === sectionId);
        return thisClass ? `${thisClass.section.classLevel.name} ${thisClass.section.classLevel.level ?? ""} ${thisClass.section.name}` : '';
    }, [classesData, sectionId]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <Stack gap="lg" pos="relative" mb="xl">
            {/* Print styles injected directly */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    .no-print { display: none !important; }
                    .print-only { display: block !important; }
                    body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .mantine-AppShell-navbar, .mantine-AppShell-header { display: none !important; }
                    .mantine-AppShell-main { padding: 0 !important; width: 100% !important; margin: 0 !important; }
                    @page { margin: 20mm; }
                }
            `}} />

            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

            <Group justify="space-between" align="center" className="no-print">
                <Group gap="sm">
                    <ActionIcon variant="light" size="lg" onClick={() => navigate('/portal/classes')}>
                        <IconArrowLeft size={20} />
                    </ActionIcon>
                    <div>
                        <Title order={isMobile ? 4 : 2}>Class Roster</Title>
                        <Text c="dimmed" size="xs">Students in {className || 'this section'}.</Text>
                    </div>
                </Group>
                <Button leftSection={<IconPrinter size={16} />} variant="light" size={isMobile ? "xs" : "sm"} onClick={handlePrint}>
                    {isMobile ? "Print" : "Print / PDF"}
                </Button>
            </Group>

            {/* Print Header */}
            <div className="print-only" style={{ display: 'none', marginBottom: '20px' }}>
                <Title order={2}>Class Roster: {className}</Title>
                <Text>Generated on {new Date().toLocaleDateString()}</Text>
                <Text mt="sm">Total Students: {students.length}</Text>
            </div>

            <Card withBorder radius="md" p={0}>
                {students.length === 0 && !loading ? (
                    <Text p="xl" ta="center" c="dimmed" fs="italic">No students enrolled in this class.</Text>
                ) : (
                    <ScrollArea h={isMobile ? 'calc(100vh - 200px)' : 'calc(100vh - 300px)'} mih={300}>
                        {isMobile ? (
                            <Stack gap="sm" p="xs">
                                {students.map((student: any) => (
                                    <Card key={student.id} withBorder radius="md" p="md">
                                        <Group justify="space-between" align="center">
                                            <Group gap="sm">
                                                <Avatar radius="xl" color="blue">{student.firstName[0]}{student.lastName[0]}</Avatar>
                                                <div>
                                                    <Text size="sm" fw={600}>{student.firstName} {student.lastName}</Text>
                                                    <Text size="xs" c="dimmed">Adm: {student.admissionNo}</Text>
                                                </div>
                                            </Group>
                                            <Button variant="subtle" size="xs" onClick={() => navigate('/portal/discussions')}>
                                                <IconMessage size={16} />
                                            </Button>
                                        </Group>
                                        <Group justify="space-between" mt="sm">
                                            <Text size="xs" c="dimmed">Roll No: {student.rollNo || '-'}</Text>
                                            {student._count.attendance > 3 ? (
                                                <Badge color="red" variant="light" size="sm">{student._count.attendance} absences</Badge>
                                            ) : (
                                                <Badge color="gray" variant="light" size="sm">{student._count.attendance} absences</Badge>
                                            )}
                                        </Group>
                                    </Card>
                                ))}
                            </Stack>
                        ) : (
                            <Table verticalSpacing="sm" striped highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Student</Table.Th>
                                        <Table.Th>Admission No</Table.Th>
                                        <Table.Th>Roll No</Table.Th>
                                        <Table.Th>Absences</Table.Th>
                                        <Table.Th style={{ textAlign: 'right' }} className="no-print">Actions</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {students.map((student: any) => (
                                        <Table.Tr key={student.id}>
                                            <Table.Td>
                                                <Group gap="sm">
                                                    <Avatar radius="xl" color="blue" className="no-print">{student.firstName[0]}{student.lastName[0]}</Avatar>
                                                    <div>
                                                        <Text size="sm" fw={500}>{student.firstName} {student.lastName}</Text>
                                                    </div>
                                                </Group>
                                            </Table.Td>
                                            <Table.Td>{student.admissionNo}</Table.Td>
                                            <Table.Td>{student.rollNo || '-'}</Table.Td>
                                            <Table.Td>
                                                {student._count.attendance > 3 ? (
                                                    <Badge color="red" variant="light">{student._count.attendance} absences</Badge>
                                                ) : (
                                                    <Badge color="gray" variant="light">{student._count.attendance} absences</Badge>
                                                )}
                                            </Table.Td>
                                            <Table.Td style={{ textAlign: 'right' }} className="no-print">
                                                <Group gap="xs" justify="flex-end">
                                                    <Button variant="subtle" size="xs" leftSection={<IconMessage size={14} />} onClick={() => navigate('/portal/discussions')}>
                                                        Message
                                                    </Button>
                                                </Group>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        )}
                    </ScrollArea>
                )}
            </Card>
        </Stack>
    );
}

export default TeacherClassStudents;
