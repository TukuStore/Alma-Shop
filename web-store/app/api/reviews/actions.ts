'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitProductReview({
    orderId,
    productId,
    rating,
    comment,
    images = [],
}: {
    orderId: string;
    productId: string;
    rating: number;
    comment: string;
    images?: string[];
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Silakan login kembali." };
    }

    try {
        const { error } = await supabase
            .from('reviews')
            .upsert({
                user_id: user.id,
                order_id: orderId,
                product_id: productId,
                rating,
                comment,
                images,
            }, {
                onConflict: 'user_id,product_id,order_id'
            });

        if (error) {
            console.error(error);
            return { error: "Gagal menyimpan ulasan. " + error.message };
        }

        revalidatePath('/orders');
        revalidatePath(`/orders/${orderId}`);
        return { success: true };
    } catch (e: any) {
        return { error: e.message || "Terjadi kesalahan." };
    }
}

export async function getOrderReviews(orderId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('reviews')
        .select('product_id, rating, comment, images')
        .eq('order_id', orderId);

    if (error) return [];
    return data || [];
}
