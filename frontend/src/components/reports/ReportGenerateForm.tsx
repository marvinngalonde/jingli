import { Paper, Text, Group, Select, Button } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import type { UseFormReturnType } from '@mantine/form';

interface ReportGenerateFormProps {
    type: string;
    form: UseFormReturnType<{ reportType: string; period: string }>;
    onSubmit: (values: { reportType: string; period: string }) => void;
    generating: boolean;
}

const REPORT_TYPE_DATA: Record<string, string[]> = {
    Financial: ['Fee Collection Summary', 'Unpaid Invoices (Defaulters)', 'Transaction Log', 'Fee Structure Breakdown'],
    Academic: ['Student Performance', 'Attendance Summary', 'Class Grade Master Sheet', 'Class Timetables'],
    HR: ['Staff Directory', 'Department Roster', 'Subject Allocations', 'Staff Attendance Summary'],
    Students: ['Student Directory', 'Class & Section Lists', 'New Admissions Log'],
    Logistics: ['Visitor Log', 'Gate Pass Registry', 'Late Arrivals Report', 'Admission Inquiries'],
    Library: ['Book Inventory', 'Overdue Circulations'],
};

export function ReportGenerateForm({ type, form, onSubmit, generating }: ReportGenerateFormProps) {
    const data = REPORT_TYPE_DATA[type] || ['Custom Query', 'Audit Log', 'System Activity'];

    return (
        <Paper withBorder p="md" radius="md" mb="md" bg="gray.0">
            <Text fw={500} mb="xs">Generate {type} Report</Text>
            <form onSubmit={form.onSubmit(onSubmit)}>
                <Group align="flex-end">
                    <Select
                        label="Report Type"
                        placeholder="Select report type"
                        required
                        data={data}
                        w={250}
                        {...form.getInputProps('reportType')}
                    />
                    <Select
                        label="Period"
                        placeholder="Select period"
                        data={['Last 7 Days', 'Last 30 Days', 'This Month', 'Last Month', 'Custom Range']}
                        w={200}
                        {...form.getInputProps('period')}
                    />
                    <Button
                        type="submit"
                        leftSection={<IconRefresh size={16} />}
                        loading={generating}
                    >
                        Generate
                    </Button>
                </Group>
            </form>
        </Paper>
    );
}
