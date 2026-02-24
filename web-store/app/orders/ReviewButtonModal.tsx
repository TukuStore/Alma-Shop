'use client';

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import type { Order, OrderItem } from "@/types/orders";
import { getProductFromItem } from "@/types/orders";
import imageCompression from "browser-image-compression";
import { Camera, MessageSquare, Star, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getOrderReviews, submitProductReview } from "../api/reviews/actions";

interface Props {
    order: Order;
}

export function ReviewButtonModal({ order }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // State for the forms: mapped by product_id
    const [ratings, setRatings] = useState<Record<string, number>>({});
    const [comments, setComments] = useState<Record<string, string>>({});
    const [reviewImages, setReviewImages] = useState<Record<string, File | null>>({});
    const [imagePreviews, setImagePreviews] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchExistingReviews();
        }
    }, [isOpen]);

    const fetchExistingReviews = async () => {
        setLoading(true);
        const data = await getOrderReviews(order.id);
        setReviews(data);
        setLoading(false);
    };

    const isReviewed = (productId: string) => {
        return reviews.some(r => r.product_id === productId);
    };

    const getExistingReview = (productId: string) => {
        return reviews.find(r => r.product_id === productId);
    };

    const handleImageChange = async (productId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const options = {
                maxSizeMB: 0.5,
                maxWidthOrHeight: 1280,
                useWebWorker: true,
            };

            const compressedFile = await imageCompression(file, options);

            setReviewImages(prev => ({ ...prev, [productId]: compressedFile }));
            setImagePreviews(prev => ({ ...prev, [productId]: URL.createObjectURL(compressedFile) }));
        } catch (error) {
            console.error(error);
            toast.error("Gagal memproses gambar.");
        }
    };

    const handleRemoveImage = (productId: string) => {
        setReviewImages(prev => {
            const next = { ...prev };
            delete next[productId];
            return next;
        });
        setImagePreviews(prev => {
            const next = { ...prev };
            if (next[productId]) {
                URL.revokeObjectURL(next[productId]);
                delete next[productId];
            }
            return next;
        });
    };

    const handleSubmit = async (item: OrderItem) => {
        const product = getProductFromItem(item);
        if (!product || !item.product_id) return;

        const rating = ratings[item.product_id] || 0;
        const comment = comments[item.product_id] || "";

        if (rating === 0) {
            toast.error("Silakan berikan rating bintang terlebih dahulu.");
            return;
        }

        setSubmitting(item.product_id);

        let uploadedImages: string[] = [];
        const imageFile = reviewImages[item.product_id];

        if (imageFile) {
            const supabase = createClient();
            const ext = imageFile.name.split('.').pop();
            const fileName = `${order.id}-${item.product_id}-${Date.now()}.${ext}`;

            const { data, error } = await supabase.storage.from('reviews').upload(fileName, imageFile);
            if (error) {
                toast.error("Gagal mengunggah foto: " + error.message);
                setSubmitting(null);
                return;
            }
            const { data: { publicUrl } } = supabase.storage.from('reviews').getPublicUrl(fileName);
            uploadedImages = [publicUrl];
        }

        const res = await submitProductReview({
            orderId: order.id,
            productId: item.product_id,
            rating,
            comment,
            images: uploadedImages,
        });

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success(`Berhasil mengulas ${product.name}!`);
            fetchExistingReviews(); // Refresh
        }
        setSubmitting(null);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <button
                    className="w-full sm:w-auto px-5 py-2 border border-gray-300 bg-white text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                    Beri Ulasan
                </button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto w-[90vw] rounded-2xl p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                <DialogHeader className="p-6 pb-4 border-b border-gray-100 flex-row items-center justify-between">
                    <div>
                        <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-gray-500" />
                            Nilai Produk
                        </DialogTitle>
                        <p className="text-sm text-gray-500 mt-1 font-medium">Bagaimana pengalaman belanja Anda?</p>
                    </div>
                </DialogHeader>

                <div className="p-6 flex flex-col gap-6 bg-gray-50/50">
                    {loading ? (
                        <div className="text-center text-sm text-gray-400 py-6 font-medium animate-pulse">Memuat data pesanan...</div>
                    ) : (
                        order.items.map((item, idx) => {
                            const product = getProductFromItem(item);
                            // Fallback in case of missing product / product_id (legacy data)
                            if (!product || !product.id) return null;

                            const pid = product.id;
                            const reviewed = isReviewed(pid);
                            const existing = getExistingReview(pid);

                            return (
                                <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                    <div className="flex gap-4 items-start mb-4">
                                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0 relative">
                                            <Image src={product.images?.[0] || '/images/sarung-placeholder.jpg'} alt={product.name} fill className="object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0 pt-1">
                                            <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-tight">{product.name}</h4>
                                            {reviewed && (
                                                <span className="inline-flex mt-2 items-center bg-[#059669]/10 text-[#059669] text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                                                    Ulasan Bintang {existing?.rating}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {reviewed ? (
                                        <>
                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm text-gray-600 italic">
                                                {existing?.comment ? `"${existing.comment}"` : 'Tidak meninggalkan komentar tulisan.'}
                                            </div>
                                            {existing?.images && existing.images.length > 0 && (
                                                <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                                                    {existing.images.map((img: string, i: number) => (
                                                        <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shrink-0 relative">
                                                            <Image src={img} alt="Foto Review" fill className="object-cover" />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex flex-col gap-3">
                                            <div className="flex justify-center gap-2 py-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setRatings(prev => ({ ...prev, [pid]: star }))}
                                                        className="outline-none focus:scale-110 active:scale-95 transition-transform"
                                                    >
                                                        <Star
                                                            className={`w-8 h-8 transition-colors ${(ratings[pid] || 0) >= star
                                                                ? 'fill-amber-400 text-amber-400'
                                                                : 'text-gray-300'
                                                                }`}
                                                            strokeWidth={1.5}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                            <textarea
                                                className="w-full text-sm border border-gray-300 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#121926]/20 transition-all resize-none shadow-sm placeholder:text-gray-400 text-gray-800"
                                                rows={3}
                                                placeholder="Ceritakan kepuasanmu (kualitas barang, warna, bahan, dll)..."
                                                value={comments[pid] || ''}
                                                onChange={(e) => setComments(prev => ({ ...prev, [pid]: e.target.value }))}
                                                disabled={submitting === pid}
                                            />

                                            <div className="flex flex-col gap-2">
                                                {!imagePreviews[pid] ? (
                                                    <label className="cursor-pointer inline-flex items-center gap-2 border border-dashed border-gray-300 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors w-full justify-center">
                                                        <Camera className="w-4 h-4" />
                                                        Tambah Foto (Optimal & Hemat Kuota)
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={(e) => handleImageChange(pid, e)}
                                                            disabled={submitting === pid}
                                                        />
                                                    </label>
                                                ) : (
                                                    <div className="relative w-max">
                                                        <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 relative mb-2">
                                                            <Image src={imagePreviews[pid]} alt="Preview" fill className="object-cover" />
                                                        </div>
                                                        <button
                                                            onClick={() => handleRemoveImage(pid)}
                                                            disabled={submitting === pid}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 focus:outline-none"
                                                            title="Hapus gambar"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            <Button
                                                onClick={() => handleSubmit(item)}
                                                disabled={submitting === pid}
                                                style={{ backgroundColor: '#121926', color: '#ffffff' }}
                                                className="w-full mt-1 h-10 font-bold rounded-lg shadow-sm hover:opacity-90 disabled:opacity-50"
                                            >
                                                {submitting === pid ? "Menyimpan Ulasan..." : "Kirim Ulasan"}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
