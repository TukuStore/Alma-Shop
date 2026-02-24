
import { supabase } from '@/lib/supabase';
import type { Transaction, Wallet } from '@/types';

type TransferRequest = {
    recipientUserId: string;
    amount: number;
    description?: string;
};

type RewardPointsResult = {
    totalPoints: number;
    currentTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
    nextTier?: string;
    pointsToNextTier?: number;
};

// ============================================
// WALLET SERVICE
// ============================================
export const walletService = {
    // ============================================
    // FETCH WALLET
    // ============================================
    async fetchWallet(): Promise<Wallet | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('wallets')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error) {
            // If wallet doesn't exist, try to create one (fallback)
            if (error.code === 'PGRST116') {
                const { data: newWallet, error: createError } = await supabase
                    .from('wallets')
                    .insert({ user_id: user.id, balance: 0 })
                    .select()
                    .single();

                if (createError) throw createError;
                return newWallet as Wallet;
            }
            throw error;
        }

        return data as Wallet;
    },

    // ============================================
    // FETCH TRANSACTIONS
    // ============================================
    async fetchTransactions(limit = 20, type?: Transaction['type']): Promise<Transaction[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // First get wallet id
        const { data: wallet } = await supabase
            .from('wallets')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (!wallet) return [];

        let query = supabase
            .from('transactions')
            .select('*')
            .eq('wallet_id', wallet.id)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (type) {
            query = query.eq('type', type);
        }

        const { data, error } = await query;

        if (error) throw error;
        return (data as Transaction[]) ?? [];
    },

    // ============================================
    // PERFORM TOP UP
    // ============================================
    async performTopUp(amount: number): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data: wallet } = await supabase
            .from('wallets')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (!wallet) throw new Error('Wallet not found');

        // Update balance
        const { error: updateError } = await supabase
            .from('wallets')
            .update({ balance: wallet.balance + amount })
            .eq('id', wallet.id);

        if (updateError) throw updateError;

        // Create transaction
        const { error: txError } = await supabase
            .from('transactions')
            .insert({
                wallet_id: wallet.id,
                type: 'topup',
                amount: amount,
                description: 'Top Up Wallet',
                status: 'completed'
            });

        if (txError) throw txError;

        // Add reward points (1 point per Rp 1000)
        await this.addRewardPoints(user.id, Math.floor(amount / 1000), 'Top Up');
    },

    // ============================================
    // TRANSFER TO ANOTHER USER
    // ============================================
    async transferToUser(request: TransferRequest): Promise<{ success: boolean; message: string }> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            // Get sender wallet
            const { data: senderWallet } = await supabase
                .from('wallets')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (!senderWallet) {
                return { success: false, message: 'Wallet not found' };
            }

            // Check balance
            if (senderWallet.balance < request.amount) {
                return { success: false, message: 'Insufficient balance' };
            }

            // Get recipient wallet
            const { data: recipientWallet } = await supabase
                .from('wallets')
                .select('*')
                .eq('user_id', request.recipientUserId)
                .single();

            if (!recipientWallet) {
                return { success: false, message: 'Recipient wallet not found' };
            }

            // Perform transfer
            // Deduct from sender
            await supabase
                .from('wallets')
                .update({ balance: senderWallet.balance - request.amount })
                .eq('id', senderWallet.id);

            // Add to recipient
            await supabase
                .from('wallets')
                .update({ balance: recipientWallet.balance + request.amount })
                .eq('id', recipientWallet.id);

            // Create sender transaction
            await supabase
                .from('transactions')
                .insert({
                    wallet_id: senderWallet.id,
                    type: 'transfer',
                    amount: request.amount,
                    description: `Transfer to ${request.recipientUserId}`,
                    status: 'completed'
                });

            // Create recipient transaction
            await supabase
                .from('transactions')
                .insert({
                    wallet_id: recipientWallet.id,
                    type: 'transfer',
                    amount: request.amount,
                    description: `Transfer from ${user.id}`,
                    status: 'completed'
                });

            return { success: true, message: 'Transfer successful' };

        } catch (error) {
            console.error('Transfer error:', error);
            return { success: false, message: 'Transfer failed' };
        }
    },

    // ============================================
    // GET USER BY USERNAME/PHONE
    // ============================================
    async findUser(identifier: string): Promise<{ id: string; name: string } | null> {
        try {
            // Search by phone or username
            const { data, error } = await supabase
                .from('profiles')
                .select('user_id, full_name, username')
                .or(`phone_number.eq.${identifier}, username.eq.${identifier}`)
                .single();

            if (error || !data) return null;

            return {
                id: data.user_id,
                name: data.full_name || data.username,
            };

        } catch (error) {
            console.error('Find user error:', error);
            return null;
        }
    },

    // ============================================
    // PAY WITH WALLET
    // ============================================
    async payForOrder(orderId: string, amount: number): Promise<{ success: boolean; message: string }> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const wallet = await this.fetchWallet();
            if (!wallet) {
                return { success: false, message: 'Wallet not found' };
            }

            if (wallet.balance < amount) {
                return { success: false, message: 'Insufficient wallet balance' };
            }

            // Deduct from wallet
            await supabase
                .from('wallets')
                .update({ balance: wallet.balance - amount })
                .eq('id', wallet.id);

            // Create transaction
            await supabase
                .from('transactions')
                .insert({
                    wallet_id: wallet.id,
                    type: 'payment',
                    amount: amount,
                    description: `Payment for order ${orderId}`,
                    status: 'completed'
                });

            // Add reward points for purchase
            await this.addRewardPoints(user.id, Math.floor(amount / 5000), 'Purchase');

            return { success: true, message: 'Payment successful' };

        } catch (error) {
            console.error('Wallet payment error:', error);
            return { success: false, message: 'Payment failed' };
        }
    },

    // ============================================
    // ADD REWARD POINTS
    // ============================================
    async addRewardPoints(
        userId: string,
        points: number,
        source: 'Purchase' | 'Review' | 'Referral' | 'Top Up' | 'Bonus'
    ): Promise<void> {
        try {
            // Get current reward points
            const { data: current } = await supabase
                .from('reward_points')
                .select('points')
                .eq('user_id', userId)
                .single();

            const currentPoints = current?.points || 0;
            const newPoints = currentPoints + points;

            if (current) {
                // Update existing
                await supabase
                    .from('reward_points')
                    .update({
                        points: newPoints,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('user_id', userId);
            } else {
                // Create new
                await supabase
                    .from('reward_points')
                    .insert({
                        user_id: userId,
                        points: newPoints,
                    });
            }

            // Create points history
            await supabase
                .from('points_history')
                .insert({
                    user_id: userId,
                    points: points,
                    source,
                    description: `Earned ${points} points from ${source}`,
                });

        } catch (error) {
            console.error('Add reward points error:', error);
        }
    },

    // ============================================
    // GET REWARD POINTS & TIER
    // ============================================
    async getRewardPoints(userId: string): Promise<RewardPointsResult> {
        try {
            const { data } = await supabase
                .from('reward_points')
                .select('points')
                .eq('user_id', userId)
                .single();

            const totalPoints = data?.points || 0;

            // Calculate tier
            let currentTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' = 'Bronze';
            let nextTier: string | undefined;
            let pointsToNextTier: number | undefined;

            if (totalPoints >= 10000) {
                currentTier = 'Platinum';
            } else if (totalPoints >= 5000) {
                currentTier = 'Gold';
                nextTier = 'Platinum';
                pointsToNextTier = 10000 - totalPoints;
            } else if (totalPoints >= 2000) {
                currentTier = 'Silver';
                nextTier = 'Gold';
                pointsToNextTier = 5000 - totalPoints;
            } else {
                nextTier = 'Silver';
                pointsToNextTier = 2000 - totalPoints;
            }

            return {
                totalPoints,
                currentTier,
                nextTier,
                pointsToNextTier,
            };

        } catch (error) {
            console.error('Get reward points error:', error);
            return {
                totalPoints: 0,
                currentTier: 'Bronze',
            };
        }
    },

    // ============================================
    // REDEEM POINTS
    // ============================================
    async redeemPoints(
        userId: string,
        pointsToRedeem: number,
        reward: string
    ): Promise<{ success: boolean; message: string }> {
        try {
            const result = await this.getRewardPoints(userId);

            if (result.totalPoints < pointsToRedeem) {
                return { success: false, message: 'Insufficient points' };
            }

            // Deduct points
            await supabase
                .from('reward_points')
                .update({
                    points: result.totalPoints - pointsToRedeem,
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', userId);

            // Create redemption history
            await supabase
                .from('points_history')
                .insert({
                    user_id: userId,
                    points: -pointsToRedeem,
                    source: 'Redemption',
                    description: `Redeemed for ${reward}`,
                });

            return { success: true, message: `Successfully redeemed for ${reward}` };

        } catch (error) {
            console.error('Redeem points error:', error);
            return { success: false, message: 'Redemption failed' };
        }
    },

    // ============================================
    // GET TRANSACTION SUMMARY
    // ============================================
    async getTransactionSummary(): Promise<{
        totalCredit: number;
        totalDebit: number;
        transactionCount: number;
    }> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return { totalCredit: 0, totalDebit: 0, transactionCount: 0 };

            const { data: wallet } = await supabase
                .from('wallets')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (!wallet) return { totalCredit: 0, totalDebit: 0, transactionCount: 0 };

            const { data: transactions } = await supabase
                .from('transactions')
                .select('*')
                .eq('wallet_id', wallet.id);

            if (!transactions) return { totalCredit: 0, totalDebit: 0, transactionCount: 0 };

            const totalCredit = transactions
                .filter((t: any) => ['topup', 'refund'].includes(t.type))
                .reduce((sum, t) => sum + t.amount, 0);

            const totalDebit = transactions
                .filter((t: any) => ['payment', 'transfer'].includes(t.type))
                .reduce((sum, t) => sum + t.amount, 0);

            return {
                totalCredit,
                totalDebit,
                transactionCount: transactions.length,
            };

        } catch (error) {
            console.error('Transaction summary error:', error);
            return { totalCredit: 0, totalDebit: 0, transactionCount: 0 };
        }
    },

    // ============================================
    // GET WALLET LIMITS
    // ============================================
    getWalletLimits(): {
        minTopUp: number;
        maxTopUp: number;
        minTransfer: number;
        maxTransfer: number;
        dailyTransferLimit: number;
    } {
        return {
            minTopUp: 10000,
            maxTopUp: 10000000,
            minTransfer: 5000,
            maxTransfer: 5000000,
            dailyTransferLimit: 20000000,
        };
    },
};
