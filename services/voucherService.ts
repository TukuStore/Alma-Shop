
import { supabase } from '@/lib/supabase';
import type { Voucher } from '@/types';

type VoucherValidationResult = {
    valid: boolean;
    voucher?: Voucher;
    discount?: number;
    message: string;
};

type VoucherApplyOptions = {
    code: string;
    cartTotal: number;
    userId?: string;
};

export const voucherService = {
    // ============================================
    // FETCH USER VOUCHERS
    // ============================================
    async fetchUserVouchers(): Promise<Voucher[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Fetch vouchers claimed by the user
        const { data, error } = await supabase
            .from('user_vouchers')
            .select(`
                *,
                voucher:vouchers(*)
            `)
            .eq('user_id', user.id);

        if (error) throw error;

        // Flatten the structure
        return data.map((item: any) => ({
            ...item.voucher,
            is_used: item.is_used,
            used_at: item.used_at,
        })) as Voucher[];
    },

    // ============================================
    // FETCH AVAILABLE VOUCHERS
    // ============================================
    async fetchAvailableVouchers(): Promise<Voucher[]> {
        const { data, error } = await supabase
            .from('vouchers')
            .select('*')
            .eq('is_active', true)
            .gte('end_date', new Date().toISOString());

        if (error) throw error;
        return data as Voucher[];
    },

    // ============================================
    // CLAIM VOUCHER
    // ============================================
    async claimVoucher(code: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // 1. Validate voucher exists and is active
        const { data: voucher, error: voucherError } = await supabase
            .from('vouchers')
            .select('*')
            .eq('code', code.toUpperCase())
            .eq('is_active', true)
            .gte('end_date', new Date().toISOString())
            .single();

        if (voucherError || !voucher) {
            throw new Error('Invalid or expired voucher code');
        }

        // 2. Check if already claimed
        const { data: existingClaim } = await supabase
            .from('user_vouchers')
            .select('*')
            .eq('user_id', user.id)
            .eq('voucher_id', voucher.id)
            .single();

        if (existingClaim) {
            throw new Error('You have already claimed this voucher');
        }

        // 3. Claim (insert into user_vouchers)
        const { error: claimError } = await supabase
            .from('user_vouchers')
            .insert({
                user_id: user.id,
                voucher_id: voucher.id
            });

        if (claimError) throw claimError;
    },

    // ============================================
    // VALIDATE VOUCHER
    // ============================================
    async validateVoucher(options: VoucherApplyOptions): Promise<VoucherValidationResult> {
        try {
            const { code, cartTotal, userId } = options;

            if (!code || code.trim().length === 0) {
                return { valid: false, message: 'Please enter a voucher code' };
            }

            // 1. Find voucher
            const { data: voucher, error: voucherError } = await supabase
                .from('vouchers')
                .select('*')
                .eq('code', code.toUpperCase())
                .single();

            if (voucherError || !voucher) {
                return { valid: false, message: 'Invalid voucher code' };
            }

            // 2. Check if voucher is active
            if (!voucher.is_active) {
                return { valid: false, message: 'This voucher is inactive' };
            }

            // 3. Check expiry
            if (voucher.end_date && new Date(voucher.end_date) < new Date()) {
                return { valid: false, message: 'This voucher has expired' };
            }

            // 4. Check minimum purchase requirement
            if (voucher.min_purchase && cartTotal < voucher.min_purchase) {
                return {
                    valid: false,
                    message: `Minimum purchase of Rp ${voucher.min_purchase.toLocaleString('id-ID')} required`
                };
            }

            // 5. Check if user has claimed this voucher (if userId provided)
            if (userId) {
                const { data: userVoucher } = await supabase
                    .from('user_vouchers')
                    .select('*')
                    .eq('user_id', userId)
                    .eq('voucher_id', voucher.id)
                    .single();

                if (!userVoucher) {
                    return { valid: false, message: 'You need to claim this voucher first' };
                }

                if (userVoucher.is_used) {
                    return { valid: false, message: 'This voucher has already been used' };
                }
            }

            // 6. Calculate discount
            let discount = 0;
            if (voucher.discount_type === 'percentage') {
                discount = cartTotal * (voucher.discount_value / 100);
                // Apply max discount cap if exists
                if (voucher.max_discount && discount > voucher.max_discount) {
                    discount = voucher.max_discount;
                }
            } else if (voucher.discount_type === 'fixed') {
                discount = voucher.discount_value;
            }

            // Ensure discount doesn't exceed cart total
            if (discount > cartTotal) {
                discount = cartTotal;
            }

            return {
                valid: true,
                voucher,
                discount: Math.round(discount),
                message: `Voucher applied! You save Rp ${discount.toLocaleString('id-ID')}`
            };

        } catch (error) {
            console.error('Voucher validation error:', error);
            return { valid: false, message: 'Failed to validate voucher' };
        }
    },

    // ============================================
    // APPLY VOUCHER (mark as used)
    // ============================================
    async applyVoucher(voucherId: string, userId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('user_vouchers')
                .update({
                    is_used: true,
                    used_at: new Date().toISOString()
                })
                .eq('voucher_id', voucherId)
                .eq('user_id', userId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error applying voucher:', error);
            return false;
        }
    },

    // ============================================
    // GET VOUCHER BY CODE
    // ============================================
    async getVoucherByCode(code: string): Promise<Voucher | null> {
        try {
            const { data, error } = await supabase
                .from('vouchers')
                .select('*')
                .eq('code', code.toUpperCase())
                .single();

            if (error) throw error;
            return data as Voucher | null;
        } catch (error) {
            console.error('Error fetching voucher:', error);
            return null;
        }
    },

    // ============================================
    // CHECK VOUCHER EXPIRY STATUS
    // ============================================
    getVoucherExpiryStatus(voucher: Voucher): { isExpired: boolean; daysRemaining: number | null } {
        if (!voucher.end_date) {
            return { isExpired: false, daysRemaining: null };
        }

        const now = new Date();
        const expiry = new Date(voucher.end_date);
        const daysRemaining = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        return {
            isExpired: daysRemaining < 0,
            daysRemaining
        };
    }
};
