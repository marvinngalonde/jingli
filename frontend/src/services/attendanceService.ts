import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type Attendance = Database['public']['Tables']['attendance']['Row'];
type AttendanceInsert = Database['public']['Tables']['attendance']['Insert'];

export const attendanceService = {
    // Get attendance for a specific date
    async getByDate(date: string) {
        const { data, error } = await supabase
            .from('attendance')
            .select(`
                *,
                student:students(*)
            `)
            .eq('date', date)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Get attendance for a student
    async getByStudent(studentId: string, startDate?: string, endDate?: string) {
        let query = supabase
            .from('attendance')
            .select('*')
            .eq('student_id', studentId)
            .order('date', { ascending: false });

        if (startDate) query = query.gte('date', startDate);
        if (endDate) query = query.lte('date', endDate);

        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    // Mark attendance
    async markAttendance(attendance: AttendanceInsert) {
        const { data, error } = await supabase
            .from('attendance')
            .upsert(attendance, { onConflict: 'student_id,date' })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Bulk mark attendance
    async bulkMarkAttendance(attendanceRecords: AttendanceInsert[]) {
        const { data, error } = await supabase
            .from('attendance')
            .upsert(attendanceRecords, { onConflict: 'student_id,date' })
            .select();

        if (error) throw error;
        return data;
    },

    // Get attendance statistics
    async getStatistics(classId?: string, startDate?: string, endDate?: string) {
        let query = supabase
            .from('attendance')
            .select('status, student:students(class_id)');

        if (startDate) query = query.gte('date', startDate);
        if (endDate) query = query.lte('date', endDate);

        const { data, error } = await query;
        if (error) throw error;

        // Calculate statistics
        const stats = {
            total: data.length,
            present: data.filter(a => a.status === 'present').length,
            absent: data.filter(a => a.status === 'absent').length,
            late: data.filter(a => a.status === 'late').length,
            excused: data.filter(a => a.status === 'excused').length,
        };

        return stats;
    },
};
