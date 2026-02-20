import { useState } from 'react';
import {
    Title,
    Text,
    Button,
    Group,
    Paper,
    Badge,
    Avatar,
    Grid,
    Stack,
    Box,
    rem,
    Modal,
    TextInput,
    Select,
    ActionIcon,
    Tooltip
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconDots, IconUserCheck, IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { adminUsersService } from '../services/adminUsersService';

// Common Components
import { PageHeader } from '../components/common/PageHeader';

export default function Admissions() {
    const [opened, { open, close }] = useDisclosure(false);
    const [applicants, setApplicants] = useState({
        applied: [
            { id: '1', firstName: 'Liam', lastName: 'Neeson', email: 'liam@hollywood.com', grade: 'Grade 1', date: '2024-03-10', avatar: null },
            { id: '2', firstName: 'Emma', lastName: 'Stone', email: 'emma@hollywood.com', grade: 'Grade 5', date: '2024-03-11', avatar: null },
        ],
        interview: [
            { id: '3', firstName: 'Tom', lastName: 'Holland', email: 'tom@marvel.com', grade: 'Grade 10', date: '2024-03-08', avatar: null },
        ],
        offered: [
            { id: '4', firstName: 'Chris', lastName: 'Evans', email: 'chris@avengers.com', grade: 'Grade Kindergarten', date: '2024-03-01', avatar: null },
        ],
        enrolled: [] as any[]
    });

    const [newApp, setNewApp] = useState({ firstName: '', lastName: '', email: '', grade: '' });

    const handleEnroll = async (student: any) => {
        try {
            const username = `${student.firstName.toLowerCase()}_${student.lastName.toLowerCase()}${Math.floor(Math.random() * 100)}`;
            // 1. Create User in System
            await adminUsersService.createUser({
                username,
                email: student.email || undefined,
                role: 'STUDENT',
                firstName: student.firstName,
                lastName: student.lastName,
                password: 'Student123!' // Default password for enrolled students
            });

            // 2. Move in Pipeline
            setApplicants(prev => ({
                ...prev,
                offered: prev.offered.filter(a => a.id !== student.id),
                enrolled: [...prev.enrolled, { ...student, date: new Date().toLocaleDateString() }]
            }));

            notifications.show({
                title: 'Success!',
                message: `${student.firstName} has been enrolled and a student account created.`,
                color: 'green'
            });
        } catch (error) {
            notifications.show({
                title: 'Auto-Enrollment Failed',
                message: 'Could not create student account. They might already exist.',
                color: 'red'
            });
        }
    };

    const handleNewApplication = () => {
        const id = Math.random().toString(36).substr(2, 9);
        setApplicants(prev => ({
            ...prev,
            applied: [...prev.applied, { id, ...newApp, date: new Date().toLocaleDateString(), avatar: null }]
        }));
        setNewApp({ firstName: '', lastName: '', email: '', grade: '' });
        close();
        notifications.show({ message: 'Application Registered' });
    };

    const KanbanColumn = ({ title, status, items, color }: any) => (
        <Paper withBorder p="md" radius="md" h="100%" bg="gray.0">
            <Group justify="space-between" mb="md">
                <Group gap="xs">
                    <Text fw={700} size="sm">{title}</Text>
                    <Badge variant="light" color={color} circle>
                        {items.length}
                    </Badge>
                </Group>
            </Group>

            <Stack>
                {items.map((item: any) => (
                    <Paper key={item.id} p="sm" shadow="xs" radius="sm" style={{ cursor: 'pointer', borderLeft: `4px solid var(--mantine-color-${color}-filled)` }}>
                        <Group justify="space-between" align="flex-start" wrap="nowrap">
                            <Group gap="xs" style={{ flex: 1 }}>
                                <Avatar size="sm" src={item.avatar} color={color} radius="xl">{item.firstName[0]}</Avatar>
                                <div style={{ overflow: 'hidden' }}>
                                    <Text size="sm" fw={600} truncate>{item.firstName} {item.lastName}</Text>
                                    <Text size="xs" c="dimmed" truncate>{item.email}</Text>
                                </div>
                            </Group>

                            {status === 'offered' && (
                                <Tooltip label="Enroll Student">
                                    <ActionIcon color="green" variant="light" onClick={() => handleEnroll(item)}>
                                        <IconUserCheck size={16} />
                                    </ActionIcon>
                                </Tooltip>
                            )}
                        </Group>
                        <Group justify="space-between" mt="xs">
                            <Badge size="xs" variant="outline" color="gray">{item.grade}</Badge>
                            <Text size="xs" c="dimmed">{item.date}</Text>
                        </Group>
                    </Paper>
                ))}
                {items.length === 0 && (
                    <Box h={100} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #ced4da', borderRadius: 4 }}>
                        <Text size="xs" c="dimmed">No {title.toLowerCase()}</Text>
                    </Box>
                )}
            </Stack>
        </Paper>
    );

    return (
        <Box p="md">
            <PageHeader
                title="Admissions"
                subtitle="Manage student applications and enrollment pipeline"
                actions={
                    <Button leftSection={<IconPlus size={18} />} onClick={open}>
                        New Application
                    </Button>
                }
            />

            <Grid gutter="md">
                <Grid.Col span={3}>
                    <KanbanColumn title="Applied" status="applied" items={applicants.applied} color="blue" />
                </Grid.Col>
                <Grid.Col span={3}>
                    <KanbanColumn title="Interview" status="interview" items={applicants.interview} color="orange" />
                </Grid.Col>
                <Grid.Col span={3}>
                    <KanbanColumn title="Offer Sent" status="offered" items={applicants.offered} color="green" />
                </Grid.Col>
                <Grid.Col span={3}>
                    <KanbanColumn title="Enrolled" status="enrolled" items={applicants.enrolled} color="grape" />
                </Grid.Col>
            </Grid>

            <Modal opened={opened} onClose={close} title="New Admission Application" centered>
                <Stack>
                    <Group grow>
                        <TextInput label="First Name" placeholder="Student First Name" required value={newApp.firstName} onChange={(e) => setNewApp({ ...newApp, firstName: e.target.value })} />
                        <TextInput label="Last Name" placeholder="Student Last Name" required value={newApp.lastName} onChange={(e) => setNewApp({ ...newApp, lastName: e.target.value })} />
                    </Group>
                    <TextInput label="Student Email" placeholder="future.student@email.com" required value={newApp.email} onChange={(e) => setNewApp({ ...newApp, email: e.target.value })} />
                    <Select label="Applying For Grade" placeholder="Select Grade" data={['Kindergarten', 'Grade 1', 'Grade 2', 'Grade 5', 'Grade 10']} value={newApp.grade} onChange={(val) => setNewApp({ ...newApp, grade: val || '' })} />
                    <Button fullWidth mt="md" onClick={handleNewApplication}>
                        Submit Application
                    </Button>
                </Stack>
            </Modal>
        </Box>
    );
}
