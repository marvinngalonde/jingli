import { useState, useEffect } from 'react';
import { Paper, Tabs } from '@mantine/core';
import { IconCheckupList, IconHistory } from '@tabler/icons-react';
import { PageHeader } from '../../../components/common/PageHeader';
import { AttendanceSheet } from '../../../components/academics/AttendanceSheet';
import { AttendanceReports } from '../../../components/academics/AttendanceReports';

export default function TeacherAttendance() {
    return (
        <div>
            <PageHeader
                title="Attendance"
                subtitle="Mark and review attendance for your classes"
            />

            <Paper p="md" radius="md" withBorder bg="var(--app-surface)">
                <Tabs defaultValue="mark">
                    <Tabs.List>
                        <Tabs.Tab value="mark" leftSection={<IconCheckupList size={16} />}>
                            Mark Attendance
                        </Tabs.Tab>
                        <Tabs.Tab value="history" leftSection={<IconHistory size={16} />}>
                            Attendance Reports
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="mark" pt="md">
                        <AttendanceSheet />
                    </Tabs.Panel>
                    <Tabs.Panel value="history" pt="md">
                        <AttendanceReports />
                    </Tabs.Panel>
                </Tabs>
            </Paper>
        </div>
    );
}
