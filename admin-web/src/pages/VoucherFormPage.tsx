import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { createVoucher, getVouchers, updateVoucher } from '../services/voucherService';

const schema = z.object({
    code: z.string().min(2, 'Code is required'),
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    discount_type: z.enum(['percentage', 'fixed']),
    discount_value: z.coerce.number().min(1),
    min_purchase: z.coerce.number().min(0),
    max_discount: z.coerce.number().optional(),
    start_date: z.string().min(1, 'Start date required'),
    end_date: z.string().optional(),
    is_active: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export default function VoucherFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(isEdit);

    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema) as any,
        defaultValues: { discount_type: 'percentage', is_active: true, min_purchase: 0 },
    });

    const discountType = watch('discount_type');

    useEffect(() => {
        if (isEdit && id) {
            getVouchers().then(vouchers => {
                const v = vouchers.find(x => x.id === id);
                if (v) reset({ ...v, start_date: v.start_date?.split('T')[0] ?? '', end_date: v.end_date?.split('T')[0] ?? '' });
                setIsLoading(false);
            });
        }
    }, [id]);

    const onSubmit = async (data: any) => {
        setIsSaving(true);
        try {
            if (isEdit && id) { await updateVoucher(id, data); toast.success('Voucher updated'); }
            else { await createVoucher(data); toast.success('Voucher created'); }
            navigate('/vouchers');
        } catch (err: any) { toast.error(err.message ?? 'Failed'); }
        finally { setIsSaving(false); }
    };

    if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 size={32} className="animate-spin text-primary" /></div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <Link to="/vouchers" className="btn-ghost btn-icon"><ArrowLeft size={18} /></Link>
                <h1 className="page-header mb-0">{isEdit ? 'Edit Voucher' : 'New Voucher'}</h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                        <label className="label">Voucher Code *</label>
                        <input {...register('code')} className="input uppercase" placeholder="SARUNG20" />
                        {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
                    </div>
                    <div className="form-group">
                        <label className="label">Display Name *</label>
                        <input {...register('name')} className="input" placeholder="20% Off Batik" />
                        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                    </div>
                </div>
                <div className="form-group">
                    <label className="label">Description</label>
                    <textarea {...register('description')} rows={2} className="input resize-none" placeholder="Optional description shown to users" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                        <label className="label">Discount Type *</label>
                        <select {...register('discount_type')} className="select">
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed">Fixed Amount (Rp)</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="label">Discount Value *</label>
                        <input {...register('discount_value')} type="number" className="input"
                            placeholder={discountType === 'percentage' ? '20' : '50000'} />
                        {errors.discount_value && <p className="text-xs text-destructive">{errors.discount_value.message}</p>}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                        <label className="label">Minimum Purchase (Rp)</label>
                        <input {...register('min_purchase')} type="number" className="input" placeholder="100000" />
                    </div>
                    {discountType === 'percentage' && (
                        <div className="form-group">
                            <label className="label">Max Discount Cap (Rp)</label>
                            <input {...register('max_discount')} type="number" className="input" placeholder="50000" />
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                        <label className="label">Start Date *</label>
                        <input {...register('start_date')} type="date" className="input" />
                        {errors.start_date && <p className="text-xs text-destructive">{errors.start_date.message}</p>}
                    </div>
                    <div className="form-group">
                        <label className="label">End Date</label>
                        <input {...register('end_date')} type="date" className="input" />
                    </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" {...register('is_active')} className="w-4 h-4 rounded accent-primary" />
                    <span className="text-sm text-foreground">Active (visible to users)</span>
                </label>
                <div className="flex gap-3 justify-end pt-2 border-t border-border">
                    <Link to="/vouchers" className="btn-secondary">Cancel</Link>
                    <button type="submit" disabled={isSaving} className="btn-primary">
                        {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        {isEdit ? 'Update' : 'Create'} Voucher
                    </button>
                </div>
            </form>
        </div>
    );
}
