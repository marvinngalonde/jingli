import { api } from './api';

export interface ChatMessage {
    role: 'user' | 'bot';
    content: string;
    timestamp: string;
}

export const aiService = {
    sendMessage: async (studentId: string, message: string): Promise<{ message: string; timestamp: string }> => {
        const response = await api.post('/ai/chat', { studentId, message });
        return response.data;
    }
};
