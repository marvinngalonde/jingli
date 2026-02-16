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
import { notifications } from '@mantine/notifications';

// Common Components
import { PageHeader } from '../components/common/PageHeader';
import { DataTable, type Column } from '../components/common/DataTable';
import { ActionMenu } from '../components/common/ActionMenu';

// API
import { classesApi } from '../services/academics';
import type { ClassLevel } from '../types/academics';

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
}

export default function Classes() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const { user } = useAuth();
    const isTeacher = user?.role === 'teacher';

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [classLevels, setClassLevels] = useState<ClassLevel[]>([]);

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
            accessor: 'actions',
            header: '',
            render: (item) => (
                <Group justify="flex-end">
                    <ActionMenu
                        onView={() => navigate(`/classes/${item.id}`)}
                        onEdit={() => notifications.show({ message: 'Edit Class - Coming Soon' })}
                        onDelete={() => notifications.show({ message: 'Delete Class - Coming Soon', color: 'red' })}
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
                        <Button leftSection={<IconPlus size={18} />} onClick={() => notifications.show({ message: 'Create Class - Coming Soon' })}>
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
                    data={filteredData}
                    columns={columns}
                    search={search}
                    onSearchChange={setSearch}
                    pagination={{
                        total: 1,
                        page: 1,
                        onChange: () => { }
                    }}
                />
            )}
        </>
    );
}
