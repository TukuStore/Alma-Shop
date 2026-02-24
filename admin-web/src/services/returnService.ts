import { supabase } from '../lib/supabase';
import type { ReturnRequest } from '../types';

export async function getReturns(filters?: {
    status?: ReturnRequest['status'] | 'all';
    page?: number;
    limit?: number;
}): Promise<{ data: ReturnRequest[]; count: number }> {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const from = (page - 1) * limit;

    let query = supabase
        .from('returns')
        .select(`
      *,
      profile:profiles(full_name),
      order:orders(id, total_amount, status)
    `, { count: 'exact' });

    if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
    }

    query = query.order('created_at', { ascending: false }).range(from, from + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: (data as ReturnRequest[]) ?? [], count: count ?? 0 };
}

export async function updateReturnStatus(
    id: string,
    status: ReturnRequest['status']
): Promise<void> {
    const { error } = await supabase
        .from('returns')
        .update({ status })
        .eq('id', id);
    if (error) throw error;
}
