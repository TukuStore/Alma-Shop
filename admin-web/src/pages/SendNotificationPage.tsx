import { zodResolver } from '@hookform/resolvers/zod';
import { Bell, Loader2, Send } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { sendNotification } from '../services/notificationService';

const schema = z.object({
    target: z.enum(['all', 'specific']),
    user_id: z.string().optional(),
    type: z.enum(['promo', 'system', 'order', 'wallet']),
    title: z.string().min(1, 'Title required'),
    message: z.string().min(1, 'Message required'),
    action_url: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function SendNotificationPage() {
    const [isSending, setIsSending] = useState(false);
    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { target: 'all', type: 'promo' },
    });

    const target = watch('target');

    const onSubmit = async (data: FormData) => {
        setIsSending(true);
        try {
            await sendNotification({
                title: data.title,
                message: data.message,
                type: data.type,
                action_url: data.action_url,
                user_id: data.target === 'specific' ? data.user_id : undefined,
            });
            toast.success(data.target === 'all' ? 'Notification sent to all customers!' : 'Notification sent!');
            reset();
        } catch (err: any) {
            toast.error(err.message ?? 'Failed to send notification');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <Bell size={22} className="text-primary" />
                <h1 className="page-header mb-0">Send Notification</h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
                <div className="form-group">
                    <label className="label">Target Audience</label>
                    <div className="flex gap-3">
                        {[{ value: 'all', label: 'All Customers' }, { value: 'specific', label: 'Specific User' }].map(opt => (
                            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" {...register('target')} value={opt.value} className="accent-primary" />
                                <span className="text-sm text-foreground">{opt.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {target === 'specific' && (
                    <div className="form-group">
                        <label className="label">User ID</label>
                        <input {...register('user_id')} className="input" placeholder="Paste user UUID from the Users page" />
                    </div>
                )}

                <div className="form-group">
                    <label className="label">Notification Type</label>
                    <select {...register('type')} className="select">
                        <option value="promo">🎉 Promo</option>
                        <option value="system">⚙️ System</option>
                        <option value="order">📦 Order</option>
                        <option value="wallet">💰 Wallet</option>
                    </select>
                </div>

                <div className="form-group">
                    <label className="label">Title *</label>
                    <input {...register('title')} className="input" placeholder="e.g. Special Batik Weekend Sale!" />
                    {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                </div>

                <div className="form-group">
                    <label className="label">Message *</label>
                    <textarea {...register('message')} rows={3} className="input resize-none"
                        placeholder="Write the notification body here. Keep it concise and engaging." />
                    {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
                </div>

                <div className="form-group">
                    <label className="label">Action URL (optional)</label>
                    <input {...register('action_url')} className="input" placeholder="e.g. /products or /vouchers" />
                    <p className="text-xs text-muted-foreground">Deep link in the mobile app when the user taps the notification.</p>
                </div>

                <div className="pt-2 border-t border-border">
                    <button type="submit" disabled={isSending} className="btn-primary w-full">
                        {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        {isSending ? 'Sending...' : (target === 'all' ? 'Send to All Customers' : 'Send Notification')}
                    </button>
                </div>
            </form>
        </div>
    );
}
