import { useState } from 'react';
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
    ThemeIcon
} from '@mantine/core';
import {
    IconId,
    IconPhone,
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
import { useNavigate } from 'react-router-dom'; // Removed unused useParams

// Common Components
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { ActionMenu } from '../components/common/ActionMenu';

// Sub-components
import { HealthRecord } from '../components/students/HealthRecord';
import { DisciplinaryRecord } from '../components/students/DisciplinaryRecord';
import { ECARecord } from '../components/students/ECARecord';

export default function StudentDetail() {
    // const { id } = useParams(); // Unused for now
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<string | null>('overview');

    // Mock Data
    const student = {
        id: '1',
        first_name: 'Alice',
        last_name: 'Johnson',
        email: 'alice@example.com',
        phone: '+1 234 567 890',
        address: '123 Main St, Springfield',
        dob: '2008-05-15',
        class: { name: 'Grade 10-A' },
        status: 'active',
        parent: { name: 'Robert Johnson', phone: '+1 987 654 321' },
        avatar_url: null
    };

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
                        src={student.avatar_url}
                        size={120}
                        radius={120}
                        style={{ border: '4px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        color="brand"
                    >
                        {student.first_name[0]}{student.last_name[0]}
                    </Avatar>
                    <div style={{ flex: 1, paddingBottom: 10 }}>
                        <Title order={2}>{student.first_name} {student.last_name}</Title>
                        <Text c="dimmed" size="sm">Student ID: #ST-2024-001</Text>
                    </div>
                    <Group style={{ paddingBottom: 10 }}>
                        <StatusBadge status={student.status} size="lg" />
                        <Button variant="light" leftSection={<IconPencil size={18} />}>Edit Profile</Button>
                        <ActionMenu
                            onEdit={() => { }}
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
                                <Text size="sm">{student.email}</Text>
                            </div>
                        </Group>
                        <Group gap="sm" mb="sm">
                            <ThemeIcon variant="light" color="gray" size="md">
                                <IconPhone size={16} />
                            </ThemeIcon>
                            <div>
                                <Text size="xs" c="dimmed">Phone</Text>
                                <Text size="sm">{student.phone}</Text>
                            </div>
                        </Group>
                        <Group gap="sm" mb="sm">
                            <ThemeIcon variant="light" color="gray" size="md">
                                <IconCalendar size={16} />
                            </ThemeIcon>
                            <div>
                                <Text size="xs" c="dimmed">Date of Birth</Text>
                                <Text size="sm">{student.dob}</Text>
                            </div>
                        </Group>
                        <Group gap="sm" mb="sm">
                            <ThemeIcon variant="light" color="gray" size="md">
                                <IconMapPin size={16} />
                            </ThemeIcon>
                            <div>
                                <Text size="xs" c="dimmed">Address</Text>
                                <Text size="sm">{student.address}</Text>
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
                                <Text size="sm" fw={600}>{student.class.name}</Text>
                            </div>
                        </Group>
                        <Group gap="sm" mb="sm">
                            <ThemeIcon variant="light" color="orange" size="md">
                                <IconId size={16} />
                            </ThemeIcon>
                            <div>
                                <Text size="xs" c="dimmed">Guardian</Text>
                                <Text size="sm">{student.parent.name}</Text>
                                <Text size="xs" c="dimmed">{student.parent.phone}</Text>
                            </div>
                        </Group>
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
                                <Grid.Col span={6}>
                                    <Paper p="md" withBorder radius="md">
                                        <Title order={5} mb="md">Recent Activity</Title>
                                        <Timeline active={1} bulletSize={24} lineWidth={2}>
                                            <Timeline.Item bullet={<IconSchool size={12} />} title="Term 1 Grades Published">
                                                <Text c="dimmed" size="xs" mt={4}>2 hours ago</Text>
                                            </Timeline.Item>
                                            <Timeline.Item bullet={<IconCurrencyDollar size={12} />} title="Tuition Fee Paid" lineVariant="dashed">
                                                <Text c="dimmed" size="xs" mt={4}>1 day ago</Text>
                                            </Timeline.Item>
                                            <Timeline.Item title="Absent from Math Class">
                                                <Text c="dimmed" size="xs" mt={4}>3 days ago</Text>
                                            </Timeline.Item>
                                        </Timeline>
                                    </Paper>
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <Paper p="md" withBorder radius="md">
                                        <Title order={5} mb="xl">Attendance Overview</Title>
                                        {/* Placeholder for chart/heatmap */}
                                        <Center h={100} bg="gray.1" style={{ borderRadius: 8 }}>
                                            <Text c="dimmed">Attendance Chart Placeholder</Text>
                                        </Center>
                                        <Group mt="md" grow>
                                            <Box>
                                                <Text size="xl" fw={700} c="brand">92%</Text>
                                                <Text size="xs" c="dimmed">Present</Text>
                                            </Box>
                                            <Box>
                                                <Text size="xl" fw={700} c="red">4</Text>
                                                <Text size="xs" c="dimmed">Absent</Text>
                                            </Box>
                                        </Group>
                                    </Paper>
                                </Grid.Col>
                            </Grid>
                        </Tabs.Panel>

                        {/* Other Panels Placeholder */}
                        <Tabs.Panel value="grades">
                            <Paper p="xl" withBorder radius="md"><Text c="dimmed" ta="center">Grades Module Loading...</Text></Paper>
                        </Tabs.Panel>
                        <Tabs.Panel value="attendance">
                            <Paper p="xl" withBorder radius="md"><Text c="dimmed" ta="center">Detailed Attendance Log</Text></Paper>
                        </Tabs.Panel>
                        <Tabs.Panel value="finance">
                            <Paper p="xl" withBorder radius="md"><Text c="dimmed" ta="center">Invoice & Payment History</Text></Paper>
                        </Tabs.Panel>
                    </Tabs>
                </Grid.Col>
            </Grid>
        </Box>
    );
}
