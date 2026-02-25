import { useState, useEffect } from 'react';
import { Title, Tabs, Paper, Text, Group, Button, Table, Badge, Grid, Card, ThemeIcon, Drawer, Stack, LoadingOverlay, ActionIcon, TextInput, Textarea, Select } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconHeartbeat, IconStethoscope, IconUser, IconPlus, IconTrash, IconSearch } from '@tabler/icons-react';
import { api } from '../services/api';

export default function Health() {
    const [activeTab, setActiveTab] = useState<string | null>('visits');
    const [visits, setVisits] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ totalVisits: 0, todayVisits: 0, profilesRecorded: 0 });
    const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
    const [search, setSearch] = useState('');

    const visitForm = useForm({
        initialValues: { studentId: '', complaint: '', diagnosis: '', treatment: '', attendedBy: '' },
        validate: {
            studentId: (v) => (!v ? 'Student ID required' : null),
            complaint: (v) => (!v ? 'Complaint required' : null),
        },
    });

    const profileForm = useForm({
        initialValues: { studentId: '', bloodType: '', allergies: '', medications: '', conditions: '', emergencyContact: '' },
        validate: { studentId: (v) => (!v ? 'Student ID required' : null) },
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [visitsRes, statsRes] = await Promise.allSettled([
                api.get('/health/visits'),
                api.get('/health/stats'),
            ]);
            if (visitsRes.status === 'fulfilled') setVisits(visitsRes.value.data || []);
            if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSaveVisit = async (values: typeof visitForm.values) => {
        try {
            await api.post('/health/visits', values);
            notifications.show({ title: 'Success', message: 'Visit logged', color: 'green' });
            closeDrawer(); visitForm.reset(); fetchData();
        } catch (err: any) { notifications.show({ title: 'Error', message: err.response?.data?.message || 'Failed', color: 'red' }); }
    };

    const handleSaveProfile = async (values: typeof profileForm.values) => {
        try {
            await api.post('/health/profiles', values);
            notifications.show({ title: 'Success', message: 'Medical profile saved', color: 'green' });
            closeDrawer(); profileForm.reset(); fetchData();
        } catch (err: any) { notifications.show({ title: 'Error', message: err.response?.data?.message || 'Failed', color: 'red' }); }
    };

    const handleDeleteVisit = async (id: string) => {
        try { await api.delete(`/health/visits/${id}`); notifications.show({ title: 'Deleted', message: 'Visit removed', color: 'green' }); fetchData(); }
        catch (err: any) { notifications.show({ title: 'Error', message: err.response?.data?.message || 'Failed', color: 'red' }); }
    };

    const filtered = visits.filter(v =>
        (v.student?.firstName + ' ' + v.student?.lastName).toLowerCase().includes(search.toLowerCase()) ||
        v.complaint?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <Title order={2} mb="lg">Health & Clinic</Title>

            {/* Stats */}
            <Grid mb="lg">
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card shadow="sm" radius="md" p="md" withBorder>
                        <Group justify="space-between" mb="xs"><Text fw={500} c="dimmed">Total Visits</Text><ThemeIcon variant="light" color="red"><IconHeartbeat size={16} /></ThemeIcon></Group>
                        <Text fw={700} size="xl">{stats.totalVisits}</Text>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card shadow="sm" radius="md" p="md" withBorder>
                        <Group justify="space-between" mb="xs"><Text fw={500} c="dimmed">Today's Visits</Text><ThemeIcon variant="light" color="blue"><IconStethoscope size={16} /></ThemeIcon></Group>
                        <Text fw={700} size="xl">{stats.todayVisits}</Text>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card shadow="sm" radius="md" p="md" withBorder>
                        <Group justify="space-between" mb="xs"><Text fw={500} c="dimmed">Medical Profiles</Text><ThemeIcon variant="light" color="green"><IconUser size={16} /></ThemeIcon></Group>
                        <Text fw={700} size="xl">{stats.profilesRecorded}</Text>
                    </Card>
                </Grid.Col>
            </Grid>

            <Tabs value={activeTab} onChange={setActiveTab} radius="md">
                <Tabs.List mb="md">
                    <Tabs.Tab value="visits" leftSection={<IconStethoscope size={16} />}>Clinic Visits</Tabs.Tab>
                    <Tabs.Tab value="profiles" leftSection={<IconUser size={16} />}>Medical Profiles</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="visits">
                    <Paper p="lg" radius="md" shadow="sm" withBorder pos="relative">
                        <LoadingOverlay visible={loading} />
                        <Group justify="space-between" mb="md">
                            <TextInput placeholder="Search visits..." leftSection={<IconSearch size={16} />} value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, maxWidth: 300 }} />
                            <Button leftSection={<IconPlus size={16} />} onClick={openDrawer}>Log Visit</Button>
                        </Group>
                        {filtered.length === 0 ? (
                            <Text ta="center" c="dimmed" py="xl">No clinic visits found. Click "Log Visit" to get started.</Text>
                        ) : (
                            <Table striped highlightOnHover>
                                <Table.Thead><Table.Tr><Table.Th>Student</Table.Th><Table.Th>Date</Table.Th><Table.Th>Complaint</Table.Th><Table.Th>Diagnosis</Table.Th><Table.Th>Treatment</Table.Th><Table.Th>Actions</Table.Th></Table.Tr></Table.Thead>
                                <Table.Tbody>{filtered.map(v => (
                                    <Table.Tr key={v.id}>
                                        <Table.Td fw={500}>{v.student?.firstName} {v.student?.lastName}</Table.Td>
                                        <Table.Td>{new Date(v.date).toLocaleDateString()}</Table.Td>
                                        <Table.Td>{v.complaint}</Table.Td>
                                        <Table.Td>{v.diagnosis || '—'}</Table.Td>
                                        <Table.Td>{v.treatment || '—'}</Table.Td>
                                        <Table.Td><ActionIcon color="red" variant="subtle" onClick={() => handleDeleteVisit(v.id)}><IconTrash size={16} /></ActionIcon></Table.Td>
                                    </Table.Tr>
                                ))}</Table.Tbody>
                            </Table>
                        )}
                    </Paper>
                </Tabs.Panel>

                <Tabs.Panel value="profiles">
                    <Paper p="lg" radius="md" shadow="sm" withBorder>
                        <Group justify="space-between" mb="md">
                            <Text c="dimmed">Create or update a student's medical profile</Text>
                            <Button leftSection={<IconPlus size={16} />} onClick={() => { setActiveTab('profiles'); openDrawer(); }}>New Profile</Button>
                        </Group>
                        <Text ta="center" c="dimmed" py="xl">Select a student from the Students page or use the form to create/update a medical profile.</Text>
                    </Paper>
                </Tabs.Panel>
            </Tabs>

            {/* Drawer */}
            <Drawer opened={drawerOpened} onClose={closeDrawer} title={activeTab === 'profiles' ? 'Medical Profile' : 'Log Clinic Visit'} position="right" size="md">
                {activeTab === 'profiles' ? (
                    <form onSubmit={profileForm.onSubmit(handleSaveProfile)}>
                        <Stack>
                            <TextInput label="Student ID" required {...profileForm.getInputProps('studentId')} />
                            <Select label="Blood Type" data={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']} {...profileForm.getInputProps('bloodType')} />
                            <Textarea label="Allergies" placeholder="List known allergies" {...profileForm.getInputProps('allergies')} />
                            <Textarea label="Current Medications" {...profileForm.getInputProps('medications')} />
                            <Textarea label="Chronic Conditions" {...profileForm.getInputProps('conditions')} />
                            <TextInput label="Emergency Contact" placeholder="+263..." {...profileForm.getInputProps('emergencyContact')} />
                            <Group justify="flex-end" mt="md"><Button variant="default" onClick={closeDrawer}>Cancel</Button><Button type="submit">Save Profile</Button></Group>
                        </Stack>
                    </form>
                ) : (
                    <form onSubmit={visitForm.onSubmit(handleSaveVisit)}>
                        <Stack>
                            <TextInput label="Student ID" required {...visitForm.getInputProps('studentId')} />
                            <Textarea label="Complaint" required {...visitForm.getInputProps('complaint')} />
                            <TextInput label="Diagnosis" {...visitForm.getInputProps('diagnosis')} />
                            <Textarea label="Treatment Given" {...visitForm.getInputProps('treatment')} />
                            <TextInput label="Attended By (Staff ID)" {...visitForm.getInputProps('attendedBy')} />
                            <Group justify="flex-end" mt="md"><Button variant="default" onClick={closeDrawer}>Cancel</Button><Button type="submit">Save Visit</Button></Group>
                        </Stack>
                    </form>
                )}
            </Drawer>
        </div>
    );
}
