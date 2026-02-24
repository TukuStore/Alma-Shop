"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface ProductGalleryProps {
    images: string[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [zoomStyle, setZoomStyle] = useState({ transformOrigin: 'center center', transform: 'scale(1)' });
    const [isHovering, setIsHovering] = useState(false);

    if (!images || images.length === 0) {
        return (
            <div className="aspect-square bg-muted rounded-xl flex items-center justify-center">
                <span className="text-muted-foreground font-medium">No Image</span>
            </div>
        );
    }

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        resetZoom();
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
        resetZoom();
    };

    const resetZoom = () => {
        setIsHovering(false);
        setZoomStyle({ transformOrigin: 'center center', transform: 'scale(1)' });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setZoomStyle({ transformOrigin: `${x}% ${y}%`, transform: 'scale(2.5)' });
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Main Image */}
            <div
                className="relative aspect-square w-full rounded-2xl overflow-hidden bg-muted border border-border group cursor-crosshair"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={resetZoom}
                onMouseMove={handleMouseMove}
            >
                <div
                    className="absolute inset-0 w-full h-full transition-transform duration-200 ease-out"
                    style={isHovering ? zoomStyle : { transformOrigin: 'center center', transform: 'scale(1)' }}
                >
                    <Image
                        src={images[currentIndex]}
                        alt={`Product image ${currentIndex + 1}`}
                        fill
                        className="object-cover"
                        priority
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                </div>

                {/* Navigation Arrows (Show on hover or if multiple images) */}
                {images.length > 1 && (
                    <div className="absolute inset-x-4 inset-y-0 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-10 w-10 rounded-full bg-background/80 hover:bg-background shadow font-bold text-foreground"
                            onClick={handlePrev}
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-10 w-10 rounded-full bg-background/80 hover:bg-background shadow font-bold text-foreground"
                            onClick={handleNext}
                        >
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`relative aspect-square w-20 shrink-0 snap-start overflow-hidden rounded-lg border-2 transition-all ${idx === currentIndex ? "border-primary" : "border-transparent hover:border-border"
                                }`}
                        >
                            <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
