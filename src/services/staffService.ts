import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type Staff = Database['public']['Tables']['staff']['Row'];
type StaffInsert = Database['public']['Tables']['staff']['Insert'];
type StaffUpdate = Database['public']['Tables']['staff']['Update'];

export const staffService = {
    // Get all staff
    async getAll() {
        const { data, error } = await supabase
            .from('staff')
            .select(`
                *,
                profile:profiles(*)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Get staff by ID
    async getById(id: string) {
        const { data, error } = await supabase
            .from('staff')
            .select(`
                *,
                profile:profiles(*)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    // Get staff by role
    async getByRole(role: string) {
        const { data, error } = await supabase
            .from('staff')
            .select('*')
            .eq('role', role)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Create staff
    async create(staff: StaffInsert) {
        const { data, error } = await supabase
            .from('staff')
            .insert(staff)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update staff
    async update(id: string, updates: StaffUpdate) {
        const { data, error } = await supabase
            .from('staff')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Delete staff
    async delete(id: string) {
        const { error } = await supabase
            .from('staff')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // Search staff
    async search(query: string) {
        const { data, error } = await supabase
            .from('staff')
            .select(`
                *,
                profile:profiles(*)
            `)
            .or(`employee_id.ilike.%${query}%,department.ilike.%${query}%`);

        if (error) throw error;
        return data;
    },
};
