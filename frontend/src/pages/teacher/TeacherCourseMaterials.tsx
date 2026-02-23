import { Title, Text, Stack, Card, Button, Group, ActionIcon, LoadingOverlay, Table, Badge, FileInput, TextInput, Select, Modal } from '@mantine/core';
import { IconArrowLeft, IconUpload, IconFile, IconTrash, IconDownload } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';
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

export function TeacherCourseMaterials() {
    const { sectionId } = useParams();
    const navigate = useNavigate();
    const [materials, setMaterials] = useState<CourseMaterial[]>([]);
    const [loading, setLoading] = useState(true);

    const [opened, { open, close }] = useDisclosure(false);
    const [uploading, setUploading] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [fileUrl, setFileUrl] = useState(''); // Assuming simple URL input for MVP. True file upload would require Supabase storage integration.
    const [subjectId, setSubjectId] = useState('');
    const [selectedGlobalSectionId, setSelectedGlobalSectionId] = useState<string | null>(null);
    const [availableSubjects, setAvailableSubjects] = useState<{ value: string, label: string }[]>([]);
    const [availableClasses, setAvailableClasses] = useState<{ value: string, label: string }[]>([]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                if (sectionId) {
                    const [matsRes, classesRes] = await Promise.all([
                        api.get(`/teacher/classes/${sectionId}/materials`),
                        api.get('/teacher/classes') // Quick way to get assigned subjects
                    ]);
                    setMaterials(matsRes.data);

                    // Extract subjects for this section
                    const thisClass = classesRes.data.find((c: any) => c.section.id === sectionId);
                    if (thisClass) {
                        setAvailableSubjects(thisClass.subjects.map((s: any) => ({
                            value: s.id,
                            label: `${s.name} (${s.code})`
                        })));
                        if (thisClass.subjects.length > 0) {
                            setSubjectId(thisClass.subjects[0].id);
                        }
                    }
                } else {
                    const [matsRes, classesRes] = await Promise.all([
                        api.get('/teacher/materials'),
                        api.get('/teacher/classes')
                    ]);
                    setMaterials(matsRes.data);

                    setAvailableClasses(classesRes.data.map((c: any) => ({
                        value: c.section.id,
                        label: `${c.section.classLevel.name} ${c.section.name}`
                    })));
                }
            } catch (error) {
                console.error("Failed to fetch materials", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [sectionId]);

    // Use custom hook to fetch subjects when global class selection changes
    useGlobalSubjectsEffect(sectionId, selectedGlobalSectionId, setAvailableSubjects, setSubjectId);

    const handleUpload = async () => {
        const targetSectionId = sectionId || selectedGlobalSectionId;
        if (!title || !fileUrl || !subjectId || !targetSectionId) return;
        setUploading(true);
        try {
            const { data } = await api.post(`/teacher/classes/${targetSectionId}/materials`, {
                title,
                description,
                fileUrl,
                fileType: fileUrl.split('.').pop() || 'unknown',
                subjectId
            });
            setMaterials([data, ...materials]);
            close();
            // Reset
            setTitle('');
            setDescription('');
            setFileUrl('');
            if (!sectionId) {
                setSelectedGlobalSectionId(null);
            }
        } catch (error) {
            console.error("Failed to upload material", error);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this material?')) return;
        try {
            await api.delete(`/teacher/materials/${id}`);
            setMaterials(materials.filter(m => m.id !== id));
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    return (
        <Stack gap="lg" pos="relative">
            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

            <Group justify="space-between">
                <Group>
                    <ActionIcon variant="light" size="lg" onClick={() => navigate('/teacher/classes')}>
                        <IconArrowLeft size={20} />
                    </ActionIcon>
                    <div>
                        <Title order={2}>{sectionId ? 'Course Materials' : 'All Materials'}</Title>
                        <Text c="dimmed">
                            {sectionId ? 'Upload and manage learning resources for this class.' : 'View all learning resources across your classes.'}
                        </Text>
                    </div>
                </Group>
                <Button leftSection={<IconUpload size={16} />} onClick={open}>
                    Upload Material
                </Button>
            </Group>
            <Card withBorder radius="md" p={0}>
                {materials.length === 0 && !loading ? (
                    <Text p="xl" ta="center" c="dimmed" fs="italic">No materials uploaded yet.</Text>
                ) : (
                    <Table verticalSpacing="md" striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Resource</Table.Th>
                                <Table.Th>Subject</Table.Th>
                                <Table.Th>Uploaded</Table.Th>
                                <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {materials.map((m) => (
                                <Table.Tr key={m.id}>
                                    <Table.Td>
                                        <Group gap="sm">
                                            <ActionIcon variant="light" color="blue" size="lg" component="a" href={m.fileUrl} target="_blank">
                                                <IconFile size={20} />
                                            </ActionIcon>
                                            <div>
                                                <Text size="sm" fw={500}>{m.title}</Text>
                                                <Text size="xs" c="dimmed">{m.description || 'No description'}</Text>
                                            </div>
                                        </Group>
                                    </Table.Td>
                                    <Table.Td>
                                        <Badge variant="light" color="grape">{m.subject?.name || 'Unknown'}</Badge>
                                    </Table.Td>
                                    <Table.Td>
                                        <Text size="sm">{format(new Date(m.uploadedAt), 'MMM dd, yyyy')}</Text>
                                    </Table.Td>
                                    <Table.Td style={{ textAlign: 'right' }}>
                                        <Group gap="xs" justify="flex-end">
                                            <ActionIcon variant="subtle" color="blue" component="a" href={m.fileUrl} target="_blank" title="Download">
                                                <IconDownload size={16} />
                                            </ActionIcon>
                                            <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(m.id)} title="Delete">
                                                <IconTrash size={16} />
                                            </ActionIcon>
                                        </Group>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                )}
            </Card>

            <Modal opened={opened} onClose={close} title="Upload Course Material" centered>
                <Stack gap="md">
                    <Select
                        label="Subject"
                        placeholder="Select subject"
                        data={availableSubjects}
                        value={subjectId}
                        onChange={(v) => setSubjectId(v || '')}
                        required
                    />
                    {!sectionId && (
                        <Select
                            label="Target Class"
                            placeholder="Select class"
                            data={availableClasses}
                            value={selectedGlobalSectionId}
                            onChange={setSelectedGlobalSectionId}
                            required
                        />
                    )}
                    <TextInput
                        label="Title"
                        placeholder="e.g., Chapter 1 Notes"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                    <TextInput
                        label="Description"
                        placeholder="Brief description (optional)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <TextInput
                        label="File URL"
                        placeholder="https://link-to-your-file.pdf"
                        value={fileUrl}
                        onChange={(e) => setFileUrl(e.target.value)}
                        required
                        description="For MVP, paste a direct link to the file. True file uploads will follow."
                    />
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={close}>Cancel</Button>
                        <Button onClick={handleUpload} loading={uploading} disabled={!title || !fileUrl || !subjectId || (!sectionId && !selectedGlobalSectionId)}>Upload</Button>
                    </Group>
                </Stack>
            </Modal>
        </Stack>
    );
}

// Effect to fetch subjects when selectedGlobalSectionId changes in global view
function useGlobalSubjectsEffect(sectionId: string | undefined, selectedGlobalSectionId: string | null, setAvailableSubjects: any, setSubjectId: any) {
    useEffect(() => {
        if (sectionId || !selectedGlobalSectionId) return;
        const fetchSubjects = async () => {
            try {
                const classesRes = await api.get('/teacher/classes');
                const thisClass = classesRes.data.find((c: any) => c.section.id === selectedGlobalSectionId);
                if (thisClass) {
                    setAvailableSubjects(thisClass.subjects.map((s: any) => ({
                        value: s.id,
                        label: `${s.name} (${s.code})`
                    })));
                    if (thisClass.subjects.length > 0) {
                        setSubjectId(thisClass.subjects[0].id);
                    }
                }
            } catch (err) { }
        };
        fetchSubjects();
    }, [selectedGlobalSectionId, sectionId, setAvailableSubjects, setSubjectId]);
}

export default TeacherCourseMaterials;
