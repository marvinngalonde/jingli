import { useState } from 'react';
import {
    Button,
    Group,
    Text,
    Badge
} from '@mantine/core';
import {
    IconPlus,
    IconUsers
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';

// Common Components
import { PageHeader } from '../components/common/PageHeader';
import { DataTable, type Column } from '../components/common/DataTable';
import { ActionMenu } from '../components/common/ActionMenu';

interface ClassGroup {
    id: string;
    grade: string;
    section: string;
    classTeacher: string;
    studentCount: number;
    roomNumber: string;
}

import { useAuth } from '../context/AuthContext';

export default function Classes() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const { user } = useAuth();
    const isTeacher = user?.role === 'teacher';

    // Mock Data
    const mockClasses: ClassGroup[] = [
        { id: '1', grade: '10', section: 'A', classTeacher: 'Sarah Teacher', studentCount: 28, roomNumber: '101' },
        { id: '2', grade: '10', section: 'B', classTeacher: 'Ellen Ripley', studentCount: 26, roomNumber: '102' },
        { id: '3', grade: '9', section: 'A', classTeacher: 'Sarah Teacher', studentCount: 30, roomNumber: '201' },
        { id: '4', grade: '9', section: 'B', classTeacher: 'Kyle Reese', studentCount: 29, roomNumber: '202' },
        { id: '5', grade: '11', section: 'A', classTeacher: 'James Cameron', studentCount: 25, roomNumber: '301' },
    ];

    const filteredData = mockClasses.filter(item => {
        const matchesSearch = `${item.grade}${item.section}`.toLowerCase().includes(search.toLowerCase()) ||
            item.classTeacher.toLowerCase().includes(search.toLowerCase());

        if (isTeacher) {
            // Mock filtering: In real app, this would be based on ID. 
            // Here we match the mock logged-in teacher's name 'Sarah Teacher'
            return matchesSearch && item.classTeacher === 'Sarah Teacher';
        }

        return matchesSearch;
    });

    const columns: Column<ClassGroup>[] = [
        {
            accessor: 'name',
            header: 'Class Name',
            render: (item) => (
                <Text fw={600} size="sm">Grade {item.grade}-{item.section}</Text>
            )
        },
        {
            accessor: 'classTeacher',
            header: 'Class Teacher',
            render: (item) => <Text size="sm">{item.classTeacher}</Text>
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
            accessor: 'roomNumber',
            header: 'Room',
            render: (item) => <Badge variant="light" color="gray">Rm {item.roomNumber}</Badge>
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
        </>
    );
}
