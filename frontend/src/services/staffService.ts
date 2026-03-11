import { api } from './api';
import type { Staff, CreateStaffDto, UpdateStaffDto } from '../types/staff';

export const staffService = {
    getAll: async (params?: { page?: number, limit?: number }) => {
        const response = await api.get<{ data: Staff[], total: number, page: number, pageSize: number, totalPages: number }>('/staff', { params });
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get<Staff>(`/staff/${id}`);
        return response.data;
    },

    create: async (data: CreateStaffDto) => {
        const response = await api.post<Staff>('/staff', data);
        return response.data;
    },

    update: async (id: string, data: UpdateStaffDto) => {
        const response = await api.patch<Staff>(`/staff/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        await api.delete(`/staff/${id}`);
    }
};
