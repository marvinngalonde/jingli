import { useState, useEffect } from 'react';
import { Title, Tabs, Paper, Text, Group, Button, Table, Badge, Grid, Card, ThemeIcon, Drawer, Stack, LoadingOverlay, ActionIcon, TextInput, NumberInput, Select, Textarea, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconBus, IconRoute, IconUsers, IconPlus, IconTrash, IconEdit, IconSearch, IconEye } from '@tabler/icons-react';
import { api } from '../../services/api';

export default function Transport() {
    const [activeTab, setActiveTab] = useState<string | null>('vehicles');
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [routes, setRoutes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [stats, setStats] = useState({ totalVehicles: 0, activeRoutes: 0, studentsOnRoutes: 0 });
    const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
    const [drawerType, setDrawerType] = useState<'vehicle' | 'route'>('vehicle');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [deleteModal, setDeleteModal] = useState<{ opened: boolean; id: string; type: 'vehicle' | 'route'; name: string }>({ opened: false, id: '', type: 'vehicle', name: '' });

    const vehicleForm = useForm({
        initialValues: { regNumber: '', make: '', model: '', capacity: 50, insuranceExpiry: '', nextServiceDate: '' },
        validate: {
            regNumber: (v) => (!v ? 'Registration number is required' : null),
            capacity: (v) => (v <= 0 ? 'Capacity must be > 0' : null),
        },
    });

    const routeForm = useForm({
        initialValues: { name: '', description: '', vehicleId: '', driverName: '', startTime: '', endTime: '' },
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

    const handleOpenDrawer = (type: 'vehicle' | 'route', item?: any) => {
        setDrawerType(type);
        setEditingId(item?.id || null);
        if (type === 'vehicle') {
            vehicleForm.setValues(item ? {
                regNumber: item.regNumber || '',
                make: item.make || '',
                model: item.model || '',
                capacity: item.capacity || 50,
                insuranceExpiry: item.insuranceExpiry ? item.insuranceExpiry.split('T')[0] : '',
                nextServiceDate: item.nextServiceDate ? item.nextServiceDate.split('T')[0] : '',
            } : { regNumber: '', make: '', model: '', capacity: 50, insuranceExpiry: '', nextServiceDate: '' });
        } else {
            routeForm.setValues(item ? {
                name: item.name || '',
                description: item.description || '',
                vehicleId: item.vehicleId || '',
                driverName: item.driverName || '',
                startTime: item.startTime || '',
                endTime: item.endTime || '',
            } : { name: '', description: '', vehicleId: '', driverName: '', startTime: '', endTime: '' });
        }
        openDrawer();
    };

    const handleSaveVehicle = async (values: typeof vehicleForm.values) => {
        setSubmitting(true);
        try {
            if (editingId) {
                await api.patch(`/transport/vehicles/${editingId}`, values);
                notifications.show({ title: 'Success', message: 'Vehicle updated', color: 'green' });
            } else {
                await api.post('/transport/vehicles', values);
                notifications.show({ title: 'Success', message: 'Vehicle added', color: 'green' });
            }
            closeDrawer();
            vehicleForm.reset();
            setEditingId(null);
            fetchData();
        } catch (err: any) {
            notifications.show({ title: 'Error', message: err.response?.data?.message || 'Failed to save vehicle', color: 'red' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleSaveRoute = async (values: typeof routeForm.values) => {
        setSubmitting(true);
        try {
            const payload = {
                ...values,
                vehicleId: values.vehicleId || undefined,
            };
            if (editingId) {
                await api.patch(`/transport/routes/${editingId}`, payload);
                notifications.show({ title: 'Success', message: 'Route updated', color: 'green' });
            } else {
                await api.post('/transport/routes', payload);
                notifications.show({ title: 'Success', message: 'Route added', color: 'green' });
            }
            closeDrawer();
            routeForm.reset();
            setEditingId(null);
            fetchData();
        } catch (err: any) {
            notifications.show({ title: 'Error', message: err.response?.data?.message || 'Failed to save route', color: 'red' });
        } finally {
            setSubmitting(false);
        }
    };

    const confirmDelete = (id: string, type: 'vehicle' | 'route', name: string) => {
        setDeleteModal({ opened: true, id, type, name });
    };

    const handleDelete = async () => {
        const { id, type } = deleteModal;
        try {
            await api.delete(`/transport/${type === 'vehicle' ? 'vehicles' : 'routes'}/${id}`);
            notifications.show({ title: 'Deleted', message: `${type === 'vehicle' ? 'Vehicle' : 'Route'} removed`, color: 'green' });
            fetchData();
        } catch (err: any) {
            notifications.show({ title: 'Error', message: err.response?.data?.message || 'Failed to delete', color: 'red' });
        } finally {
            setDeleteModal({ opened: false, id: '', type: 'vehicle', name: '' });
        }
    };

    const filteredVehicles = vehicles.filter(v =>
        v.regNumber?.toLowerCase().includes(search.toLowerCase()) ||
        v.make?.toLowerCase().includes(search.toLowerCase())
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
                                        <Table.Th>Status</Table.Th>
                                        <Table.Th>Actions</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {filteredVehicles.map(v => (
                                        <Table.Tr key={v.id}>
                                            <Table.Td fw={500}>{v.regNumber}</Table.Td>
                                            <Table.Td>{v.make} {v.model}</Table.Td>
                                            <Table.Td>{v.capacity}</Table.Td>
                                            <Table.Td><Badge color={v.status === 'ACTIVE' ? 'green' : 'gray'} variant="light">{v.status}</Badge></Table.Td>
                                            <Table.Td>
                                                <Group gap="xs">
                                                    <ActionIcon color="blue" variant="subtle" onClick={() => handleOpenDrawer('vehicle', v)}><IconEdit size={16} /></ActionIcon>
                                                    <ActionIcon color="red" variant="subtle" onClick={() => confirmDelete(v.id, 'vehicle', v.regNumber)}><IconTrash size={16} /></ActionIcon>
                                                </Group>
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
                                        <Table.Th>Vehicle</Table.Th>
                                        <Table.Th>Driver</Table.Th>
                                        <Table.Th>Students</Table.Th>
                                        <Table.Th>Status</Table.Th>
                                        <Table.Th>Actions</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {filteredRoutes.map(r => (
                                        <Table.Tr key={r.id}>
                                            <Table.Td fw={500}>{r.name}</Table.Td>
                                            <Table.Td>{r.vehicle ? `${r.vehicle.regNumber} (${r.vehicle.make})` : '—'}</Table.Td>
                                            <Table.Td>{r.driverName || '—'}</Table.Td>
                                            <Table.Td><Badge variant="light">{r.students?.length || 0}</Badge></Table.Td>
                                            <Table.Td><Badge color={r.status === 'ACTIVE' ? 'green' : 'gray'} variant="light">{r.status}</Badge></Table.Td>
                                            <Table.Td>
                                                <Group gap="xs">
                                                    <ActionIcon color="blue" variant="subtle" onClick={() => handleOpenDrawer('route', r)}><IconEdit size={16} /></ActionIcon>
                                                    <ActionIcon color="red" variant="subtle" onClick={() => confirmDelete(r.id, 'route', r.name)}><IconTrash size={16} /></ActionIcon>
                                                </Group>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        )}
                    </Paper>
                </Tabs.Panel>
            </Tabs>

            {/* Drawer for Adding/Editing */}
            <Drawer opened={drawerOpened} onClose={closeDrawer} title={editingId ? `Edit ${drawerType === 'vehicle' ? 'Vehicle' : 'Route'}` : `Add ${drawerType === 'vehicle' ? 'Vehicle' : 'Route'}`} position="right" size="md">
                {drawerType === 'vehicle' ? (
                    <form onSubmit={vehicleForm.onSubmit(handleSaveVehicle)}>
                        <Stack>
                            <TextInput label="Registration No." placeholder="e.g. AEF 1234" required {...vehicleForm.getInputProps('regNumber')} />
                            <Group grow>
                                <TextInput label="Make" placeholder="e.g. Toyota" {...vehicleForm.getInputProps('make')} />
                                <TextInput label="Model" placeholder="e.g. HiAce" {...vehicleForm.getInputProps('model')} />
                            </Group>
                            <NumberInput label="Capacity" placeholder="Number of seats" min={1} required {...vehicleForm.getInputProps('capacity')} />
                            <TextInput label="Insurance Expiry" type="date" {...vehicleForm.getInputProps('insuranceExpiry')} />
                            <TextInput label="Next Service Date" type="date" {...vehicleForm.getInputProps('nextServiceDate')} />
                            <Group justify="flex-end" mt="md">
                                <Button variant="default" onClick={closeDrawer}>Cancel</Button>
                                <Button type="submit" loading={submitting}>{editingId ? 'Update Vehicle' : 'Save Vehicle'}</Button>
                            </Group>
                        </Stack>
                    </form>
                ) : (
                    <form onSubmit={routeForm.onSubmit(handleSaveRoute)}>
                        <Stack>
                            <TextInput label="Route Name" placeholder="e.g. North Route" required {...routeForm.getInputProps('name')} />
                            <Textarea label="Description" placeholder="Description" {...routeForm.getInputProps('description')} />
                            <Select
                                label="Assign Vehicle"
                                placeholder="Select a vehicle"
                                data={vehicles.map(v => ({ value: v.id, label: `${v.regNumber} - ${v.make} ${v.model}` }))}
                                clearable
                                searchable
                                {...routeForm.getInputProps('vehicleId')}
                            />
                            <TextInput label="Driver Name" placeholder="Full name" {...routeForm.getInputProps('driverName')} />
                            <Group grow>
                                <TextInput label="Start Time" placeholder="e.g. 06:30" {...routeForm.getInputProps('startTime')} />
                                <TextInput label="End Time" placeholder="e.g. 17:00" {...routeForm.getInputProps('endTime')} />
                            </Group>
                            <Group justify="flex-end" mt="md">
                                <Button variant="default" onClick={closeDrawer}>Cancel</Button>
                                <Button type="submit" loading={submitting}>{editingId ? 'Update Route' : 'Save Route'}</Button>
                            </Group>
                        </Stack>
                    </form>
                )}
            </Drawer>

            {/* Delete Confirmation Modal */}
            <Modal opened={deleteModal.opened} onClose={() => setDeleteModal({ ...deleteModal, opened: false })} title="Confirm Deletion">
                <Stack>
                    <Text size="sm">Are you sure you want to delete <b>{deleteModal.name}</b>? This cannot be undone.</Text>
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={() => setDeleteModal({ ...deleteModal, opened: false })}>Cancel</Button>
                        <Button color="red" onClick={handleDelete}>Delete</Button>
                    </Group>
                </Stack>
            </Modal>
        </div>
    );
}
