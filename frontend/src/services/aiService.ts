import { api } from './api';

export interface ChatMessage {
    role: 'user' | 'bot';
    content: string;
    timestamp: string;
}

export const aiService = {
    sendMessage: async (userId: string, sessionId: string | null, message: string): Promise<{ sessionId: string; message: string; timestamp: string }> => {
        const response = await api.post('/ai/chat', { userId, sessionId, message });
        return response.data;
    },
    getHistory: async (userId: string): Promise<any[]> => {
        const response = await api.get(`/ai/history/${userId}`);
        return response.data;
    },
    getSessionMessages: async (sessionId: string): Promise<any[]> => {
        const response = await api.get(`/ai/session/${sessionId}`);
        return response.data;
    }
};
