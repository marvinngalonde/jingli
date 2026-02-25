import { api } from './api';

export interface Expense {
    id: string;
    description: string;
    category: string;
    amount: number;
    currency: string;
    date: string;
    status: string;
    approvedBy?: string;
    receiptUrl?: string;
    notes?: string;
    createdAt: string;
    approver?: { id: string; username: string; email?: string };
}

export interface ExpenseStats {
    totalExpenses: number;
    thisMonth: number;
    pendingCount: number;
}

export const expenseService = {
    getAll: (category?: string, status?: string) => {
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (status) params.append('status', status);
        return api.get(`/expenses?${params}`).then(r => r.data as Expense[]);
    },

    getStats: () => api.get('/expenses/stats').then(r => r.data as ExpenseStats),

    create: (data: {
        description: string;
        category: string;
        amount: number;
        currency?: string;
        date: string;
        notes?: string;
        receiptUrl?: string;
    }) => api.post('/expenses', data).then(r => r.data),

    update: (id: string, data: Partial<Expense>) =>
        api.patch(`/expenses/${id}`, data).then(r => r.data),

    approve: (id: string) =>
        api.patch(`/expenses/${id}/approve`).then(r => r.data),

    remove: (id: string) => api.delete(`/expenses/${id}`).then(r => r.data),
};
