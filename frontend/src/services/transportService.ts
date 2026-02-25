import { api } from './api';

export interface Vehicle {
    id: string;
    regNumber: string;
    make?: string;
    model?: string;
    year?: number;
    capacity: number;
    status: string;
    insuranceExpiry?: string;
    nextServiceDate?: string;
    routes?: { id: string; name: string }[];
}

export interface TransportRoute {
    id: string;
    name: string;
    description?: string;
    vehicleId?: string;
    driverName?: string;
    startTime?: string;
    endTime?: string;
    stops?: string[];
    status: string;
    vehicle?: { regNumber: string; make?: string; capacity?: number };
    students?: {
        id: string;
        pickupPoint?: string;
        direction: string;
        student: { id: string; firstName: string; lastName: string; admissionNo: string };
    }[];
}

export interface TransportStats {
    totalVehicles: number;
    totalRoutes: number;
    activeRoutes: number;
    studentsOnRoutes: number;
}

export const transportService = {
    // Stats
    getStats: () => api.get('/transport/stats').then(r => r.data as TransportStats),

    // Vehicles
    getVehicles: () => api.get('/transport/vehicles').then(r => r.data as Vehicle[]),
    createVehicle: (data: Partial<Vehicle>) => api.post('/transport/vehicles', data).then(r => r.data),
    deleteVehicle: (id: string) => api.delete(`/transport/vehicles/${id}`).then(r => r.data),

    // Routes
    getAll: () => api.get('/transport/routes').then(r => r.data as TransportRoute[]),
    getById: (id: string) => api.get(`/transport/routes/${id}`).then(r => r.data as TransportRoute),
    create: (data: Partial<TransportRoute>) => api.post('/transport/routes', data).then(r => r.data),
    update: (id: string, data: Partial<TransportRoute>) => api.patch(`/transport/routes/${id}`, data).then(r => r.data),
    delete: (id: string) => api.delete(`/transport/routes/${id}`).then(r => r.data),

    // Student Assignments
    assignStudent: (data: { studentId: string; routeId: string; pickupPoint?: string; direction?: string }) =>
        api.post('/transport/student-routes', data).then(r => r.data),
    unassignStudent: (id: string) => api.delete(`/transport/student-routes/${id}`).then(r => r.data),
};
