import { useState, useEffect, useCallback } from 'react';
import { Tabs, Paper, Text, Button, Select, Group, Stack, Box, Loader, Center, TextInput as MantineTextInput, ScrollArea, Table } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPrinter, IconSearch, IconChartBar, IconUsers, IconSchool, IconFileAnalytics, IconBuilding, IconBook, IconCsv, IconFileTypePdf } from '@tabler/icons-react';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable, type Column } from '../components/common/DataTable';
import { ReportStatsGrid } from '../components/reports/ReportStatsGrid';
import { ReportGenerateForm } from '../components/reports/ReportGenerateForm';
import { ReportDetailModal } from '../components/reports/ReportDetailModal';
import { reportsService, type LiveReportResult } from '../services/reportsService';
import type { ReportLog, ReportStats } from '../services/reportsService';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { exportToCsv } from '../utils/exportUtils';

const columns = (onView: (r: ReportLog) => void, onDownload: (r: ReportLog) => void, onDelete: (r: ReportLog) => void, downloadingId: string | null): Column<ReportLog>[] => [
    { accessor: 'name', header: 'Report Name' },
    { accessor: 'type', header: 'Type', render: (item) => <Text tt="capitalize">{item.type}</Text> },
    { accessor: 'createdAt', header: 'Generated', render: (item) => new Date(item.createdAt).toLocaleDateString() },
    {
        accessor: 'actions', header: 'Actions', render: (item) => (
            <Group gap="xs">
                <Button size="xs" variant="light" onClick={() => onView(item)}>View</Button>
                <Button size="xs" variant="light" color="red" loading={downloadingId === item.id} onClick={() => onDownload(item)}>PDF</Button>
                <Button size="xs" variant="light" color="gray" onClick={() => onDelete(item)}>Delete</Button>
            </Group>
        )
    }
];

// ─── Report catalogue ─────────────────────────────────────────────────────────
const REPORT_TYPES = [
    {
        group: 'Students', items: [
            { value: 'students', label: 'All Students', filters: ['classLevelId', 'status', 'gender', 'fromDate', 'toDate'] },
            { value: 'student-attendance', label: 'Student Attendance', filters: ['fromDate', 'toDate'] },
        ]
    },
    {
        group: 'Staff', items: [
            { value: 'staff', label: 'All Staff', filters: ['department'] },
        ]
    },
    {
        group: 'Finance', items: [
            { value: 'invoices', label: 'All Invoices', filters: ['status', 'fromDate', 'toDate'] },
            { value: 'transactions', label: 'Payment Transactions', filters: ['method', 'fromDate', 'toDate'] },
            { value: 'defaulters', label: 'Fee Defaulters', filters: [] },
            { value: 'revenue', label: 'Revenue by Period', filters: ['fromDate', 'toDate'] },
        ]
    },
    {
        group: 'Visitors', items: [
            { value: 'visitors', label: 'All Visitors', filters: ['status', 'fromDate', 'toDate', 'purpose'] },
            { value: 'current-visitors', label: 'Currently on Premises', filters: [] },
        ]
    },
    {
        group: 'Academic', items: [
            { value: 'classes', label: 'Classes & Sections', filters: [] },
            { value: 'subjects', label: 'Subjects List', filters: [] },
            { value: 'timetable', label: 'Timetable Grid', filters: [] },
        ]
    },
    {
        group: 'Overview', items: [
            { value: 'overview', label: 'School Overview', filters: [] },
        ]
    },
] as const;

const ALL_REPORT_ITEMS: any[] = REPORT_TYPES.flatMap(g => g.items as any);

// ─── Live Report Filters ──────────────────────────────────────────────────────
interface LiveFiltersProps {
    filters: string[];
    liveFilters: Record<string, string>;
    setLiveFilter: (key: string, val: string) => void;
    selectedType: string | null;
}

