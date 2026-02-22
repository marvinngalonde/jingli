import { api } from './api';

export interface GatePass {
    id: string;
    studentId: string;
    reason: string;
    issuedAt: string;
    issuedBy: string;
    guardianName: string;
    student: {
        firstName: string;
        lastName: string;
        admissionNo: string;
    };
    issuer: {
        email: string;
    };
}

export interface LateArrival {
    id: string;
    studentId: string;
    arrivalTime: string;
    reason: string;
    reportedBy: string;
    recordedBy: string;
    student: {
        firstName: string;
        lastName: string;
        admissionNo: string;
    };
    recorder: {
        email: string;
    };
}

export interface CreateGatePassDto {
    studentId: string;
    reason: string;
    guardianName: string;
}

export interface CreateLateArrivalDto {
    studentId: string;
    reason: string;
    reportedBy: string;
}

export const logisticsService = {
    // --- Gate Passes ---
    getGatePasses: async (): Promise<GatePass[]> => {
        const response = await api.get('/logistics/gate-pass');
        return response.data;
    },

    issueGatePass: async (dto: CreateGatePassDto): Promise<GatePass> => {
        const response = await api.post('/logistics/gate-pass', dto);
        return response.data;
    },

    // --- Late Arrivals ---
    getLateArrivals: async (): Promise<LateArrival[]> => {
        const response = await api.get('/logistics/late-arrival');
        return response.data;
    },

    logLateArrival: async (dto: CreateLateArrivalDto): Promise<LateArrival> => {
        const response = await api.post('/logistics/late-arrival', dto);
        return response.data;
    }
};
