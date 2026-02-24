"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { Review } from "@/types";
import { Loader2, Star, User, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function ReviewList({ productId }: { productId: string }) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // For review submission
    const [userId, setUserId] = useState<string | null>(null);
    const [rating, setRating] = useState<number>(0);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Lightbox state
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const supabase = createClient();

    // Basic stats
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    const ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({
        stars,
        count: reviews.filter(r => r.rating === stars).length,
        percentage: totalReviews > 0 ? (reviews.filter(r => r.rating === stars).length / totalReviews) * 100 : 0
    }));

    useEffect(() => {
        async function fetchReviews() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
            }

            const { data } = await supabase
                .from("reviews")
                .select("*")
                .eq("product_id", productId)
                .order("created_at", { ascending: false });

            if (data && data.length > 0) {
                const userIds = [...new Set(data.map(r => r.user_id))];
                const { data: profilesData } = await supabase
                    .from("profiles")
                    .select("id, full_name, avatar_url")
                    .in("id", userIds);

                const profilesMap = new Map();
                if (profilesData) {
                    profilesData.forEach(p => profilesMap.set(p.id, p));
                }

                const enrichedReviews = data.map(r => ({
                    ...r,
                    user_name: profilesMap.get(r.user_id)?.full_name || "Pembeli Rahasia",
                    user_avatar: profilesMap.get(r.user_id)?.avatar_url || null
                }));

                setReviews(enrichedReviews as Review[]);
            } else {
                setReviews([]);
            }
            setIsLoading(false);
        }
        fetchReviews();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productId]);

    const submitReview = async () => {
        if (!userId) {
            toast.error("Silakan login untuk memberikan ulasan.");
            return;
        }
        if (rating === 0) {
            toast.error("Pilih rating bintang terlebih dahulu.");
            return;
        }
        if (comment.length < 5) {
            toast.error("Ulasan minimal 5 karakter.");
            return;
        }

        setIsSubmitting(true);
        const { data, error } = await supabase
            .from("reviews")
            .insert({
                product_id: productId,
                user_id: userId,
                rating,
                comment,
            })
            .select()
            .single();

        if (error) {
            toast.error("Gagal mengirim ulasan", { description: error.message });
        } else if (data) {
            toast.success("Ulasan berhasil dikirim!");
            setReviews(prev => [data as Review, ...prev]);
            setRating(0);
            setHoverRating(0);
            setComment("");
        }
        setIsSubmitting(false);
    };

    if (isLoading) {
        return <div className="animate-pulse space-y-4 py-8"><div className="h-20 bg-muted rounded-xl"></div><div className="h-40 bg-muted rounded-xl"></div></div>;
    }

    return (
        <div className="mt-16 md:mt-24">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-1.5">Ulasan Pembeli ({totalReviews})</h2>
                    <p className="text-muted-foreground text-sm">Lihat apa kata mereka yang sudah membeli produk ini.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                {/* Summary Stats & Form */}
                <div className="md:col-span-4 flex flex-col gap-8">
                    {/* Stats */}
                    {totalReviews > 0 ? (
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center justify-center p-6 rounded-2xl border min-w-[120px]" style={{ backgroundColor: 'rgba(255,107,87,0.1)', borderColor: 'rgba(255,107,87,0.2)' }}>
                                <span className="text-4xl font-bold" style={{ color: '#FF6B57' }}>{averageRating.toFixed(1)}</span>
                                <div className="flex mt-2">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} className="w-4 h-4" style={s <= Math.round(averageRating) ? { fill: '#FFB13B', color: '#FFB13B' } : { fill: 'transparent', color: '#9AA4B2', opacity: 0.3 }} />
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 flex-1">
                                {ratingDistribution.map(({ stars, count, percentage }) => (
                                    <div key={stars} className="flex items-center gap-2 text-sm">
                                        <span className="flex items-center w-12 shrink-0">{stars} <Star className="w-3 h-3 ml-1" style={{ fill: '#FFB13B', color: '#FFB13B' }} /></span>
                                        <Progress value={percentage} className="h-2" />
                                        <span className="w-8 shrink-0 text-right text-muted-foreground text-xs">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="py-8 bg-muted/20 border border-dashed border-border rounded-xl text-center flex flex-col items-center">
                            <Star className="w-12 h-12 text-muted-foreground opacity-20 mb-3" />
                            <h3 className="text-lg font-medium">Belum Ada Ulasan</h3>
                            <p className="text-sm text-muted-foreground mt-1 px-4">Jadilah yang pertama mereview produk ini.</p>
                        </div>
                    )}

                    {/* Submit Review Form */}
                    <div className="bg-card border border-border rounded-xl p-5">
                        <h3 className="font-semibold text-lg mb-4">Tulis Ulasan Anda</h3>
                        {!userId ? (
                            <p className="text-sm text-muted-foreground">Silakan <a href="/auth/login" className="text-primary hover:underline font-medium">Masuk</a> untuk memberikan ulasan produk ini.</p>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <div className="flex gap-1 mb-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm transition-transform hover:scale-110"
                                            >
                                                <Star className="w-6 h-6" style={(hoverRating || rating) >= star ? { fill: '#FFB13B', color: '#FFB13B' } : { fill: 'transparent', color: '#9AA4B2', opacity: 0.3 }} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <Textarea
                                    placeholder="Ceritakan pengalaman Anda dengan produk ini..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="resize-none h-24"
                                />
                                <Button
                                    onClick={submitReview}
                                    disabled={isSubmitting || rating === 0 || comment.length < 5}
                                    className="w-full"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    Kirim Ulasan
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reviews List */}
                <div className="md:col-span-8 flex flex-col gap-6">
                    {reviews.length > 0 ? reviews.map((review) => (
                        <div key={review.id} className="pb-6 border-b border-border/50 flex flex-col sm:flex-row gap-4">
                            {review.user_avatar ? (
                                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-border relative">
                                    <Image src={review.user_avatar!} alt={review.user_name || "User Avatar"} fill className="object-cover" />
                                </div>
                            ) : (
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0 border border-border">
                                    <User className="h-6 w-6 text-muted-foreground/50" />
                                </div>
                            )}
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-sm">{review.user_name || "Pembeli Rahasia"}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(review.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                                <div className="flex text-amber-500 mb-3">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'fill-amber-500' : 'text-muted-foreground opacity-30 fill-transparent'}`} />
                                    ))}
                                </div>
                                <p className="text-sm text-foreground/90 leading-relaxed font-medium">&quot;{review.comment}&quot;</p>

                                {review.images && review.images.length > 0 && (
                                    <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                                        {review.images.map((img: string, i: number) => (
                                            <div
                                                key={i}
                                                className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-border shrink-0 relative hover:opacity-90 transition-opacity cursor-pointer group"
                                                onClick={() => setSelectedImage(img)}
                                            >
                                                <Image src={img} alt={`Review photo ${i + 1}`} fill className="object-cover" />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="flex items-center justify-center h-full min-h-[200px] text-muted-foreground bg-muted/5 rounded-xl border border-dashed border-border/50">
                            Semua ulasan dari pelanggan akan tampil di sini.
                        </div>
                    )}
                </div>
            </div>

            {/* Image Lightbox */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 md:p-8 backdrop-blur-sm"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        className="absolute top-4 right-4 md:top-6 md:right-6 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-all z-[60]"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(null);
                        }}
                    >
                        <X className="w-8 h-8 md:w-10 md:h-10 p-1" />
                    </button>
                    <div
                        className="relative w-full max-w-5xl h-[80vh] md:h-[90vh] flex items-center justify-center pointer-events-none"
                    >
                        <Image
                            src={selectedImage}
                            alt="Review Enlarged"
                            width={1600}
                            height={1600}
                            className="object-contain w-auto h-auto max-w-full max-h-full rounded-md shadow-2xl pointer-events-auto"
                            quality={100}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
