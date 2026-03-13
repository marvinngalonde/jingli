import React, { useState } from 'react';
import { Container, Title, Text, Card, Group, Stack, ThemeIcon, Tabs, Table, Badge, ActionIcon, Button, Modal, TextInput, Select, NumberInput, Grid } from '@mantine/core';
import { IconFlask, IconBottle, IconCalendarEvent, IconAlertCircle, IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';

// Mock Data
const MOCK_INVENTORY = [
    { id: 1, name: 'Microscope', category: 'Optics', quantity: 15, condition: 'Functional' },
    { id: 2, name: 'Bunsen Burner', category: 'Heating', quantity: 30, condition: 'Needs Repair' },
    { id: 3, name: 'Beaker 500ml', category: 'Glassware', quantity: 120, condition: 'Functional' },
];

const MOCK_CHEMICALS = [
    { id: 1, name: 'Hydrochloric Acid', formula: 'HCl', volume: '5L', hazard: 'High', expires: '2026-12-01' },
    { id: 2, name: 'Sodium Chloride', formula: 'NaCl', volume: '10kg', hazard: 'Low', expires: '2028-05-15' },
    { id: 3, name: 'Ethanol', formula: 'C2H5OH', volume: '2L', hazard: 'Medium', expires: '2025-08-20' },
];

const MOCK_BOOKINGS = [
    { id: 1, teacher: 'Mr. Smith', class: 'Grade 10A', date: '2026-03-15', time: '10:00 AM - 11:30 AM', status: 'Approved', experiment: 'Titration' },
    { id: 2, teacher: 'Ms. Davis', class: 'Grade 12B', date: '2026-03-16', time: '08:00 AM - 09:30 AM', status: 'Pending', experiment: 'Photosynthesis' },
];

export function LabManagement() {
    const [opened, { open, close }] = useDisclosure(false);
    const [modalType, setModalType] = useState('');

    const handleOpenModal = (type: string) => {
        setModalType(type);
        open();
    };

    const renderConditionBadge = (condition: string) => {
        switch (condition) {
            case 'Functional': return <Badge color="green">{condition}</Badge>;
            case 'Needs Repair': return <Badge color="orange">{condition}</Badge>;
            case 'Broken': return <Badge color="red">{condition}</Badge>;
            default: return <Badge color="gray">{condition}</Badge>;
        }
    };

    const renderHazardBadge = (hazard: string) => {
        switch (hazard) {
            case 'Low': return <Badge color="green">{hazard}</Badge>;
            case 'Medium': return <Badge color="yellow">{hazard}</Badge>;
            case 'High': return <Badge color="red">{hazard}</Badge>;
            default: return <Badge color="gray">{hazard}</Badge>;
        }
    };

    return (
        <Container size="xl" py="lg">
            <Group justify="space-between" mb="xl">
                <div>
                    <Title order={2} mb="xs">Laboratory Management</Title>
                    <Text c="dimmed">Manage lab inventory, chemicals, and equipment bookings.</Text>
                </div>
                <Group>
                    <Button leftSection={<IconAlertCircle size={16} />} color="red" variant="light">
                        Stock Alerts (2)
                    </Button>
                </Group>
            </Group>

            <Grid mb="xl">
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                        <Group justify="space-between">
                            <Stack gap="xs">
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Total Equipment</Text>
                                <Text size="xl" fw={700}>165</Text>
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
                                <Text size="xl" fw={700}>42 Units</Text>
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
                                <Text size="xl" fw={700}>1</Text>
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
                                {MOCK_INVENTORY.map((item) => (
                                    <Table.Tr key={item.id}>
                                        <Table.Td fw={500}>{item.name}</Table.Td>
                                        <Table.Td>{item.category}</Table.Td>
                                        <Table.Td>{item.quantity}</Table.Td>
                                        <Table.Td>{renderConditionBadge(item.condition)}</Table.Td>
                                        <Table.Td style={{ textAlign: 'right' }}>
                                            <ActionIcon variant="subtle" color="blue" mr={4}><IconEdit size={16} /></ActionIcon>
                                            <ActionIcon variant="subtle" color="red"><IconTrash size={16} /></ActionIcon>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    </Tabs.Panel>

                    <Tabs.Panel value="chemicals">
                        <Group justify="flex-end" mb="md">
                            <Button size="sm" color="orange" leftSection={<IconPlus size={14} />} onClick={() => handleOpenModal('chemical')}>Log Chemical</Button>
                        </Group>
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Chemical Name</Table.Th>
                                    <Table.Th>Formula</Table.Th>
                                    <Table.Th>Current Volume</Table.Th>
                                    <Table.Th>Hazard Level</Table.Th>
                                    <Table.Th>Expires</Table.Th>
                                    <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {MOCK_CHEMICALS.map((chem) => (
                                    <Table.Tr key={chem.id}>
                                        <Table.Td fw={500}>{chem.name}</Table.Td>
                                        <Table.Td>{chem.formula}</Table.Td>
                                        <Table.Td>{chem.volume}</Table.Td>
                                        <Table.Td>{renderHazardBadge(chem.hazard)}</Table.Td>
                                        <Table.Td>{chem.expires}</Table.Td>
                                        <Table.Td style={{ textAlign: 'right' }}>
                                            <ActionIcon variant="subtle" color="blue" mr={4}><IconEdit size={16} /></ActionIcon>
                                            <ActionIcon variant="subtle" color="red"><IconTrash size={16} /></ActionIcon>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    </Tabs.Panel>

                    <Tabs.Panel value="bookings">
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
                                {MOCK_BOOKINGS.map((booking) => (
                                    <Table.Tr key={booking.id}>
                                        <Table.Td>
                                            <Text size="sm" fw={500}>{booking.date}</Text>
                                            <Text size="xs" c="dimmed">{booking.time}</Text>
                                        </Table.Td>
                                        <Table.Td>{booking.teacher}</Table.Td>
                                        <Table.Td>{booking.class}</Table.Td>
                                        <Table.Td>{booking.experiment}</Table.Td>
                                        <Table.Td>
                                            <Badge color={booking.status === 'Approved' ? 'green' : 'orange'}>{booking.status}</Badge>
                                        </Table.Td>
                                        <Table.Td style={{ textAlign: 'right' }}>
                                            <Button size="xs" variant="light" color={booking.status === 'Pending' ? 'green' : 'blue'}>
                                                {booking.status === 'Pending' ? 'Approve' : 'View Details'}
                                            </Button>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    </Tabs.Panel>
                </Tabs>
            </Card>

            <Modal opened={opened} onClose={close} title={modalType === 'equipment' ? 'Add New Equipment' : 'Log New Chemical'} centered>
                <Stack>
                    <TextInput label="Name" placeholder={`Enter ${modalType} name`} required />
                    {modalType === 'chemical' ? (
                        <>
                            <TextInput label="Chemical Formula" placeholder="e.g. H2SO4" />
                            <TextInput label="Volume/Weight" placeholder="e.g. 5L or 2kg" required />
                            <Select label="Hazard Level" data={['Low', 'Medium', 'High', 'Biohazard']} defaultValue="Low" />
                        </>
                    ) : (
                        <>
                            <TextInput label="Category" placeholder="e.g. Glassware, Electronics" />
                            <NumberInput label="Quantity" defaultValue={1} min={1} required />
                            <Select label="Condition" data={['Functional', 'Needs Repair', 'Broken']} defaultValue="Functional" />
                        </>
                    )}
                    <Button mt="md" fullWidth onClick={close}>Save Entry</Button>
                </Stack>
            </Modal>
        </Container>
    );
}
