import { useState, useEffect } from 'react';
import { Stack, Text, Badge, Paper, Title, Loader, Center, Group, ActionIcon, Tooltip } from '@mantine/core';
import { IconSpeakerphone, IconArrowRight } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { noticesService } from '../../services/noticesService';
import type { Notice } from '../../types/notices';

export function RecentNotices() {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const loadNotices = async () => {
            try {
                // Fetch first 3 notices
                const data = await noticesService.getAll();
                setNotices(data.slice(0, 3));
            } catch (error) {
                console.error("Failed to load dashboard notices", error);
            } finally {
                setLoading(false);
            }
        };

        loadNotices();
    }, []);

    if (loading) return <Center p="md"><Loader size="sm" /></Center>;

    if (notices.length === 0) {
        return (
            <Text c="dimmed" ta="center" size="sm" py="xl">
                No recent announcements.
            </Text>
        );
    }

    return (
        <Stack gap="md">
            {notices.map((notice) => (
                <Paper key={notice.id} p="xs" withBorder radius="md">
                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                        <Stack gap={2}>
                            <Group gap="xs">
                                <Badge size="xs" variant="light" color={
                                    notice.targetAudience === 'ALL' ? 'blue' :
                                        notice.targetAudience === 'STAFF' ? 'orange' : 'teal'
                                }>
                                    {notice.targetAudience}
                                </Badge>
                                <Text size="xs" c="dimmed">
                                    {new Date(notice.postedAt).toLocaleDateString()}
                                </Text>
                            </Group>
                            <Text fw={600} size="sm" lineClamp={1}>{notice.title}</Text>
                            <Text size="xs" c="dimmed" lineClamp={2}
                                dangerouslySetInnerHTML={{ __html: notice.content.substring(0, 100) }}
                            />
                        </Stack>
                        <Tooltip label="View all">
                            <ActionIcon variant="subtle" color="gray" onClick={() => navigate('/communication')}>
                                <IconArrowRight size={16} />
                            </ActionIcon>
                        </Tooltip>
                    </Group>
                </Paper>
            ))}
        </Stack>
    );
}
