import { useState, useEffect } from 'react';
import { Title, Tabs, Paper, Text, Group, Button, Table, Badge, Grid, Card, ThemeIcon, ActionIcon, Drawer, Select, Stack, LoadingOverlay } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCurrencyDollar, IconReceipt, IconChartPie, IconPlus, IconEye, IconCategory } from '@tabler/icons-react';
import { useAuth } from '../context/AuthContext';
import { financeService } from '../services/financeService';
import { academicsService } from '../services/academics';
import { FeeHeadManager, FeeStructureManager } from './Finance/FeeComponents';
import type { Invoice, FeeStructure } from '../types/finance';

export default function Finance() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<string | null>('structures');

    // Data State for Invoices
    const [invoices, setInvoices] = useState<Invoice[]>([]); // Using Invoice type
    const [loading, setLoading] = useState(false);

    // Invoice Generation State
    const [genOpened, { open: openGen, close: closeGen }] = useDisclosure(false);
    const [genLoading, setGenLoading] = useState(false);
    const [classes, setClasses] = useState<any[]>([]);
    const [structures, setStructures] = useState<FeeStructure[]>([]);

    useEffect(() => {
        if (user?.schoolId && activeTab === 'invoices') {
            loadInvoices();
        }
    }, [user?.schoolId, activeTab]);

    const loadInvoices = async () => {
        setLoading(true);
        try {
            const data = await financeService.getInvoices(user?.schoolId || '');
            setInvoices(data);
        } catch (error) {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to load invoices', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    // Helper to load dropdown data for generator
    const loadGenData = async () => {
        try {
            const [classesData, structuresData] = await Promise.all([
                academicsService.getClasses(),
                financeService.getFeeStructures()
            ]);
            setClasses(classesData);
            setStructures(structuresData);
        } catch (error) {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to load form data', color: 'red' });
        }
    };

    const handleOpenGen = () => {
        loadGenData();
        openGen();
    };

    const genForm = useForm({
        initialValues: {
            classLevelId: '',
            feeStructureId: '',
            dueDate: new Date()
        },
        validate: {
            classLevelId: (v) => (!v ? 'Class is required' : null),
            feeStructureId: (v) => (!v ? 'Structure is required' : null),
            dueDate: (v) => (!v ? 'Due Date is required' : null),
        }
    });

    const handleGenerate = async (values: typeof genForm.values) => {
        setGenLoading(true);
        try {
            const res = await financeService.generateBulkInvoices(values);
            notifications.show({ title: 'Success', message: res.message, color: 'green' });
            closeGen();
            genForm.reset();
            loadInvoices(); // Refresh list
        } catch (error) {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to generate invoices', color: 'red' });
        } finally {
            setGenLoading(false);
        }
    };

    return (
        <div>
            <Title order={2} mb="lg">Finance Dashboard</Title>

            {/* Global Stats Cards */}
            <Grid mb="lg">
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card shadow="sm" radius="md" p="md" withBorder>
                        <Group justify="space-between" mb="xs">
                            <Text fw={500} c="dimmed">Total Revenue (YTD)</Text>
                            <ThemeIcon variant="light" color="green"><IconCurrencyDollar size={16} /></ThemeIcon>
                        </Group>
                        <Text fw={700} size="xl">$0.00</Text>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card shadow="sm" radius="md" p="md" withBorder>
                        <Group justify="space-between" mb="xs">
                            <Text fw={500} c="dimmed">Outstanding Pending</Text>
                            <ThemeIcon variant="light" color="orange"><IconReceipt size={16} /></ThemeIcon>
                        </Group>
                        <Text fw={700} size="xl">$0.00</Text>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card shadow="sm" radius="md" p="md" withBorder>
                        <Group justify="space-between" mb="xs">
                            <Text fw={500} c="dimmed">Collection Rate</Text>
                            <ThemeIcon variant="light" color="blue"><IconChartPie size={16} /></ThemeIcon>
                        </Group>
                        <Text fw={700} size="xl">0%</Text>
                    </Card>
                </Grid.Col>
            </Grid>

            <Tabs value={activeTab} onChange={setActiveTab} radius="md">
                <Tabs.List mb="md">
                    <Tabs.Tab value="structures" leftSection={<IconCurrencyDollar size={16} />}>Fee Structures</Tabs.Tab>
                    <Tabs.Tab value="heads" leftSection={<IconCategory size={16} />}>Fee Heads</Tabs.Tab>
                    <Tabs.Tab value="invoices" leftSection={<IconReceipt size={16} />}>Invoices</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="structures">
                    <FeeStructureManager />
                </Tabs.Panel>

                <Tabs.Panel value="heads">
                    <FeeHeadManager />
                </Tabs.Panel>

                <Tabs.Panel value="invoices">
                    <Group justify="flex-end" mb="md">
                        <Button leftSection={<IconPlus size={16} />} onClick={handleOpenGen}>Create Invoices</Button>
                    </Group>
                    <Paper shadow="sm" radius="md" p="md" withBorder>
                        <Table striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Invoice #</Table.Th>
                                    <Table.Th>Student</Table.Th>
                                    <Table.Th>Amount</Table.Th>
                                    <Table.Th>Status</Table.Th>
                                    <Table.Th>Due Date</Table.Th>
                                    <Table.Th>Actions</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {loading ? <Table.Tr><Table.Td colSpan={6} align="center">Loading...</Table.Td></Table.Tr> :
                                    invoices.length === 0 ? <Table.Tr><Table.Td colSpan={6} align="center">No invoices found</Table.Td></Table.Tr> :
                                        invoices.map(inv => (
                                            <Table.Tr key={inv.id}>
                                                <Table.Td>{inv.id.substring(0, 8)}</Table.Td>
                                                <Table.Td>{inv.student?.firstName} {inv.student?.lastName}</Table.Td>
                                                <Table.Td>${Number(inv.amount).toLocaleString()}</Table.Td>
                                                <Table.Td>
                                                    <Badge color={inv.status === 'PAID' ? 'green' : inv.status === 'OVERDUE' ? 'red' : 'yellow'}>
                                                        {inv.status}
                                                    </Badge>
                                                </Table.Td>
                                                <Table.Td>{new Date(inv.dueDate).toLocaleDateString()}</Table.Td>
                                                <Table.Td>
                                                    <ActionIcon variant="light"><IconEye size={16} /></ActionIcon>
                                                </Table.Td>
                                            </Table.Tr>
                                        ))
                                }
                            </Table.Tbody>
                        </Table>
                    </Paper>
                </Tabs.Panel>
            </Tabs>

            {/* Bulk Invoice Generator Drawer */}
            <Drawer
                opened={genOpened}
                onClose={closeGen}
                title="Generate Invoices"
                position="right"
                size="md"
                padding="md"
            >
                <LoadingOverlay visible={genLoading} />
                <form onSubmit={genForm.onSubmit(handleGenerate)}>
                    <Stack>
                        <Text size="sm" c="dimmed">
                            This will generate invoices for ALL students in the selected class.
                        </Text>
                        <Select
                            label="Target Class"
                            placeholder="Select Grade"
                            data={classes.map(c => ({ value: c.id, label: c.name }))}
                            {...genForm.getInputProps('classLevelId')}
                        />
                        <Select
                            label="Fee Structure"
                            placeholder="Select Fee Structure"
                            data={structures.map(s => ({ value: s.id, label: `${s.name} ($${s.amount})` }))}
                            {...genForm.getInputProps('feeStructureId')}
                        />
                        <DateInput
                            label="Due Date"
                            placeholder="Select Due Date"
                            minDate={new Date()}
                            {...genForm.getInputProps('dueDate')}
                        />
                        <Button type="submit" mt="md" loading={genLoading}>Generate Invoices</Button>
                    </Stack>
                </form>
            </Drawer>
        </div>
    );
}
