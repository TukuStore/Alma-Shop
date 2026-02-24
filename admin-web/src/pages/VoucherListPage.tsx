import { Edit, Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { cn, formatCurrency, formatDateShort } from '../lib/utils';
import { deleteVoucher, getVouchers, toggleVoucherActive } from '../services/voucherService';
import type { Voucher } from '../types';

export default function VoucherListPage() {
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const load = useCallback(() => {
        getVouchers().then(setVouchers).finally(() => setIsLoading(false));
    }, []);

    useEffect(() => { load(); }, []);

    const handleDelete = async (id: string, code: string) => {
        if (!confirm(`Delete voucher "${code}"?`)) return;
        await deleteVoucher(id);
        toast.success('Voucher deleted');
        setVouchers(v => v.filter(x => x.id !== id));
    };

    const handleToggle = async (v: Voucher) => {
        await toggleVoucherActive(v.id, !v.is_active);
        toast.success(`Voucher ${!v.is_active ? 'activated' : 'deactivated'}`);
        setVouchers(prev => prev.map(x => x.id === v.id ? { ...x, is_active: !v.is_active } : x));
    };

    const isExpired = (v: Voucher) => v.end_date ? new Date(v.end_date) < new Date() : false;

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h1 className="page-header mb-0">Vouchers</h1>
                <Link to="/vouchers/new" className="btn-primary"><Plus size={16} /> New Voucher</Link>
            </div>
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Name</th>
                            <th>Discount</th>
                            <th>Min Purchase</th>
                            <th>Validity</th>
                            <th>Status</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading && <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">Loading...</td></tr>}
                        {!isLoading && vouchers.length === 0 && <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">No vouchers created yet.</td></tr>}
                        {vouchers.map(v => (
                            <tr key={v.id}>
                                <td><span className="font-mono text-sm font-bold text-primary">{v.code}</span></td>
                                <td><p className="text-sm text-foreground">{v.name}</p></td>
                                <td>
                                    <p className="text-sm font-semibold text-foreground">
                                        {v.discount_type === 'percentage' ? `${v.discount_value}%` : formatCurrency(v.discount_value)}
                                    </p>
                                    {v.max_discount && v.discount_type === 'percentage' && (
                                        <p className="text-[10px] text-muted-foreground">max {formatCurrency(v.max_discount)}</p>
                                    )}
                                </td>
                                <td><span className="text-sm text-muted-foreground">{formatCurrency(v.min_purchase)}</span></td>
                                <td>
                                    <p className="text-xs text-muted-foreground">{v.start_date ? formatDateShort(v.start_date) : '—'}</p>
                                    <p className={cn('text-xs', isExpired(v) ? 'text-red-400' : 'text-muted-foreground')}>
                                        → {v.end_date ? formatDateShort(v.end_date) : 'No expiry'}
                                        {isExpired(v) && ' (expired)'}
                                    </p>
                                </td>
                                <td>
                                    <span className={cn('badge', v.is_active ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30')}>
                                        {v.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>
                                    <div className="flex items-center gap-1 justify-end">
                                        <button onClick={() => handleToggle(v)} className="btn-ghost btn-icon" title="Toggle active">
                                            {v.is_active ? <ToggleRight size={17} className="text-green-400" /> : <ToggleLeft size={17} />}
                                        </button>
                                        <Link to={`/vouchers/${v.id}/edit`} className="btn-ghost btn-icon"><Edit size={15} /></Link>
                                        <button onClick={() => handleDelete(v.id, v.code)} className="btn-ghost btn-icon text-destructive/70 hover:text-destructive"><Trash2 size={15} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
