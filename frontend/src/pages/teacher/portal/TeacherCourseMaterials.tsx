import { Title, Text, Stack, Card, Button, Group, ActionIcon, LoadingOverlay, Table, Badge, TextInput, Select, Drawer, Textarea, ScrollArea, SimpleGrid, Paper, ThemeIcon, Modal, FileInput } from '@mantine/core';
import { IconUpload, IconFile, IconTrash, IconDownload, IconEdit, IconSearch, IconFileText, IconPhoto, IconVideo, IconFileSpreadsheet, IconCloudDownload, IconFileCheck } from '@tabler/icons-react';
import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../services/api';
import { storageService } from '../../../services/storageService';

import { useParams, useNavigate } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { format } from 'date-fns';

interface CourseMaterial {
    id: string;
    title: string;
    description: string | null;
    fileUrl: string;
    fileType: string | null;
    uploadedAt: string;
    subject: { name: string; code: string };
}

function getFileIcon(fileType: string | null) {
    const ft = (fileType || '').toLowerCase();
    if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(ft)) return { icon: IconFileText, color: 'red' };
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ft)) return { icon: IconPhoto, color: 'teal' };
    if (['mp4', 'avi', 'mov', 'mkv', 'webm'].includes(ft)) return { icon: IconVideo, color: 'grape' };
    if (['xls', 'xlsx', 'csv'].includes(ft)) return { icon: IconFileSpreadsheet, color: 'green' };
    return { icon: IconFile, color: 'blue' };
}

function getFileLabel(fileType: string | null) {
    const ft = (fileType || '').toUpperCase();
    if (!ft || ft === 'UNKNOWN') return 'FILE';
    return ft;
}

