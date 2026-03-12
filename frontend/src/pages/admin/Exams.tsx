import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button, Tabs, Text, Group, Badge, Stack, Paper } from '@mantine/core';
import { IconPlus, IconCalendar, IconFileAnalytics, IconClock } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../../context/AuthContext';
import { examsService } from '../../services/examsService';
import { academicsService } from '../../services/academics';
import type { Exam } from '../../types/exams';
import Marks from './Marks';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, type Column } from '../../components/common/DataTable';
import { ActionMenu } from '../../components/common/ActionMenu';
import { CreateExamModal } from '../../components/modals/CreateExamModal';
import { EditExamModal } from '../../components/modals/EditExamModal';
import { ExamTimetableGrid } from '../../components/timetable/ExamTimetableGrid';

export function Exams() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<string | null>('timetable');

    // --- Schedule State ---
    const [createModalOpened, setCreateModalOpened] = useState(false);
    const [editModalOpened, setEditModalOpened] = useState(false);
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
    const [search, setSearch] = useState('');

    const { data: exams = [], isLoading: loading, refetch: loadData } = useQuery({
        queryKey: ['exams', user?.schoolId],
        queryFn: () => examsService.getExams(user?.schoolId || ''),
        enabled: activeTab === 'schedule' && !!user?.schoolId
    });



    const handleEdit = (exam: Exam) => {
        setSelectedExam(exam);
        setEditModalOpened(true);
    };

    const deleteMutation = useMutation({
        mutationFn: examsService.deleteExam,
        onSuccess: () => {
            notifications.show({ title: 'Success', message: 'Exam deleted', color: 'green' });
            loadData();
        },
        onError: (error) => {
            console.error(error);
            notifications.show({ title: 'Error', message: 'Failed to delete exam', color: 'red' });
        }
    });

    const handleDelete = async (exam: Exam) => {
        if (!window.confirm(`Are you sure you want to delete "${exam.name}"? This will delete all associated grades.`)) return;
        deleteMutation.mutate(exam.id);
    };

    const filteredExams = exams.filter(e => {
        const classLabel = `${e.classLevel?.name || ''} ${e.classLevel?.level || ''}`.trim();
        const q = search.toLowerCase();
        return e.name.toLowerCase().includes(q) ||
            classLabel.toLowerCase().includes(q) ||
            e.subject?.name.toLowerCase().includes(q);
    });

    const columns: Column<Exam>[] = [
        { accessor: 'name', header: 'Exam Name', render: (item) => <Text fw={500}>{item.name}</Text> },
        {
            accessor: 'class', header: 'Class', render: (item) => (
                <Badge variant="light" color="indigo" size="sm">
                    {`${item.classLevel?.name || ''} ${(item.classLevel as any)?.level || ''}`.trim() || '-'}
                </Badge>
            )
        },
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
                title="School Exams Schedule"
                subtitle="Manage exam schedules and student grades"
            />

            <Tabs value={activeTab} onChange={setActiveTab} radius="md" keepMounted={false}>
                <Tabs.List mb="md">
                    <Tabs.Tab value="timetable" leftSection={<IconClock size={16} />}>
                        Timetable View
                    </Tabs.Tab>
                    <Tabs.Tab value="schedule" leftSection={<IconCalendar size={16} />}>
                        List View
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="timetable">
                    <Group justify="flex-end" mb="md">
                        <Button leftSection={<IconPlus size={16} />} onClick={() => setCreateModalOpened(true)}>
                            Add Exam Entry
                        </Button>
                    </Group>
                    <ExamTimetableGrid exams={filteredExams as any[]} />
                </Tabs.Panel>

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
                        loading={loading || deleteMutation.isPending}
                        pagination={{ total: 1, page: 1, onChange: () => { } }}
                    />
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
