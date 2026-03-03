import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Button,
    Group,
    Text,
    LoadingOverlay,
    Alert,
    Badge
} from '@mantine/core';
import {
    IconPlus,
    IconAlertCircle,
    IconBook
} from '@tabler/icons-react';

// Common Components
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, type Column } from '../../components/common/DataTable';
import { ActionMenu } from '../../components/common/ActionMenu';
import { CreateSubjectModal } from '../../components/modals/CreateSubjectModal';
import { EditSubjectModal } from '../../components/modals/EditSubjectModal';
import { DeleteSubjectModal } from '../../components/modals/DeleteSubjectModal';

// API
import { subjectsApi } from '../../services/academics';
import type { Subject } from '../../types/academics';

import { useAuth } from '../../context/AuthContext';

const ITEMS_PER_PAGE = 10;

export default function Subjects({ asComponent }: { asComponent?: boolean }) {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [createModalOpened, setCreateModalOpened] = useState(false);
    const [editModalOpened, setEditModalOpened] = useState(false);
    const [deleteModalOpened, setDeleteModalOpened] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const { user } = useAuth();

    const { data: subjects = [], isLoading: loading, error: queryError, refetch: fetchSubjects } = useQuery({
        queryKey: ['subjects'],
        queryFn: () => subjectsApi.getAll()
    });

    const errorObj = queryError as any;
    const error = errorObj ? errorObj.message : null;

    const filteredData = subjects.filter((item: Subject) => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.code.toLowerCase().includes(search.toLowerCase()) ||
            (item.department?.toLowerCase().includes(search.toLowerCase()) || false);
        return matchesSearch;
    });

    // Pagination
    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const paginatedData = filteredData.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
    );

    const handleEdit = (item: Subject) => {
        setSelectedSubject(item);
        setEditModalOpened(true);
    };

    const handleDelete = (item: Subject) => {
        setSelectedSubject(item);
        setDeleteModalOpened(true);
    };

    const columns: Column<Subject>[] = [
        {
            accessor: 'code',
            header: 'Code',
            width: 100,
            render: (item) => <Badge variant="light" color="blue">{item.code}</Badge>
        },
        {
            accessor: 'name',
            header: 'Subject Name',
            render: (item) => (
                <Group gap="xs">
                    <IconBook size={16} color="gray" />
                    <Text fw={600} size="sm">{item.name}</Text>
                </Group>
            )
        },
        {
            accessor: 'department',
            header: 'Department',
            render: (item) => <Text size="sm">{item.department || 'N/A'}</Text>
        },
        {
            accessor: 'level',
            header: 'Level/Grade',
            render: (item) => {
                if (!item.classLevels || item.classLevels.length === 0) {
                    return <Text size="sm" c="dimmed">All Grades</Text>;
                }
                return (
                    <Text size="sm">
                        {item.classLevels.map(cl => `${cl.name} ${cl.level || ''}`.trim()).join(', ')}
                    </Text>
                );
            }
        },
        {
            accessor: 'teachers',
            header: 'Teachers',
            render: (item) => {
                const coord = item.teacher ? `${item.teacher.firstName} ${item.teacher.lastName}` : null;
                const allocated = item.allocations?.map((a: any) => `${a.staff?.firstName} ${a.staff?.lastName}`) || [];
                const allTeachers = Array.from(new Set([coord, ...allocated].filter(Boolean)));
                return (
                    <Text size="sm">
                        {allTeachers.length > 0 ? allTeachers.join(', ') : <Text span c="dimmed">Not assigned</Text>}
                    </Text>
                );
            }
        },
        {
            accessor: 'actions',
            header: '',
            render: (item) => (
                <Group justify="flex-end">
                    <ActionMenu
                        onEdit={() => handleEdit(item)}
                        onDelete={() => handleDelete(item)}
                    />
                </Group>
            )
        }
    ];

    return (
        <>
            {!asComponent && (
                <PageHeader
                    title="Subjects"
                    subtitle="Manage subjects and assign them to grades/departments"
                    actions={
                        user?.role !== 'teacher' && (
                            <Button
                                leftSection={<IconPlus size={18} />}
                                onClick={() => setCreateModalOpened(true)}
                            >
                                Add Subject
                            </Button>
                        )
                    }
                />
            )}

            {asComponent && user?.role !== 'teacher' && (
                <Group justify="space-between" mb="md">
                    <Text size="sm" c="dimmed">
                        Manage subjects and assign them to grades/departments
                    </Text>
                    <Button
                        leftSection={<IconPlus size={16} />}
                        onClick={() => setCreateModalOpened(true)}
                    >
                        Add Subject
                    </Button>
                </Group>
            )}

            {error && (
                <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mb="md">
                    {error}
                </Alert>
            )}

            <LoadingOverlay visible={loading} />

            {!loading && !error && (
                <DataTable
                    data={paginatedData}
                    columns={columns}
                    search={search}
                    onSearchChange={(val) => {
                        setSearch(val);
                        setPage(1); // Reset to first page on search
                    }}
                    pagination={{
                        total: totalPages,
                        page: page,
                        onChange: setPage
                    }}
                />
            )}

            <CreateSubjectModal
                opened={createModalOpened}
                onClose={() => setCreateModalOpened(false)}
                onSuccess={fetchSubjects}
            />

            <EditSubjectModal
                opened={editModalOpened}
                onClose={() => {
                    setEditModalOpened(false);
                    setSelectedSubject(null);
                }}
                onSuccess={fetchSubjects}
                subject={selectedSubject}
            />

            <DeleteSubjectModal
                opened={deleteModalOpened}
                onClose={() => {
                    setDeleteModalOpened(false);
                    setSelectedSubject(null);
                }}
                onSuccess={fetchSubjects}
                subjectId={selectedSubject?.id || null}
                subjectName={selectedSubject?.name || null}
            />
        </>
    );
}
