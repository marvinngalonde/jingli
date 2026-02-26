import { api } from './api';

export interface AdminUser {
    id: string;
    username: string;
    email?: string;
    role: string;
    status: string;
    staffProfile?: { firstName: string; lastName: string; employeeId: string };
    studentProfile?: { firstName: string; lastName: string; admissionNo: string };
    guardianProfile?: { firstName: string; lastName: string };
}

export const adminUsersService = {
    getAllUsers: async (includeInactive = false): Promise<AdminUser[]> => {
        const response = await api.get<AdminUser[]>(`/users${includeInactive ? '?includeInactive=true' : ''}`);
        return response.data;
    },

    createUser: async (data: { username: string; email?: string; role: string; firstName: string; lastName: string; password?: string; studentIds?: string[] }) => {
        const response = await api.post('/users', data);
        return response.data;
    },

    updateUser: async (id: string, data: { username?: string; email?: string; role?: string; firstName?: string; lastName?: string; password?: string }) => {
        const response = await api.patch(`/users/${id}`, data);
        return response.data;
    },

    deleteUser: async (id: string) => {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    },

    restoreUser: async (id: string) => {
        const response = await api.patch(`/users/${id}/restore`);
        return response.data;
    },
};
