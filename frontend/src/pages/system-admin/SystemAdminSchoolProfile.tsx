import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Box, Group, Title, Text, Button, Card, Tabs, TextInput, 
    ThemeIcon, Grid, Badge, ActionIcon, Stack, Skeleton, Anchor, Switch
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { 
    IconArrowLeft, IconBuildingBank, IconWorld, IconMail, 
    IconPhone, IconSettings, IconUsers, IconChalkboard, 
    IconBook2, IconSection
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { api } from '../../services/api';

export default function SystemAdminSchoolProfile() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [activeTab, setActiveTab] = useState<string | null>('overview');

    // Edit form states
    const [name, setName] = useState('');
    const [subdomain, setSubdomain] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');

    const { data: school, isLoading } = useQuery({
        queryKey: ['system-admin-school', id],
        queryFn: async () => {
            const res = await api.get(`/system-admin/schools/${id}`);
            return res.data;
        },
        enabled: !!id,
    });

    useEffect(() => {
        if (school) {
            setName(school.name || '');
            setSubdomain(school.subdomain || '');
            setContactEmail(school.contactEmail || '');
            setContactPhone(school.contactPhone || '');
        }
    }, [school]);

    const updateSchoolMutation = useMutation({
        mutationFn: async (data: any) => {
            return api.patch(`/system-admin/schools/${id}`, data);
        },
        onSuccess: () => {
            notifications.show({ title: 'Success', message: 'School profile updated.', color: 'green' });
            queryClient.invalidateQueries({ queryKey: ['system-admin-school', id] });
            queryClient.invalidateQueries({ queryKey: ['system-admin-schools'] });
        },
        onError: (err: any) => {
            notifications.show({ 
                title: 'Error', 
                message: err.response?.data?.message || 'Failed to update school.', 
                color: 'red' 
            });
        }
    });

    const handleSaveConfig = () => {
        updateSchoolMutation.mutate({
            name,
            subdomain,
            contactEmail,
            contactPhone
        });
    };

    if (isLoading) return <Box p="md"><Skeleton height={200} radius="md" mb="md" /><Skeleton height={400} radius="md" /></Box>;
    if (!school) return <Box p="md"><Text>School not found.</Text></Box>;

    return (
        <Box p="md" maw={1200} mx="auto">
            {/* Header Navigation */}
            <Group mb="lg" gap="xs">
                <ActionIcon variant="subtle" color="gray" onClick={() => navigate('/system-admin/schools')}>
                    <IconArrowLeft size={18} />
                </ActionIcon>
                <Text c="dimmed" size="sm">Back to Schools</Text>
            </Group>

            {/* Profile Overview Card */}
            <Card withBorder radius="lg" shadow="sm" p="xl" mb="xl" style={{ backgroundColor: 'var(--mantine-color-indigo-filled)', color: 'white' }}>
                <Grid align="center">
                    <Grid.Col span={{ base: 12, md: 8 }}>
                        <Group align="flex-start">
                            <ThemeIcon size={80} radius="md" color="white" variant="filled">
                                <IconBuildingBank size={40} color="var(--mantine-color-indigo-8)" />
                            </ThemeIcon>
                            <Box>
                                <Title order={2} c="white" mb={4}>{school.name}</Title>
                                <Group gap="xs" mb="sm">
                                    <Badge color={school.status === 'ACTIVE' ? 'green.4' : 'red.4'} variant="filled" size="sm">
                                        {school.status}
                                    </Badge>
                                    <Text size="sm" c="indigo.1">
                                        Joined {dayjs(school.createdAt).format('MMMM D, YYYY')}
                                    </Text>
                                </Group>
                                <Group gap="md">
                                    <Group gap={6}>
                                        <IconWorld size={16} color="var(--mantine-color-indigo-2)" />
                                        <Anchor href={`https://${school.subdomain}.jingli.co.zw`} target="_blank" c="indigo.1" size="sm" style={{ textDecoration: 'underline' }}>
                                            {school.subdomain}.jingli.co.zw
                                        </Anchor>
                                    </Group>
                                </Group>
                            </Box>
                        </Group>
                    </Grid.Col>
                    
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Stack align="flex-end" justify="center" h="100%">
                            <Button 
                                variant="white" 
                                color="indigo" 
                                leftSection={<IconWorld size={16} />}
                                onClick={() => window.open(`https://${school.subdomain}.jingli.co.zw`, '_blank')}
                            >
                                Open Portal
                            </Button>
                        </Stack>
                    </Grid.Col>
                </Grid>
            </Card>

            {/* Tabs Content */}
            <Tabs value={activeTab} onChange={setActiveTab} color="indigo" variant="outline" radius="md">
                <Tabs.List mb="md">
                    <Tabs.Tab value="overview" leftSection={<IconBuildingBank size={14} />}>Overview Metrics</Tabs.Tab>
                    <Tabs.Tab value="settings" leftSection={<IconSettings size={14} />}>Configuration</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="overview">
                    <Grid gutter="md">
                        <Grid.Col span={{ base: 12, sm: 4 }}>
                            <Card withBorder radius="md" p="md">
                                <Group justify="space-between" mb="xs">
                                    <Text size="sm" fw={600} c="dimmed" tt="uppercase">Total Students</Text>
                                    <ThemeIcon variant="light" color="blue" size="md" radius="xl">
                                        <IconUsers size={16} />
                                    </ThemeIcon>
                                </Group>
                                <Title order={2} fw={800}>{school._count?.students || 0}</Title>
                            </Card>
                        </Grid.Col>
                        
                        <Grid.Col span={{ base: 12, sm: 4 }}>
                            <Card withBorder radius="md" p="md">
                                <Group justify="space-between" mb="xs">
                                    <Text size="sm" fw={600} c="dimmed" tt="uppercase">Total Staff</Text>
                                    <ThemeIcon variant="light" color="teal" size="md" radius="xl">
                                        <IconChalkboard size={16} />
                                    </ThemeIcon>
                                </Group>
                                <Title order={2} fw={800}>{school._count?.staff || 0}</Title>
                            </Card>
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, sm: 4 }}>
                            <Card withBorder radius="md" p="md">
                                <Group justify="space-between" mb="xs">
                                    <Text size="sm" fw={600} c="dimmed" tt="uppercase">Subjects</Text>
                                    <ThemeIcon variant="light" color="violet" size="md" radius="xl">
                                        <IconBook2 size={16} />
                                    </ThemeIcon>
                                </Group>
                                <Title order={2} fw={800}>{school._count?.subjects || 0}</Title>
                            </Card>
                        </Grid.Col>
                        
                        <Grid.Col span={{ base: 12, sm: 4 }}>
                            <Card withBorder radius="md" p="md">
                                <Group justify="space-between" mb="xs">
                                    <Text size="sm" fw={600} c="dimmed" tt="uppercase">Class Sections</Text>
                                    <ThemeIcon variant="light" color="orange" size="md" radius="xl">
                                        <IconSection size={16} />
                                    </ThemeIcon>
                                </Group>
                                <Title order={2} fw={800}>{school._count?.sections || 0}</Title>
                            </Card>
                        </Grid.Col>
                    </Grid>
                </Tabs.Panel>

                <Tabs.Panel value="settings">
                    <Card withBorder radius="md" p="xl">
                        <Title order={4} mb="lg">Core Configuration</Title>
                        <Stack gap="md" maw={500}>
                            <TextInput
                                label="School Name"
                                value={name}
                                onChange={(e) => setName(e.currentTarget.value)}
                                required
                            />
                            <TextInput
                                label="Subdomain Prefix"
                                value={subdomain}
                                onChange={(e) => setSubdomain(e.currentTarget.value)}
                                rightSection={<Text size="sm" c="dimmed" mr="xl">.jingli.co.zw</Text>}
                                rightSectionWidth={100}
                                required
                            />
                            <TextInput
                                label="Primary Contact Email"
                                value={contactEmail}
                                onChange={(e) => setContactEmail(e.currentTarget.value)}
                                leftSection={<IconMail size={16} />}
                            />
                            <TextInput
                                label="Primary Contact Phone"
                                value={contactPhone}
                                onChange={(e) => setContactPhone(e.currentTarget.value)}
                                leftSection={<IconPhone size={16} />}
                            />
                            <Group justify="flex-end" mt="md">
                                <Button 
                                    color="indigo" 
                                    onClick={handleSaveConfig} 
                                    loading={updateSchoolMutation.isPending}
                                >
                                    Save Changes
                                </Button>
                            </Group>
                        </Stack>
                    </Card>
                </Tabs.Panel>
            </Tabs>
        </Box>
    );
}
