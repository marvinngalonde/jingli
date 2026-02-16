import {
    Tabs,
    Paper,
    Text,
    Group,
    Avatar,
    Stack,
    TextInput,
    Button,
    Badge,
    ActionIcon,
    Timeline,
    Grid,
    ScrollArea
} from '@mantine/core';
import {
    IconSpeakerphone,
    IconMessage,
    IconSend,
    IconPlus,
    IconSearch,
    IconDotsVertical
} from '@tabler/icons-react';
import { PageHeader } from '../components/common/PageHeader';

export default function Communication() {
    return (
        <>
            <PageHeader
                title="Communication"
                subtitle="School announcements and messages"
            />

            <Tabs defaultValue="notices">
                <Tabs.List mb="md">
                    <Tabs.Tab value="notices" leftSection={<IconSpeakerphone size={16} />}>
                        Notice Board
                    </Tabs.Tab>
                    <Tabs.Tab value="messages" leftSection={<IconMessage size={16} />}>
                        Messages
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="notices">
                    <NoticeBoard />
                </Tabs.Panel>

                <Tabs.Panel value="messages">
                    <Messages />
                </Tabs.Panel>
            </Tabs>
        </>
    );
}

function NoticeBoard() {
    return (
        <Grid>
            <Grid.Col span={{ base: 12, md: 8 }}>
                <Paper p="md" withBorder radius="md">
                    <Group justify="space-between" mb="lg">
                        <Text fw={600} size="lg">Recent Announcements</Text>
                        <Button leftSection={<IconPlus size={16} />} variant="light">Post Notice</Button>
                    </Group>

                    <Timeline active={1} bulletSize={24} lineWidth={2}>
                        <Timeline.Item
                            bullet={<IconSpeakerphone size={12} />}
                            title="School closed for local election"
                        >
                            <Text c="dimmed" size="xs" mt={4}>Posted by Admin • 2 hours ago</Text>
                            <Text size="sm" mt={4}>
                                Please be advised that the school will be closed this Friday due to the local elections. Classes will resume on Monday.
                            </Text>
                            <Badge color="red" mt="xs" variant="light">Urgent</Badge>
                        </Timeline.Item>

                        <Timeline.Item
                            bullet={<IconSpeakerphone size={12} />}
                            title="Start of Term 2 Exams"
                            lineVariant="dashed"
                        >
                            <Text c="dimmed" size="xs" mt={4}>Posted by Principal • Yesterday</Text>
                            <Text size="sm" mt={4}>
                                Term 2 examinations will begin on the 15th. Please check the academics tab for the detailed schedule.
                            </Text>
                            <Badge color="blue" mt="xs" variant="light">Academic</Badge>
                        </Timeline.Item>

                        <Timeline.Item
                            bullet={<IconSpeakerphone size={12} />}
                            title="Sports Day Sign-ups"
                        >
                            <Text c="dimmed" size="xs" mt={4}>Posted by Sports Coach • 3 days ago</Text>
                            <Text size="sm" mt={4}>
                                Sign-ups for the annual sports day are now open. Visit the gym to register.
                            </Text>
                            <Badge color="green" mt="xs" variant="light">Events</Badge>
                        </Timeline.Item>
                    </Timeline>
                </Paper>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
                <Paper p="md" withBorder radius="md" h="100%">
                    <Text fw={600} mb="md">Categories</Text>
                    <Stack gap="xs">
                        <Button variant="light" color="blue" fullWidth justify="start">General</Button>
                        <Button variant="subtle" color="red" fullWidth justify="start">Urgent</Button>
                        <Button variant="subtle" color="green" fullWidth justify="start">Events</Button>
                        <Button variant="subtle" color="violet" fullWidth justify="start">Academic</Button>
                    </Stack>
                </Paper>
            </Grid.Col>
        </Grid>
    );
}

