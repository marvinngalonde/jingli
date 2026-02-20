import { useState } from 'react';
// Force HMR update
import { Title, Tabs, Paper } from '@mantine/core';
import { IconCheckupList, IconHistory } from '@tabler/icons-react';
import { PageHeader } from '../components/common/PageHeader';
import { AttendanceSheet as Sheet } from '../components/academics/AttendanceSheet';
import { AttendanceReports as Reports } from '../components/academics/AttendanceReports';

export default function AttendancePage() {
    return (
        <div>
            <PageHeader title="Attendance Management" />

            <Paper p="md" radius="md" withBorder>
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
                        <Sheet />
                    </Tabs.Panel>
                    <Tabs.Panel value="history" pt="md">
                        <Reports />
                    </Tabs.Panel>
                </Tabs>
            </Paper>
        </div>
    );
}
