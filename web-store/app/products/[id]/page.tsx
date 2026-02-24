import { ProductActions } from "@/components/product/ProductActions";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ReviewList } from "@/components/product/ReviewList";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { Product } from "@/types";
import { createClient as createStaticClient } from "@supabase/supabase-js";
import { Star } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const getStaticSupabase = () => createStaticClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function generateMetadata(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    props: { params: Promise<any> }
): Promise<Metadata> {
    const params = await props.params;
    const id = params.id;
    const supabase = getStaticSupabase();
    const { data: product } = await supabase
        .from("products")
        .select("name, description, images")
        .eq("id", id)
        .single();

    if (!product) return { title: "Produk Tidak Ditemukan" };

    return {
        title: `${product.name} | Alma Shop`,
        description: product.description || `Beli ${product.name} kualitas terbaik dengan harga spesial di Alma Shop.`,
        openGraph: {
            images: product.images && product.images.length > 0 ? [product.images[0]] : [],
        }
    };
}

export default async function ProductDetailPage({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params,
}: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("products")
        .select(`*, category:categories(name, slug)`)
        .eq("id", id)
        .single();

    if (error || !data) {
        notFound();
    }

    const product = data as Product;

    // Fetch Related Products
    const { data: relatedData } = await supabase
        .from("products")
        .select(`*, category:categories(name, slug)`)
        .eq("category_id", product.category_id)
        .neq("id", product.id)
        .limit(4);

    const relatedProducts = (relatedData || []) as Product[];

    // Render Product Schema for SEO
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        image: product.images,
        description: product.description,
        sku: product.id,
        offers: {
            "@type": "Offer",
            url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/products/${product.id}`,
            priceCurrency: "IDR",
            price: product.price,
            itemCondition: "https://schema.org/NewCondition",
            availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        },
    };

    const discountPercentage =
        product.original_price && product.original_price > product.price
            ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
            : 0;

    return (
        <div className="container mx-auto px-4 lg:px-8 py-8 md:py-12">
            {/* Inject JSON-LD Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Breadcrumb Navigation - Simple version */}
            <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
                <Link href="/" className="hover:text-primary transition-colors">Beranda</Link>
                <span>/</span>
                <Link href="/products" className="hover:text-primary transition-colors">Produk</Link>
                <span>/</span>
                {product.category && (
                    <>
                        <Link href={`/categories/${product.category.slug}`} className="hover:text-primary transition-colors">
                            {product.category.name}
                        </Link>
                        <span>/</span>
                    </>
                )}
                <span className="text-foreground truncate overflow-hidden max-w-[200px] sm:max-w-none">{product.name}</span>
            </nav>

            <div className="flex flex-col lg:flex-row gap-10 xl:gap-16">
                {/* Left: Gallery */}
                <div className="w-full lg:w-[45%] xl:w-1/2">
                    <ProductGallery images={product.images || []} />
                </div>

                {/* Right: Info Area (Sticky on Desktop) */}
                <div className="w-full lg:w-[55%] xl:w-1/2 flex flex-col lg:sticky lg:top-24 h-fit">
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        {product.is_featured && (
                            <span
                                className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide"
                                style={{ backgroundColor: '#FFB13B', color: '#ffffff' }}
                            >
                                ✦ Rekomendasi Teratas
                            </span>
                        )}
                        {product.category && (
                            <Link href={`/categories/${product.category.slug}`}>
                                <span
                                    className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-medium border"
                                    style={{ backgroundColor: 'rgba(255,107,87,0.1)', color: '#FF6B57', borderColor: 'rgba(255,107,87,0.25)' }}
                                >
                                    {product.category.name}
                                </span>
                            </Link>
                        )}
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4 tracking-tight leading-[1.15]">
                        {product.name}
                    </h1>

                    {/* Rating & Sold Grouping */}
                    <div className="flex items-center gap-3 text-sm mb-6">
                        <div
                            className="flex items-center gap-1.5 font-bold px-2.5 py-1 rounded-md"
                            style={{ backgroundColor: 'rgba(255,177,59,0.12)', color: '#FFB13B' }}
                        >
                            <Star className="h-4 w-4" style={{ fill: '#FFB13B', color: '#FFB13B' }} />
                            <span>{product.rating?.toFixed(1) || "0.0"}</span>
                        </div>
                        <span className="text-muted-foreground/40">•</span>
                        <div className="text-muted-foreground font-medium flex items-center gap-1.5">
                            Terjual <span className="text-foreground font-bold">{product.sold_count || 0}</span>
                        </div>
                    </div>

                    {/* Price Grouping */}
                    <div className="flex items-end gap-3 mb-8 p-5 rounded-2xl border" style={{ backgroundColor: 'rgba(248,250,252,0.6)', borderColor: 'rgba(227,232,239,0.5)' }}>
                        <span className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
                            {formatCurrency(product.price)}
                        </span>
                        {discountPercentage > 0 && product.original_price && (
                            <div className="flex flex-col justify-end pb-1.5">
                                <span
                                    className="text-xs px-2 py-0.5 rounded font-bold self-start mb-1 whitespace-nowrap"
                                    style={{ backgroundColor: 'rgba(255,62,56,0.1)', color: '#FF3E38' }}
                                >
                                    Hemat {discountPercentage}%
                                </span>
                                <span className="text-sm font-medium text-muted-foreground line-through">
                                    {formatCurrency(product.original_price)}
                                </span>
                            </div>
                        )}
                    </div>

                    <Separator className="mb-6" />

                    {/* Accordion Details */}
                    <Accordion type="single" collapsible defaultValue="description" className="w-full mt-4 mb-8">
                        <AccordionItem value="description" className="border-border">
                            <AccordionTrigger className="text-base font-semibold hover:no-underline hover:text-primary transition-colors">Deskripsi Produk</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground prose prose-sm leading-relaxed max-w-none pb-4">
                                <p>{product.description}</p>
                            </AccordionContent>
                        </AccordionItem>

                        {(product.material || product.care_instructions) && (
                            <AccordionItem value="details" className="border-border">
                                <AccordionTrigger className="text-base font-semibold hover:no-underline hover:text-primary transition-colors">Bahan & Perawatan</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground space-y-3 pb-4">
                                    {product.material && <div><span className="font-semibold text-foreground">Bahan:</span> {product.material}</div>}
                                    {product.care_instructions && <div><span className="font-semibold text-foreground">Perawatan:</span> {product.care_instructions}</div>}
                                </AccordionContent>
                            </AccordionItem>
                        )}

                        <AccordionItem value="shipping" className="border-border">
                            <AccordionTrigger className="text-base font-semibold hover:no-underline hover:text-primary transition-colors">Pengiriman & Garansi</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground space-y-3 pb-4">
                                <div className="flex gap-2">
                                    <span className="font-semibold text-foreground shrink-0 w-24">Pengiriman:</span>
                                    <span>Tersedia Reguler (3-5 hari) dan Kilat (1-2 hari).</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="font-semibold text-foreground shrink-0 w-24">Garansi:</span>
                                    <span>Tukar size/warna 7 hari sejak barang diterima. S&K berlaku.</span>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    {/* User Actions */}
                    <ProductActions product={product} />
                </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-16 sm:mt-24">
                <ReviewList productId={product.id} />
            </div>

            {/* Related Products Section */}
            {relatedProducts.length > 0 && (
                <div className="mt-16 sm:mt-24 pt-16 border-t border-border">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-1.5">Pilihan {product.category?.name || 'Lainnya'}</h2>
                            <p className="text-muted-foreground text-sm">Eksplorasi koleksi terbaik kami untuk Anda.</p>
                        </div>
                        <Link href={`/categories/${product.category?.slug}`} className="inline-flex items-center text-sm font-bold text-primary hover:text-primary/80 transition-all group">
                            Lihat Semua
                            <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {relatedProducts.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
