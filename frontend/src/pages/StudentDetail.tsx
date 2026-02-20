import { useState, useEffect } from 'react';
import {
    Title,
    Text,
    Grid,
    Paper,
    Avatar,
    Group,
    Tabs,
    Button,
    Box,
    Divider,
    Timeline,
    Center,
    ThemeIcon,
    Drawer,
    LoadingOverlay
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    IconId,
    IconMail,
    IconMapPin,
    IconSchool,
    IconCalendar,
    IconPencil,
    IconArrowLeft,
    IconFileAnalytics,
    IconCurrencyDollar,
    IconCheckupList
} from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { studentService } from '../services/studentService';
import type { Student } from '../types/students';

// Common Components
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { ActionMenu } from '../components/common/ActionMenu';

// Sub-components
import { HealthRecord } from '../components/students/HealthRecord';
import { DisciplinaryRecord } from '../components/students/DisciplinaryRecord';
import { ECARecord } from '../components/students/ECARecord';
import { GradesRecord } from '../components/students/GradesRecord';
import { AttendanceRecord } from '../components/students/AttendanceRecord';
import { FinanceRecord } from '../components/students/FinanceRecord';
import { StudentForm } from '../components/students/StudentForm';

export default function StudentDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<string | null>('overview');
    const [opened, { open, close }] = useDisclosure(false);
    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadStudent(id);
        }
    }, [id]);

    const loadStudent = async (studentId: string) => {
        setLoading(true);
        try {
            const data = await studentService.getById(studentId);
            setStudent(data);
        } catch (error) {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to load student details', color: 'red' });
            navigate('/students');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (values: any) => {
        if (!student) return;
        try {
            const updated = await studentService.update(student.id, values);
            setStudent(updated);
            notifications.show({ message: 'Profile updated', color: 'green' });
            close();
        } catch (error) {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to update student', color: 'red' });
        }
    };

    if (loading) {
        return <LoadingOverlay visible={true} />;
    }

    if (!student) {
        return <Text>Student not found</Text>;
    }

    return (
        <Box p="md">
            <Button variant="subtle" color="gray" leftSection={<IconArrowLeft size={16} />} mb="md" onClick={() => navigate('/students')}>
                Back to Students
            </Button>

            {/* Header / Profile Card */}
            <Paper p="xl" radius="md" mb="lg" withBorder style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 120,
                    background: 'linear-gradient(135deg, #228be6 0%, #15aabf 100%)',
                    zIndex: 0
                }} />

                <Group align="flex-end" mt={60} style={{ position: 'relative', zIndex: 1 }}>
                    <Avatar
                        src={student.photoUrl}
                        size={120}
                        radius={120}
                        style={{ border: '4px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        color="brand"
                    >
                        {student.firstName[0]}{student.lastName[0]}
                    </Avatar>
                    <div style={{ flex: 1, paddingBottom: 10 }}>
                        <Title order={2}>{student.firstName} {student.lastName}</Title>
                        <Text c="dimmed" size="sm">Admission No: {student.admissionNo}</Text>
                    </div>
                    <Group style={{ paddingBottom: 10 }}>
                        <StatusBadge status={student.status || 'ACTIVE'} size="lg" />
                        <Button variant="light" leftSection={<IconPencil size={18} />} onClick={open}>Edit Profile</Button>
                        <ActionMenu
                            onEdit={open}
                            onDelete={() => { }}
                        />
                    </Group>
                </Group>
            </Paper>

            <Grid>
                {/* LEFT SIDEBAR INFO */}
                <Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
                    <Paper p="md" radius="md" withBorder>
                        <Title order={4} mb="md">Personal Info</Title>

                        <Group gap="sm" mb="sm">
                            <ThemeIcon variant="light" color="gray" size="md">
                                <IconMail size={16} />
                            </ThemeIcon>
                            <div>
                                <Text size="xs" c="dimmed">Email</Text>
                                <Text size="sm">{student.user?.email || 'N/A'}</Text>
                            </div>
                        </Group>
                        {/* 
                        <Group gap="sm" mb="sm">
                            <ThemeIcon variant="light" color="gray" size="md">
                                <IconPhone size={16} />
                            </ThemeIcon>
                            <div>
                                <Text size="xs" c="dimmed">Phone</Text>
                                <Text size="sm">{student.phone || 'N/A'}</Text>
                            </div>
                        </Group> 
                        */}
                        <Group gap="sm" mb="sm">
                            <ThemeIcon variant="light" color="gray" size="md">
                                <IconCalendar size={16} />
                            </ThemeIcon>
                            <div>
                                <Text size="xs" c="dimmed">Date of Birth</Text>
                                <Text size="sm">{student.dob ? new Date(student.dob).toLocaleDateString() : 'N/A'}</Text>
                            </div>
                        </Group>
                        <Group gap="sm" mb="sm">
                            <ThemeIcon variant="light" color="gray" size="md">
                                <IconMapPin size={16} />
                            </ThemeIcon>
                            <div>
                                <Text size="xs" c="dimmed">Address</Text>
                                <Text size="sm">{student.address || 'N/A'}</Text>
                            </div>
                        </Group>

                        <Divider my="md" />

                        <Title order={4} mb="md">Academic Info</Title>
                        <Group gap="sm" mb="sm">
                            <ThemeIcon variant="light" color="brand" size="md">
                                <IconSchool size={16} />
                            </ThemeIcon>
                            <div>
                                <Text size="xs" c="dimmed">Class</Text>
                                <Text size="sm" fw={600}>{student.section?.classLevel?.name} - {student.section?.name}</Text>
                            </div>
                        </Group>
                        <Group gap="sm" mb="sm">
                            <ThemeIcon variant="light" color="blue" size="md">
                                <IconFileAnalytics size={16} />
                            </ThemeIcon>
                            <div>
                                <Text size="xs" c="dimmed">Roll No / Admission No</Text>
                                <Text size="sm">{student.rollNo || 'N/A'} / {student.admissionNo}</Text>
                            </div>
                        </Group>
                        <Group gap="sm" mb="sm">
                            <ThemeIcon variant="light" color="green" size="md">
                                <IconCalendar size={16} />
                            </ThemeIcon>
                            <div>
                                <Text size="xs" c="dimmed">Enrollment Date</Text>
                                <Text size="sm">{student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString() : 'N/A'}</Text>
                            </div>
                        </Group>

                        {student.guardians && student.guardians.length > 0 && (
                            <>
                                <Divider my="md" />
                                <Title order={4} mb="md">Guardian Info</Title>
                                {student.guardians.map((g: any) => (
                                    <Group gap="sm" mb="sm" key={g.id}>
                                        <ThemeIcon variant="light" color="orange" size="md">
                                            <IconId size={16} />
                                        </ThemeIcon>
                                        <div>
                                            <Text size="xs" c="dimmed">{g.relation}</Text>
                                            <Text size="sm">{g.guardian.firstName} {g.guardian.lastName}</Text>
                                            <Text size="xs" c="dimmed">{g.guardian.phone}</Text>
                                        </div>
                                    </Group>
                                ))}
                            </>
                        )}
                    </Paper>
                </Grid.Col>

                {/* RIGHT TABS CONTENT */}
                <Grid.Col span={{ base: 12, md: 8, lg: 9 }}>
                    <PageHeader title="Student Profile" />
                    <Tabs value={activeTab} onChange={setActiveTab} variant="outline" radius="md">
                        <Tabs.List mb="md">
                            <Tabs.Tab value="overview" leftSection={<IconFileAnalytics size={16} />}>
                                Overview
                            </Tabs.Tab>
                            <Tabs.Tab value="grades" leftSection={<IconSchool size={16} />}>
                                Grades
                            </Tabs.Tab>
                            <Tabs.Tab value="attendance" leftSection={<IconCheckupList size={16} />}>
                                Attendance
                            </Tabs.Tab>
                            <Tabs.Tab value="finance" leftSection={<IconCurrencyDollar size={16} />}>
                                Finance
                            </Tabs.Tab>
                            <Tabs.Tab value="medical" leftSection={<IconCheckupList size={16} />}>
                                Medical
                            </Tabs.Tab>
                            <Tabs.Tab value="disciplinary" leftSection={<IconFileAnalytics size={16} />}>
                                Discipline
                            </Tabs.Tab>
                            <Tabs.Tab value="eca" leftSection={<IconSchool size={16} />}>
                                Activities
                            </Tabs.Tab>
                        </Tabs.List>

                        <Tabs.Panel value="overview">
                            <Grid>
                                <Grid.Col span={12}>
                                    <Paper p="md" withBorder radius="md">
                                        <Title order={5} mb="md">Student Status</Title>
                                        <Text>Student account is active.</Text>
                                        <Text size="sm" c="dimmed" mt="xs">
                                            Enrolled on {student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString() : 'N/A'}
                                        </Text>
                                        {/* TODO: Integrate real Activity Feed and Attendance Stats */}
                                    </Paper>
                                </Grid.Col>
                            </Grid>
                        </Tabs.Panel>

                        <Tabs.Panel value="grades">
                            <GradesRecord />
                        </Tabs.Panel>
                        <Tabs.Panel value="attendance">
                            <AttendanceRecord studentId={student.id} />
                        </Tabs.Panel>
                        <Tabs.Panel value="finance">
                            <FinanceRecord studentId={student.id} />
                        </Tabs.Panel>

                        <Tabs.Panel value="medical">
                            <HealthRecord />
                        </Tabs.Panel>
                        <Tabs.Panel value="disciplinary">
                            <DisciplinaryRecord />
                        </Tabs.Panel>
                        <Tabs.Panel value="eca">
                            <ECARecord />
                        </Tabs.Panel>
                    </Tabs>
                </Grid.Col>
            </Grid>

            <Drawer opened={opened} onClose={close} title="Edit Student" position="right" size="md">
                <Box p={0}>
                    {opened && (
                        <StudentForm
                            initialValues={{
                                firstName: student.firstName,
                                lastName: student.lastName,
                                email: student.user?.email || '',
                                // phone: student.phone, // Not in student DTO yet
                                dob: student.dob ? new Date(student.dob) : undefined,
                                gender: student.gender,
                                address: student.address || '',
                                // grade: student.sectionId, // Need to handle selection logic in form
                                sectionId: student.sectionId,
                                admissionNo: student.admissionNo,
                                rollNo: student.rollNo || '',
                                enrollmentDate: new Date(student.enrollmentDate)
                                // parentName: '', // Complex update logic TODO
                                // parentPhone: '',
                                // parentEmail: ''
                            }}
                            onSubmit={handleUpdate}
                            onCancel={close}
                            isEditing
                        />
                    )}
                </Box>
            </Drawer>
        </Box>
    );
}
