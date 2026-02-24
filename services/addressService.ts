
import { supabase } from '@/lib/supabase';
import type { Address } from '@/types';

export async function fetchAddresses(): Promise<Address[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false }) // Default first
        .order('created_at', { ascending: true });

    if (error) throw error;
    if (error) throw error;
    return (data as Address[]) ?? [];
}

export async function fetchAddress(id: string): Promise<Address | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

    if (error) return null;
    return data as Address;
}

export async function addAddress(address: Omit<Address, 'id' | 'user_id' | 'created_at'>): Promise<Address> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('addresses')
        .insert({ ...address, user_id: user.id })
        .select('*')
        .single();

    if (error) throw error;
    return data as Address;
}

export async function updateAddress(id: string, updates: Partial<Address>): Promise<Address> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('addresses')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select('*')
        .single();

    if (error) throw error;
    return data as Address;
}

export async function deleteAddress(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) throw error;
}
