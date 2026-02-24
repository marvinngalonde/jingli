import { useState, useEffect } from 'react';
import { Button, Group, Text, Select, Modal, Stack } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { DataTable, type Column } from '../common/DataTable';
import { ActionMenu } from '../common/ActionMenu';
import { useForm } from '@mantine/form';
import { subjectsApi, classesApi } from '../../services/academics';
import { staffService } from '../../services/staffService';
import { notifications } from '@mantine/notifications';

export function TeacherAllocations() {
    const [allocations, setAllocations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modalOpened, setModalOpened] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form data sources
    const [subjects, setSubjects] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);

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

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [allocData, subsData, clsData, staffData] = await Promise.all([
                subjectsApi.getAllAllocations(),
                subjectsApi.getAll(),
                classesApi.getAll(),
                staffService.getAll()
            ]);

            setAllocations(allocData);
            setSubjects(subsData.map(s => ({ value: s.id, label: s.name })));

            // Flatten class sections
            const sectionOpts: any[] = [];
            clsData.forEach(lvl => {
                lvl.sections?.forEach(sec => {
                    sectionOpts.push({ value: sec.id, label: `${lvl.name} - ${sec.name}` });
                });
            });
            setClasses(sectionOpts);

            const teacherOpts = staffData.filter(s => s.designation?.toLowerCase().includes('teacher') || s.user?.role === 'TEACHER')
                .map(s => ({ value: s.id, label: `${s.firstName} ${s.lastName}` }));
            setTeachers(teacherOpts);
        } catch (error) {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to load allocations', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values: typeof form.values) => {
        setSubmitting(true);
        try {
            await subjectsApi.allocate(values);
            notifications.show({ title: 'Success', message: 'Teacher allocated successfully', color: 'green' });
            setModalOpened(false);
            form.reset();
            loadData();
        } catch (error: any) {
            notifications.show({ title: 'Error', message: error.response?.data?.message || 'Failed to allocate', color: 'red' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (item: any) => {
        if (!window.confirm('Are you sure you want to remove this allocation?')) return;
        try {
            await subjectsApi.removeAllocation(item.id);
            notifications.show({ title: 'Success', message: 'Allocation removed', color: 'green' });
            loadData();
        } catch (error) {
            notifications.show({ title: 'Error', message: 'Failed to remove allocation', color: 'red' });
        }
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
            render: (item) => <Text>{item.section?.classLevel?.name} - {item.section?.name}</Text>
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

    const filtered = allocations.filter(a =>
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
                search={search}
                onSearchChange={setSearch}
                pagination={{ total: 1, page: 1, onChange: () => { } }}
            />

            <Modal opened={modalOpened} onClose={() => setModalOpened(false)} title="Assign Teacher to Subject" centered>
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
                            <Button variant="default" onClick={() => setModalOpened(false)}>Cancel</Button>
                            <Button type="submit" loading={submitting}>Assign</Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </>
    );
}
