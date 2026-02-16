import { Box } from '@mantine/core';
import { PageHeader } from '../components/common/PageHeader';
import { TimetableManagement } from '../components/timetable/TimetableManagement';

export default function Timetable() {
    return (
        <Box>
            <PageHeader
                title="Timetable Management"
                subtitle="Manage weekly class schedules"
            />
            <TimetableManagement />
        </Box>
    );
}
