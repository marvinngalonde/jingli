import { api } from './api';

export interface SalaryPayment {
    id: string;
    staffId: string;
    amount: number;
    currency: string;
    month: number;
    year: number;
    status: string;
    method?: string;
    referenceNo?: string;
    processedBy?: string;
    processedAt?: string;
    notes?: string;
    createdAt: string;
    staff: {
        id: string;
        firstName: string;
        lastName: string;
        employeeId: string;
        designation: string;
        department: string;
    };
    processor?: { id: string; username: string };
}

export interface PayrollStats {
    totalPayroll: number;
    thisMonth: number;
    pendingDisbursal: number;
    staffCount: number;
}

export const salaryService = {
    getAll: (month?: number, year?: number) => {
        const params = new URLSearchParams();
        if (month) params.append('month', String(month));
        if (year) params.append('year', String(year));
        return api.get(`/salaries?${params}`).then(r => r.data as SalaryPayment[]);
    },

    getStats: () => api.get('/salaries/stats').then(r => r.data as PayrollStats),

    create: (data: {
        staffId: string;
        amount: number;
        currency?: string;
        month: number;
        year: number;
        method?: string;
        notes?: string;
    }) => api.post('/salaries', data).then(r => r.data),

    runPayroll: (data: { month: number; year: number; currency?: string }) =>
        api.post('/salaries/run-payroll', data).then(r => r.data),

    update: (id: string, data: Partial<SalaryPayment>) =>
        api.patch(`/salaries/${id}`, data).then(r => r.data),

    markAsPaid: (id: string, referenceNo?: string) =>
        api.patch(`/salaries/${id}/pay`, { referenceNo }).then(r => r.data),

    remove: (id: string) => api.delete(`/salaries/${id}`).then(r => r.data),
};
