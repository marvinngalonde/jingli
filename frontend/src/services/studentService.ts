import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type Student = Database['public']['Tables']['students']['Row'];
type StudentInsert = Database['public']['Tables']['students']['Insert'];
type StudentUpdate = Database['public']['Tables']['students']['Update'];

export const studentService = {
    // Get all students
    async getAll() {
        const { data, error } = await supabase
            .from('students')
            .select(`
                *,
                class:classes(*),
                parent:profiles(*)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Get student by ID
    async getById(id: string) {
        const { data, error } = await supabase
            .from('students')
            .select(`
                *,
                class:classes(*),
                parent:profiles(*)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    // Get students by class
    async getByClass(classId: string) {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('class_id', classId)
            .order('last_name');

        if (error) throw error;
        return data;
    },

    // Create new student
    async create(student: StudentInsert) {
        const { data, error } = await supabase
            .from('students')
            .insert(student)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update student
    async update(id: string, updates: StudentUpdate) {
        const { data, error } = await supabase
            .from('students')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Delete student
    async delete(id: string) {
        const { error } = await supabase
            .from('students')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // Search students
    async search(query: string) {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,student_id.ilike.%${query}%`);

        if (error) throw error;
        return data;
    },
};
