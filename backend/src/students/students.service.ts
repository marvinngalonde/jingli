import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class StudentsService {
    constructor(private readonly supabaseService: SupabaseService) { }

    private get supabase() {
        return this.supabaseService.getClient();
    }

    async create(createDto: any) {
        const { data, error } = await this.supabase
            .from('students')
            .insert(createDto)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    async findAll(schoolId: string) {
        const { data, error } = await this.supabase
            .from('students')
            .select('*, class:classes(name)')
            .eq('school_id', schoolId)
            .order('last_name', { ascending: true });

        if (error) throw new Error(error.message);
        return data;
    }

    async findOne(id: string) {
        const { data, error } = await this.supabase
            .from('students')
            .select('*, class:classes(name), parent:profiles(full_name, email, phone)')
            .eq('id', id)
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    async update(id: string, updateDto: any) {
        const { data, error } = await this.supabase
            .from('students')
            .update(updateDto)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    async remove(id: string) {
        const { error } = await this.supabase
            .from('students')
            .delete()
            .eq('id', id);

        if (error) throw new Error(error.message);
        return { deleted: true };
    }
}
