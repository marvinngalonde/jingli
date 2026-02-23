import { Title, Text, Stack, Card, Group, ActionIcon, LoadingOverlay, Table, Badge } from '@mantine/core';
import { IconArrowLeft, IconFile, IconDownload } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';
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

export function StudentCourseMaterials() {
    const { subjectId } = useParams();
    const navigate = useNavigate();
    const [materials, setMaterials] = useState<CourseMaterial[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMaterials = async () => {
            if (!subjectId) return;
            try {
                // Endpoint to fetch materials for a specific subject
                const { data } = await api.get(`/student/classes/${subjectId}/materials`);
                setMaterials(data);
            } catch (error) {
                console.error("Failed to fetch materials", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMaterials();
    }, [subjectId]);

    return (
        <Stack gap="lg" pos="relative">
            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

            <Group justify="space-between">
                <Group>
                    <ActionIcon variant="light" size="lg" onClick={() => navigate('/student/classes')}>
                        <IconArrowLeft size={20} />
                    </ActionIcon>
                    <div>
                        <Title order={2}>Course Materials</Title>
                        <Text c="dimmed">View resources uploaded by your teacher.</Text>
                    </div>
                </Group>
            </Group>

            <Card withBorder radius="md" p={0}>
                {materials.length === 0 && !loading ? (
                    <Text p="xl" ta="center" c="dimmed" fs="italic">No materials available for this class.</Text>
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
                                        </Group>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                )}
            </Card>
        </Stack>
    );
}

export default StudentCourseMaterials;
