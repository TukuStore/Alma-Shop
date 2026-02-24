
import { supabase } from '@/lib/supabase';
import type { Notification } from '@/types';

export const notificationService = {
    async fetchNotifications(limit = 20): Promise<Notification[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return (data as Notification[]) ?? [];
    },

    async markAsRead(id: string): Promise<void> {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);

        if (error) throw error;
    },

    async markAllAsRead(): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false);

        if (error) throw error;
    },

    async createNotification(userId: string, notification: {
        title: string;
        message: string;
        type: 'order' | 'promo' | 'wallet' | 'system';
        action_url?: string;
    }): Promise<void> {
        const { error } = await supabase
            .from('notifications')
            .insert({
                user_id: userId,
                title: notification.title,
                message: notification.message,
                type: notification.type,
                action_url: notification.action_url,
                is_read: false,
            });

        if (error) {
            console.error('Error creating notification:', error);
        }
    },

    async sendOrderStatusNotification(userId: string, orderId: string, newStatus: string): Promise<void> {
        const shortId = orderId.slice(0, 8).toUpperCase();
        const statusMessages: Record<string, { title: string; message: string }> = {
            paid: {
                title: '💰 Payment Confirmed',
                message: `Your order #${shortId} payment has been confirmed. We're preparing your order!`,
            },
            processing: {
                title: '⚙️ Order Processing',
                message: `Your order #${shortId} is being processed and prepared for shipping.`,
            },
            shipped: {
                title: '🚚 Order Shipped!',
                message: `Great news! Your order #${shortId} is on its way to you.`,
            },
            completed: {
                title: '📦 Pesanan Selesai',
                message: `Your order #${shortId} has been completed. Enjoy your purchase!`,
            },
            cancelled: {
                title: '❌ Order Cancelled',
                message: `Your order #${shortId} has been cancelled. Contact support if you have questions.`,
            },
        };

        const msg = statusMessages[newStatus];
        if (msg) {
            await this.createNotification(userId, {
                title: msg.title,
                message: msg.message,
                type: 'order',
                action_url: `/order/${orderId}`,
            });
        }
    },
};
