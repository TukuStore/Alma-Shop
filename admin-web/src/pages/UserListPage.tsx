import { Eye, Search, ShieldCheck, ShieldX } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { cn, formatDateShort } from '../lib/utils';
import { getUsers, updateUserRole } from '../services/userService';
import type { UserProfile } from '../types';

export default function UserListPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'customer'>('all');
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const limit = 20;

    const load = useCallback(async () => {
        setIsLoading(true);
        const { data, count } = await getUsers({
            search, role: roleFilter === 'all' ? undefined : roleFilter, page, limit
        });
        setUsers(data); setTotal(count);
        setIsLoading(false);
    }, [search, roleFilter, page]);

    useEffect(() => { load(); }, [load]);

    const handleRoleToggle = async (u: UserProfile) => {
        const newRole = u.role === 'admin' ? 'customer' : 'admin';
        if (!confirm(`Change ${u.full_name}'s role to "${newRole}"?`)) return;
        await updateUserRole(u.user_id, newRole);
        toast.success(`Role updated to ${newRole}`);
        setUsers(prev => prev.map(x => x.user_id === u.user_id ? { ...x, role: newRole } : x));
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-5">
            <h1 className="page-header">Users <span className="text-muted-foreground text-lg font-normal">({total})</span></h1>
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                        className="input pl-9" placeholder="Search by name..." />
                </div>
                <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value as any); setPage(1); }} className="select w-auto">
                    <option value="all">All Roles</option>
                    <option value="customer">Customers</option>
                    <option value="admin">Admins</option>
                </select>
            </div>
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr><th>User</th><th>Username</th><th>Phone</th><th>Role</th><th>Joined</th><th className="text-right">Actions</th></tr>
                    </thead>
                    <tbody>
                        {isLoading && <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">Loading...</td></tr>}
                        {!isLoading && users.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No users found.</td></tr>}
                        {users.map(u => (
                            <tr key={u.user_id}>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                                            {u.avatar_url
                                                ? <img src={u.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                                : <span className="text-primary text-xs font-bold">{u.full_name?.charAt(0) ?? '?'}</span>
                                            }
                                        </div>
                                        <p className="text-sm font-medium text-foreground">{u.full_name}</p>
                                    </div>
                                </td>
                                <td><span className="text-sm text-muted-foreground">@{u.username ?? '—'}</span></td>
                                <td><span className="text-sm text-muted-foreground">{u.phone_number ?? '—'}</span></td>
                                <td>
                                    <span className={cn('badge', u.role === 'admin'
                                        ? 'bg-primary/20 text-primary border-primary/30'
                                        : 'bg-secondary text-muted-foreground border-border')}>
                                        {u.role}
                                    </span>
                                </td>
                                <td><span className="text-xs text-muted-foreground">{formatDateShort(u.created_at)}</span></td>
                                <td>
                                    <div className="flex items-center gap-1 justify-end">
                                        <button onClick={() => handleRoleToggle(u)} className="btn-ghost btn-icon"
                                            title={u.role === 'admin' ? 'Revoke admin' : 'Make admin'}>
                                            {u.role === 'admin'
                                                ? <ShieldX size={15} className="text-destructive/70" />
                                                : <ShieldCheck size={15} className="text-muted-foreground" />}
                                        </button>
                                        <Link to={`/users/${u.user_id}`} className="btn-ghost btn-icon" title="View details">
                                            <Eye size={15} />
                                        </Link>
                                    </div>
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
