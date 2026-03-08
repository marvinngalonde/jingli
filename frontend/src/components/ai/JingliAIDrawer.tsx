import { Drawer, Stack, ScrollArea, TextInput, ActionIcon, Group, Text, Paper, Avatar, Loader, Box, NavLink, Divider, Tooltip, Flex, Badge, Image, CloseButton } from '@mantine/core';
import { IconSend, IconUser, IconHistory, IconPlus, IconMessages, IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand, IconCopy, IconCheck, IconPaperclip, IconPhoto } from '@tabler/icons-react';
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { aiService } from '../../services/aiService';
import type { ChatMessage } from '../../services/aiService';
import { useAuth } from '../../context/AuthContext';
import jaiLogo from '../../assets/logos/jai-trans.png';
import { useDisclosure, useClipboard, useMediaQuery } from '@mantine/hooks';

interface Session {
    id: string;
    title: string;
    createdAt: string;
}

interface JingliAIDrawerProps {
    opened: boolean;
    onClose: () => void;
}

export function JingliAIDrawer({ opened, onClose }: JingliAIDrawerProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<Session[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [sidebarOpened, { toggle: toggleSidebar, close: closeSidebar }] = useDisclosure(true);
    const [selectedFile, setSelectedFile] = useState<{ base64: string; mimeType: string; name: string } | null>(null);
    const isMobile = useMediaQuery('(max-width: 48em)');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const viewport = useRef<HTMLDivElement>(null);

    // Close sidebar by default on mobile
    useEffect(() => {
        if (isMobile) {
            closeSidebar();
        }
    }, [isMobile]);

    const scrollToBottom = () => {
        viewport.current?.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (opened && user) {
            loadHistory();
            if (!currentSessionId && messages.length === 0) {
                startNewChat();
            }
        }
    }, [opened, user]);

    const loadHistory = async () => {
        if (!user) return;
        try {
            const data = await aiService.getHistory(user.id);
            setHistory(data);
        } catch (error) {
            console.error('Failed to load history');
        }
    };

    const startNewChat = () => {
        setCurrentSessionId(null);
        setMessages([
            {
                role: 'bot',
                content: `Hello! I am **Jingli AI**, your intelligent assistant. How can I facilitate your work today?`,
                timestamp: new Date().toISOString(),
            }
        ]);
    };

    const selectSession = async (sessionId: string) => {
        setLoading(true);
        setCurrentSessionId(sessionId);
        try {
            const msgs = await aiService.getSessionMessages(sessionId);
            setMessages(msgs.map(m => ({
                role: m.role === 'model' ? 'bot' : 'user',
                content: m.content,
                timestamp: m.createdAt
            })));
        } catch (error) {
            console.error('Failed to load session');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = (event.target?.result as string).split(',')[1];
                setSelectedFile({
                    base64,
                    mimeType: file.type,
                    name: file.name
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || !user) return;

        const userMsg: ChatMessage = {
            role: 'user',
            content: input.trim(),
            timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, userMsg]);
        const currentFile = selectedFile;
        setSelectedFile(null); // Clear selected file
        setInput('');
        setLoading(true);

        try {
            const response = await aiService.sendMessage(
                user.id,
                currentSessionId,
                userMsg.content,
                currentFile?.base64,
                currentFile?.mimeType
            );
            if (!currentSessionId) {
                setCurrentSessionId(response.sessionId);
                loadHistory(); // Refresh history to show new session
            }
            const botMsg: ChatMessage = {
                role: 'bot',
                content: response.message,
                timestamp: response.timestamp,
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'bot',
                content: "I'm sorry, I'm experiencing some connectivity issues. Please try again in a moment.",
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
                    <img src={jaiLogo} alt="Jingli AI" style={{ height: 24 }} />
                    <Text fw={700}>Jingli AI</Text>
                    <Text size="xs" c="blue" fw={600} style={{ border: '1px solid var(--mantine-color-blue-4)', padding: '0 6px', borderRadius: '4px' }}>BETA</Text>
                </Group>
            }
            position="right"
            size="xl"
            styles={{
                header: { borderBottom: '1px solid var(--mantine-color-gray-2)', marginBottom: 0, padding: '15px 20px' },
                content: { display: 'flex', flexDirection: 'column' },
                body: { flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }
            }}
        >
            <Flex style={{ flex: 1, height: 'calc(100vh - 65px)', overflow: 'hidden' }}>
                {/* Sidebar */}
                <Box style={{
                    width: sidebarOpened ? (isMobile ? '100%' : 260) : (isMobile ? 0 : 48),
                    borderRight: !isMobile ? '1px solid var(--mantine-color-gray-2)' : 'none',
                    display: isMobile && !sidebarOpened ? 'none' : 'flex',
                    flexDirection: 'column',
                    background: 'var(--mantine-color-gray-0)',
                    transition: 'all 0.2s ease',
                    overflow: 'hidden',
                    position: isMobile && sidebarOpened ? 'absolute' : 'relative',
                    zIndex: isMobile ? 100 : 1,
                    height: '100%'
                }} p={sidebarOpened ? "md" : "xs"}>
                    <Group justify={sidebarOpened ? "space-between" : "center"} mb="xs" wrap="nowrap">
                        {sidebarOpened && (
                            <Group gap="xs" style={{ flexShrink: 0 }}>
                                <IconHistory size={16} color="dimmed" />
                                <Text size="xs" fw={700} c="dimmed">CHAT HISTORY</Text>
                            </Group>
                        )}
                        <Group gap={4}>
                            {sidebarOpened && (
                                <Tooltip label="New Chat">
                                    <ActionIcon variant="light" color="blue" size="sm" onClick={startNewChat}>
                                        <IconPlus size={14} />
                                    </ActionIcon>
                                </Tooltip>
                            )}
                            <Tooltip label={sidebarOpened ? "Collapse" : "Expand History"}>
                                <ActionIcon
                                    variant="subtle"
                                    color="gray"
                                    onClick={toggleSidebar}
                                    size="sm"
                                >
                                    {sidebarOpened ? <IconLayoutSidebarLeftCollapse size={18} /> : <IconLayoutSidebarLeftExpand size={18} />}
                                </ActionIcon>
                            </Tooltip>
                        </Group>
                    </Group>

                    {sidebarOpened && (
                        <>
                            <ScrollArea offsetScrollbars style={{ flex: 1 }}>
                                <Stack gap={4}>
                                    {history.map((session) => (
                                        <NavLink
                                            key={session.id}
                                            label={session.title || 'Untitled Chat'}
                                            leftSection={<IconMessages size={14} />}
                                            active={currentSessionId === session.id}
                                            onClick={() => selectSession(session.id)}
                                            styles={{ label: { fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }}
                                            variant="filled"
                                        />
                                    ))}
                                </Stack>
                            </ScrollArea>

                            <Divider my="sm" />
                            <NavLink
                                label="Clear history"
                                leftSection={<IconHistory size={14} />}
                                styles={{ label: { fontSize: '13px' } }}
                                disabled
                            />
                        </>
                    )}
                </Box>

                {/* Main Chat Area */}
                <Stack gap={0} style={{ flex: 1, position: 'relative', height: '100%', overflow: 'hidden', background: 'white' }}>
                    <ScrollArea flex={1} p="xl" viewportRef={viewport}>
                        <Stack gap="xl" maw={750} mx="auto" pt="xl" pb={40}>
                            {messages.map((msg, index) => (
                                <Group key={index} align="flex-start" wrap="nowrap" gap="md">
                                    <Avatar
                                        size="md"
                                        radius="md"
                                        src={msg.role === 'bot' ? jaiLogo : null}
                                        bg={msg.role === 'bot' ? 'transparent' : 'blue.1'}
                                    >
                                        {msg.role === 'user' && <IconUser size={20} />}
                                    </Avatar>
                                    <Box flex={1}>
                                        <Group gap="xs" mb={4}>
                                            <Text size="sm" fw={700}>
                                                {msg.role === 'bot' ? 'Jingli AI' : ((user as any)?.name || 'You')}
                                            </Text>
                                            <Text size="10px" c="dimmed">
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                        </Group>
                                        <Paper p="md" radius="md" withBorder={msg.role === 'bot'} bg={msg.role === 'bot' ? 'transparent' : 'blue.0'} style={{ position: 'relative' }}>
                                            <Box className="markdown-content" style={{ fontSize: '14.5px', lineHeight: 1.6 }}>
                                                {typeof msg.content === 'string' ? (
                                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                                ) : (
                                                    <pre style={{ fontSize: '12px', background: 'var(--mantine-color-gray-0)', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
                                                        {JSON.stringify(msg.content, null, 2)}
                                                    </pre>
                                                )}
                                            </Box>

                                            {msg.role === 'bot' && (
                                                <CopyButton content={typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content, null, 2)} />
                                            )}
                                        </Paper>
                                    </Box>
                                </Group>
                            ))}
                            {loading && (
                                <Group align="flex-start" wrap="nowrap" gap="md">
                                    <Avatar size="md" radius="md" src={jaiLogo} bg="transparent" />
                                    <Box flex={1}>
                                        <Text size="sm" fw={700} mb={4}>Jingli AI</Text>
                                        <Loader size="xs" variant="dots" />
                                    </Box>
                                </Group>
                            )}
                        </Stack>
                    </ScrollArea>

                    {/* Sticky Footer */}
                    <Box p="lg" style={{ borderTop: '1px solid var(--mantine-color-gray-2)', background: 'white', position: 'relative', zIndex: 5 }}>
                        <Box maw={750} mx="auto">
                            {selectedFile && (
                                <Paper withBorder p="xs" mb="sm" radius="md" style={{ display: 'inline-block', position: 'relative' }}>
                                    <Group gap="xs">
                                        {selectedFile.mimeType.startsWith('image/') ? (
                                            <Image src={`data:${selectedFile.mimeType};base64,${selectedFile.base64}`} h={40} w={40} radius="sm" />
                                        ) : (
                                            <IconPaperclip size={20} />
                                        )}
                                        <Text size="xs" maw={150} truncate>{selectedFile.name}</Text>
                                        <CloseButton size="xs" onClick={() => setSelectedFile(null)} />
                                    </Group>
                                </Paper>
                            )}

                            <Group gap="xs" align="flex-end">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={handleFileSelect}
                                    accept="image/*,application/pdf"
                                />
                                <Tooltip label="Attach file (Image/PDF)">
                                    <ActionIcon
                                        variant="subtle"
                                        color="gray"
                                        size="lg"
                                        h={42}
                                        w={42}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <IconPaperclip size={20} />
                                    </ActionIcon>
                                </Tooltip>
                                <TextInput
                                    placeholder="Message Jingli AI..."
                                    flex={1}
                                    size="md"
                                    radius="md"
                                    value={input}
                                    onChange={(e) => setInput(e.currentTarget.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    disabled={loading}
                                    styles={{ input: { background: 'var(--mantine-color-gray-0)', border: '1px solid var(--mantine-color-gray-3)' } }}
                                />
                                <ActionIcon
                                    onClick={handleSend}
                                    color="blue"
                                    variant="filled"
                                    size="lg"
                                    radius="md"
                                    h={42}
                                    w={42}
                                    loading={loading}
                                    disabled={!input.trim()}
                                >
                                    <IconSend size={18} />
                                </ActionIcon>
                            </Group>
                            <Text size="11px" ta="center" mt="sm" c="dimmed" fw={500}>
                                Jingli AI can make mistakes. Verify important information.
                            </Text>
                        </Box>
                    </Box>
                </Stack>
            </Flex>
        </Drawer>
    );
}

function CopyButton({ content }: { content: string }) {
    const clipboard = useClipboard({ timeout: 2000 });

    return (
        <Tooltip label={clipboard.copied ? 'Copied' : 'Copy response'} position="left">
            <ActionIcon
                variant="subtle"
                color={clipboard.copied ? 'teal' : 'gray'}
                onClick={() => clipboard.copy(content)}
                style={{ position: 'absolute', top: 5, right: 5, opacity: 0.6 }}
                size="sm"
            >
                {clipboard.copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
            </ActionIcon>
        </Tooltip>
    );
}
