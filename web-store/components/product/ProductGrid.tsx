import { Product } from "@/types";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
    products: Product[];
    emptyMessage?: string;
    columns?: {
        sm?: number;
        md?: number;
        lg?: number;
        xl?: number;
    };
}

export function ProductGrid({
    products,
    emptyMessage = "Belum ada produk.",
    columns = { sm: 2, md: 3, lg: 4, xl: 4 },
}: ProductGridProps) {
    if (!products || products.length === 0) {
        return (
            <div className="flex min-h-[300px] w-full items-center justify-center rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                <p>{emptyMessage}</p>
            </div>
        );
    }

    const smCols = { 1: "sm:grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-4" }[columns.sm || 2];
    const mdCols = { 1: "md:grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-4" }[columns.md || 3];
    const lgCols = { 1: "lg:grid-cols-1", 2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4" }[columns.lg || 4];
    const xlCols = { 1: "xl:grid-cols-1", 2: "xl:grid-cols-2", 3: "xl:grid-cols-3", 4: "xl:grid-cols-4", 5: "xl:grid-cols-5" }[columns.xl || 4];

    return (
        <div className={`grid grid-cols-2 gap-4 sm:gap-6 ${smCols} ${mdCols} ${lgCols} ${xlCols}`}>
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}
