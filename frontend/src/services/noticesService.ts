import { api } from './api';
import type { Notice, CreateNoticeDto, UpdateNoticeDto } from '../types/notices';

export const noticesService = {
    getAll: async (audience?: string): Promise<Notice[]> => {
        const response = await api.get('/notices', {
            params: { audience }
        });
        return response.data;
    },

    getOne: async (id: string): Promise<Notice> => {
        const response = await api.get(`/notices/${id}`);
        return response.data;
    },

    create: async (dto: CreateNoticeDto): Promise<Notice> => {
        const response = await api.post('/notices', dto);
        return response.data;
    },

    update: async (id: string, dto: UpdateNoticeDto): Promise<Notice> => {
        const response = await api.patch(`/notices/${id}`, dto);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/notices/${id}`);
    }
};
