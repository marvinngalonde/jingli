import { useState, useEffect } from 'react';
import { Title, Tabs, Paper, Text, Group, Button, Table, Badge, Grid, Card, ThemeIcon, Drawer, Stack, LoadingOverlay, ActionIcon, TextInput, NumberInput, Select } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconHome2, IconBed, IconDoorExit, IconPlus, IconTrash, IconSearch, IconCheck, IconArrowLeft } from '@tabler/icons-react';
import { api } from '../services/api';

export default function Hostel() {
    const [activeTab, setActiveTab] = useState<string | null>('hostels');
    const [hostels, setHostels] = useState<any[]>([]);
    const [exeats, setExeats] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ hostels: 0, rooms: 0, occupiedBeds: 0, pendingExeats: 0 });
    const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
    const [drawerType, setDrawerType] = useState<'hostel' | 'exeat'>('hostel');
    const [search, setSearch] = useState('');

    const hostelForm = useForm({
        initialValues: { name: '', gender: 'MIXED', capacity: 100, warden: '' },
        validate: { name: (v) => (!v ? 'Name is required' : null), capacity: (v) => (v <= 0 ? 'Must be > 0' : null) },
    });

    const exeatForm = useForm({
        initialValues: { studentId: '', reason: '', departDate: '', returnDate: '', guardianName: '' },
        validate: {
            studentId: (v) => (!v ? 'Student ID required' : null),
            reason: (v) => (!v ? 'Reason required' : null),
            departDate: (v) => (!v ? 'Required' : null),
            returnDate: (v) => (!v ? 'Required' : null),
        },
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [hostelsRes, exeatsRes, statsRes] = await Promise.allSettled([
                api.get('/hostel/hostels'),
                api.get('/hostel/exeats'),
                api.get('/hostel/stats'),
            ]);
            if (hostelsRes.status === 'fulfilled') setHostels(hostelsRes.value.data || []);
            if (exeatsRes.status === 'fulfilled') setExeats(exeatsRes.value.data || []);
            if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleOpenDrawer = (type: 'hostel' | 'exeat') => {
        setDrawerType(type);
        if (type === 'hostel') hostelForm.reset(); else exeatForm.reset();
        openDrawer();
    };

    const handleSaveHostel = async (values: typeof hostelForm.values) => {
        try {
            await api.post('/hostel/hostels', { ...values, capacity: Number(values.capacity) });
            notifications.show({ title: 'Success', message: 'Hostel added', color: 'green' });
            closeDrawer(); hostelForm.reset(); fetchData();
        } catch (err: any) { notifications.show({ title: 'Error', message: err.response?.data?.message || 'Failed', color: 'red' }); }
    };

    const handleSaveExeat = async (values: typeof exeatForm.values) => {
        try {
            await api.post('/hostel/exeats', values);
            notifications.show({ title: 'Success', message: 'Exeat request submitted', color: 'green' });
            closeDrawer(); exeatForm.reset(); fetchData();
        } catch (err: any) { notifications.show({ title: 'Error', message: err.response?.data?.message || 'Failed', color: 'red' }); }
    };

    const handleDeleteHostel = async (id: string) => {
        try { await api.delete(`/hostel/hostels/${id}`); notifications.show({ title: 'Deleted', message: 'Hostel removed', color: 'green' }); fetchData(); }
        catch (err: any) { notifications.show({ title: 'Error', message: err.response?.data?.message || 'Failed', color: 'red' }); }
    };

    const handleApproveExeat = async (id: string) => {
        try { await api.patch(`/hostel/exeats/${id}/approve`); notifications.show({ title: 'Approved', message: 'Exeat approved', color: 'green' }); fetchData(); }
        catch (err: any) { notifications.show({ title: 'Error', message: err.response?.data?.message || 'Failed', color: 'red' }); }
    };

    const handleReturnExeat = async (id: string) => {
        try { await api.patch(`/hostel/exeats/${id}/return`); notifications.show({ title: 'Returned', message: 'Student marked returned', color: 'green' }); fetchData(); }
        catch (err: any) { notifications.show({ title: 'Error', message: err.response?.data?.message || 'Failed', color: 'red' }); }
    };

    const filteredHostels = hostels.filter(h => h.name?.toLowerCase().includes(search.toLowerCase()));
    const filteredExeats = exeats.filter(e =>
        (e.student?.firstName + ' ' + e.student?.lastName).toLowerCase().includes(search.toLowerCase()) ||
        e.reason?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <Title order={2} mb="lg">Hostel & Boarding</Title>

            {/* Stats */}
            <Grid mb="lg">
                <Grid.Col span={{ base: 12, md: 3 }}>
                    <Card shadow="sm" radius="md" p="md" withBorder>
                        <Group justify="space-between" mb="xs"><Text fw={500} c="dimmed">Hostels</Text><ThemeIcon variant="light" color="blue"><IconHome2 size={16} /></ThemeIcon></Group>
                        <Text fw={700} size="xl">{stats.hostels}</Text>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 3 }}>
                    <Card shadow="sm" radius="md" p="md" withBorder>
                        <Group justify="space-between" mb="xs"><Text fw={500} c="dimmed">Rooms</Text><ThemeIcon variant="light" color="green"><IconBed size={16} /></ThemeIcon></Group>
                        <Text fw={700} size="xl">{stats.rooms}</Text>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 3 }}>
                    <Card shadow="sm" radius="md" p="md" withBorder>
                        <Group justify="space-between" mb="xs"><Text fw={500} c="dimmed">Occupied Beds</Text><ThemeIcon variant="light" color="orange"><IconBed size={16} /></ThemeIcon></Group>
                        <Text fw={700} size="xl">{stats.occupiedBeds}</Text>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 3 }}>
                    <Card shadow="sm" radius="md" p="md" withBorder>
                        <Group justify="space-between" mb="xs"><Text fw={500} c="dimmed">Pending Exeats</Text><ThemeIcon variant="light" color="red"><IconDoorExit size={16} /></ThemeIcon></Group>
                        <Text fw={700} size="xl">{stats.pendingExeats}</Text>
                    </Card>
                </Grid.Col>
            </Grid>

            <Tabs value={activeTab} onChange={setActiveTab} radius="md">
                <Tabs.List mb="md">
                    <Tabs.Tab value="hostels" leftSection={<IconHome2 size={16} />}>Hostels</Tabs.Tab>
                    <Tabs.Tab value="exeats" leftSection={<IconDoorExit size={16} />}>Exeats</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="hostels">
                    <Paper p="lg" radius="md" shadow="sm" withBorder pos="relative">
                        <LoadingOverlay visible={loading} />
                        <Group justify="space-between" mb="md">
                            <TextInput placeholder="Search hostels..." leftSection={<IconSearch size={16} />} value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, maxWidth: 300 }} />
                            <Button leftSection={<IconPlus size={16} />} onClick={() => handleOpenDrawer('hostel')}>Add Hostel</Button>
                        </Group>
                        {filteredHostels.length === 0 ? (
                            <Text ta="center" c="dimmed" py="xl">No hostels found. Click "Add Hostel" to get started.</Text>
                        ) : (
                            <Table striped highlightOnHover>
                                <Table.Thead><Table.Tr><Table.Th>Name</Table.Th><Table.Th>Gender</Table.Th><Table.Th>Capacity</Table.Th><Table.Th>Rooms</Table.Th><Table.Th>Warden</Table.Th><Table.Th>Actions</Table.Th></Table.Tr></Table.Thead>
                                <Table.Tbody>{filteredHostels.map(h => (
                                    <Table.Tr key={h.id}>
                                        <Table.Td fw={500}>{h.name}</Table.Td>
                                        <Table.Td><Badge variant="light">{h.gender}</Badge></Table.Td>
                                        <Table.Td>{h.capacity}</Table.Td>
                                        <Table.Td>{h.rooms?.length || 0}</Table.Td>
                                        <Table.Td>{h.warden || '—'}</Table.Td>
                                        <Table.Td><ActionIcon color="red" variant="subtle" onClick={() => handleDeleteHostel(h.id)}><IconTrash size={16} /></ActionIcon></Table.Td>
                                    </Table.Tr>
                                ))}</Table.Tbody>
                            </Table>
                        )}
                    </Paper>
                </Tabs.Panel>

                <Tabs.Panel value="exeats">
                    <Paper p="lg" radius="md" shadow="sm" withBorder pos="relative">
                        <LoadingOverlay visible={loading} />
                        <Group justify="space-between" mb="md">
                            <TextInput placeholder="Search exeats..." leftSection={<IconSearch size={16} />} value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, maxWidth: 300 }} />
                            <Button leftSection={<IconPlus size={16} />} onClick={() => handleOpenDrawer('exeat')}>New Exeat</Button>
                        </Group>
                        {filteredExeats.length === 0 ? (
                            <Text ta="center" c="dimmed" py="xl">No exeat requests found.</Text>
                        ) : (
                            <Table striped highlightOnHover>
                                <Table.Thead><Table.Tr><Table.Th>Student</Table.Th><Table.Th>Reason</Table.Th><Table.Th>Depart</Table.Th><Table.Th>Return</Table.Th><Table.Th>Status</Table.Th><Table.Th>Actions</Table.Th></Table.Tr></Table.Thead>
                                <Table.Tbody>{filteredExeats.map(e => (
                                    <Table.Tr key={e.id}>
                                        <Table.Td fw={500}>{e.student?.firstName} {e.student?.lastName}</Table.Td>
                                        <Table.Td>{e.reason}</Table.Td>
                                        <Table.Td>{new Date(e.departDate).toLocaleDateString()}</Table.Td>
                                        <Table.Td>{new Date(e.returnDate).toLocaleDateString()}</Table.Td>
                                        <Table.Td><Badge color={e.status === 'APPROVED' ? 'green' : e.status === 'RETURNED' ? 'blue' : 'orange'} variant="light">{e.status}</Badge></Table.Td>
                                        <Table.Td>
                                            <Group gap={4}>
                                                {e.status === 'PENDING' && <ActionIcon color="green" variant="subtle" onClick={() => handleApproveExeat(e.id)} title="Approve"><IconCheck size={16} /></ActionIcon>}
                                                {e.status === 'APPROVED' && <ActionIcon color="blue" variant="subtle" onClick={() => handleReturnExeat(e.id)} title="Mark Returned"><IconArrowLeft size={16} /></ActionIcon>}
                                            </Group>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}</Table.Tbody>
                            </Table>
                        )}
                    </Paper>
                </Tabs.Panel>
            </Tabs>

            {/* Drawer */}
            <Drawer opened={drawerOpened} onClose={closeDrawer} title={drawerType === 'hostel' ? 'Add Hostel' : 'New Exeat Request'} position="right" size="md">
                {drawerType === 'hostel' ? (
                    <form onSubmit={hostelForm.onSubmit(handleSaveHostel)}>
                        <Stack>
                            <TextInput label="Hostel Name" required {...hostelForm.getInputProps('name')} />
                            <Select label="Gender" data={['BOYS', 'GIRLS', 'MIXED']} {...hostelForm.getInputProps('gender')} />
                            <NumberInput label="Capacity" min={1} required {...hostelForm.getInputProps('capacity')} />
                            <TextInput label="Warden Name" {...hostelForm.getInputProps('warden')} />
                            <Group justify="flex-end" mt="md"><Button variant="default" onClick={closeDrawer}>Cancel</Button><Button type="submit">Save</Button></Group>
                        </Stack>
                    </form>
                ) : (
                    <form onSubmit={exeatForm.onSubmit(handleSaveExeat)}>
                        <Stack>
                            <TextInput label="Student ID" required {...exeatForm.getInputProps('studentId')} />
                            <TextInput label="Reason" required {...exeatForm.getInputProps('reason')} />
                            <TextInput label="Depart Date" type="date" required {...exeatForm.getInputProps('departDate')} />
                            <TextInput label="Return Date" type="date" required {...exeatForm.getInputProps('returnDate')} />
                            <TextInput label="Guardian Name" {...exeatForm.getInputProps('guardianName')} />
                            <Group justify="flex-end" mt="md"><Button variant="default" onClick={closeDrawer}>Cancel</Button><Button type="submit">Submit</Button></Group>
                        </Stack>
                    </form>
                )}
            </Drawer>
        </div>
    );
}
