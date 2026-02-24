"use client";

import { Button } from "@/components/ui/button";
import { useStore } from "@/store/useStore";
import { Product } from "@/types";
import { Heart, Minus, Plus, ShoppingCart, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface ProductActionsProps {
    product: Product;
}

export function ProductActions({ product }: ProductActionsProps) {
    const [quantity, setQuantity] = useState(1);
    const addToCart = useStore((s) => s.addToCart);
    const router = useRouter();

    // Wishlist Logic
    const toggleWishlist = useStore((s) => s.toggleWishlist);
    const isInWishlist = useStore((s) => s.isInWishlist(product.id));

    const isOutOfStock = product.stock <= 0;

    const handleAddToCart = () => {
        addToCart(
            {
                productId: product.id,
                name: product.name,
                price: product.price,
                discountPrice: product.original_price && product.original_price > product.price ? product.price : undefined,
                imageUrl: product.images?.[0] || "",
            },
            quantity
        );
        toast.success("Berhasil ditambahkan", {
            description: `${product.name} telah masuk ke Keranjang Anda.`,
        });
    };

    const handleBuyNow = () => {
        addToCart(
            {
                productId: product.id,
                name: product.name,
                price: product.price,
                discountPrice: product.original_price && product.original_price > product.price ? product.price : undefined,
                imageUrl: product.images?.[0] || "",
            },
            quantity
        );
        router.push("/checkout");
    };

    const handleWishlist = () => {
        toggleWishlist(product.id);
        if (!isInWishlist) {
            toast("Disimpan ke Wishlist", { icon: <Heart className="h-4 w-4 text-primary fill-primary" /> });
        }
    };

    return (
        <div className="space-y-6 mt-6 pt-6 border-t border-border">
            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
                <span className="font-semibold text-sm">Kuantitas</span>
                <div className="flex items-center rounded-lg border border-border bg-card">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={isOutOfStock || quantity <= 1}
                    >
                        <Minus className="h-4 w-4" />
                    </Button>
                    <div className="w-12 text-center font-medium">{quantity}</div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted"
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        disabled={isOutOfStock || quantity >= product.stock}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                <span className="text-sm text-muted-foreground">Tersisa {product.stock} barang</span>
            </div>

            {/* Desktop Call To Action Buttons */}
            <div className="hidden lg:flex flex-row gap-4 w-full transition-all">
                <Button
                    size="lg"
                    className="flex-1 h-14 text-base font-semibold transition-all hover:scale-[1.02] shadow-sm"
                    disabled={isOutOfStock}
                    onClick={handleBuyNow}
                >
                    {isOutOfStock ? "Sedang Habis" : "Beli Sekarang"}
                </Button>

                <Button
                    size="lg"
                    variant="outline"
                    className="flex-1 h-14 text-base font-semibold border-primary/30 text-primary hover:bg-primary/5 transition-all shadow-sm"
                    disabled={isOutOfStock}
                    onClick={handleAddToCart}
                >
                    <ShoppingCart className="mr-2 h-5 w-5 shrink-0" />
                    <span>Keranjang</span>
                </Button>

                <Button
                    size="lg"
                    variant="ghost"
                    className={`h-14 w-14 shrink-0 transition-colors ${isInWishlist ? "bg-primary/5 text-primary" : "text-muted-foreground hover:bg-muted"
                        }`}
                    onClick={handleWishlist}
                    title="Tambah ke Wishlist"
                >
                    <Heart className={`h-6 w-6 ${isInWishlist ? "fill-primary" : ""}`} />
                </Button>
            </div>

            {/* Mobile Call To Action Buttons - Sticky */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 p-4 bg-background border-t border-border shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] w-full transition-all">
                <div className="flex flex-row gap-2 max-w-lg mx-auto">
                    <Button
                        size="lg"
                        className="flex-1 h-12 text-sm font-semibold transition-all hover:scale-[1.02] shadow-sm"
                        disabled={isOutOfStock}
                        onClick={handleBuyNow}
                    >
                        {isOutOfStock ? "Sedang Habis" : "Beli Sekarang"}
                    </Button>

                    <Button
                        size="lg"
                        variant="outline"
                        className="flex-1 h-12 text-sm font-semibold border-primary/30 text-primary hover:bg-primary/5 transition-all shadow-sm"
                        disabled={isOutOfStock}
                        onClick={handleAddToCart}
                    >
                        <ShoppingCart className="mr-1.5 h-4 w-4 shrink-0" />
                        <span>+ Keranjang</span>
                    </Button>

                    <Button
                        size="lg"
                        variant="ghost"
                        className={`h-12 w-12 shrink-0 transition-colors ${isInWishlist ? "bg-primary/5 text-primary" : "text-muted-foreground hover:bg-muted"
                            }`}
                        onClick={handleWishlist}
                        title="Tambah ke Wishlist"
                    >
                        <Heart className={`h-5 w-5 ${isInWishlist ? "fill-primary" : ""}`} />
                    </Button>
                </div>
            </div>
            {/* Mobile spacing placeholder so content doesn't hide under fixed bar */}
            <div className="h-20 lg:hidden"></div>

            {/* Support / Quick Info */}
            <div className="grid grid-cols-2 gap-4 mt-6 md:mt-8 bg-muted/30 p-4 rounded-xl text-sm">
                <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="font-medium text-muted-foreground">Jaminan 100% Asli</span>
                </div>
                <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="font-medium text-muted-foreground">Tukar Size 7 Hari</span>
                </div>
            </div>
        </div>
    );
}
