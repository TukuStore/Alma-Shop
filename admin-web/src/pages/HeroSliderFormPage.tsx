import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2, Save, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import * as z from 'zod';
import { createHeroSlider, getHeroSliderById, updateHeroSlider, uploadHeroImage } from '../services/heroSliderService';

const toNum = (val: unknown) => (val === '' || val === null || val === undefined ? undefined : Number(val));

const schema = z.object({
    title: z.string().min(1, 'Title is required'),
    type: z.enum(['home', 'flash_sale']),
    subtitle: z.string().optional(),
    cta_text: z.string().optional(),
    cta_link: z.string().optional(),
    sort_order: z.preprocess(toNum, z.number().min(0)),
    is_active: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export default function HeroSliderFormPage() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(isEdit);
    const [isSaving, setIsSaving] = useState(false);

    // Image handling
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
        resolver: zodResolver(schema) as any,
        defaultValues: {
            title: '',
            type: 'home',
            subtitle: '',
            cta_text: '',
            cta_link: '',
            sort_order: 0,
            is_active: true,
        }
    });

    useEffect(() => {
        if (!isEdit) return;
        getHeroSliderById(id!).then(slider => {
            if (!slider) {
                toast.error('Slider not found');
                navigate('/hero-sliders');
                return;
            }
            reset({
                title: slider.title,
                type: slider.type || 'home',
                subtitle: slider.subtitle || '',
                cta_text: slider.cta_text || '',
                cta_link: slider.cta_link || '',
                sort_order: slider.sort_order,
                is_active: slider.is_active,
            });
            setImagePreview(slider.image_url);
        }).catch(() => {
            toast.error('Slider not found');
            navigate('/hero-sliders');
        }).finally(() => setIsLoading(false));
    }, [id, isEdit, reset, navigate]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const onSubmit = async (data: FormData) => {
        try {
            setIsSaving(true);

            if (!isEdit && !imageFile) {
                toast.error('Banner image is required');
                setIsSaving(false);
                return;
            }

            let imageUrl = imagePreview; // Default to existing preview if not changed

            // Upload new image if file exists
            if (imageFile) {
                imageUrl = await uploadHeroImage(imageFile);
            }

            const input = {
                ...data,
                image_url: imageUrl as string
            };

            if (isEdit) {
                await updateHeroSlider(id!, input);
                toast.success('Slider updated globally');
            } else {
                await createHeroSlider(input);
                toast.success('Slider created globally');
            }
            navigate('/hero-sliders');
        } catch (error: any) {
            toast.error(error.message || 'Failed to save slider');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center py-12"><Loader2 size={32} className="animate-spin text-primary" /></div>;
    }

    return (
        <div className="max-w-2xl space-y-5 pb-10">
            <div className="flex items-center gap-3">
                <Link to="/hero-sliders" className="btn-ghost btn-icon p-2 -ml-2"><ArrowLeft size={20} /></Link>
                <h1 className="page-header mb-0">{isEdit ? 'Edit Hero Slider' : 'New Hero Slider'}</h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* Banner Image Upload */}
                <div className="card">
                    <h2 className="text-sm font-semibold mb-4">Banner Image</h2>
                    <div className="space-y-4">
                        <div className="w-full aspect-[21/9] bg-secondary rounded-xl border-2 border-dashed border-border overflow-hidden relative flex items-center justify-center">
                            {imagePreview ? (
                                <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                            ) : (
                                <div className="text-center text-muted-foreground p-4">
                                    <Upload size={24} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Click to upload banner image</p>
                                    <p className="text-xs mt-1">Recommended size: 1000x400 (or wider)</p>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleImageChange}
                            />
                        </div>
                    </div>
                </div>

                <div className="card space-y-4">
                    <h2 className="text-sm font-semibold mb-2">Content</h2>

                    <div className="form-group mb-4">
                        <label className="label">Banner Type <span className="text-destructive">*</span></label>
                        <div className="flex items-center gap-6 mt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" value="home" {...register('type')} className="w-4 h-4 text-primary" />
                                <span className="text-sm">Home Banner</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" value="flash_sale" {...register('type')} className="w-4 h-4 text-primary" />
                                <span className="text-sm">Flash Sale Banner</span>
                            </label>
                        </div>
                        {errors.type && <p className="text-xs text-destructive mt-1">{errors.type.message}</p>}
                    </div>

                    <div className="form-group">
                        <label className="label">Title <span className="text-destructive">*</span></label>
                        <input {...register('title')} className="input" placeholder="e.g. Ramadan Sale Up to 50% Off" />
                        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                    </div>

                    <div className="form-group">
                        <label className="label">Subtitle</label>
                        <input {...register('subtitle')} className="input" placeholder="e.g. Exclusive deals, limited stock!" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="label">CTA Text</label>
                            <input {...register('cta_text')} className="input" placeholder="e.g. Grab Deals" />
                        </div>
                        <div className="form-group">
                            <label className="label">CTA Link (URL or Route)</label>
                            <input {...register('cta_link')} className="input" placeholder="e.g. /(tabs)/categories" />
                        </div>
                    </div>
                </div>

                <div className="card space-y-4">
                    <h2 className="text-sm font-semibold mb-2">Display Settings</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="label">Sort Order</label>
                            <input type="number" {...register('sort_order')} className="input" placeholder="0" />
                            <p className="text-[10px] text-muted-foreground mt-1">Lower numbers appear first</p>
                        </div>
                        <div className="flex items-center gap-2 mt-7">
                            <input type="checkbox" id="is_active" {...register('is_active')} className="w-4 h-4 rounded border-input bg-background" />
                            <label htmlFor="is_active" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Active (Show on App)
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Link to="/hero-sliders" className="btn-secondary px-6">Cancel</Link>
                    <button type="submit" disabled={isSaving} className="btn-primary px-6">
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save Slider
                    </button>
                </div>
            </form>
        </div>
    );
}
