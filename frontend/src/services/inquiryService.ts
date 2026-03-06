import { api } from './api';

export interface Inquiry {
    id: string;
    schoolId: string;
    applicantName: string;
    parentName: string;
    email: string;
    phone: string;
    targetClass: string;
    status: string;
    notes?: string;
    assignedTo?: string;
}

export interface CreateInquiryDto {
    applicantName: string;
    parentName: string;
    email: string;
    phone: string;
    targetClass: string;
    status?: string;
    notes?: string;
}

export const inquiryService = {
    getAll: async (): Promise<Inquiry[]> => {
        const response = await api.get<Inquiry[]>('/inquiries');
        return response.data;
    },

    getOne: async (id: string): Promise<Inquiry> => {
        const response = await api.get<Inquiry>(`/inquiries/${id}`);
        return response.data;
    },

    create: async (data: CreateInquiryDto): Promise<Inquiry> => {
        const response = await api.post<Inquiry>('/inquiries', data);
        return response.data;
    },

    update: async (id: string, data: Partial<CreateInquiryDto>): Promise<Inquiry> => {
        const response = await api.patch<Inquiry>(`/inquiries/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/inquiries/${id}`);
    }
};
