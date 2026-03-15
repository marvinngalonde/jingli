import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Button,
    Group,
    Avatar,
    Text,
    Drawer,
    Box,
    Badge,
    Stack,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconDownload, IconUsers } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, type Column } from '../../components/common/DataTable';
import { ActionMenu } from '../../components/common/ActionMenu';
import { guardianService, type Guardian } from '../../services/guardianService';
import { GuardianForm } from '../../components/guardians/GuardianForm';
import { exportToCsv } from '../../utils/exportUtils';

export default function ParentsPage() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [filteredData, setFilteredData] = useState<Guardian[]>([]);
    const [opened, { open, close }] = useDisclosure(false);
    const [selectedGuardian, setSelectedGuardian] = useState<Guardian | null>(null);
    const queryClient = useQueryClient();

    const { data: guardiansData, isLoading } = useQuery({
        queryKey: ['guardians', page],
        queryFn: () => guardianService.getAll({ page, limit: 7 }),
    });

    useEffect(() => {
        let result = guardiansData?.data || [];
        if (search) {
            const lowerSearch = search.toLowerCase();
            result = result.filter((item: Guardian) =>
                item.firstName.toLowerCase().includes(lowerSearch) ||
                item.lastName.toLowerCase().includes(lowerSearch) ||
                item.email?.toLowerCase().includes(lowerSearch) ||
                item.phone?.includes(search)
            );
        }
        setFilteredData(result);
    }, [guardiansData, search]);

    const createMutation = useMutation({
        mutationFn: guardianService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['guardians'] });
            notifications.show({ message: 'Guardian added successfully', color: 'green' });
            closeDrawer();
        },
        onError: () => notifications.show({ title: 'Error', message: 'Failed to add guardian', color: 'red' })
    });

    const updateMutation = useMutation({
        mutationFn: (values: any) => guardianService.update(selectedGuardian!.id, values),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['guardians'] });
            notifications.show({ message: 'Guardian updated successfully', color: 'green' });
            closeDrawer();
        },
        onError: () => notifications.show({ title: 'Error', message: 'Failed to update guardian', color: 'red' })
    });

    const deleteMutation = useMutation({
        mutationFn: guardianService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['guardians'] });
            notifications.show({ message: 'Guardian deleted', color: 'green' });
        },
        onError: () => notifications.show({ title: 'Error', message: 'Failed to delete guardian', color: 'red' })
    });

    const handleCreate = (values: any) => createMutation.mutate(values);
    const handleUpdate = (values: any) => updateMutation.mutate(values);
    const handleDelete = (id: string) => {
        if (!window.confirm('Are you sure? This action is irreversible.')) return;
        deleteMutation.mutate(id);
    };

    const openEditDrawer = (guardian: Guardian) => {
        setSelectedGuardian(guardian);
        open();
    };

    const closeDrawer = () => {
        setSelectedGuardian(null);
        close();
    };

    const columns: Column<Guardian>[] = [
        {
            accessor: 'name',
            header: 'Guardian',
            render: (item) => (
                <Group gap="sm">
                    <Avatar size={40} radius={40} color="green">{item.firstName[0]}{item.lastName[0]}</Avatar>
                    <div>
                        <Text size="sm" fw={500}>{item.firstName} {item.lastName}</Text>
                        <Badge size="xs" variant="outline" color="blue">{item.relationship}</Badge>
                    </div>
                </Group>
            )
        },
        {
            accessor: 'email',
            header: 'Email / Phone',
            render: (item) => (
                <div>
                    <Text size="sm">{item.email || 'N/A'}</Text>
                    <Text size="xs" c="dimmed">{item.phone || 'N/A'}</Text>
                </div>
            )
        },
        {
            accessor: 'students',
            header: 'Students',
            render: (item) => (
                <Stack gap={2}>
                    {item.students?.map((s: any) => (
                        <Text key={s.student.id} size="xs" fw={500}>
                            • {s.student.firstName} {s.student.lastName} ({s.student.admissionNo})
                        </Text>
                    )) || <Text size="xs" c="dimmed">None linked</Text>}
                </Stack>
            )
        },
        {
            accessor: 'actions',
            header: '',
            render: (item) => (
                <Group justify="flex-end">
                    <ActionMenu
                        onEdit={() => openEditDrawer(item)}
                        onDelete={() => handleDelete(item.id)}
                    />
                </Group>
            )
        }
    ];

    const handleExport = () => {
        const exportData = filteredData.map(g => ({
            'First Name': g.firstName,
            'Last Name': g.lastName,
            'Email': g.email || 'N/A',
            'Phone': g.phone || 'N/A',
            'Relationship': g.relationship,
            'Occupation': g.occupation || 'N/A',
            'Address': g.address || 'N/A'
        }));
        exportToCsv(exportData, 'Jingli_Guardians_Directory');
        notifications.show({ title: 'Success', message: 'Guardians list exported', color: 'green' });
    };

    return (
        <>
            <PageHeader
                title="Parents & Guardians"
                subtitle="Manage student families and relationships"
                actions={
                    <>
                        <Button variant="light" leftSection={<IconDownload size={18} />} onClick={handleExport}>
                            Export CSV
                        </Button>
                        <Button leftSection={<IconPlus size={18} />} onClick={open}>
                            Add Parent
                        </Button>
                    </>
                }
            />

            <Box mt="md">
                <DataTable
                    data={filteredData}
                    columns={columns}
                    loading={isLoading || createMutation.isPending || updateMutation.isPending}
                    search={search}
                    onSearchChange={setSearch}
                    pagination={{
                        total: guardiansData?.totalPages || 1,
                        page: page,
                        onChange: setPage
                    }}
                />
            </Box>

            <Drawer opened={opened} onClose={closeDrawer} title={selectedGuardian ? "Edit Guardian" : "Add New Guardian"} position="right" size="md">
                <Box p={0}>
                    <GuardianForm
                        key={selectedGuardian ? selectedGuardian.id : 'new'}
                        initialValues={selectedGuardian || undefined}
                        onSubmit={selectedGuardian ? handleUpdate : handleCreate}
                        onCancel={closeDrawer}
                        loading={createMutation.isPending || updateMutation.isPending}
                        isEditing={!!selectedGuardian}
                    />
                </Box>
            </Drawer>
        </>
    );
}
