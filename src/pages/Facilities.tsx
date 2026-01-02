import { useState } from 'react';
import {
    Box,
    Card,
    Table,
    Button,
    Group,
    Text,
    Title,
    Badge,
    Grid,
    Stack,
    Select,
    Modal,
    TextInput,
    Textarea,
    rem,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Building2, Plus, Calendar } from 'lucide-react';
import { useEffect } from 'react';
import { facilitiesService } from '../services/facilitiesService';
import { showErrorNotification } from '../utils/notifications';


function getStatusColor(status: string) {
    switch (status) {
        case 'Available':
            return 'green';
        case 'Occupied':
            return 'orange';
        case 'Booked':
            return 'blue';
        default:
            return 'gray';
    }
}


export default function Facilities() {
    const [opened, { open, close }] = useDisclosure(false);
    const [facilities, setFacilities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFacilities();
    }, []);

    const fetchFacilities = async () => {
        try {
            setLoading(true);
            const data = await facilitiesService.getAll();
            setFacilities(data || []);
        } catch (error: any) {
            showErrorNotification(error.message || 'Failed to fetch facilities');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available':
                return 'green';
            case 'occupied':
                return 'orange';
            case 'maintenance':
                return 'red';
            default:
                return 'gray';
        }
    };

    return (
        <Box p={{ base: 'sm', md: 'xl' }}>
            <Group justify="space-between" mb="lg" wrap="wrap">
                <Title order={2}>Facilities & Resource Management</Title>
                <Button
                    leftSection={<Plus size={16} />}
                    size="sm"
                    radius={2}
                    color="navy.9"
                    onClick={open}
                >
                    Book Facility
                </Button>
            </Group>

            {/* Stats */}
            <Grid gutter="md" mb="lg">
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <Card shadow="sm" padding="md" radius={2} withBorder>
                        <Group gap="xs">
                            <Building2 size={20} color="var(--mantine-color-navy-7)" />
                            <Box>
                                <Text size="xs" c="dimmed">
                                    Total Facilities
                                </Text>
                                <Title order={3}>24</Title>
                            </Box>
                        </Group>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <Card shadow="sm" padding="md" radius={2} withBorder>
                        <Box>
                            <Text size="xs" c="dimmed">
                                Available
                            </Text>
                            <Title order={3} c="green">
                                15
                            </Title>
                        </Box>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <Card shadow="sm" padding="md" radius={2} withBorder>
                        <Box>
                            <Text size="xs" c="dimmed">
                                Occupied
                            </Text>
                            <Title order={3} c="orange">
                                6
                            </Title>
                        </Box>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <Card shadow="sm" padding="md" radius={2} withBorder>
                        <Box>
                            <Text size="xs" c="dimmed">
                                Booked
                            </Text>
                            <Title order={3} c="blue">
                                3
                            </Title>
                        </Box>
                    </Card>
                </Grid.Col>
            </Grid>

            <Grid gutter="md">
                {/* Facilities List */}
                <Grid.Col span={{ base: 12, lg: 8 }}>
                    <Card shadow="sm" padding="lg" radius={2} withBorder>
                        <Title order={4} mb="md">
                            All Facilities
                        </Title>

                        <Box style={{ overflowX: 'auto' }}>
                            <Table highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr style={{ backgroundColor: '#f8f9fa' }}>
                                        <Table.Th>ID</Table.Th>
                                        <Table.Th>Facility Name</Table.Th>
                                        <Table.Th>Type</Table.Th>
                                        <Table.Th>Capacity</Table.Th>
                                        <Table.Th>Status</Table.Th>
                                        <Table.Th>Next Booking</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {loading ? (
                                        <Table.Tr>
                                            <Table.Td colSpan={6} style={{ textAlign: 'center', padding: rem(40) }}>
                                                <Text c="dimmed">Loading facilities...</Text>
                                            </Table.Td>
                                        </Table.Tr>
                                    ) : facilities.length === 0 ? (
                                        <Table.Tr>
                                            <Table.Td colSpan={6} style={{ textAlign: 'center', padding: rem(40) }}>
                                                <Text c="dimmed">No facilities found</Text>
                                            </Table.Td>
                                        </Table.Tr>
                                    ) : (
                                        facilities.map((facility) => (
                                            <Table.Tr key={facility.id}>
                                                <Table.Td>
                                                    <Text size="sm">{facility.facility_id}</Text>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Text size="sm" fw={500}>
                                                        {facility.facility_name}
                                                    </Text>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Text size="sm">{facility.facility_type}</Text>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Text size="sm">{facility.capacity}</Text>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Badge color={getStatusColor(facility.status)} variant="light" size="sm" radius={2}>
                                                        {facility.status}
                                                    </Badge>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Text size="sm" c="dimmed">
                                                        -
                                                    </Text>
                                                </Table.Td>
                                            </Table.Tr>
                                        ))
                                    )}
                                </Table.Tbody>
                            </Table>
                        </Box>
                    </Card>
                </Grid.Col>
            </Grid>

            {/* Booking Modal */}
            <Modal opened={opened} onClose={close} title="Book Facility" size="md">
                <Stack gap="md">
                    <Select
                        label="Select Facility"
                        placeholder="Choose facility"
                        data={facilities.map((f) => ({ value: f.id, label: f.facility_name }))}
                        size="sm"
                        radius={2}
                    />
                    <TextInput
                        label="Purpose"
                        placeholder="Enter purpose"
                        size="sm"
                        radius={2}
                    />
                    <Group grow>
                        <TextInput
                            label="Start Time"
                            placeholder="HH:MM"
                            size="sm"
                            radius={2}
                        />
                        <TextInput
                            label="End Time"
                            placeholder="HH:MM"
                            size="sm"
                            radius={2}
                        />
                    </Group>
                    <Textarea
                        label="Additional Notes"
                        placeholder="Enter any additional information"
                        size="sm"
                        radius={2}
                        minRows={3}
                    />
                    <Group justify="flex-end">
                        <Button variant="outline" onClick={close} size="sm" radius={2} color="gray">
                            Cancel
                        </Button>
                        <Button onClick={close} size="sm" radius={2} color="navy.9">
                            Confirm Booking
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Box >
    );
}
