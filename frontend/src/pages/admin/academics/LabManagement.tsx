import React, { useState } from 'react';
import { Container, Title, Text, Card, Group, Stack, ThemeIcon, Tabs, Table, Badge, ActionIcon, Button, TextInput, Select, NumberInput, Grid, LoadingOverlay, Center, Drawer, Divider } from '@mantine/core';
import { IconFlask, IconBottle, IconCalendarEvent, IconAlertCircle, IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { labService } from '../../../services/labService';
import { academicsService } from '../../../services/academics';
import { staffService } from '../../../services/staffService';
import { notifications } from '@mantine/notifications';

export function LabManagement() {
    const [opened, { open, close }] = useDisclosure(false);
    const [bookingOpened, { open: openBooking, close: closeBooking }] = useDisclosure(false);
    const [modalType, setModalType] = useState<'equipment' | 'chemical' | ''>('');
    const [editingItem, setEditingItem] = useState<any>(null);
    const queryClient = useQueryClient();

    // Queries
    const { data: inventory = [], isLoading: isLoadingInv } = useQuery({
        queryKey: ['lab-equipment'],
        queryFn: () => labService.getEquipment(),
    });

    const { data: chemicals = [], isLoading: isLoadingChem } = useQuery({
        queryKey: ['lab-chemicals'],
        queryFn: () => labService.getChemicals(),
    });

    const { data: bookings = [], isLoading: isLoadingBookings } = useQuery({
        queryKey: ['lab-bookings'],
        queryFn: () => labService.getBookings(),
    });

    const { data: classes = [] } = useQuery({
        queryKey: ['classes'],
        queryFn: () => academicsService.getClasses(),
    });

    const { data: staffData = { data: [] } } = useQuery({
        queryKey: ['staff'],
        queryFn: () => staffService.getAll(),
    });

    // Flatten sections for the select component
    const sections = classes.flatMap((level: any) => 
        level.sections.map((sec: any) => ({
            value: sec.id,
            label: `${level.name} - ${sec.name}`
        }))
    );

    const teachers = staffData.data.map((s: any) => ({
        value: s.id,
        label: `${s.firstName} ${s.lastName}`
    }));

    // Mutations
    const createChemicalMutation = useMutation({
        mutationFn: (data: any) => labService.createChemical(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lab-chemicals'] });
            notifications.show({ title: 'Success', message: 'Chemical logged successfully', color: 'green' });
            close();
        }
    });

    const updateChemicalMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => labService.updateChemical(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lab-chemicals'] });
            notifications.show({ title: 'Success', message: 'Chemical updated successfully', color: 'green' });
            close();
        }
    });

    const deleteChemicalMutation = useMutation({
        mutationFn: (id: string) => labService.deleteChemical(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lab-chemicals'] });
            notifications.show({ title: 'Deleted', message: 'Chemical removed', color: 'red' });
        }
    });

    const deleteEquipmentMutation = useMutation({
        mutationFn: (id: string) => labService.deleteEquipment(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lab-equipment'] });
            notifications.show({ title: 'Deleted', message: 'Equipment removed', color: 'red' });
        }
    });

    const createEquipmentMutation = useMutation({
        mutationFn: (data: any) => labService.createEquipment(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lab-equipment'] });
            notifications.show({ title: 'Success', message: 'Equipment added successfully', color: 'green' });
            close();
        }
    });

    const updateEquipmentMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => labService.updateEquipment(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lab-equipment'] });
            notifications.show({ title: 'Success', message: 'Equipment updated successfully', color: 'green' });
            close();
        }
    });

    const createBookingMutation = useMutation({
        mutationFn: (data: any) => labService.createBooking(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lab-bookings'] });
            notifications.show({ title: 'Success', message: 'Lab slot booked', color: 'green' });
            closeBooking();
        }
    });

    const updateBookingMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => labService.updateBookingStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lab-bookings'] });
            notifications.show({ title: 'Success', message: 'Booking status updated', color: 'green' });
        }
    });

    const handleOpenModal = (type: 'equipment' | 'chemical', item: any = null) => {
        setModalType(type);
        setEditingItem(item);
        open();
    };

    const renderConditionBadge = (condition: string) => {
        switch (condition) {
            case 'Functional': case 'NEW': case 'GOOD': return <Badge color="green">{condition}</Badge>;
            case 'Needs Repair': case 'FAIR': case 'POOR': return <Badge color="orange">{condition}</Badge>;
            case 'Broken': case 'DISPOSED': return <Badge color="red">{condition}</Badge>;
            default: return <Badge color="gray">{condition}</Badge>;
        }
    };

    const renderHazardBadge = (hazard: string) => {
        switch (hazard) {
            case 'Low': return <Badge color="green">{hazard}</Badge>;
            case 'Medium': return <Badge color="yellow">{hazard}</Badge>;
            case 'High': return <Badge color="red">{hazard}</Badge>;
            case 'Biohazard': return <Badge color="purple">{hazard}</Badge>;
            default: return <Badge color="gray">{hazard}</Badge>;
        }
    };

    const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const data = Object.fromEntries(formData.entries());

        if (modalType === 'chemical') {
            const chemicalData = {
                ...data,
                volume: parseFloat(data.volume as string),
            };
            if (editingItem) {
                updateChemicalMutation.mutate({ id: editingItem.id, data: chemicalData });
            } else {
                createChemicalMutation.mutate(chemicalData);
            }
        } else if (modalType === 'equipment') {
            const equipmentData = {
                ...data,
                quantity: parseInt(data.quantity as string),
                // Map frontend labels to backend Enum
                condition: (data.condition as string).toUpperCase().replace(' ', '_'),
            };

            // Fix for 'Functional' to 'GOOD' or similar if needed, 
            // but the DTO accepts NEW, GOOD, FAIR, POOR, BROKEN, DISPOSED
            if (equipmentData.condition === 'FUNCTIONAL') equipmentData.condition = 'GOOD';
            if (equipmentData.condition === 'NEEDS_REPAIR') equipmentData.condition = 'FAIR';

            if (editingItem) {
                updateEquipmentMutation.mutate({ id: editingItem.id, data: equipmentData });
            } else {
                createEquipmentMutation.mutate(equipmentData);
            }
        }
    };

    const handleSaveBooking = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const data = Object.fromEntries(formData.entries());

        const bookingData = {
            ...data,
            date: new Date(data.date as string).toISOString(),
            startTime: new Date(`${data.date}T${data.startTime}`).toISOString(),
            endTime: new Date(`${data.date}T${data.endTime}`).toISOString(),
        };

        createBookingMutation.mutate(bookingData);
    };

    const isLoading = isLoadingInv || isLoadingChem || isLoadingBookings;

    return (
        <Container size="xl" py="lg" pos="relative">
            <LoadingOverlay visible={isLoading} overlayProps={{ blur: 2 }} />
            
            <Group justify="space-between" mb="xl">
                <div>
                    <Title order={2} mb="xs">Laboratory Management</Title>
                    <Text c="dimmed">Manage lab inventory, chemicals, and equipment bookings.</Text>
                </div>
                <Group>
                    <Button 
                        leftSection={<IconAlertCircle size={16} />} 
                        color="red" 
                        variant="light"
                        display={chemicals.filter((c: any) => c.hazardLevel === 'High').length > 0 ? 'flex' : 'none'}
                    >
                        Hazard Alerts ({chemicals.filter((c: any) => c.hazardLevel === 'High').length})
                    </Button>
                </Group>
            </Group>

            <Grid mb="xl">
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                        <Group justify="space-between">
                            <Stack gap="xs">
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Total Equipment</Text>
                                <Text size="xl" fw={700}>{inventory.length}</Text>
                            </Stack>
                            <ThemeIcon color="blue" size="xl" radius="md" variant="light">
                                <IconFlask size={24} />
                            </ThemeIcon>
                        </Group>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                        <Group justify="space-between">
                            <Stack gap="xs">
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Chemical Stocks</Text>
                                <Text size="xl" fw={700}>{chemicals.length} Units</Text>
                            </Stack>
                            <ThemeIcon color="orange" size="xl" radius="md" variant="light">
                                <IconBottle size={24} />
                            </ThemeIcon>
                        </Group>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                        <Group justify="space-between">
                            <Stack gap="xs">
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Pending Bookings</Text>
                                <Text size="xl" fw={700}>{bookings.filter((b: any) => b.status === 'PENDING').length}</Text>
                            </Stack>
                            <ThemeIcon color="teal" size="xl" radius="md" variant="light">
                                <IconCalendarEvent size={24} />
                            </ThemeIcon>
                        </Group>
                    </Card>
                </Grid.Col>
            </Grid>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Tabs defaultValue="inventory">
                    <Tabs.List mb="md">
                        <Tabs.Tab value="inventory" leftSection={<IconFlask size={14} />}>Equipment Inventory</Tabs.Tab>
                        <Tabs.Tab value="chemicals" leftSection={<IconBottle size={14} />}>Chemical Registry</Tabs.Tab>
                        <Tabs.Tab value="bookings" leftSection={<IconCalendarEvent size={14} />}>Lab Bookings</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="inventory">
                        <Group justify="flex-end" mb="md">
                            <Button size="sm" leftSection={<IconPlus size={14} />} onClick={() => handleOpenModal('equipment')}>Add Equipment</Button>
                        </Group>
                        {inventory.length === 0 ? (
                            <Center py="xl"><Stack align="center"><Text c="dimmed">No lab equipment registered.</Text></Stack></Center>
                        ) : (
                            <Table striped highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Name</Table.Th>
                                        <Table.Th>Category</Table.Th>
                                        <Table.Th>Quantity</Table.Th>
                                        <Table.Th>Condition</Table.Th>
                                        <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {inventory.map((item: any) => (
                                        <Table.Tr key={item.id}>
                                            <Table.Td fw={500}>{item.name}</Table.Td>
                                            <Table.Td>{item.category?.name}</Table.Td>
                                            <Table.Td>{item.quantity}</Table.Td>
                                            <Table.Td>{renderConditionBadge(item.condition)}</Table.Td>
                                            <Table.Td style={{ textAlign: 'right' }}>
                                                <ActionIcon variant="subtle" color="blue" mr={4} onClick={() => handleOpenModal('equipment', item)}><IconEdit size={16} /></ActionIcon>
                                                <ActionIcon variant="subtle" color="red" onClick={() => {
                                                    if (window.confirm('Are you sure you want to delete this equipment?')) {
                                                        deleteEquipmentMutation.mutate(item.id);
                                                    }
                                                }}><IconTrash size={16} /></ActionIcon>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        )}
                    </Tabs.Panel>

                    <Tabs.Panel value="chemicals">
                        <Group justify="flex-end" mb="md">
                            <Button size="sm" color="orange" leftSection={<IconPlus size={14} />} onClick={() => handleOpenModal('chemical')}>Log Chemical</Button>
                        </Group>
                        {chemicals.length === 0 ? (
                            <Center py="xl"><Stack align="center"><Text c="dimmed">No chemicals in registry.</Text></Stack></Center>
                        ) : (
                            <Table striped highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Chemical Name</Table.Th>
                                        <Table.Th>Formula</Table.Th>
                                        <Table.Th>Volume/Qty</Table.Th>
                                        <Table.Th>Hazard Level</Table.Th>
                                        <Table.Th>Expires</Table.Th>
                                        <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {chemicals.map((chem: any) => (
                                        <Table.Tr key={chem.id}>
                                            <Table.Td fw={500}>{chem.name}</Table.Td>
                                            <Table.Td>{chem.formula}</Table.Td>
                                            <Table.Td>{chem.volume} {chem.unit}</Table.Td>
                                            <Table.Td>{renderHazardBadge(chem.hazardLevel)}</Table.Td>
                                            <Table.Td>{chem.expiryDate ? new Date(chem.expiryDate).toLocaleDateString() : 'N/A'}</Table.Td>
                                            <Table.Td style={{ textAlign: 'right' }}>
                                                <ActionIcon variant="subtle" color="blue" mr={4} onClick={() => handleOpenModal('chemical', chem)}><IconEdit size={16} /></ActionIcon>
                                                <ActionIcon variant="subtle" color="red" onClick={() => deleteChemicalMutation.mutate(chem.id)}><IconTrash size={16} /></ActionIcon>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        )}
                    </Tabs.Panel>

                    <Tabs.Panel value="bookings">
                        <Group justify="flex-end" mb="md">
                            <Button size="sm" color="teal" leftSection={<IconPlus size={14} />} onClick={openBooking}>Book Lab Slot</Button>
                        </Group>
                        {bookings.length === 0 ? (
                            <Center py="xl"><Stack align="center"><Text c="dimmed">No bookings found.</Text></Stack></Center>
                        ) : (
                            <Table striped highlightOnHover mt="md">
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Date & Time</Table.Th>
                                        <Table.Th>Teacher</Table.Th>
                                        <Table.Th>Class</Table.Th>
                                        <Table.Th>Experiment</Table.Th>
                                        <Table.Th>Status</Table.Th>
                                        <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {bookings.map((booking: any) => (
                                        <Table.Tr key={booking.id}>
                                            <Table.Td>
                                                <Text size="sm" fw={500}>{new Date(booking.date).toLocaleDateString()}</Text>
                                                <Text size="xs" c="dimmed">
                                                    {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                                                    {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>{booking.teacher?.firstName} {booking.teacher?.lastName}</Table.Td>
                                            <Table.Td>{booking.section?.name}</Table.Td>
                                            <Table.Td>{booking.experiment}</Table.Td>
                                            <Table.Td>
                                                <Badge color={booking.status === 'APPROVED' ? 'green' : booking.status === 'PENDING' ? 'orange' : 'red'}>
                                                    {booking.status}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td style={{ textAlign: 'right' }}>
                                                {booking.status === 'PENDING' && (
                                                    <Button size="xs" variant="light" color="green" onClick={() => updateBookingMutation.mutate({ id: booking.id, status: 'APPROVED' })}>
                                                        Approve
                                                    </Button>
                                                )}
                                                {booking.status === 'APPROVED' && (
                                                    <Button size="xs" variant="light" color="red" onClick={() => updateBookingMutation.mutate({ id: booking.id, status: 'CANCELLED' })}>
                                                        Cancel
                                                    </Button>
                                                )}
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        )}
                    </Tabs.Panel>
                </Tabs>
            </Card>

            <Drawer 
                opened={opened} 
                onClose={close} 
                title={editingItem ? `Edit ${modalType === 'chemical' ? 'Chemical' : 'Equipment'}` : `Add New ${modalType === 'chemical' ? 'Chemical' : 'Equipment'}`}
                position="right"
                size="md"
            >
                <form onSubmit={handleSave}>
                    <Stack>
                        <TextInput name="name" label="Name" placeholder={`Enter ${modalType} name`} defaultValue={editingItem?.name} required />
                        {modalType === 'chemical' ? (
                            <>
                                <TextInput name="formula" label="Chemical Formula" placeholder="e.g. H2SO4" defaultValue={editingItem?.formula} />
                                <Grid>
                                    <Grid.Col span={8}>
                                        <NumberInput name="volume" label="Volume/Weight" placeholder="5" defaultValue={editingItem?.volume} required />
                                    </Grid.Col>
                                    <Grid.Col span={4}>
                                        <TextInput name="unit" label="Unit" placeholder="L, kg" defaultValue={editingItem?.unit || 'L'} required />
                                    </Grid.Col>
                                </Grid>
                                <Select 
                                    name="hazardLevel" 
                                    label="Hazard Level" 
                                    data={['Low', 'Medium', 'High', 'Biohazard']} 
                                    defaultValue={editingItem?.hazardLevel || 'Low'} 
                                />
                                <TextInput name="expiryDate" label="Expiry Date" type="date" defaultValue={editingItem?.expiryDate?.split('T')[0]} />
                            </>
                        ) : (
                            <>
                                <TextInput name="categoryName" label="Category" placeholder="e.g. Glassware, Electronics" defaultValue={editingItem?.category?.name} />
                                <NumberInput name="quantity" label="Quantity" defaultValue={editingItem?.quantity || 1} min={1} required />
                                <Select 
                                    name="condition" 
                                    label="Condition" 
                                    data={['Functional', 'Needs Repair', 'Broken']} 
                                    defaultValue={editingItem?.condition || 'Functional'} 
                                />
                            </>
                        )}
                        <Divider my="md" />
                        <Button 
                            fullWidth 
                            type="submit" 
                            loading={
                                createChemicalMutation.isPending || 
                                updateChemicalMutation.isPending ||
                                createEquipmentMutation.isPending ||
                                updateEquipmentMutation.isPending
                            }
                        >
                            {editingItem ? 'Update' : 'Save'} Entry
                        </Button>
                    </Stack>
                </form>
            </Drawer>

            <Drawer 
                opened={bookingOpened} 
                onClose={closeBooking} 
                title="Book Laboratory Slot"
                position="right"
                size="md"
            >
                <form onSubmit={handleSaveBooking}>
                    <Stack>
                        <TextInput name="experiment" label="Experiment/Activity" placeholder="e.g. Acid-Base Titration" required />
                        <Select 
                            name="sectionId" 
                            label="Class Section" 
                            placeholder="Select Class"
                            data={sections}
                            required 
                        />
                        <TextInput name="date" label="Date" type="date" required />
                        <Grid>
                            <Grid.Col span={6}>
                                <TextInput name="startTime" label="Start Time" type="time" required />
                            </Grid.Col>
                            <Grid.Col span={6}>
                                <TextInput name="endTime" label="End Time" type="time" required />
                            </Grid.Col>
                        </Grid>
                        <Divider my="md" />
                        <Button fullWidth type="submit" color="teal" loading={createBookingMutation.isPending}>
                            Confirm Booking
                        </Button>
                    </Stack>
                </form>
            </Drawer>
        </Container>
    );
}
