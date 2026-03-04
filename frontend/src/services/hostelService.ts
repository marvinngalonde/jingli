import { api } from './api';
import type { Student } from '../types/students';

export interface Hostel {
    id: string;
    name: string;
    gender: 'BOYS' | 'GIRLS' | 'MIXED';
    capacity: number;
    warden?: string;
    rooms?: Room[];
    schoolId: string;
}

export interface Room {
    id: string;
    number: string;
    name?: string; // backwards compat
    capacity: number;
    hostelId: string;
    hostel?: Hostel;
    beds?: BedAllocation[];
    schoolId: string;
}

export interface BedAllocation {
    id: string;
    roomId: string;
    studentId: string;
    bedNumber: string;
    status: 'OCCUPIED' | 'VACANT' | 'MAINTENANCE';
    student?: Student;
    room?: Room;
    schoolId: string;
}

export interface Exeat {
    id: string;
    studentId: string;
    reason: string;
    departDate: string;
    returnDate: string;
    actualReturn?: string;
    status: 'PENDING' | 'APPROVED' | 'RETURNED';
    approvedBy?: string;
    guardianName?: string;
    student?: Student;
    schoolId: string;
}

export interface HostelStats {
    hostels: number;
    rooms: number;
    occupiedBeds: number;
    pendingExeats: number;
}

export const hostelService = {
    // Stats
    getStats: () => api.get<HostelStats>('/hostel/stats').then(res => res.data),

    // Hostels
    getAllHostels: () => api.get<Hostel[]>('/hostel/hostels').then(res => res.data),
    createHostel: (data: Partial<Hostel>) => api.post<Hostel>('/hostel/hostels', data).then(res => res.data),
    updateHostel: (id: string, data: Partial<Hostel>) => api.patch<Hostel>(`/hostel/hostels/${id}`, data).then(res => res.data),
    deleteHostel: (id: string) => api.delete(`/hostel/hostels/${id}`).then(res => res.data),

    // Rooms
    getAllRooms: (hostelId?: string) => {
        const query = hostelId ? `?hostelId=${hostelId}` : '';
        return api.get<Room[]>(`/hostel/rooms${query}`).then(res => res.data);
    },
    createRoom: (data: Partial<Room>) => api.post<Room>('/hostel/rooms', data).then(res => res.data),
    deleteRoom: (id: string) => api.delete(`/hostel/rooms/${id}`).then(res => res.data),

    // Beds
    allocateBed: (data: Partial<BedAllocation>) => api.post<BedAllocation>('/hostel/beds/allocate', data).then(res => res.data),
    deallocateBed: (id: string) => api.delete(`/hostel/beds/${id}`).then(res => res.data),

    // Exeats
    getAllExeats: (status?: string) => {
        const query = status ? `?status=${status}` : '';
        return api.get<Exeat[]>(`/hostel/exeats${query}`).then(res => res.data);
    },
    createExeat: (data: Partial<Exeat>) => api.post<Exeat>('/hostel/exeats', data).then(res => res.data),
    approveExeat: (id: string) => api.patch(`/hostel/exeats/${id}/approve`).then(res => res.data),
    markReturned: (id: string) => api.patch(`/hostel/exeats/${id}/return`).then(res => res.data),
};
