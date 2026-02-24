"use client";

import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatCurrency } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { useStore } from "@/store/useStore";
import { Address } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, CreditCard, Loader2, MapPin, Receipt, ShoppingBag, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { CheckoutAddressSelector } from "./CheckoutAddressSelector";

const checkoutSchema = z.object({
    recipientName: z.string().min(2, "Nama penerima wajib diisi"),
    phoneNumber: z.string().min(8, "Nomor telepon tidak valid"),
    addressLine: z.string().min(10, "Alamat terlalu pendek"),
    city: z.string().min(3, "Kota wajib diisi"),
    postalCode: z.string().min(5, "Kode pos tidak valid"),
    shippingMethod: z.enum(["standard", "express"]),
    paymentMethod: z.enum(["bank_transfer", "qris", "ewallet", "cod"]),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

const SHIPPING_COST = {
    standard: 15000,
    express: 35000,
};

export default function CheckoutPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [isPending, startTransition] = useTransition();
    const supabase = createClient();

    const cartItems = useStore((s) => s.cart.items);
    const clearCart = useStore((s) => s.clearCart);

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>();
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

    const cartTotal = cartItems.reduce((sum, item) => sum + (item.discountPrice ?? item.price) * item.quantity, 0);

    const form = useForm<CheckoutValues>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            recipientName: "",
            phoneNumber: "",
            addressLine: "",
            city: "",
            postalCode: "",
            shippingMethod: "standard",
            paymentMethod: "bank_transfer",
        },
    });

    const selectedShipping = form.watch("shippingMethod");
    const shippingCost = SHIPPING_COST[selectedShipping] || 15000;
    const isFreeShipping = selectedShipping === "standard" && cartTotal > 500000;
    const finalTotal = isFreeShipping ? cartTotal : cartTotal + shippingCost;
    const grandTotal = cartTotal + shippingCost;

    useEffect(() => {
        setMounted(true);
        async function loadUserData() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Pre-fill from auth metadata optionally
                form.setValue("recipientName", user.user_metadata?.full_name || "");

                // Fetch all addresses
                const { data: addressData } = await supabase
                    .from("addresses")
                    .select("*")
                    .eq("user_id", user.id)
                    .order("is_default", { ascending: false })
                    .order("created_at", { ascending: false });

                if (addressData && addressData.length > 0) {
                    setAddresses(addressData);
                    const defaultOrFirst = addressData.find((a: Address) => a.is_default) || addressData[0];
                    setSelectedAddressId(defaultOrFirst.id);

                    form.setValue("recipientName", defaultOrFirst.recipient_name);
                    form.setValue("phoneNumber", defaultOrFirst.phone_number);
                    form.setValue("addressLine", defaultOrFirst.address_line);
                    form.setValue("city", defaultOrFirst.city);
                    form.setValue("postalCode", defaultOrFirst.postal_code);
                } else {
                    setAddresses([]);
                }
            }
        }
        loadUserData();
    }, [form, supabase]);

    // Handle address selection from modal
    const handleAddressSelect = (id: string, addr: Address) => {
        setSelectedAddressId(id);
        form.setValue("recipientName", addr.recipient_name);
        form.setValue("phoneNumber", addr.phone_number);
        form.setValue("addressLine", addr.address_line);
        form.setValue("city", addr.city);
        form.setValue("postalCode", addr.postal_code);
    };

    if (!mounted) return null;

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 min-h-[70vh] flex flex-col items-center justify-center animate-in fade-in duration-500">
                <div className="w-24 h-24 bg-red-50 text-red-400 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag className="h-10 w-10" />
                </div>
                <h1 className="text-3xl font-display font-extrabold text-gray-900 mb-4 tracking-tight">Belum Ada Pesanan</h1>
                <p className="text-gray-500 mb-8 max-w-md text-center text-lg">Anda perlu memilih produk terlebih dahulu sebelum dapat melanjutkan ke tahap pembayaran.</p>
                <Link href="/products">
                    <Button size="lg" className="rounded-full px-8 h-12 bg-[#5a7bed] hover:bg-[#4e81ff] text-white font-bold text-base shadow-lg shadow-blue-500/20 transition-transform hover:-translate-y-0.5">
                        Kembali Belanja
                    </Button>
                </Link>
            </div>
        );
    }

    const onSubmit = (data: CheckoutValues) => {
        startTransition(async () => {
            if (!selectedAddressId) {
                toast.error("Alamat Kosong", { description: "Silakan tambahkan atau pilih alamat pengiriman terlebih dahulu." });
                return;
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("Wajib Login", { description: "Sesi telah berakhir, silakan login kembali." });
                router.push("/auth/login?redirect=/checkout");
                return;
            }

            const fullAddress = `${data.recipientName} (${data.phoneNumber})\n${data.addressLine}\n${data.city}, ${data.postalCode}`;

            const { data: order, error: orderError } = await supabase
                .from("orders")
                .insert({
                    user_id: user.id,
                    total_amount: finalTotal,
                    status: "pending",
                    shipping_address: fullAddress,
                })
                .select()
                .single();

            if (orderError || !order) {
                toast.error("Gagal Memproses", { description: "Terjadi kesalahan saat membuat pesanan Anda." });
                return;
            }

            const orderItemsToInsert = cartItems.map(item => ({
                order_id: order.id,
                product_id: item.productId,
                quantity: item.quantity,
                price_at_purchase: item.discountPrice ?? item.price,
            }));

            const { error: itemsError } = await supabase.from("order_items").insert(orderItemsToInsert);

            if (itemsError) {
                toast.error("Pesanan Terbuat, tapi Gagal Menyimpan Item", { description: itemsError.message });
                return;
            }

            clearCart();
            toast.success("Hore! Pesanan Berhasil Dibuat", {
                description: `Silakan lanjutkan pembayaran untuk mendapatkan pesanan Anda.`,
            });
            router.push(`/orders/${order.id}`);
        });
    };

    return (
        <div className="min-h-[100vh] bg-gray-50/50 pb-20 relative">
            <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-br from-[#5a7bed]/10 via-[#4e81ff]/5 to-transparent pointer-events-none" />

            <div className="container mx-auto px-4 lg:px-8 py-8 md:py-16 relative z-10">
                <div className="mb-8">
                    <Link href="/cart" className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-[#5a7bed] mb-4 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-1.5" /> Kembali Ke Keranjang
                    </Link>
                    <h1 className="text-3xl lg:text-4xl font-display font-extrabold text-gray-900 tracking-tight">Checkout Pesanan</h1>
                    <p className="text-gray-500 font-medium mt-1">Selesaikan 3 langkah mudah ini untuk mengamankan sarung pilihan Anda.</p>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Left: Input Forms Array */}
                    <div className="flex-1 space-y-6">

                        {/* Section 1: Address */}
                        <div className="bg-white rounded-[24px] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-[#5a7bed]/10 flex items-center justify-center text-[#5a7bed] font-bold shrink-0">1</div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Alamat Pengiriman</h2>
                                        <p className="text-sm text-gray-500">Isi data lengkap penerima sarung.</p>
                                    </div>
                                </div>
                                {addresses.length > 0 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsAddressModalOpen(true)}
                                        className="hidden md:flex rounded-full text-primary border-primary/30 hover:bg-primary/5 font-bold"
                                    >
                                        Ubah Alamat
                                    </Button>
                                )}
                            </div>

                            <div className="w-full">
                                {addresses.length > 0 ? (
                                    <div
                                        onClick={() => setIsAddressModalOpen(true)}
                                        className="relative p-6 px-8 rounded-[20px] border-2 border-primary/30 bg-white hover:border-primary transition-all cursor-pointer group shadow-sm"
                                    >
                                        {/* Decorative Badge */}
                                        <div className="absolute top-0 right-0 overflow-hidden text-right">
                                            <div className="w-0 h-0 border-t-[80px] border-l-[80px] border-t-primary border-l-transparent rounded-tr-[17px]"></div>
                                            <span className="absolute top-3 right-2 text-white text-xs font-bold tracking-wider rotate-45 transform origin-top-right whitespace-nowrap group-hover:scale-105 transition-transform">
                                                Pilih
                                            </span>
                                        </div>

                                        <div className="flex items-start gap-5">
                                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/10 text-primary shrink-0">
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <div className="pr-12">
                                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                    {form.getValues("recipientName")}
                                                </h3>
                                                <p className="font-semibold text-gray-900 mt-1">{form.getValues("phoneNumber")}</p>
                                                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                                                    {form.getValues("addressLine")}, {form.getValues("city")}, {form.getValues("postalCode")}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Mobile Edit Button */}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="w-full mt-4 flex md:hidden text-primary font-bold bg-primary/5 hover:bg-primary/10"
                                        >
                                            Ganti Alamat Lain
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-10 px-6 bg-gray-50 rounded-[20px] border border-dashed border-gray-300 text-center">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                                            <MapPin className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">Belum Ada Alamat</h3>
                                        <p className="text-sm text-gray-500 mb-6 max-w-sm">Wajib menambahkan alamat pengiriman terlebih dahulu untuk melanjutkan checkout.</p>
                                        <Button
                                            type="button"
                                            onClick={() => setIsAddressModalOpen(true)}
                                            className="rounded-full bg-[#5a7bed] hover:bg-[#4e81ff] text-white font-bold h-12 px-8 shadow-lg shadow-blue-500/20"
                                        >
                                            Tambah Alamat Baru
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <CheckoutAddressSelector
                            isOpen={isAddressModalOpen}
                            onClose={() => setIsAddressModalOpen(false)}
                            addresses={addresses}
                            selectedId={selectedAddressId}
                            onSelect={handleAddressSelect}
                        />

                        {/* Section 2: Shipping */}
                        <div className="bg-white rounded-[24px] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 animate-in slide-in-from-bottom-6 duration-500">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 rounded-full bg-[#5a7bed]/10 flex items-center justify-center text-[#5a7bed] font-bold shrink-0">2</div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Kurir & Layanan</h2>
                                </div>
                            </div>

                            <RadioGroup
                                onValueChange={(val) => form.setValue("shippingMethod", val as "standard" | "express")}
                                defaultValue={form.getValues("shippingMethod")}
                                className="space-y-4"
                            >
                                <label className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-[16px] border-2 cursor-pointer transition-all ${selectedShipping === "standard" ? "border-[#5a7bed] bg-[#5a7bed]/5 shadow-sm" : "border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200"}`}>
                                    <div className="flex items-start gap-4 mb-2 sm:mb-0">
                                        <RadioGroupItem value="standard" id="std" className="mt-1" />
                                        <div>
                                            <p className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                                                <Truck className="w-4 h-4 text-gray-400" />
                                                Reguler (Standard)
                                            </p>
                                            <p className="text-sm text-gray-500 mt-1 font-medium">Estimasi tiba dalam 3-5 hari kerja</p>
                                        </div>
                                    </div>
                                    <span className="font-extrabold text-[#5a7bed] text-lg sm:text-right pl-8 sm:pl-0">
                                        {formatCurrency(SHIPPING_COST.standard)}
                                    </span>
                                </label>

                                <label className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-[16px] border-2 cursor-pointer transition-all ${selectedShipping === "express" ? "border-[#5a7bed] bg-[#5a7bed]/5 shadow-sm" : "border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200"}`}>
                                    <div className="flex items-start gap-4 mb-2 sm:mb-0">
                                        <RadioGroupItem value="express" id="exp" className="mt-1" />
                                        <div>
                                            <p className="font-extrabold text-gray-900 text-base flex items-center gap-2">
                                                <Truck className="w-4 h-4 text-gray-400" />
                                                Kilat (Express)
                                            </p>
                                            <p className="text-sm text-gray-500 mt-1 font-medium">Estimasi tiba dalam 1-2 hari kerja</p>
                                        </div>
                                    </div>
                                    <span className="font-extrabold text-[#5a7bed] text-lg sm:text-right pl-8 sm:pl-0">
                                        {formatCurrency(SHIPPING_COST.express)}
                                    </span>
                                </label>
                            </RadioGroup>
                        </div>

                        {/* Section 3: Payment */}
                        <div className="bg-white rounded-[24px] p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 animate-in slide-in-from-bottom-8 duration-500">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 rounded-full bg-[#5a7bed]/10 flex items-center justify-center text-[#5a7bed] font-bold shrink-0">3</div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Pembayaran</h2>
                                </div>
                            </div>

                            <RadioGroup
                                onValueChange={(val) => form.setValue("paymentMethod", val as "bank_transfer" | "qris" | "ewallet" | "cod")}
                                defaultValue={form.getValues("paymentMethod")}
                                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                            >
                                {[
                                    { id: "bank_transfer", label: "Virtual Account", desc: "BCA, Mandiri, BNI, BRI", icon: <CreditCard className="w-5 h-5" /> },
                                    { id: "qris", label: "QRIS Bebas", desc: "Scan pakai mBanking/eWallet apa saja", icon: <Receipt className="w-5 h-5" /> },
                                    { id: "ewallet", label: "E-Wallet VIP", desc: "GoPay, OVO, Dana, ShopeePay", icon: <CreditCard className="w-5 h-5" /> },
                                    { id: "cod", label: "Bayar di Tempat", desc: "Bayar tunai ke kurir (Syarat berlaku)", icon: <Truck className="w-5 h-5" /> },
                                ].map((method) => {
                                    const isSelected = form.watch("paymentMethod") === method.id;
                                    return (
                                        <label key={method.id} className={`flex items-start p-4 rounded-[16px] border-2 cursor-pointer transition-all ${isSelected ? "border-[#5a7bed] bg-[#5a7bed]/5 shadow-sm" : "border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200"}`}>
                                            <div className="flex items-start gap-4">
                                                <RadioGroupItem value={method.id} id={method.id} className="mt-0.5" />
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-[#5a7bed] text-white' : 'bg-white text-gray-400 shadow-sm border border-gray-100'}`}>
                                                            {method.icon}
                                                        </div>
                                                        <p className={`font-extrabold text-sm ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>{method.label}</p>
                                                    </div>
                                                    <p className="text-xs text-gray-500 font-medium pl-8">{method.desc}</p>
                                                </div>
                                                {isSelected && <CheckCircle2 className="w-5 h-5 text-[#5a7bed] absolute right-4 opacity-0 animate-in fade-in fill-white" />}
                                            </div>
                                        </label>
                                    );
                                })}
                            </RadioGroup>
                        </div>
                    </div>

                    {/* Right: Sticky Summary */}
                    <div className="w-full lg:w-[420px] shrink-0">
                        <div className="bg-white rounded-[32px] p-6 lg:p-8 shadow-xl shadow-gray-200/50 border border-gray-100 sticky top-24 animate-in slide-in-from-right-8 duration-700">
                            <h2 className="text-2xl font-display font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                                Detail Pesanan
                            </h2>

                            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {cartItems.map((item) => (
                                    <div key={item.productId} className="flex gap-4">
                                        <div className="relative w-16 h-16 rounded-[12px] shadow-sm border border-gray-100 overflow-hidden bg-white shrink-0">
                                            <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                                            <span className="absolute top-0 right-0 bg-gray-900/80 backdrop-blur-md text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-bl-[8px] font-bold">
                                                {item.quantity}
                                            </span>
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center min-w-0">
                                            <p className="text-sm font-bold text-gray-900 leading-tight truncate">{item.name}</p>
                                            <p className="text-xs text-gray-500 font-medium mt-1">{formatCurrency(item.discountPrice ?? item.price)} / pcs</p>
                                        </div>
                                        <div className="font-extrabold text-[15px] text-gray-900 shrink-0 self-center">
                                            {formatCurrency((item.discountPrice ?? item.price) * item.quantity)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 pt-6 border-t border-dashed border-gray-200 text-sm font-medium">
                                <div className="flex justify-between items-center text-gray-500">
                                    <span>Subtotal ({cartItems.length} Produk)</span>
                                    <span className="text-gray-900 font-bold">{formatCurrency(cartTotal)}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-500">
                                    <span>Biaya Pengiriman</span>
                                    <span className="text-gray-900 font-bold">{formatCurrency(shippingCost)}</span>
                                </div>

                                {selectedShipping === "standard" && cartTotal > 500000 && (
                                    <div className="flex justify-between items-center text-[#ff6b6b] bg-[#ff6b6b]/10 p-2 rounded-lg mt-2">
                                        <span className="font-bold text-xs uppercase tracking-wider">Diskon Ongkir</span>
                                        <span className="font-extrabold">-{formatCurrency(shippingCost)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-end pt-6 mt-6 border-t border-gray-100">
                                <div>
                                    <span className="block text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Total Bayar</span>
                                    <span className="text-xs text-gray-400">Termasuk pajak</span>
                                </div>
                                <span className="text-3xl font-extrabold text-[#5a7bed] tracking-tight drop-shadow-sm">
                                    {formatCurrency(finalTotal)}
                                </span>
                            </div>

                            <Button
                                type="submit"
                                size="lg"
                                className="w-full h-14 mt-8 rounded-[16px] bg-[#5a7bed] hover:bg-[#4e81ff] text-white font-bold text-lg shadow-xl shadow-blue-500/25 transition-all hover:-translate-y-1 relative overflow-hidden group"
                                disabled={isPending}
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-[16px]"></div>
                                <span className="relative z-10 flex items-center justify-center">
                                    {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Bayar Sekarang"}
                                </span>
                            </Button>

                            <p className="text-center text-[11px] text-gray-400 font-medium mt-4 leading-relaxed">
                                Membayar pesanan berarti Anda patuh pada <Link href="#" className="underline hover:text-gray-600 transition-colors">Peraturan Alma Shop</Link>.
                            </p>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
