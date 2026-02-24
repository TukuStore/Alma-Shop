import { Edit2, Loader2, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getCategories, updateCategory, uploadCategoryImage } from '../services/categoryService';
import type { Category } from '../types';

export default function CategoryListPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [uploadingId, setUploadingId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getCategories().then(c => { setCategories(c); setIsLoading(false); });
    }, []);

    const handleSaveName = async (id: string) => {
        await updateCategory(id, { name: editName });
        setCategories(prev => prev.map(c => c.id === id ? { ...c, name: editName } : c));
        setEditingId(null);
        toast.success('Category updated');
    };

    const handleImageUpload = async (id: string, file: File) => {
        setUploadingId(id);
        try {
            const url = await uploadCategoryImage(file, id);
            await updateCategory(id, { image_url: url });
            setCategories(prev => prev.map(c => c.id === id ? { ...c, image_url: url } : c));
            toast.success('Category image updated');
        } catch { toast.error('Upload failed'); }
        finally { setUploadingId(null); }
    };

    if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 size={32} className="animate-spin text-primary" /></div>;

    return (
        <div className="space-y-5">
            <h1 className="page-header">Categories</h1>
            <p className="text-sm text-muted-foreground -mt-3">
                Manage the 8 Sarung product categories. You can update the name and cover image.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {categories.map(cat => (
                    <div key={cat.id} className="card p-0 overflow-hidden">
                        {/* Image */}
                        <div className="relative aspect-[4/3] bg-secondary">
                            {cat.image_url
                                ? <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>
                            }
                            <label className={`absolute inset-0 flex items-center justify-center bg-black/50 opacity-0
                               hover:opacity-100 transition-opacity cursor-pointer ${uploadingId === cat.id ? 'opacity-100' : ''}`}>
                                {uploadingId === cat.id
                                    ? <Loader2 size={24} className="text-white animate-spin" />
                                    : <><Upload size={20} className="text-white" /><span className="text-white text-xs ml-2">Change Image</span></>
                                }
                                <input type="file" accept="image/*" className="hidden"
                                    onChange={e => { if (e.target.files?.[0]) handleImageUpload(cat.id, e.target.files[0]); }} />
                            </label>
                        </div>
                        {/* Name */}
                        <div className="p-3">
                            {editingId === cat.id ? (
                                <div className="flex gap-2">
                                    <input value={editName} onChange={e => setEditName(e.target.value)}
                                        className="input text-sm py-1 flex-1" autoFocus
                                        onKeyDown={e => { if (e.key === 'Enter') handleSaveName(cat.id); if (e.key === 'Escape') setEditingId(null); }} />
                                    <button onClick={() => handleSaveName(cat.id)} className="btn-primary px-2 py-1 text-xs">Save</button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-foreground">{cat.name}</p>
                                    <button onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                                        className="btn-ghost btn-icon">
                                        <Edit2 size={13} />
                                    </button>
                                </div>
                            )}
                            <p className="text-[10px] text-muted-foreground mt-0.5">{cat.slug}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
