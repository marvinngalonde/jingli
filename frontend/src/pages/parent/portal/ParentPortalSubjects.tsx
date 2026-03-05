import { Title, Text, Stack, Card, SimpleGrid, Group, ThemeIcon, LoadingOverlay, Badge, Divider, Select } from '@mantine/core';
import { IconBooks, IconUsers } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../services/api';
import { PageHeader } from '../../../components/common/PageHeader';

export default function ParentPortalSubjects() {
    const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

    const { data: childrenData, isLoading: loadingChildren } = useQuery({
        queryKey: ['parentChildren'],
        queryFn: async () => {
            const res = await api.get('/parent/children');
            return res.data;
        }
    });

    const children = childrenData || [];

    useEffect(() => {
        if (children.length > 0 && !selectedChildId) {
            setSelectedChildId(children[0].id);
        }
    }, [children, selectedChildId]);

    const { data: classesData = [], isLoading: loadingClasses } = useQuery({
        queryKey: ['parentChildSubjects', selectedChildId],
        queryFn: async () => {
            if (!selectedChildId) return [];
            const res = await api.get(`/parent/children/${selectedChildId}/subjects`);
            return res.data;
        },
        enabled: !!selectedChildId,
        retry: false
    });

    const loading = loadingChildren || (!!selectedChildId && loadingClasses);

    return (
        <Stack gap="lg" pos="relative">
            <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

            <Group justify="space-between" align="flex-start">
                <PageHeader
                    title="Enrolled Subjects"
                    subtitle="Overview of subjects and assigned teachers for your child"
                />

                {children.length > 0 && (
                    <Select
                        leftSection={<IconUsers size={16} />}
                        placeholder="Select Child"
                        data={children.map((c: any) => ({ value: c.id, label: `${c.firstName} ${c.lastName}` }))}
                        value={selectedChildId}
                        onChange={setSelectedChildId}
                        style={{ width: 250 }}
                    />
                )}
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
                {classesData.length === 0 && !loading ? (
                    <Text fs="italic" c="dimmed">No enrolled subjects found for this child.</Text>
                ) : (
                    classesData.map((cls: any) => (
                        <Card
                            key={cls.id}
                            withBorder
                            radius="lg"
                            padding="xl"
                            shadow="sm"
                            bg="var(--app-surface)"
                            style={{
                                transition: 'all 0.2s ease',
                                border: '1px solid var(--app-border-light)',
                            }}
                            onMouseEnter={(e: any) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = 'var(--mantine-shadow-md)';
                                e.currentTarget.style.borderColor = 'var(--mantine-color-blue-3)';
                            }}
                            onMouseLeave={(e: any) => {
                                e.currentTarget.style.transform = 'none';
                                e.currentTarget.style.boxShadow = 'var(--mantine-shadow-sm)';
                                e.currentTarget.style.borderColor = 'var(--app-border-light)';
                            }}
                        >
                            <Group justify="space-between" mb="lg">
                                <ThemeIcon size={48} radius="md" variant="light" color="blue" style={{ background: 'var(--mantine-color-blue-0)' }}>
                                    <IconBooks size={28} />
                                </ThemeIcon>
                                <Badge variant="dot" color="blue" size="lg" radius="sm">
                                    {cls.subject.code}
                                </Badge>
                            </Group>

                            <Stack gap={4} mb="xl">
                                <Text fw={700} size="xl" lh={1.2}>
                                    {cls.subject.name}
                                </Text>
                                <Text size="sm" c="dimmed">
                                    Instructor: {cls.teacher.firstName} {cls.teacher.lastName}
                                </Text>
                            </Stack>
                            <Divider mb="xs" variant="dashed" />
                        </Card>
                    ))
                )}
            </SimpleGrid>
        </Stack>
    );
}
