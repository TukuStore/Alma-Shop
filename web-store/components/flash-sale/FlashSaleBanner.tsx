"use client";

import { HeroSlider } from "@/types";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const GRADIENTS = [
    { from: "#00D79E", to: "#00C48C", buttonText: "#00D79E" },
    { from: "#FFB13B", to: "#FF9F1C", buttonText: "#FFB13B" },
    { from: "#FF3E38", to: "#E63530", buttonText: "#FF3E38" },
    { from: "#8B5CF6", to: "#7C3AED", buttonText: "#8B5CF6" },
];

interface FlashSaleBannerProps {
    banners: HeroSlider[];
}

export function FlashSaleBanner({ banners }: FlashSaleBannerProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        if (!emblaApi) return;

        emblaApi.on("select", () => {
            setSelectedIndex(emblaApi.selectedScrollSnap());
        });

        // Auto play
        const intervalId = setInterval(() => {
            if (emblaApi.canScrollNext()) {
                emblaApi.scrollNext();
            } else {
                emblaApi.scrollTo(0);
            }
        }, 5000);

        return () => clearInterval(intervalId);
    }, [emblaApi]);

    if (!banners || banners.length === 0) return null;

    return (
        <div className="relative w-full overflow-hidden mt-4 mb-6">
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                    {banners.map((item, index) => {
                        const gradient = GRADIENTS[index % GRADIENTS.length];
                        return (
                            <div
                                key={item.id}
                                className="relative min-w-0 flex-[0_0_100%] h-[180px] md:h-[220px] rounded-[24px] overflow-hidden"
                                style={{
                                    background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`
                                }}
                            >
                                {/* Background Decorations */}
                                <div
                                    className="absolute w-[300px] h-[300px] rounded-full border-[20px] border-white/10"
                                    style={{ top: -100, left: -100 }}
                                />
                                <div
                                    className="absolute w-[200px] h-[200px] rounded-full border-[20px] border-white/10"
                                    style={{ bottom: -80, right: 40 }}
                                />

                                <div className="absolute inset-0 flex flex-row items-center justify-between p-6 md:px-10">
                                    {/* Left Content */}
                                    <div className="flex-1 z-10 flex flex-col justify-center max-w-[60%]">
                                        <h2 className="text-white text-2xl md:text-3xl font-bold font-inter-bold leading-tight line-clamp-1">
                                            {item.title}
                                        </h2>
                                        <p className="text-white text-base md:text-lg font-bold font-inter-bold mb-3 mt-1 line-clamp-1">
                                            {item.subtitle}
                                        </p>

                                        {item.cta_text && (
                                            <Link
                                                href={item.cta_link || "/products"}
                                                className="bg-white px-4 md:px-5 py-2 md:py-2.5 rounded-full self-start flex flex-row items-center gap-2 mt-1 hover:scale-105 transition-transform"
                                            >
                                                <span className="text-xs md:text-sm font-bold font-inter-bold" style={{ color: gradient.buttonText }}>
                                                    {item.cta_text}
                                                </span>
                                                <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" color={gradient.buttonText} />
                                            </Link>
                                        )}
                                    </div>

                                    {/* Right Image */}
                                    <div className="absolute right-[-10px] bottom-[-10px] md:right-4 md:bottom-2 w-[160px] h-[160px] md:w-[200px] md:h-[200px] z-10 flex items-center justify-center">
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={item.image_url}
                                                alt={item.title || "Banner Image"}
                                                fill
                                                className="object-contain"
                                                sizes="(max-width: 768px) 160px, 200px"
                                                priority={index === 0}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Pagination Dots */}
            {banners.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-20">
                    {banners.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => emblaApi?.scrollTo(index)}
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${index === selectedIndex ? 'bg-white' : 'bg-white/40'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
