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
    ActionIcon,
    Tooltip,
    Divider,
    Drawer,
    Center,
    Loader,
    Select,
    TextInput
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconUserCheck, IconTrash, IconMail, IconX } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inquiryService, type CreateInquiryDto } from '../../services/inquiryService';
import { adminUsersService } from '../../services/adminUsersService';
import { academicsService } from '../../services/academics';
import { PageHeader } from '../../components/common/PageHeader';

export default function Admissions() {
    const [opened, { open, close }] = useDisclosure(false);
    const queryClient = useQueryClient();
    const [newApp, setNewApp] = useState<CreateInquiryDto>({
        applicantName: '',
        parentName: '',
        email: '',
        phone: '',
        targetClass: '',
        status: 'APPLIED'
    });

    const { data: inquiries, isLoading } = useQuery({
        queryKey: ['inquiries'],
        queryFn: () => inquiryService.getAll()
    });

    const { data: classLevels } = useQuery({
        queryKey: ['class-levels'],
        queryFn: () => academicsService.getClasses()
    });

    const classOptions = classLevels?.map(level => ({
        value: `${level.name} ${level.level || ''}`.trim(),
        label: `${level.name} ${level.level || ''}`.trim()
    })) || [];

    const createInquiryMutation = useMutation({
        mutationFn: (data: CreateInquiryDto) => inquiryService.create(data),
        onSuccess: () => {
            notifications.show({ title: 'Success', message: 'Application registered', color: 'green' });
            queryClient.invalidateQueries({ queryKey: ['inquiries'] });
            setNewApp({ applicantName: '', parentName: '', email: '', phone: '', targetClass: '', status: 'APPLIED' });
            close();
        }
    });

    const updateInquiryMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => inquiryService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inquiries'] });
        }
    });

    const deleteInquiryMutation = useMutation({
        mutationFn: (id: string) => inquiryService.delete(id),
        onSuccess: () => {
            notifications.show({ title: 'Success', message: 'Application deleted', color: 'blue' });
            queryClient.invalidateQueries({ queryKey: ['inquiries'] });
        }
    });

    const handleEnroll = async (inquiry: any) => {
        try {
            const names = inquiry.applicantName.split(' ');
            const firstName = names[0];
            const lastName = names.length > 1 ? names.slice(1).join(' ') : 'Unknown';
            const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}`;

            await adminUsersService.createUser({
                username,
                email: inquiry.email || undefined,
                role: 'STUDENT',
                firstName,
                lastName,
                password: 'Student123!'
            });

            await inquiryService.update(inquiry.id, { status: 'ENROLLED' });
            queryClient.invalidateQueries({ queryKey: ['inquiries'] });

            notifications.show({
                title: 'Success!',
                message: `${inquiry.applicantName} has been enrolled and a student account created.`,
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

    const groupedInquiries = {
        APPLIED: inquiries?.filter(i => i.status === 'APPLIED') || [],
        INTERVIEW: inquiries?.filter(i => i.status === 'INTERVIEW') || [],
        OFFERED: inquiries?.filter(i => i.status === 'OFFERED') || [],
        ENROLLED: inquiries?.filter(i => i.status === 'ENROLLED') || [],
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
                            <Stack gap={2} style={{ flex: 1, overflow: 'hidden' }}>
                                <Group gap="xs">
                                    <Avatar size="sm" color={color} radius="xl">{item.applicantName[0]}</Avatar>
                                    <Text size="sm" fw={600} truncate>{item.applicantName}</Text>
                                </Group>
                                <Text size="xs" c="dimmed" truncate>{item.email}</Text>
                                <Text size="xs" c="dimmed">{item.phone}</Text>
                            </Stack>

                            <Group gap={4}>
                                {status === 'OFFERED' && (
                                    <Tooltip label="Enroll Student">
                                        <ActionIcon color="green" variant="light" onClick={() => handleEnroll(item)}>
                                            <IconUserCheck size={16} />
                                        </ActionIcon>
                                    </Tooltip>
                                )}
                                <Tooltip label="Delete">
                                    <ActionIcon color="red" variant="subtle" onClick={() => deleteInquiryMutation.mutate(item.id)}>
                                        <IconTrash size={16} />
                                    </ActionIcon>
                                </Tooltip>
                            </Group>
                        </Group>
                        <Divider my={8} variant="dashed" />
                        <Group justify="space-between">
                            <Badge size="xs" variant="outline" color="gray">{item.targetClass}</Badge>
                            <Select
                                size="xs"
                                variant="unstyled"
                                data={['APPLIED', 'INTERVIEW', 'OFFERED', 'ENROLLED']}
                                value={item.status}
                                onChange={(val) => updateInquiryMutation.mutate({ id: item.id, data: { status: val } })}
                                style={{ width: 110 }}
                            />
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

            {isLoading ? (
                <Center p="xl"><Loader /></Center>
            ) : (
                <Grid gutter="md">
                    <Grid.Col span={{ base: 12, md: 3 }}>
                        <KanbanColumn title="Applied" status="APPLIED" items={groupedInquiries.APPLIED} color="blue" />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 3 }}>
                        <KanbanColumn title="Interview" status="INTERVIEW" items={groupedInquiries.INTERVIEW} color="orange" />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 3 }}>
                        <KanbanColumn title="Offer Sent" status="OFFERED" items={groupedInquiries.OFFERED} color="green" />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 3 }}>
                        <KanbanColumn title="Enrolled" status="ENROLLED" items={groupedInquiries.ENROLLED} color="grape" />
                    </Grid.Col>
                </Grid>
            )}

            <Drawer
                opened={opened}
                onClose={close}
                title={<Text fw={700} size="lg">New Admission Application</Text>}
                position="right"
                padding="md"
                size="md"
            >
                <Stack>
                    <TextInput
                        label="Student Name"
                        placeholder="Full Name"
                        required
                        value={newApp.applicantName}
                        onChange={(e) => setNewApp({ ...newApp, applicantName: e.target.value })}
                    />
                    <TextInput
                        label="Parent/Guardian Name"
                        placeholder="Full Name"
                        required
                        value={newApp.parentName}
                        onChange={(e) => setNewApp({ ...newApp, parentName: e.target.value })}
                    />
                    <Group grow>
                        <TextInput
                            label="Email"
                            placeholder="email@example.com"
                            required
                            value={newApp.email}
                            onChange={(e) => setNewApp({ ...newApp, email: e.target.value })}
                        />
                        <TextInput
                            label="Phone"
                            placeholder="Phone Number"
                            required
                            value={newApp.phone}
                            onChange={(e) => setNewApp({ ...newApp, phone: e.target.value })}
                        />
                    </Group>
                    <Select
                        label="Applying For Grade"
                        placeholder="Select Grade"
                        data={classOptions}
                        value={newApp.targetClass}
                        onChange={(val) => setNewApp({ ...newApp, targetClass: val || '' })}
                        searchable
                        clearable
                    />
                    <Button
                        fullWidth
                        mt="md"
                        onClick={() => createInquiryMutation.mutate(newApp)}
                        loading={createInquiryMutation.isPending}
                        leftSection={<IconPlus size={18} />}
                    >
                        Submit Application
                    </Button>
                </Stack>
            </Drawer>
        </Box>
    );
}
