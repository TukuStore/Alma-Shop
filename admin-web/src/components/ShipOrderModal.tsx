import { Loader2, Package, Truck, X } from 'lucide-react';
import { useState } from 'react';

const COURIERS = [
    { value: 'jne', label: 'JNE' },
    { value: 'jnt', label: 'J&T Express' },
    { value: 'sicepat', label: 'SiCepat' },
    { value: 'anteraja', label: 'AnterAja' },
    { value: 'tiki', label: 'TIKI' },
    { value: 'pos', label: 'Pos Indonesia' },
    { value: 'gojek', label: 'Gojek (GoSend)' },
    { value: 'grab', label: 'Grab (GrabExpress)' },
    { value: 'ninja', label: 'Ninja Xpress' },
    { value: 'other', label: 'Lainnya' },
];

interface ShipOrderModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (courier: string, trackingNumber: string) => void;
    isLoading: boolean;
    orderId: string;
}

export default function ShipOrderModal({ open, onClose, onSubmit, isLoading, orderId }: ShipOrderModalProps) {
    const [courier, setCourier] = useState('');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [errors, setErrors] = useState<{ courier?: string; trackingNumber?: string }>({});

    if (!open) return null;

    const validate = () => {
        const newErrors: typeof errors = {};
        if (!courier) newErrors.courier = 'Pilih kurir pengiriman';
        if (!trackingNumber.trim()) newErrors.trackingNumber = 'Masukkan nomor resi atau link tracking';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        const courierLabel = COURIERS.find(c => c.value === courier)?.label ?? courier;
        onSubmit(courierLabel, trackingNumber.trim());
    };

    const handleClose = () => {
        if (!isLoading) {
            setCourier('');
            setTrackingNumber('');
            setErrors({});
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-md mx-4 bg-card border border-border rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Truck size={20} className="text-primary" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-foreground">Kirim Pesanan</h2>
                            <p className="text-xs text-muted-foreground">Order #{orderId.slice(0, 8).toUpperCase()}</p>
                        </div>
                    </div>
                    <button onClick={handleClose} disabled={isLoading} className="btn-ghost btn-icon">
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-5 space-y-5">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Masukkan informasi pengiriman. Data ini akan ditampilkan kepada pelanggan untuk melacak pesanan mereka.
                    </p>

                    {/* Courier Select */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Package size={14} className="text-muted-foreground" />
                            Kurir Pengiriman <span className="text-red-400">*</span>
                        </label>
                        <select
                            value={courier}
                            onChange={(e) => { setCourier(e.target.value); setErrors(prev => ({ ...prev, courier: undefined })); }}
                            className={`w-full h-10 px-3 rounded-lg border text-sm bg-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${errors.courier ? 'border-red-400 ring-1 ring-red-400/30' : 'border-border'}`}
                        >
                            <option value="">— Pilih Kurir —</option>
                            {COURIERS.map(c => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                        {errors.courier && <p className="text-xs text-red-400 font-medium">{errors.courier}</p>}
                    </div>

                    {/* Tracking Number */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Truck size={14} className="text-muted-foreground" />
                            No. Resi / Link Tracking <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={trackingNumber}
                            onChange={(e) => { setTrackingNumber(e.target.value); setErrors(prev => ({ ...prev, trackingNumber: undefined })); }}
                            placeholder="Contoh: JNE1234567890 atau https://gojek.link/..."
                            className={`w-full h-10 px-3 rounded-lg border text-sm bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${errors.trackingNumber ? 'border-red-400 ring-1 ring-red-400/30' : 'border-border'}`}
                        />
                        {errors.trackingNumber && <p className="text-xs text-red-400 font-medium">{errors.trackingNumber}</p>}
                        <p className="text-[11px] text-muted-foreground">
                            💡 Untuk Gojek/Grab, paste link live tracking langsung.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={handleClose} disabled={isLoading} className="btn-ghost flex-1">
                            Batal
                        </button>
                        <button type="submit" disabled={isLoading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Truck size={14} />}
                            {isLoading ? 'Menyimpan...' : 'Kirim Sekarang'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
