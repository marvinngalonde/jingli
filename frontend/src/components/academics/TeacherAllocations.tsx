import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Group, Text, Select, Drawer, Stack, Box } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { DataTable, type Column } from '../common/DataTable';
import { ActionMenu } from '../common/ActionMenu';
import { useForm } from '@mantine/form';
import { subjectsApi, classesApi } from '../../services/academics';
import { staffService } from '../../services/staffService';
import { notifications } from '@mantine/notifications';

export function TeacherAllocations() {
    const [search, setSearch] = useState('');
    const [modalOpened, setModalOpened] = useState(false);
    const queryClient = useQueryClient();

    const form = useForm({
        initialValues: {
            subjectId: '',
            sectionId: '',
            staffId: ''
        },
        validate: {
            subjectId: (v) => (!v ? 'Required' : null),
            sectionId: (v) => (!v ? 'Required' : null),
            staffId: (v) => (!v ? 'Required' : null),
        }
    });

    const { data: allocations = [], isLoading: allocLoading } = useQuery({ queryKey: ['allocations'], queryFn: () => subjectsApi.getAllAllocations() });
    const { data: subjectsRaw = [], isLoading: subLoading } = useQuery({ queryKey: ['subjects'], queryFn: () => subjectsApi.getAll() });
    const { data: classesRaw = [], isLoading: clsLoading } = useQuery({ queryKey: ['classes'], queryFn: () => classesApi.getAll() });
    const { data: staffRaw = [], isLoading: staffLoading } = useQuery({ queryKey: ['staff'], queryFn: () => staffService.getAll() });

    const loading = allocLoading || subLoading || clsLoading || staffLoading;

    const subjects = useMemo(() => subjectsRaw.map((s: any) => ({ value: s.id, label: s.name })), [subjectsRaw]);
    const classes = useMemo(() => {
        const sectionOpts: any[] = [];
        classesRaw.forEach((lvl: any) => {
            lvl.sections?.forEach((sec: any) => {
                sectionOpts.push({ value: sec.id, label: `${lvl.name} - ${sec.name}`.trim() });
            });
        });
        return sectionOpts;
    }, [classesRaw]);
    const teachers = useMemo(() => staffRaw.filter((s: any) => s.designation?.toLowerCase().includes('teacher') || s.user?.role === 'TEACHER')
        .map((s: any) => ({ value: s.id, label: `${s.firstName} ${s.lastName}` })), [staffRaw]);

    const allocateMutation = useMutation({
        mutationFn: subjectsApi.allocate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allocations'] });
            notifications.show({ title: 'Success', message: 'Teacher allocated successfully', color: 'green' });
            setModalOpened(false);
            form.reset();
        },
        onError: (error: any) => notifications.show({ title: 'Error', message: error.response?.data?.message || 'Failed to allocate', color: 'red' })
    });

    const removeMutation = useMutation({
        mutationFn: subjectsApi.removeAllocation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allocations'] });
            notifications.show({ title: 'Success', message: 'Allocation removed', color: 'green' });
        },
        onError: () => notifications.show({ title: 'Error', message: 'Failed to remove allocation', color: 'red' })
    });

    const handleSubmit = (values: typeof form.values) => allocateMutation.mutate(values);

    const handleDelete = (item: any) => {
        if (!window.confirm('Are you sure you want to remove this allocation?')) return;
        removeMutation.mutate(item.id);
    };

    const columns: Column<any>[] = [
        {
            accessor: 'subject',
            header: 'Subject',
            render: (item) => <Text fw={500}>{item.subject?.name}</Text>
        },
        {
            accessor: 'teacher',
            header: 'Teacher',
            render: (item) => <Text>{item.staff?.firstName} {item.staff?.lastName}</Text>
        },
        {
            accessor: 'class',
            header: 'Class & Section',
            render: (item) => <Text>{item.section ? `${item.section.classLevel?.name || ''} ${item.section.classLevel?.level ?? ''} - ${item.section.name || ''}`.trim() : 'Unassigned'}</Text>
        },
        {
            accessor: 'actions',
            header: '',
            render: (item) => (
                <Group justify="flex-end">
                    <ActionMenu
                        onDelete={() => handleDelete(item)}
                    />
                </Group>
            )
        }
    ];

    const filtered = allocations.filter((a: any) =>
        a.subject?.name.toLowerCase().includes(search.toLowerCase()) ||
        a.staff?.firstName.toLowerCase().includes(search.toLowerCase()) ||
        a.staff?.lastName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <Group justify="space-between" mb="md">
                <Text size="sm" c="dimmed">
                    Assign teachers to specific subjects and class sections.
                </Text>
                <Button
                    leftSection={<IconPlus size={16} />}
                    onClick={() => {
                        form.reset();
                        setModalOpened(true);
                    }}
                >
                    Assign Teacher
                </Button>
            </Group>

            <DataTable
                data={filtered}
                columns={columns}
                loading={loading || allocateMutation.isPending || removeMutation.isPending}
                search={search}
                onSearchChange={setSearch}
                pagination={{ total: 1, page: 1, onChange: () => { } }}
            />

            <Drawer opened={modalOpened} onClose={() => setModalOpened(false)} title="Assign Teacher to Subject" position="right" size="md">
                <Box p={0}>
                    <form onSubmit={form.onSubmit(handleSubmit)}>
                        <Stack gap="md">
                            <Select
                                label="Teacher"
                                placeholder="Select a teacher"
                                data={teachers}
                                searchable
                                {...form.getInputProps('staffId')}
                            />
                            <Select
                                label="Subject"
                                placeholder="Select a subject"
                                data={subjects}
                                searchable
                                {...form.getInputProps('subjectId')}
                            />
                            <Select
                                label="Class Section"
                                placeholder="Select a class section"
                                data={classes}
                                searchable
                                {...form.getInputProps('sectionId')}
                            />
                            <Group justify="flex-end" mt="md">
                                <Button variant="subtle" onClick={() => setModalOpened(false)}>Cancel</Button>
                                <Button type="submit" loading={allocateMutation.isPending}>Assign</Button>
                            </Group>
                        </Stack>
                    </form>
                </Box>
            </Drawer>
        </>
    );
}
