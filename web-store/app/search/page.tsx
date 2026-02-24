import { ProductGrid } from "@/components/product/ProductGrid";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { ArrowRight, FlagTriangleRight, SearchIcon } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Hasil Pencarian | Alma Shop",
    description: "Cari produk sarung, batik, tenun, dan busana muslim premium di Alma Shop.",
};

interface SearchPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const params = await searchParams;
    const q = typeof params.q === "string" ? params.q : "";
    const page = typeof params.page === "string" ? parseInt(params.page) : 1;
    const limit = 16;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const supabase = await createClient();

    let query = supabase
        .from("products")
        .select(`*, category:categories(name, slug)`, { count: "exact" })
        .eq("is_active", true);

    if (q) {
        query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
    }

    query = query.order("created_at", { ascending: false }).range(from, to);

    const { data: products, count } = await query;

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Search Header Banner */}
            <div className="bg-white border-b border-gray-100 pt-16 pb-12 mb-10 overflow-hidden relative">
                {/* Visual decorations */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#5a7bed]/5 rounded-bl-[100px] -z-0"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#ff6b6b]/5 rounded-tr-[100px] -z-0"></div>

                <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center max-w-2xl">
                    <div className="w-16 h-16 mx-auto bg-[#5a7bed]/10 rounded-full flex items-center justify-center mb-6 shadow-inner border border-blue-500/10">
                        <SearchIcon className="w-8 h-8 text-[#5a7bed]" />
                    </div>

                    <h1 className="text-3xl md:text-5xl font-display font-black text-gray-900 tracking-tight mb-4">
                        {q ? <><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5a7bed] to-[#4e81ff]">"{q}"</span></> : "Pencarian Produk"}
                    </h1>

                    <p className="text-gray-500 font-medium text-lg">
                        {q ? (
                            <>Menemukan <strong className="text-gray-900 border-b-2 border-[#5a7bed]/30 pb-0.5">{count || 0} koleksi</strong> sarung pilihan dan motif terkait hasil penelusuran Anda.</>
                        ) : (
                            "Silakan masukkan kata kunci pada kolom pencarian untuk menemukan koleksi sarung premium."
                        )}
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 lg:px-8 max-w-7xl animate-in fade-in fill-mode-both duration-700">
                {products && products.length > 0 ? (
                    <ProductGrid products={products} columns={{ sm: 2, md: 3, lg: 4, xl: 4 }} />
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 px-6 bg-white border border-gray-100 rounded-[32px] text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-3xl mx-auto">
                        <div className="w-24 h-24 bg-gray-50 rounded-[24px] flex items-center justify-center mb-8 border border-gray-100 shadow-sm rotate-3 hover:rotate-0 transition-transform duration-500">
                            <FlagTriangleRight className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Oops! Tidak ada hasil</h3>
                        <p className="text-gray-500 font-medium max-w-md leading-relaxed mb-8">
                            Kami tidak dapat menemukan produk yang sesuai dengan kata kunci <strong className="text-gray-900 bg-gray-100 px-2 py-1 rounded-md">"{q}"</strong>.
                            Coba gunakan kata kunci lain yang lebih umum atau periksa ejaan Anda.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/">
                                <Button className="h-12 w-full sm:w-auto rounded-full bg-[#5a7bed] hover:bg-[#4e81ff] text-white font-bold px-8 shadow-lg shadow-blue-500/25 transition-transform active:scale-95">
                                    Kembali ke Beranda
                                </Button>
                            </Link>
                            <Link href="/products">
                                <Button variant="outline" className="h-12 w-full sm:w-auto rounded-full bg-white border-gray-200 text-gray-700 font-bold px-8 hover:bg-gray-50 transition-colors">
                                    Jelajahi Semua Produk <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}

                {/* Optional Pagination placeholder can be added here if needed */}
            </div>
        </div>
    );
}