function LiveFilterControls({ filters, liveFilters, setLiveFilter, selectedType }: LiveFiltersProps) {
    return (
        <>
            {filters.includes('fromDate') && (
                <MantineTextInput label="From Date" type="date" w={160} value={liveFilters.fromDate || ''} onChange={e => setLiveFilter('fromDate', e.target.value)} />
            )}
            {filters.includes('toDate') && (
                <MantineTextInput label="To Date" type="date" w={160} value={liveFilters.toDate || ''} onChange={e => setLiveFilter('toDate', e.target.value)} />
            )}
            {filters.includes('status') && selectedType === 'visitors' && (
                <Select label="Status" data={[{ value: '', label: 'All' }, { value: 'IN', label: 'In' }, { value: 'OUT', label: 'Out' }]} value={liveFilters.status || ''} onChange={v => setLiveFilter('status', v || '')} w={120} />
            )}
            {filters.includes('status') && selectedType === 'students' && (
                <Select label="Status" data={[{ value: '', label: 'All Statuses' }, { value: 'ACTIVE', label: 'Active' }, { value: 'INACTIVE', label: 'Inactive' }, { value: 'SUSPENDED', label: 'Suspended' }, { value: 'GRADUATED', label: 'Graduated' }]} value={liveFilters.status || ''} onChange={v => setLiveFilter('status', v || '')} w={160} />
            )}
            {filters.includes('gender') && (
                <Select label="Gender" data={[{ value: '', label: 'All Genders' }, { value: 'MALE', label: 'Male' }, { value: 'FEMALE', label: 'Female' }, { value: 'OTHER', label: 'Other' }]} value={liveFilters.gender || ''} onChange={v => setLiveFilter('gender', v || '')} w={140} />
            )}
            {filters.includes('department') && (
                <Select label="Department" data={[{ value: '', label: 'All Departments' }, { value: 'Administration', label: 'Administration' }, { value: 'Science', label: 'Science' }, { value: 'Mathematics', label: 'Mathematics' }, { value: 'English', label: 'English' }, { value: 'Arts', label: 'Arts' }, { value: 'Sports', label: 'Sports' }, { value: 'IT', label: 'IT' }, { value: 'Finance', label: 'Finance' }]} value={liveFilters.department || ''} onChange={v => setLiveFilter('department', v || '')} w={190} />
            )}
            {filters.includes('method') && (
                <Select label="Payment Method" data={[{ value: '', label: 'All Methods' }, { value: 'CASH', label: 'Cash' }, { value: 'CARD', label: 'Card' }, { value: 'BANK_TRANSFER', label: 'Bank Transfer' }, { value: 'MOBILE_MONEY', label: 'Mobile Money' }]} value={liveFilters.method || ''} onChange={v => setLiveFilter('method', v || '')} w={180} />
            )}
            {filters.includes('purpose') && (
                <MantineTextInput label="Purpose (contains)" placeholder="e.g. Parent Meeting" value={liveFilters.purpose || ''} onChange={e => setLiveFilter('purpose', e.target.value)} w={200} />
            )}
        </>
    );
}

