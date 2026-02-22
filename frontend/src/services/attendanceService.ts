import { api } from './api';
import type { AttendanceRecord, AttendanceStatus, CreateAttendanceDto } from '../types/attendance';

export const attendanceService = {
    // --- Dashboard Stub ---
    getByDate: async (_dateString: string): Promise<AttendanceRecord[]> => {
        // Stub for aggregating date-based attendance
        return [];
    },

    // Get daily attendance for a class section
    getClassAttendance: async (sectionId: string, date: Date): Promise<AttendanceRecord[]> => {
        const response = await api.get('/attendance', {
            params: {
                classId: sectionId,
                date: date.toISOString().split('T')[0] // Format YYYY-MM-DD
            }
        });
        return response.data;
    },

    // Get attendance for a date range
    getAttendanceReport: async (sectionId: string, startDate: Date, endDate: Date): Promise<AttendanceRecord[]> => {
        const response = await api.get('/attendance', {
            params: {
                classId: sectionId,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            }
        });
        return response.data;
    },

    // Get attendance history for a specific student
    getStudentAttendance: async (studentId: string): Promise<AttendanceRecord[]> => {
        const response = await api.get('/attendance', {
            params: { studentId }
        });
        return response.data;
    },

    // Mark single attendance
    create: async (data: CreateAttendanceDto) => {
        const response = await api.post('/attendance', data);
        return response.data;
    },

    // Bulk mark attendance for a class
    bulkCreate: async (data: { records: CreateAttendanceDto[] }) => {
        const response = await api.post('/attendance/bulk', data.records);
        return response.data;
    },

    // Update attendance record
    update: async (id: string, status: AttendanceStatus, remarks?: string) => {
        const response = await api.patch(`/attendance/${id}`, { status, remarks });
        return response.data;
    }
};
