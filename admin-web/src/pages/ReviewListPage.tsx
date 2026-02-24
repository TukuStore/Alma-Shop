import { Star, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { cn, formatDate } from '../lib/utils';
import { deleteReview, getAllReviews } from '../services/reviewService';
import type { Review } from '../types';

export default function ReviewListPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [total, setTotal] = useState(0);
    const [ratingFilter, setRatingFilter] = useState<number | undefined>();
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const limit = 20;

    const load = useCallback(async () => {
        setIsLoading(true);
        const { data, count } = await getAllReviews({ rating: ratingFilter, page, limit });
        setReviews(data); setTotal(count);
        setIsLoading(false);
    }, [ratingFilter, page]);

    useEffect(() => { load(); }, [load]);

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this review?')) return;
        await deleteReview(id);
        toast.success('Review deleted');
        setReviews(r => r.filter(x => x.id !== id));
        setTotal(t => t - 1);
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-5">
            <h1 className="page-header">Reviews <span className="text-muted-foreground text-lg font-normal">({total})</span></h1>
            <div className="flex gap-2">
                {[undefined, 5, 4, 3, 2, 1].map(r => (
                    <button key={String(r)} onClick={() => { setRatingFilter(r); setPage(1); }}
                        className={cn('px-3 py-1.5 text-xs rounded-md font-medium transition-colors',
                            ratingFilter === r ? 'bg-primary/20 text-primary border border-primary/30' : 'btn-secondary')}>
                        {r === undefined ? 'All Stars' : `${r} ★`}
                    </button>
                ))}
            </div>
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr><th>Customer</th><th>Product</th><th>Rating</th><th>Comment</th><th>Date</th><th className="text-right">Actions</th></tr>
                    </thead>
                    <tbody>
                        {isLoading && <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">Loading...</td></tr>}
                        {!isLoading && reviews.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No reviews found.</td></tr>}
                        {reviews.map(r => (
                            <tr key={r.id}>
                                <td><p className="text-sm text-foreground">{r.profile?.full_name ?? 'Unknown'}</p></td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        {(r as any).product?.images?.[0] && (
                                            <img src={(r as any).product.images[0]} alt="" className="w-8 h-8 rounded object-cover border border-border" />
                                        )}
                                        <p className="text-sm text-muted-foreground truncate max-w-[140px]">{(r as any).product?.name ?? '—'}</p>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={12} className={i < r.rating ? 'text-accent fill-accent' : 'text-border'} />
                                        ))}
                                    </div>
                                </td>
                                <td><p className="text-sm text-muted-foreground max-w-[200px] truncate">{r.comment}</p></td>
                                <td><span className="text-xs text-muted-foreground">{formatDate(r.created_at)}</span></td>
                                <td className="text-right">
                                    <button onClick={() => handleDelete(r.id)} className="btn-ghost btn-icon text-destructive/70 hover:text-destructive"><Trash2 size={15} /></button>
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
