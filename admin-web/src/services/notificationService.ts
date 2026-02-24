import { supabase } from '../lib/supabase';

type NotificationInput = {
    title: string;
    message: string;
    type: 'order' | 'promo' | 'system' | 'wallet';
    action_url?: string;
    user_id?: string; // If undefined, sends to all users
};

export async function sendNotification(input: NotificationInput): Promise<void> {
    if (input.user_id) {
        // Send to specific user
        const { error } = await supabase.from('notifications').insert({
            user_id: input.user_id,
            title: input.title,
            message: input.message,
            type: input.type,
            action_url: input.action_url,
            is_read: false,
        });
        if (error) throw error;
    } else {
        // Broadcast to all users
        const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('role', 'customer');

        if (!profiles || profiles.length === 0) return;

        const notifications = profiles.map(p => ({
            user_id: p.user_id,
            title: input.title,
            message: input.message,
            type: input.type,
            action_url: input.action_url,
            is_read: false,
        }));

        // Insert in batches of 100
        for (let i = 0; i < notifications.length; i += 100) {
            const batch = notifications.slice(i, i + 100);
            const { error } = await supabase.from('notifications').insert(batch);
            if (error) throw error;
        }
    }
}
