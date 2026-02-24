import { Eye, Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cn, formatCurrency, formatDate } from '../lib/utils';
import { getAllOrders } from '../services/orderService';
import type { Order, OrderStatus } from '../types';

const TABS: { label: string; value: OrderStatus | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Paid', value: 'paid' },
    { label: 'Processing', value: 'processing' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
    { label: 'Returns', value: 'return_requested' },
];

export default function OrderListPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [total, setTotal] = useState(0);
    const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('all');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const limit = 20;

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data, count } = await getAllOrders({ status: activeTab, search, page, limit });
            setOrders(data); setTotal(count);
        } finally { setIsLoading(false); }
    }, [activeTab, search, page]);

    useEffect(() => { load(); }, [load]);

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-5">
            <h1 className="page-header">Orders <span className="text-muted-foreground text-lg font-normal">({total})</span></h1>

            {/* Status Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1">
                {TABS.map(tab => (
                    <button key={tab.value}
                        onClick={() => { setActiveTab(tab.value); setPage(1); }}
                        className={cn(
                            'px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors',
                            activeTab === tab.value
                                ? 'bg-primary/20 text-primary border border-primary/30'
                                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                        )}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                    className="input pl-9" placeholder="Search by Order ID..." />
            </div>

            {/* Table */}
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading && (
                            <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">Loading...</td></tr>
                        )}
                        {!isLoading && orders.length === 0 && (
                            <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No orders found.</td></tr>
                        )}
                        {orders.map(o => (
                            <tr key={o.id}>
                                <td><span className="font-mono text-xs text-muted-foreground">#{o.id.slice(0, 8).toUpperCase()}</span></td>
                                <td>
                                    <p className="text-sm text-foreground">{(o as any).profile?.full_name ?? 'Unknown'}</p>
                                    <p className="text-[10px] text-muted-foreground">{(o as any).profile?.phone_number ?? ''}</p>
                                </td>
                                <td><span className="font-semibold text-sm">{formatCurrency(o.total_amount)}</span></td>
                                <td><span className={`badge badge-${o.status}`}>{o.status.replace('_', ' ')}</span></td>
                                <td><span className="text-xs text-muted-foreground">{formatDate(o.created_at)}</span></td>
                                <td className="text-right">
                                    <Link to={`/orders/${o.id}`} className="btn-ghost btn-icon" title="View Details">
                                        <Eye size={15} />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between text-sm">
                    <p className="text-muted-foreground">Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}</p>
                    <div className="flex gap-2">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-3 py-1.5 text-xs">Prev</button>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary px-3 py-1.5 text-xs">Next</button>
                    </div>
                </div>
            )}
        </div>
    );
}
