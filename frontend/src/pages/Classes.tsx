import { useState, useEffect } from 'react';
import {
    Button,
    Group,
    Text,
    LoadingOverlay,
    Alert
} from '@mantine/core';
import {
    IconPlus,
    IconUsers,
    IconAlertCircle
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

// Common Components
import { PageHeader } from '../components/common/PageHeader';
import { DataTable, type Column } from '../components/common/DataTable';
import { ActionMenu } from '../components/common/ActionMenu';
import { CreateClassModal } from '../components/modals/CreateClassModal';
import { EditClassModal } from '../components/modals/EditClassModal';
import { DeleteClassModal } from '../components/modals/DeleteClassModal';

// API
import { classesApi } from '../services/academics';
import type { ClassLevel, ClassSection } from '../types/academics';

import { useAuth } from '../context/AuthContext';

// Flatten class levels + sections for table display
interface ClassRow {
    id: string;
    levelId: string;
    levelName: string;
    sectionName: string;
    fullName: string;
    studentCount: number;
    classTeacherId?: string;
    section: ClassSection;
}

const ITEMS_PER_PAGE = 10;

export default function Classes() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const { user } = useAuth();
    const isTeacher = user?.role === 'teacher';

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [classLevels, setClassLevels] = useState<ClassLevel[]>([]);
    const [createModalOpened, setCreateModalOpened] = useState(false);
    const [editModalOpened, setEditModalOpened] = useState(false);
    const [deleteModalOpened, setDeleteModalOpened] = useState(false);
    const [selectedSection, setSelectedSection] = useState<ClassSection | null>(null);
    const [selectedClassLevel, setSelectedClassLevel] = useState<ClassLevel | null>(null);
    const [page, setPage] = useState(1);

    // Fetch classes on mount
    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await classesApi.getAll();
            setClassLevels(data);
        } catch (err: any) {
            console.error('Failed to fetch classes:', err);
            setError(err.response?.data?.message || 'Failed to load classes');
        } finally {
            setLoading(false);
        }
    };

    // Flatten class levels into rows (one row per section)
    const rows: ClassRow[] = classLevels.flatMap(level =>
        (level.sections || []).map(section => ({
            id: section.id,
            levelId: level.id,
            levelName: level.name,
            sectionName: section.name,
            fullName: `${level.name}-${section.name}`,
            studentCount: section._count?.students || 0,
            classTeacherId: section.classTeacherId,
            section: section,
        }))
    );

    const filteredData = rows.filter(item => {
        const matchesSearch = item.fullName.toLowerCase().includes(search.toLowerCase());

        if (isTeacher) {
            // Filter by class teacher (if assigned)
            return matchesSearch && item.classTeacherId === user?.id;
        }

        return matchesSearch;
    });

    // Pagination
    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const paginatedData = filteredData.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
    );

    const handleEdit = (item: ClassRow) => {
        const level = classLevels.find(l => l.id === item.levelId);
        setSelectedSection(item.section);
        setEditModalOpened(true);
        // Store the class level in state
        setSelectedClassLevel(level || null);
    };

    const handleDelete = (item: ClassRow) => {
        setSelectedSection(item.section);
        setDeleteModalOpened(true);
    };

    const columns: Column<ClassRow>[] = [
        {
            accessor: 'name',
            header: 'Class Name',
            render: (item) => (
                <Text fw={600} size="sm">{item.fullName}</Text>
            )
        },
        {
            accessor: 'classTeacher',
            header: 'Class Teacher',
            render: (item) => <Text size="sm" c="dimmed">{item.classTeacherId ? 'Assigned' : 'Not Assigned'}</Text>
        },
        {
            accessor: 'studentCount',
            header: 'Students',
            render: (item) => (
                <Group gap={4}>
                    <IconUsers size={14} color="gray" />
                    <Text size="sm">{item.studentCount}</Text>
                </Group>
            )
        },
        {
            accessor: 'capacity',
            header: 'Capacity',
            render: (item) => <Text size="sm">{item.section.capacity}</Text>
        },
        {
            accessor: 'actions',
            header: '',
            render: (item) => (
                <Group justify="flex-end">
                    <ActionMenu
                        onView={() => navigate(`/classes/${item.id}`)}
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
                title={isTeacher ? "My Classes" : "Classes & Sections"}
                subtitle={isTeacher ? "Manage your assigned classes" : "Manage class sections, timetables, and teacher assignments"}
                actions={
                    !isTeacher && (
                        <Button
                            leftSection={<IconPlus size={18} />}
                            onClick={() => setCreateModalOpened(true)}
                        >
                            Add Class
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

            <CreateClassModal
                opened={createModalOpened}
                onClose={() => setCreateModalOpened(false)}
                onSuccess={fetchClasses}
                classLevels={classLevels}
            />

            <EditClassModal
                opened={editModalOpened}
                onClose={() => {
                    setEditModalOpened(false);
                    setSelectedSection(null);
                    setSelectedClassLevel(null);
                }}
                onSuccess={fetchClasses}
                section={selectedSection}
                classLevel={selectedClassLevel}
            />

            <DeleteClassModal
                opened={deleteModalOpened}
                onClose={() => {
                    setDeleteModalOpened(false);
                    setSelectedSection(null);
                }}
                onSuccess={fetchClasses}
                sectionId={selectedSection?.id || null}
                sectionName={selectedSection ? `${classLevels.find(l => l.id === selectedSection.classLevelId)?.name}-${selectedSection.name}` : null}
            />
        </>
    );
}

