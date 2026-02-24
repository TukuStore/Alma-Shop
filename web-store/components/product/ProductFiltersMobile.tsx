"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Category } from "@/types";
import { Filter } from "lucide-react";
import { ProductFilters } from "./ProductFilters";

interface ProductFiltersMobileProps {
    categories: Category[];
}

export function ProductFiltersMobile({ categories }: ProductFiltersMobileProps) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden flex items-center gap-2">
                    <Filter className="h-4 w-4" /> Filter & Urutkan
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] overflow-y-auto pt-10">
                <SheetHeader className="mb-6">
                    <SheetTitle>Filter Produk</SheetTitle>
                </SheetHeader>
                <ProductFilters categories={categories} />
            </SheetContent>
        </Sheet>
    );
}