// ─── Live Result Table ────────────────────────────────────────────────────────
function LiveResultTable({ result, onExportCsv, onExportPdf, downloading }: { result: LiveReportResult; onExportCsv: () => void; onExportPdf: () => void; downloading: boolean }) {
    return (
        <Paper withBorder radius="md" p="md">
            <Group justify="space-between" mb="md">
                <div>
                    <Text fw={700} size="lg">{result.title}</Text>
                    <Text size="sm" c="dimmed">{result.totalRecords} record{result.totalRecords !== 1 ? 's' : ''}</Text>
                </div>
                <Group gap="xs">
                    <Button variant="light" leftSection={<IconCsv size={16} />} onClick={onExportCsv}>Export CSV</Button>
                    <Button variant="light" color="red" leftSection={<IconFileTypePdf size={16} />} onClick={onExportPdf} loading={downloading}>Export PDF</Button>
                </Group>
            </Group>
            <ScrollArea>
                <Table striped highlightOnHover withTableBorder withColumnBorders fz="sm">
                    <Table.Thead>
                        <Table.Tr>
                            {result.columns.map(col => <Table.Th key={col.key}>{col.header}</Table.Th>)}
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {result.rows.length === 0 ? (
                            <Table.Tr><Table.Td colSpan={result.columns.length}><Text c="dimmed" ta="center" py="md">No records found.</Text></Table.Td></Table.Tr>
                        ) : result.rows.map((row, i) => (
                            <Table.Tr key={i}>{result.columns.map(col => <Table.Td key={col.key}>{row[col.key] ?? '—'}</Table.Td>)}</Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </ScrollArea>
        </Paper>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function Reports() {
    const [activeTab, setActiveTab] = useState<string | null>('live');
    const [search, setSearch] = useState('');
    const [history, setHistory] = useState<ReportLog[]>([]);
    const [stats, setStats] = useState<ReportStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [selectedReport, setSelectedReport] = useState<ReportLog | null>(null);

    // Live report state
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [liveFilters, setLiveFilters] = useState<Record<string, string>>({});
    const [liveResult, setLiveResult] = useState<LiveReportResult | null>(null);
    const [liveLoading, setLiveLoading] = useState(false);
    const [liveDownloading, setLiveDownloading] = useState(false);

    const form = useForm({ initialValues: { reportType: '', period: 'Last 30 Days' } });

    useEffect(() => { loadReports(); }, []);

    const loadReports = async () => {
        setLoading(true);
        try {
            const [historyData, statsData] = await Promise.all([reportsService.getHistory(), reportsService.getStats()]);
            setHistory(historyData);
            setStats(statsData);
        } catch { notifications.show({ title: 'Error', message: 'Failed to load reports', color: 'red' }); }
        finally { setLoading(false); }
    };

    const handleGenerate = async (values: typeof form.values) => {
        if (!values.reportType) { notifications.show({ title: 'Required', message: 'Please select a report type', color: 'orange' }); return; }
        setGenerating(true);
        try {
            await reportsService.generateReport({ ...values, type: activeTab?.toUpperCase() });
            notifications.show({ title: 'Success', message: 'Report generated successfully', color: 'green' });
            loadReports();
        } catch { notifications.show({ title: 'Error', message: 'Failed to generate report', color: 'red' }); }
        finally { setGenerating(false); }
    };

    const handleRunReport = async () => {
        if (!selectedType) return;
        setLiveLoading(true);
        try { setLiveResult(await reportsService.getReportData(selectedType, liveFilters)); }
        catch { notifications.show({ title: 'Error', message: 'Failed to fetch report data', color: 'red' }); }
        finally { setLiveLoading(false); }
    };

    const handleExportLivePdf = async () => {
        if (!selectedType || !liveResult) return;
        setLiveDownloading(true);
        try { await reportsService.downloadReportDataPdf(selectedType, liveFilters, liveResult.title.replace(/\s+/g, '_')); notifications.show({ title: 'Success', message: 'PDF downloaded', color: 'green' }); }
        catch { notifications.show({ title: 'Error', message: 'Failed to download PDF', color: 'red' }); }
        finally { setLiveDownloading(false); }
    };

    const handleExportLiveCsv = () => {
        if (!liveResult) return;
        exportToCsv(liveResult.rows, liveResult.title.replace(/\s+/g, '_'));
        notifications.show({ title: 'Success', message: 'CSV exported', color: 'green' });
    };

    const handleDownloadPdf = async (report: ReportLog) => {
        setDownloadingId(report.id);
        try { await reportsService.downloadPdf(report.id, report.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()); notifications.show({ title: 'Success', message: 'Report downloaded successfully', color: 'green' }); }
        catch { notifications.show({ title: 'Error', message: 'Failed to download report', color: 'red' }); }
        finally { setDownloadingId(null); }
    };

    const handleDelete = (report: ReportLog) => {
        modals.openConfirmModal({
            title: 'Delete Report', centered: true,
            children: <Text size="sm">Are you sure you want to permanently delete <strong>{report.name}</strong>? This action cannot be undone.</Text>,
            labels: { confirm: 'Delete', cancel: 'Cancel' }, confirmProps: { color: 'red' },
            onConfirm: async () => {
                try { await reportsService.delete(report.id); notifications.show({ title: 'Deleted', message: 'Report removed from history', color: 'green' }); loadReports(); }
                catch { notifications.show({ title: 'Error', message: 'Failed to delete report', color: 'red' }); }
            },
        });
    };

    const filteredData = history.filter(item =>
        (activeTab === 'all' || item.type.toLowerCase() === activeTab) &&
        (item.name.toLowerCase().includes(search.toLowerCase()))
    );

    const setLiveFilter = useCallback((key: string, val: string) => setLiveFilters(prev => ({ ...prev, [key]: val })), []);
    const liveReportMeta = ALL_REPORT_ITEMS.find((r: any) => r.value === selectedType);
    const liveActiveFilters: string[] = (liveReportMeta?.filters as string[]) ?? [];

    return (
        <Box>
            <PageHeader
                title="Reports & Analytics"
                subtitle="Generate, view, and print system reports"
                actions={<Button leftSection={<IconPrinter size={16} />} onClick={() => window.print()} variant="light">Print Page</Button>}
            />

            {loading ? (
                <Center h={200}><Loader /></Center>
            ) : (
                <>
                    <ReportStatsGrid stats={stats} />

                    <Tabs value={activeTab} onChange={setActiveTab} radius="md" mb="lg">
                        <Tabs.List>
                            <Tabs.Tab value="live" leftSection={<IconChartBar size={16} />} style={{ fontWeight: activeTab === 'live' ? 700 : undefined }}>Live Reports</Tabs.Tab>
                            <Tabs.Tab value="students" leftSection={<IconUsers size={16} />}>Students</Tabs.Tab>
                            <Tabs.Tab value="academic" leftSection={<IconSchool size={16} />}>Academic</Tabs.Tab>
                            <Tabs.Tab value="financial" leftSection={<IconFileAnalytics size={16} />}>Financial</Tabs.Tab>
                            <Tabs.Tab value="hr" leftSection={<IconUsers size={16} />}>HR & Staff</Tabs.Tab>
                            <Tabs.Tab value="logistics" leftSection={<IconBuilding size={16} />}>Logistics</Tabs.Tab>
                            <Tabs.Tab value="library" leftSection={<IconBook size={16} />}>Library</Tabs.Tab>
                        </Tabs.List>

                        {/* Live Reports */}
                        <Tabs.Panel value="live" pt="md">
                            <Stack>
                                <Paper withBorder p="md" radius="md">
                                    <Text fw={600} mb="sm">Select Report Type</Text>
                                    <Group align="flex-end" wrap="wrap">
                                        <Select
                                            label="Report" placeholder="Choose a report…"
                                            data={REPORT_TYPES.map(g => ({ group: g.group, items: g.items.map(i => ({ value: i.value, label: i.label })) }))}
                                            value={selectedType}
                                            onChange={v => { setSelectedType(v); setLiveResult(null); setLiveFilters({}); }}
                                            w={280} searchable
                                        />
                                        <LiveFilterControls filters={liveActiveFilters} liveFilters={liveFilters} setLiveFilter={setLiveFilter} selectedType={selectedType} />
                                        <Button leftSection={<IconSearch size={16} />} onClick={handleRunReport} loading={liveLoading} disabled={!selectedType} mt={24}>Run Report</Button>
                                    </Group>
                                </Paper>

                                {liveLoading && <Center py="xl"><Loader /></Center>}
                                {liveResult && !liveLoading && (
                                    <LiveResultTable result={liveResult} onExportCsv={handleExportLiveCsv} onExportPdf={handleExportLivePdf} downloading={liveDownloading} />
                                )}
                            </Stack>
                        </Tabs.Panel>

                        {/* Category tabs */}
                        <Tabs.Panel value="students" pt="md"><ReportGenerateForm type="Students" form={form} onSubmit={handleGenerate} generating={generating} /></Tabs.Panel>
                        <Tabs.Panel value="academic" pt="md"><ReportGenerateForm type="Academic" form={form} onSubmit={handleGenerate} generating={generating} /></Tabs.Panel>
                        <Tabs.Panel value="financial" pt="md"><ReportGenerateForm type="Financial" form={form} onSubmit={handleGenerate} generating={generating} /></Tabs.Panel>
                        <Tabs.Panel value="hr" pt="md"><ReportGenerateForm type="HR" form={form} onSubmit={handleGenerate} generating={generating} /></Tabs.Panel>
                        <Tabs.Panel value="logistics" pt="md"><ReportGenerateForm type="Logistics" form={form} onSubmit={handleGenerate} generating={generating} /></Tabs.Panel>
                        <Tabs.Panel value="library" pt="md"><ReportGenerateForm type="Library" form={form} onSubmit={handleGenerate} generating={generating} /></Tabs.Panel>
                    </Tabs>

                    <div id="printable-area">
                        <DataTable data={filteredData} columns={columns(setSelectedReport, handleDownloadPdf, handleDelete, downloadingId)} search={search} onSearchChange={setSearch} />
                    </div>
                </>
            )}

            <ReportDetailModal report={selectedReport} onClose={() => setSelectedReport(null)} onDownload={handleDownloadPdf} downloadingId={downloadingId} />
        </Box>
    );
}
