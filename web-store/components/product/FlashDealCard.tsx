import { formatCurrency } from "@/lib/constants";
import { Product } from "@/types";
import { Heart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface FlashDealCardProps {
    product: Product;
}

export function FlashDealCard({ product }: FlashDealCardProps) {
    // Get the first image or a placeholder
    const imageUrl =
        product.images && product.images.length > 0
            ? product.images[0]
            : "https://images.unsplash.com/photo-1594911772125-07ee7aaf80a8?q=80&w=800&auto=format&fit=crop";

    // Calculate discount percentage if original price exists
    const discountPercentage =
        product.original_price && product.original_price > product.price
            ? Math.round(
                ((product.original_price - product.price) / product.original_price) * 100
            )
            : 0;

    // Mock progress calculation
    const soldCount = product.sold_count || Math.floor(Math.random() * 50) + 10;
    const totalCount = soldCount + Math.floor(Math.random() * 30) + 5;
    const progressPercent = Math.min((soldCount / totalCount) * 100, 100);

    return (
        <div className="group flex flex-col overflow-hidden rounded-[20px] border-none bg-white p-3 transition-all hover:shadow-lg">
            {/* Image Container */}
            <Link
                href={`/products/${product.id}`}
                className="relative aspect-square overflow-hidden rounded-[16px] bg-muted mb-3"
            >
                <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {/* Sale Badge */}
                {discountPercentage > 0 && (
                    <div className="absolute left-2 top-2 bg-red-500 px-2 py-1 rounded-md">
                        <span className="text-white text-xs font-bold font-inter-bold">
                            -{discountPercentage}%
                        </span>
                    </div>
                )}

                {/* Heart Button */}
                <button className="absolute right-2 top-2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm hover:scale-110 transition-transform">
                    <Heart className="w-4 h-4 text-neutral-600" />
                </button>
            </Link>

            {/* Content */}
            <div className="flex flex-col gap-1">
                {/* Title */}
                <Link href={`/products/${product.id}`} className="hover:text-primary">
                    <h3 className="line-clamp-1 text-sm font-medium text-neutral-900 leading-tight">
                        {product.name}
                    </h3>
                </Link>

                {/* Price */}
                <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-neutral-900 leading-tight">
                        {formatCurrency(product.price)}
                    </span>
                </div>

                <div className="flex items-center justify-between mb-3">
                    {discountPercentage > 0 && product.original_price && (
                        <span className="text-[10px] sm:text-xs text-muted-foreground line-through">
                            {formatCurrency(product.original_price)}
                        </span>
                    )}
                    {product.rating !== undefined && (
                        <div className="flex items-center gap-1 ml-auto">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span className="text-[10px] sm:text-xs">{product.rating.toFixed(1)}</span>
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="w-full relative h-[18px] bg-emerald-100 rounded-full mt-auto overflow-hidden flex items-center justify-center">
                    <div
                        className="absolute top-0 bottom-0 left-0 bg-[#00D79E]"
                        style={{ width: `${progressPercent}%` }}
                    />
                    <span className="text-[10px] font-medium text-neutral-700 relative z-10 px-2 leading-none">
                        {soldCount} Sold
                    </span>
                </div>
            </div>
        </div>
    );
}
