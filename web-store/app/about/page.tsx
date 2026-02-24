import { ArrowRight, CheckCircle2, Leaf, ShieldCheck, Zap } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Tentang Kami | Alma Shop",
    description: "Kenali lebih dekat Alma Shop, destinasi utama Anda untuk koleksi sarung premium dengan sentuhan tradisi dan modernitas.",
};

const VALUES = [
    {
        title: "Kualitas Premium",
        description: "Setiap helai sarung dikurasi dari bahan berkualitas tinggi, memberikan kenyamanan maksimal untuk setiap momen Anda.",
        icon: ShieldCheck,
    },
    {
        title: "Kaya akan Tradisi",
        description: "Kami mempertahankan nilai warisan budaya nusantara (Heritage) yang disajikan dengan gaya modern.",
        icon: Leaf,
    },
    {
        title: "Pelayanan Cepat",
        description: "Pengiriman kilat dan layanan pelanggan yang siap membantu Anda kapan saja.",
        icon: Zap,
    },
    {
        title: "Jaminan Keaslian",
        description: "Semua produk yang kami jual, mulai dari BHS hingga Atlas, dijamin 100% original.",
        icon: CheckCircle2,
    },
];

const IMAGES = [
    "/assets/images/about/download (3).png",
    "/assets/images/about/download (4).png",
    "/assets/images/about/download (5).png",
    "/assets/images/about/download (6).png",
    "/assets/images/about/download (7).png",
];

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-primary py-24 md:py-32">
                <div className="absolute inset-x-0 bottom-0 top-0 opacity-10" style={{
                    backgroundImage: 'url("https://www.transparenttextures.com/patterns/arabesque.png")'
                }}></div>
                <div className="container relative mx-auto px-4 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-display font-bold text-primary-foreground mb-6">
                        Merawat Tradisi, <br className="hidden md:block" />
                        <span className="text-primary-foreground/90">Menyempurnakan Gaya</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg md:text-xl text-primary-foreground/80 font-medium">
                        Alma Shop adalah penyedia sarung premium yang menggabungkan nilai-nilai "Heritage" Nusantara dengan balutan "Modernity". Kami berkomitmen untuk selalu menemani langkah ibadah dan gaya hidup Anda.
                    </p>
                </div>
            </section>

            {/* Core Values Section */}
            <section className="py-20 bg-background">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Nilai Kami</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Fundamental kami dalam setiap pelayanan dan kurasi produk yang kami tawarkan kepada Anda.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {VALUES.map((val, i) => (
                            <div key={i} className="flex flex-col items-center text-center p-6 rounded-[24px] bg-muted/40 border border-border/50 hover:bg-muted/80 transition-colors">
                                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
                                    <val.icon className="h-7 w-7" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{val.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{val.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Gallery Section */}
            <section className="py-20 bg-muted/20">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                        <div className="max-w-xl">
                            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Kisah Dibalik Pembuatan</h2>
                            <p className="text-muted-foreground">
                                Intip sekilas perjalanan sarung-sarung cantik yang kami sediakan. Mulai dari dedikasi terhadap kelembutan benang hingga sentuhan akhir di tangan pengrajin motif terbaik.
                            </p>
                        </div>
                        <Link href="/products" className="inline-flex items-center justify-center h-12 px-6 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all gap-2 self-start md:self-auto shrink-0 shadow-sm hover:shadow-md hover:-translate-y-0.5">
                            Jelajahi Produk
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {/* Gallery Grid - Masonry style feel */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {IMAGES.map((src, index) => {
                            // Creates a staggered/bento-box height effect for 5 items
                            let specializedClasses = 'h-[200px] md:h-[300px]'; // Normal

                            if (index === 0) {
                                specializedClasses = 'col-span-2 md:col-span-2 lg:col-span-2 h-[250px] md:h-[400px]'; // Featured wide
                            } else if (index === 3) {
                                specializedClasses = 'col-span-2 md:col-span-1 lg:col-span-1 h-[250px] md:h-[300px]';
                            } else if (index === 4) {
                                specializedClasses = 'col-span-2 md:col-span-2 lg:col-span-2 h-[250px] md:h-[300px]';
                            }

                            return (
                                <div
                                    key={src}
                                    className={`relative rounded-[24px] overflow-hidden bg-muted group ${specializedClasses}`}
                                >
                                    <Image
                                        src={src}
                                        alt={`Dokumentasi Alma Shop ${index + 1}`}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
        </div>
    );
}
