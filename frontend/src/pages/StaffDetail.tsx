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
    ThemeIcon,
    Drawer
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    IconPhone,
    IconMail,
    IconMapPin,
    IconSchool,
    IconCalendar,
    IconPencil,
    IconArrowLeft,
    IconFileAnalytics,
    IconCurrencyDollar,
    IconCheckupList,
    IconBriefcase
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';

// Common Components
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { ActionMenu } from '../components/common/ActionMenu';

// Sub-components
import { PayrollRecord } from '../components/staff/PayrollRecord';
import { StaffAttendanceRecord } from '../components/staff/StaffAttendanceRecord';
import { StaffForm } from '../components/staff/StaffForm';

export default function StaffDetail() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<string | null>('overview');
    const [opened, { open, close }] = useDisclosure(false);

    // Mock Data
    const staff = {
        id: '1',
        first_name: 'Sarah',
        last_name: 'Connor',
        email: 'sarah@example.com',
        phone: '+1 234 567 890',
        address: '456 Cyberdyne Ave',
        dob: '1985-05-15',
        role: 'Teacher',
        department: 'Science',
        qualification: 'M.Sc Physics',
        join_date: '2015-08-20',
        status: 'active',
        avatar_url: null,
        salary: 5000
    };

    return (
        <Box p="md">
            <Button variant="subtle" color="gray" leftSection={<IconArrowLeft size={16} />} mb="md" onClick={() => navigate('/staff')}>
                Back to Staff Directory
            </Button>

            {/* Header / Profile Card */}
            <Paper p="xl" radius="md" mb="lg" withBorder style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 120,
                    background: 'linear-gradient(135deg, #1098AD 0%, #3bc9db 100%)',
                    zIndex: 0
                }} />

                <Group align="flex-end" mt={60} style={{ position: 'relative', zIndex: 1 }}>
                    <Avatar
                        src={staff.avatar_url}
                        size={120}
                        radius={120}
                        style={{ border: '4px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        color="cyan"
                    >
                        {staff.first_name[0]}{staff.last_name[0]}
                    </Avatar>
                    <div style={{ flex: 1, paddingBottom: 10 }}>
                        <Title order={2}>{staff.first_name} {staff.last_name}</Title>
                        <Text c="dimmed" size="sm" tt="uppercase" fw={700}>{staff.role} - {staff.department}</Text>
                    </div>
                    <Group style={{ paddingBottom: 10 }}>
                        <StatusBadge status={staff.status} size="lg" />
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
                        <Title order={4} mb="md">Contact Info</Title>

                        <Group gap="sm" mb="sm">
                            <ThemeIcon variant="light" color="gray" size="md">
                                <IconMail size={16} />
                            </ThemeIcon>
                            <div>
                                <Text size="xs" c="dimmed">Email</Text>
                                <Text size="sm">{staff.email}</Text>
                            </div>
                        </Group>
                        <Group gap="sm" mb="sm">
                            <ThemeIcon variant="light" color="gray" size="md">
                                <IconPhone size={16} />
                            </ThemeIcon>
                            <div>
                                <Text size="xs" c="dimmed">Phone</Text>
                                <Text size="sm">{staff.phone}</Text>
                            </div>
                        </Group>
                        <Group gap="sm" mb="sm">
                            <ThemeIcon variant="light" color="gray" size="md">
                                <IconMapPin size={16} />
                            </ThemeIcon>
                            <div>
                                <Text size="xs" c="dimmed">Address</Text>
                                <Text size="sm">{staff.address}</Text>
                            </div>
                        </Group>

                        <Divider my="md" />

                        <Title order={4} mb="md">Employment Info</Title>
                        <Group gap="sm" mb="sm">
                            <ThemeIcon variant="light" color="cyan" size="md">
                                <IconBriefcase size={16} />
                            </ThemeIcon>
                            <div>
                                <Text size="xs" c="dimmed">Department</Text>
                                <Text size="sm" fw={600}>{staff.department}</Text>
                            </div>
                        </Group>
                        <Group gap="sm" mb="sm">
                            <ThemeIcon variant="light" color="orange" size="md">
                                <IconSchool size={16} />
                            </ThemeIcon>
                            <div>
                                <Text size="xs" c="dimmed">Qualification</Text>
                                <Text size="sm">{staff.qualification}</Text>
                            </div>
                        </Group>
                        <Group gap="sm" mb="sm">
                            <ThemeIcon variant="light" color="green" size="md">
                                <IconCalendar size={16} />
                            </ThemeIcon>
                            <div>
                                <Text size="xs" c="dimmed">Date Joined</Text>
                                <Text size="sm">{staff.join_date}</Text>
                            </div>
                        </Group>
                    </Paper>
                </Grid.Col>

                {/* RIGHT TABS CONTENT */}
                <Grid.Col span={{ base: 12, md: 8, lg: 9 }}>
                    <PageHeader title="Staff Profile" />
                    <Tabs value={activeTab} onChange={setActiveTab} variant="outline" radius="md">
                        <Tabs.List mb="md">
                            <Tabs.Tab value="overview" leftSection={<IconFileAnalytics size={16} />}>
                                Overview
                            </Tabs.Tab>
                            <Tabs.Tab value="classes" leftSection={<IconSchool size={16} />}>
                                Classes
                            </Tabs.Tab>
                            <Tabs.Tab value="attendance" leftSection={<IconCheckupList size={16} />}>
                                Attendance
                            </Tabs.Tab>
                            <Tabs.Tab value="payroll" leftSection={<IconCurrencyDollar size={16} />}>
                                Payroll
                            </Tabs.Tab>
                        </Tabs.List>

                        <Tabs.Panel value="overview">
                            <Grid>
                                <Grid.Col span={6}>
                                    <Paper p="md" withBorder radius="md">
                                        <Title order={5} mb="md">Recent Activity</Title>
                                        <Timeline active={1} bulletSize={24} lineWidth={2}>
                                            <Timeline.Item bullet={<IconSchool size={12} />} title="Grade 10-A Science Class">
                                                <Text c="dimmed" size="xs" mt={4}>Ended 2 hours ago</Text>
                                            </Timeline.Item>
                                            <Timeline.Item bullet={<IconCurrencyDollar size={12} />} title="Salary Credited" lineVariant="dashed">
                                                <Text c="dimmed" size="xs" mt={4}>5 days ago</Text>
                                            </Timeline.Item>
                                            <Timeline.Item title="Leave Approved">
                                                <Text c="dimmed" size="xs" mt={4}>1 week ago</Text>
                                            </Timeline.Item>
                                        </Timeline>
                                    </Paper>
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <Paper p="md" withBorder radius="md">
                                        <Title order={5} mb="xl">Schedule Today</Title>
                                        {/* Placeholder for timetable widget */}
                                        <Center h={100} bg="gray.1" style={{ borderRadius: 8 }}>
                                            <Text c="dimmed">No more classes today</Text>
                                        </Center>
                                    </Paper>
                                </Grid.Col>
                            </Grid>
                        </Tabs.Panel>

                        <Tabs.Panel value="classes">
                            <Paper p="xl" withBorder radius="md"><Text c="dimmed" ta="center">Timetable & Subjects (Coming Soon)</Text></Paper>
                        </Tabs.Panel>
                        <Tabs.Panel value="attendance">
                            <StaffAttendanceRecord />
                        </Tabs.Panel>
                        <Tabs.Panel value="payroll">
                            <PayrollRecord />
                        </Tabs.Panel>
                    </Tabs>
                </Grid.Col>
            </Grid>

            {/* Edit Drawer */}
            <Drawer opened={opened} onClose={close} title="Edit Staff Profile" position="right" size="md">
                <Box p={0}>
                    <StaffForm
                        initialValues={{
                            firstName: staff.first_name,
                            lastName: staff.last_name,
                            email: staff.email,
                            phone: staff.phone,
                            address: staff.address,
                            role: staff.role,
                            department: staff.department,
                            qualification: staff.qualification,
                            salary: staff.salary,
                            joinDate: new Date(staff.join_date)
                        }}
                        onSubmit={(values) => {
                            console.log(values);
                            notifications.show({ message: 'Staff profile updated', color: 'green' });
                            close();
                        }}
                        onCancel={close}
                    />
                </Box>
            </Drawer>
        </Box>
    );
}
