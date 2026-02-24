import { supabase } from '../lib/supabase';
import type { UserProfile } from '../types';

export async function getUsers(filters?: {
    search?: string;
    role?: 'admin' | 'customer';
    page?: number;
    limit?: number;
}): Promise<{ data: UserProfile[]; count: number }> {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const from = (page - 1) * limit;

    let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' });

    if (filters?.role) query = query.eq('role', filters.role);
    if (filters?.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,username.ilike.%${filters.search}%`);
    }

    query = query.order('created_at', { ascending: false }).range(from, from + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: (data as UserProfile[]) ?? [], count: count ?? 0 };
}

export async function getUserById(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
    if (error) throw error;
    return data as UserProfile | null;
}

export async function getUserWalletBalance(userId: string): Promise<number> {
    const { data } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', userId)
        .single();
    return data?.balance ?? 0;
}

export async function getUserOrderCount(userId: string): Promise<number> {
    const { count } = await supabase
        .from('orders')
        .select('id', { count: 'exact' })
        .eq('user_id', userId);
    return count ?? 0;
}

export async function updateUserRole(
    userId: string,
    role: 'admin' | 'customer'
): Promise<void> {
    const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('user_id', userId);
    if (error) throw error;
}
