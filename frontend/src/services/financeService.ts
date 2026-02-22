import { api } from './api';
import type { CreateFeeHeadDto, CreateFeeStructureDto, FeeHead, FeeStructure, Invoice } from '../types/finance';

export const financeService = {
    // --- Dashboard Stub ---
    getAll: async (): Promise<any[]> => {
        // Dashboard stub for aggregating all financials
        return [];
    },

    // --- Fee Heads ---
    getFeeHeads: async (): Promise<FeeHead[]> => {
        const response = await api.get('/fee-heads');
        return response.data;
    },

    createFeeHead: async (data: CreateFeeHeadDto): Promise<FeeHead> => {
        const response = await api.post('/fee-heads', data);
        return response.data;
    },

    deleteFeeHead: async (id: string): Promise<void> => {
        await api.delete(`/fee-heads/${id}`);
    },

    // --- Fee Structures ---
    getFeeStructures: async (academicYearId?: string, classLevelId?: string): Promise<FeeStructure[]> => {
        const params: any = {};
        if (academicYearId) params.academicYearId = academicYearId;
        if (classLevelId) params.classLevelId = classLevelId;

        const response = await api.get('/fee-structures', { params });
        return response.data;
    },

    getFeeStructure: async (id: string): Promise<FeeStructure> => {
        const response = await api.get(`/fee-structures/${id}`);
        return response.data;
    },

    createFeeStructure: async (data: CreateFeeStructureDto): Promise<FeeStructure> => {
        const response = await api.post('/fee-structures', data);
        return response.data;
    },

    updateFeeStructure: async (id: string, data: Partial<CreateFeeStructureDto>): Promise<FeeStructure> => {
        const response = await api.patch(`/fee-structures/${id}`, data);
        return response.data;
    },

    deleteFeeStructure: async (id: string): Promise<void> => {
        await api.delete(`/fee-structures/${id}`);
    },

    // --- Invoices ---
    getInvoices: async (_schoolId: string, studentId?: string): Promise<Invoice[]> => {
        const params: any = {};
        if (studentId) params.studentId = studentId;
        const response = await api.get('/invoices', { params });
        return response.data;
    },

    generateBulkInvoices: async (data: { classLevelId: string; feeStructureId: string; dueDate: Date }) => {
        const response = await api.post('/invoices/bulk', data);
        return response.data;
    },

    updateInvoice: async (id: string, data: any) => {
        const response = await api.patch(`/invoices/${id}`, data);
        return response.data;
    },

    deleteInvoice: async (id: string) => {
        await api.delete(`/invoices/${id}`);
    },

    // --- Transactions ---
    collectPayment: async (data: { invoiceId: string; amount: number; method: string; referenceNo?: string }) => {
        const response = await api.post('/invoices/collect', data);
        return response.data;
    }
};
