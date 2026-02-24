import { AlertTriangle, Edit, Eye, EyeOff, Plus, Search, Star, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { cn, formatCurrency, formatDateShort } from '../lib/utils';
import { getCategories } from '../services/categoryService';
import { deleteAllProducts, deleteProduct, getProducts, updateProduct } from '../services/productService';
import type { Category, Product } from '../types';

export default function ProductListPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isDeletingAll, setIsDeletingAll] = useState(false);
    const limit = 20;

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data, count } = await getProducts({ search, category_id: categoryId || undefined, page, limit });
            setProducts(data); setTotal(count);
        } finally { setIsLoading(false); }
    }, [search, categoryId, page]);

    useEffect(() => { getCategories().then(setCategories); }, []);
    useEffect(() => { load(); }, [load]);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete "${name}"? This action cannot be undone.`)) return;
        try {
            await deleteProduct(id);
            toast.success('Product deleted successfully');
            load();
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete product');
            console.error(error);
        }
    };

    const handleDeleteAll = async () => {
        if (total === 0) {
            toast.error('No products to delete');
            return;
        }

        const confirmed = confirm(
            `Are you sure you want to delete ALL ${total} products? This action cannot be undone.\n\nType "DELETE ALL" to confirm.`
        );

        if (!confirmed) return;

        // Double confirmation
        const doubleConfirm = prompt('Type "DELETE ALL" to confirm:');
        if (doubleConfirm !== 'DELETE ALL') {
            toast.error('Deletion cancelled');
            return;
        }

        setIsDeletingAll(true);
        try {
            await deleteAllProducts();
            toast.success(`Successfully deleted all ${total} products`);
            setSearch('');
            setCategoryId('');
            setPage(1);
            load();
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete all products');
            console.error(error);
        } finally {
            setIsDeletingAll(false);
        }
    };

    const toggleActive = async (p: Product) => {
        await updateProduct(p.id, { is_active: !p.is_active });
        toast.success(`Product ${!p.is_active ? 'activated' : 'deactivated'}`);
        load();
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h1 className="page-header mb-0">Products <span className="text-muted-foreground text-lg font-normal">({total})</span></h1>
                <div className="flex items-center gap-2">
                    {total > 0 && (
                        <button
                            onClick={handleDeleteAll}
                            disabled={isDeletingAll || isLoading}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-destructive/30 text-destructive bg-destructive/10 hover:bg-destructive/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isDeletingAll ? (
                                <>
                                    <AlertTriangle size={16} className="animate-pulse" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 size={16} />
                                    Delete All Products
                                </>
                            )}
                        </button>
                    )}
                    <Link to="/products/new" className="btn-primary">
                        <Plus size={16} /> New Product
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                        className="input pl-9" placeholder="Search products..." />
                </div>
                <select value={categoryId} onChange={e => { setCategoryId(e.target.value); setPage(1); }} className="select w-auto">
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>

            {/* Table */}
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading && (
                            <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">Loading...</td></tr>
                        )}
                        {!isLoading && products.length === 0 && (
                            <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">No products found.</td></tr>
                        )}
                        {products.map(p => (
                            <tr key={p.id}>
                                <td>
                                    <div className="flex items-center gap-3">
                                        {p.images?.[0]
                                            ? <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-md object-cover border border-border shrink-0" />
                                            : <div className="w-10 h-10 rounded-md bg-secondary border border-border shrink-0" />
                                        }
                                        <div>
                                            <p className="font-medium text-foreground text-sm leading-tight">{p.name}</p>
                                            {p.is_featured && (
                                                <span className="flex items-center gap-1 text-[10px] text-accent">
                                                    <Star size={10} fill="currentColor" /> Featured
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td><span className="text-sm text-muted-foreground">{p.category?.name ?? '—'}</span></td>
                                <td>
                                    <p className="text-sm font-medium text-foreground">{formatCurrency(p.price)}</p>
                                    {p.original_price && (
                                        <p className="text-[10px] text-muted-foreground line-through">{formatCurrency(p.original_price)}</p>
                                    )}
                                </td>
                                <td>
                                    <span className={cn('text-sm font-semibold', p.stock === 0 ? 'text-red-400' : p.stock < 10 ? 'text-orange-400' : 'text-green-400')}>
                                        {p.stock}
                                    </span>
                                </td>
                                <td>
                                    <span className={cn('badge', p.is_active ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30')}>
                                        {p.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td><span className="text-xs text-muted-foreground">{formatDateShort(p.created_at)}</span></td>
                                <td>
                                    <div className="flex items-center gap-1 justify-end">
                                        <button onClick={() => toggleActive(p)} className="btn-ghost btn-icon" title={p.is_active ? 'Deactivate' : 'Activate'}>
                                            {p.is_active ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                        <Link to={`/products/${p.id}/edit`} className="btn-ghost btn-icon" title="Edit">
                                            <Edit size={15} />
                                        </Link>
                                        <button onClick={() => handleDelete(p.id, p.name)} className="btn-ghost btn-icon text-destructive/70 hover:text-destructive" title="Delete">
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
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
