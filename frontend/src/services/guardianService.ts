import { api } from './api';

export interface Guardian {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    address?: string;
    relationship?: string;
    occupation?: string;
    userId?: string;
    students?: {
        student: {
            id: string;
            firstName: string;
            lastName: string;
            admissionNo: string;
        };
    }[];
}

export const guardianService = {
    getAll: async (params?: { page?: number; limit?: number }) => {
        const response = await api.get('/guardians', { params });
        return response.data;
    },
    getOne: async (id: string) => {
        const response = await api.get(`/guardians/${id}`);
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/guardians', data);
        return response.data;
    },
    update: async (id: string, data: any) => {
        const response = await api.patch(`/guardians/${id}`, data);
        return response.data;
    },
    delete: async (id: string) => {
        const response = await api.delete(`/guardians/${id}`);
        return response.data;
    },
    search: async (query: string) => {
        const response = await api.get('/guardians/search', { params: { query } });
        return response.data;
    }
};
