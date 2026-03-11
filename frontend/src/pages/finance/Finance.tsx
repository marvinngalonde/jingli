import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Title, Tabs, Paper, Text, Group, Button, Table, Badge, Grid, Card, ThemeIcon, Drawer, Select, Stack, LoadingOverlay, ActionIcon, NumberInput, Pagination } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCurrencyDollar, IconReceipt, IconChartPie, IconPlus, IconCategory, IconPencil, IconTrash } from '@tabler/icons-react'; // Added Icons
import { useAuth } from '../../context/AuthContext';
import { financeService } from '../../services/financeService';
import { academicsService } from '../../services/academics';
import { FeeHeadManager, FeeStructureManager } from './FeeComponents';
import type { Invoice, FeeStructure } from '../../types/finance';
import type { FinanceStats } from '../../services/financeService';

// Currency helper
const CURRENCY_OPTIONS = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'ZiG', label: 'ZiG (ZiG)' },
];
const currencySymbol = (c: string) => c === 'ZiG' ? 'ZiG ' : '$';

function InvoiceActionMenu({ invoice, onUpdate }: { invoice: Invoice, onUpdate: () => void }) {
    const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: () => financeService.deleteInvoice(invoice.id),
        onSuccess: () => {
            notifications.show({ title: 'Deleted', message: 'Invoice deleted', color: 'blue' });
            queryClient.invalidateQueries({ queryKey: ['financeInvoices'] });
        },
        onError: (error) => {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to delete invoice', color: 'red' });
        }
    });

    const updateMutation = useMutation({
        mutationFn: (values: any) => financeService.updateInvoice(invoice.id, values),
        onSuccess: () => {
            notifications.show({ title: 'Updated', message: 'Invoice updated', color: 'green' });
            closeEdit();
            queryClient.invalidateQueries({ queryKey: ['financeInvoices'] });
        },
        onError: (error) => {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to update invoice', color: 'red' });
        }
    });

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this invoice?')) return;
        deleteMutation.mutate();
    };

    const form = useForm({
        initialValues: {
            amount: invoice.amount,
            dueDate: new Date(invoice.dueDate),
            status: invoice.status
        },
    });

    const handleEdit = async (values: typeof form.values) => {
        updateMutation.mutate(values);
    };

    return (
        <>
            <ActionIcon variant="subtle" color="blue" onClick={openEdit}>
                <IconPencil size={16} />
            </ActionIcon>
            <ActionIcon variant="subtle" color="red" onClick={handleDelete} ml="xs" loading={deleteMutation.isPending}>
                <IconTrash size={16} />
            </ActionIcon>

            <Drawer
                opened={editOpened}
                onClose={closeEdit}
                title={`Edit Invoice #${invoice.id.substring(0, 8)}`}
                position="right"
                padding="md"
            >
                <LoadingOverlay visible={updateMutation.isPending} />
                <form onSubmit={form.onSubmit(handleEdit)}>
                    <Stack>
                        <NumberInput
                            label="Amount"
                            prefix={currencySymbol(invoice.currency || 'USD')}
                            {...form.getInputProps('amount')}
                        />
                        <DateInput
                            label="Due Date"
                            {...form.getInputProps('dueDate')}
                        />
                        <Select
                            label="Status"
                            data={['PENDING', 'PARTIAL', 'PAID', 'OVERDUE']}
                            {...form.getInputProps('status')}
                        />
                        <Button type="submit" mt="md">Save Changes</Button>
                    </Stack>
                </form>
            </Drawer>
        </>
    );
}

