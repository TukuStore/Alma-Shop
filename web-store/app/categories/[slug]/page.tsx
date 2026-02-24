import { ProductFilters } from "@/components/product/ProductFilters";
import { ProductFiltersMobile } from "@/components/product/ProductFiltersMobile";
import { ProductGrid } from "@/components/product/ProductGrid";
import { createClient } from "@/lib/supabase/server";
import { createClient as createStaticClient } from "@supabase/supabase-js";
import { Metadata } from "next";
import { notFound } from "next/navigation";

const getStaticSupabase = () => createStaticClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function generateMetadata(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    props: { params: Promise<any> }
): Promise<Metadata> {
    const params = await props.params;
    const slug = params.slug;
    const supabase = getStaticSupabase();
    const { data: category } = await supabase
        .from("categories")
        .select("name, description")
        .eq("slug", slug)
        .single();

    if (!category) return { title: "Kategori Tidak Ditemukan" };

    return {
        title: `Jual Sarung ${category.name} Premium | Alma Shop`,
        description: category.description || `Koleksi terbaik sarung ${category.name} original di Alma Shop.`,
    };
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface CategoryPageProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: Promise<any>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const slug = resolvedParams.slug;
    const supabase = await createClient();

    // 1. Fetch Category Info
    const { data: category, error: catError } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .single();

    if (catError || !category) {
        notFound();
    }

    // Fetch all categories for the sidebar
    const { data: allCategories } = await supabase.from("categories").select("*");

    // 2. Parse Search Params
    const sort = typeof resolvedSearchParams.sort === "string" ? resolvedSearchParams.sort : "newest";
    const minPrice = typeof resolvedSearchParams.min_price === "string" ? parseFloat(resolvedSearchParams.min_price) : undefined;
    const maxPrice = typeof resolvedSearchParams.max_price === "string" ? parseFloat(resolvedSearchParams.max_price) : undefined;
    const page = typeof resolvedSearchParams.page === "string" ? parseInt(resolvedSearchParams.page) : 1;
    const limit = 16;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // 3. Query Products
    let query = supabase
        .from("products")
        .select(`*, category:categories(name, slug)`, { count: "exact" })
        .eq("is_active", true)
        .eq("category_id", category.id);

    if (minPrice !== undefined) query = query.gte("price", minPrice);
    if (maxPrice !== undefined) query = query.lte("price", maxPrice);

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

    const { data: products, count } = await query.range(from, to);

    return (
        <div className="container mx-auto px-4 lg:px-8 py-8">
            {/* Category Header */}
            <div className="bg-muted/30 rounded-2xl p-6 lg:p-10 mb-8 border border-border">
                <h1 className="text-3xl lg:text-4xl font-display font-bold mb-3">{category.name}</h1>
                <p className="text-muted-foreground max-w-2xl">{category.description || `Jelajahi koleksi ${category.name} terbaik kami yang memadukan tradisi Nusantara dengan gaya hidup modern.`}</p>
            </div>

            <div className="flex flex-col md:flex-row items-end justify-between mb-8 gap-4 border-b border-border pb-6">
                <div>
                    <h2 className="text-xl font-semibold">Produk ({count || 0})</h2>
                </div>
                <div className="w-full md:w-auto flex justify-end">
                    {/* Mobile filter uses allCategories, but we only really need Price & sorting, so we can hide category radio or let it navigate out */}
                    <ProductFiltersMobile categories={allCategories || []} />
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Desktop Sidebar Filters */}
                <div className="hidden md:block w-64 shrink-0">
                    <ProductFilters categories={allCategories || []} />
                </div>

                {/* Product Grid */}
                <div className="flex-1">
                    {products && products.length > 0 ? (
                        <ProductGrid products={products} columns={{ sm: 2, md: 3, lg: 3, xl: 4 }} />
                    ) : (
                        <div className="text-center py-20 border border-dashed border-border rounded-xl bg-muted/20">
                            <h3 className="text-lg font-medium">Belum Ada Produk</h3>
                            <p className="text-muted-foreground mt-2">Koleksi untuk kategori ini sedang kami siapkan.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
