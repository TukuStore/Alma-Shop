"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { ChevronRight, LogOut, Menu, Search, ShoppingBag, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface MobileMenuProps {
    user: User | null;
    categories: { id: string; name: string; slug: string; image_url?: string | null }[];
    isAdmin?: boolean;
}

export function MobileMenu({ user, categories, isAdmin }: MobileMenuProps) {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const query = e.currentTarget.value;
            if (query.trim()) {
                setOpen(false);
                router.push(`/search?q=${encodeURIComponent(query)}`);
            }
        }
    };

    const handleLogout = async () => {
        setOpen(false);
        await supabase.auth.signOut();
        router.refresh();
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-gray-700 hover:text-[#5a7bed] hover:bg-[#5a7bed]/10 rounded-full transition-colors focus-visible:ring-0">
                    <Menu className="h-6 w-6 relative z-10" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 flex flex-col border-r-0 rounded-r-[32px] overflow-hidden shadow-2xl shadow-blue-900/10">
                <SheetHeader className="p-5 border-b border-gray-100 text-left bg-gradient-to-r from-gray-50 to-white">
                    <SheetTitle className="font-display text-2xl font-black text-[#5a7bed] tracking-tight">Alma Shop</SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8 bg-white/50">
                    {/* Active Search Feature */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Pencarian</label>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#5a7bed] transition-colors" />
                            <Input
                                placeholder="Ketik lalu Enter..."
                                className="pl-11 h-12 bg-gray-50 border-gray-200 rounded-full focus-visible:ring-[#5a7bed]/30 focus-visible:border-[#5a7bed] focus-visible:bg-white transition-all shadow-sm font-medium text-gray-900"
                                onKeyDown={handleSearch}
                            />
                            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-white border border-gray-200 shadow-sm text-[10px] font-bold text-gray-400 px-2 py-1 rounded-full">
                                ⏎
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Menu Utama</label>
                        <nav className="flex flex-col space-y-1">
                            <Link href="/products" onClick={() => setOpen(false)} className="px-4 py-3 rounded-2xl text-base font-bold text-gray-600 hover:text-[#5a7bed] hover:bg-[#5a7bed]/10 transition-colors flex items-center justify-between group">
                                Semua Produk
                                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                            <Link href="/flash-sale" onClick={() => setOpen(false)} className="px-4 py-3 rounded-2xl text-base font-bold text-[#ff4757] hover:bg-[#ff4757]/10 transition-colors flex items-center justify-between group">
                                <span className="flex items-center gap-2">
                                    Flash Sale
                                    <span className="bg-[#ff4757] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse shadow-sm shadow-red-500/30">Hot</span>
                                </span>
                                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                        </nav>
                    </div>

                    {/* Category Accordion */}
                    <div>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="categories" className="border-none">
                                <AccordionTrigger className="px-4 py-3 rounded-2xl text-base font-bold text-gray-600 hover:text-[#5a7bed] hover:no-underline transition-colors data-[state=open]:bg-gray-50 group">
                                    Kategori Koleksi
                                </AccordionTrigger>
                                <AccordionContent className="pt-2 pb-4 space-y-1 px-2">
                                    {categories.map((cat) => {
                                        return (
                                            <Link
                                                key={cat.id}
                                                href={`/categories/${cat.slug}`}
                                                onClick={() => setOpen(false)}
                                                className="flex flex-row items-center justify-between py-3 px-4 rounded-xl text-gray-500 font-medium hover:text-[#5a7bed] hover:bg-[#5a7bed]/5 transition-colors group"
                                            >
                                                {cat.name}
                                                <div className="w-6 h-6 rounded-full bg-white border border-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                                                    <ChevronRight className="h-3 w-3" />
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>

                {/* Footer Accounts */}
                <div className="p-5 border-t border-gray-100 mt-auto bg-gray-50/80 backdrop-blur-md">
                    {user ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="h-12 w-12 shrink-0 rounded-[12px] bg-gradient-to-tr from-[#5a7bed] to-[#4e81ff] flex items-center justify-center text-white font-extrabold text-xl overflow-hidden shadow-md shadow-blue-500/20">
                                    {user.user_metadata?.avatar_url ? (
                                        <img src={user.user_metadata.avatar_url} alt="avatar" className="h-full w-full object-cover" />
                                    ) : (
                                        user.user_metadata?.full_name?.charAt(0) || 'U'
                                    )}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="font-bold text-gray-900 truncate">{user.user_metadata?.full_name || 'Pembeli'}</span>
                                    <span className="text-xs text-gray-500 font-medium truncate">{user.email}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <Button asChild variant="outline" className="w-full h-10 rounded-xl bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-bold" onClick={() => setOpen(false)}>
                                    <Link href="/profile">
                                        <UserIcon className="mr-2 h-4 w-4" /> Profil
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="w-full h-10 rounded-xl bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-bold" onClick={() => setOpen(false)}>
                                    <Link href="/orders">
                                        <ShoppingBag className="mr-2 h-4 w-4" /> Pesanan
                                    </Link>
                                </Button>
                                {isAdmin && (
                                    <Button asChild variant="default" className="w-full h-10 rounded-xl bg-black border-black text-white hover:text-white hover:bg-gray-800 font-bold col-span-2 mt-2 transition-colors" onClick={() => setOpen(false)}>
                                        <Link href="/admin">
                                            Admin Panel
                                        </Link>
                                    </Button>
                                )}
                                <Button onClick={handleLogout} variant="outline" className={`w-full h-10 rounded-xl bg-red-50 border-red-100 text-red-500 hover:text-white hover:bg-red-500 font-bold ${isAdmin ? 'col-span-2' : 'col-span-2'} mt-2 transition-colors`}>
                                    <LogOut className="mr-2 h-4 w-4" /> Keluar Akun
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <div className="text-center mb-2">
                                <h3 className="font-bold text-gray-900">Halo, Tamu!</h3>
                                <p className="text-xs text-gray-500 font-medium mt-1">Silakan masuk untuk akses penuh.</p>
                            </div>
                            <Button asChild variant="default" className="w-full h-12 rounded-xl bg-[#5a7bed] hover:bg-[#4e81ff] text-white font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95" onClick={() => setOpen(false)}>
                                <Link href="/auth/login">Masuk ke Akun</Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full h-12 rounded-xl bg-white border-gray-200 font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors" onClick={() => setOpen(false)}>
                                <Link href="/auth/register">Daftar Akun Baru</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
