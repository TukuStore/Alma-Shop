import { Facebook, Instagram, Mail, MapPin, Phone, RefreshCw, ShieldCheck, Truck, Twitter, Youtube } from "lucide-react";
import Link from "next/link";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-muted/30 border-t border-border mt-16 lg:mt-24">
            {/* Value Props */}
            <div className="border-b border-border bg-card">
                <div className="container mx-auto px-4 lg:px-8 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                        <div className="flex flex-col items-center md:items-start gap-2">
                            <ShieldCheck className="h-8 w-8 text-primary mb-1" />
                            <h3 className="font-bold text-foreground">Kualitas Premium</h3>
                            <p className="text-sm text-muted-foreground">Sarung tenun dan batik dengan bahan pilihan terbaik.</p>
                        </div>
                        <div className="flex flex-col items-center md:items-start gap-2">
                            <Truck className="h-8 w-8 text-primary mb-1" />
                            <h3 className="font-bold text-foreground">Pengiriman Aman</h3>
                            <p className="text-sm text-muted-foreground">Packing ekstra tebal, gratis asuransi untuk pesanan Anda.</p>
                        </div>
                        <div className="flex flex-col items-center md:items-start gap-2">
                            <RefreshCw className="h-8 w-8 text-primary mb-1" />
                            <h3 className="font-bold text-foreground">Garansi Retur 7 Hari</h3>
                            <p className="text-sm text-muted-foreground">Tidak puas? Tukar dengan mudah tanpa ribet.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer Links */}
            <div className="container mx-auto px-4 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand Col */}
                    <div className="flex flex-col gap-4">
                        <Link href="/" className="font-display text-3xl font-bold tracking-tight text-primary">
                            Alma Shop
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Toko sarung eksklusif yang memadukan keanggunan warisan budaya dengan sentuhan modernitas untuk segala suasana.
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                            <Link href="#" className="h-8 w-8 rounded-full bg-accent/5 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                                <Instagram className="h-4 w-4" />
                            </Link>
                            <Link href="#" className="h-8 w-8 rounded-full bg-accent/5 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                                <Facebook className="h-4 w-4" />
                            </Link>
                            <Link href="#" className="h-8 w-8 rounded-full bg-accent/5 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                                <Twitter className="h-4 w-4" />
                            </Link>
                            <Link href="#" className="h-8 w-8 rounded-full bg-accent/5 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                                <Youtube className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Nav Col 1 */}
                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold text-lg">Belanja</h3>
                        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                            <Link href="/products" className="hover:text-primary transition-colors">Semua Produk</Link>
                            <Link href="/categories/sarung-songket" className="hover:text-primary transition-colors">Sarung Songket</Link>
                            <Link href="/categories/batik-tulis" className="hover:text-primary transition-colors">Batik Tulis</Link>
                            <Link href="/categories/batik-cap" className="hover:text-primary transition-colors">Batik Cap</Link>
                            <Link href="/categories/sutra-spunsilk" className="hover:text-primary transition-colors">Sutra Spunsilk</Link>
                        </div>
                    </div>

                    {/* Bantuan */}
                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold text-lg">Bantuan</h3>
                        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                            <Link href="/faq" className="hover:text-primary transition-colors">Tanya Jawab (FAQ)</Link>
                            <Link href="/cara-belanja" className="hover:text-primary transition-colors">Cara Belanja</Link>
                            <Link href="/pengiriman" className="hover:text-primary transition-colors">Kebijakan Pengiriman</Link>
                            <Link href="/retur" className="hover:text-primary transition-colors">Kebijakan Retur</Link>
                            <Link href="/hubungi-kami" className="hover:text-primary transition-colors">Hubungi Kami</Link>
                        </div>
                    </div>

                    {/* Kontak */}
                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold text-lg">Hubungi Kami</h3>
                        <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                            <div className="flex items-start gap-3">
                                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                                <span>Jl. Cendrawasih No. 45, Pekalongan, Jawa Tengah 51111</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 shrink-0" />
                                <span>+62 811 234 5678</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 shrink-0" />
                                <span>cs@almashop.com</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-border py-6 px-4">
                <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                    <p>&copy; {currentYear} Alma Shop. Hak Cipta Dilindungi.</p>
                    <div className="flex items-center gap-4">
                        <Link href="/privacy" className="hover:text-primary">Privasi</Link>
                        <Link href="/terms" className="hover:text-primary">Syarat & Ketentuan</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
