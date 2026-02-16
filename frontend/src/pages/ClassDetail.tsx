import { useState } from 'react';
import {
    Text,
    Grid,
    Paper,
    Group,
    Tabs,
    Button,
    Box,
    ThemeIcon
} from '@mantine/core';
import {
    IconArrowLeft,
    IconUsers,
    IconCalendar,
    IconSchool,
    IconChalkboard
} from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';

// Common Components
import { PageHeader } from '../components/common/PageHeader';
import { DataTable } from '../components/common/DataTable'; // We can reuse this for student list
import { StatusBadge } from '../components/common/StatusBadge';

// Sub-components
import { TimetableView } from '../components/classes/TimetableView';
import { SubjectTeacherList } from '../components/classes/SubjectTeacherList';

export default function ClassDetail() {
    const navigate = useNavigate();
    const { id } = useParams();
    console.log("Class ID:", id); // Silencing unused var warning
    const [activeTab, setActiveTab] = useState<string | null>('students');

    // Mock Class Info
    const classInfo = {
        name: 'Grade 10-A',
        teacher: 'Sarah Connor',
        room: '101',
        studentCount: 28,
        academicYear: '2023-2024'
    };

    // Mock Student List
    const students = [
        { id: '1', name: 'John Doe', rollNo: '1001', status: 'Active' },
        { id: '2', name: 'Jane Smith', rollNo: '1002', status: 'Active' },
        { id: '3', name: 'Bob Brown', rollNo: '1003', status: 'Active' },
        { id: '4', name: 'Alice White', rollNo: '1004', status: 'Absent' },
    ];

    const studentColumns = [
        { accessor: 'rollNo', header: 'Roll No.' },
        { accessor: 'name', header: 'Student Name' },
        {
            accessor: 'status',
            header: 'Status',
            render: (item: any) => <StatusBadge status={item.status} />
        }
    ];

    return (
        <Box p="md">
            <Button variant="subtle" color="gray" leftSection={<IconArrowLeft size={16} />} mb="md" onClick={() => navigate('/classes')}>
                Back to Classes
            </Button>

            <PageHeader
                title={classInfo.name}
                subtitle={`Class Teacher: ${classInfo.teacher}`}
                actions={<Button variant="light">Edit Class</Button>}
            />

            <Grid mb="lg">
                <Grid.Col span={4}>
                    <Paper withBorder p="md" radius="md">
                        <Group>
                            <ThemeIcon size="lg" radius="md" variant="light" color="blue">
                                <IconUsers size={20} />
                            </ThemeIcon>
                            <div>
                                <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Students</Text>
                                <Text fw={700} size="xl">{classInfo.studentCount}</Text>
                            </div>
                        </Group>
                    </Paper>
                </Grid.Col>
                <Grid.Col span={4}>
                    <Paper withBorder p="md" radius="md">
                        <Group>
                            <ThemeIcon size="lg" radius="md" variant="light" color="orange">
                                <IconChalkboard size={20} />
                            </ThemeIcon>
                            <div>
                                <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Room</Text>
                                <Text fw={700} size="xl">{classInfo.room}</Text>
                            </div>
                        </Group>
                    </Paper>
                </Grid.Col>
                <Grid.Col span={4}>
                    <Paper withBorder p="md" radius="md">
                        <Group>
                            <ThemeIcon size="lg" radius="md" variant="light" color="green">
                                <IconSchool size={20} />
                            </ThemeIcon>
                            <div>
                                <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Year</Text>
                                <Text fw={700} size="xl">{classInfo.academicYear}</Text>
                            </div>
                        </Group>
                    </Paper>
                </Grid.Col>
            </Grid>

            <Tabs value={activeTab} onChange={setActiveTab} variant="outline" radius="md">
                <Tabs.List mb="md">
                    <Tabs.Tab value="students" leftSection={<IconUsers size={16} />}>
                        Students
                    </Tabs.Tab>
                    <Tabs.Tab value="timetable" leftSection={<IconCalendar size={16} />}>
                        Timetable
                    </Tabs.Tab>
                    <Tabs.Tab value="teachers" leftSection={<IconSchool size={16} />}>
                        Subject Teachers
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="students">
                    <DataTable
                        data={students}
                        columns={studentColumns}
                        pagination={{ total: 1, page: 1, onChange: () => { } }}
                    />
                </Tabs.Panel>

                <Tabs.Panel value="timetable">
                    <TimetableView />
                </Tabs.Panel>

                <Tabs.Panel value="teachers">
                    <SubjectTeacherList />
                </Tabs.Panel>
            </Tabs>
        </Box>
    );
}
