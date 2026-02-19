import { useState, useEffect } from 'react';
import {
    Title,
    Text,
    Button,
    Group,
    Paper,
    Tabs,
    Table,
    Modal,
    Drawer,
    TextInput,
    Select,
    NumberInput,
    ActionIcon,
    Stack,
    Badge,
    LoadingOverlay,
    Grid,
    ScrollArea
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconTrash, IconPencil, IconCurrencyDollar, IconCategory } from '@tabler/icons-react';
import { financeService } from '../../services/financeService';
import { academicsService } from '../../services/academics';
import { FeeFrequency } from '../../types/finance';
import type { FeeHead, FeeStructure } from '../../types/finance';
import { DataTable } from '../../components/common/DataTable';

// --- SUB-COMPONENT: Fee Head Manager ---
export function FeeHeadManager() {
    const [heads, setHeads] = useState<FeeHead[]>([]);
    const [loading, setLoading] = useState(false);
    const [opened, { open, close }] = useDisclosure(false);

    const form = useForm({
        initialValues: {
            name: '',
            type: 'RECURRING'
        },
        validate: {
            name: (value) => (value.length < 2 ? 'Name is too short' : null),
        },
    });

    useEffect(() => {
        loadHeads();
    }, []);

    const loadHeads = async () => {
        setLoading(true);
        try {
            const data = await financeService.getFeeHeads();
            setHeads(data);
        } catch (error) {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to load fee heads', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values: typeof form.values) => {
        try {
            setLoading(true);
            await financeService.createFeeHead(values);
            notifications.show({ title: 'Success', message: 'Fee Head created', color: 'green' });
            close();
            form.reset();
            loadHeads();
        } catch (error) {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to create fee head', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure? This might affect existing structures.')) return;
        try {
            await financeService.deleteFeeHead(id);
            notifications.show({ title: 'Deleted', message: 'Fee Head removed', color: 'blue' });
            loadHeads();
        } catch (error) {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to delete', color: 'red' });
        }
    };

    return (
        <Paper p="md" radius="md" withBorder>
            <Group justify="flex-end" mb="md">
                <Button leftSection={<IconPlus size={16} />} onClick={open}>Add Fee Head</Button>
            </Group>

            <LoadingOverlay visible={loading} />

            <Table striped highlightOnHover>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Name</Table.Th>
                        <Table.Th>Type</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {heads.map((head) => (
                        <Table.Tr key={head.id}>
                            <Table.Td>{head.name}</Table.Td>
                            <Table.Td>
                                <Badge variant="light" color={head.type === 'RECURRING' ? 'blue' : 'orange'}>
                                    {head.type}
                                </Badge>
                            </Table.Td>
                            <Table.Td style={{ textAlign: 'right' }}>
                                <ActionIcon color="red" variant="subtle" onClick={() => handleDelete(head.id)}>
                                    <IconTrash size={16} />
                                </ActionIcon>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                    {heads.length === 0 && (
                        <Table.Tr>
                            <Table.Td colSpan={3} style={{ textAlign: 'center' }}>
                                <Text c="dimmed">No fee heads defined (e.g., Tuition, Transport, Lab Fee)</Text>
                            </Table.Td>
                        </Table.Tr>
                    )}
                </Table.Tbody>
            </Table>

            {/* Changed to Drawer for consistency if desired, or keep Modal for small forms */}
            <Modal opened={opened} onClose={close} title="Create Fee Head">
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack>
                        <TextInput
                            label="Name"
                            placeholder="e.g., Tuition Fee"
                            required
                            {...form.getInputProps('name')}
                        />
                        <Select
                            label="Type"
                            data={['RECURRING', 'ONE_TIME']}
                            required
                            {...form.getInputProps('type')}
                        />
                        <Button type="submit" loading={loading} fullWidth mt="md">Create</Button>
                    </Stack>
                </form>
            </Modal>
        </Paper>
    );
}

// --- SUB-COMPONENT: Fee Structure Manager ---
export function FeeStructureManager() {
    const [structures, setStructures] = useState<FeeStructure[]>([]);
    const [loading, setLoading] = useState(false);
    const [opened, { open, close }] = useDisclosure(false);

    // Dropdown Data
    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [heads, setHeads] = useState<FeeHead[]>([]);

    const form = useForm({
        initialValues: {
            name: '',
            academicYearId: '',
            classLevelId: '',
            frequency: 'TERM' as FeeFrequency,
            amount: 0,
            items: [] as { feeHeadId: string; amount: number }[] // For dynamic items
        },
        validate: {
            name: (val) => (val.length < 2 ? 'Name too short' : null),
            academicYearId: (val) => (!val ? 'Academic Year is required' : null),
            classLevelId: (val) => (!val ? 'Class is required' : null),
        },
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [structuresData, yearsData, classesData, headsData] = await Promise.all([
                financeService.getFeeStructures(),
                academicsService.getAcademicYears(),
                academicsService.getClasses(),
                financeService.getFeeHeads()
            ]);
            setStructures(structuresData);
            setAcademicYears(yearsData);
            setClasses(classesData);
            setHeads(headsData);
        } catch (error) {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to load data', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    // Reload heads when opening drawer to ensure fresh data
    const handleCreate = async () => {
        setLoading(true);
        try {
            const headsData = await financeService.getFeeHeads(); // Refresh heads specifically
            setHeads(headsData);
        } catch (e) { console.error(e) } finally { setLoading(false) }
        open();
    };

    const handleSubmit = async (values: typeof form.values) => {
        // Calculate total amount if items exist
        let totalAmount = values.amount;
        if (values.items.length > 0) {
            totalAmount = values.items.reduce((sum, item) => sum + item.amount, 0);
        }

        try {
            setLoading(true);
            await financeService.createFeeStructure({
                ...values,
                amount: totalAmount,
                // If items are present, feeHeadId is optional/null
                feeHeadId: undefined
            });
            notifications.show({ title: 'Success', message: 'Structure created', color: 'green' });
            close();
            form.reset();
            loadData();
        } catch (error) {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to create structure', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    const deleteStructure = async (id: string) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await financeService.deleteFeeStructure(id);
            setStructures(prev => prev.filter(s => s.id !== id));
            notifications.show({ title: 'Deleted', message: 'Fee Structure remove', color: 'blue' });
        } catch (e) {
            console.error(e);
            notifications.show({ title: 'Error', message: 'Failed to delete', color: 'red' });
        }
    };

    // Columns
    const columns = [
        { accessor: 'name', header: 'Structure Name', render: (item: FeeStructure) => <Text fw={500}>{item.name}</Text> },
        { accessor: 'class', header: 'Class', render: (item: FeeStructure) => <Text size="sm">{item.classLevel?.name}</Text> },
        { accessor: 'amount', header: 'Total Amount', render: (item: FeeStructure) => <Text fw={600}>${item.amount.toLocaleString()}</Text> },
        { accessor: 'frequency', header: 'Frequency', render: (item: FeeStructure) => <Badge>{item.frequency}</Badge> },
        {
            accessor: 'items',
            header: 'Breakdown',
            width: 300,
            render: (item: FeeStructure) => (
                <Stack gap={2}>
                    {item.items?.map(i => (
                        <Group key={i.id} justify="space-between" gap="xs">
                            <Text size="xs" c="dimmed">{i.head?.name}</Text>
                            <Text size="xs">${i.amount}</Text>
                        </Group>
                    ))}
                    {!item.items?.length && item.feeHead && (
                        <Group justify="space-between">
                            <Text size="xs" c="dimmed">{item.feeHead.name}</Text>
                            <Text size="xs">${item.amount}</Text>
                        </Group>
                    )}
                </Stack>
            )
        },
        {
            accessor: 'actions',
            header: '',
            render: (item: FeeStructure) => (
                <ActionIcon color="red" variant="subtle" onClick={() => deleteStructure(item.id)}>
                    <IconTrash size={16} />
                </ActionIcon>
            )
        }
    ];

    // Form Helpers for Dynamic Items
    const addItem = () => {
        form.insertListItem('items', { feeHeadId: '', amount: 0 });
    };

    return (
        <Paper p="md" radius="md" withBorder>
            <Group justify="flex-end" mb="md">
                <Button leftSection={<IconPlus size={16} />} onClick={handleCreate}>Create Structure</Button>
            </Group>

            <DataTable
                data={structures}
                columns={columns}
                loading={loading}
                pagination={{ total: 1, page: 1, onChange: () => { } }}
            />

            <Drawer
                opened={opened}
                onClose={close}
                title="Create Fee Structure"
                position="right"
                size="md"
                padding="md"
            >
                <ScrollArea h="calc(100vh - 80px)" type="auto">
                    <form onSubmit={form.onSubmit(handleSubmit)}>
                        <Stack>
                            <Title order={4} mb="md">Details</Title>
                            <TextInput label="Structure Name" placeholder="e.g. Grade 10 Term 1" required {...form.getInputProps('name')} />
                            <Select
                                label="Academic Year"
                                data={academicYears.map(y => ({ value: y.id, label: y.name }))}
                                required
                                {...form.getInputProps('academicYearId')}
                            />
                            <Select
                                label="Class Level"
                                data={classes.map(c => ({ value: c.id, label: c.name }))}
                                required
                                {...form.getInputProps('classLevelId')}
                            />
                            <Select
                                label="Frequency"
                                data={['MONTHLY', 'TERM', 'ANNUAL', 'ONE_TIME']}
                                required
                                {...form.getInputProps('frequency')}
                            />

                            <Title order={4} mt="xl" mb="md">Fee Components</Title>
                            <Text size="sm" c="dimmed" mb="sm">Add specific charges (e.g. Tuition, Lab, Transport). Ensure 'Fee Heads' are created first.</Text>

                            {form.values.items.map((item, index) => (
                                <Paper key={index} withBorder p="xs" mb="xs" bg="gray.0">
                                    <Group grow align="flex-start" mb="xs">
                                        <Select
                                            label="Fee Head"
                                            placeholder="Select Head"
                                            data={heads.map(h => ({ value: h.id, label: h.name }))}
                                            searchable
                                            clearable
                                            {...form.getInputProps(`items.${index}.feeHeadId`)}
                                        />
                                        <NumberInput
                                            label="Amount"
                                            placeholder="Amount"
                                            min={0}
                                            {...form.getInputProps(`items.${index}.amount`)}
                                        />
                                    </Group>
                                    <Group justify="flex-end">
                                        <ActionIcon color="red" variant="light" size="sm" onClick={() => form.removeListItem('items', index)}>
                                            <IconTrash size={14} />
                                        </ActionIcon>
                                    </Group>
                                </Paper>
                            ))}

                            <Button variant="light" size="sm" fullWidth leftSection={<IconPlus size={14} />} onClick={addItem} mt="xs">
                                Add Fee Item
                            </Button>

                            <Paper p="md" bg="gray.1" mt="xl">
                                <Group justify="space-between">
                                    <Text fw={600}>Total Amount:</Text>
                                    <Text fw={700} size="xl" c="blue">
                                        ${form.values.items.reduce((sum, i) => sum + (Number(i.amount) || 0), 0).toLocaleString()}
                                    </Text>
                                </Group>
                            </Paper>

                            <Button type="submit" loading={loading} fullWidth size="md" mt="xl">Create Fee Structure</Button>
                        </Stack>
                    </form>
                </ScrollArea>
            </Drawer>
        </Paper>
    );
}
