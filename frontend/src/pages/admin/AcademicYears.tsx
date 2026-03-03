import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Title,
    Paper,
    Text,
    Group,
    Button,
    Table,
    Badge,
    Drawer,
    Stack,
    LoadingOverlay,
    ActionIcon,
    TextInput,
    Modal
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
    IconCalendar,
    IconPlus,
    IconTrash,
    IconEdit,
    IconCheck,
    IconAlertCircle
} from '@tabler/icons-react';
import { PageHeader } from '../../components/common/PageHeader';
import { academicYearsService, type AcademicYear } from '../../services/academicYearsService';

export default function AcademicYears() {
    const queryClient = useQueryClient();
    const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
    const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ opened: boolean; id: string; name: string }>({
        opened: false,
        id: '',
        name: ''
    });

    const { data: academicYears = [], isLoading } = useQuery({
        queryKey: ['academic-years'],
        queryFn: academicYearsService.getAll
    });

    const form = useForm({
        initialValues: {
            name: '',
            startDate: '',
            endDate: '',
        },
        validate: {
            name: (value) => (!value ? 'Name is required' : null),
            startDate: (value) => (!value ? 'Start date is required' : null),
            endDate: (value) => (!value ? 'End date is required' : null),
        },
    });

    const createMutation = useMutation({
        mutationFn: academicYearsService.create,
        onSuccess: () => {
            notifications.show({ title: 'Success', message: 'Academic Year created', color: 'green' });
            queryClient.invalidateQueries({ queryKey: ['academic-years'] });
            closeDrawer();
            form.reset();
        },
        onError: (err: any) => notifications.show({ title: 'Error', message: err.response?.data?.message || 'Failed to create', color: 'red' })
    });

    const updateMutation = useMutation({
        mutationFn: (values: Partial<AcademicYear>) => academicYearsService.update(editingYear!.id, values),
        onSuccess: () => {
            notifications.show({ title: 'Success', message: 'Academic Year updated', color: 'green' });
            queryClient.invalidateQueries({ queryKey: ['academic-years'] });
            closeDrawer();
            setEditingYear(null);
            form.reset();
        },
        onError: (err: any) => notifications.show({ title: 'Error', message: err.response?.data?.message || 'Failed to update', color: 'red' })
    });

    const deleteMutation = useMutation({
        mutationFn: academicYearsService.delete,
        onSuccess: () => {
            notifications.show({ title: 'Success', message: 'Academic Year deleted', color: 'green' });
            queryClient.invalidateQueries({ queryKey: ['academic-years'] });
            setDeleteModal({ opened: false, id: '', name: '' });
        },
        onError: (err: any) => notifications.show({ title: 'Error', message: err.response?.data?.message || 'Failed to delete', color: 'red' })
    });

    const activateMutation = useMutation({
        mutationFn: academicYearsService.activate,
        onSuccess: () => {
            notifications.show({ title: 'Success', message: 'Academic Year activated', color: 'green' });
            queryClient.invalidateQueries({ queryKey: ['academic-years'] });
        },
        onError: (err: any) => notifications.show({ title: 'Error', message: err.response?.data?.message || 'Failed to activate', color: 'red' })
    });

    const handleSave = (values: typeof form.values) => {
        if (editingYear) {
            updateMutation.mutate(values);
        } else {
            createMutation.mutate(values);
        }
    };

    const openEdit = (year: AcademicYear) => {
        setEditingYear(year);
        form.setValues({
            name: year.name,
            startDate: new Date(year.startDate).toISOString().split('T')[0],
            endDate: new Date(year.endDate).toISOString().split('T')[0],
        });
        openDrawer();
    };

    const openAdd = () => {
        setEditingYear(null);
        form.reset();
        openDrawer();
    };

    return (
        <>
            <PageHeader
                title="Academic Configuration"
                subtitle="Manage school years and terms"
                actions={
                    <Button leftSection={<IconPlus size={18} />} onClick={openAdd}>
                        Add Year
                    </Button>
                }
            />

            <Paper p="md" radius="md" withBorder pos="relative">
                <LoadingOverlay visible={isLoading} />
                <Table striped highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Name</Table.Th>
                            <Table.Th>Start Date</Table.Th>
                            <Table.Th>End Date</Table.Th>
                            <Table.Th>Status</Table.Th>
                            <Table.Th>Actions</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {academicYears.map((year) => (
                            <Table.Tr key={year.id}>
                                <Table.Td fw={500}>{year.name}</Table.Td>
                                <Table.Td>{new Date(year.startDate).toLocaleDateString()}</Table.Td>
                                <Table.Td>{new Date(year.endDate).toLocaleDateString()}</Table.Td>
                                <Table.Td>
                                    {year.current ? (
                                        <Badge color="green" variant="light" leftSection={<IconCheck size={12} />}>
                                            Current
                                        </Badge>
                                    ) : (
                                        <Badge color="gray" variant="outline">
                                            Inactive
                                        </Badge>
                                    )}
                                </Table.Td>
                                <Table.Td>
                                    <Group gap="xs">
                                        {!year.current && (
                                            <ActionIcon
                                                color="green"
                                                variant="subtle"
                                                title="Set as Current"
                                                onClick={() => activateMutation.mutate(year.id)}
                                                loading={activateMutation.isPending && activateMutation.variables === year.id}
                                            >
                                                <IconCheck size={16} />
                                            </ActionIcon>
                                        )}
                                        <ActionIcon color="blue" variant="subtle" onClick={() => openEdit(year)}>
                                            <IconEdit size={16} />
                                        </ActionIcon>
                                        {!year.current && (
                                            <ActionIcon
                                                color="red"
                                                variant="subtle"
                                                onClick={() => setDeleteModal({ opened: true, id: year.id, name: year.name })}
                                            >
                                                <IconTrash size={16} />
                                            </ActionIcon>
                                        )}
                                    </Group>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>

                {academicYears.length === 0 && !isLoading && (
                    <Text ta="center" c="dimmed" py="xl">
                        No academic years configured. Click "Add Year" to begin.
                    </Text>
                )}
            </Paper>

            <Drawer
                opened={drawerOpened}
                onClose={closeDrawer}
                title={<Text fw={600} size="lg">{editingYear ? 'Edit Academic Year' : 'Add Academic Year'}</Text>}
                position="right"
                size="md"
            >
                <form onSubmit={form.onSubmit(handleSave)}>
                    <Stack>
                        <TextInput
                            label="Year Name"
                            placeholder="e.g., 2025/2026 Academic Year"
                            required
                            {...form.getInputProps('name')}
                        />
                        <TextInput
                            label="Start Date"
                            type="date"
                            required
                            {...form.getInputProps('startDate')}
                        />
                        <TextInput
                            label="End Date"
                            type="date"
                            required
                            {...form.getInputProps('endDate')}
                        />

                        {editingYear && editingYear.current && (
                            <Group c="orange" gap="xs">
                                <IconAlertCircle size={16} />
                                <Text size="xs">This is the current academic year. Status changes affect the entire system.</Text>
                            </Group>
                        )}

                        <Group justify="flex-end" mt="md">
                            <Button variant="default" onClick={closeDrawer}>Cancel</Button>
                            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
                                {editingYear ? 'Update Year' : 'Save Year'}
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Drawer>

            <Modal
                opened={deleteModal.opened}
                onClose={() => setDeleteModal({ ...deleteModal, opened: false })}
                title="Confirm Deletion"
                centered
            >
                <Stack>
                    <Text size="sm">
                        Are you sure you want to delete the academic year <b>{deleteModal.name}</b>?
                        This will fail if there are classes or students linked specifically to this year.
                    </Text>
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={() => setDeleteModal({ ...deleteModal, opened: false })}>Cancel</Button>
                        <Button color="red" loading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(deleteModal.id)}>
                            Delete
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </>
    );
}
