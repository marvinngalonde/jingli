import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Grid, Paper, Title, Stack, Text, Center, Loader, ActionIcon, Tooltip, Group, Modal, Select, Button } from '@mantine/core';
import { IconMessagePlus, IconArrowLeft } from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';
import { useAuth } from '../../context/AuthContext';
import { messagesService } from '../../services/messagesService';
import type { Conversation } from '../../types/messages';
import { ConversationList } from './ConversationList';
import { ChatWindow } from './ChatWindow';
import { api } from '../../services/api';

export function Messenger() {
    const { user } = useAuth();
    const [selectedPartner, setSelectedPartner] = useState<Conversation['partner'] | null>(null);

    // New Chat Modal
    const [modalOpened, setModalOpened] = useState(false);

    const { data: conversationsData, isLoading: loading } = useQuery({
        queryKey: ['conversations', user?.id],
        queryFn: async () => {
            if (!user) return [];
            return await messagesService.getConversations(user.id);
        },
        enabled: !!user?.id
    });

    const conversations = conversationsData || [];

    const { data: usersData, isLoading: searchingUsers } = useQuery({
        queryKey: ['usersSearch'],
        queryFn: async () => {
            const resp = await api.get('/users/search');
            return resp.data.filter((u: any) => u.id !== user?.id).map((u: any) => {
                // Determine best name from profiles
                const name = u.staffProfile
                    ? `${u.staffProfile.firstName} ${u.staffProfile.lastName}`
                    : u.studentProfile
                        ? `${u.studentProfile.firstName} ${u.studentProfile.lastName}`
                        : u.email;

                return {
                    value: u.id,
                    label: `${name} (${u.role})`,
                    rawUser: u // Keep raw user for hydration
                };
            });
        },
        enabled: modalOpened
    });

    const users = usersData || [];

    const handleNewChat = () => {
        setModalOpened(true);
    };

    const startConversation = (userId: string) => {
        // Find if conversation already exists
        const existing = conversations.find(c => c.partner.id === userId);
        if (existing) {
            setSelectedPartner(existing.partner);
        } else {
            // Mock a partner object using the rawUser data
            const selectedUser = users.find((u: { value: string; label: string; rawUser: any }) => u.value === userId);
            if (selectedUser) {
                const u = selectedUser.rawUser;
                setSelectedPartner({
                    id: userId,
                    email: u.email,
                    role: u.role,
                    staffProfile: u.staffProfile,
                    studentProfile: u.studentProfile
                } as any);
            }
        }
        setModalOpened(false);
    };

    const isMobile = useMediaQuery('(max-width: 48em)');
    const showChat = !isMobile || selectedPartner;

    if (loading) return <Center h="400px"><Loader /></Center>;

    return (
        <Paper shadow="none" style={{ backgroundColor: 'transparent' }}>
            <Grid gutter="xs">
                {(!isMobile || !selectedPartner) && (
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Paper withBorder radius="md" p={0} style={{ overflow: 'hidden', height: isMobile ? 'calc(100vh - 200px)' : 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
                            <Group p="md" justify="space-between" bg="gray.0" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
                                <Title order={5}>My Chats</Title>
                                <Tooltip label="New Conversation">
                                    <ActionIcon onClick={handleNewChat} variant="light" color="blue">
                                        <IconMessagePlus size={18} />
                                    </ActionIcon>
                                </Tooltip>
                            </Group>
                            <div style={{ flex: 1, overflowY: 'auto' }}>
                                <ConversationList
                                    conversations={conversations}
                                    selectedId={selectedPartner?.id || null}
                                    onSelect={(id) => {
                                        const conv = conversations.find(c => c.partner.id === id);
                                        if (conv) setSelectedPartner(conv.partner);
                                    }}
                                />
                            </div>
                        </Paper>
                    </Grid.Col>
                )}

                {showChat && (
                    <Grid.Col span={{ base: 12, md: 8 }} style={{ display: isMobile && !selectedPartner ? 'none' : 'block' }}>
                        {selectedPartner ? (
                            <Paper withBorder radius="md" style={{ overflow: 'hidden', height: isMobile ? 'calc(100vh - 200px)' : 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
                                {isMobile && (
                                    <Group p="xs" bg="gray.0" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
                                        <Button
                                            variant="subtle"
                                            leftSection={<IconArrowLeft size={16} />}
                                            onClick={() => setSelectedPartner(null)}
                                            size="xs"
                                        >
                                            Back to Chats
                                        </Button>
                                    </Group>
                                )}
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <ChatWindow
                                        partnerId={selectedPartner.id}
                                        partnerName={selectedPartner.staffProfile ? `${selectedPartner.staffProfile.firstName} ${selectedPartner.staffProfile.lastName}` : (selectedPartner.studentProfile ? `${selectedPartner.studentProfile.firstName} ${selectedPartner.studentProfile.lastName}` : selectedPartner.email)}
                                    />
                                </div>
                            </Paper>
                        ) : (
                            <Paper withBorder radius="md" h={{ base: '500px', md: 'calc(100vh - 120px)' }} mih="400px" visibleFrom="md">
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
                )}
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
        </Paper>
    );
}
