import { api } from './api';

export interface AdminUser {
    id: string;
    username: string;
    email?: string;
    role: string;
    status: string;
    staffProfile?: { firstName: string; lastName: string; employeeId: string };
    studentProfile?: { firstName: string; lastName: string; admissionNo: string };
}

export const adminUsersService = {
    getAllUsers: async (): Promise<AdminUser[]> => {
        const response = await api.get<AdminUser[]>('/users');
        return response.data;
    },

    createUser: async (data: { username: string; email?: string; role: string; firstName: string; lastName: string; password?: string }) => {
        const response = await api.post('/users', data);
        return response.data;
    },

    deleteUser: async (id: string) => {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    }
};