export function TeacherCourseMaterials() {
    const queryClient = useQueryClient();
    const { sectionId } = useParams();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [fileUrl, setFileUrl] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [subjectId, setSubjectId] = useState('');
    const [selectedGlobalSectionId, setSelectedGlobalSectionId] = useState<string | null>(null);
    const { data: classesData = [], isLoading: loadingClasses } = useQuery({
        queryKey: ['teacherClasses'],
        queryFn: () => api.get('/teacher/classes').then(res => res.data)
    });

    const { data: materialsData = [], isLoading: loadingMaterials } = useQuery({
        queryKey: ['teacherMaterials', sectionId],
        queryFn: () => {
            if (sectionId) return api.get(`/teacher/classes/${sectionId}/materials`).then(res => res.data);
            return api.get('/teacher/materials').then(res => res.data);
        }
    });

    const materials = materialsData as CourseMaterial[];
    const loading = loadingClasses || loadingMaterials;

    const availableClasses = useMemo(() => {
        if (sectionId) return [];
        return classesData.map((c: any) => ({ value: c.section.id, label: `${c.section.classLevel.name} ${c.section.classLevel.level ?? ""} ${c.section.name}` }));
    }, [classesData, sectionId]);

    const availableSubjects = useMemo(() => {
        const targetId = sectionId || selectedGlobalSectionId;
        if (!targetId) return [];
        const cls = classesData.find((c: any) => c.section.id === targetId);
        if (cls) return cls.subjects.map((s: any) => ({ value: s.id, label: `${s.name} (${s.code})` }));
        return [];
    }, [classesData, sectionId, selectedGlobalSectionId]);

    useEffect(() => {
        if (availableSubjects.length > 0 && !subjectId && !editingId) {
            setSubjectId(availableSubjects[0].value);
        }
    }, [availableSubjects, subjectId, editingId]);

    const resetForm = () => { setTitle(''); setDescription(''); setFileUrl(''); setFile(null); setSubjectId(''); setEditingId(null); if (!sectionId) setSelectedGlobalSectionId(null); };

    const openCreate = () => { resetForm(); openDrawer(); };

    const openEdit = (m: CourseMaterial) => {
        setEditingId(m.id);
        setTitle(m.title);
        setDescription(m.description || '');
        setFileUrl(m.fileUrl);
        openDrawer();
    };

    const saveMutation = useMutation({
        mutationFn: async () => {
            const targetSectionId = sectionId || selectedGlobalSectionId;
            let uploadedUrl = fileUrl;
            let fileType = fileUrl ? fileUrl.split('.').pop() || 'unknown' : 'unknown';

            if (file) {
                const path = await storageService.uploadDocument('documents', file.name, file);
                uploadedUrl = storageService.getPublicUrl('documents', path);
                fileType = file.name.split('.').pop() || 'unknown';
            }

            if (editingId) {
                await api.delete(`/teacher/materials/${editingId}`);
                if (targetSectionId && subjectId) {
                    return api.post(`/teacher/classes/${targetSectionId}/materials`, {
                        title, description, fileUrl: uploadedUrl,
                        fileType,
                        subjectId,
                    });
                }
            } else {
                if (!subjectId || !targetSectionId) throw new Error('Missing target section or subject');
                return api.post(`/teacher/classes/${targetSectionId}/materials`, {
                    title, description, fileUrl: uploadedUrl,
                    fileType,
                    subjectId,
                });
            }
        },
        onSuccess: () => {
            notifications.show({ title: 'Success', message: `Material ${editingId ? 'updated' : 'uploaded'}`, color: 'green' });
            closeDrawer();
            resetForm();
            queryClient.invalidateQueries({ queryKey: ['teacherMaterials'] });
        },
        onError: () => {
            notifications.show({ title: 'Error', message: 'Failed to save material', color: 'red' });
        }
    });

    const handleSave = () => {
        if (!title || (!fileUrl && !file)) return;
        saveMutation.mutate();
    };

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/teacher/materials/${id}`),
        onSuccess: () => {
            notifications.show({ title: 'Deleted', message: `"${deleteTarget?.title}" deleted`, color: 'orange' });
            queryClient.invalidateQueries({ queryKey: ['teacherMaterials'] });
            setDeleteTarget(null);
        },
        onError: () => {
            notifications.show({ title: 'Error', message: 'Failed to delete', color: 'red' });
            setDeleteTarget(null);
        }
    });

    const handleDelete = () => {
        if (!deleteTarget) return;
        deleteMutation.mutate(deleteTarget.id);
    };

    const filtered = materials.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <Stack gap="lg" pos="relative">
            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />

            <Group justify="space-between">
                <div>
                    <Title order={2}>Content Library</Title>
                    <Text c="dimmed" size="sm">Upload and manage learning resources — notes, videos, documents.</Text>
                </div>
                <Button leftSection={<IconUpload size={16} />} onClick={openCreate}>Upload Material</Button>
            </Group>

            {/* Stats */}
            <SimpleGrid cols={{ base: 2, md: 4 }}>
                <Paper p="md" radius="md" shadow="sm" withBorder>
                    <Group>
                        <ThemeIcon variant="light" color="blue" size="lg"><IconFile size={18} /></ThemeIcon>
                        <div>
                            <Text size="xs" c="dimmed">Total Resources</Text>
                            <Text fw={700} size="lg">{materials.length}</Text>
                        </div>
                    </Group>
                </Paper>
                <Paper p="md" radius="md" shadow="sm" withBorder>
                    <Group>
                        <ThemeIcon variant="light" color="red" size="lg"><IconFileText size={18} /></ThemeIcon>
                        <div>
                            <Text size="xs" c="dimmed">Documents</Text>
                            <Text fw={700} size="lg">{materials.filter(m => ['pdf', 'doc', 'docx', 'txt'].includes((m.fileType || '').toLowerCase())).length}</Text>
                        </div>
                    </Group>
                </Paper>
                <Paper p="md" radius="md" shadow="sm" withBorder>
                    <Group>
                        <ThemeIcon variant="light" color="grape" size="lg"><IconVideo size={18} /></ThemeIcon>
                        <div>
                            <Text size="xs" c="dimmed">Videos</Text>
                            <Text fw={700} size="lg">{materials.filter(m => ['mp4', 'avi', 'mov', 'mkv', 'webm'].includes((m.fileType || '').toLowerCase())).length}</Text>
                        </div>
                    </Group>
                </Paper>
                <Paper p="md" radius="md" shadow="sm" withBorder>
                    <Group>
                        <ThemeIcon variant="light" color="teal" size="lg"><IconPhoto size={18} /></ThemeIcon>
                        <div>
                            <Text size="xs" c="dimmed">Images</Text>
                            <Text fw={700} size="lg">{materials.filter(m => ['jpg', 'jpeg', 'png', 'gif', 'svg'].includes((m.fileType || '').toLowerCase())).length}</Text>
                        </div>
                    </Group>
                </Paper>
            </SimpleGrid>

            {/* Search */}
            <Group>
                <TextInput placeholder="Search materials..." leftSection={<IconSearch size={16} />} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ minWidth: 280 }} />
            </Group>

            {/* Table */}
            <Card withBorder radius="md" p={0}>
                {filtered.length === 0 && !loading ? (
                    <Stack align="center" p="xl">
                        <ThemeIcon size={60} variant="light" color="blue" radius="xl"><IconFile size={30} /></ThemeIcon>
                        <Title order={4}>No Materials Found</Title>
                        <Text c="dimmed" size="sm">Upload your first learning resource to get started.</Text>
                        <Button variant="light" onClick={openCreate}>Upload Material</Button>
                    </Stack>
                ) : (
                    <ScrollArea>
                        <Table verticalSpacing="md" striped highlightOnHover>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Resource</Table.Th>
                                    <Table.Th>Subject</Table.Th>
                                    <Table.Th>Type</Table.Th>
                                    <Table.Th>Uploaded</Table.Th>
                                    <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {filtered.map(m => {
                                    const fi = getFileIcon(m.fileType);
                                    const FileIcon = fi.icon;
                                    return (
                                        <Table.Tr key={m.id}>
                                            <Table.Td>
                                                <Group gap="sm">
                                                    <ThemeIcon variant="light" color={fi.color} size="lg" radius="md">
                                                        <FileIcon size={18} />
                                                    </ThemeIcon>
                                                    <div>
                                                        <Text size="sm" fw={500}>{m.title}</Text>
                                                        <Text size="xs" c="dimmed" lineClamp={1}>{m.description || 'No description'}</Text>
                                                    </div>
                                                </Group>
                                            </Table.Td>
                                            <Table.Td><Badge variant="light" color="grape">{m.subject?.name || '—'}</Badge></Table.Td>
                                            <Table.Td><Badge variant="outline" size="sm">{getFileLabel(m.fileType)}</Badge></Table.Td>
                                            <Table.Td><Text size="sm">{format(new Date(m.uploadedAt), 'MMM dd, yyyy')}</Text></Table.Td>
                                            <Table.Td style={{ textAlign: 'right' }}>
                                                <Group gap="xs" justify="flex-end">
                                                    <Button variant="subtle" color="teal" size="xs" component="a" href={m.fileUrl} target="_blank" leftSection={<IconCloudDownload size={16} />}>
                                                        Download for Offline
                                                    </Button>
                                                    <ActionIcon variant="subtle" color="orange" title="Edit" onClick={() => openEdit(m)}>
                                                        <IconEdit size={16} />
                                                    </ActionIcon>
                                                    <ActionIcon variant="subtle" color="red" title="Delete" onClick={() => setDeleteTarget({ id: m.id, title: m.title })}>
                                                        <IconTrash size={16} />
                                                    </ActionIcon>
                                                </Group>
                                            </Table.Td>
                                        </Table.Tr>
                                    );
                                })}
                            </Table.Tbody>
                        </Table>
                    </ScrollArea>
                )}
            </Card>

            {/* ═══════════ UPLOAD / EDIT DRAWER ═══════════ */}
            <Drawer opened={drawerOpened} onClose={closeDrawer} title={editingId ? 'Edit Material' : 'Upload Material'} position="right" size="md" padding="lg">
                <Stack gap="md">
                    {!sectionId && !editingId && (
                        <Select label="Target Class" placeholder="Select class" data={availableClasses} value={selectedGlobalSectionId} onChange={setSelectedGlobalSectionId} required searchable />
                    )}
                    {!editingId && (
                        <Select label="Subject" placeholder="Select subject" data={availableSubjects} value={subjectId} onChange={v => setSubjectId(v || '')} required searchable />
                    )}
                    <TextInput label="Title" placeholder="e.g., Chapter 1 Notes — Algebra" value={title} onChange={e => setTitle(e.target.value)} required />
                    <Textarea label="Description" placeholder="Brief description of this resource..." value={description} onChange={e => setDescription(e.target.value)} minRows={3} />
                    <FileInput
                        label="Upload File"
                        placeholder="Select file from computer"
                        value={file}
                        onChange={setFile}
                        leftSection={<IconUpload size={14} />}
                        required={!fileUrl}
                        description="Upload a local file or provide a URL below."
                        clearable
                    />
                    <TextInput
                        label="Or File URL"
                        placeholder="https://link-to-your-file.pdf"
                        value={fileUrl}
                        onChange={e => setFileUrl(e.target.value)}
                        required={!file}
                        disabled={!!file}
                        description="Paste a direct link to the file if it's hosted elsewhere."
                    />
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={closeDrawer}>Cancel</Button>
                        <Button onClick={handleSave} loading={saveMutation.isPending} disabled={!title || (!fileUrl && !file)}>
                            {editingId ? 'Update' : 'Upload'}
                        </Button>
                    </Group>
                </Stack>
            </Drawer>

            {/* ═══════════ DELETE CONFIRM ═══════════ */}
            <Modal opened={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Material" centered size="sm">
                <Text size="sm">Are you sure you want to delete <b>"{deleteTarget?.title}"</b>? This cannot be undone.</Text>
                <Group justify="flex-end" mt="lg">
                    <Button variant="default" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                    <Button color="red" onClick={handleDelete} loading={deleteMutation.isPending}>Delete</Button>
                </Group>
            </Modal>
        </Stack>
    );
}

export default TeacherCourseMaterials;
