import { ArrowLeft, CheckCircle2, Circle, Copy, ExternalLink, Loader2, Truck } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';
import ShipOrderModal from '../components/ShipOrderModal';
import { cn, formatCurrency, formatDate } from '../lib/utils';
import { getOrderById, updateOrderStatus } from '../services/orderService';
import type { Order, OrderStatus } from '../types';

const STATUS_FLOW: OrderStatus[] = ['pending', 'paid', 'processing', 'shipped', 'completed'];

const STATUS_LABEL: Record<OrderStatus, string> = {
    pending: 'Pending Payment', paid: 'Payment Confirmed', processing: 'Processing',
    shipped: 'Shipped', completed: 'Completed', cancelled: 'Cancelled',
    return_requested: 'Return Requested', returned: 'Returned',
};

function getTrackingUrl(trackingNumber: string): string {
    if (trackingNumber.startsWith('http://') || trackingNumber.startsWith('https://')) {
        return trackingNumber;
    }
    return `https://cekresi.com/?noresi=${encodeURIComponent(trackingNumber)}`;
}

export default function OrderDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [shipModalOpen, setShipModalOpen] = useState(false);

    useEffect(() => {
        if (id) getOrderById(id).then(setOrder).finally(() => setIsLoading(false));
    }, [id]);

    const handleAdvanceStatus = async () => {
        if (!order) return;
        const currentIdx = STATUS_FLOW.indexOf(order.status as any);
        if (currentIdx === -1 || currentIdx >= STATUS_FLOW.length - 1) return;
        const nextStatus = STATUS_FLOW[currentIdx + 1];

        // Intercept: if next status is 'shipped', open the Ship Modal
        if (nextStatus === 'shipped') {
            setShipModalOpen(true);
            return;
        }

        setIsUpdating(true);
        try {
            await updateOrderStatus(order.id, nextStatus);
            setOrder(prev => prev ? { ...prev, status: nextStatus } : prev);
            toast.success(`Order status updated to "${STATUS_LABEL[nextStatus]}"`);
        } catch { toast.error('Failed to update status'); }
        finally { setIsUpdating(false); }
    };

    const handleShipSubmit = async (courier: string, trackingNumber: string) => {
        if (!order) return;
        setIsUpdating(true);
        try {
            await updateOrderStatus(order.id, 'shipped', { courier, tracking_number: trackingNumber });
            setOrder(prev => prev ? { ...prev, status: 'shipped', courier, tracking_number: trackingNumber } : prev);
            toast.success('Order shipped! Tracking info saved.');
            setShipModalOpen(false);
        } catch { toast.error('Failed to update status'); }
        finally { setIsUpdating(false); }
    };

    const handleCancel = async () => {
        if (!order || !confirm('Cancel this order?')) return;
        setIsUpdating(true);
        try {
            await updateOrderStatus(order.id, 'cancelled');
            setOrder(prev => prev ? { ...prev, status: 'cancelled' } : prev);
            toast.success('Order cancelled');
        } catch { toast.error('Failed'); }
        finally { setIsUpdating(false); }
    };

    if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 size={32} className="animate-spin text-primary" /></div>;
    if (!order) return <div className="text-center py-20 text-muted-foreground">Order not found.</div>;

    const currentIdx = STATUS_FLOW.indexOf(order.status as any);
    const profile = (order as any).profile;
    const items = order.order_items ?? [];

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <Link to="/orders" className="btn-ghost btn-icon"><ArrowLeft size={18} /></Link>
                <div>
                    <h1 className="text-xl font-bold text-foreground">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
                    <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                </div>
                <span className={`badge badge-${order.status} ml-auto`}>{STATUS_LABEL[order.status]}</span>
            </div>

            {/* Status Stepper */}
            {!['cancelled', 'return_requested', 'returned'].includes(order.status) && (
                <div className="card">
                    <p className="text-sm font-semibold text-foreground mb-5">Order Progress</p>
                    <div className="flex items-center gap-0">
                        {STATUS_FLOW.map((s, i) => {
                            const isDone = currentIdx >= i;
                            const isCurrent = currentIdx === i;
                            return (
                                <React.Fragment key={s}>
                                    <div className="flex flex-col items-center flex-1 min-w-0">
                                        <div className={cn(
                                            'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all',
                                            isDone ? 'bg-primary border-primary' : 'border-border bg-secondary'
                                        )}>
                                            {isDone
                                                ? <CheckCircle2 size={16} className="text-white" fill="white" />
                                                : <Circle size={16} className="text-muted-foreground" />}
                                        </div>
                                        <p className={cn('text-[10px] mt-1.5 text-center leading-tight', isCurrent ? 'text-primary font-semibold' : isDone ? 'text-foreground' : 'text-muted-foreground')}>
                                            {STATUS_LABEL[s]}
                                        </p>
                                    </div>
                                    {i < STATUS_FLOW.length - 1 && (
                                        <div className={cn('h-0.5 flex-1 -mt-5', i < currentIdx ? 'bg-primary' : 'bg-border')} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                    <div className="flex gap-3 mt-6">
                        {currentIdx < STATUS_FLOW.length - 1 && (
                            <button onClick={handleAdvanceStatus} disabled={isUpdating} className="btn-primary">
                                {isUpdating ? <Loader2 size={14} className="animate-spin" /> : null}
                                Mark as {STATUS_LABEL[STATUS_FLOW[currentIdx + 1]]}
                            </button>
                        )}
                        {!['cancelled', 'completed'].includes(order.status) && (
                            <button onClick={handleCancel} disabled={isUpdating} className="btn-destructive">
                                Cancel Order
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Tracking Info Card — visible when shipped or completed */}
            {order.courier && order.tracking_number && ['shipped', 'completed'].includes(order.status) && (
                <div className="card border-primary/30 bg-primary/5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Truck size={18} className="text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-foreground">Informasi Pengiriman</p>
                            <p className="text-xs text-muted-foreground">Dikirim dengan <span className="font-semibold text-foreground">{order.courier}</span></p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-secondary rounded-lg p-3 border border-border">
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">No. Resi / Link Tracking</p>
                            <p className="text-sm font-mono font-semibold text-foreground truncate">{order.tracking_number}</p>
                        </div>
                        <button
                            onClick={() => { navigator.clipboard.writeText(order.tracking_number!); toast.success('Copied!'); }}
                            className="btn-ghost btn-icon shrink-0"
                            title="Copy"
                        >
                            <Copy size={14} />
                        </button>
                        <a
                            href={getTrackingUrl(order.tracking_number)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1 shrink-0"
                        >
                            Lacak <ExternalLink size={12} />
                        </a>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Customer */}
                <div className="card space-y-3">
                    <p className="text-sm font-semibold text-foreground border-b border-border pb-2">Customer</p>
                    <div className="text-sm space-y-1">
                        <p className="font-medium text-foreground">{profile?.full_name ?? 'Unknown'}</p>
                        <p className="text-muted-foreground">{profile?.phone_number ?? '—'}</p>
                    </div>
                    <Link to={`/users/${order.user_id}`} className="flex items-center gap-1 text-xs text-primary hover:underline">
                        View Profile <ExternalLink size={10} />
                    </Link>
                </div>

                {/* Shipping */}
                <div className="card space-y-3">
                    <p className="text-sm font-semibold text-foreground border-b border-border pb-2">Shipping Address</p>
                    <p className="text-sm text-muted-foreground">{order.shipping_address || 'No address provided'}</p>
                </div>
            </div>

            {/* Payment Proof */}
            {order.payment_proof_url && (
                <div className="card space-y-3">
                    <p className="text-sm font-semibold text-foreground border-b border-border pb-2">Payment Proof</p>
                    <a href={order.payment_proof_url} target="_blank" rel="noopener noreferrer">
                        <img src={order.payment_proof_url} alt="Payment proof"
                            className="max-h-64 rounded-lg object-contain border border-border hover:opacity-90 transition-opacity" />
                    </a>
                </div>
            )}

            {/* Order Items */}
            <div className="card space-y-3">
                <p className="text-sm font-semibold text-foreground border-b border-border pb-2">
                    Items ({items.length})
                </p>
                <div className="space-y-3">
                    {items.map(item => (
                        <div key={item.id} className="flex items-center gap-3">
                            {item.product?.images?.[0] && (
                                <img src={item.product.images[0]} alt={item.product.name}
                                    className="w-12 h-12 rounded-md object-cover border border-border shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{item.product?.name ?? 'Unknown'}</p>
                                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                            <p className="text-sm font-semibold text-foreground shrink-0">{formatCurrency(item.price_at_purchase * item.quantity)}</p>
                        </div>
                    ))}
                    <div className="border-t border-border pt-3 flex justify-between">
                        <span className="font-semibold text-sm text-foreground">Total</span>
                        <span className="font-bold text-foreground">{formatCurrency(order.total_amount)}</span>
                    </div>
                </div>
            </div>

            {/* Ship Order Modal */}
            <ShipOrderModal
                open={shipModalOpen}
                onClose={() => setShipModalOpen(false)}
                onSubmit={handleShipSubmit}
                isLoading={isUpdating}
                orderId={order.id}
            />
        </div>
    );
}
