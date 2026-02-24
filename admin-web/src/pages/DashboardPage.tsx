import {
    AlertTriangle,
    Clock,
    DollarSign,
    Package,
    ShoppingCart,
    TrendingDown,
    TrendingUp,
    Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    CartesianGrid,
    Cell, Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis, YAxis
} from 'recharts';
import { cn, formatCurrency } from '../lib/utils';
import {
    getDashboardStats,
    getLowStockProducts,
    getOrdersByStatus,
    getRecentOrders,
    getRevenueChart
} from '../services/dashboardService';
import type { DashboardStats, RevenuePoint } from '../types';

const STATUS_COLORS: Record<string, string> = {
    pending: '#FBBF24', paid: '#3B82F6', processing: '#A855F7',
    shipped: '#06B6D4', completed: '#10B981', cancelled: '#EF4444',
    return_requested: '#F97316', returned: '#64748B',
};

function StatCard({ title, value, prefix, change, icon: Icon, bgGradient, shadowColor }: {
    title: string; value: number; prefix?: string; change?: number; icon: React.ElementType; bgGradient: string; shadowColor: string;
}) {
    const isPositive = (change ?? 0) >= 0;
    return (
        <div className={cn("rounded-2xl p-5 flex flex-col gap-2 transition-all hover:-translate-y-1 relative overflow-hidden", bgGradient)} style={{ boxShadow: `0 10px 20px -5px ${shadowColor}` }}>
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <Icon size={16} className="text-white" />
                    </div>
                    <p className="text-sm font-medium text-white/90">{title}</p>
                </div>
            </div>
            <div className="relative z-10 mt-2">
                <p className="text-3xl font-bold text-white tracking-tight">
                    {prefix && <span className="text-lg font-normal text-white/80 mr-1">{prefix}</span>}
                    {typeof value === 'number' && value > 999
                        ? value.toLocaleString('id-ID')
                        : value}
                </p>
                {change !== undefined && (
                    <div className="flex items-center gap-1.5 text-xs mt-2 font-medium text-white/90 bg-white/10 w-fit px-2 py-1 rounded-full backdrop-blur-sm">
                        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {Math.abs(change)}% vs last month
                    </div>
                )}
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
    const [ordersByStatus, setOrdersByStatus] = useState<{ status: string; count: number }[]>([]);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [lowStock, setLowStock] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            getDashboardStats(),
            getRevenueChart(14),
            getOrdersByStatus(),
            getRecentOrders(5),
            getLowStockProducts(10),
        ]).then(([s, r, obs, ro, ls]) => {
            setStats(s); setRevenue(r); setOrdersByStatus(obs);
            setRecentOrders(ro); setLowStock(ls);
        }).finally(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 animate-pulse">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-28 rounded-lg bg-card border border-border" />
                ))}
                <div className="col-span-full h-64 rounded-lg bg-card border border-border" />
            </div>
        );
    }

    const revenueFormatted = revenue.map(r => ({
        ...r,
        date: new Date(r.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
    }));

    return (
        <div className="space-y-8 p-2">
            <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard Overview</h1>
                <p className="text-sm text-muted-foreground mt-1">Here is the latest data about your store.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard title="Total Revenue" value={stats?.totalRevenue ?? 0}
                    prefix="Rp" change={stats?.revenueChange} icon={DollarSign}
                    bgGradient="bg-gradient-to-br from-[#FE8288] to-[#FC3C43]" shadowColor="rgba(252,60,67,0.3)" />
                <StatCard title="Total Orders" value={stats?.totalOrders ?? 0}
                    change={stats?.ordersChange} icon={ShoppingCart}
                    bgGradient="bg-gradient-to-br from-[#41D5B8] to-[#04C99A]" shadowColor="rgba(4,201,154,0.3)" />
                <StatCard title="Active Products" value={stats?.totalProducts ?? 0}
                    icon={Package}
                    bgGradient="bg-gradient-to-br from-[#A588FF] to-[#6A3FE6]" shadowColor="rgba(106,63,230,0.3)" />
                <StatCard title="Total Customers" value={stats?.totalUsers ?? 0}
                    icon={Users}
                    bgGradient="bg-gradient-to-br from-[#FBD14B] to-[#F1A21A]" shadowColor="rgba(241,162,26,0.3)" />
            </div>

            {/* Alert banners */}
            {(stats?.pendingOrders ?? 0) > 0 && (
                <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <Clock size={18} className="text-yellow-400 shrink-0" />
                    <p className="text-sm text-yellow-300">
                        <span className="font-semibold">{stats?.pendingOrders}</span> orders are awaiting payment confirmation.{' '}
                        <Link to="/orders?status=pending" className="underline hover:text-yellow-200">View orders →</Link>
                    </p>
                </div>
            )}
            {(stats?.returnRequests ?? 0) > 0 && (
                <div className="flex items-center gap-3 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <AlertTriangle size={18} className="text-orange-400 shrink-0" />
                    <p className="text-sm text-orange-300">
                        <span className="font-semibold">{stats?.returnRequests}</span> pending return requests need your attention.{' '}
                        <Link to="/returns" className="underline hover:text-orange-200">Manage returns →</Link>
                    </p>
                </div>
            )}

            {/* Charts row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Revenue chart */}
                <div className="card xl:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-lg font-bold text-foreground tracking-tight">Revenue Analytics</p>
                        <select className="bg-background border border-border text-xs rounded-full px-3 py-1 text-muted-foreground outline-none cursor-pointer">
                            <option>Last 14 Days</option>
                        </select>
                    </div>
                    <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={revenueFormatted} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#A3AED0' }} dy={10} />
                            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#A3AED0' }}
                                tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
                            <Tooltip
                                contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}
                                labelStyle={{ color: '#2B3674', fontWeight: 'bold', marginBottom: 4 }}
                                formatter={(v: any) => [<span className="font-semibold text-primary">{formatCurrency(v)}</span>, 'Revenue']}
                            />
                            <Line type="monotone" dataKey="revenue" stroke="#4318FF"
                                strokeWidth={4} dot={false} activeDot={{ r: 6, strokeWidth: 0, fill: '#4318FF' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Orders by status pie */}
                <div className="card flex flex-col items-center justify-center">
                    <p className="text-lg font-bold text-foreground tracking-tight w-full mb-2">Orders Status</p>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={ordersByStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={2} cornerRadius={4}>
                                {ordersByStatus.map(entry => (
                                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? '#A3AED0'} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ background: '#FFFFFF', border: 'none', borderRadius: 12, boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}
                                itemStyle={{ fontWeight: 'bold' }}
                            />
                            <Legend iconType="circle" iconSize={6}
                                formatter={v => <span style={{ fontSize: 12, color: '#A3AED0', fontWeight: 500 }} className="capitalize ml-1">{v.replace('_', ' ')}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bottom row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-lg font-bold text-foreground tracking-tight">Recent Orders</p>
                        <Link to="/orders" className="text-sm font-semibold text-primary hover:underline">View all</Link>
                    </div>
                    <div className="space-y-1 mt-2">
                        {recentOrders.length === 0 && <p className="text-sm text-muted-foreground p-4 text-center">No orders yet.</p>}
                        {recentOrders.map((o: any) => (
                            <Link to={`/orders/${o.id}`} key={o.id}
                                className="flex items-center justify-between px-2 py-3.5 border-b border-border/50 last:border-0 hover:bg-slate-50 transition-colors group">
                                <div>
                                    <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{o.profile?.full_name ?? 'Unknown'}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{o.id.slice(0, 8)}...</p>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1.5">
                                    <p className="text-sm font-bold text-foreground">{formatCurrency(o.total_amount)}</p>
                                    <span className={`badge badge-${o.status} text-[10px] px-2 py-0.5 capitalize`}>{o.status.replace('_', ' ')}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Low Stock */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-lg font-bold text-foreground tracking-tight">Low Stock Alert</p>
                        <Link to="/products" className="text-sm font-semibold text-primary hover:underline">View all</Link>
                    </div>
                    <div className="space-y-1 mt-2">
                        {lowStock.length === 0 && <p className="text-sm text-muted-foreground p-4 text-center">All products are well stocked.</p>}
                        {lowStock.map((p: any) => (
                            <Link to={`/products/${p.id}/edit`} key={p.id}
                                className="flex items-center gap-4 px-2 py-3.5 border-b border-border/50 last:border-0 hover:bg-slate-50 transition-colors group">
                                {p.images?.[0] && (
                                    <img src={p.images[0]} alt={p.name}
                                        className="w-10 h-10 rounded-xl object-cover border border-border shrink-0 shadow-sm" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">{p.name}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{p.category?.name}</p>
                                </div>
                                <span className={cn(
                                    'text-xs font-bold px-3 py-1 rounded-full',
                                    p.stock === 0 ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'
                                )}>
                                    {p.stock === 0 ? 'Out of Stock' : `${p.stock} left`}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
