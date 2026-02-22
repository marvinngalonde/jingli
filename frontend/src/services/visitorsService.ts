import { api } from './api';

export const VisitorStatus = {
    IN: 'IN',
    OUT: 'OUT'
} as const;

export type VisitorStatus = typeof VisitorStatus[keyof typeof VisitorStatus];

export interface Visitor {
    id: string;
    schoolId: string;
    name: string;
    phone: string;
    purpose: string;
    personToMeet?: string;
    checkIn: string;
    checkOut?: string;
    idProof?: string;
    vehicleNo?: string;
    status: VisitorStatus;
}

export interface CreateVisitorDto {
    name: string;
    phone: string;
    purpose?: string;
    personToMeet?: string;
    idProof?: string;
    vehicleNo?: string;
}

export const visitorsService = {
    getAll: async (status?: VisitorStatus): Promise<Visitor[]> => {
        const response = await api.get('/visitors', {
            params: { status }
        });
        return response.data;
    },

    getOne: async (id: string): Promise<Visitor> => {
        const response = await api.get(`/visitors/${id}`);
        return response.data;
    },

    create: async (dto: CreateVisitorDto): Promise<Visitor> => {
        const response = await api.post('/visitors', dto);
        return response.data;
    },

    checkout: async (id: string): Promise<Visitor> => {
        const response = await api.patch(`/visitors/${id}/checkout`);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/visitors/${id}`);
    }
};
