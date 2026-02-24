"use client";

import { Button } from "@/components/ui/button";
import { HeroSlider } from "@/types";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronRight, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

interface HeroBannerProps {
    sliders: HeroSlider[];
}

export function HeroBanner({ sliders }: HeroBannerProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 40 });
    const [selectedIndex, setSelectedIndex] = useState(0);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;

        onSelect();
        emblaApi.on("select", onSelect);
        emblaApi.on("reInit", onSelect);

        const intervalId = setInterval(() => {
            if (emblaApi.canScrollNext()) {
                emblaApi.scrollNext();
            } else {
                emblaApi.scrollTo(0);
            }
        }, 6000);

        return () => clearInterval(intervalId);
    }, [emblaApi, onSelect]);

    if (!sliders || sliders.length === 0) {
        return (
            <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] bg-gray-100 flex items-center justify-center animate-pulse rounded-[32px]">
                <div className="w-16 h-16 bg-gray-200 rounded-full animate-ping"></div>
            </div>
        );
    }

    return (
        <div className="relative w-full rounded-[32px] overflow-hidden bg-gray-50 shadow-2xl shadow-gray-200 border border-gray-100 group animate-in zoom-in-95 duration-700">
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex touch-pan-y">
                    {sliders.map((slider, index) => {
                        const isActive = index === selectedIndex;

                        return (
                            <div
                                key={slider.id}
                                className="relative min-w-0 flex-[0_0_100%] aspect-[4/3] sm:aspect-[16/9] lg:h-[600px] overflow-hidden"
                            >
                                <Image
                                    src={slider.image_url}
                                    alt={slider.title || `Promo Banner ${index + 1}`}
                                    fill
                                    className={`object-cover transition-transform duration-[10000ms] ease-linear ${isActive ? "scale-110" : "scale-100"}`}
                                    priority={index === 0}
                                    sizes="100vw"
                                />

                                {/* Deep Gradient Overlay for Text Readability & Premium Feeling */}
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent flex items-end sm:bg-gradient-to-r sm:from-gray-900/90 sm:via-gray-900/50 sm:items-center">
                                    <div className="p-8 sm:p-12 lg:p-20 max-w-3xl transform transition-all duration-1000">

                                        {slider.subtitle && (
                                            <div className={`overflow-hidden mb-3 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} transition-all duration-700 delay-100`}>
                                                <span className="inline-block px-3 py-1 bg-[#5a7bed]/20 backdrop-blur-md border border-[#5a7bed]/30 text-[#5a7bed] text-xs font-black tracking-[0.15em] uppercase rounded-full shadow-sm">
                                                    {slider.subtitle}
                                                </span>
                                            </div>
                                        )}

                                        {slider.title && (
                                            <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-black text-white mb-6 leading-[1.1] tracking-tight drop-shadow-lg ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'} transition-all duration-700 delay-200`}>
                                                {slider.title}
                                            </h2>
                                        )}

                                        {slider.cta_text && (
                                            <div className={`${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} transition-all duration-700 delay-300 flex flex-wrap gap-4`}>
                                                <Link href={slider.cta_link || "/products"}>
                                                    <Button size="lg" className="h-14 rounded-full bg-[#5a7bed] hover:bg-[#4e81ff] text-white font-bold px-8 shadow-xl shadow-blue-500/30 transition-transform active:scale-95 group/btn">
                                                        {slider.cta_text}
                                                        <ChevronRight className="ml-2 h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                                                    </Button>
                                                </Link>

                                                <Link href="/about">
                                                    <Button size="lg" variant="outline" className="h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold px-8 hover:bg-white/20 hover:text-white transition-all">
                                                        <Play className="mr-2 h-5 w-5 fill-white" /> Koleksi Video
                                                    </Button>
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Pagination Line Indicators */}
            {sliders.length > 1 && (
                <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-3 z-20">
                    <div className="bg-gray-900/30 backdrop-blur-md p-2 rounded-full flex gap-2 border border-white/10 shadow-sm">
                        {sliders.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => emblaApi?.scrollTo(index)}
                                className={`h-1.5 rounded-full transition-all duration-500 ease-in-out ${index === selectedIndex ? "w-8 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"}`}
                                aria-label={`Promo slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Ambient Background Glow Effect hidden behind the image border */}
            <div className="absolute inset-0 rounded-[32px] ring-1 ring-inset ring-white/10 pointer-events-none z-10" />
        </div>
    );
}
