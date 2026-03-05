import { useState, useEffect } from 'react';
import { Title, Text, Select, Group, Badge, Paper, Avatar, Loader, Center, Stack, TextInput, ActionIcon, Tooltip } from '@mantine/core';
import { IconUsers, IconSearch, IconEye } from '@tabler/icons-react';
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

    useEffect(() => {
        loadSections();
    }, []);

    useEffect(() => {
        if (selectedSection) {
            loadStudents(selectedSection);
        }
    }, [selectedSection]);

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

    const loadStudents = async (sectionId: string) => {
        try {
            setStudentsLoading(true);
            const res = await api.get(`/teacher/classes/${sectionId}/students`);
            setStudents(res.data);
        } catch (error) {
            notifications.show({ title: 'Error', message: 'Failed to load students', color: 'red' });
        } finally {
            setStudentsLoading(false);
        }
    };

    const filteredStudents = students.filter(s =>
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
                <Group>
                    <Select
                        label="Select Section"
                        placeholder="Choose a section"
                        data={sections}
                        value={selectedSection}
                        onChange={setSelectedSection}
                        searchable
                        w={350}
                    />
                    <div style={{ flex: 1 }} />
                    <Badge variant="light" color="teal" size="lg" mt={24}>
                        <IconUsers size={14} style={{ marginRight: 4 }} />
                        {filteredStudents.length} student(s)
                    </Badge>
                </Group>
            </Paper>

            <DataTable
                data={filteredStudents}
                columns={columns}
                loading={studentsLoading}
                search={search}
                onSearchChange={setSearch}
                pagination={{ total: 1, page: 1, onChange: () => { } }}
            />
        </div>
    );
}
