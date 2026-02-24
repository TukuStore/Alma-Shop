import { Edit, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { cn, formatDateShort } from '../lib/utils';
import { deleteHeroSlider, getHeroSliders, updateHeroSlider } from '../services/heroSliderService';
import type { HeroSlider } from '../types';

export default function HeroSliderListPage() {
    const [sliders, setSliders] = useState<HeroSlider[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const load = async () => {
        setIsLoading(true);
        try {
            const data = await getHeroSliders();
            setSliders(data);
        } catch (error) {
            toast.error('Failed to load hero sliders');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Delete "${title}"? This action cannot be undone.`)) return;
        try {
            await deleteHeroSlider(id);
            toast.success('Slider deleted successfully');
            load();
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete slider');
            console.error(error);
        }
    };

    const toggleActive = async (s: HeroSlider) => {
        try {
            await updateHeroSlider(s.id, { is_active: !s.is_active });
            toast.success(`Slider ${!s.is_active ? 'activated' : 'deactivated'}`);
            load();
        } catch {
            toast.error('Failed to update status');
        }
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="page-header mb-0">Hero Sliders <span className="text-muted-foreground text-lg font-normal">({sliders.length})</span></h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage the promotional banners shown on the mobile app home screen.</p>
                </div>
                <Link to="/hero-sliders/new" className="btn-primary">
                    <Plus size={16} /> New Slider
                </Link>
            </div>

            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Banner Image & Info</th>
                            <th>Sort Order</th>
                            <th>Status</th>
                            <th>Created Date</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading && (
                            <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">Loading...</td></tr>
                        )}
                        {!isLoading && sliders.length === 0 && (
                            <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No sliders found.</td></tr>
                        )}
                        {sliders.map(s => (
                            <tr key={s.id}>
                                <td>
                                    <div className="flex items-center gap-4">
                                        <div className="w-24 h-12 rounded-lg overflow-hidden bg-secondary border border-border shrink-0">
                                            {s.image_url ? (
                                                <img src={s.image_url} alt={s.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xs text-muted-foreground flex h-full items-center justify-center">No img</span>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-foreground text-sm uppercase tracking-wide">{s.title}</p>
                                                <span className={cn(
                                                    'text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase',
                                                    s.type === 'flash_sale' ? 'bg-orange-500/20 text-orange-500' : 'bg-blue-500/20 text-blue-500'
                                                )}>
                                                    {s.type === 'flash_sale' ? 'Flash Sale' : 'Home'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{s.subtitle || 'No subtitle'}</p>
                                            {s.cta_text && (
                                                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded mt-1 inline-block font-medium">
                                                    {s.cta_text} → {s.cta_link || '#'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-secondary text-sm font-medium">
                                        {s.sort_order}
                                    </span>
                                </td>
                                <td>
                                    <span className={cn('badge', s.is_active ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30')}>
                                        {s.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td><span className="text-xs text-muted-foreground">{formatDateShort(s.created_at)}</span></td>
                                <td>
                                    <div className="flex items-center gap-1 justify-end">
                                        <button onClick={() => toggleActive(s)} className="btn-ghost btn-icon" title={s.is_active ? 'Deactivate' : 'Activate'}>
                                            {s.is_active ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                        <Link to={`/hero-sliders/${s.id}/edit`} className="btn-ghost btn-icon" title="Edit">
                                            <Edit size={15} />
                                        </Link>
                                        <button onClick={() => handleDelete(s.id, s.title)} className="btn-ghost btn-icon text-destructive/70 hover:text-destructive" title="Delete">
                                            <Trash2 size={15} />
                                        </button>
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
