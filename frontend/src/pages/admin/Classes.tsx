import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Button,
    Group,
    Text,
    LoadingOverlay,
    Alert,
    Tabs
} from '@mantine/core';
import {
    IconPlus,
    IconUsers,
    IconAlertCircle,
    IconSchool,
    IconDoor
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

// Common Components
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, type Column } from '../../components/common/DataTable';
import { ActionMenu } from '../../components/common/ActionMenu';
import { CreateClassModal } from '../../components/modals/CreateClassModal';
import { EditClassModal } from '../../components/modals/EditClassModal';
import { DeleteClassModal } from '../../components/modals/DeleteClassModal';

// API
import { classesApi } from '../../services/academics';
import { staffService } from '../../services/staffService';
import type { ClassLevel, ClassSection } from '../../types/academics';

import { useAuth } from '../../context/AuthContext';

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

export default function Classes({ asComponent }: { asComponent?: boolean }) {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const { user } = useAuth();

    const [createModalOpened, setCreateModalOpened] = useState(false);
    const [editModalOpened, setEditModalOpened] = useState(false);
    const [deleteModalOpened, setDeleteModalOpened] = useState(false);
    const [selectedSection, setSelectedSection] = useState<ClassSection | null>(null);
    const [selectedClassLevel, setSelectedClassLevel] = useState<ClassLevel | null>(null);
    const [page, setPage] = useState(1);
    const [activeTab, setActiveTab] = useState<string | null>('classes');

    const { data: classLevels = [], isLoading: classesLoading, error: classesError, refetch: fetchClasses } = useQuery({
        queryKey: ['classes'],
        queryFn: () => classesApi.getAll()
    });

    const { data: staffList = [], isLoading: staffLoading, error: staffError } = useQuery({
        queryKey: ['staff'],
        queryFn: () => staffService.getAll()
    });

    const loading = classesLoading || staffLoading;
    const errorObj = classesError || staffError;
    const error = errorObj ? (errorObj as any).message : null;

    const teachers = useMemo(() => {
        const teachingRoles = ['TEACHER', 'SUBJECT_TEACHER', 'CLASS_TEACHER', 'SENIOR_TEACHER', 'HOD'];
        return staffList.filter((s: any) => s.designation?.toLowerCase().includes('teacher') || teachingRoles.includes(s.user?.role || ''));
    }, [staffList]);

    // Flatten class levels into rows (one row per section)
    const rows: ClassRow[] = classLevels.flatMap(level =>
        (level.sections || []).map(section => ({
            id: section.id,
            levelId: level.id,
            levelName: level.name,
            sectionName: section.name,
            fullName: `${level.name} ${level.level} ${section.name}`,
            studentCount: section._count?.students || 0,
            classTeacherId: section.classTeacherId,
            section: section,
        }))
    );

    const filteredSectionData = rows.filter(item => {
        return item.fullName.toLowerCase().includes(search.toLowerCase());
    });

    const filteredClassData = classLevels.filter(item => {
        return item.name.toLowerCase().includes(search.toLowerCase());
    });

    const currentTabFilteredData = activeTab === 'classes' ? filteredClassData : filteredSectionData;

    // Pagination
    const totalPages = Math.ceil(currentTabFilteredData.length / ITEMS_PER_PAGE);
    const paginatedData = currentTabFilteredData.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
    );

    const handleEdit = (item: ClassRow) => {
        const level = classLevels.find(l => l.id === item.levelId);
        setSelectedSection(item.section);
        setEditModalOpened(true);
        setSelectedClassLevel(level || null);
    };

    const handleDelete = (item: ClassRow) => {
        setSelectedSection(item.section);
        setDeleteModalOpened(true);
    };

    const handleEditClass = (level: ClassLevel) => {
        setSelectedClassLevel(level);
        setSelectedSection(null);
        setEditModalOpened(true);
    };

    const handleDeleteClass = (level: ClassLevel) => {
        setSelectedClassLevel(level);
        setSelectedSection(null);
        setDeleteModalOpened(true);
    };

    const sectionColumns: Column<ClassRow>[] = [
        {
            accessor: 'name',
            header: 'Section Name',
            render: (item) => (
                <Text fw={600} size="sm">{item.fullName}</Text>
            )
        },
        {
            accessor: 'classTeacher',
            header: 'Class Teacher',
            render: (item) => {
                const teacher = teachers.find(t => t.user?.id === item.classTeacherId || t.id === item.classTeacherId);
                return <Text size="sm" c={item.classTeacherId ? "dark" : "dimmed"}>
                    {teacher ? `${teacher.firstName} ${teacher.lastName}` : (item.classTeacherId ? 'Assigned' : 'Not Assigned')}
                </Text>;
            }
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

    const classColumns: Column<ClassLevel>[] = [
        {
            accessor: 'name',
            header: 'Class Name',
            render: (item) => (
                <Text fw={600} size="sm">{item.name}</Text>
            )
        },
        {
            accessor: 'level',
            header: 'Level',
            render: (item) => <Text size="sm">{item.level}</Text>
        },
        {
            accessor: 'sections',
            header: 'Sections Count',
            render: (item) => <Text size="sm">{item.sections?.length || 0}</Text>
        },
        {
            accessor: 'students',
            header: 'Total Students',
            render: (item) => {
                const totalStudents = item.sections?.reduce((sum, sec) => sum + (sec._count?.students || 0), 0) || 0;
                return (
                    <Group gap={4}>
                        <IconUsers size={14} color="gray" />
                        <Text size="sm">{totalStudents}</Text>
                    </Group>
                );
            }
        },
        {
            accessor: 'actions',
            header: '',
            render: (item) => (
                <Group justify="flex-end">
                    <ActionMenu
                        onEdit={() => handleEditClass(item)}
                        onDelete={() => handleDeleteClass(item)}
                    />
                </Group>
            )
        },
    ];

    return (
        <>
            {!asComponent && (
                <PageHeader
                    title={"Classes & Sections"}
                    subtitle={"Manage class sections, timetables, and teacher assignments"}
                    actions={
                        <Button
                            leftSection={<IconPlus size={18} />}
                            onClick={() => setCreateModalOpened(true)}
                        >
                            {activeTab === 'classes' ? 'Add Class' : 'Add Section'}
                        </Button>
                    }
                />
            )}

            {asComponent && (
                <Group justify="space-between" mb="md">
                    <Text size="sm" c="dimmed">
                        Manage class sections, timetables, and teacher assignments
                    </Text>
                    <Button
                        leftSection={<IconPlus size={16} />}
                        onClick={() => setCreateModalOpened(true)}
                    >
                        {activeTab === 'classes' ? 'Add Class' : 'Add Section'}
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
                <Tabs value={activeTab} onChange={setActiveTab} mb="lg">
                    <Tabs.List mb="md">
                        <Tabs.Tab value="classes" leftSection={<IconSchool size={16} />}>Classes</Tabs.Tab>
                        <Tabs.Tab value="sections" leftSection={<IconDoor size={16} />}>Sections</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="classes">
                        <DataTable
                            data={activeTab === 'classes' ? paginatedData as any[] : []}
                            columns={classColumns as any[]}
                            search={search}
                            onSearchChange={(val) => {
                                setSearch(val);
                                setPage(1);
                            }}
                            pagination={{
                                total: totalPages,
                                page: page,
                                onChange: setPage
                            }}
                        />
                    </Tabs.Panel>

                    <Tabs.Panel value="sections">
                        <DataTable
                            data={activeTab === 'sections' ? paginatedData as any[] : []}
                            columns={sectionColumns as any[]}
                            search={search}
                            onSearchChange={(val) => {
                                setSearch(val);
                                setPage(1);
                            }}
                            pagination={{
                                total: totalPages,
                                page: page,
                                onChange: setPage
                            }}
                        />
                    </Tabs.Panel>
                </Tabs>
            )}

            <CreateClassModal
                opened={createModalOpened}
                onClose={() => setCreateModalOpened(false)}
                onSuccess={fetchClasses}
                classLevels={classLevels}
                teachers={teachers}
                initialType={activeTab === 'classes' ? 'level' : 'section'}
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
                teachers={teachers}
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

