import { supabase } from '../lib/supabase';
import type { Database } from '../types/database.types';

type Transaction = Database['public']['Tables']['finance_transactions']['Row'];
type TransactionInsert = Database['public']['Tables']['finance_transactions']['Insert'];

export const financeService = {
    // Get all transactions
    async getAll() {
        const { data, error } = await supabase
            .from('finance_transactions')
            .select(`
                *,
                student:students(*),
                created_by_staff:staff(*)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Get transactions by student
    async getByStudent(studentId: string) {
        const { data, error } = await supabase
            .from('finance_transactions')
            .select('*')
            .eq('student_id', studentId)
            .order('payment_date', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Create transaction
    async create(transaction: TransactionInsert) {
        const { data, error } = await supabase
            .from('finance_transactions')
            .insert(transaction)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Get outstanding balance for student
    async getOutstandingBalance(studentId: string) {
        const { data, error } = await supabase
            .from('finance_transactions')
            .select('amount, transaction_type')
            .eq('student_id', studentId)
            .eq('status', 'completed');

        if (error) throw error;

        const balance = data.reduce((acc, transaction) => {
            if (transaction.transaction_type === 'fee_payment') {
                return acc - transaction.amount;
            } else if (transaction.transaction_type === 'fine') {
                return acc + transaction.amount;
            } else if (transaction.transaction_type === 'refund') {
                return acc - transaction.amount;
            }
            return acc;
        }, 0);

        return balance;
    },

    // Get financial summary
    async getSummary(startDate?: string, endDate?: string) {
        let query = supabase
            .from('finance_transactions')
            .select('amount, transaction_type, status');

        if (startDate) query = query.gte('payment_date', startDate);
        if (endDate) query = query.lte('payment_date', endDate);

        const { data, error } = await query;
        if (error) throw error;

        const summary = {
            totalCollected: data
                .filter(t => t.status === 'completed' && t.transaction_type === 'fee_payment')
                .reduce((sum, t) => sum + t.amount, 0),
            totalPending: data
                .filter(t => t.status === 'pending')
                .reduce((sum, t) => sum + t.amount, 0),
            totalFines: data
                .filter(t => t.status === 'completed' && t.transaction_type === 'fine')
                .reduce((sum, t) => sum + t.amount, 0),
        };

        return summary;
    },
};
