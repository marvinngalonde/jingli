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
    Select
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconDots, IconGripVertical } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

// Common Components
import { PageHeader } from '../components/common/PageHeader';

// Mock Data
const initialData = {
    applied: [
        { id: '1', name: 'Liam Neeson', grade: 'Grade 1', date: '2024-03-10', avatar: null },
        { id: '2', name: 'Emma Stone', grade: 'Grade 5', date: '2024-03-11', avatar: null },
    ],
    interview: [
        { id: '3', name: 'Tom Holland', grade: 'Grade 10', date: '2024-03-08', avatar: null },
    ],
    offered: [
        { id: '4', name: 'Chris Evans', grade: 'Kindergarten', date: '2024-03-01', avatar: null },
    ],
    enrolled: []
};

export default function Admissions() {
    // Simple Kanban Implementation (No DnD lib for simplicity in this demo, just lists)
    // For a real app, I'd use @hello-pangea/dnd

    // Using layout-based representation for now to avoid dragging complexity without npm install

    const [opened, { open, close }] = useDisclosure(false);

    const KanbanColumn = ({ title, status, items, color }: any) => (
        <Paper withBorder p="md" radius="md" h="100%" bg="gray.0">
            <Group justify="space-between" mb="md">
                <Group gap="xs">
                    <Text fw={700} size="sm">{title}</Text>
                    <Badge variant="light" color={color} circle>
                        {items.length}
                    </Badge>
                </Group>
                <IconDots size={16} color="gray" />
            </Group>

            <Stack>
                {items.map((item: any) => (
                    <Paper key={item.id} p="sm" shadow="xs" radius="sm" style={{ cursor: 'grab', borderLeft: `4px solid var(--mantine-color-${color}-filled)` }}>
                        <Group justify="space-between" align="flex-start">
                            <Group gap="xs">
                                <Avatar size="sm" src={item.avatar} color={color} radius="xl">{item.name[0]}</Avatar>
                                <div>
                                    <Text size="sm" fw={600}>{item.name}</Text>
                                    <Text size="xs" c="dimmed">Applied: {item.date}</Text>
                                </div>
                            </Group>
                        </Group>
                        <Badge size="xs" variant="outline" mt="xs" color="gray">{item.grade}</Badge>
                    </Paper>
                ))}
                {items.length === 0 && (
                    <Box h={100} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #ced4da', borderRadius: 4 }}>
                        <Text size="xs" c="dimmed">No applicants</Text>
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
                    <KanbanColumn title="Applied" status="applied" items={initialData.applied} color="blue" />
                </Grid.Col>
                <Grid.Col span={3}>
                    <KanbanColumn title="Interview / Assessment" status="interview" items={initialData.interview} color="orange" />
                </Grid.Col>
                <Grid.Col span={3}>
                    <KanbanColumn title="Offer Sent" status="offered" items={initialData.offered} color="green" />
                </Grid.Col>
                <Grid.Col span={3}>
                    <KanbanColumn title="Enrolled" status="enrolled" items={initialData.enrolled} color="grape" />
                </Grid.Col>
            </Grid>

            <Modal opened={opened} onClose={close} title="New Admission Application" centered>
                <Stack>
                    <TextInput label="Applicant Name" placeholder="Student Name" />
                    <Select label="Applying For Grade" placeholder="Select Grade" data={['Grade 1', 'Grade 2', 'Grade 3']} />
                    <TextInput label="Parent Email" placeholder="contact@parent.com" />
                    <TextInput label="Phone Number" placeholder="+123..." />
                    <Button fullWidth onClick={() => { notifications.show({ message: 'Application Created' }); close(); }}>
                        Submit Application
                    </Button>
                </Stack>
            </Modal>
        </Box>
    );
}
