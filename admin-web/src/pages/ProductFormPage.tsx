import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2, Save, Upload, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { cn } from '../lib/utils';
import { getCategories } from '../services/categoryService';
import type { CreateProductInput } from '../services/productService';
import { createProduct, getProductById, updateProduct, uploadProductImage } from '../services/productService';
import type { Category } from '../types';

const toNum = (val: unknown) => (val === '' || val === null || val === undefined ? undefined : Number(val));

const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    price: z.preprocess(toNum, z.number().min(1, 'Price must be greater than 0')),
    original_price: z.preprocess(toNum, z.number().optional()),
    stock: z.preprocess(toNum, z.number().min(0, 'Stock cannot be negative')),
    category_id: z.string().min(1, 'Category is required'),
    material: z.string().optional(),
    is_featured: z.boolean(),
    is_active: z.boolean(),
});

// Manually type FormData to work around Zod v4 preprocess unknown inference
type FormData = {
    name: string;
    description?: string;
    price: number;
    original_price?: number;
    stock: number;
    category_id: string;
    material?: string;
    is_featured: boolean;
    is_active: boolean;
};

export default function ProductFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [categories, setCategories] = useState<Category[]>([]);
    const [images, setImages] = useState<string[]>([]);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [isLoading, setIsLoading] = useState(isEdit);
    const [isSaving, setIsSaving] = useState(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema) as any,
        defaultValues: { is_featured: false, is_active: true },
    });

    useEffect(() => {
        getCategories().then(setCategories);
        if (isEdit && id) {
            getProductById(id).then(p => {
                if (p) {
                    reset({
                        name: p.name,
                        description: p.description ?? '',
                        price: p.price,
                        original_price: p.original_price,
                        stock: p.stock,
                        category_id: p.category_id,
                        material: p.material ?? '',
                        is_featured: p.is_featured,
                        is_active: p.is_active,
                    });
                    setImages(p.images ?? []);
                }
                setIsLoading(false);
            });
        }
    }, [id]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (files.length === 0) return;
        setUploadingImages(true);
        try {
            const productId = id ?? `temp-${Date.now()}`;
            const urls = await Promise.all(files.map(f => uploadProductImage(f, productId)));
            setImages(prev => [...prev, ...urls]);
            toast.success(`${files.length} image(s) uploaded`);
        } catch {
            toast.error('Image upload failed');
        } finally {
            setUploadingImages(false);
        }
    };

    const removeImage = (url: string) => setImages(prev => prev.filter(i => i !== url));

    const onSubmit = async (data: FormData) => {
        if (images.length === 0) { toast.error('At least one product image is required'); return; }
        setIsSaving(true);
        try {
            const payload: CreateProductInput = { ...data, images };
            if (isEdit && id) {
                await updateProduct(id, payload);
                toast.success('Product updated successfully');
            } else {
                await createProduct(payload);
                toast.success('Product created successfully');
            }
            navigate('/products');
        } catch (err: any) {
            toast.error(err.message ?? 'Failed to save product');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return (
        <div className="flex items-center justify-center h-64">
            <Loader2 size={32} className="animate-spin text-primary" />
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <Link to="/products" className="btn-ghost btn-icon">
                    <ArrowLeft size={18} />
                </Link>
                <h1 className="page-header mb-0">{isEdit ? 'Edit Product' : 'New Product'}</h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Info */}
                <div className="card space-y-4">
                    <p className="text-sm font-semibold text-foreground border-b border-border pb-3">Basic Information</p>
                    <div className="form-group">
                        <label className="label">Product Name *</label>
                        <input {...register('name')} className="input" placeholder="e.g. Sarung Songket Premium" />
                        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                    </div>
                    <div className="form-group">
                        <label className="label">Description</label>
                        <textarea {...register('description')} rows={4} className="input resize-none"
                            placeholder="Describe the product material, origin, usage..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="label">Category *</label>
                            <select {...register('category_id')} className="select">
                                <option value="">Select category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            {errors.category_id && <p className="text-xs text-destructive">{errors.category_id.message}</p>}
                        </div>
                        <div className="form-group">
                            <label className="label">Material</label>
                            <input {...register('material')} className="input" placeholder="e.g. Sutra, Katun" />
                        </div>
                    </div>
                </div>

                {/* Pricing & Stock */}
                <div className="card space-y-4">
                    <p className="text-sm font-semibold text-foreground border-b border-border pb-3">Pricing & Inventory</p>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="form-group">
                            <label className="label">Price (Rp) *</label>
                            <input {...register('price')} type="number" className="input" placeholder="200000" />
                            {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
                        </div>
                        <div className="form-group">
                            <label className="label">Original Price (Rp)</label>
                            <input {...register('original_price')} type="number" className="input" placeholder="250000" />
                        </div>
                        <div className="form-group">
                            <label className="label">Stock *</label>
                            <input {...register('stock')} type="number" className="input" placeholder="100" />
                            {errors.stock && <p className="text-xs text-destructive">{errors.stock.message}</p>}
                        </div>
                    </div>
                    <div className="flex gap-6">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" {...register('is_active')}
                                className="w-4 h-4 rounded accent-primary" />
                            <span className="text-sm text-foreground">Active (visible in app)</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" {...register('is_featured')}
                                className="w-4 h-4 rounded accent-primary" />
                            <span className="text-sm text-foreground">Featured (Flash Deals)</span>
                        </label>
                    </div>
                </div>

                {/* Images */}
                <div className="card space-y-4">
                    <p className="text-sm font-semibold text-foreground border-b border-border pb-3">
                        Product Images
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {images.map(url => (
                            <div key={url} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                                <img src={url} alt="" className="w-full h-full object-cover" />
                                <button type="button" onClick={() => removeImage(url)}
                                    className="absolute top-1 right-1 w-6 h-6 bg-destructive rounded-full flex items-center justify-center
                             opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X size={12} className="text-white" />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingImages}
                            className={cn(
                                'aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1',
                                'hover:border-primary hover:bg-primary/5 transition-colors text-muted-foreground hover:text-primary',
                                uploadingImages && 'opacity-50 cursor-wait'
                            )}
                        >
                            {uploadingImages
                                ? <Loader2 size={20} className="animate-spin" />
                                : <><Upload size={20} /><span className="text-xs">Upload</span></>
                            }
                        </button>
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                        onChange={handleImageUpload} />
                    <p className="text-xs text-muted-foreground">Upload to Supabase Storage. First image is the thumbnail.</p>
                </div>

                <div className="flex gap-3 justify-end">
                    <Link to="/products" className="btn-secondary">Cancel</Link>
                    <button type="submit" disabled={isSaving} className="btn-primary">
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {isEdit ? 'Save Changes' : 'Create Product'}
                    </button>
                </div>
            </form>
        </div>
    );
}
