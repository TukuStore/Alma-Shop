import { supabase } from '../lib/supabase';
import type { Review } from '../types';

export async function getAllReviews(filters?: {
    rating?: number;
    page?: number;
    limit?: number;
}): Promise<{ data: Review[]; count: number }> {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const from = (page - 1) * limit;

    let query = supabase
        .from('reviews')
        .select(`
      *,
      profile:profiles(full_name, avatar_url),
      product:products(id, name, images)
    `, { count: 'exact' });

    if (filters?.rating) query = query.eq('rating', filters.rating);

    query = query.order('created_at', { ascending: false }).range(from, from + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: (data as Review[]) ?? [], count: count ?? 0 };
}

export async function deleteReview(id: string): Promise<void> {
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) throw error;
}
