import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Title, Tabs, Paper, Text, Group, Button, Table, Badge, Grid, Card, ThemeIcon, Drawer, Stack, LoadingOverlay, ActionIcon, TextInput, NumberInput, Select, Modal, Menu, Textarea } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconHome2, IconBed, IconDoorExit, IconPlus, IconTrash, IconSearch, IconCheck, IconArrowLeft, IconDotsVertical, IconUserPlus, IconEdit } from '@tabler/icons-react';
import { hostelService, type Hostel as IHostel, type Room as IRoom } from '../../services/hostelService';
import { StudentPicker } from '../../components/common/StudentPicker';

export default function Hostel() {
    const [activeTab, setActiveTab] = useState<string | null>('hostels');
    const [search, setSearch] = useState('');
    const queryClient = useQueryClient();

    const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
    const [drawerType, setDrawerType] = useState<'hostel' | 'exeat' | 'room'>('hostel');
    const [allocationModal, setAllocationModal] = useState<{ opened: boolean; room: IRoom | null }>({ opened: false, room: null });

    // Queries
    const { data: hostels = [], isLoading: hostelsLoading } = useQuery({
        queryKey: ['hostels'],
        queryFn: hostelService.getAllHostels,
        staleTime: 5 * 60 * 1000,
    });

    const { data: rooms = [], isLoading: roomsLoading } = useQuery({
        queryKey: ['rooms'],
        queryFn: () => hostelService.getAllRooms(),
        staleTime: 5 * 60 * 1000,
    });

    const { data: exeats = [], isLoading: exeatsLoading } = useQuery({
        queryKey: ['hostelExeats'],
        queryFn: () => hostelService.getAllExeats(),
        staleTime: 5 * 60 * 1000,
    });

    const { data: stats = { hostels: 0, rooms: 0, occupiedBeds: 0, pendingExeats: 0 }, isLoading: statsLoading } = useQuery({
        queryKey: ['hostelStats'],
        queryFn: hostelService.getStats,
        staleTime: 5 * 60 * 1000,
    });

    // Edit hostel state
    const [editingHostel, setEditingHostel] = useState<IHostel | null>(null);

    const loading = hostelsLoading || exeatsLoading || statsLoading || roomsLoading;

    // Mutations
    const invalidateHostelQueries = () => {
        queryClient.invalidateQueries({ queryKey: ['hostels'] });
        queryClient.invalidateQueries({ queryKey: ['rooms'] });
        queryClient.invalidateQueries({ queryKey: ['hostelStats'] });
    };

    const handleError = (err: any) => notifications.show({ title: 'Error', message: err.response?.data?.message || err.message || 'Action failed', color: 'red' });

    const hostelMutation = useMutation({
        mutationFn: (data: any) => editingHostel
            ? hostelService.updateHostel(editingHostel.id, data)
            : hostelService.createHostel(data),
        onSuccess: () => {
            notifications.show({ title: 'Success', message: editingHostel ? 'Hostel updated' : 'Hostel added', color: 'green' });
            invalidateHostelQueries();
            closeDrawer();
            hostelForm.reset();
            setEditingHostel(null);
        },
        onError: handleError
    });

    const roomMutation = useMutation({
        mutationFn: hostelService.createRoom,
        onSuccess: () => {
            notifications.show({ title: 'Success', message: 'Room added', color: 'green' });
            invalidateHostelQueries();
            closeDrawer();
            roomForm.reset();
        },
        onError: handleError
    });

    const deleteHostelMutation = useMutation({
        mutationFn: hostelService.deleteHostel,
        onSuccess: () => {
            notifications.show({ title: 'Deleted', message: 'Hostel removed', color: 'green' });
            invalidateHostelQueries();
        },
        onError: handleError
    });

    const deleteRoomMutation = useMutation({
        mutationFn: hostelService.deleteRoom,
        onSuccess: () => {
            notifications.show({ title: 'Deleted', message: 'Room removed', color: 'green' });
            invalidateHostelQueries();
        },
        onError: handleError
    });

    const allocateBedMutation = useMutation({
        mutationFn: hostelService.allocateBed,
        onSuccess: () => {
            notifications.show({ title: 'Success', message: 'Bed allocated', color: 'green' });
            invalidateHostelQueries();
            setAllocationModal({ opened: false, room: null });
            allocationForm.reset();
        },
        onError: handleError
    });

    const deallocateBedMutation = useMutation({
        mutationFn: hostelService.deallocateBed,
        onSuccess: () => {
            notifications.show({ title: 'Success', message: 'Bed deallocated', color: 'green' });
            invalidateHostelQueries();
        },
        onError: handleError
    });

    // Exeat Mutations
    const exeatMutation = useMutation({
        mutationFn: hostelService.createExeat,
        onSuccess: () => {
            notifications.show({ title: 'Success', message: 'Exeat request submitted', color: 'green' });
            queryClient.invalidateQueries({ queryKey: ['hostelExeats'] });
            queryClient.invalidateQueries({ queryKey: ['hostelStats'] });
            closeDrawer();
            exeatForm.reset();
        },
        onError: handleError
    });

    const approveExeatMutation = useMutation({
        mutationFn: hostelService.approveExeat,
        onSuccess: () => {
            notifications.show({ title: 'Approved', message: 'Exeat approved', color: 'green' });
            queryClient.invalidateQueries({ queryKey: ['hostelExeats'] });
            queryClient.invalidateQueries({ queryKey: ['hostelStats'] });
        },
        onError: handleError
    });

    const returnExeatMutation = useMutation({
        mutationFn: hostelService.markReturned,
        onSuccess: () => {
            notifications.show({ title: 'Returned', message: 'Student marked returned', color: 'green' });
            queryClient.invalidateQueries({ queryKey: ['hostelExeats'] });
            queryClient.invalidateQueries({ queryKey: ['hostelStats'] });
        },
        onError: handleError
    });

    // Forms
    const hostelForm = useForm({
        initialValues: { name: '', gender: 'MIXED' as any, capacity: 100, warden: '' },
        validate: { name: (v) => (!v ? 'Name is required' : null), capacity: (v) => (v <= 0 ? 'Must be > 0' : null) },
    });

    const roomForm = useForm({
        initialValues: { number: '', capacity: 4, hostelId: '' },
        validate: { number: (v) => (!v ? 'Required' : null), hostelId: (v) => (!v ? 'Required' : null) },
    });

    const exeatForm = useForm({
        initialValues: { studentId: '', reason: '', departDate: '', returnDate: '', guardianName: '' },
        validate: {
            studentId: (v) => (!v ? 'Student required' : null),
            reason: (v) => (!v ? 'Reason required' : null),
            departDate: (v) => (!v ? 'Required' : null),
            returnDate: (v) => (!v ? 'Required' : null),
        },
    });

    const allocationForm = useForm({
        initialValues: { studentId: '', bedNumber: '' },
        validate: { studentId: (v) => (!v ? 'Required' : null), bedNumber: (v) => (!v ? 'Required' : null) },
    });

    const handleOpenDrawer = (type: 'hostel' | 'exeat' | 'room') => {
        setDrawerType(type);
        setEditingHostel(null);
        if (type === 'hostel') hostelForm.reset();
        else if (type === 'room') roomForm.reset();
        else exeatForm.reset();
        openDrawer();
    };

    const handleSaveHostel = (values: typeof hostelForm.values) => hostelMutation.mutate(values);
    const handleSaveRoom = (values: typeof roomForm.values) => roomMutation.mutate(values);
    const handleSaveExeat = (values: typeof exeatForm.values) => exeatMutation.mutate(values);

    const openEditHostel = (h: IHostel) => {
        setEditingHostel(h);
        hostelForm.setValues({ name: h.name, gender: h.gender, capacity: h.capacity, warden: h.warden || '' });
        setDrawerType('hostel');
        openDrawer();
    };

    const filteredHostels = hostels.filter((h: any) => h.name?.toLowerCase().includes(search.toLowerCase()));
    const filteredRooms = rooms.filter((r: any) =>
        r.number?.toLowerCase().includes(search.toLowerCase()) ||
        r.hostel?.name?.toLowerCase().includes(search.toLowerCase())
    );
    const filteredExeats = exeats.filter((e: any) =>
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
                    <Tabs.Tab value="rooms" leftSection={<IconBed size={16} />}>Rooms & Beds</Tabs.Tab>
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
                            <Table striped highlightOnHover className="mobile-stack-table">
                                <Table.Thead><Table.Tr><Table.Th>Name</Table.Th><Table.Th>Gender</Table.Th><Table.Th>Capacity</Table.Th><Table.Th>Rooms</Table.Th><Table.Th>Warden</Table.Th><Table.Th>Actions</Table.Th></Table.Tr></Table.Thead>
                                <Table.Tbody>{filteredHostels.map((h: IHostel) => (
                                    <Table.Tr key={h.id}>
                                        <Table.Td data-label="Name" fw={500}>{h.name}</Table.Td>
                                        <Table.Td data-label="Gender"><Badge variant="light">{h.gender}</Badge></Table.Td>
                                        <Table.Td data-label="Capacity">{h.capacity}</Table.Td>
                                        <Table.Td data-label="Rooms">{h.rooms?.length || 0}</Table.Td>
                                        <Table.Td data-label="Warden">{h.warden || '—'}</Table.Td>
                                        <Table.Td data-label="Actions">
                                            <Group gap={4}>
                                                <ActionIcon color="blue" variant="subtle" onClick={() => openEditHostel(h)}>
                                                    <IconEdit size={16} />
                                                </ActionIcon>
                                                <ActionIcon color="red" variant="subtle" loading={deleteHostelMutation.isPending && deleteHostelMutation.variables === h.id} onClick={() => deleteHostelMutation.mutate(h.id)}>
                                                    <IconTrash size={16} />
                                                </ActionIcon>
                                            </Group>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}</Table.Tbody>
                            </Table>
                        )}
                    </Paper>
                </Tabs.Panel>

                <Tabs.Panel value="rooms">
                    <Paper p="lg" radius="md" shadow="sm" withBorder pos="relative">
                        <LoadingOverlay visible={loading} />
                        <Group justify="space-between" mb="md">
                            <TextInput placeholder="Search rooms..." leftSection={<IconSearch size={16} />} value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, maxWidth: 300 }} />
                            <Button leftSection={<IconPlus size={16} />} onClick={() => handleOpenDrawer('room')}>Add Room</Button>
                        </Group>
                        {filteredRooms.length === 0 ? (
                            <Text ta="center" c="dimmed" py="xl">No rooms found. Click "Add Room" to get started.</Text>
                        ) : (
                            <Table striped highlightOnHover className="mobile-stack-table">
                                <Table.Thead><Table.Tr><Table.Th>Room Name</Table.Th><Table.Th>Hostel</Table.Th><Table.Th>Capacity</Table.Th><Table.Th>Occupied</Table.Th><Table.Th>Occupants</Table.Th><Table.Th>Actions</Table.Th></Table.Tr></Table.Thead>
                                <Table.Tbody>{filteredRooms.map((r: IRoom) => {
                                    const occupied = r.beds?.length || 0;
                                    const isFull = occupied >= r.capacity;
                                    return (
                                        <Table.Tr key={r.id}>
                                            <Table.Td data-label="Room Name" fw={500}>{r.number}</Table.Td>
                                            <Table.Td data-label="Hostel">{r.hostel?.name}</Table.Td>
                                            <Table.Td data-label="Capacity">{r.capacity}</Table.Td>
                                            <Table.Td data-label="Occupied">
                                                <Badge color={isFull ? 'red' : 'green'} variant="light">
                                                    {occupied} / {r.capacity}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td data-label="Occupants">
                                                <Stack gap={2}>
                                                    {r.beds?.map(b => (
                                                        <Group key={b.id} gap="xs" justify="space-between" wrap="nowrap">
                                                            <Text size="xs">
                                                                <b>{b.bedNumber}:</b> {b.student ? `${b.student.firstName} ${b.student.lastName}` : 'Unknown'}
                                                            </Text>
                                                            <ActionIcon
                                                                size="xs"
                                                                color="red"
                                                                variant="subtle"
                                                                onClick={() => deallocateBedMutation.mutate(b.id)}
                                                                loading={deallocateBedMutation.isPending && deallocateBedMutation.variables === b.id}
                                                            >
                                                                <IconTrash size={12} />
                                                            </ActionIcon>
                                                        </Group>
                                                    ))}
                                                    {occupied === 0 && <Text size="xs" c="dimmed">Vacant</Text>}
                                                </Stack>
                                            </Table.Td>
                                            <Table.Td data-label="Actions">
                                                <Group gap={4}>
                                                    <Button
                                                        size="xs"
                                                        variant="light"
                                                        leftSection={<IconUserPlus size={14} />}
                                                        disabled={isFull}
                                                        onClick={() => {
                                                            allocationForm.setFieldValue('bedNumber', `Bed ${occupied + 1}`);
                                                            setAllocationModal({ opened: false, room: r });
                                                        }}
                                                    >
                                                        Allocate
                                                    </Button>
                                                    <Menu>
                                                        <Menu.Target>
                                                            <ActionIcon variant="subtle"><IconDotsVertical size={16} /></ActionIcon>
                                                        </Menu.Target>
                                                        <Menu.Dropdown>
                                                            <Menu.Item
                                                                color="red"
                                                                leftSection={<IconTrash size={14} />}
                                                                onClick={() => deleteRoomMutation.mutate(r.id)}
                                                            >
                                                                Delete Room
                                                            </Menu.Item>
                                                        </Menu.Dropdown>
                                                    </Menu>
                                                </Group>
                                            </Table.Td>
                                        </Table.Tr>
                                    );
                                })}</Table.Tbody>
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
                            <Table striped highlightOnHover className="mobile-stack-table">
                                <Table.Thead><Table.Tr><Table.Th>Student</Table.Th><Table.Th>Reason</Table.Th><Table.Th>Depart</Table.Th><Table.Th>Return</Table.Th><Table.Th>Status</Table.Th><Table.Th>Actions</Table.Th></Table.Tr></Table.Thead>
                                <Table.Tbody>{filteredExeats.map((e: any) => (
                                    <Table.Tr key={e.id}>
                                        <Table.Td data-label="Student" fw={500}>{e.student?.firstName} {e.student?.lastName}</Table.Td>
                                        <Table.Td data-label="Reason">{e.reason}</Table.Td>
                                        <Table.Td data-label="Depart">{new Date(e.departDate).toLocaleDateString()}</Table.Td>
                                        <Table.Td data-label="Return">{new Date(e.returnDate).toLocaleDateString()}</Table.Td>
                                        <Table.Td data-label="Status"><Badge color={e.status === 'APPROVED' ? 'green' : e.status === 'RETURNED' ? 'blue' : 'orange'} variant="light">{e.status}</Badge></Table.Td>
                                        <Table.Td data-label="Actions">
                                            <Group gap={4}>
                                                {e.status === 'PENDING' && <ActionIcon color="green" variant="subtle" loading={approveExeatMutation.isPending && approveExeatMutation.variables === e.id} onClick={() => approveExeatMutation.mutate(e.id)} title="Approve"><IconCheck size={16} /></ActionIcon>}
                                                {e.status === 'APPROVED' && <ActionIcon color="blue" variant="subtle" loading={returnExeatMutation.isPending && returnExeatMutation.variables === e.id} onClick={() => returnExeatMutation.mutate(e.id)} title="Mark Returned"><IconArrowLeft size={16} /></ActionIcon>}
                                            </Group>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}</Table.Tbody>
                            </Table>
                        )}
                    </Paper>
                </Tabs.Panel>
            </Tabs>

            {/* Allocation Modal */}
            <Modal
                opened={allocationModal.opened}
                onClose={() => setAllocationModal({ opened: false, room: null })}
                title={`Allocate Bed in ${allocationModal.room?.number || allocationModal.room?.name}`}
            >
                <form onSubmit={allocationForm.onSubmit((values) => allocateBedMutation.mutate({ ...values, roomId: allocationModal.room!.id }))}>
                    <Stack>
                        <StudentPicker
                            value={allocationForm.values.studentId}
                            onChange={(val) => allocationForm.setFieldValue('studentId', val || '')}
                            required
                            error={allocationForm.errors.studentId as string}
                        />
                        <TextInput label="Bed Identifier" placeholder="e.g., Bed A, Top Bunk" required {...allocationForm.getInputProps('bedNumber')} />
                        <Group justify="flex-end" mt="md">
                            <Button variant="default" onClick={() => setAllocationModal({ opened: false, room: null })}>Cancel</Button>
                            <Button type="submit" loading={allocateBedMutation.isPending}>Allocate</Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>

            {/* Drawer */}
            <Drawer opened={drawerOpened} onClose={() => { closeDrawer(); setEditingHostel(null); }} title={drawerType === 'hostel' ? (editingHostel ? 'Edit Hostel' : 'Add Hostel') : drawerType === 'room' ? 'Add Room' : 'New Exeat Request'} position="right" size="md">
                {drawerType === 'hostel' ? (
                    <form onSubmit={hostelForm.onSubmit(handleSaveHostel)}>
                        <Stack>
                            <TextInput label="Hostel Name" required {...hostelForm.getInputProps('name')} />
                            <Select label="Gender" data={['BOYS', 'GIRLS', 'MIXED']} {...hostelForm.getInputProps('gender')} />
                            <NumberInput label="Capacity" min={1} required {...hostelForm.getInputProps('capacity')} />
                            <TextInput label="Warden Name" {...hostelForm.getInputProps('warden')} />
                            <Group justify="flex-end" mt="md"><Button variant="default" onClick={closeDrawer}>Cancel</Button><Button type="submit" loading={hostelMutation.isPending}>Save</Button></Group>
                        </Stack>
                    </form>
                ) : drawerType === 'room' ? (
                    <form onSubmit={roomForm.onSubmit(handleSaveRoom)}>
                        <Stack>
                            <Select
                                label="Hostel"
                                data={hostels.map((h: IHostel) => ({ value: h.id, label: h.name }))}
                                required
                                {...roomForm.getInputProps('hostelId')}
                            />
                            <TextInput label="Room Number" placeholder="e.g. Room 12, A-3" required {...roomForm.getInputProps('number')} />
                            <NumberInput label="Capacity (Beds)" min={1} required {...roomForm.getInputProps('capacity')} />
                            <Group justify="flex-end" mt="md"><Button variant="default" onClick={closeDrawer}>Cancel</Button><Button type="submit" loading={roomMutation.isPending}>Save</Button></Group>
                        </Stack>
                    </form>
                ) : (
                    <form onSubmit={exeatForm.onSubmit(handleSaveExeat)}>
                        <Stack>
                            <StudentPicker
                                value={exeatForm.values.studentId}
                                onChange={(val) => exeatForm.setFieldValue('studentId', val || '')}
                                required
                                error={exeatForm.errors.studentId as string}
                            />
                            <Textarea label="Reason" required {...exeatForm.getInputProps('reason')} />
                            <TextInput label="Depart Date" type="date" required {...exeatForm.getInputProps('departDate')} />
                            <TextInput label="Return Date" type="date" required {...exeatForm.getInputProps('returnDate')} />
                            <TextInput label="Guardian Name" {...exeatForm.getInputProps('guardianName')} />
                            <Group justify="flex-end" mt="md"><Button variant="default" onClick={closeDrawer}>Cancel</Button><Button type="submit" loading={exeatMutation.isPending}>Submit</Button></Group>
                        </Stack>
                    </form>
                )}
            </Drawer>
        </div>
    );
}

