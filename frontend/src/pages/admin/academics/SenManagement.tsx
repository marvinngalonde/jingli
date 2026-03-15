import React, { useState } from 'react';
import { Container, Title, Text, Card, Group, Stack, ThemeIcon, Table, Badge, ActionIcon, Button, TextInput, Select, Grid, LoadingOverlay, Center, Tabs, Progress, List, Drawer, Divider, MultiSelect } from '@mantine/core';
import { IconUsers, IconFileText, IconPlus, IconEdit, IconTrash, IconChevronRight, IconAlertCircle } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { senService } from '../../../services/senService';
import { studentService } from '../../../services/studentService';
import { notifications } from '@mantine/notifications';

export function SenManagement() {
    const [opened, { open, close }] = useDisclosure(false);
    const [iepDrawerOpened, { open: openIepDrawer, close: closeIepDrawer }] = useDisclosure(false);
    const [registerOpened, { open: openRegister, close: closeRegister }] = useDisclosure(false);
    
    const [selectedProfile, setSelectedProfile] = useState<any>(null);
    const [editingIep, setEditingIep] = useState<any>(null);
    const [editingProfile, setEditingProfile] = useState<any>(null);
    const queryClient = useQueryClient();

    // Queries
    const { data: profiles = [], isLoading: isLoadingProfiles } = useQuery({
        queryKey: ['sen-profiles'],
        queryFn: () => senService.getProfiles(),
    });

    const { data: studentsData = { data: [] }, isLoading: isLoadingStudents } = useQuery({
        queryKey: ['students-all'],
        queryFn: () => studentService.getAll({ limit: 1000 }),
    });

    // Mutations
    const registerStudentMutation = useMutation({
        mutationFn: (data: any) => senService.createProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sen-profiles'] });
            notifications.show({ title: 'Success', message: 'Student registered for SEN', color: 'green' });
            closeRegister();
        }
    });

    const updateProfileMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => senService.updateProfile(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sen-profiles'] });
            notifications.show({ title: 'Success', message: 'Profile updated', color: 'green' });
            close();
        }
    });

    const createIepMutation = useMutation({
        mutationFn: ({ profileId, data }: { profileId: string; data: any }) => senService.createIEP(profileId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sen-profiles'] });
            notifications.show({ title: 'Success', message: 'IEP created', color: 'green' });
            closeIepDrawer();
        }
    });

    const updateIepMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => senService.updateIEP(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sen-profiles'] });
            notifications.show({ title: 'Success', message: 'IEP updated', color: 'green' });
            closeIepDrawer();
        }
    });

    const deleteIepMutation = useMutation({
        mutationFn: (id: string) => senService.deleteIEP(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sen-profiles'] });
            notifications.show({ title: 'Deleted', message: 'IEP removed', color: 'red' });
        }
    });

    const deleteProfileMutation = useMutation({
        mutationFn: (id: string) => senService.deleteProfile(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sen-profiles'] });
            notifications.show({ title: 'Deleted', message: 'SEN Profile removed', color: 'red' });
        }
    });

    const renderSeverityBadge = (severity: string) => {
        switch (severity) {
            case 'MILD': return <Badge color="blue">Mild</Badge>;
            case 'MODERATE': return <Badge color="yellow">Moderate</Badge>;
            case 'SEVERE': return <Badge color="red">Severe</Badge>;
            default: return <Badge color="gray">{severity}</Badge>;
        }
    };

    const handleOpenIepDrawer = (profile: any, iep: any = null) => {
        setSelectedProfile(profile);
        setEditingIep(iep);
        openIepDrawer();
    };

    const handleOpenProfileDrawer = (profile: any) => {
        setEditingProfile(profile);
        open();
    };

    const handleSaveIep = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const data = Object.fromEntries(formData.entries());
        
        // Convert accommodations string to array if needed or handle as multi-select
        const iepData = {
            ...data,
            accommodations: (data.accommodations as string).split(',').map(s => s.trim()).filter(Boolean),
        };

        if (editingIep) {
            updateIepMutation.mutate({ id: editingIep.id, data: iepData });
        } else if (selectedProfile) {
            createIepMutation.mutate({ profileId: selectedProfile.id, data: iepData });
        }
    };

    const handleRegister = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const data = Object.fromEntries(formData.entries());
        registerStudentMutation.mutate(data);
    };

    const handleUpdateProfile = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const data = Object.fromEntries(formData.entries());
        if (editingProfile) {
            updateProfileMutation.mutate({ id: editingProfile.id, data });
        }
    };

    const studentOptions = studentsData.data
        .filter((s: any) => !profiles.some((p: any) => p.studentId === s.id))
        .map((s: any) => ({
            value: s.id,
            label: `${s.firstName} ${s.lastName} (${s.admissionNo})`
        }));

    const isLoading = isLoadingProfiles || isLoadingStudents;

    // Flatten all IEPs for the second tab
    const allIeps = profiles.flatMap((p: any) => p.ieps.map((iep: any) => ({ ...iep, student: p.student, profile: p })));

    return (
        <Container size="xl" py="lg" pos="relative">
            <LoadingOverlay visible={isLoading} overlayProps={{ blur: 2 }} />
            
            <Title order={2} mb="xs">Special Educational Needs (SEN)</Title>
            <Text c="dimmed" mb="xl">Manage Individualized Education Programs (IEPs) and SEN student profiles.</Text>

            <Group grow mb="xl">
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Group justify="space-between">
                        <Stack gap="xs">
                            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>SEN Students</Text>
                            <Text size="xl" fw={700}>{profiles.length}</Text>
                        </Stack>
                        <ThemeIcon color="grape" size="xl" radius="md" variant="light">
                            <IconUsers size={24} />
                        </ThemeIcon>
                    </Group>
                </Card>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Group justify="space-between">
                        <Stack gap="xs">
                            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Active IEPs</Text>
                            <Text size="xl" fw={700}>
                                {profiles.reduce((acc: number, p: any) => acc + p.ieps.filter((i: any) => i.status === 'ACTIVE').length, 0)}
                            </Text>
                        </Stack>
                        <ThemeIcon color="blue" size="xl" radius="md" variant="light">
                            <IconFileText size={24} />
                        </ThemeIcon>
                    </Group>
                </Card>
            </Group>

            <Tabs defaultValue="roster">
                <Tabs.List mb="md">
                    <Tabs.Tab value="roster" leftSection={<IconUsers size={14} />}>Student Roster</Tabs.Tab>
                    <Tabs.Tab value="ieps" leftSection={<IconFileText size={14} />}>Active IEPs</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="roster">
                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                        <Group justify="space-between" mb="md">
                            <Text fw={500} size="lg">SEN Student List</Text>
                            <Button size="sm" leftSection={<IconPlus size={14} />} onClick={openRegister}>Register Student</Button>
                        </Group>

                        {profiles.length === 0 ? (
                            <Center py="xl"><Text c="dimmed">No SEN students registered.</Text></Center>
                        ) : (
                            <Table striped highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Student</Table.Th>
                                        <Table.Th>Class</Table.Th>
                                        <Table.Th>Disability Type</Table.Th>
                                        <Table.Th>Severity</Table.Th>
                                        <Table.Th>Latest IEP</Table.Th>
                                        <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {profiles.map((profile: any) => (
                                        <Table.Tr key={profile.id}>
                                            <Table.Td>
                                                <Text size="sm" fw={500}>{profile.student?.firstName} {profile.student?.lastName}</Text>
                                                <Text size="xs" c="dimmed">{profile.student?.admissionNo}</Text>
                                            </Table.Td>
                                            <Table.Td>{profile.student?.section?.name || 'N/A'}</Table.Td>
                                            <Table.Td>{profile.disabilityType}</Table.Td>
                                            <Table.Td>{renderSeverityBadge(profile.severity)}</Table.Td>
                                            <Table.Td>
                                                {profile.ieps.length > 0 ? (
                                                    <Badge variant="light" color="blue">
                                                        {profile.ieps[0].status} (Ends {new Date(profile.ieps[0].endDate).toLocaleDateString()})
                                                    </Badge>
                                                ) : 'None'}
                                            </Table.Td>
                                            <Table.Td style={{ textAlign: 'right' }}>
                                                <Group gap={4} justify="flex-end">
                                                    <ActionIcon variant="subtle" color="blue" onClick={() => handleOpenIepDrawer(profile)} title="Add IEP">
                                                        <IconPlus size={16} />
                                                    </ActionIcon>
                                                    <ActionIcon variant="subtle" color="gray" onClick={() => handleOpenProfileDrawer(profile)} title="Edit Profile">
                                                        <IconEdit size={16} />
                                                    </ActionIcon>
                                                    <ActionIcon variant="subtle" color="red" title="Remove Profile" onClick={() => {
                                                        if (window.confirm('Are you sure you want to remove this student from SEN? This will delete all their IEPs.')) {
                                                            deleteProfileMutation.mutate(profile.id);
                                                        }
                                                    }}>
                                                        <IconTrash size={16} />
                                                    </ActionIcon>
                                                </Group>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        )}
                    </Card>
                </Tabs.Panel>

                <Tabs.Panel value="ieps">
                    <Group justify="flex-end" mb="md">
                        <Button 
                            size="sm" 
                            leftSection={<IconPlus size={14} />} 
                            onClick={() => {
                                if (profiles.length > 0) {
                                    handleOpenIepDrawer(profiles[0]);
                                } else {
                                    notifications.show({ title: 'Notice', message: 'Register an SEN student first', color: 'blue' });
                                }
                            }}
                        >
                            Create New IEP
                        </Button>
                    </Group>
                    {allIeps.length === 0 ? (
                        <Card withBorder py="xl"><Center><Text c="dimmed">No active IEPs found.</Text></Center></Card>
                    ) : (
                        <Grid>
                            {allIeps.map((iepDetail: any) => (
                                <Grid.Col key={iepDetail.id} span={{ base: 12, md: 6 }}>
                                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                                        <Group justify="space-between" mb="xs">
                                            <Stack gap={0}>
                                                <Text fw={700}>{iepDetail.title}</Text>
                                                <Text size="sm" c="dimmed">{iepDetail.student?.firstName} {iepDetail.student?.lastName}</Text>
                                            </Stack>
                                            <Badge color={iepDetail.status === 'ACTIVE' ? 'green' : 'gray'}>{iepDetail.status}</Badge>
                                        </Group>

                                        <Group gap="xs" mb="md">
                                            <Text size="xs" c="dimmed">Period: {new Date(iepDetail.startDate).toLocaleDateString()} - {new Date(iepDetail.endDate).toLocaleDateString()}</Text>
                                        </Group>

                                        <Text size="sm" mb="xs" fw={500}>Accommodations:</Text>
                                        <List size="xs" spacing="xs" mb="md">
                                            {Array.isArray(iepDetail.accommodations) && iepDetail.accommodations.length > 0 ? iepDetail.accommodations.map((acc: string, idx: number) => (
                                                <List.Item key={idx}>{acc}</List.Item>
                                            )) : <Text size="xs" c="dimmed">No accommodations listed.</Text>}
                                        </List>

                                        <Group justify="flex-end" gap="xs">
                                            <Button size="xs" variant="light" leftSection={<IconEdit size={14} />} onClick={() => handleOpenIepDrawer(iepDetail.profile, iepDetail)}>Edit</Button>
                                            <Button size="xs" variant="light" color="red" leftSection={<IconTrash size={14} />} onClick={() => deleteIepMutation.mutate(iepDetail.id)}>Delete</Button>
                                        </Group>
                                    </Card>
                                </Grid.Col>
                            ))}
                        </Grid>
                    )}
                </Tabs.Panel>
            </Tabs>

            <Drawer 
                opened={registerOpened} 
                onClose={closeRegister} 
                title="Register student for SEN"
                position="right"
                size="md"
            >
                <form onSubmit={handleRegister}>
                    <Stack>
                        <Select 
                            name="studentId" 
                            label="Student" 
                            placeholder="Select student"
                            data={studentOptions}
                            searchable
                            required 
                        />
                        <TextInput name="disabilityType" label="Disability/Need Type" placeholder="e.g. Dyslexia, Visual Impairment" required />
                        <Select 
                            name="severity" 
                            label="Severity" 
                            data={['MILD', 'MODERATE', 'SEVERE']} 
                            defaultValue="MILD" 
                        />
                        <TextInput name="notes" label="Initial Notes" />
                        <Divider my="md" />
                        <Button fullWidth type="submit" color="grape" loading={registerStudentMutation.isPending}>
                            Register Student
                        </Button>
                    </Stack>
                </form>
            </Drawer>

            <Drawer 
                opened={opened} 
                onClose={close} 
                title="Edit SEN Profile"
                position="right"
                size="md"
            >
                <form onSubmit={handleUpdateProfile}>
                    <Stack>
                        <TextInput 
                            label="Student" 
                            value={editingProfile ? `${editingProfile.student?.firstName} ${editingProfile.student?.lastName}` : ''} 
                            disabled 
                        />
                        <TextInput name="disabilityType" label="Disability Type" defaultValue={editingProfile?.disabilityType} required />
                        <Select 
                            name="severity" 
                            label="Severity" 
                            data={['MILD', 'MODERATE', 'SEVERE']} 
                            defaultValue={editingProfile?.severity} 
                        />
                        <TextInput name="notes" label="Notes" defaultValue={editingProfile?.notes} />
                        <Divider my="md" />
                        <Button fullWidth type="submit" loading={updateProfileMutation.isPending}>
                            Update Profile
                        </Button>
                    </Stack>
                </form>
            </Drawer>

            <Drawer 
                opened={iepDrawerOpened} 
                onClose={closeIepDrawer} 
                title={editingIep ? 'Edit IEP' : 'Create New IEP'}
                position="right"
                size="md"
            >
                <form onSubmit={handleSaveIep}>
                    <Stack>
                        {!editingIep && (
                            <Select 
                                label="Student Profile" 
                                value={selectedProfile?.id}
                                onChange={(val) => setSelectedProfile(profiles.find((p: any) => p.id === val))}
                                data={profiles.map((p: any) => ({ value: p.id, label: `${p.student?.firstName} ${p.student?.lastName}` }))}
                                required
                            />
                        )}
                        <TextInput name="title" label="IEP Title" placeholder="e.g. Annual Review 2026" defaultValue={editingIep?.title} required />
                        <Grid>
                            <Grid.Col span={6}>
                                <TextInput name="startDate" label="Start Date" type="date" defaultValue={editingIep?.startDate?.split('T')[0]} required />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <TextInput name="endDate" label="End Date" type="date" defaultValue={editingIep?.endDate?.split('T')[0]} required />
                            </Grid.Col>
                        </Grid>
                        <Select 
                            name="status" 
                            label="Status" 
                            data={['ACTIVE', 'COMPLETED', 'ARCHIVED']} 
                            defaultValue={editingIep?.status || 'ACTIVE'} 
                        />
                        <TextInput 
                            name="accommodations" 
                            label="Accommodations (comma separated)" 
                            placeholder="e.g. Extra time, Braille materials" 
                            defaultValue={editingIep?.accommodations?.join(', ')}
                        />
                        <Divider my="md" />
                        <Button fullWidth type="submit" loading={createIepMutation.isPending || updateIepMutation.isPending}>
                            {editingIep ? 'Update' : 'Create'} IEP
                        </Button>
                    </Stack>
                </form>
            </Drawer>
        </Container>
    );
}
