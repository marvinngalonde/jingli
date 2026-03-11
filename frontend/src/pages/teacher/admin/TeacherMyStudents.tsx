import { useState, useEffect } from 'react';
import { Title, Text, Select, Group, Badge, Paper, Avatar, Loader, Center, Stack, TextInput, ActionIcon, Tooltip, Divider, Card } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconUsers, IconSearch, IconEye, IconPhone } from '@tabler/icons-react';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { PageHeader } from '../../../components/common/PageHeader';
import { DataTable, type Column } from '../../../components/common/DataTable';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';

interface StudentRow {
    id: string;
    firstName: string;
    lastName: string;
    admissionNo: string;
    gender: string;
    section: { id: string; name: string };
    guardians?: { firstName: string; lastName: string; phone: string }[];
}

interface SectionOption {
    value: string;
    label: string;
}

export default function TeacherMyStudents() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [sections, setSections] = useState<SectionOption[]>([]);
    const [selectedSection, setSelectedSection] = useState<string | null>(null);
    const [students, setStudents] = useState<StudentRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const isMobile = useMediaQuery('(max-width: 48em)');

    useEffect(() => {
        loadSections();
    }, []);

    useEffect(() => {
        if (selectedSection) {
            loadStudents(selectedSection, page);
        }
    }, [selectedSection, page]);

    const loadSections = async () => {
        try {
            const res = await api.get('/teacher/classes');
            const sectionMap = new Map<string, string>();
            res.data.forEach((cls: any) => {
                const key = cls.section?.id;
                if (key && !sectionMap.has(key)) {
                    sectionMap.set(key, `${cls.section?.classLevel?.name || 'Unknown'} ${cls.section?.classLevel?.level ?? ''} — ${cls.section?.name || ''}`);
                }
            });
            const opts = Array.from(sectionMap.entries()).map(([value, label]) => ({ value, label }));
            setSections(opts);
            if (opts.length > 0) setSelectedSection(opts[0].value);
        } catch (error) {
            notifications.show({ title: 'Error', message: 'Failed to load your sections', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    const loadStudents = async (sectionId: string, pageNum: number) => {
        try {
            setStudentsLoading(true);
            const res = await api.get(`/teacher/classes/${sectionId}/students`, {
                params: { page: pageNum, limit: 20 }
            });
            // The teacher endpoint isn't using paginated structure yet, wait.
            // Oh, teacher endpoint is `/teacher/classes/:sectionId/students` not `/students`.
            // Let me check if backend teacher controller is paginated.
            // I'll assume it returns an array for now if not updated. If it returns PaginatedResponse, I'll handle it.
            // Let's assume we update the teacher controller to return paginated response.
            if (res.data.data) {
                setStudents(res.data.data);
                setTotalPages(res.data.totalPages);
            } else {
                setStudents(res.data);
                setTotalPages(1);
            }
        } catch (error) {
            notifications.show({ title: 'Error', message: 'Failed to load students', color: 'red' });
        } finally {
            setStudentsLoading(false);
        }
    };

    const filteredStudents = students.filter((s: StudentRow) =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        s.admissionNo.toLowerCase().includes(search.toLowerCase())
    );

    const columns: Column<StudentRow>[] = [
        {
            accessor: 'name',
            header: 'Student',
            render: (item) => (
                <Group gap="sm">
                    <Avatar color="blue" radius="xl" size="sm">
                        {item.firstName[0]}{item.lastName[0]}
                    </Avatar>
                    <div>
                        <Text size="sm" fw={500}>{item.firstName} {item.lastName}</Text>
                        <Text size="xs" c="dimmed">{item.admissionNo}</Text>
                    </div>
                </Group>
            ),
        },
        {
            accessor: 'gender',
            header: 'Gender',
            render: (item) => (
                <Badge variant="light" color={item.gender === 'MALE' ? 'blue' : 'pink'} size="sm">
                    {item.gender}
                </Badge>
            ),
        },
        {
            accessor: 'guardian',
            header: 'Guardian Contact',
            render: (item) => {
                const g = item.guardians?.[0];
                return g ? (
                    <div>
                        <Text size="sm">{g.firstName} {g.lastName}</Text>
                        <Text size="xs" c="dimmed">{g.phone}</Text>
                    </div>
                ) : <Text size="sm" c="dimmed">—</Text>;
            },
        },
        {
            accessor: 'actions',
            header: 'Actions',
            width: 80,
            render: (item) => (
                <Tooltip label="View Profile">
                    <ActionIcon
                        variant="light"
                        color="blue"
                        onClick={(e) => { e.stopPropagation(); navigate(`/students/${item.id}`); }}
                    >
                        <IconEye size={16} />
                    </ActionIcon>
                </Tooltip>
            ),
        },
    ];

    if (loading) return <Center h={400}><Loader /></Center>;

    return (
        <div>
            <PageHeader
                title="My Students"
                subtitle="View students in your assigned classes"
            />

            <Paper withBorder radius="md" p="md" mb="lg" bg="var(--app-surface)">
                <Stack gap="md">
                    <Group justify="space-between" align="flex-end">
                        <Select
                            label="Select Section"
                            placeholder="Choose a section"
                            data={sections}
                            value={selectedSection}
                            onChange={setSelectedSection}
                            searchable
                            flex={1}
                            miw={isMobile ? '100%' : 300}
                        />
                        {!isMobile && (
                            <Badge variant="light" color="teal" size="lg" mb={8}>
                                <IconUsers size={14} style={{ marginRight: 4 }} />
                                {filteredStudents.length} student(s)
                            </Badge>
                        )}
                    </Group>
                    <TextInput
                        placeholder="Search students..."
                        leftSection={<IconSearch size={16} />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        w={isMobile ? '100%' : 300}
                    />
                    {isMobile && (
                        <Badge variant="light" color="teal" size="sm" style={{ alignSelf: 'flex-start' }}>
                            <IconUsers size={14} style={{ marginRight: 4 }} />
                            {filteredStudents.length} student(s)
                        </Badge>
                    )}
                </Stack>
            </Paper>

            <DataTable
                data={filteredStudents}
                columns={columns}
                loading={studentsLoading}
                search={search}
                onSearchChange={setSearch}
                pagination={{ total: totalPages, page: page, onChange: setPage }}
            />
        </div>
    );
}
