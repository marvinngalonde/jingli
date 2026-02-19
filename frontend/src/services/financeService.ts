import { api } from './api';
import type { CreateFeeHeadDto, CreateFeeStructureDto, FeeHead, FeeStructure, Invoice } from '../types/finance';

export const financeService = {
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
    getInvoices: async (schoolId: string, studentId?: string): Promise<Invoice[]> => {
        const params: any = {};
        if (studentId) params.studentId = studentId;
        const response = await api.get('/invoices', { params });
        return response.data;
    },

    generateBulkInvoices: async (data: { classLevelId: string; feeStructureId: string; dueDate: Date }) => {
        const response = await api.post('/invoices/bulk', data);
        return response.data;
    }
};
