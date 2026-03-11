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
    getAllUsers: async (includeInactive = false, page = 1, limit = 20): Promise<{ data: AdminUser[], total: number, page: number, pageSize: number, totalPages: number }> => {
        const response = await api.get(`/users?includeInactive=${includeInactive}&page=${page}&limit=${limit}`);
        return response.data;
    },

    getStats: async (): Promise<{ total: number, admins: number, teachers: number, students: number, active: number, inactive: number }> => {
        const response = await api.get('/users/stats');
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
