import { useState, useEffect } from 'react';
import { Grid, Paper, Title, Stack, Text, Center, Loader, ActionIcon, Tooltip, Group, Modal, Select } from '@mantine/core';
import { IconMessagePlus } from '@tabler/icons-react';
import { useAuth } from '../../context/AuthContext';
import { messagesService } from '../../services/messagesService';
import type { Conversation } from '../../types/messages';
import { ConversationList } from './ConversationList';
import { ChatWindow } from './ChatWindow';
import { api } from '../../services/api';

export function Messenger() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPartner, setSelectedPartner] = useState<Conversation['partner'] | null>(null);

    // New Chat Modal
    const [modalOpened, setModalOpened] = useState(false);
    const [users, setUsers] = useState<{ value: string; label: string }[]>([]);
    const [searchingUsers, setSearchingUsers] = useState(false);

    useEffect(() => {
        loadConversations();
    }, []);

    const loadConversations = async () => {
        if (!user) return;
        try {
            const data = await messagesService.getConversations(user.id);
            setConversations(data);
        } catch (error) {
            console.error("Failed to load conversations", error);
        } finally {
            setLoading(false);
        }
    };

    const handleNewChat = async () => {
        setModalOpened(true);
        setSearchingUsers(true);
        try {
            const resp = await api.get('/users/search'); // I assuming such endpoint exists based on usual patterns or I'll need to check
            const userList = resp.data.filter((u: any) => u.id !== user?.id).map((u: any) => ({
                value: u.id,
                label: `${u.email} (${u.role})`
            }));
            setUsers(userList);
        } catch (error) {
            console.error("Failed to search users", error);
        } finally {
            setSearchingUsers(false);
        }
    };

    const startConversation = (userId: string) => {
        // Find if conversation already exists
        const existing = conversations.find(c => c.partner.id === userId);
        if (existing) {
            setSelectedPartner(existing.partner);
        } else {
            // Mock a partner object if starting fresh
            const selectedUser = users.find(u => u.value === userId);
            if (selectedUser) {
                // This is a bit hacky since we don't have the full partner profile yet
                setSelectedPartner({
                    id: userId,
                    email: selectedUser.label.split(' ')[0],
                    role: 'USER', // Placeholder
                    staffProfile: { firstName: selectedUser.label.split(' ')[0], lastName: '' }
                } as any);
            }
        }
        setModalOpened(false);
    };

    if (loading) return <Center h="400px"><Loader /></Center>;

    return (
        <>
            <Grid gutter="md">
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Paper withBorder radius="md" p={0}>
                        <Group p="md" justify="space-between" bg="gray.0" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)', borderTopLeftRadius: 'var(--mantine-radius-md)', borderTopRightRadius: 'var(--mantine-radius-md)' }}>
                            <Title order={5}>My Chats</Title>
                            <Tooltip label="New Conversation">
                                <ActionIcon onClick={handleNewChat} variant="light" color="blue">
                                    <IconMessagePlus size={18} />
                                </ActionIcon>
                            </Tooltip>
                        </Group>
                        <ConversationList
                            conversations={conversations}
                            selectedId={selectedPartner?.id || null}
                            onSelect={(id) => {
                                const conv = conversations.find(c => c.partner.id === id);
                                if (conv) setSelectedPartner(conv.partner);
                            }}
                        />
                    </Paper>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 8 }}>
                    {selectedPartner ? (
                        <ChatWindow
                            partnerId={selectedPartner.id}
                            partnerName={selectedPartner.staffProfile ? `${selectedPartner.staffProfile.firstName} ${selectedPartner.staffProfile.lastName}` : (selectedPartner.studentProfile ? `${selectedPartner.studentProfile.firstName} ${selectedPartner.studentProfile.lastName}` : selectedPartner.email)}
                        />
                    ) : (
                        <Paper withBorder radius="md" h="600px">
                            <Center h="100%">
                                <Stack align="center" gap="xs">
                                    <IconMessagePlus size={48} color="var(--mantine-color-gray-4)" />
                                    <Title order={4} c="dimmed">Select a conversation to start messaging</Title>
                                    <Text c="dimmed" size="sm">Or click the plus icon to start a new chat</Text>
                                </Stack>
                            </Center>
                        </Paper>
                    )}
                </Grid.Col>
            </Grid>

            <Modal opened={modalOpened} onClose={() => setModalOpened(false)} title="New Conversation" radius="md">
                <Select
                    label="Search User"
                    placeholder="Search by name or email"
                    data={users}
                    searchable
                    nothingFoundMessage="No users found"
                    onChange={(val) => val && startConversation(val)}
                    disabled={searchingUsers}
                    rightSection={searchingUsers ? <Loader size="xs" /> : undefined}
                />
            </Modal>
        </>
    );
}
