import { Button } from "@/components/ui/button";
import { Telescope } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                <Telescope className="h-12 w-12" />
            </div>

            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
                404 - Halaman Tersesat
            </h1>

            <p className="text-muted-foreground max-w-md mb-8 text-lg">
                Wah, sepertinya Anda mencari sarung yang belum ditenun oleh pengrajin kami. Link yang Anda tuju tidak dapat ditemukan.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="rounded-full px-8">
                    <Link href="/">Kembali ke Beranda</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full px-8">
                    <Link href="/products">Lihat Katalog Produk</Link>
                </Button>
            </div>
        </div>
    );
}
