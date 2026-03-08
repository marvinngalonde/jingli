import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { IconSchool, IconBook, IconFileDescription, IconClipboardList, IconDownload, IconFile, IconPlayerPlay, IconNotes, IconChevronRight } from '@tabler/icons-react';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { PageHeader } from '../../../components/common/PageHeader';
import { Title, Text, Card, Group, Badge, Paper, ThemeIcon, Stack, Loader, Center, SimpleGrid, ActionIcon, Tabs, Table, Anchor, Divider, UnstyledButton, Box } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

interface SubjectInfo {
    id: string;
    subjectId: string;
    subject: { id: string; name: string; code: string };
    teacher: { firstName: string; lastName: string };
}

interface Material {
    id: string;
    title: string;
    description?: string;
    fileUrl?: string;
    type: string;
    createdAt: string;
    subject?: { name: string; code: string };
}

export default function StudentPortalMaterials() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isMobile = useMediaQuery('(max-width: 48em)');
    const { data, isLoading: loading } = useQuery({
        queryKey: ['studentPortalMaterials'],
        queryFn: async () => {
            const classesRes = await api.get('/student/classes');
            const subjectsList = classesRes.data || [];

            // Load materials from all subjects
            const allMaterials: Material[] = [];
            for (const subj of subjectsList) {
                try {
                    const matRes = await api.get(`/student/classes/${subj.subject?.id || subj.subjectId}/materials`);
                    if (matRes.data) {
                        allMaterials.push(...matRes.data.map((m: any) => ({
                            ...m,
                            subject: subj.subject,
                        })));
                    }
                } catch { /* skip subjects with no materials */ }
            }
            return { subjectsList, allMaterials };
        },
        staleTime: 5 * 60 * 1000,
    });

    const subjects = data?.subjectsList || [];
    const materials = data?.allMaterials || [];

    const getTypeIcon = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'video': return <IconPlayerPlay size={16} />;
            case 'document': case 'pdf': return <IconFileDescription size={16} />;
            case 'notes': return <IconNotes size={16} />;
            default: return <IconFile size={16} />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'video': return 'red';
            case 'document': case 'pdf': return 'blue';
            case 'notes': return 'green';
            default: return 'gray';
        }
    };

    if (loading) return <Center h={400}><Loader /></Center>;

    return (
        <div>
            <PageHeader
                title="Learning Portal"
                subtitle="Access course materials, resources, and learning content"
            />

            <Tabs defaultValue="subjects">
                <Tabs.List mb="lg">
                    <Tabs.Tab value="subjects" leftSection={<IconBook size={16} />}>My Subjects</Tabs.Tab>
                    <Tabs.Tab value="materials" leftSection={<IconFileDescription size={16} />}>All Materials</Tabs.Tab>
                </Tabs.List>

                {/* Subjects Grid */}
                <Tabs.Panel value="subjects">
                    {subjects.length === 0 ? (
                        <Card withBorder radius="md" p="xl" ta="center" bg="var(--app-surface)">
                            <ThemeIcon variant="light" color="gray" size={60} radius="xl" mx="auto" mb="md">
                                <IconSchool size={30} />
                            </ThemeIcon>
                            <Text size="lg" fw={500}>No Subjects Enrolled</Text>
                            <Text c="dimmed" mt="xs">You are not enrolled in any subjects yet.</Text>
                        </Card>
                    ) : (
                        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
                            {subjects.map((subj: any) => (
                                <Card
                                    key={subj.id || subj.subjectId}
                                    withBorder
                                    radius="lg"
                                    padding="xl"
                                    shadow="sm"
                                    bg="var(--app-surface)"
                                    style={{
                                        transition: 'all 0.2s ease',
                                        border: '1px solid var(--app-border-light)',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = 'var(--mantine-shadow-md)';
                                        e.currentTarget.style.borderColor = 'var(--mantine-color-blue-3)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'none';
                                        e.currentTarget.style.boxShadow = 'var(--mantine-shadow-sm)';
                                        e.currentTarget.style.borderColor = 'var(--app-border-light)';
                                    }}
                                >
                                    <Group justify="space-between" mb="lg">
                                        <ThemeIcon size={48} radius="md" variant="light" color="blue" style={{ background: 'var(--mantine-color-blue-0)' }}>
                                            <IconBook size={28} />
                                        </ThemeIcon>
                                        <Badge variant="dot" color="blue" size="lg" radius="sm">
                                            {subj.subject?.code}
                                        </Badge>
                                    </Group>

                                    <Stack gap={4} mb="xl">
                                        <Text fw={700} size="xl" lh={1.2}>
                                            {subj.subject?.name}
                                        </Text>
                                        <Text size="sm" c="dimmed">
                                            Instructor: {subj.teacher?.firstName} {subj.teacher?.lastName}
                                        </Text>
                                    </Stack>

                                    <Divider mb="xl" variant="dashed" />

                                    <Group grow gap="md">
                                        <UnstyledButton
                                            onClick={() => navigate(`/student-portal/classes/${subj.subject?.id || subj.subjectId}/materials`)}
                                            style={{
                                                padding: '12px',
                                                borderRadius: '12px',
                                                backgroundColor: 'var(--app-surface-dim)',
                                                border: '1px solid var(--app-border-light)',
                                                textAlign: 'center',
                                                transition: 'background-color 0.2s',
                                            }}
                                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--mantine-color-blue-0)')}
                                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--app-surface-dim)')}
                                        >
                                            <IconFileDescription size={20} color="var(--mantine-color-blue-6)" style={{ margin: '0 auto 4px' }} />
                                            <Text size="xs" fw={600} c="blue">Materials</Text>
                                        </UnstyledButton>

                                        <UnstyledButton
                                            onClick={() => navigate(`/student-portal/classes/${subj.subject?.id || subj.subjectId}/assignments`)}
                                            style={{
                                                padding: '12px',
                                                borderRadius: '12px',
                                                backgroundColor: 'var(--app-surface-dim)',
                                                border: '1px solid var(--app-border-light)',
                                                textAlign: 'center',
                                                transition: 'background-color 0.2s',
                                            }}
                                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--mantine-color-orange-0)')}
                                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--app-surface-dim)')}
                                        >
                                            <IconClipboardList size={20} color="var(--mantine-color-orange-6)" style={{ margin: '0 auto 4px' }} />
                                            <Text size="xs" fw={600} c="orange">Assignments</Text>
                                        </UnstyledButton>
                                    </Group>
                                </Card>
                            ))}
                        </SimpleGrid>
                    )}
                </Tabs.Panel>

                {/* All Materials Tab */}
                <Tabs.Panel value="materials">
                    {materials.length === 0 ? (
                        <Card withBorder radius="md" p="xl" ta="center" bg="var(--app-surface)">
                            <ThemeIcon variant="light" color="gray" size={60} radius="xl" mx="auto" mb="md">
                                <IconFileDescription size={30} />
                            </ThemeIcon>
                            <Text size="lg" fw={500}>No Materials Available</Text>
                            <Text c="dimmed" mt="xs">Your teachers haven't uploaded any materials yet.</Text>
                        </Card>
                    ) : (
                        isMobile ? (
                            <Stack gap="sm">
                                {materials.map((mat: any) => (
                                    <Card key={mat.id} withBorder radius="md" p="sm">
                                        <Group justify="space-between" mb="xs" wrap="nowrap">
                                            <Group gap="sm" wrap="nowrap">
                                                <ThemeIcon variant="light" color={getTypeColor(mat.type)} size="sm" radius="md">
                                                    {getTypeIcon(mat.type)}
                                                </ThemeIcon>
                                                <Text size="sm" fw={600} lineClamp={1}>{mat.title}</Text>
                                            </Group>
                                            {mat.fileUrl && (
                                                <ActionIcon variant="light" color="blue" component="a" href={mat.fileUrl} target="_blank">
                                                    <IconDownload size={16} />
                                                </ActionIcon>
                                            )}
                                        </Group>
                                        <Group justify="space-between">
                                            <Badge variant="outline" color="grape" size="xs">{mat.subject?.code || '—'}</Badge>
                                            <Text size="xs" c="dimmed">
                                                {new Date(mat.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                            </Text>
                                        </Group>
                                        {mat.description && <Text size="xs" c="dimmed" mt={4} lineClamp={2}>{mat.description}</Text>}
                                    </Card>
                                ))}
                            </Stack>
                        ) : (
                            <Paper withBorder radius="md" bg="var(--app-surface)" p={0}>
                                <Table striped highlightOnHover className="mobile-stack-table">
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>Material</Table.Th>
                                            <Table.Th>Subject</Table.Th>
                                            <Table.Th>Type</Table.Th>
                                            <Table.Th>Date</Table.Th>
                                            <Table.Th w={60}></Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {materials.map((mat: any) => (
                                            <Table.Tr key={mat.id}>
                                                <Table.Td data-label="Material">
                                                    <Group gap="sm">
                                                        <ThemeIcon variant="light" color={getTypeColor(mat.type)} size="sm" radius="md">
                                                            {getTypeIcon(mat.type)}
                                                        </ThemeIcon>
                                                        <div>
                                                            <Text size="sm" fw={500}>{mat.title}</Text>
                                                            {mat.description && <Text size="xs" c="dimmed" lineClamp={1}>{mat.description}</Text>}
                                                        </div>
                                                    </Group>
                                                </Table.Td>
                                                <Table.Td data-label="Subject">
                                                    <Badge variant="outline" color="grape" size="sm">{mat.subject?.code || '—'}</Badge>
                                                </Table.Td>
                                                <Table.Td data-label="Type">
                                                    <Badge variant="light" color={getTypeColor(mat.type)} size="sm" tt="capitalize">{mat.type || 'File'}</Badge>
                                                </Table.Td>
                                                <Table.Td data-label="Date">
                                                    <Text size="sm" c="dimmed">
                                                        {new Date(mat.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                                    </Text>
                                                </Table.Td>
                                                <Table.Td>
                                                    {mat.fileUrl && (
                                                        <ActionIcon variant="light" color="blue" component="a" href={mat.fileUrl} target="_blank">
                                                            <IconDownload size={16} />
                                                        </ActionIcon>
                                                    )}
                                                </Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>
                            </Paper>
                        )
                    )}
                </Tabs.Panel>
            </Tabs>
        </div>
    );
}
