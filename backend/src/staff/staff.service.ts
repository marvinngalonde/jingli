import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class StaffService {
    constructor(private readonly supabaseService: SupabaseService) { }

    private get supabase() {
        return this.supabaseService.getClient();
    }

    async create(createDto: any) {
        // Note: Creating staff usually involves creating a Profile + Auth User.
        // For now, we assume the Profile exists or this is just metadata updates.
        // Use Edge Functions for complex Auth + DB transactions.
        const { data, error } = await this.supabase
            .from('profiles')
            .insert(createDto)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    async findAll(schoolId: string) {
        const { data, error } = await this.supabase
            .from('profiles')
            .select('*')
            .eq('school_id', schoolId)
            .in('role', ['teacher', 'admin', 'staff'])
            .order('full_name', { ascending: true });

        if (error) throw new Error(error.message);
        return data;
    }

    async findOne(id: string) {
        const { data, error } = await this.supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    async update(id: string, updateDto: any) {
        const { data, error } = await this.supabase
            .from('profiles')
            .update(updateDto)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    async remove(id: string) {
        // Soft delete or status update is preferred for users
        const { error } = await this.supabase
            .from('profiles')
            .update({ status: 'inactive' }) // Assuming status field exists, else delete
            .eq('id', id);

        if (error) throw new Error(error.message);
        return { deleted: true };
    }
}
