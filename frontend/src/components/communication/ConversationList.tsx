import { NavLink, Avatar, Text, Stack, ScrollArea, Badge, Group } from '@mantine/core';
import type { Conversation } from '../../types/messages';

interface ConversationListProps {
    conversations: Conversation[];
    selectedId: string | null;
    onSelect: (id: string) => void;
}

export function ConversationList({ conversations, selectedId, onSelect }: ConversationListProps) {
    const getPartnerName = (partner: Conversation['partner']) => {
        if (partner.staffProfile) return `${partner.staffProfile.firstName} ${partner.staffProfile.lastName}`;
        if (partner.studentProfile) return `${partner.studentProfile.firstName} ${partner.studentProfile.lastName}`;
        return partner.email;
    };

    return (
        <ScrollArea h="600px">
            <Stack gap={0}>
                {conversations.length === 0 ? (
                    <Text ta="center" c="dimmed" size="sm" mt="xl">No conversations yet.</Text>
                ) : (
                    conversations.map((conv) => (
                        <NavLink
                            key={conv.partner.id}
                            active={selectedId === conv.partner.id}
                            onClick={() => onSelect(conv.partner.id)}
                            leftSection={
                                <Avatar radius="xl" size="sm" color="blue">
                                    {getPartnerName(conv.partner).charAt(0)}
                                </Avatar>
                            }
                            label={
                                <Group justify="space-between" wrap="nowrap">
                                    <Text size="sm" fw={500} lineClamp={1}>
                                        {getPartnerName(conv.partner)}
                                    </Text>
                                    <Badge size="xs" variant="light" color="gray">
                                        {conv.partner.role.toLowerCase()}
                                    </Badge>
                                </Group>
                            }
                            description={
                                <Text size="xs" c="dimmed" lineClamp={1}>
                                    {conv.lastMessage.content}
                                </Text>
                            }
                        />
                    ))
                )}
            </Stack>
        </ScrollArea>
    );
}
