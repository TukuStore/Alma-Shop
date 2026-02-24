import {
    ArrowLeft,
    Calendar,
    Loader2, Package,
    Phone,
    ShieldCheck, ShieldX,
    ShoppingBag,
    Star,
    User,
    Wallet,
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { cn, formatCurrency, formatDate } from '../lib/utils';
import {
    getUserById,
    getUserOrderCount,
    getUserWalletBalance,
    updateUserRole,
} from '../services/userService';
import type { Order, UserProfile } from '../types';

/* ── helpers ──────────────────────────────────────── */
const statusColors: Record<string, string> = {
    pending: 'badge-pending',
    paid: 'badge-paid',
    processing: 'badge-processing',
    shipped: 'badge-shipped',
    completed: 'badge-completed',
    cancelled: 'badge-cancelled',
    return_requested: 'badge-return_requested',
    returned: 'badge-returned',
};

/* ── mini stat card ───────────────────────────────── */
function StatCard({ icon: Icon, label, value, color }: {
    icon: React.ElementType; label: string; value: string | number; color: string;
}) {
    return (
        <div className="card flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                <Icon size={20} />
            </div>
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-lg font-bold text-foreground">{value}</p>
            </div>
        </div>
    );
}

/* ── main component ───────────────────────────────── */
export default function UserDetailPage() {
    const { id } = useParams<{ id: string }>();

    const [user, setUser] = useState<UserProfile | null>(null);
    const [wallet, setWallet] = useState(0);
    const [rewardPoints, setRewardPoints] = useState(0);
    const [orderCount, setOrderCount] = useState(0);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [roleLoading, setRoleLoading] = useState(false);

    const load = useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const [profile, walletBal, ordCount] = await Promise.all([
                getUserById(id),
                getUserWalletBalance(id),
                getUserOrderCount(id),
            ]);
            setUser(profile);
            setWallet(walletBal);
            setOrderCount(ordCount);

            // Fetch reward points
            const { data: rp } = await supabase
                .from('reward_points')
                .select('points')
                .eq('user_id', id)
                .maybeSingle();
            setRewardPoints(rp?.points ?? 0);

            // Fetch recent orders (last 10)
            const { data: orderData } = await supabase
                .from('orders')
                .select('id, total_amount, status, created_at, shipping_address')
                .eq('user_id', id)
                .order('created_at', { ascending: false })
                .limit(10);
            setOrders((orderData as Order[]) ?? []);
        } catch (err) {
            toast.error('Failed to load user details');
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => { load(); }, [load]);

    const handleRoleToggle = async () => {
        if (!user) return;
        const newRole = user.role === 'admin' ? 'customer' : 'admin';
        if (!confirm(`Change ${user.full_name}'s role to "${newRole}"?`)) return;
        setRoleLoading(true);
        try {
            await updateUserRole(user.user_id, newRole);
            setUser(u => u ? { ...u, role: newRole } : u);
            toast.success(`Role updated to ${newRole}`);
        } catch {
            toast.error('Failed to update role');
        } finally {
            setRoleLoading(false);
        }
    };

    /* ── loading state ── */
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={32} className="animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <p className="text-muted-foreground">User not found.</p>
                <Link to="/users" className="btn-secondary">Back to Users</Link>
            </div>
        );
    }

    const initials = user.full_name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() ?? '?';

    return (
        <div className="space-y-6 max-w-5xl">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Link to="/users" className="btn-ghost btn-icon"><ArrowLeft size={18} /></Link>
                <h1 className="page-header mb-0">User Detail</h1>
            </div>

            {/* Profile Card */}
            <div className="card">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                        {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.full_name}
                                className="w-20 h-20 rounded-2xl object-cover border-2 border-border" />
                        ) : (
                            <div className="w-20 h-20 rounded-2xl bg-primary/20 border-2 border-primary/30 flex items-center justify-center">
                                <span className="text-2xl font-bold text-primary">{initials}</span>
                            </div>
                        )}
                        <span className={cn(
                            'absolute -bottom-1.5 -right-1.5 badge text-[10px] px-1.5 py-0.5',
                            user.role === 'admin'
                                ? 'bg-primary/20 text-primary border-primary/30'
                                : 'bg-secondary text-muted-foreground border-border',
                        )}>
                            {user.role}
                        </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold text-foreground">{user.full_name}</h2>
                        {user.username && (
                            <p className="text-sm text-muted-foreground">@{user.username}</p>
                        )}
                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
                            {user.phone_number && (
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <Phone size={13} /> {user.phone_number}
                                </div>
                            )}
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Calendar size={13} /> Joined {formatDate(user.created_at)}
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <User size={13} /> {user.user_id.slice(0, 8).toUpperCase()}
                            </div>
                        </div>
                    </div>

                    {/* Role toggle */}
                    <button
                        onClick={handleRoleToggle}
                        disabled={roleLoading}
                        className={cn(
                            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all shrink-0',
                            user.role === 'admin'
                                ? 'bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20'
                                : 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20',
                        )}
                    >
                        {roleLoading
                            ? <Loader2 size={14} className="animate-spin" />
                            : user.role === 'admin' ? <ShieldX size={14} /> : <ShieldCheck size={14} />}
                        {user.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                    icon={Wallet}
                    label="Wallet Balance"
                    value={formatCurrency(wallet)}
                    color="bg-emerald-500/15 text-emerald-400"
                />
                <StatCard
                    icon={Star}
                    label="Reward Points"
                    value={`${rewardPoints.toLocaleString('id-ID')} pts`}
                    color="bg-accent/15 text-accent"
                />
                <StatCard
                    icon={ShoppingBag}
                    label="Total Orders"
                    value={orderCount}
                    color="bg-primary/15 text-primary"
                />
            </div>

            {/* Order History */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                        <Package size={16} className="text-primary" />
                        Order History
                        <span className="text-xs text-muted-foreground font-normal">(last 10)</span>
                    </h2>
                    <Link
                        to={`/orders?user=${id}`}
                        className="text-xs text-primary hover:underline"
                    >
                        View all orders →
                    </Link>
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Date</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-muted-foreground">
                                        No orders yet.
                                    </td>
                                </tr>
                            )}
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td>
                                        <span className="font-mono text-xs text-muted-foreground">
                                            #{order.id.slice(0, 8).toUpperCase()}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="text-sm text-muted-foreground">
                                            {formatDate(order.created_at)}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="text-sm font-medium text-foreground">
                                            {formatCurrency(order.total_amount)}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${statusColors[order.status] ?? 'badge-pending'} capitalize`}>
                                            {order.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="text-right">
                                        <Link
                                            to={`/orders/${order.id}`}
                                            className="text-xs text-primary hover:underline"
                                        >
                                            View →
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
