
import { supabase } from '@/lib/supabase';
import type { WishlistItem } from '@/types';

// Fetch user's wishlist
export async function fetchWishlist(): Promise<WishlistItem[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('wishlist_items')
        .select('*, product:products(*, category:categories(*))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as WishlistItem[]) ?? [];
}

// Check if a product is in wishlist
export async function checkInWishlist(productId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
        .from('wishlist_items')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

    // .single() returns error if no row found, which is expected
    return !!data;
}

// Add to wishlist
export async function addToWishlist(productId: string): Promise<WishlistItem> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
        .from('wishlist_items')
        .insert({ user_id: user.id, product_id: productId })
        .select('*, product:products(*)')
        .single();

    if (error) throw error;
    return data as WishlistItem;
}

// Remove from wishlist
export async function removeFromWishlist(productId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

    if (error) throw error;
}
