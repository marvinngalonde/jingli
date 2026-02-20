import { api } from './api';
import type { Message, Conversation, CreateMessageDto } from '../types/messages';

export const messagesService = {
    getConversations: async (userId: string): Promise<Conversation[]> => {
        const response = await api.get<Conversation[]>(`/messages/conversations?userId=${userId}`);
        return response.data;
    },

    getConversation: async (user1: string, user2: string): Promise<Message[]> => {
        const response = await api.get<Message[]>(`/messages/conversation?user1=${user1}&user2=${user2}`);
        return response.data;
    },

    sendMessage: async (dto: CreateMessageDto): Promise<Message> => {
        const response = await api.post<Message>('/messages', dto);
        return response.data;
    }
};
