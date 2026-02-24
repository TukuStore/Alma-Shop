import { supabase } from '../lib/supabase';
import type { Voucher } from '../types';

export type VoucherInput = Omit<Voucher, 'id' | 'created_at'>;

export async function getVouchers(): Promise<Voucher[]> {
    const { data, error } = await supabase
        .from('vouchers')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as Voucher[]) ?? [];
}

export async function createVoucher(input: VoucherInput): Promise<Voucher> {
    const { data, error } = await supabase
        .from('vouchers')
        .insert({ ...input, code: input.code.toUpperCase() })
        .select()
        .single();
    if (error) throw error;
    return data as Voucher;
}

export async function updateVoucher(id: string, input: Partial<VoucherInput>): Promise<Voucher> {
    const payload = input.code ? { ...input, code: input.code.toUpperCase() } : input;
    const { data, error } = await supabase
        .from('vouchers')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data as Voucher;
}

export async function deleteVoucher(id: string): Promise<void> {
    const { error } = await supabase.from('vouchers').delete().eq('id', id);
    if (error) throw error;
}

export async function toggleVoucherActive(id: string, is_active: boolean): Promise<void> {
    const { error } = await supabase
        .from('vouchers')
        .update({ is_active })
        .eq('id', id);
    if (error) throw error;
}
