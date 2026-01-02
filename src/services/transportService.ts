import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type Route = Database['public']['Tables']['transport_routes']['Row'];
type RouteInsert = Database['public']['Tables']['transport_routes']['Insert'];
type RouteUpdate = Database['public']['Tables']['transport_routes']['Update'];

export const transportService = {
    // Get all routes
    async getAll() {
        const { data, error } = await supabase
            .from('transport_routes')
            .select(`
                *,
                driver:staff(*)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Get route by ID
    async getById(id: string) {
        const { data, error } = await supabase
            .from('transport_routes')
            .select(`
                *,
                driver:staff(*)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    // Get active routes
    async getActiveRoutes() {
        const { data, error } = await supabase
            .from('transport_routes')
            .select('*')
            .eq('status', 'active')
            .order('route_id');

        if (error) throw error;
        return data;
    },

    // Create route
    async create(route: RouteInsert) {
        const { data, error } = await supabase
            .from('transport_routes')
            .insert(route)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update route
    async update(id: string, updates: RouteUpdate) {
        const { data, error } = await supabase
            .from('transport_routes')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Delete route
    async delete(id: string) {
        const { error } = await supabase
            .from('transport_routes')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },
};
