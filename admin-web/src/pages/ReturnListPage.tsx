import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { cn, formatDate } from '../lib/utils';
import { getReturns, updateReturnStatus } from '../services/returnService';
import type { ReturnRequest } from '../types';

const STATUSES: (ReturnRequest['status'] | 'all')[] = ['all', 'pending', 'approved', 'rejected', 'completed'];

export default function ReturnListPage() {
    const [returns, setReturns] = useState<ReturnRequest[]>([]);
    const [total, setTotal] = useState(0);
    const [activeTab, setActiveTab] = useState<ReturnRequest['status'] | 'all'>('all');
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const limit = 20;

    const load = useCallback(async () => {
        setIsLoading(true);
        const { data, count } = await getReturns({ status: activeTab, page, limit });
        setReturns(data); setTotal(count);
        setIsLoading(false);
    }, [activeTab, page]);

    useEffect(() => { load(); }, [load]);

    const handleStatus = async (id: string, status: ReturnRequest['status']) => {
        await updateReturnStatus(id, status);
        toast.success(`Return ${status}`);
        setReturns(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    };

    const totalPages = Math.ceil(total / limit);
    const statusColors: Record<string, string> = {
        pending: 'badge-pending', approved: 'bg-green-500/20 text-green-400 border-green-500/30',
        rejected: 'badge-cancelled', completed: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    };

    return (
        <div className="space-y-5">
            <h1 className="page-header">Return Requests <span className="text-muted-foreground text-lg font-normal">({total})</span></h1>
            <div className="flex gap-1">
                {STATUSES.map(s => (
                    <button key={s} onClick={() => { setActiveTab(s); setPage(1); }}
                        className={cn('px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors',
                            activeTab === s ? 'bg-primary/20 text-primary border border-primary/30' : 'text-muted-foreground hover:text-foreground hover:bg-secondary')}>
                        {s}
                    </button>
                ))}
            </div>
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr><th>Order ID</th><th>Customer</th><th>Reason</th><th>Status</th><th>Date</th><th className="text-right">Actions</th></tr>
                    </thead>
                    <tbody>
                        {isLoading && <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">Loading...</td></tr>}
                        {!isLoading && returns.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No return requests.</td></tr>}
                        {returns.map(r => (
                            <tr key={r.id}>
                                <td><span className="font-mono text-xs text-muted-foreground">#{r.order_id.slice(0, 8).toUpperCase()}</span></td>
                                <td><p className="text-sm text-foreground">{r.profile?.full_name ?? 'Unknown'}</p></td>
                                <td>
                                    <p className="text-sm font-medium text-foreground">{r.reason}</p>
                                    <p className="text-xs text-muted-foreground truncate max-w-[160px]">{r.description}</p>
                                </td>
                                <td><span className={`badge ${statusColors[r.status] ?? 'badge-pending'} capitalize`}>{r.status}</span></td>
                                <td><span className="text-xs text-muted-foreground">{formatDate(r.created_at)}</span></td>
                                <td className="text-right">
                                    {r.status === 'pending' && (
                                        <div className="flex gap-1 justify-end">
                                            <button onClick={() => handleStatus(r.id, 'approved')}
                                                className="px-2 py-1 text-xs rounded bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 font-medium">
                                                Approve
                                            </button>
                                            <button onClick={() => handleStatus(r.id, 'rejected')}
                                                className="px-2 py-1 text-xs rounded bg-destructive/20 text-destructive border border-destructive/30 hover:bg-destructive/30 font-medium">
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                    {r.status === 'approved' && (
                                        <button onClick={() => handleStatus(r.id, 'completed')}
                                            className="px-2 py-1 text-xs rounded bg-slate-500/20 text-slate-400 border border-slate-500/30 hover:bg-slate-500/30 font-medium">
                                            Complete
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <div className="flex items-center justify-between text-sm">
                    <p className="text-muted-foreground">Page {page} of {totalPages}</p>
                    <div className="flex gap-2">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-3 py-1.5 text-xs">Prev</button>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary px-3 py-1.5 text-xs">Next</button>
                    </div>
                </div>
            )}
        </div>
    );
}
