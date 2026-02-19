import { useState, useEffect } from 'react';
import { Button, Tabs, Text, Group } from '@mantine/core';
import { IconPlus, IconCalendar, IconFileAnalytics } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../context/AuthContext';
import { examsService } from '../services/examsService';
import { academicsService } from '../services/academics';
import type { Exam } from '../types/exams';
import Marks from './Marks';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable, type Column } from '../components/common/DataTable';
import { ActionMenu } from '../components/common/ActionMenu';
import { CreateExamModal } from '../components/modals/CreateExamModal';
import { EditExamModal } from '../components/modals/EditExamModal';

export function Exams() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<string | null>('schedule');

    // --- Schedule State ---
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [createModalOpened, setCreateModalOpened] = useState(false);
    const [editModalOpened, setEditModalOpened] = useState(false);
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (activeTab === 'schedule') {
            loadData();
        }
    }, [activeTab]);

    const loadData = async () => {
        try {
            setLoading(true);
            const examsData = await examsService.getExams(user?.schoolId || '');
            setExams(examsData);
        } catch (error) {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to load exams', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (exam: Exam) => {
        setSelectedExam(exam);
        setEditModalOpened(true);
    };

    const handleDelete = async (exam: Exam) => {
        if (!window.confirm(`Are you sure you want to delete "${exam.name}"? This will delete all associated grades.`)) return;
        try {
            await examsService.deleteExam(exam.id);
            notifications.show({ title: 'Success', message: 'Exam deleted', color: 'green' });
            loadData();
        } catch (error) {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to delete exam', color: 'red' });
        }
    };

    const filteredExams = exams.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.classLevel?.name.toLowerCase().includes(search.toLowerCase()) ||
        e.subject?.name.toLowerCase().includes(search.toLowerCase())
    );

    const columns: Column<Exam>[] = [
        { accessor: 'name', header: 'Exam Name', render: (item) => <Text fw={500}>{item.name}</Text> },
        { accessor: 'class', header: 'Class', render: (item) => <Text size="sm">{item.classLevel?.name || '-'}</Text> },
        { accessor: 'subject', header: 'Subject', render: (item) => <Text size="sm">{item.subject?.name || '-'}</Text> },
        {
            accessor: 'date', header: 'Date', render: (item) => (
                <div>
                    <Text size="sm">{new Date(item.date).toLocaleDateString()}</Text>
                    <Text size="xs" c="dimmed">{new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </div>
            )
        },
        { accessor: 'duration', header: 'Duration', render: (item) => <Text size="sm">{item.duration} mins</Text> },
        {
            accessor: 'actions', header: '', render: (item) => (
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
                title="Exams & Grading"
                subtitle="Manage exam schedules and student grades"
            />

            <Tabs value={activeTab} onChange={setActiveTab} radius="md" keepMounted={false}>
                <Tabs.List mb="md">
                    <Tabs.Tab value="schedule" leftSection={<IconCalendar size={16} />}>
                        Schedule Exams
                    </Tabs.Tab>
                    <Tabs.Tab value="gradebook" leftSection={<IconFileAnalytics size={16} />}>
                        Gradebook
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="schedule">
                    <Group justify="flex-end" mb="md">
                        <Button leftSection={<IconPlus size={16} />} onClick={() => setCreateModalOpened(true)}>
                            Schedule Exam
                        </Button>
                    </Group>

                    <DataTable
                        data={filteredExams}
                        columns={columns}
                        search={search}
                        onSearchChange={setSearch}
                        loading={loading}
                        pagination={{ total: 1, page: 1, onChange: () => { } }}
                    />
                </Tabs.Panel>

                <Tabs.Panel value="gradebook">
                    <Marks />
                </Tabs.Panel>
            </Tabs>

            <CreateExamModal
                opened={createModalOpened}
                onClose={() => setCreateModalOpened(false)}
                onSuccess={loadData}
            />

            <EditExamModal
                opened={editModalOpened}
                onClose={() => {
                    setEditModalOpened(false);
                    setSelectedExam(null);
                }}
                onSuccess={loadData}
                exam={selectedExam}
            />
        </>
    );
}
