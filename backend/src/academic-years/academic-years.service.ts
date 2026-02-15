import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AcademicYearsService {
    constructor(private readonly supabaseService: SupabaseService) { }

    private get supabase() {
        return this.supabaseService.getClient();
    }

    async create(createDto: any) {
        const { data, error } = await this.supabase
            .from('academic_years')
            .insert(createDto)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    async findAll(schoolId: string) {
        const { data, error } = await this.supabase
            .from('academic_years')
            .select('*')
            .eq('school_id', schoolId)
            .order('start_date', { ascending: false });

        if (error) throw new Error(error.message);
        return data;
    }

    async findOne(id: string) {
        const { data, error } = await this.supabase
            .from('academic_years')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    async update(id: string, updateDto: any) {
        const { data, error } = await this.supabase
            .from('academic_years')
            .update(updateDto)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    async remove(id: string) {
        const { error } = await this.supabase
            .from('academic_years')
            .delete()
            .eq('id', id);

        if (error) throw new Error(error.message);
        return { deleted: true };
    }
}
