"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Category } from "@/types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface ProductFiltersProps {
    categories: Category[];
}

export function ProductFilters({ categories }: ProductFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const currentCategory = pathname.startsWith("/categories/")
        ? pathname.replace("/categories/", "")
        : searchParams.get("category") || "";

    const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "");
    const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");

    const updateFilters = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (key === "category") {
            params.delete("category");
            params.set("page", "1");
            if (value) {
                router.push(`/categories/${value}?${params.toString()}`);
            } else {
                router.push(`/products?${params.toString()}`);
            }
            return;
        }

        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.set("page", "1"); // Reset pagination
        router.push(`${pathname}?${params.toString()}`);
    };

    const handlePriceApply = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (minPrice) params.set("min_price", minPrice);
        else params.delete("min_price");

        if (maxPrice) params.set("max_price", maxPrice);
        else params.delete("max_price");

        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
    };

    const clearFilters = () => {
        router.push(pathname);
        setMinPrice("");
        setMaxPrice("");
    };

    const hasActiveFilters =
        currentCategory !== "" ||
        (searchParams.get("sort") && searchParams.get("sort") !== "newest") ||
        searchParams.get("min_price") ||
        searchParams.get("max_price");

    return (
        <div className="space-y-8 sticky top-24">
            {/* Category Filter */}
            <div>
                <h3 className="text-sm font-semibold mb-3">Kategori</h3>
                <RadioGroup
                    value={currentCategory}
                    onValueChange={(val) => updateFilters("category", val)}
                    className="flex flex-col gap-1"
                >
                    <Label
                        htmlFor="cat-all"
                        className={`flex items-center px-3 py-2 rounded-md cursor-pointer transition-colors ${currentCategory === "" ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-muted-foreground font-normal"
                            }`}
                    >
                        <RadioGroupItem value="" id="cat-all" className="sr-only" />
                        <span>Semua Sarung</span>
                    </Label>
                    {categories.map((cat) => (
                        <Label
                            key={cat.id}
                            htmlFor={`cat-${cat.slug}`}
                            className={`flex items-center px-3 py-2 rounded-md cursor-pointer transition-colors ${currentCategory === cat.slug ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-muted-foreground font-normal"
                                }`}
                        >
                            <RadioGroupItem value={cat.slug} id={`cat-${cat.slug}`} className="sr-only" />
                            <span>{cat.name}</span>
                        </Label>
                    ))}
                </RadioGroup>
            </div>

            {/* Sorting */}
            <div>
                <h3 className="text-sm font-semibold mb-3">Urutkan</h3>
                <RadioGroup
                    value={searchParams.get("sort") || "newest"}
                    onValueChange={(val) => {
                        const current = searchParams.get("sort") || "newest";
                        if (val !== current) updateFilters("sort", val);
                    }}
                    className="flex flex-col gap-1"
                >
                    {[
                        { id: "newest", label: "Terbaru" },
                        { id: "popular", label: "Paling Laku" },
                        { id: "price_asc", label: "Harga (Rendah ke Tinggi)" },
                        { id: "price_desc", label: "Harga (Tinggi ke Rendah)" },
                    ].map((sortOption) => {
                        const isSelected = (searchParams.get("sort") || "newest") === sortOption.id;
                        return (
                            <Label
                                key={sortOption.id}
                                htmlFor={`sort-${sortOption.id}`}
                                className={`flex items-center px-3 py-2 rounded-md cursor-pointer transition-colors ${isSelected ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-muted-foreground font-normal"
                                    }`}
                            >
                                <RadioGroupItem value={sortOption.id} id={`sort-${sortOption.id}`} className="sr-only" />
                                <span>{sortOption.label}</span>
                            </Label>
                        );
                    })}
                </RadioGroup>
            </div>

            {/* Price Range */}
            <div>
                <h3 className="text-sm font-semibold mb-3">Harga (Rp)</h3>
                <div className="flex items-center gap-2 mb-3">
                    <Input
                        placeholder="Min"
                        type="number"
                        min="0"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="h-9 text-sm rounded-md bg-muted/30 focus-visible:bg-transparent"
                    />
                    <span className="text-muted-foreground">-</span>
                    <Input
                        placeholder="Max"
                        type="number"
                        min="0"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="h-9 text-sm rounded-md bg-muted/30 focus-visible:bg-transparent"
                    />
                </div>
                <Button type="button" onClick={handlePriceApply} className="w-full h-9 text-xs font-semibold rounded-md shadow-sm">
                    Terapkan Harga
                </Button>
            </div>

            {hasActiveFilters && (
                <Button onClick={clearFilters} variant="outline" className="w-full border-dashed text-rose-500 hover:text-rose-600 hover:bg-rose-50 border-rose-200">
                    Hapus Filter
                </Button>
            )}
        </div>
    );
}
