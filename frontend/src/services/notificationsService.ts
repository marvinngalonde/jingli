import { api } from './api';

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
    readStatus: boolean;
    createdAt: string;
}

export const notificationsService = {
    getAll: async (unreadOnly: boolean = false): Promise<Notification[]> => {
        const response = await api.get(`/notifications?unreadOnly=${unreadOnly}`);
        return response.data;
    },

    getUnreadCount: async (): Promise<{ count: number }> => {
        const response = await api.get('/notifications/unread-count');
        return response.data;
    },

    markAsRead: async (id: string): Promise<void> => {
        await api.patch(`/notifications/${id}/read`);
    },

    markAllAsRead: async (): Promise<void> => {
        await api.patch('/notifications/read-all');
    },
};
