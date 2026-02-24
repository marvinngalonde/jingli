import { Tabs } from '@mantine/core';
import { IconBook, IconCalendar, IconSchool, IconUsers } from '@tabler/icons-react';
import { PageHeader } from '../components/common/PageHeader';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { TimetableManagement } from '../components/timetable/TimetableManagement';
import { TeacherAllocations } from '../components/academics/TeacherAllocations';
import Classes from './Classes';
import Subjects from './Subjects';

export default function Academics() {
    const { user } = useAuth();
    const isStudentOrParent = user?.role === 'student' || user?.role === 'parent';

    const [activeTab, setActiveTab] = useState<string | null>(isStudentOrParent ? 'timetable' : 'classes');

    return (
        <>
            <PageHeader
                title="Academics Hub"
                subtitle={isStudentOrParent ? "My curriculum and schedule" : "Manage classes, subjects, timetables, and teacher assignments"}
            />

            <Tabs value={activeTab} onChange={setActiveTab} radius="md" keepMounted={false}>
                <Tabs.List mb="md">
                    {!isStudentOrParent && <Tabs.Tab value="classes" leftSection={<IconSchool size={16} />}>Classes & Sections</Tabs.Tab>}
                    {!isStudentOrParent && <Tabs.Tab value="subjects" leftSection={<IconBook size={16} />}>Subjects Catalog</Tabs.Tab>}
                    {!isStudentOrParent && <Tabs.Tab value="allocations" leftSection={<IconUsers size={16} />}>Teacher Allocations</Tabs.Tab>}
                    {isStudentOrParent && <Tabs.Tab value="subjects" leftSection={<IconBook size={16} />}>My Subjects</Tabs.Tab>}
                    <Tabs.Tab value="timetable" leftSection={<IconCalendar size={16} />}>Timetables</Tabs.Tab>
                </Tabs.List>

                {!isStudentOrParent && (
                    <Tabs.Panel value="classes">
                        <Classes asComponent />
                    </Tabs.Panel>
                )}

                <Tabs.Panel value="subjects">
                    <Subjects asComponent />
                </Tabs.Panel>

                {!isStudentOrParent && (
                    <Tabs.Panel value="allocations">
                        <TeacherAllocations />
                    </Tabs.Panel>
                )}

                <Tabs.Panel value="timetable">
                    <TimetableManagement isStudentOrParent={isStudentOrParent} />
                </Tabs.Panel>
            </Tabs>
        </>
    );
}
