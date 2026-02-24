import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FlashSaleSection } from "@/components/home/FlashSaleSection";
import { HeroBanner } from "@/components/home/HeroBanner";
import { ProductGrid } from "@/components/product/ProductGrid";
import { createClient } from "@/lib/supabase/server";
import { ChevronRight, Crown, Medal, ShieldCheck, Star, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage(props: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const pageParam = searchParams?.page;
  const page = typeof pageParam === "string" ? parseInt(pageParam) : 1;
  const validPage = isNaN(page) || page < 1 ? 1 : page;
  const limit = 20;
  const from = (validPage - 1) * limit;
  const to = from + limit - 1;

  const supabase = await createClient();

  const { data: sliders } = await supabase
    .from("hero_sliders")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .limit(8);

  const { data: featuredProducts } = await supabase
    .from("products")
    .select(`*, category:categories(name, slug)`)
    .eq("is_active", true)
    .order("sold_count", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(8);

  const { data: flashDealsRaw } = await supabase
    .from("products")
    .select(`*, category:categories(name, slug)`)
    .eq("is_active", true)
    .limit(6);

  const flashSaleProducts = (flashDealsRaw || []).map(p => ({
    ...p,
    original_price: p.original_price || Math.floor(p.price * 1.3),
  }));

  const { data: allProducts, count: allProductsCount } = await supabase
    .from("products")
    .select(`*, category:categories(name, slug)`, { count: "exact" })
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = allProductsCount ? Math.ceil(allProductsCount / limit) : 1;

  const flashSaleEndTime = new Date();
  flashSaleEndTime.setHours(23, 59, 59, 999);

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 pt-10">

      {/* Background Soft Glows */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-br from-[#5a7bed]/5 via-[#4e81ff]/5 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 space-y-20 relative z-10">

        {/* Modern Framed Hero Section */}
        <section className="animate-in slide-in-from-bottom-8 duration-700 fade-in">
          <HeroBanner sliders={sliders || []} />
        </section>

        {/* Feature Highlights (Value Prepositions) */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 animate-in slide-in-from-bottom-12 duration-1000">
          {[
            { icon: Crown, title: "Kualitas Premium", desc: "Sarung pilihan nomor satu", color: "text-amber-500", bg: "bg-amber-100" },
            { icon: ShieldCheck, title: "100% Asli", desc: "Garansi produk original", color: "text-green-500", bg: "bg-green-100" },
            { icon: Truck, title: "Gratis Ongkir", desc: "S&K Berlaku seluruh ID", color: "text-[#5a7bed]", bg: "bg-blue-100" },
            { icon: Star, title: "Rating Tinggi", desc: "Dipercaya >10k pembeli", color: "text-purple-500", bg: "bg-purple-100" },
          ].map((feature, i) => (
            <div key={i} className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 p-5 rounded-[24px] bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className={`w-12 h-12 rounded-[16px] ${feature.bg} flex items-center justify-center shrink-0`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm md:text-base leading-tight">{feature.title}</h3>
                <p className="text-gray-500 text-xs md:text-sm font-medium mt-1">{feature.desc}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Circle Category section */}
        <CategoryGrid categories={categories || []} />

        {/* Highlight Flash Sale with Red Gradients */}
        {flashSaleProducts.length > 0 && (
          <FlashSaleSection products={flashSaleProducts} endTime={flashSaleEndTime} />
        )}

        {/* Featured / Best Sellers Section */}
        <section className="py-12 border-t border-gray-200 border-dashed">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                <Medal className="w-8 h-8 text-amber-500 fill-amber-100" /> Koleksi Terlaris
              </h2>
              <p className="text-gray-500 font-medium mt-1 ml-10">Pilihan favorit para pelanggan setia Alma Shop.</p>
            </div>
            <Link href="/products?sort=popular" className="hidden sm:flex text-sm font-bold text-[#5a7bed] hover:text-[#4e81ff] items-center gap-1 group bg-white px-5 py-2.5 rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-all">
              Semua Jawara <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <ProductGrid products={featuredProducts || []} />

          <div className="mt-8 text-center sm:hidden">
            <Link href="/products?sort=popular" className="text-sm font-bold text-[#5a7bed] hover:text-[#4e81ff] inline-flex items-center gap-1 bg-white px-6 py-3 rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-all active:scale-95">
              Lihat Jawara Lainnya <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </section>

        {/* Semua Produk Section */}
        <section className="py-12 border-t border-gray-200 border-dashed" id="semua-produk">
          <div className="flex flex-col items-center text-center mb-10 max-w-2xl mx-auto">
            <span className="inline-block px-3 py-1 mb-3 bg-[#5a7bed]/10 text-[#5a7bed] text-xs font-black tracking-widest uppercase rounded-full shadow-sm">
              Katalog Lengkap
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-gray-900 tracking-tight">
              Eksplorasi Sarung Alma
            </h2>
            <p className="text-gray-500 font-medium mt-3 text-lg leading-relaxed">
              Pancarkan pesona Nusantara dengan balutan sarung sutera dan batik asli buatan pengrajin lokal terbaik.
            </p>
          </div>

          <ProductGrid products={allProducts || []} />

          {/* Aesthetic Pagination */}
          {totalPages > 1 && (
            <div className="mt-16 flex justify-center items-center gap-3">
              {validPage > 1 ? (
                <Link scroll={false} href={`/?page=${validPage - 1}#semua-produk`} className="h-12 px-6 flex items-center justify-center bg-white border border-gray-200 rounded-full hover:bg-gray-50 text-[#5a7bed] font-bold transition-colors shadow-sm active:scale-95">
                  <ChevronRight className="w-5 h-5 rotate-180 mr-2" /> Sebelumnya
                </Link>
              ) : (
                <span className="h-12 px-6 flex items-center justify-center bg-gray-50 border border-gray-100 rounded-full text-gray-400 font-bold opacity-50 cursor-not-allowed">
                  <ChevronRight className="w-5 h-5 rotate-180 mr-2" /> Sebelumnya
                </span>
              )}

              <span className="h-12 px-6 flex items-center justify-center bg-gray-900 text-white font-bold rounded-full shadow-lg">
                {validPage} <span className="text-gray-400 mx-2">/</span> {totalPages}
              </span>

              {validPage < totalPages ? (
                <Link scroll={false} href={`/?page=${validPage + 1}#semua-produk`} className="h-12 px-6 flex items-center justify-center bg-white border border-gray-200 rounded-full hover:bg-gray-50 text-[#5a7bed] font-bold transition-colors shadow-sm active:scale-95">
                  Selanjutnya <ChevronRight className="w-5 h-5 ml-2" />
                </Link>
              ) : (
                <span className="h-12 px-6 flex items-center justify-center bg-gray-50 border border-gray-100 rounded-full text-gray-400 font-bold opacity-50 cursor-not-allowed">
                  Selanjutnya <ChevronRight className="w-5 h-5 ml-2" />
                </span>
              )}
            </div>
          )}
        </section>

        {/* Big Impact Brand Story Banner */}
        <section className="mt-20">
          <div className="bg-gray-900 rounded-[40px] overflow-hidden relative shadow-2xl animate-in slide-in-from-bottom-12 duration-1000">
            <Image
              src="https://images.unsplash.com/photo-1610448777093-6a563fc19572?q=80&w=2000&auto=format&fit=crop"
              alt="Pecinta Sarung"
              fill
              className="object-cover opacity-20 mix-blend-overlay"
            />

            {/* Decorative glows */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#5a7bed]/40 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#ff4757]/20 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 py-20 lg:py-32 px-6 sm:px-12 flex flex-col items-center text-center max-w-4xl mx-auto">
              <span className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full text-sm font-bold tracking-widest uppercase mb-8 shadow-inner">
                <Crown className="w-4 h-4 mr-2 text-yellow-400 fill-yellow-400" /> Alma Heritage
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-white mb-6 leading-tight drop-shadow-xl tracking-tight">
                Pesona Warisan Budaya dalam <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-[#5a7bed]">Sehelai Kain</span>
              </h2>
              <p className="text-gray-300 font-medium md:text-lg lg:text-xl mb-12 max-w-2xl leading-relaxed">
                Setiap helai sarung yang kami tawarkan dibuat dengan ketelitian dan dedikasi tinggi, mempertahankan keindahan batik dan sutera Nusantara untuk gaya elegan masa kini.
              </p>
              <Link href="/about" className="h-14 bg-white hover:bg-gray-100 text-gray-900 items-center justify-center rounded-full px-10 text-base font-extrabold shadow-xl shadow-white/10 transition-transform active:scale-95 inline-flex group">
                Kenali Cerita Kami
                <div className="ml-3 w-8 h-8 rounded-full bg-gray-100 group-hover:bg-white border border-gray-200 flex items-center justify-center">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
