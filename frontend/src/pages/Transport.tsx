import { useState, useEffect } from 'react';
import { Title, Tabs, Paper, Text, Group, Button, Table, Badge, Grid, Card, ThemeIcon, Drawer, Stack, LoadingOverlay, ActionIcon, TextInput, NumberInput, Select, Textarea } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconBus, IconRoute, IconUsers, IconPlus, IconTrash, IconEdit, IconSearch, IconDownload } from '@tabler/icons-react';
import { api } from '../services/api';

export default function Transport() {
    const [activeTab, setActiveTab] = useState<string | null>('vehicles');
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [routes, setRoutes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ totalVehicles: 0, activeRoutes: 0, studentsOnRoutes: 0 });
    const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
    const [drawerType, setDrawerType] = useState<'vehicle' | 'route'>('vehicle');
    const [search, setSearch] = useState('');

    const vehicleForm = useForm({
        initialValues: { registrationNo: '', make: '', model: '', capacity: 50, driverName: '', driverPhone: '', status: 'ACTIVE' },
        validate: {
            registrationNo: (v) => (!v ? 'Registration number is required' : null),
            capacity: (v) => (v <= 0 ? 'Capacity must be > 0' : null),
        },
    });

    const routeForm = useForm({
        initialValues: { name: '', description: '', startPoint: '', endPoint: '', distance: 0 },
        validate: { name: (v) => (!v ? 'Route name is required' : null) },
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [vehiclesRes, routesRes, statsRes] = await Promise.allSettled([
                api.get('/transport/vehicles'),
                api.get('/transport/routes'),
                api.get('/transport/stats'),
            ]);
            if (vehiclesRes.status === 'fulfilled') setVehicles(vehiclesRes.value.data || []);
            if (routesRes.status === 'fulfilled') setRoutes(routesRes.value.data || []);
            if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleOpenDrawer = (type: 'vehicle' | 'route') => {
        setDrawerType(type);
        if (type === 'vehicle') vehicleForm.reset();
        else routeForm.reset();
        openDrawer();
    };

    const handleSaveVehicle = async (values: typeof vehicleForm.values) => {
        try {
            await api.post('/transport/vehicles', values);
            notifications.show({ title: 'Success', message: 'Vehicle added', color: 'green' });
            closeDrawer();
            vehicleForm.reset();
            fetchData();
        } catch (err: any) {
            notifications.show({ title: 'Error', message: err.response?.data?.message || 'Failed', color: 'red' });
        }
    };

    const handleSaveRoute = async (values: typeof routeForm.values) => {
        try {
            await api.post('/transport/routes', values);
            notifications.show({ title: 'Success', message: 'Route added', color: 'green' });
            closeDrawer();
            routeForm.reset();
            fetchData();
        } catch (err: any) {
            notifications.show({ title: 'Error', message: err.response?.data?.message || 'Failed', color: 'red' });
        }
    };

    const handleDeleteVehicle = async (id: string) => {
        try {
            await api.delete(`/transport/vehicles/${id}`);
            notifications.show({ title: 'Deleted', message: 'Vehicle removed', color: 'green' });
            fetchData();
        } catch (err: any) {
            notifications.show({ title: 'Error', message: err.response?.data?.message || 'Failed', color: 'red' });
        }
    };

    const handleDeleteRoute = async (id: string) => {
        try {
            await api.delete(`/transport/routes/${id}`);
            notifications.show({ title: 'Deleted', message: 'Route removed', color: 'green' });
            fetchData();
        } catch (err: any) {
            notifications.show({ title: 'Error', message: err.response?.data?.message || 'Failed', color: 'red' });
        }
    };

    const filteredVehicles = vehicles.filter(v =>
        v.registrationNo?.toLowerCase().includes(search.toLowerCase()) ||
        v.driverName?.toLowerCase().includes(search.toLowerCase())
    );

    const filteredRoutes = routes.filter(r =>
        r.name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <Title order={2} mb="lg">Transport Management</Title>

            {/* Stats Cards */}
            <Grid mb="lg">
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card shadow="sm" radius="md" p="md" withBorder>
                        <Group justify="space-between" mb="xs">
                            <Text fw={500} c="dimmed">Total Vehicles</Text>
                            <ThemeIcon variant="light" color="blue"><IconBus size={16} /></ThemeIcon>
                        </Group>
                        <Text fw={700} size="xl">{stats.totalVehicles}</Text>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card shadow="sm" radius="md" p="md" withBorder>
                        <Group justify="space-between" mb="xs">
                            <Text fw={500} c="dimmed">Active Routes</Text>
                            <ThemeIcon variant="light" color="green"><IconRoute size={16} /></ThemeIcon>
                        </Group>
                        <Text fw={700} size="xl">{stats.activeRoutes}</Text>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card shadow="sm" radius="md" p="md" withBorder>
                        <Group justify="space-between" mb="xs">
                            <Text fw={500} c="dimmed">Students on Routes</Text>
                            <ThemeIcon variant="light" color="orange"><IconUsers size={16} /></ThemeIcon>
                        </Group>
                        <Text fw={700} size="xl">{stats.studentsOnRoutes}</Text>
                    </Card>
                </Grid.Col>
            </Grid>

            <Tabs value={activeTab} onChange={setActiveTab} radius="md">
                <Tabs.List mb="md">
                    <Tabs.Tab value="vehicles" leftSection={<IconBus size={16} />}>Vehicles</Tabs.Tab>
                    <Tabs.Tab value="routes" leftSection={<IconRoute size={16} />}>Routes</Tabs.Tab>
                </Tabs.List>

                {/* Vehicles Tab */}
                <Tabs.Panel value="vehicles">
                    <Paper p="lg" radius="md" shadow="sm" withBorder pos="relative">
                        <LoadingOverlay visible={loading} />
                        <Group justify="space-between" mb="md">
                            <TextInput placeholder="Search vehicles..." leftSection={<IconSearch size={16} />} value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, maxWidth: 300 }} />
                            <Button leftSection={<IconPlus size={16} />} onClick={() => handleOpenDrawer('vehicle')}>Add Vehicle</Button>
                        </Group>
                        {filteredVehicles.length === 0 ? (
                            <Text ta="center" c="dimmed" py="xl">No vehicles found. Click "Add Vehicle" to get started.</Text>
                        ) : (
                            <Table striped highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Registration</Table.Th>
                                        <Table.Th>Make / Model</Table.Th>
                                        <Table.Th>Capacity</Table.Th>
                                        <Table.Th>Driver</Table.Th>
                                        <Table.Th>Status</Table.Th>
                                        <Table.Th>Actions</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {filteredVehicles.map(v => (
                                        <Table.Tr key={v.id}>
                                            <Table.Td fw={500}>{v.registrationNo}</Table.Td>
                                            <Table.Td>{v.make} {v.model}</Table.Td>
                                            <Table.Td>{v.capacity}</Table.Td>
                                            <Table.Td>{v.driverName || '—'}</Table.Td>
                                            <Table.Td><Badge color={v.status === 'ACTIVE' ? 'green' : 'gray'} variant="light">{v.status}</Badge></Table.Td>
                                            <Table.Td>
                                                <ActionIcon color="red" variant="subtle" onClick={() => handleDeleteVehicle(v.id)}><IconTrash size={16} /></ActionIcon>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        )}
                    </Paper>
                </Tabs.Panel>

                {/* Routes Tab */}
                <Tabs.Panel value="routes">
                    <Paper p="lg" radius="md" shadow="sm" withBorder pos="relative">
                        <LoadingOverlay visible={loading} />
                        <Group justify="space-between" mb="md">
                            <TextInput placeholder="Search routes..." leftSection={<IconSearch size={16} />} value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, maxWidth: 300 }} />
                            <Button leftSection={<IconPlus size={16} />} onClick={() => handleOpenDrawer('route')}>Add Route</Button>
                        </Group>
                        {filteredRoutes.length === 0 ? (
                            <Text ta="center" c="dimmed" py="xl">No routes found. Click "Add Route" to get started.</Text>
                        ) : (
                            <Table striped highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Name</Table.Th>
                                        <Table.Th>Start → End</Table.Th>
                                        <Table.Th>Distance (km)</Table.Th>
                                        <Table.Th>Description</Table.Th>
                                        <Table.Th>Actions</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {filteredRoutes.map(r => (
                                        <Table.Tr key={r.id}>
                                            <Table.Td fw={500}>{r.name}</Table.Td>
                                            <Table.Td>{r.startPoint} → {r.endPoint}</Table.Td>
                                            <Table.Td>{r.distance || '—'}</Table.Td>
                                            <Table.Td>{r.description || '—'}</Table.Td>
                                            <Table.Td>
                                                <ActionIcon color="red" variant="subtle" onClick={() => handleDeleteRoute(r.id)}><IconTrash size={16} /></ActionIcon>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        )}
                    </Paper>
                </Tabs.Panel>
            </Tabs>

            {/* Drawer for Adding */}
            <Drawer opened={drawerOpened} onClose={closeDrawer} title={drawerType === 'vehicle' ? 'Add Vehicle' : 'Add Route'} position="right" size="md">
                {drawerType === 'vehicle' ? (
                    <form onSubmit={vehicleForm.onSubmit(handleSaveVehicle)}>
                        <Stack>
                            <TextInput label="Registration No." placeholder="e.g. AEF 1234" required {...vehicleForm.getInputProps('registrationNo')} />
                            <Group grow>
                                <TextInput label="Make" placeholder="e.g. Toyota" {...vehicleForm.getInputProps('make')} />
                                <TextInput label="Model" placeholder="e.g. HiAce" {...vehicleForm.getInputProps('model')} />
                            </Group>
                            <NumberInput label="Capacity" placeholder="Number of seats" min={1} required {...vehicleForm.getInputProps('capacity')} />
                            <TextInput label="Driver Name" placeholder="Full name" {...vehicleForm.getInputProps('driverName')} />
                            <TextInput label="Driver Phone" placeholder="+263..." {...vehicleForm.getInputProps('driverPhone')} />
                            <Select label="Status" data={['ACTIVE', 'MAINTENANCE', 'RETIRED']} {...vehicleForm.getInputProps('status')} />
                            <Group justify="flex-end" mt="md">
                                <Button variant="default" onClick={closeDrawer}>Cancel</Button>
                                <Button type="submit">Save Vehicle</Button>
                            </Group>
                        </Stack>
                    </form>
                ) : (
                    <form onSubmit={routeForm.onSubmit(handleSaveRoute)}>
                        <Stack>
                            <TextInput label="Route Name" placeholder="e.g. North Route" required {...routeForm.getInputProps('name')} />
                            <Textarea label="Description" placeholder="Description" {...routeForm.getInputProps('description')} />
                            <Group grow>
                                <TextInput label="Start Point" placeholder="e.g. School" {...routeForm.getInputProps('startPoint')} />
                                <TextInput label="End Point" placeholder="e.g. CBD" {...routeForm.getInputProps('endPoint')} />
                            </Group>
                            <NumberInput label="Distance (km)" min={0} step={0.1} {...routeForm.getInputProps('distance')} />
                            <Group justify="flex-end" mt="md">
                                <Button variant="default" onClick={closeDrawer}>Cancel</Button>
                                <Button type="submit">Save Route</Button>
                            </Group>
                        </Stack>
                    </form>
                )}
            </Drawer>
        </div>
    );
}
