import { useState, useEffect, useRef } from 'react';
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
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const viewport = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        viewport.current?.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' });
    };

    useEffect(() => {
        loadMessages();
        const interval = setInterval(loadMessages, 5000); // Poll every 5 seconds for basic "real-time"
        return () => clearInterval(interval);
    }, [partnerId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadMessages = async () => {
        if (!user) return;
        try {
            const data = await messagesService.getConversation(user.id, partnerId);
            setMessages(data);
        } catch (error) {
            console.error("Failed to load messages", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!newMessage.trim() || !user) return;
        try {
            const sent = await messagesService.sendMessage({
                senderId: user.id,
                receiverId: partnerId,
                content: newMessage.trim(),
            });
            setMessages([...messages, sent]);
            setNewMessage('');
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    if (loading) return <Center h="100%"><Loader size="sm" /></Center>;

    return (
        <Stack h={{ base: '500px', md: 'calc(100vh - 350px)' }} mih="400px" gap="xs">
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
