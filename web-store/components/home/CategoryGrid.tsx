import { Category } from "@/types";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface CategoryGridProps {
    categories: Category[];
}

const FALLBACK_CATEGORY_IMAGES: Record<string, string> = {
    "sarung-tenun": "/assets/images/category/sarung songket.png",
    "sarung-wadimor": "/assets/images/category/sarung batik goyor.jpg",
    "sarung-gajah": "/assets/images/category/Sarung Sutra Spunsilk.jpg",
    "sarung-mangga": "/assets/images/category/sarung batik printing.jpg",
    "sarung-atlas": "/assets/images/category/sarung  polyester_katun.jpg",
    "sarung-hitam": "/assets/images/category/satung batik cap.jpg",
    "sarung-putih": "/assets/images/category/sarung batik tulis.jpg",
    "sarung-motif": "/assets/images/category/sarung batik kombinasi.jpg",
};

export function CategoryGrid({ categories }: CategoryGridProps) {
    return (
        <section className="py-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl md:text-3xl font-display font-extrabold text-gray-900 tracking-tight">Eksplor Kategori</h2>
                    <p className="text-gray-500 font-medium mt-1">Temukan corak sarung pilihan yang sesuai seleramu.</p>
                </div>
                <Link href="/products" className="hidden sm:flex text-sm font-bold text-[#5a7bed] hover:text-[#4e81ff] items-center gap-1 group">
                    Lihat Semua
                    <div className="w-6 h-6 rounded-full bg-[#5a7bed]/10 flex items-center justify-center group-hover:bg-[#5a7bed] group-hover:text-white transition-colors">
                        <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                </Link>
            </div>

            <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-4 md:gap-6">
                {categories.slice(0, 8).map((cat, index) => {
                    const slug = cat.slug || cat.name.toLowerCase().replace(/[\s/]+/g, "-");
                    const isRemoteUrl = cat.image_url && cat.image_url.startsWith("http");
                    const imageUrl = (isRemoteUrl ? cat.image_url : FALLBACK_CATEGORY_IMAGES[slug]) || "https://images.unsplash.com/photo-1610448777093-6a563fc19572?q=80&w=600&auto=format&fit=crop";

                    const animationDelay = `${index * 50}ms`;

                    return (
                        <Link
                            key={cat.id}
                            href={`/categories/${slug}`}
                            style={{ animationDelay, animationFillMode: 'both' }}
                            className="group flex flex-col items-center text-center gap-3 animate-in slide-in-from-bottom-8 fade-in duration-500"
                        >
                            <div className="relative w-16 h-16 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-[24px] sm:rounded-full bg-white p-2 shadow-sm border border-gray-100 group-hover:shadow-xl group-hover:shadow-blue-500/10 group-hover:border-[#5a7bed]/30 transition-all duration-300">
                                <div className="w-full h-full rounded-[16px] sm:rounded-full overflow-hidden relative bg-gray-50">
                                    <Image
                                        src={imageUrl}
                                        alt={cat.name}
                                        fill
                                        className="object-cover transform transition-transform duration-700 group-hover:scale-110"
                                        sizes="(max-width: 768px) 25vw, 12vw"
                                    />
                                    {/* Subtle Overlay on hover */}
                                    <div className="absolute inset-0 bg-[#5a7bed]/0 group-hover:bg-[#5a7bed]/10 transition-colors duration-300" />
                                </div>
                            </div>
                            <h3 className="text-xs sm:text-sm font-bold text-gray-700 group-hover:text-[#5a7bed] transition-colors line-clamp-2 max-w-[90%] mx-auto leading-tight mt-1">
                                {cat.name}
                            </h3>
                        </Link>
                    );
                })}
            </div>

            <div className="mt-6 flex justify-center sm:hidden">
                <Link href="/products" className="text-sm font-bold text-[#5a7bed] flex items-center gap-2 bg-[#5a7bed]/5 px-4 py-2 rounded-full active:scale-95 transition-transform">
                    Lihat Semua Kategori <ChevronRight className="w-4 h-4" />
                </Link>
            </div>
        </section>
    );
}
