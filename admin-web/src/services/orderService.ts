import { supabase } from '../lib/supabase';
import type { Order, OrderStatus } from '../types';

export async function getAllOrders(filters?: {
    status?: OrderStatus | 'all';
    search?: string;
    page?: number;
    limit?: number;
}): Promise<{ data: Order[]; count: number }> {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const from = (page - 1) * limit;

    let query = supabase
        .from('orders')
        .select(`
      *,
      profile:profiles(full_name, avatar_url, phone_number),
      order_items(id, quantity, price_at_purchase, product:products(id, name, images, price))
    `, { count: 'exact' });

    if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
    }
    if (filters?.search) {
        query = query.ilike('id', `%${filters.search}%`);
    }

    query = query.order('created_at', { ascending: false }).range(from, from + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: (data as Order[]) ?? [], count: count ?? 0 };
}

export async function getOrderById(id: string): Promise<Order | null> {
    const { data, error } = await supabase
        .from('orders')
        .select(`
      *,
      profile:profiles(full_name, avatar_url, phone_number),
      order_items(id, quantity, price_at_purchase, product:products(id, name, images, price))
    `)
        .eq('id', id)
        .single();
    if (error) throw error;
    return data as Order | null;
}

export async function updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    shippingInfo?: { courier: string; tracking_number: string }
): Promise<void> {
    const updatePayload: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
    };
    if (shippingInfo) {
        updatePayload.courier = shippingInfo.courier;
        updatePayload.tracking_number = shippingInfo.tracking_number;
    }
    // Set shipped_at when marking as shipped (also handled by DB trigger as fallback)
    if (status === 'shipped') {
        updatePayload.shipped_at = new Date().toISOString();
    }
    // Update the order and fetch the user_id
    const { data: updatedOrder, error } = await supabase
        .from('orders')
        .update(updatePayload)
        .eq('id', orderId)
        .select('user_id')
        .single();

    if (error) throw error;

    // Create a notification for the user
    if (updatedOrder?.user_id) {
        let title = "Status Pesanan Diperbarui";
        let message = `Pesanan Anda #${orderId.split('-')[0].toUpperCase()} telah berstatus ${status}.`;

        if (status === 'shipped' && shippingInfo) {
            title = "Pesanan Dikirim";
            message = `Pesanan Anda sedang dikirim menggunakan ${shippingInfo.courier}. Resi: ${shippingInfo.tracking_number}`;
        } else if (status === 'completed') {
            title = "Pesanan Selesai";
            message = `Pesanan Anda telah selesai. Terima kasih telah berbelanja!`;
        }

        await supabase.from('notifications').insert({
            user_id: updatedOrder.user_id,
            title,
            message,
            type: 'order',
            is_read: false,
            action_url: `/orders/${orderId}`,
        });
    }
}
