import { api } from './api';

export interface FeeHead {
    id: string;
    schoolId: string;
    name: string;
    type?: string;
}

export interface FeeStructureItem {
    id: string;
    feeStructureId: string;
    feeHeadId: string;
    amount: number;
    head?: FeeHead;
}

export interface FeeStructure {
    id: string;
    schoolId: string;
    academicYearId: string;
    classLevelId: string;
    feeHeadId?: string;
    name: string;
    amount: number;
    frequency: 'MONTHLY' | 'TERM' | 'ANNUAL' | 'ONE_TIME';
    items?: FeeStructureItem[];
    academicYear?: any;
    classLevel?: any;
    feeHead?: FeeHead;
}

export interface Invoice {
    id: string;
    schoolId: string;
    studentId: string;
    feeStructureId?: string;
    amount: number;
    paidAmount: number;
    status: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';
    issueDate: string;
    dueDate: string;
    student?: any;
    feeStructure?: FeeStructure;
    transactions?: Transaction[];
}

export interface Transaction {
    id: string;
    invoiceId: string;
    amount: number;
    method: 'CASH' | 'CARD' | 'ONLINE' | 'CHEQUE';
    date: string;
    referenceNo?: string;
    collectedBy: string;
}

export const financeService = {
    // --- Fee Heads ---
    getFeeHeads: async (schoolId: string) => {
        const response = await api.get<FeeHead[]>('/fee-structures/heads', { params: { schoolId } });
        return response.data;
    },

    createFeeHead: async (data: Partial<FeeHead>) => {
        const response = await api.post<FeeHead>('/fee-structures/heads', data);
        return response.data;
    },

    // --- Fee Structures ---
    getFeeStructures: async (schoolId: string) => {
        const response = await api.get<FeeStructure[]>('/fee-structures', { params: { schoolId } });
        return response.data;
    },

    createFeeStructure: async (data: any) => {
        const response = await api.post<FeeStructure>('/fee-structures', data);
        return response.data;
    },

    // --- Invoices ---
    getInvoices: async (schoolId: string, filters?: { studentId?: string, status?: string }) => {
        const response = await api.get<Invoice[]>('/invoices', { params: { schoolId, ...filters } });
        return response.data;
    },

    getInvoice: async (id: string) => {
        const response = await api.get<Invoice>(`/invoices/${id}`);
        return response.data;
    },

    createInvoice: async (data: any) => {
        const response = await api.post<Invoice>('/invoices', data);
        return response.data;
    },

    // --- Transactions ---
    recordPayment: async (data: { invoiceId: string, amount: number, method: string, referenceNo?: string }) => {
        const response = await api.post<Transaction>('/invoices/pay', data);
        return response.data;
    },
};
