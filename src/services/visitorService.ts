import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type VisitorLog = Database['public']['Tables']['visitor_logs']['Row'];
type VisitorLogInsert = Database['public']['Tables']['visitor_logs']['Insert'];

export const visitorService = {
    // Get all visitor logs
    async getAll() {
        const { data, error } = await supabase
            .from('visitor_logs')
            .select('*')
            .order('check_in_time', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Get active visitors (not checked out)
    async getActiveVisitors() {
        const { data, error } = await supabase
            .from('visitor_logs')
            .select('*')
            .is('check_out_time', null)
            .order('check_in_time', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Check in visitor
    async checkIn(visitor: VisitorLogInsert) {
        const { data, error } = await supabase
            .from('visitor_logs')
            .insert(visitor)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Check out visitor
    async checkOut(id: string) {
        const { data, error } = await supabase
            .from('visitor_logs')
            .update({ check_out_time: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Search visitors
    async search(query: string) {
        const { data, error } = await supabase
            .from('visitor_logs')
            .select('*')
            .or(`visitor_name.ilike.%${query}%,person_to_meet.ilike.%${query}%,contact_number.ilike.%${query}%`);

        if (error) throw error;
        return data;
    },
};
