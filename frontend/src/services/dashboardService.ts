import { api } from './api';

export interface DashboardStats {
    students: number;
    staff: number;
    classes: number;
    revenue: number;
    attendance: number;
    recentActivity: {
        id: string;
        title: string;
        description: string;
        time: string;
        type: 'payment' | 'homework' | 'registration' | 'system';
    }[];
}

export const dashboardService = {
    getStats: async () => {
        const response = await api.get<DashboardStats>('/dashboard/stats');
        return response.data;
    }
};
