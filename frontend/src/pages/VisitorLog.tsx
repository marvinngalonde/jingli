import { useState } from 'react';
import {
    Box,
    Card,
    Table,
    Button,
    Group,
    Text,
    Title,
    Avatar,
    Tabs,
    Pagination,
    rem,
} from '@mantine/core';
import { useEffect } from 'react';
import { visitorService } from '../services/visitorService';
import { showErrorNotification } from '../utils/notifications';



export default function VisitorLog() {
    const [activeTab, setActiveTab] = useState('new');
    const [visitors, setVisitors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVisitors();
    }, []);

    const fetchVisitors = async () => {
        try {
            setLoading(true);
            const data = await visitorService.getAll();
            setVisitors(data || []);
        } catch (error: any) {
            showErrorNotification(error.message || 'Failed to fetch visitors');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box p={{ base: 'sm', md: 'xl' }}>
            <Title order={2} mb="lg">
                Digital Logbook
            </Title>

            <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'new')}>
                <Tabs.List mb="md">
                    <Tabs.Tab value="new">New Visitor Check-In</Tabs.Tab>
                    <Tabs.Tab value="preapproved">Pre-Approved List</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="new">
                    <Card shadow="sm" padding="lg" radius={2} withBorder>
                        <Title order={4} mb="md">
                            Today's Visitors - Dec 31, 2025
                        </Title>

                        <Box style={{ overflowX: 'auto' }}>
                            <Table highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr style={{ backgroundColor: '#f8f9fa' }}>
                                        <Table.Th>Visitor Photo</Table.Th>
                                        <Table.Th>Name</Table.Th>
                                        <Table.Th>Purpose</Table.Th>
                                        <Table.Th>Meeting With</Table.Th>
                                        <Table.Th>Check-In Time</Table.Th>
                                        <Table.Th>Gate Pass ID</Table.Th>
                                        <Table.Th></Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {loading ? (
                                        <Table.Tr>
                                            <Table.Td colSpan={7} style={{ textAlign: 'center', padding: rem(40) }}>
                                                <Text c="dimmed">Loading visitors...</Text>
                                            </Table.Td>
                                        </Table.Tr>
                                    ) : visitors.length === 0 ? (
                                        <Table.Tr>
                                            <Table.Td colSpan={7} style={{ textAlign: 'center', padding: rem(40) }}>
                                                <Text c="dimmed">No visitors today</Text>
                                            </Table.Td>
                                        </Table.Tr>
                                    ) : (
                                        visitors.map((visitor) => (
                                            <Table.Tr key={visitor.id}>
                                                <Table.Td>
                                                    <Avatar size="md" radius="xl" color="navy">
                                                        {visitor.visitor_name?.substring(0, 2).toUpperCase() || 'V'}
                                                    </Avatar>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Text size="sm" fw={500}>
                                                        {visitor.visitor_name}
                                                    </Text>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Text size="sm">{visitor.purpose}</Text>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Text size="sm">{visitor.meeting_with || '-'}</Text>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Text size="sm">
                                                        {visitor.check_in_time ? new Date(visitor.check_in_time).toLocaleTimeString() : '-'}
                                                    </Text>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Text size="sm" c="dimmed">
                                                        {visitor.id}
                                                    </Text>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Button size="xs" color="red" radius={2}>
                                                        Check-Out
                                                    </Button>
                                                </Table.Td>
                                            </Table.Tr>
                                        ))
                                    )}
                                </Table.Tbody>
                            </Table>
                        </Box>

                        <Group justify="center" mt="md">
                            <Pagination total={2} size="sm" radius={2} />
                        </Group>
                    </Card>
                </Tabs.Panel>

                <Tabs.Panel value="preapproved">
                    <Card shadow="sm" padding="lg" radius={2} withBorder>
                        <Text c="dimmed">Pre-approved visitors list will appear here.</Text>
                    </Card>
                </Tabs.Panel>
            </Tabs>
        </Box>
    );
}
