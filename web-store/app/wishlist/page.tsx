"use client";

import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useStore } from "@/store/useStore";
import { Product } from "@/types";
import { ArrowLeft, Heart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function WishlistPage() {
    const [mounted, setMounted] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const wishlistItems = useStore((state) => state.wishlist.items);
    const toggleWishlist = useStore((state) => state.toggleWishlist);

    const supabase = createClient();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        async function fetchWishlistProducts() {
            if (wishlistItems.length === 0) {
                setProducts([]);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            const { data, error } = await supabase
                .from("products")
                .select("*")
                .in("id", wishlistItems);

            if (!error && data) {
                setProducts(data as Product[]);
            }
            setIsLoading(false);
        }

        if (mounted) {
            fetchWishlistProducts();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wishlistItems, mounted]);

    if (!mounted || isLoading) {
        return (
            <div className="container mx-auto px-4 lg:px-8 py-12 md:py-20 min-h-[60vh] flex items-center justify-center">
                <div className="animate-pulse w-full max-w-5xl space-y-8">
                    <div className="h-10 bg-muted rounded w-1/4 mb-12"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-64 bg-muted rounded-xl w-full"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 lg:px-8 py-8 md:py-12 max-w-7xl">
            <div className="mb-8">
                <Link href="/profile" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Profil
                </Link>
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl lg:text-4xl font-display font-bold">Wishlist Saya</h1>
                    <span className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-sm">
                        {wishlistItems.length}
                    </span>
                </div>
            </div>

            {products.length === 0 ? (
                <div className="container mx-auto px-4 lg:px-8 py-16 md:py-24 min-h-[50vh] flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                        <Heart className="h-12 w-12 text-primary fill-primary/20" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4">Wishlist Anda Kosong</h2>
                    <p className="text-muted-foreground max-w-md mb-8">
                        Simpan sarung favorit Anda ke dalam wishlist agar mudah ditemukan kembali nanti.
                    </p>
                    <Link href="/products">
                        <Button size="lg" className="rounded-full px-8">Jelajahi Produk</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <div key={product.id} className="relative group">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
