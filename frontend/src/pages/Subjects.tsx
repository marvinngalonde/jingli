import { useState, useEffect } from 'react';
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
import { PageHeader } from '../components/common/PageHeader';
import { DataTable, type Column } from '../components/common/DataTable';
import { ActionMenu } from '../components/common/ActionMenu';
import { CreateSubjectModal } from '../components/modals/CreateSubjectModal';
import { EditSubjectModal } from '../components/modals/EditSubjectModal';
import { DeleteSubjectModal } from '../components/modals/DeleteSubjectModal';

// API
import { subjectsApi } from '../services/academics';
import type { Subject } from '../types/academics';

import { useAuth } from '../context/AuthContext';

const ITEMS_PER_PAGE = 10;

export default function Subjects() {
    const [search, setSearch] = useState('');
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [createModalOpened, setCreateModalOpened] = useState(false);
    const [editModalOpened, setEditModalOpened] = useState(false);
    const [deleteModalOpened, setDeleteModalOpened] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [page, setPage] = useState(1);

    // Fetch subjects on mount
    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await subjectsApi.getAll();
            setSubjects(data);
        } catch (err: any) {
            console.error('Failed to fetch subjects:', err);
            setError(err.response?.data?.message || 'Failed to load subjects');
        } finally {
            setLoading(false);
        }
    };

    const filteredData = subjects.filter(item => {
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
            render: () => <Text size="sm" c="dimmed">All Grades</Text>
        },
        {
            accessor: 'teachers',
            header: 'Teachers',
            render: () => <Text size="sm" c="dimmed">Not assigned</Text>
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
