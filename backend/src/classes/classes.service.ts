import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ClassesService {
    constructor(private readonly supabaseService: SupabaseService) { }

    private get supabase() {
        return this.supabaseService.getClient();
    }

    async create(createDto: any) {
        const { data, error } = await this.supabase
            .from('classes')
            .insert(createDto)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    async findAll(schoolId: string) {
        const { data, error } = await this.supabase
            .from('classes')
            .select('*, teacher:profiles(full_name)')
            .eq('school_id', schoolId)
            .order('level', { ascending: true });

        if (error) throw new Error(error.message);
        return data;
    }

    async findOne(id: string) {
        const { data, error } = await this.supabase
            .from('classes')
            .select('*, teacher:profiles(full_name)')
            .eq('id', id)
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    async update(id: string, updateDto: any) {
        const { data, error } = await this.supabase
            .from('classes')
            .update(updateDto)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    async remove(id: string) {
        const { error } = await this.supabase
            .from('classes')
            .delete()
            .eq('id', id);

        if (error) throw new Error(error.message);
        return { deleted: true };
    }
}