export default function Finance() {

    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<string | null>('structures');
    const [page, setPage] = useState(1);

    // Data State for Invoices
    const { data: financeData, isLoading: loading } = useQuery({
        queryKey: ['financeInvoices', user?.schoolId, page],
        queryFn: async () => {
            const [data, statsData] = await Promise.all([
                financeService.getInvoices(user?.schoolId || '', undefined, page, 20),
                financeService.getStats()
            ]);
            return { invoices: data, stats: statsData };
        },
        enabled: !!user?.schoolId && activeTab === 'invoices'
    });

    const invoices = financeData?.invoices.data || [];
    const totalPages = financeData?.invoices.totalPages || 1;
    const stats = financeData?.stats || null;

    // Invoice Generation State
    const [genOpened, { open: openGen, close: closeGen }] = useDisclosure(false);

    const { data: genData } = useQuery({
        queryKey: ['financeGenData'],
        queryFn: async () => {
            const [classesData, structuresData] = await Promise.all([
                academicsService.getClasses(),
                financeService.getFeeStructures()
            ]);
            return { classes: classesData, structures: structuresData };
        },
        enabled: genOpened
    });

    const classes = genData?.classes || [];
    const structures = genData?.structures || [];

    const handleOpenGen = () => {
        openGen();
    };

    const genForm = useForm({
        initialValues: {
            classLevelId: '',
            feeStructureId: '',
            dueDate: new Date(),
            currency: 'USD'
        },
        validate: {
            classLevelId: (v) => (!v ? 'Class is required' : null),
            feeStructureId: (v) => (!v ? 'Structure is required' : null),
            dueDate: (v) => (!v ? 'Due Date is required' : null),
        }
    });

    const generateMutation = useMutation({
        mutationFn: (values: typeof genForm.values) => financeService.generateBulkInvoices(values),
        onSuccess: (res) => {
            notifications.show({ title: 'Success', message: res.message, color: 'green' });
            closeGen();
            genForm.reset();
            queryClient.invalidateQueries({ queryKey: ['financeInvoices'] });
        },
        onError: (error) => {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to generate invoices', color: 'red' });
        }
    });

    const handleGenerate = async (values: typeof genForm.values) => {
        generateMutation.mutate(values);
    };

    return (
        <div>
            <Title order={2} mb="lg">Finance Dashboard</Title>

            {/* Global Stats Cards */}
            <Grid mb="lg">
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card shadow="sm" radius="md" p="md" withBorder>
                        <Group justify="space-between" mb="xs">
                            <Text fw={500} c="dimmed">Total Collected (YTD)</Text>
                            <ThemeIcon variant="light" color="green"><IconCurrencyDollar size={16} /></ThemeIcon>
                        </Group>
                        <Text fw={700} size="xl">${(stats?.totalRevenue || 0).toLocaleString()}</Text>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card shadow="sm" radius="md" p="md" withBorder>
                        <Group justify="space-between" mb="xs">
                            <Text fw={500} c="dimmed">Outstanding Pending</Text>
                            <ThemeIcon variant="light" color="orange"><IconReceipt size={16} /></ThemeIcon>
                        </Group>
                        <Text fw={700} size="xl">${(stats?.outstandingPending || 0).toLocaleString()}</Text>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Card shadow="sm" radius="md" p="md" withBorder>
                        <Group justify="space-between" mb="xs">
                            <Text fw={500} c="dimmed">Collection Rate</Text>
                            <ThemeIcon variant="light" color="blue"><IconChartPie size={16} /></ThemeIcon>
                        </Group>
                        <Text fw={700} size="xl">{stats?.collectionRate || 0}%</Text>
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
                                    <Table.Th>Currency</Table.Th>
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
                                                <Table.Td>{currencySymbol(inv.currency || 'USD')}{Number(inv.amount).toLocaleString()}</Table.Td>
                                                <Table.Td><Badge variant="light" color="gray">{inv.currency || 'USD'}</Badge></Table.Td>
                                                <Table.Td>
                                                    <Badge color={inv.status === 'PAID' ? 'green' : inv.status === 'OVERDUE' ? 'red' : 'yellow'}>
                                                        {inv.status}
                                                    </Badge>
                                                </Table.Td>
                                                <Table.Td>{new Date(inv.dueDate).toLocaleDateString()}</Table.Td>
                                                <Table.Td>
                                                    <Group gap="xs">
                                                        <InvoiceActionMenu invoice={inv} onUpdate={() => { }} />
                                                    </Group>
                                                </Table.Td>
                                            </Table.Tr>
                                        ))
                                }
                            </Table.Tbody>
                        </Table>
                        {totalPages > 1 && (
                            <Group justify="flex-end" mt="md">
                                <Pagination total={totalPages} value={page} onChange={setPage} />
                            </Group>
                        )}
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
                <LoadingOverlay visible={generateMutation.isPending} />
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
                            data={structures.map(s => ({ value: s.id, label: `${s.name} (${currencySymbol(s.currency || 'USD')}${s.amount})` }))}
                            {...genForm.getInputProps('feeStructureId')}
                        />
                        <Select
                            label="Currency"
                            placeholder="Select Currency"
                            data={CURRENCY_OPTIONS}
                            defaultValue="USD"
                            {...genForm.getInputProps('currency')}
                        />
                        <DateInput
                            label="Due Date"
                            placeholder="Select Due Date"
                            minDate={new Date()}
                            {...genForm.getInputProps('dueDate')}
                        />
                        <Button type="submit" mt="md" loading={generateMutation.isPending}>Generate Invoices</Button>
                    </Stack>
                </form>
            </Drawer>
        </div>
    );
}