function Messages() {
    return (
        <Paper withBorder radius="md" h={600} style={{ overflow: 'hidden' }}>
            <Grid gutter={0} h="100%">
                {/* Chat List */}
                <Grid.Col span={4} style={{ borderRight: '1px solid #e9ecef', height: '100%' }}>
                    <Stack h="100%" gap={0}>
                        <div style={{ padding: '16px', borderBottom: '1px solid #e9ecef' }}>
                            <TextInput placeholder="Search messages" leftSection={<IconSearch size={16} />} />
                        </div>
                        <ScrollArea style={{ flex: 1 }}>
                            {['Sarah Teacher', 'John Parent', 'Admin Desk', 'Principal'].map((name, i) => (
                                <div
                                    key={i}
                                    style={{
                                        padding: '12px 16px',
                                        cursor: 'pointer',
                                        backgroundColor: i === 0 ? '#f1f3f5' : 'transparent',
                                        borderBottom: '1px solid #f8f9fa'
                                    }}
                                >
                                    <Group wrap="nowrap">
                                        <Avatar color="blue" radius="xl">{name.charAt(0)}</Avatar>
                                        <div style={{ flex: 1 }}>
                                            <Group justify="space-between">
                                                <Text size="sm" fw={500}>{name}</Text>
                                                <Text size="xs" c="dimmed">12:30</Text>
                                            </Group>
                                            <Text size="xs" c="dimmed" lineClamp={1}>
                                                Can we schedule a meeting for tomorrow?
                                            </Text>
                                        </div>
                                    </Group>
                                </div>
                            ))}
                        </ScrollArea>
                    </Stack>
                </Grid.Col>

                {/* Chat Window */}
                <Grid.Col span={8} h="100%">
                    <Stack h="100%" gap={0}>
                        {/* Header */}
                        <Group justify="space-between" p="md" style={{ borderBottom: '1px solid #e9ecef' }}>
                            <Group>
                                <Avatar color="blue" radius="xl">S</Avatar>
                                <div>
                                    <Text fw={600} size="sm">Sarah Teacher</Text>
                                    <Text size="xs" c="green">Online</Text>
                                </div>
                            </Group>
                            <ActionIcon variant="subtle" color="gray">
                                <IconDotsVertical size={16} />
                            </ActionIcon>
                        </Group>

                        {/* Messages Area */}
                        <ScrollArea style={{ flex: 1, backgroundColor: '#f8f9fa' }} p="md">
                            <Stack gap="md">
                                <Group justify="flex-start">
                                    <Avatar size="sm" radius="xl" color="blue">S</Avatar>
                                    <Paper p="xs" radius="md" bg="white" shadow="xs" style={{ maxWidth: '70%' }}>
                                        <Text size="sm">Hello, I wanted to discuss the upcoming parent-teacher meeting.</Text>
                                        <Text size="xs" c="dimmed" ta="right" mt={4}>10:00 AM</Text>
                                    </Paper>
                                </Group>
                                <Group justify="flex-end">
                                    <Paper p="xs" radius="md" bg="blue.6" c="white" shadow="xs" style={{ maxWidth: '70%' }}>
                                        <Text size="sm">Sure, I am available tomorrow at 2 PM. Does that work?</Text>
                                        <Text size="xs" c="blue.1" ta="right" mt={4}>10:05 AM</Text>
                                    </Paper>
                                    <Avatar size="sm" radius="xl" color="gray">Me</Avatar>
                                </Group>
                                <Group justify="flex-start">
                                    <Avatar size="sm" radius="xl" color="blue">S</Avatar>
                                    <Paper p="xs" radius="md" bg="white" shadow="xs" style={{ maxWidth: '70%' }}>
                                        <Text size="sm">Yes, that works perfectly. See you then.</Text>
                                        <Text size="xs" c="dimmed" ta="right" mt={4}>10:15 AM</Text>
                                    </Paper>
                                </Group>
                            </Stack>
                        </ScrollArea>

                        {/* Input Area */}
                        <div style={{ padding: '16px', borderTop: '1px solid #e9ecef' }}>
                            <Group>
                                <TextInput
                                    style={{ flex: 1 }}
                                    placeholder="Type a message..."
                                    rightSection={<IconSend size={16} />}
                                />
                                <Button size="sm">Send</Button>
                            </Group>
                        </div>
                    </Stack>
                </Grid.Col>
            </Grid>
        </Paper>
    );
}
