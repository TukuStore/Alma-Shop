"use client";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useStore } from "@/store/useStore";
import { User } from "@supabase/supabase-js";
import { LogOut, Search, ShoppingBag, User as UserIcon, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MobileMenu } from "./MobileMenu";

interface NavbarProps {
    user: User | null;
    categories: { id: string; name: string; slug: string; image_url?: string | null }[];
    isAdmin?: boolean;
}

export function Navbar({ user, categories, isAdmin }: NavbarProps) {
    const [mounted, setMounted] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const cartItemCount = useStore((state) => state.getCartItemCount());
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
    };

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const query = e.currentTarget.value;
            if (query.trim()) {
                setIsMobileSearchOpen(false);
                router.push(`/search?q=${encodeURIComponent(query)}`);
            }
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-gray-100/50 shadow-[0_2px_20px_rgb(0,0,0,0.02)] transition-all">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="flex h-[72px] items-center justify-between gap-4">

                    <div className="flex items-center gap-2 lg:hidden">
                        <MobileMenu user={user} categories={categories} isAdmin={isAdmin} />
                        <Link href="/" className="font-display text-2xl font-black tracking-tighter text-primary ml-1">
                            Alma.
                        </Link>
                    </div>

                    {/* Desktop Logo & Navigation */}
                    <div className="hidden lg:flex lg:items-center lg:gap-10">
                        <Link href="/" className="font-display text-3xl font-black tracking-tighter text-primary pr-4 border-r border-gray-100">
                            Alma Shop
                        </Link>
                        <nav className="flex items-center gap-8 text-[15px] font-bold text-gray-500 tracking-wide">
                            <Link href="/products" className="hover:text-primary transition-colors relative group">
                                Semua Produk
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                            </Link>

                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center gap-1 hover:text-primary transition-colors focus:outline-none relative group data-[state=open]:text-primary">
                                    Kategori
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full group-data-[state=open]:w-full transition-all duration-300"></span>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-56 p-2 rounded-2xl border border-gray-100 shadow-xl shadow-primary/5 bg-white/95 backdrop-blur-lg mt-2">
                                    <div className="px-2 pb-2 text-xs font-bold text-gray-400 uppercase tracking-widest pt-1">Pilih Kategori</div>
                                    {categories.map((cat) => {
                                        return (
                                            <DropdownMenuItem key={cat.id} asChild className="rounded-xl focus:bg-primary/10 focus:text-primary cursor-pointer text-gray-600 font-bold py-2.5">
                                                <Link href={`/categories/${cat.slug}`}>
                                                    {cat.name}
                                                </Link>
                                            </DropdownMenuItem>
                                        );
                                    })}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Link href="/about" className="hover:text-primary transition-colors relative group">
                                Tentang Kami
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                            </Link>
                        </nav>
                    </div>

                    {/* Desktop Search Bar */}
                    <div className="hidden md:flex flex-1 max-w-sm xl:max-w-md ml-auto relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors pointer-events-none" />
                        <Input
                            placeholder="Cari sarung impianmu..."
                            className="w-full pl-11 h-11 bg-gray-50/80 border-transparent hover:border-gray-200 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-primary/10 focus-visible:border-primary rounded-full transition-all font-medium text-gray-900 shadow-inner"
                            onKeyDown={handleSearch}
                        />
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 lg:gap-4 ml-auto lg:ml-0">

                        {/* Mobile Inline Search Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`md:hidden rounded-full transition-colors ${isMobileSearchOpen ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-primary hover:bg-primary/10'}`}
                            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                        >
                            {isMobileSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
                        </Button>

                        {/* Cart */}
                        <Link href="/cart">
                            <Button variant="ghost" size="icon" className="relative rounded-full text-gray-600 hover:text-primary hover:bg-primary/10 transition-colors">
                                <ShoppingBag className="h-5 w-5" />
                                {mounted && cartItemCount > 0 && (
                                    <Badge
                                        className="absolute -top-1 -right-1 h-[22px] min-w-[22px] flex items-center justify-center px-1.5 text-[10px] bg-[#ff4757] text-white rounded-full border-2 border-white shadow-sm font-black animate-in zoom-in duration-300"
                                    >
                                        {cartItemCount}
                                    </Badge>
                                )}
                            </Button>
                        </Link>

                        {/* User Menu */}
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full shadow-sm hover:shadow-md transition-shadow bg-primary hover:bg-primary/90 w-10 h-10 ring-2 ring-white ml-1">
                                        <Avatar className="h-full w-full border-none bg-transparent object-cover text-white font-extrabold flex items-center justify-center">
                                            {user.user_metadata?.avatar_url ? (
                                                <AvatarImage src={user.user_metadata.avatar_url} />
                                            ) : (
                                                <span className="text-sm">{user.user_metadata?.full_name?.charAt(0) || 'U'}</span>
                                            )}
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-64 p-3 rounded-[24px] border border-gray-100 shadow-2xl shadow-primary/10 bg-white/95 backdrop-blur-xl mt-3">
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-[16px] mb-2 border border-gray-100">
                                        <div className="h-10 w-10 shrink-0 bg-primary/20 text-primary rounded-full flex items-center justify-center font-black">
                                            {user.user_metadata?.full_name?.charAt(0) || 'U'}
                                        </div>
                                        <div className="flex flex-col min-w-0 pr-2">
                                            <p className="font-extrabold text-sm text-gray-900 truncate tracking-tight">{user.user_metadata?.full_name || 'Pembeli'}</p>
                                            <p className="text-xs font-semibold text-gray-400 truncate tracking-wide">{user.email}</p>
                                        </div>
                                    </div>

                                    <div className="grid gap-1 px-1 py-2">
                                        <DropdownMenuItem asChild className="rounded-xl hover:bg-gray-50 focus:bg-gray-50 cursor-pointer font-bold text-gray-700 py-3">
                                            <Link href="/profile" className="flex items-center">
                                                <UserIcon className="mr-3 h-4 w-4 text-gray-400" /> Profil Web
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild className="rounded-xl hover:bg-gray-50 focus:bg-gray-50 cursor-pointer font-bold text-gray-700 py-3">
                                            <Link href="/orders" className="flex items-center">
                                                <ShoppingBag className="mr-3 h-4 w-4 text-gray-400" /> Riwayat Belanja
                                            </Link>
                                        </DropdownMenuItem>
                                        {isAdmin && (
                                            <DropdownMenuItem asChild className="rounded-xl hover:bg-gray-800 focus:bg-gray-800 focus:text-white hover:text-white bg-black text-white cursor-pointer font-bold py-3 mt-1">
                                                <Link href="/admin" className="flex items-center">
                                                    Admin Panel
                                                </Link>
                                            </DropdownMenuItem>
                                        )}
                                    </div>

                                    <DropdownMenuSeparator className="bg-gray-100 mx-3 my-1" />

                                    <div className="px-1 pt-2">
                                        <DropdownMenuItem onClick={handleLogout} className="rounded-xl hover:bg-red-50 focus:bg-red-50 focus:text-red-600 text-red-500 cursor-pointer font-bold py-3 transition-colors">
                                            <LogOut className="mr-3 h-4 w-4" /> Keluar Akun
                                        </DropdownMenuItem>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="hidden sm:flex items-center gap-3 ml-2">
                                <Link href="/auth/login">
                                    <Button variant="ghost" className="text-sm font-bold text-gray-600 hover:text-primary hover:bg-primary/10 rounded-full h-10 px-5 transition-colors">Masuk</Button>
                                </Link>
                                <Link href="/auth/register">
                                    <Button className="text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-10 px-6 shadow-lg shadow-primary/20 active:scale-95 transition-all">Daftar Akun</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Inline Search Dropdown (Expands when search icon clicked) */}
                <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMobileSearchOpen ? 'max-h-24 opacity-100 pb-4' : 'max-h-0 opacity-0'}`}>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Cari sarung favoritmu..."
                            className="w-full pl-11 h-12 bg-gray-50 border-gray-200 rounded-full focus-visible:ring-primary/30 focus-visible:border-primary focus-visible:bg-white transition-all shadow-sm font-medium text-gray-900"
                            onKeyDown={handleSearch}
                            autoFocus={isMobileSearchOpen}
                        />
                        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-white border border-gray-200 shadow-sm text-[10px] font-bold text-gray-400 px-2.5 py-1.5 rounded-full">
                            ENTER
                        </div>
                    </div>
                </div>

            </div>
        </header>
    );
}
