import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type Facility = Database['public']['Tables']['facilities']['Row'];
type FacilityInsert = Database['public']['Tables']['facilities']['Insert'];
type FacilityUpdate = Database['public']['Tables']['facilities']['Update'];

export const facilitiesService = {
    // Get all facilities
    async getAll() {
        const { data, error } = await supabase
            .from('facilities')
            .select('*')
            .order('name');

        if (error) throw error;
        return data;
    },

    // Get facility by ID
    async getById(id: string) {
        const { data, error } = await supabase
            .from('facilities')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    // Get facilities by type
    async getByType(type: string) {
        const { data, error } = await supabase
            .from('facilities')
            .select('*')
            .eq('type', type)
            .order('name');

        if (error) throw error;
        return data;
    },

    // Get available facilities
    async getAvailable() {
        const { data, error } = await supabase
            .from('facilities')
            .select('*')
            .eq('status', 'available')
            .order('name');

        if (error) throw error;
        return data;
    },

    // Create facility
    async create(facility: FacilityInsert) {
        const { data, error } = await supabase
            .from('facilities')
            .insert(facility)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update facility
    async update(id: string, updates: FacilityUpdate) {
        const { data, error } = await supabase
            .from('facilities')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Delete facility
    async delete(id: string) {
        const { error } = await supabase
            .from('facilities')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },
};
