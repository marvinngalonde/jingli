import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Paper, Stack, ScrollArea, Text, TextInput, ActionIcon, Group, Avatar, Center, Loader } from '@mantine/core';
import { IconSend } from '@tabler/icons-react';
import { messagesService } from '../../services/messagesService';
import type { Message } from '../../types/messages';
import { useAuth } from '../../context/AuthContext';

interface ChatWindowProps {
    partnerId: string;
    partnerName: string;
}

export function ChatWindow({ partnerId, partnerName }: ChatWindowProps) {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [newMessage, setNewMessage] = useState('');
    const viewport = useRef<HTMLDivElement>(null);

    const { data: messagesData, isLoading: loading } = useQuery({
        queryKey: ['chatMessages', user?.id, partnerId],
        queryFn: async () => {
            if (!user) return [];
            return await messagesService.getConversation(user.id, partnerId);
        },
        enabled: !!user?.id && !!partnerId,
        refetchInterval: 5000,
    });

    const messages = messagesData || [];

    const scrollToBottom = () => {
        viewport.current?.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMutation = useMutation({
        mutationFn: (msg: any) => messagesService.sendMessage(msg),
        onSuccess: () => {
            setNewMessage('');
            queryClient.invalidateQueries({ queryKey: ['chatMessages', user?.id, partnerId] });
            queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
        }
    });

    const handleSend = () => {
        if (!newMessage.trim() || !user) return;
        sendMutation.mutate({
            senderId: user.id,
            receiverId: partnerId,
            content: newMessage.trim(),
        });
    };

    if (loading) return <Center h="100%"><Loader size="sm" /></Center>;

    return (
        <Stack h="100%" gap="xs" p={0}>
            <Paper withBorder p="xs" radius="md">
                <Group>
                    <Avatar size="sm" color="blue">{partnerName.charAt(0)}</Avatar>
                    <Text fw={600}>{partnerName}</Text>
                </Group>
            </Paper>

            <ScrollArea flex={1} viewportRef={viewport} type="auto">
                <Stack gap="xs" p="xs">
                    {messages.map((msg) => {
                        const isMe = msg.senderId === user?.id;
                        return (
                            <Group key={msg.id} justify={isMe ? 'flex-end' : 'flex-start'} align="flex-end" gap="xs">
                                {!isMe && <Avatar size="xs" radius="xl">{partnerName.charAt(0)}</Avatar>}
                                <Paper
                                    p="xs"
                                    radius="lg"
                                    bg={isMe ? 'blue.6' : 'gray.1'}
                                    c={isMe ? 'white' : 'black'}
                                    style={{ maxWidth: '70%' }}
                                >
                                    <Text size="sm">{msg.content}</Text>
                                    <Text size="10px" opacity={0.7} ta={isMe ? 'right' : 'left'}>
                                        {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </Paper>
                            </Group>
                        );
                    })}
                </Stack>
            </ScrollArea>

            <Paper withBorder p="xs" radius="md">
                <Group gap="xs">
                    <TextInput
                        placeholder="Type a message..."
                        flex={1}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.currentTarget.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <ActionIcon onClick={handleSend} color="blue" variant="filled" size="lg" radius="md">
                        <IconSend size={18} />
                    </ActionIcon>
                </Group>
            </Paper>
        </Stack>
    );
}
