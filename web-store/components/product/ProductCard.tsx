"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/constants";
import { useStore } from "@/store/useStore";
import { Product } from "@/types";
import { ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    // Get the first image or a placeholder
    const imageUrl =
        product.images && product.images.length > 0
            ? product.images[0]
            : "https://images.unsplash.com/photo-1594911772125-07ee7aaf80a8?q=80&w=800&auto=format&fit=crop";

    const isOutOfStock = product.stock <= 0;
    // Calculate discount percentage if original price exists
    const discountPercentage =
        product.original_price && product.original_price > product.price
            ? Math.round(
                ((product.original_price - product.price) / product.original_price) *
                100
            )
            : 0;

    const addToCart = useStore((s) => s.addToCart);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isOutOfStock) return;

        addToCart({
            productId: product.id,
            name: product.name,
            price: product.original_price || product.price,
            discountPrice: product.original_price && product.original_price > product.price ? product.price : undefined,
            imageUrl: imageUrl,
        });

        toast.success("Ditambahkan ke Keranjang", {
            description: `${product.name} berhasil ditambahkan.`,
        });
    };

    return (
        <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-md">
            {/* Image Container */}
            <Link
                href={`/products/${product.id}`}
                className="relative aspect-square overflow-hidden bg-muted"
            >
                <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                {/* Badges */}
                <div className="absolute left-2 top-2 flex flex-col gap-1">
                    {discountPercentage > 0 && (
                        <Badge variant="destructive" className="font-semibold shadow-sm">
                            -{discountPercentage}%
                        </Badge>
                    )}
                    {product.is_featured && (
                        <Badge className="bg-alma-info text-white shadow-sm border-none">
                            Featured
                        </Badge>
                    )}
                </div>
                {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                        <span className="rounded bg-background px-3 py-1 font-semibold text-muted-foreground shadow">
                            Habis Terjual
                        </span>
                    </div>
                )}
            </Link>

            {/* Content */}
            <div className="flex flex-1 flex-col p-4">
                {/* Category & Rating */}
                <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="truncate pr-2">
                        {product.category?.name || "Sarung"}
                    </span>
                    <div className="flex shrink-0 items-center gap-1.5">
                        {product.rating !== undefined && product.rating > 0 && (
                            <div className="flex shrink-0 items-center gap-0.5">
                                <Star className="h-3 w-3 fill-alma-warning text-alma-warning" />
                                <span>{product.rating.toFixed(1)}</span>
                            </div>
                        )}
                        {product.rating !== undefined && product.rating > 0 && (product.sold_count || 0) > 0 && (
                            <span className="text-muted-foreground text-[10px]">|</span>
                        )}
                        {(product.sold_count || 0) > 0 && (
                            <span className="text-[10px]">Terjual {product.sold_count}</span>
                        )}
                    </div>
                </div>

                {/* Title */}
                <Link href={`/products/${product.id}`} className="group-hover:text-primary">
                    <h3 className="line-clamp-2 min-h-[40px] font-medium leading-tight">
                        {product.name}
                    </h3>
                </Link>

                {/* Price & Action */}
                <div className="mt-auto pt-4">
                    <div className="flex items-end justify-between">
                        <div className="flex flex-col">
                            {discountPercentage > 0 && product.original_price && (
                                <span className="text-xs text-muted-foreground line-through">
                                    {formatCurrency(product.original_price)}
                                </span>
                            )}
                            <span className="text-base font-bold text-foreground sm:text-lg">
                                {formatCurrency(product.price)}
                            </span>
                        </div>
                        {/* Quick Add To Cart Button */}
                        <Button
                            size="icon"
                            variant={isOutOfStock ? "secondary" : "default"}
                            className={`h-9 w-9 shrink-0 rounded-full sm:h-10 sm:w-10 ${!isOutOfStock
                                ? "bg-primary text-white hover:bg-primary/90 hover:scale-105 transition-transform shadow-sm"
                                : ""
                                }`}
                            disabled={isOutOfStock}
                            onClick={handleAddToCart}
                        >
                            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
