export const dynamic = "force-dynamic";
export const revalidate = 0;

import { FlashSaleBanner } from "@/components/flash-sale/FlashSaleBanner";
import { FlashSaleCountdown } from "@/components/flash-sale/FlashSaleCountdown";
import { FlashDealCard } from "@/components/product/FlashDealCard";
import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Flash Sale | Alma Shop",
    description: "Nikmati penawaran spesial dan diskon waktu terbatas untuk beragam koleksi sarung terbaik.",
};

interface FlashSalePageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function FlashSalePage({ searchParams }: FlashSalePageProps) {
    const params = await searchParams;
    const pageParam = params?.page;
    const page = typeof pageParam === "string" ? parseInt(pageParam) : 1;
    const validPage = isNaN(page) || page < 1 ? 1 : page;
    const limit = 20;
    const from = (validPage - 1) * limit;
    const to = from + limit - 1;

    const supabase = await createClient();

    // 1. Fetch Flash Sale banner (if any)
    const { data: flashBannersRaw } = await supabase
        .from('hero_sliders')
        .select('*')
        .eq('is_active', true)
        .eq('type', 'flash_sale')
        .order('sort_order', { ascending: true });

    let flashBanners = flashBannersRaw || [];

    // Fallback Mock so images exist just like mobile app placeholders
    if (flashBanners.length === 0) {
        flashBanners = [
            {
                id: 'mock-flash-1',
                title: 'Kejar Diskon Berkiprah',
                subtitle: 'Penawaran spesial waktu terbatas. Dapatkan sarung kualitas premium dengan harga terbaik sekarang juga!',
                image_url: '/assets/images/category/sarung batik printing.jpg',
                cta_text: 'Buru Promo',
                cta_link: '/products',
                type: 'flash_sale',
                sort_order: 1,
                is_active: true,
                created_at: new Date().toISOString()
            },
            {
                id: 'mock-flash-2',
                title: 'Waktu Sangat Terbatas!',
                subtitle: 'Koleksi eksklusif BHS dan Atlas original diskon hingga 50%.',
                image_url: '/assets/images/category/sarung songket.png',
                cta_text: 'Cek Sekarang',
                cta_link: '/products',
                type: 'flash_sale',
                sort_order: 2,
                is_active: true,
                created_at: new Date().toISOString()
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ] as any[];
    }

    // 2. Fetch products and mock flash sale prices (simulating the app logic)
    const { data: flashDealsRaw, count: allProductsCount } = await supabase
        .from("products")
        .select(`*, category:categories(name, slug)`, { count: "exact" })
        .eq("is_active", true)
        // A real DB might filter by 'is_flash_sale' or something similar. 
        // For testing we just show random / newly added ones
        .order("created_at", { ascending: false })
        .range(from, to);

    const flashSaleProducts = (flashDealsRaw || []).map(p => ({
        ...p,
        // Add 30% mock discount if original_price is empty, matching mobile app logic
        original_price: p.original_price || Math.floor(p.price * 1.3),
    }));

    const totalPages = allProductsCount ? Math.ceil(allProductsCount / limit) : 1;

    return (
        <div className="container mx-auto px-4 lg:px-8 py-8 md:max-w-[700px] lg:max-w-[900px] xl:max-w-7xl">
            {/* Page Header / Banner Slider */}
            <FlashSaleBanner banners={flashBanners} />

            <FlashSaleCountdown />

            {/* Products grid */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[22px] font-semibold text-neutral-900 tracking-tight leading-tight">Latest Deals</h2>
                </div>

                {flashSaleProducts && flashSaleProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {flashSaleProducts.map((p) => (
                            <FlashDealCard key={p.id} product={p} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 border border-dashed border-border rounded-xl bg-muted/20">
                        <h3 className="text-lg font-medium">Flash Sale Kosong</h3>
                        <p className="text-muted-foreground mt-2">Belum ada penawaran diskon saat ini. Silakan kembali lagi nanti.</p>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-12 flex justify-center items-center gap-2">
                        {validPage > 1 ? (
                            <Link href={`/flash-sale?page=${validPage - 1}`} className="px-4 py-2 border border-border rounded-md hover:bg-muted text-sm font-medium transition-colors">
                                Sebelumnya
                            </Link>
                        ) : (
                            <span className="px-4 py-2 border border-border rounded-md opacity-50 cursor-not-allowed text-sm font-medium bg-muted">
                                Sebelumnya
                            </span>
                        )}

                        <span className="px-4 py-2 text-sm font-medium">
                            Halaman {validPage} dari {totalPages}
                        </span>

                        {validPage < totalPages ? (
                            <Link href={`/flash-sale?page=${validPage + 1}`} className="px-4 py-2 border border-border rounded-md hover:bg-muted text-sm font-medium transition-colors">
                                Selanjutnya
                            </Link>
                        ) : (
                            <span className="px-4 py-2 border border-border rounded-md opacity-50 cursor-not-allowed text-sm font-medium bg-muted">
                                Selanjutnya
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
