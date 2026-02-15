import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type Book = Database['public']['Tables']['library_books']['Row'];
type BookInsert = Database['public']['Tables']['library_books']['Insert'];
type BookUpdate = Database['public']['Tables']['library_books']['Update'];

export const libraryService = {
    // Get all books
    async getAll() {
        const { data, error } = await supabase
            .from('library_books')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Get book by ID
    async getById(id: string) {
        const { data, error } = await supabase
            .from('library_books')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    // Search books
    async search(query: string) {
        const { data, error } = await supabase
            .from('library_books')
            .select('*')
            .or(`title.ilike.%${query}%,author.ilike.%${query}%,isbn.ilike.%${query}%,accession_number.ilike.%${query}%`);

        if (error) throw error;
        return data;
    },

    // Get books by category
    async getByCategory(category: string) {
        const { data, error } = await supabase
            .from('library_books')
            .select('*')
            .eq('category', category);

        if (error) throw error;
        return data;
    },

    // Create book
    async create(book: BookInsert) {
        const { data, error } = await supabase
            .from('library_books')
            .insert(book)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update book
    async update(id: string, updates: BookUpdate) {
        const { data, error } = await supabase
            .from('library_books')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Delete book
    async delete(id: string) {
        const { error } = await supabase
            .from('library_books')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // Get available books count
    async getAvailableCount() {
        const { count, error } = await supabase
            .from('library_books')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'available');

        if (error) throw error;
        return count || 0;
    },
};
