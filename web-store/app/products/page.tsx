export const dynamic = "force-dynamic";
export const revalidate = 0;

import { ProductFilters } from "@/components/product/ProductFilters";
import { ProductFiltersMobile } from "@/components/product/ProductFiltersMobile";
import { ProductGrid } from "@/components/product/ProductGrid";
import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Semua Produk Sarung",
    description: "Jelajahi koleksi lengkap sarung tenun, batik, dan sutra premium dari Alma Shop.",
};

interface ProductsPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
    const params = await searchParams;
    const sort = typeof params.sort === "string" ? params.sort : "newest";
    const category = typeof params.category === "string" ? params.category : undefined;
    const material = typeof params.material === "string" ? params.material : undefined;
    const minPrice = typeof params.min_price === "string" ? parseFloat(params.min_price) : undefined;
    const maxPrice = typeof params.max_price === "string" ? parseFloat(params.max_price) : undefined;
    const page = typeof params.page === "string" ? parseInt(params.page) : 1;

    const limit = 16;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const supabase = await createClient();

    // 1. Fetch Categories for Filters
    const { data: categories } = await supabase.from("categories").select("*");

    // 2. Build Base Query
    let query = supabase
        .from("products")
        .select(`*, category:categories(name, slug)`, { count: "exact" })
        .eq("is_active", true);

    if (category) {
        const catObj = categories?.find(c => c.slug === category);
        if (catObj) {
            query = query.eq("category_id", catObj.id);
        } else {
            // Unlikely, but if category slug is invalid, force empty results or ignore
            query = query.eq("category_id", "00000000-0000-0000-0000-000000000000"); // Fake UUID
        }
    }
    if (material) query = query.textSearch("material", material);
    if (minPrice !== undefined) query = query.gte("price", minPrice);
    if (maxPrice !== undefined) query = query.lte("price", maxPrice);

    // Sorting
    switch (sort) {
        case "price_asc":
            query = query.order("price", { ascending: true });
            break;
        case "price_desc":
            query = query.order("price", { ascending: false });
            break;
        case "popular":
            query = query.order("sold_count", { ascending: false, nullsFirst: false });
            break;
        case "newest":
        default:
            query = query.order("created_at", { ascending: false });
            break;
    }

    // Pagination
    query = query.range(from, to);

    const { data: products, count } = await query;

    const totalPages = count ? Math.ceil(count / limit) : 0;

    const buildPaginationUrl = (newPage: number) => {
        const urlParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                if (Array.isArray(value)) value.forEach(v => urlParams.append(key, v));
                else urlParams.set(key, value.toString());
            }
        });
        urlParams.set("page", newPage.toString());
        return `/products?${urlParams.toString()}`;
    };

    return (
        <div className="container mx-auto px-4 lg:px-8 py-8 mb-16">
            {/* Hero Section */}
            <div className="bg-primary/5 rounded-2xl p-8 mb-8 text-center border border-primary/10">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-primary mb-3">Koleksi Produk Alma Shop</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Temukan berbagai macam sarung tenun, batik, dan sutra kualitas premium yang dibuat dengan penuh ketelitian dan nilai estetika tinggi.
                </p>
            </div>

            {/* Layout Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 pb-4 border-b border-border">
                <p className="text-muted-foreground text-sm font-medium w-full md:w-auto text-center md:text-left">
                    Menampilkan produk {products?.length ? from + 1 : 0}-{Math.min(to + 1, count || 0)} dari {count || 0}
                </p>
                <div className="w-full md:w-auto flex justify-end">
                    <ProductFiltersMobile categories={categories || []} />
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Desktop Sidebar Filters */}
                <div className="hidden md:block w-64 shrink-0">
                    <ProductFilters categories={categories || []} />
                </div>

                {/* Product Area */}
                <div className="flex-1">
                    {/* Grid */}
                    {products && products.length > 0 ? (
                        <ProductGrid products={products} columns={{ sm: 2, md: 3, lg: 3, xl: 4 }} />
                    ) : (
                        <div className="text-center py-20 border border-dashed border-border rounded-xl bg-muted/20">
                            <h3 className="text-lg font-medium">Produk Tidak Ditemukan</h3>
                            <p className="text-muted-foreground mt-2">Coba ubah filter atau kriteria pencarian Anda.</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-12 flex items-center justify-center gap-4 pt-8">
                            {page > 1 ? (
                                <Link
                                    href={buildPaginationUrl(page - 1)}
                                    className="px-4 py-2 border border-border rounded-md hover:bg-muted text-sm font-medium transition-colors"
                                >
                                    Sebelumnya
                                </Link>
                            ) : (
                                <span className="px-4 py-2 border border-border rounded-md opacity-50 text-sm font-medium cursor-not-allowed">
                                    Sebelumnya
                                </span>
                            )}

                            <span className="text-sm font-medium text-muted-foreground">
                                Halaman <strong className="text-foreground">{page}</strong> dari {totalPages}
                            </span>

                            {page < totalPages ? (
                                <Link
                                    href={buildPaginationUrl(page + 1)}
                                    className="px-4 py-2 border border-border rounded-md hover:bg-muted text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                    Selanjutnya
                                </Link>
                            ) : (
                                <span className="px-4 py-2 border border-border rounded-md opacity-50 text-sm font-medium cursor-not-allowed">
                                    Selanjutnya
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
