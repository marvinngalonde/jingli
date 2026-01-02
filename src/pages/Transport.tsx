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
    Stack,
    Accordion,
    rem,
} from '@mantine/core';
import { Bus, MapPin, Clock, AlertCircle, Plus } from 'lucide-react';
import { useDisclosure } from '@mantine/hooks';
import { useEffect } from 'react';
import AddRouteModal from '../components/AddRouteModal';
import { transportService } from '../services/transportService';
import { showErrorNotification } from '../utils/notifications';


function getStatusColor(status: string) {
    if (status.includes('En Route')) return 'blue';
    if (status === 'At School') return 'green';
    if (status.includes('Delayed')) return 'red';
    return 'gray';
}

function getStopStatusColor(status: string) {
    if (status === 'Completed') return 'green';
    if (status === 'Next Stop') return 'orange';
    return 'gray';
}


export default function Transport() {
    const [expandedRoute, setExpandedRoute] = useState<string | null>('R-01');
    const [addRouteOpened, { open: openAddRoute, close: closeAddRoute }] = useDisclosure(false);
    const [routes, setRoutes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRoutes();
    }, []);

    const fetchRoutes = async () => {
        try {
            setLoading(true);
            const data = await transportService.getAll();
            setRoutes(data || []);
        } catch (error: any) {
            showErrorNotification(error.message || 'Failed to fetch routes');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        return status === 'active' ? 'green' : 'gray';
    };

    return (
        <Box p={{ base: 'sm', md: 'xl' }}>
            <Group justify="space-between" mb="lg" wrap="wrap">
                <Title order={2}>Transport Management</Title>
                <Button
                    leftSection={<Plus size={16} />}
                    size="sm"
                    radius={2}
                    color="navy.9"
                    onClick={openAddRoute}
                >
                    Add Route
                </Button>
            </Group>

            {/* Stats Cards */}
            <Group mb="lg" grow>
                <Card shadow="sm" padding="md" radius={2} withBorder>
                    <Group gap="xs">
                        <Bus size={20} color="var(--mantine-color-navy-7)" />
                        <Box>
                            <Text size="xs" c="dimmed">
                                Total Buses
                            </Text>
                            <Title order={3}>15</Title>
                        </Box>
                    </Group>
                </Card>
                <Card shadow="sm" padding="md" radius={2} withBorder>
                    <Group gap="xs">
                        <MapPin size={20} color="var(--mantine-color-navy-7)" />
                        <Box>
                            <Text size="xs" c="dimmed">
                                Active Routes
                            </Text>
                            <Title order={3}>8</Title>
                        </Box>
                    </Group>
                </Card>
                <Card shadow="sm" padding="md" radius={2} withBorder>
                    <Group gap="xs">
                        <Bus size={20} color="var(--mantine-color-navy-7)" />
                        <Box>
                            <Text size="xs" c="dimmed">
                                Students on Board
                            </Text>
                            <Title order={3}>320/400</Title>
                        </Box>
                    </Group>
                </Card>
            </Group>

            {/* Routes List */}
            <Card shadow="sm" padding="lg" radius={2} withBorder>
                <Title order={4} mb="md">
                    All Routes
                </Title>

                {loading ? (
                    <Text c="dimmed" ta="center" p="xl">Loading routes...</Text>
                ) : routes.length === 0 ? (
                    <Text c="dimmed" ta="center" p="xl">No routes found</Text>
                ) : (
                    <Accordion value={expandedRoute} onChange={setExpandedRoute}>
                        {routes.map((route) => (
                            <Accordion.Item key={route.id} value={route.id}>
                                <Accordion.Control>
                                    <Group justify="space-between" wrap="nowrap">
                                        <Box>
                                            <Text fw={500}>{route.route_name}</Text>
                                            <Text size="sm" c="dimmed">
                                                {route.route_id} • Driver: {route.driver?.profile?.full_name || 'Not assigned'}
                                            </Text>
                                        </Box>
                                        <Group gap="xs">
                                            <Badge color={getStatusColor(route.status)} variant="light" size="sm">
                                                {route.status}
                                            </Badge>
                                            <Text size="sm" c="dimmed">
                                                {route.vehicle_number}
                                            </Text>
                                        </Group>
                                    </Group>
                                </Accordion.Control>
                                <Accordion.Panel>
                                    <Stack gap="xs">
                                        <Text size="sm" fw={500}>Route Details:</Text>
                                        <Text size="sm">Capacity: {route.capacity} students</Text>
                                        <Text size="sm">Start Time: {route.start_time}</Text>
                                        <Text size="sm">End Time: {route.end_time}</Text>
                                    </Stack>
                                </Accordion.Panel>
                            </Accordion.Item>
                        ))}
                    </Accordion>
                )}
            </Card>

            <AddRouteModal
                opened={addRouteOpened}
                onClose={closeAddRoute}
                onSuccess={fetchRoutes}
            />
        </Box>
    );
}
