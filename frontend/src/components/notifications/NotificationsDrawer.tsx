import {
    Drawer, Stack, Group, Text, ActionIcon, Button, Divider,
    ScrollArea, ThemeIcon, Box, Center, Loader, Badge
} from '@mantine/core';
import {
    IconBell, IconCheck, IconChecks, IconInfoCircle,
    IconAlertTriangle, IconX, IconCircleCheck
} from '@tabler/icons-react';
import { useEffect, useState, useCallback } from 'react';
import { notificationsService } from '../../services/notificationsService';
import type { Notification } from '../../services/notificationsService';
import { notifications as mantineNotifications } from '@mantine/notifications';

interface Props {
    opened: boolean;
    onClose: () => void;
}

// ─── helpers ────────────────────────────────────────────────────────────────

function typeColor(type: Notification['type']) {
    return { INFO: 'blue', SUCCESS: 'green', WARNING: 'orange', ERROR: 'red' }[type] ?? 'gray';
}

function typeIcon(type: Notification['type']) {
    const icons = {
        INFO: IconInfoCircle,
        SUCCESS: IconCircleCheck,
        WARNING: IconAlertTriangle,
        ERROR: IconX,
    };
    const Icon = icons[type] ?? IconInfoCircle;
    return <Icon size={18} />;
}

function isToday(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate();
}

function formatRelative(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(dateStr).toLocaleDateString();
}

// ─── component ──────────────────────────────────────────────────────────────

export function NotificationsDrawer({ opened, onClose }: Props) {
    const [items, setItems] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [markingAll, setMarkingAll] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await notificationsService.getAll();
            setItems(data);
        } catch {
            // silently fail
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (opened) load();
    }, [opened, load]);

    const handleMarkRead = async (id: string) => {
        try {
            await notificationsService.markAsRead(id);
            setItems(prev => prev.map(n => n.id === id ? { ...n, readStatus: true } : n));
        } catch {
            mantineNotifications.show({ title: 'Error', message: 'Could not mark as read', color: 'red' });
        }
    };

    const handleMarkAllRead = async () => {
        setMarkingAll(true);
        try {
            await notificationsService.markAllAsRead();
            setItems(prev => prev.map(n => ({ ...n, readStatus: true })));
        } catch {
            mantineNotifications.show({ title: 'Error', message: 'Could not mark all as read', color: 'red' });
        } finally {
            setMarkingAll(false);
        }
    };

    const unread = items.filter(n => !n.readStatus);
    const todayItems = items.filter(n => isToday(n.createdAt));
    const earlierItems = items.filter(n => !isToday(n.createdAt));

    return (
        <Drawer
            opened={opened}
            onClose={onClose}
            title={
                <Group gap="xs">
                    <IconBell size={20} />
                    <Text fw={700} size="lg">Notifications</Text>
                    {unread.length > 0 && (
                        <Badge color="red" size="sm" circle>{unread.length}</Badge>
                    )}
                </Group>
            }
            position="right"
            size={400}
            padding="md"
        >
            <Stack h="100%" gap={0}>
                {/* Top action row */}
                {unread.length > 0 && (
                    <Group justify="flex-end" mb="sm">
                        <Button
                            variant="subtle"
                            size="xs"
                            leftSection={<IconChecks size={14} />}
                            onClick={handleMarkAllRead}
                            loading={markingAll}
                        >
                            Mark all as read
                        </Button>
                    </Group>
                )}

                {loading && (
                    <Center py="xl">
                        <Loader size="sm" />
                    </Center>
                )}

                {!loading && items.length === 0 && (
                    <Center py="xl">
                        <Stack align="center" gap="xs">
                            <ThemeIcon size={56} radius="xl" variant="light" color="gray">
                                <IconBell size={28} />
                            </ThemeIcon>
                            <Text c="dimmed" size="sm">You're all caught up!</Text>
                        </Stack>
                    </Center>
                )}

                {!loading && items.length > 0 && (
                    <ScrollArea flex={1} offsetScrollbars>
                        {todayItems.length > 0 && (
                            <>
                                <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="xs">Today</Text>
                                <Stack gap="xs" mb="md">
                                    {todayItems.map(n => (
                                        <NotifCard key={n.id} n={n} onMarkRead={handleMarkRead} />
                                    ))}
                                </Stack>
                            </>
                        )}

                        {earlierItems.length > 0 && (
                            <>
                                {todayItems.length > 0 && <Divider mb="md" />}
                                <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="xs">Earlier</Text>
                                <Stack gap="xs">
                                    {earlierItems.map(n => (
                                        <NotifCard key={n.id} n={n} onMarkRead={handleMarkRead} />
                                    ))}
                                </Stack>
                            </>
                        )}
                    </ScrollArea>
                )}
            </Stack>
        </Drawer>
    );
}

// ─── single notification card ────────────────────────────────────────────────

function NotifCard({ n, onMarkRead }: { n: Notification; onMarkRead: (id: string) => void }) {
    return (
        <Box
            p="sm"
            style={{
                borderRadius: 'var(--mantine-radius-md)',
                background: n.readStatus ? 'transparent' : 'var(--mantine-color-blue-0)',
                border: `1px solid ${n.readStatus ? 'var(--mantine-color-gray-2)' : 'var(--mantine-color-blue-2)'}`,
                position: 'relative',
            }}
        >
            <Group align="flex-start" gap="sm" wrap="nowrap">
                <ThemeIcon size={34} radius="xl" variant="light" color={typeColor(n.type)} mt={2}>
                    {typeIcon(n.type)}
                </ThemeIcon>

                <Box flex={1} style={{ minWidth: 0 }}>
                    <Group justify="space-between" wrap="nowrap" gap="xs">
                        <Text size="sm" fw={n.readStatus ? 500 : 700} truncate>{n.title}</Text>
                        <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                            {formatRelative(n.createdAt)}
                        </Text>
                    </Group>
                    <Text size="xs" c="dimmed" mt={2} style={{ wordBreak: 'break-word' }}>
                        {n.message}
                    </Text>
                </Box>

                {!n.readStatus && (
                    <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="blue"
                        title="Mark as read"
                        onClick={() => onMarkRead(n.id)}
                    >
                        <IconCheck size={14} />
                    </ActionIcon>
                )}
            </Group>
        </Box>
    );
}
