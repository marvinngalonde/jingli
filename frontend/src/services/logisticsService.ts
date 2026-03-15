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

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
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
    getGatePasses: async (params: { page?: number; limit?: number } = {}): Promise<PaginatedResponse<GatePass>> => {
        const response = await api.get('/logistics/gate-pass', { params });
        return response.data;
    },

    issueGatePass: async (dto: CreateGatePassDto): Promise<GatePass> => {
        const response = await api.post('/logistics/gate-pass', dto);
        return response.data;
    },

    // --- Late Arrivals ---
    getLateArrivals: async (params: { page?: number; limit?: number } = {}): Promise<PaginatedResponse<LateArrival>> => {
        const response = await api.get('/logistics/late-arrival', { params });
        return response.data;
    },

    logLateArrival: async (dto: CreateLateArrivalDto): Promise<LateArrival> => {
        const response = await api.post('/logistics/late-arrival', dto);
        return response.data;
    },

    // --- Student Gate History (New Endpoints) ---
    getAllStudentLateEntries: async (params: { page?: number; limit?: number } = {}): Promise<PaginatedResponse<LateArrival>> => {
        const response = await api.get('/gate/students/late/all', { params });
        return response.data;
    },

    getStudentLateHistory: async (studentId: string, params: { page?: number; limit?: number } = {}): Promise<PaginatedResponse<LateArrival>> => {
        const response = await api.get(`/gate/students/${studentId}/late`, { params });
        return response.data;
    }
};
