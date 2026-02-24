import { supabase } from '@/lib/supabase';
import type { CartItem, Order, OrderStatus } from '@/types';

type OrderDetail = {
    id: string;
    user_id: string;
    total_amount: number;
    status: OrderStatus;
    shipping_address: string;
    payment_proof_url: string | null;
    courier: string | null;
    tracking_number: string | null;
    created_at: string;
    updated_at: string;
    shipped_at: string | null;
    completed_at: string | null;
    order_items: {
        id: string;
        quantity: number;
        price_at_purchase: number;
        product: {
            id: string;
            name: string;
            images: string[];
            price: number;
        } | null;
    }[];
};

type OrderFilters = {
    status?: OrderStatus | 'all';
    search?: string;
    sortBy?: 'date' | 'amount';
    sortOrder?: 'asc' | 'desc';
};

// ============================================
// CREATE ORDER
// ============================================
export async function createOrder(
    userId: string,
    items: CartItem[],
    totalAmount: number,
    shippingAddress: string,
    paymentProofUrl?: string
): Promise<Order | null> {
    try {
        // 1. Create the Order
        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: userId,
                total_amount: totalAmount,
                status: 'PENDING',
                shipping_address: shippingAddress,
                payment_proof_url: paymentProofUrl,
            })
            .select()
            .single();

        if (orderError) throw orderError;
        if (!orderData) throw new Error('Failed to create order');

        // 2. Create Order Items
        const orderItems = items.map((item) => ({
            order_id: orderData.id,
            product_id: item.productId,
            quantity: item.quantity,
            price_at_purchase: item.discountPrice ?? item.price,
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) throw itemsError;

        return orderData as Order;
    } catch (error) {
        console.error('Error creating order:', error);
        return null;
    }
}

// ============================================
// FETCH ORDERS
// ============================================
export async function fetchUserOrders(userId: string, filters?: OrderFilters): Promise<Order[]> {
    try {
        let query = supabase
            .from('orders')
            .select('*')
            .eq('user_id', userId);

        // Apply status filter
        if (filters?.status && filters.status !== 'all') {
            query = query.eq('status', filters.status);
        }

        // Apply sorting
        const sortBy = filters?.sortBy || 'date';
        const sortOrder = filters?.sortOrder || 'desc';
        query = query.order(sortBy === 'date' ? 'created_at' : 'total_amount', { ascending: sortOrder === 'asc' });

        const { data, error } = await query;

        if (error) throw error;
        return (data as Order[]) ?? [];
    } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
    }
}

// ============================================
// FETCH ORDER DETAIL
// ============================================
export async function fetchOrderDetail(orderId: string): Promise<OrderDetail | null> {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                id,
                user_id,
                total_amount,
                status,
                shipping_address,
                payment_proof_url,
                created_at,
                updated_at,
                shipped_at,
                completed_at,
                order_items(
                    id,
                    quantity,
                    price_at_purchase,
                    product:products(id, name, images, price)
                )
            `)
            .eq('id', orderId)
            .single();

        if (error) throw error;
        return data as unknown as OrderDetail | null;
    } catch (error) {
        console.error('Error fetching order detail:', error);
        return null;
    }
}

// ============================================
// CANCEL ORDER
// ============================================
export async function cancelOrder(orderId: string, userId: string, reason?: string): Promise<{ success: boolean; message: string }> {
    try {
        // First check if order exists and belongs to user
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .eq('user_id', userId)
            .single();

        if (fetchError || !order) {
            return { success: false, message: 'Order not found' };
        }

        // Check if order can be cancelled (only pending, paid, or processing)
        if (!['PENDING', 'PAID', 'PROCESSING'].includes(order.status)) {
            return { success: false, message: `Cannot cancel order with status: ${order.status}` };
        }

        // Update order status
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                status: 'CANCELLED',
                updated_at: new Date().toISOString(),
                // Store cancellation reason in metadata if needed
            })
            .eq('id', orderId)
            .eq('user_id', userId);

        if (updateError) throw updateError;

        return { success: true, message: 'Order cancelled successfully' };
    } catch (error) {
        console.error('Error cancelling order:', error);
        return { success: false, message: 'Failed to cancel order. Please try again.' };
    }
}

// ============================================
// COMPLETE ORDER (Pesanan Selesai)
// ============================================
export async function completeOrder(orderId: string, userId: string): Promise<{ success: boolean; message: string }> {
    try {
        // Check if order exists, belongs to user, and is shipped
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .eq('user_id', userId)
            .single();

        if (fetchError || !order) {
            return { success: false, message: 'Order not found' };
        }

        if (order.status !== 'SHIPPED') {
            return { success: false, message: 'Only shipped orders can be marked as completed' };
        }

        // Update order status to completed
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                status: 'COMPLETED',
                updated_at: new Date().toISOString(),
            })
            .eq('id', orderId)
            .eq('user_id', userId);

        if (updateError) throw updateError;

        // Create notification
        await supabase.from('notifications').insert({
            user_id: userId,
            title: 'Pesanan Selesai',
            message: `Pesanan #${orderId.slice(0, 8).toUpperCase()} telah selesai. Terima kasih telah berbelanja!`,
            type: 'order',
            is_read: false,
            action_url: `/orders/${orderId}`,
        });

        return { success: true, message: 'Pesanan telah selesai!' };
    } catch (error) {
        console.error('Error completing order:', error);
        return { success: false, message: 'Failed to complete order. Please try again.' };
    }
}

