'use client';

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import imageCompression from "browser-image-compression";
import { AlertTriangle, Camera, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { requestReturn } from "../api/orders/actions";

interface Props {
    orderId: string;
}

const COMPLAINT_REASONS = [
    { value: "defective", label: "Barang cacat atau rusak" },
    { value: "wrong_product", label: "Barang tidak sesuai pesanan" },
    { value: "missing_item", label: "Pesanan kurang/tidak lengkap" },
    { value: "other", label: "Lainnya" }
];

export function ComplaintButtonModal({ orderId }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [reason, setReason] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        // Limiting to max 3 images for complaint
        if (images.length + files.length > 3) {
            toast.error("Maksimal hanya boleh melampirkan 3 foto.");
            return;
        }

        try {
            const options = {
                maxSizeMB: 0.5,
                maxWidthOrHeight: 1280,
                useWebWorker: true,
            };

            const processedFiles: File[] = [];
            const processedPreviews: string[] = [];

            for (const file of files) {
                const compressedFile = await imageCompression(file, options);
                processedFiles.push(compressedFile);
                processedPreviews.push(URL.createObjectURL(compressedFile));
            }

            setImages(prev => [...prev, ...processedFiles]);
            setImagePreviews(prev => [...prev, ...processedPreviews]);
        } catch (error) {
            console.error(error);
            toast.error("Gagal memproses gambar pengajuan komplain.");
        }
    };

    const handleRemoveImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => {
            const newPreviews = [...prev];
            URL.revokeObjectURL(newPreviews[index]); // Free memory
            newPreviews.splice(index, 1);
            return newPreviews;
        });
    };

    const handleSubmit = async () => {
        if (!reason) {
            toast.error("Pilih kategori komplain terlebih dahulu.");
            return;
        }

        if (!description.trim()) {
            toast.error("Wajib mengisi alasan/deskripsi komplain.");
            return;
        }

        if (images.length === 0) {
            toast.error("Wajib melampirkan minimal 1 foto bukti komplain/kerusakan.");
            return;
        }

        setIsSubmitting(true);
        try {
            const supabase = createClient();
            let uploadedUrls: string[] = [];

            // Upload all images
            for (let i = 0; i < images.length; i++) {
                const imageFile = images[i];
                const ext = imageFile.name.split('.').pop() || 'jpg';
                const fileName = `complaint-${orderId}-${Date.now()}-${i}.${ext}`;

                const { data, error } = await supabase.storage.from('returns').upload(fileName, imageFile);
                if (error) {
                    throw new Error("Gagal mengunggah foto: " + error.message);
                }
                const { data: { publicUrl } } = supabase.storage.from('returns').getPublicUrl(fileName);
                uploadedUrls.push(publicUrl);
            }

            const res = await requestReturn(orderId, reason, description, uploadedUrls);

            if (res.success) {
                toast.success("Pengajuan komplain berhasil dikirim!", {
                    description: "Admin kami akan segera meninjau komplain Anda.",
                });

                // Cleanup
                setReason("");
                setDescription("");
                setImages([]);
                imagePreviews.forEach(p => URL.revokeObjectURL(p));
                setImagePreviews([]);

                setIsOpen(false);
            } else {
                toast.error("Gagal Mengajukan", {
                    description: res.error || "Gagal mengajukan komplain pesanan",
                });
            }
        } catch (error: any) {
            toast.error(error.message || "Terjadi kesalahan sistem");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!isSubmitting) setIsOpen(open);
        }}>
            <DialogTrigger asChild>
                <button
                    className="w-full sm:w-auto px-5 py-2 border border-rose-300 bg-white text-rose-600 text-sm font-semibold rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-50 flex flex-row items-center justify-center gap-2"
                >
                    <AlertTriangle className="w-4 h-4" />
                    Ajukan Komplain
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-xl flex flex-col max-h-[90vh]">
                <DialogHeader className="shrink-0">
                    <DialogTitle className="text-xl">Ajukan Komplain Pesanan</DialogTitle>
                    <DialogDescription>
                        Layanan komplain barang rusak atau barang tidak sesuai. Mohon tulis dan lampirkan bukti foto sejelas-jelasnya.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-5 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="reason">Kendala <span className="text-destructive">*</span></Label>
                        <Select value={reason} onValueChange={setReason} disabled={isSubmitting}>
                            <SelectTrigger id="reason" className="w-full bg-white">
                                <SelectValue placeholder="Pilih Jenis Kendala" />
                            </SelectTrigger>
                            <SelectContent>
                                {COMPLAINT_REASONS.map(r => (
                                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Jelaskan Kendalanya <span className="text-destructive">*</span></Label>
                        <Textarea
                            id="description"
                            placeholder="Contoh: Baju bagian lengan terdapat sobekan sekitar 5 cm, dan noda hitam."
                            className="resize-none h-24 bg-white"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="space-y-3">
                        <Label>Bukti Foto <span className="text-destructive">*</span> <span className="text-xs text-muted-foreground font-normal ml-1">(Max: 3 Foto)</span></Label>

                        {/* Previews Array */}
                        {imagePreviews.length > 0 && (
                            <div className="flex flex-row gap-3 overflow-x-auto pb-2">
                                {imagePreviews.map((preview, i) => (
                                    <div key={i} className="relative w-24 h-24 flex-shrink-0 group rounded-xl overflow-hidden border border-border">
                                        <Image src={preview} alt={`Preview ${i}`} fill className="object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(i)}
                                            className="absolute top-1 right-1 bg-black/50 hover:bg-black p-1 rounded-full text-white transition-opacity z-10"
                                            disabled={isSubmitting}
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {images.length < 3 && (
                            <div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    id={`upload-complaint-image`}
                                    onChange={handleImageChange}
                                    disabled={isSubmitting}
                                />
                                <Label
                                    htmlFor={`upload-complaint-image`}
                                    className={`flex items-center justify-center gap-2 border border-dashed border-border p-4 rounded-xl cursor-pointer hover:bg-muted/50 transition-colors text-sm font-medium text-muted-foreground w-full bg-white ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}
                                >
                                    <Camera className="w-4 h-4" />
                                    Pilih Foto
                                </Label>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2 mt-2 pt-4 border-t border-border shrink-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto"
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        style={{ backgroundColor: '#e11d48', color: '#ffffff' }}
                        className="w-full sm:w-auto shadow-md transition-opacity hover:opacity-90"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Memproses...
                            </>
                        ) : (
                            "Kirim Komplain & Bukti"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
