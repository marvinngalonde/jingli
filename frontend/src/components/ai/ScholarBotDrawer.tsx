import { Drawer, Stack, ScrollArea, TextInput, ActionIcon, Group, Text, Paper, Avatar, Center, Loader, Box } from '@mantine/core';
import { IconSend, IconRobot, IconUser } from '@tabler/icons-react';
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { aiService } from '../../services/aiService';
import type { ChatMessage } from '../../services/aiService';
import { useAuth } from '../../context/AuthContext';
import jaiLogo from '../../assets/logos/jai-trans.png';

interface ScholarBotDrawerProps {
    opened: boolean;
    onClose: () => void;
}

export function ScholarBotDrawer({ opened, onClose }: ScholarBotDrawerProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: 'bot',
            content: "Hi! I'm **ScholarBot**, your academic assistant. How can I help you with your studies today?",
            timestamp: new Date().toISOString(),
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const viewport = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        viewport.current?.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !user) return;

        const userMsg: ChatMessage = {
            role: 'user',
            content: input.trim(),
            timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const response = await aiService.sendMessage(user.id, userMsg.content);
            const botMsg: ChatMessage = {
                role: 'bot',
                content: response.message,
                timestamp: response.timestamp,
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'bot',
                content: "Sorry, I'm having trouble connecting right now. Please try again later.",
                timestamp: new Date().toISOString(),
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Drawer
            opened={opened}
            onClose={onClose}
            title={
                <Group gap="xs">
                    <img src={jaiLogo} alt="ScholarBot" style={{ height: 24 }} />
                    <Text fw={700}>ScholarBot AI</Text>
                </Group>
            }
            position="right"
            size="md"
            styles={{
                header: { borderBottom: '1px solid var(--mantine-color-gray-2)', marginBottom: '10px' },
                content: { display: 'flex', flexDirection: 'column' },
                body: { flex: 1, display: 'flex', flexDirection: 'column', padding: 0 }
            }}
        >
            <Stack h="calc(100vh - 80px)" gap={0}>
                <ScrollArea flex={1} p="md" viewportRef={viewport}>
                    <Stack gap="md">
                        {messages.map((msg, index) => (
                            <Group key={index} align="flex-start" justify={msg.role === 'user' ? 'flex-end' : 'flex-start'} gap="xs">
                                {msg.role === 'bot' && (
                                    <Avatar size="sm" color="blue" radius="xl">
                                        <IconRobot size={18} />
                                    </Avatar>
                                )}
                                <Paper
                                    p="sm"
                                    radius="lg"
                                    bg={msg.role === 'user' ? 'blue.6' : 'gray.1'}
                                    c={msg.role === 'user' ? 'white' : 'black'}
                                    style={{ maxWidth: '85%' }}
                                >
                                    <Box className="markdown-content" style={{ fontSize: '14px' }}>
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </Box>
                                    <Text size="10px" opacity={0.6} ta={msg.role === 'user' ? 'right' : 'left'} mt={4}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </Paper>
                                {msg.role === 'user' && (
                                    <Avatar size="sm" color="gray" radius="xl">
                                        <IconUser size={18} />
                                    </Avatar>
                                )}
                            </Group>
                        ))}
                        {loading && (
                            <Group align="flex-start" gap="xs">
                                <Avatar size="sm" color="blue" radius="xl">
                                    <IconRobot size={18} />
                                </Avatar>
                                <Paper p="sm" radius="lg" bg="gray.1">
                                    <Loader size="xs" variant="dots" />
                                </Paper>
                            </Group>
                        )}
                    </Stack>
                </ScrollArea>

                <Paper p="md" style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
                    <Group gap="xs">
                        <TextInput
                            placeholder="Ask ScholarBot..."
                            flex={1}
                            value={input}
                            onChange={(e) => setInput(e.currentTarget.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            disabled={loading}
                        />
                        <ActionIcon
                            onClick={handleSend}
                            color="blue"
                            variant="filled"
                            size="lg"
                            radius="md"
                            loading={loading}
                            disabled={!input.trim()}
                        >
                            <IconSend size={18} />
                        </ActionIcon>
                    </Group>
                </Paper>
            </Stack>
        </Drawer>
    );
}
