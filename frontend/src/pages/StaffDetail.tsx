import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Grid,
    Paper,
    Text,
    Avatar,
    Group,
    Button,
    Tabs,
    Stack,
    Divider,
    Badge,
    Title,
    ThemeIcon,
    Box,
    Drawer,
    LoadingOverlay
} from '@mantine/core';
import {
    IconPhone,
    IconMail,
    IconMapPin,
    IconPencil,
    IconCalendar,
    IconBuilding,
    IconArrowLeft,
    IconBriefcase,
    IconSchool
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { staffService } from '../services/staffService';
import type { Staff } from '../types/staff';
import { format } from 'date-fns';
import { StaffForm } from '../components/staff/StaffForm';

export default function StaffDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<string | null>('overview');
    const [staff, setStaff] = useState<Staff | null>(null);
    const [loading, setLoading] = useState(true);
    const [opened, { open, close }] = useDisclosure(false);

    useEffect(() => {
        if (id) loadStaff(id);
    }, [id]);

    const loadStaff = async (staffId: string) => {
        setLoading(true);
        try {
            const data = await staffService.getById(staffId);
            setStaff(data);
        } catch (error) {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to load staff details', color: 'red' });
            navigate('/staff');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (values: any) => {
        if (!staff) return;
        setLoading(true);
        try {
            await staffService.update(staff.id, values);
            notifications.show({ message: 'Profile updated successfully', color: 'green' });
            close();
            loadStaff(staff.id);
        } catch (error) {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to update profile', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    if (loading || !staff) {
        return <LoadingOverlay visible={true} />;
    }

    return (
        <Container fluid>
            <Button variant="subtle" leftSection={<IconArrowLeft size={16} />} mb="md" onClick={() => navigate('/staff')}>
                Back to Directory
            </Button>

            <Grid>
                {/* Left Column: Profile Card */}
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Paper withBorder p="xl" radius="md">
                        <Stack align="center">
                            <Avatar size={120} radius={120} color="blue">
                                {staff.firstName[0]}{staff.lastName[0]}
                            </Avatar>
                            <div style={{ textAlign: 'center' }}>
                                <Text fz="lg" fw={700} mt="sm">
                                    {staff.firstName} {staff.lastName}
                                </Text>
                                <Text c="dimmed" size="sm">
                                    {staff.designation} • {staff.department}
                                </Text>
                            </div>

                            <Badge variant="light" color="blue" size="lg" radius="sm">
                                Active Employee
                            </Badge>

                            <Button fullWidth variant="default" mt="md" leftSection={<IconPencil size={16} />} onClick={open}>
                                Edit Profile
                            </Button>
                        </Stack>

                        <Divider my="lg" />

                        <Stack gap="md">
                            <Group wrap="nowrap">
                                <ThemeIcon variant="light" color="gray"><IconMail size={18} /></ThemeIcon>
                                <div>
                                    <Text size="xs" c="dimmed">Email</Text>
                                    <Text size="sm" fw={500}>{staff.user?.email || 'N/A'}</Text>
                                </div>
                            </Group>
                            <Group wrap="nowrap">
                                <ThemeIcon variant="light" color="gray"><IconPhone size={18} /></ThemeIcon>
                                <div>
                                    <Text size="xs" c="dimmed">Phone</Text>
                                    <Text size="sm" fw={500}>{staff.phone || 'N/A'}</Text>
                                </div>
                            </Group>
                            <Group wrap="nowrap">
                                <ThemeIcon variant="light" color="gray"><IconBriefcase size={18} /></ThemeIcon>
                                <div>
                                    <Text size="xs" c="dimmed">Employee ID</Text>
                                    <Text size="sm" fw={500}>{staff.employeeId}</Text>
                                </div>
                            </Group>
                            <Group wrap="nowrap">
                                <ThemeIcon variant="light" color="gray"><IconCalendar size={18} /></ThemeIcon>
                                <div>
                                    <Text size="xs" c="dimmed">Joined</Text>
                                    <Text size="sm" fw={500}>{format(new Date(staff.joinDate), 'dd MMM yyyy')}</Text>
                                </div>
                            </Group>
                        </Stack>
                    </Paper>
                </Grid.Col>

                {/* Right Column: Details & Tabs */}
                <Grid.Col span={{ base: 12, md: 8 }}>
                    <Paper withBorder p="md" radius="md" style={{ height: '100%' }}>
                        <Tabs value={activeTab} onChange={setActiveTab}>
                            <Tabs.List>
                                <Tabs.Tab value="overview" leftSection={<IconBuilding size={14} />}>Overview</Tabs.Tab>
                                <Tabs.Tab value="classes" leftSection={<IconSchool size={14} />}>Classes & Subjects</Tabs.Tab>
                                <Tabs.Tab value="schedule" leftSection={<IconCalendar size={14} />}>Schedule</Tabs.Tab>
                            </Tabs.List>

                            <Tabs.Panel value="overview" pt="xl">
                                <Title order={5} mb="md">Professional Summary</Title>
                                <Text c="dimmed" size="sm">
                                    {staff.firstName} {staff.lastName} is a {staff.designation} in the {staff.department} department.
                                    Joined the institution on {format(new Date(staff.joinDate), 'MMMM dd, yyyy')}.
                                </Text>
                            </Tabs.Panel>

                            <Tabs.Panel value="classes" pt="xl">
                                <Title order={5} mb="md">Assigned Classes</Title>
                                <Text c="dimmed">List of classes taught by this teacher will appear here.</Text>
                                {/* Future: Map through staff.subjectAllocations */}
                            </Tabs.Panel>

                            <Tabs.Panel value="schedule" pt="xl">
                                <Title order={5} mb="md">Weekly Timetable</Title>
                                <Text c="dimmed">Weekly schedule grid will appear here.</Text>
                                {/* Future: Timetable Grid */}
                            </Tabs.Panel>
                        </Tabs>
                    </Paper>
                </Grid.Col>
            </Grid>

            <Drawer opened={opened} onClose={close} title="Edit Profile" position="right" size="md">
                <Box p={0}>
                    {opened && (
                        <StaffForm
                            initialValues={{
                                ...staff,
                                email: staff.user?.email || '',
                                joinDate: new Date(staff.joinDate)
                            }}
                            onSubmit={handleUpdate}
                            onCancel={close}
                            loading={loading}
                            isEditing={true}
                        />
                    )}
                </Box>
            </Drawer>
        </Container>
    );
}
