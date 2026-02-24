"use client";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/constants";
import { useStore } from "@/store/useStore";
import { ArrowLeft, ArrowRight, Minus, Plus, ShieldCheck, ShoppingBag, Tag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartPage() {
    const [mounted, setMounted] = useState(false);

    const cartItems = useStore((state) => state.cart.items);
    const updateQuantity = useStore((state) => state.updateQuantity);
    const removeFromCart = useStore((state) => state.removeFromCart);

    const cartTotal = cartItems.reduce((sum, item) => sum + (item.discountPrice ?? item.price) * item.quantity, 0);
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="container mx-auto px-4 lg:px-8 py-12 md:py-20 min-h-[60vh] flex items-center justify-center">
                <div className="animate-pulse w-full max-w-5xl flex gap-8">
                    <div className="flex-1 space-y-6">
                        <div className="h-40 bg-gray-200 rounded-3xl w-full"></div>
                        <div className="h-40 bg-gray-200 rounded-3xl w-full"></div>
                    </div>
                    <div className="w-[380px] h-96 bg-gray-200 rounded-3xl"></div>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto px-4 lg:px-8 py-20 min-h-[70vh] flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="relative w-40 h-40 mb-8 flex justify-center items-center">
                    <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="w-24 h-24 bg-primary text-primary-foreground rounded-[32px] rotate-12 flex items-center justify-center shadow-2xl shadow-primary/30 transition-transform hover:rotate-0 duration-500">
                        <ShoppingBag className="h-10 w-10 -rotate-12" />
                    </div>
                </div>
                <h1 className="text-3xl font-display font-extrabold mb-4 text-gray-900 tracking-tight">Keranjang Kosong</h1>
                <p className="text-gray-500 max-w-md mb-8 text-lg">
                    Sepertinya Anda belum menemukan sarung pilihan. Yuk, eksplor koleksi premium kami sekarang!
                </p>
                <Link href="/products">
                    <Button size="lg" className="rounded-full px-10 h-14 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/25 text-lg font-bold transition-all hover:-translate-y-1">
                        Mulai Belanja
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Soft background glow */}
            <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

            <div className="container mx-auto px-4 lg:px-8 py-10 md:py-16 relative z-10">
                <div className="flex items-center gap-3 mb-8">
                    <Link href="/products" className="p-2 rounded-full hover:bg-white hover:shadow-sm transition-all text-gray-400 hover:text-primary">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-display font-extrabold text-gray-900 tracking-tight">Keranjang Belanja</h1>
                        <p className="text-gray-500 font-medium mt-1">Anda memiliki {totalItems} item di keranjang</p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
                    {/* Cart Items List */}
                    <div className="flex-1 space-y-4">
                        {cartItems.map((item) => (
                            <div key={item.productId} className="bg-white p-4 md:p-6 rounded-[24px] shadow-sm border border-gray-100 hover:shadow-md transition-shadow group animate-in slide-in-from-bottom-4 duration-500">
                                <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                                    {/* Product Image */}
                                    <Link href={`/products/${item.productId}`} className="relative w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-[16px] overflow-hidden bg-gray-100 group-hover:scale-[1.02] transition-transform">
                                        <Image
                                            src={item.imageUrl || '/images/sarung-placeholder.jpg'}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                        />
                                        {item.discountPrice && item.discountPrice < item.price && (
                                            <div className="absolute top-2 left-2 bg-[#ff6b6b] text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                                                Diskon
                                            </div>
                                        )}
                                    </Link>

                                    {/* Info & Controls */}
                                    <div className="flex-1 w-full flex flex-col justify-between h-full space-y-4">
                                        <div className="flex justify-between items-start gap-4">
                                            <div>
                                                <Link href={`/products/${item.productId}`} className="font-bold text-gray-900 text-lg hover:text-primary transition-colors line-clamp-2 leading-tight">
                                                    {item.name}
                                                </Link>
                                                <div className="mt-2 flex flex-col gap-0.5">
                                                    <span className="text-primary font-extrabold text-lg">
                                                        {formatCurrency(item.discountPrice ?? item.price)}
                                                    </span>
                                                    {item.discountPrice && item.discountPrice < item.price && (
                                                        <span className="text-xs font-medium text-gray-400 line-through decoration-gray-300">
                                                            {formatCurrency(item.price)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Delete Mobile - Desktop delete is below */}
                                            <button
                                                onClick={() => removeFromCart(item.productId)}
                                                className="sm:hidden p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between w-full pt-4 border-t border-gray-50">
                                            {/* Quantity Control */}
                                            <div className="flex items-center bg-gray-50 rounded-full p-1 border border-gray-100">
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                    className="w-8 h-8 rounded-full flex items-center justify-center bg-white text-gray-600 shadow-sm hover:text-primary hover:shadow transition-all disabled:opacity-50 disabled:shadow-none"
                                                >
                                                    <Minus className="w-3.5 h-3.5" />
                                                </button>
                                                <span className="w-10 text-center font-bold text-sm text-gray-800">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                    className="w-8 h-8 rounded-full flex items-center justify-center bg-white text-gray-600 shadow-sm hover:text-primary hover:shadow transition-all"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="text-right hidden sm:block">
                                                    <span className="text-xs text-gray-400 font-medium block">Total</span>
                                                    <span className="font-extrabold text-gray-900 text-lg">
                                                        {formatCurrency((item.discountPrice ?? item.price) * item.quantity)}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.productId)}
                                                    className="hidden sm:flex p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="w-full lg:w-[400px] shrink-0">
                        <div className="bg-white rounded-[32px] p-6 lg:p-8 shadow-xl shadow-gray-200/40 border border-gray-100 sticky top-24 animate-in slide-in-from-right-8 duration-500">
                            <h2 className="text-2xl font-display font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                                Ringkasan
                                <span className="p-1 px-2.5 bg-primary/10 text-primary text-xs rounded-full">{totalItems} Item</span>
                            </h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center text-gray-500 text-sm font-medium">
                                    <span>Subtotal Produk</span>
                                    <span className="text-gray-900 font-bold">{formatCurrency(cartTotal)}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-500 text-sm font-medium">
                                    <span>Estimasi Ongkir</span>
                                    <span className="text-[#ff6b6b] italic font-semibold text-xs">Dihitung di Checkout</span>
                                </div>
                            </div>

                            {/* Promo Code Dummy */}
                            <div className="flex gap-2 mb-6">
                                <div className="relative flex-1">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Kode Promo"
                                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-[12px] text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                    />
                                </div>
                                <Button variant="secondary" className="rounded-[12px] font-bold px-4 bg-gray-100 hover:bg-gray-200 text-gray-700">
                                    Pakai
                                </Button>
                            </div>

                            <div className="border-t border-dashed border-gray-200 pt-6 mb-8 mt-2 flex justify-between items-end">
                                <div>
                                    <span className="block text-sm text-gray-500 font-medium mb-1">Total Pesanan</span>
                                    <span className="text-xs text-green-500 font-bold flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3" /> Transaksi Aman
                                    </span>
                                </div>
                                <span className="text-3xl font-extrabold text-primary tracking-tight">{formatCurrency(cartTotal)}</span>
                            </div>

                            <Link href="/checkout" className="block w-full">
                                <Button className="w-full h-14 rounded-[16px] bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg shadow-xl shadow-primary/20 group transition-all hover:-translate-y-1 active:translate-y-0 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-[16px]"></div>
                                    <span className="relative z-10 flex items-center justify-center">
                                        Lanjut ke Pembayaran
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </Button>
                            </Link>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
