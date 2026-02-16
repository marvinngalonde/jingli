import { Tabs, Button, Group, Text, LoadingOverlay } from '@mantine/core';
import { IconBook, IconCalendar, IconPlus } from '@tabler/icons-react';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable, type Column } from '../components/common/DataTable';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { subjectsApi } from '../services/academics';
import type { Subject } from '../types/academics';
import { CreateSubjectModal } from '../components/modals/CreateSubjectModal';
import { EditSubjectModal } from '../components/modals/EditSubjectModal';
import { DeleteSubjectModal } from '../components/modals/DeleteSubjectModal';
import { ActionMenu } from '../components/common/ActionMenu';
import { TimetableManagement } from '../components/timetable/TimetableManagement';

export default function Academics() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isStudentOrParent = user?.role === 'student' || user?.role === 'parent';

    const [activeTab, setActiveTab] = useState<string | null>(isStudentOrParent ? 'timetable' : 'subjects');
    const [search, setSearch] = useState('');

    // Subjects state
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loadingSubjects, setLoadingSubjects] = useState(true);
    const [createModalOpened, setCreateModalOpened] = useState(false);
    const [editModalOpened, setEditModalOpened] = useState(false);
    const [deleteModalOpened, setDeleteModalOpened] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

    // Fetch subjects on mount
    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            setLoadingSubjects(true);
            const data = await subjectsApi.getAll();
            setSubjects(data);
        } catch (err) {
            console.error('Failed to fetch subjects:', err);
        } finally {
            setLoadingSubjects(false);
        }
    };

    const handleEditSubject = (item: Subject) => {
        setSelectedSubject(item);
        setEditModalOpened(true);
    };

    const handleDeleteSubject = (item: Subject) => {
        setSelectedSubject(item);
        setDeleteModalOpened(true);
    };

    const filteredSubjects = subjects.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.code.toLowerCase().includes(search.toLowerCase()) ||
        (item.department?.toLowerCase().includes(search.toLowerCase()) || false)
    );

    const subjectColumns: Column<Subject>[] = [
        {
            accessor: 'code',
            header: 'Code',
            width: 100,
            render: (item) => <Text fw={500} size="sm">{item.code}</Text>
        },
        {
            accessor: 'name',
            header: 'Subject Name',
            render: (item) => (
                <Text
                    fw={600}
                    size="sm"
                    style={{ cursor: 'pointer' }}
                    c="blue"
                    onClick={() => navigate(`/subjects/${item.id}`)}
                >
                    {item.name}
                </Text>
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
            render: (item) => !isStudentOrParent ? (
                <Group justify="flex-end">
                    <ActionMenu
                        onEdit={() => handleEditSubject(item)}
                        onDelete={() => handleDeleteSubject(item)}
                    />
                </Group>
            ) : null
        }
    ];

    const SubjectsTab = () => (
        <>
            <Group justify="space-between" mb="md">
                <Text size="sm" c="dimmed">
                    {isStudentOrParent ? "Subjects enrolled in for the current academic year." : "Manage subjects and assign them to grades/departments."}
                </Text>
                {!isStudentOrParent && (
                    <Button
                        leftSection={<IconPlus size={16} />}
                        onClick={() => setCreateModalOpened(true)}
                    >
                        Add Subject
                    </Button>
                )}
            </Group>
            <LoadingOverlay visible={loadingSubjects} />
            <DataTable
                data={filteredSubjects}
                columns={subjectColumns}
                search={search}
                onSearchChange={setSearch}
                pagination={{ total: 1, page: 1, onChange: () => { } }}
            />
        </>
    );

    return (
        <>
            <PageHeader
                title="Academics"
                subtitle={isStudentOrParent ? "My curriculum and schedule" : "Manage subjects, timetables, and curriculum"}
            />

            <Tabs value={activeTab} onChange={setActiveTab} radius="md">
                <Tabs.List mb="md">
                    {/* Re-ordering for students maybe? Or keeping same. Let's keep same for consistency but default to timetable */}
                    {!isStudentOrParent && <Tabs.Tab value="subjects" leftSection={<IconBook size={16} />}>Subjects</Tabs.Tab>}
                    {/* Actually students might want to see subjects too, just read only. Keeping it. */}
                    {isStudentOrParent && <Tabs.Tab value="subjects" leftSection={<IconBook size={16} />}>My Subjects</Tabs.Tab>}

                    <Tabs.Tab value="timetable" leftSection={<IconCalendar size={16} />}>Timetable</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="subjects">
                    <SubjectsTab />
                </Tabs.Panel>

                <Tabs.Panel value="timetable">
                    <TimetableManagement isStudentOrParent={isStudentOrParent} />
                </Tabs.Panel>
            </Tabs>

            {/* Subject Modals */}
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
