import { useState, useEffect } from 'react';
import {
    Paper,
    Title,
    Group,
    Button,
    TextInput,
    Select,
    Stack,
    Text,
    Badge,
    ActionIcon,
    Menu,
    Loader,
    Center,
    Card,
    TypographyStylesProvider,
    Drawer,
} from '@mantine/core';
import {
    IconPlus,
    IconSearch,
    IconDotsVertical,
    IconEdit,
    IconTrash,
    IconSpeakerphone,
    IconCalendar,
    IconUser,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { noticesService } from '../../services/noticesService';
import type { Notice } from '../../types/notices';
import { NoticeForm } from './NoticeForm';
import { useAuth } from '../../context/AuthContext';

export function NoticeBoard() {
    const { user } = useAuth();
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [audienceFilter, setAudienceFilter] = useState<string | null>(null);

    // Form state
    const [drawerOpened, setDrawerOpened] = useState(false);
    const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

    useEffect(() => {
        loadNotices();
    }, []);

    const loadNotices = async () => {
        setLoading(true);
        try {
            const data = await noticesService.getAll();
            setNotices(data);
        } catch (error) {
            console.error("Failed to load notices", error);
            notifications.show({ title: 'Error', message: 'Failed to load notices', color: 'red' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this notice?')) return;
        try {
            await noticesService.delete(id);
            notifications.show({ title: 'Deleted', message: 'Notice deleted successfully', color: 'green' });
            loadNotices();
        } catch (error) {
            notifications.show({ title: 'Error', message: 'Failed to delete notice', color: 'red' });
        }
    };

    const handleEdit = (notice: Notice) => {
        setEditingNotice(notice);
        setDrawerOpened(true);
    };

    const handleCreate = () => {
        setEditingNotice(null);
        setDrawerOpened(true);
    };

    const filteredNotices = notices.filter(n => {
        const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) ||
            n.content.toLowerCase().includes(search.toLowerCase());
        const matchesAudience = !audienceFilter || n.targetAudience === audienceFilter;
        return matchesSearch && matchesAudience;
    });

    return (
        <Stack gap="md">
            <Paper p="md" radius="md" withBorder>
                <Group justify="space-between" mb="md">
                    <Group>
                        <TextInput
                            placeholder="Search notices..."
                            leftSection={<IconSearch size={16} />}
                            value={search}
                            onChange={(e) => setSearch(e.currentTarget.value)}
                            w={300}
                        />
                        <Select
                            placeholder="Filter by Audience"
                            data={[
                                { value: 'ALL', label: 'All' },
                                { value: 'STUDENTS', label: 'Students' },
                                { value: 'STAFF', label: 'Staff' },
                                { value: 'PARENTS', label: 'Parents' },
                            ]}
                            value={audienceFilter}
                            onChange={setAudienceFilter}
                            clearable
                        />
                    </Group>
                    {user?.role === 'admin' && (
                        <Button leftSection={<IconPlus size={16} />} onClick={handleCreate}>
                            Post New Notice
                        </Button>
                    )}
                </Group>

                {loading ? (
                    <Center p="xl"><Loader /></Center>
                ) : filteredNotices.length === 0 ? (
                    <Center p="xl" style={{ flexDirection: 'column' }}>
                        <IconSpeakerphone size={48} color="var(--mantine-color-dimmed)" />
                        <Text c="dimmed" mt="sm">No notices found.</Text>
                    </Center>
                ) : (
                    <Stack gap="md">
                        {filteredNotices.map((notice) => (
                            <Card key={notice.id} withBorder radius="md">
                                <Group justify="space-between" align="flex-start" mb="xs">
                                    <div>
                                        <Badge
                                            size="sm"
                                            variant="light"
                                            color={
                                                notice.targetAudience === 'ALL' ? 'blue' :
                                                    notice.targetAudience === 'STAFF' ? 'orange' : 'teal'
                                            }
                                            mb={4}
                                        >
                                            {notice.targetAudience}
                                        </Badge>
                                        <Title order={4}>{notice.title}</Title>
                                    </div>
                                    {user?.role === 'admin' && (
                                        <Menu position="bottom-end" withinPortal>
                                            <Menu.Target>
                                                <ActionIcon variant="subtle">
                                                    <IconDotsVertical size={16} />
                                                </ActionIcon>
                                            </Menu.Target>
                                            <Menu.Dropdown>
                                                <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => handleEdit(notice)}>
                                                    Edit
                                                </Menu.Item>
                                                <Menu.Item leftSection={<IconTrash size={14} />} color="red" onClick={() => handleDelete(notice.id)}>
                                                    Delete
                                                </Menu.Item>
                                            </Menu.Dropdown>
                                        </Menu>
                                    )}
                                </Group>

                                <TypographyStylesProvider p={0}>
                                    <div dangerouslySetInnerHTML={{ __html: notice.content }} />
                                </TypographyStylesProvider>

                                <Group mt="md" gap="xl">
                                    <Group gap={6}>
                                        <IconUser size={14} color="var(--mantine-color-dimmed)" />
                                        <Text size="xs" c="dimmed">
                                            {notice.poster?.staffProfile ?
                                                `${notice.poster.staffProfile.firstName} ${notice.poster.staffProfile.lastName}` :
                                                notice.poster?.email || 'System'}
                                        </Text>
                                    </Group>
                                    <Group gap={6}>
                                        <IconCalendar size={14} color="var(--mantine-color-dimmed)" />
                                        <Text size="xs" c="dimmed">
                                            {new Date(notice.postedAt).toLocaleDateString()}
                                        </Text>
                                    </Group>
                                    {notice.expiresAt && (
                                        <Group gap={6}>
                                            <Text size="xs" c="red">
                                                Expires: {new Date(notice.expiresAt).toLocaleDateString()}
                                            </Text>
                                        </Group>
                                    )}
                                </Group>
                            </Card>
                        ))}
                    </Stack>
                )}
            </Paper>

            <Drawer
                opened={drawerOpened}
                onClose={() => setDrawerOpened(false)}
                title={editingNotice ? 'Edit Notice' : 'Post New Notice'}
                position="right"
                size="lg"
            >
                <NoticeForm
                    initialData={editingNotice}
                    onSuccess={() => {
                        setDrawerOpened(false);
                        loadNotices();
                    }}
                />
            </Drawer>
        </Stack>
    );
}
