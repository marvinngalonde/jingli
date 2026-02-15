import {
    Box,
    Card,
    Button,
    Group,
    Text,
    Title,
    Select,
    Stack,
    Grid,
    Checkbox,
    rem,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { FileText, Download, Printer, Mail } from 'lucide-react';

const reportTypes = [
    { value: 'attendance', label: 'Attendance Report', description: 'Student attendance summary by class or individual' },
    { value: 'academic', label: 'Academic Performance Report', description: 'Grades, marks, and academic progress' },
    { value: 'financial', label: 'Financial Report', description: 'Fee collection, payments, and outstanding balances' },
    { value: 'staff', label: 'Staff Report', description: 'Staff attendance, payroll, and performance' },
    { value: 'transport', label: 'Transport Report', description: 'Route usage, student ridership, and vehicle status' },
    { value: 'library', label: 'Library Report', description: 'Book circulation, overdue items, and inventory' },
    { value: 'visitor', label: 'Visitor Log Report', description: 'Visitor check-ins and security logs' },
];

export default function Reports() {
    return (
        <Box p={{ base: 'sm', md: 'xl' }}>
            <Title order={2} mb="lg">
                Reports Generation
            </Title>

            <Grid gutter="md">
                {/* Report Configuration */}
                <Grid.Col span={{ base: 12, lg: 8 }}>
                    <Card shadow="sm" padding="lg" radius={2} withBorder>
                        <Title order={4} mb="md">
                            Generate Report
                        </Title>

                        <Stack gap="md">
                            <Select
                                label="Report Type"
                                placeholder="Select report type"
                                data={reportTypes.map((r) => ({ value: r.value, label: r.label }))}
                                size="sm"
                                radius={2}
                            />

                            <Group grow>
                                <DatePickerInput
                                    label="Start Date"
                                    placeholder="Select start date"
                                    size="sm"
                                    radius={2}
                                />
                                <DatePickerInput
                                    label="End Date"
                                    placeholder="Select end date"
                                    size="sm"
                                    radius={2}
                                />
                            </Group>

                            <Select
                                label="Class/Department (Optional)"
                                placeholder="Select class or department"
                                data={['All', 'Class 10A', 'Class 10B', 'Class 11A', 'Administration', 'Teaching Staff']}
                                size="sm"
                                radius={2}
                            />

                            <Stack gap="xs">
                                <Text size="sm" fw={500}>
                                    Include in Report:
                                </Text>
                                <Checkbox label="Summary Statistics" defaultChecked size="sm" />
                                <Checkbox label="Detailed Breakdown" defaultChecked size="sm" />
                                <Checkbox label="Charts and Graphs" size="sm" />
                                <Checkbox label="Comparative Analysis" size="sm" />
                            </Stack>

                            <Group mt="md">
                                <Button
                                    leftSection={<Download size={16} />}
                                    size="sm"
                                    radius={2}
                                    color="navy.9"
                                >
                                    Generate PDF
                                </Button>
                                <Button
                                    leftSection={<Download size={16} />}
                                    size="sm"
                                    radius={2}
                                    variant="outline"
                                    color="green"
                                >
                                    Export Excel
                                </Button>
                                <Button
                                    leftSection={<Printer size={16} />}
                                    size="sm"
                                    radius={2}
                                    variant="outline"
                                    color="gray"
                                >
                                    Print
                                </Button>
                                <Button
                                    leftSection={<Mail size={16} />}
                                    size="sm"
                                    radius={2}
                                    variant="outline"
                                    color="blue"
                                >
                                    Email
                                </Button>
                            </Group>
                        </Stack>
                    </Card>
                </Grid.Col>

                {/* Available Reports */}
                <Grid.Col span={{ base: 12, lg: 4 }}>
                    <Card shadow="sm" padding="lg" radius={2} withBorder>
                        <Title order={4} mb="md">
                            Available Reports
                        </Title>

                        <Stack gap="sm">
                            {reportTypes.map((report) => (
                                <Box
                                    key={report.value}
                                    p="sm"
                                    style={{
                                        backgroundColor: '#f9fafb',
                                        borderRadius: rem(4),
                                        cursor: 'pointer',
                                    }}
                                >
                                    <Group gap="xs">
                                        <FileText size={16} color="var(--mantine-color-navy-7)" />
                                        <Box style={{ flex: 1 }}>
                                            <Text size="sm" fw={600}>
                                                {report.label}
                                            </Text>
                                            <Text size="xs" c="dimmed">
                                                {report.description}
                                            </Text>
                                        </Box>
                                    </Group>
                                </Box>
                            ))}
                        </Stack>
                    </Card>
                </Grid.Col>
            </Grid>

            {/* Recent Reports */}
            <Card shadow="sm" padding="lg" radius={2} withBorder mt="md">
                <Title order={4} mb="md">
                    Recent Reports
                </Title>

                <Stack gap="sm">
                    <Group justify="space-between" p="sm" style={{ backgroundColor: '#f9fafb', borderRadius: rem(4) }}>
                        <Box>
                            <Text size="sm" fw={600}>
                                Monthly Attendance Report - December 2025
                            </Text>
                            <Text size="xs" c="dimmed">
                                Generated on Dec 31, 2025 at 10:30 AM
                            </Text>
                        </Box>
                        <Button size="xs" variant="outline" leftSection={<Download size={14} />} radius={2} color="gray">
                            Download
                        </Button>
                    </Group>

                    <Group justify="space-between" p="sm" style={{ backgroundColor: '#f9fafb', borderRadius: rem(4) }}>
                        <Box>
                            <Text size="sm" fw={600}>
                                Academic Performance Report - Term 2
                            </Text>
                            <Text size="xs" c="dimmed">
                                Generated on Dec 28, 2025 at 2:15 PM
                            </Text>
                        </Box>
                        <Button size="xs" variant="outline" leftSection={<Download size={14} />} radius={2} color="gray">
                            Download
                        </Button>
                    </Group>

                    <Group justify="space-between" p="sm" style={{ backgroundColor: '#f9fafb', borderRadius: rem(4) }}>
                        <Box>
                            <Text size="sm" fw={600}>
                                Financial Summary - Q4 2025
                            </Text>
                            <Text size="xs" c="dimmed">
                                Generated on Dec 25, 2025 at 9:00 AM
                            </Text>
                        </Box>
                        <Button size="xs" variant="outline" leftSection={<Download size={14} />} radius={2} color="gray">
                            Download
                        </Button>
                    </Group>
                </Stack>
            </Card>
        </Box>
    );
}
