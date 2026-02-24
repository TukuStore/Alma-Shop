
import { supabase } from '@/lib/supabase';
import type { Review } from '@/types';

export const reviewService = {
    async submitReview(review: Omit<Review, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Review> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('reviews')
            .insert({ ...review, user_id: user.id })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async submitBulkReviews(reviews: Omit<Review, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]): Promise<Review[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const reviewsWithUser = reviews.map(r => ({ ...r, user_id: user.id }));

        const { data, error } = await supabase
            .from('reviews')
            .insert(reviewsWithUser)
            .select();

        if (error) throw error;
        return data;
    },

    async getProductReviews(productId: string): Promise<Review[]> {
        const { data, error } = await supabase
            .from('reviews')
            .select('*, profile:profiles(full_name, avatar_url)')
            .eq('product_id', productId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }
};
