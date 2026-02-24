"use client";

import { ProductGrid } from "@/components/product/ProductGrid";
import { Product } from "@/types";
import { ChevronRight, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface FlashSaleSectionProps {
    products: Product[];
    endTime: Date;
}

export function FlashSaleSection({ products, endTime }: FlashSaleSectionProps) {
    const [timeLeft, setTimeLeft] = useState<{
        hours: number;
        minutes: number;
        seconds: number;
    }>({ hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = endTime.getTime() - new Date().getTime();

            if (difference > 0) {
                setTimeLeft({
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [endTime]);

    if (!products || products.length === 0) return null;

    return (
        <section className="py-12 relative">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-64 bg-[#ff6b6b]/5 blur-[100px] rounded-full pointer-events-none -z-10" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 bg-gradient-to-r from-[#ff6b6b] to-[#ff4757] p-6 rounded-[24px] text-white shadow-xl shadow-red-500/20 relative overflow-hidden">
                {/* Decorative Abstract Shapes */}
                <div className="absolute -right-10 -top-20 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute left-40 -bottom-20 w-40 h-40 bg-white/10 rounded-full blur-2xl" />

                <div className="flex flex-col sm:flex-row sm:items-center gap-6 relative z-10 w-full lg:w-auto">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner border border-white/20">
                            <Zap className="h-6 w-6 text-yellow-300 fill-yellow-300 animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-display font-black tracking-tight drop-shadow-sm">FLASH SALE</h2>
                            <p className="text-white/90 text-sm font-semibold tracking-wide">DISKON KILAT HARI INI</p>
                        </div>
                    </div>

                    <div className="h-10 w-px bg-white/20 hidden sm:block mx-2"></div>

                    {/* Countdown Timer Modern */}
                    <div className="flex items-center gap-2">
                        <div className="flex flex-col items-center">
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl w-12 h-12 flex items-center justify-center text-xl font-bold shadow-inner">
                                {timeLeft.hours.toString().padStart(2, "0")}
                            </div>
                            <span className="text-[10px] font-bold mt-1 opacity-80 uppercase tracking-widest">Jam</span>
                        </div>
                        <span className="font-bold text-xl self-start mt-2 opacity-50">:</span>
                        <div className="flex flex-col items-center">
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl w-12 h-12 flex items-center justify-center text-xl font-bold shadow-inner">
                                {timeLeft.minutes.toString().padStart(2, "0")}
                            </div>
                            <span className="text-[10px] font-bold mt-1 opacity-80 uppercase tracking-widest">Mnt</span>
                        </div>
                        <span className="font-bold text-xl self-start mt-2 opacity-50">:</span>
                        <div className="flex flex-col items-center">
                            <div className="bg-white text-[#ff4757] rounded-xl w-12 h-12 flex items-center justify-center text-xl font-black shadow-lg shadow-white/10 animate-pulse">
                                {timeLeft.seconds.toString().padStart(2, "0")}
                            </div>
                            <span className="text-[10px] font-bold mt-1 opacity-80 uppercase tracking-widest text-[#ffdfdf]">Dtk</span>
                        </div>
                    </div>
                </div>

                <Link href="/flash-sale" className="relative z-10 hidden lg:flex items-center gap-2 text-sm font-bold bg-white text-[#ff4757] px-6 py-3 rounded-full hover:bg-gray-50 transition-transform active:scale-95 shadow-md">
                    Lihat Semua Promo <ChevronRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="relative z-10">
                <ProductGrid products={products.slice(0, 4)} />
            </div>

            <Link href="/flash-sale" className="w-full mt-6 bg-red-50 text-[#ff4757] flex lg:hidden items-center justify-center gap-2 font-bold py-4 rounded-xl active:scale-95 transition-transform">
                Lihat Semua Flash Sale <ChevronRight className="h-5 w-5" />
            </Link>
        </section>
    );
}