// ============================================
// REQUEST RETURN
// ============================================
type ReturnRequest = {
    orderId: string;
    userId: string;
    reason: string;
    description: string;
    images?: string[];
};

export async function requestReturn(request: ReturnRequest): Promise<{ success: boolean; message: string }> {
    try {
        // Check if order exists and is completed
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', request.orderId)
            .eq('user_id', request.userId)
            .single();

        if (fetchError || !order) {
            return { success: false, message: 'Order not found' };
        }

        if (order.status !== 'COMPLETED') {
            return { success: false, message: 'Can only request return for completed orders' };
        }

        // Create return record in returns table
        const { error: returnError } = await supabase
            .from('returns')
            .insert({
                order_id: request.orderId,
                user_id: request.userId,
                reason: request.reason,
                description: request.description,
                images: request.images || [],
                status: 'PENDING',
            });

        if (returnError) throw returnError;

        // Update order status to return_requested
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                status: 'RETURN_REQUESTED',
                updated_at: new Date().toISOString(),
            })
            .eq('id', request.orderId)
            .eq('user_id', request.userId);

        if (updateError) throw updateError;

        return { success: true, message: 'Return request submitted successfully' };
    } catch (error) {
        console.error('Error requesting return:', error);
        return { success: false, message: 'Failed to submit return request. Please try again.' };
    }
}

// ============================================
// REPEAT ORDER
// ============================================
export async function repeatOrder(orderId: string, userId: string): Promise<OrderDetail | null> {
    try {
        // Fetch original order details
        const originalOrder = await fetchOrderDetail(orderId);

        if (!originalOrder) {
            throw new Error('Original order not found');
        }

        if (originalOrder.user_id !== userId) {
            throw new Error('Unauthorized');
        }

        // Create new order with same items
        const { data: newOrderData, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: userId,
                total_amount: originalOrder.total_amount,
                status: 'PENDING',
                shipping_address: originalOrder.shipping_address,
            })
            .select()
            .single();

        if (orderError) throw orderError;
        if (!newOrderData) throw new Error('Failed to create order');

        // Copy order items
        const orderItems = originalOrder.order_items.map((item) => ({
            order_id: newOrderData.id,
            product_id: item.product?.id,
            quantity: item.quantity,
            price_at_purchase: item.product?.price || item.price_at_purchase,
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) throw itemsError;

        // Fetch and return the new order details
        return await fetchOrderDetail(newOrderData.id);
    } catch (error) {
        console.error('Error repeating order:', error);
        return null;
    }
}

// ============================================
// SEARCH ORDERS
// ============================================
export async function searchOrders(userId: string, searchTerm: string): Promise<Order[]> {
    try {
        // Search by order ID (partial match)
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', userId)
            .ilike('id', `%${searchTerm}%`)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data as Order[]) ?? [];
    } catch (error) {
        console.error('Error searching orders:', error);
        return [];
    }
}

// ============================================
// UPDATE ORDER STATUS (Admin only)
// ============================================
export async function updateOrderStatus(
    orderId: string,
    status: OrderStatus
): Promise<{ success: boolean; message: string }> {
    try {
        const { error } = await supabase
            .from('orders')
            .update({
                status,
                updated_at: new Date().toISOString(),
            })
            .eq('id', orderId);

        if (error) throw error;

        return { success: true, message: 'Order status updated successfully' };
    } catch (error) {
        console.error('Error updating order status:', error);
        return { success: false, message: 'Failed to update order status' };
    }
}
