import { HorizontalShippingTimeline } from "@/components/HorizontalShippingTimeline";
import { formatCurrency } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, CreditCard, MapPin, Package, Receipt } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ComplaintButtonModal } from "../ComplaintButtonModal";
import { CompleteOrderButtonModal } from "../CompleteOrderButtonModal";
import { PayNowButton } from "./PayNowButton";

export default async function OrderDetailPage({
    params
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
}: { params: Promise<any> }) {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    const { data: order, error } = await supabase
        .from("orders")
        .select(`
      *,
      items:order_items(
        id, quantity, price_at_purchase,
        product:products(name, images)
      )
    `)
        .eq("id", id)
        .single();

    if (error || !order || order.user_id !== user.id) {
        notFound();
    }

    const statusMap: Record<string, number> = {
        PENDING: 0,
        PAID: 1,
        PROCESSING: 2,
        SHIPPED: 3,
        COMPLETED: 4,
    };
    const currentStepIndex = statusMap[order.status] ?? 0;

    const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
        PENDING: { label: "Belum Bayar", color: "text-amber-700", bg: "bg-amber-100" },
        PAID: { label: "Dibayar", color: "text-blue-700", bg: "bg-blue-100" },
        PROCESSING: { label: "Dikemas", color: "text-indigo-700", bg: "bg-indigo-100" },
        SHIPPED: { label: "Dikirim", color: "text-emerald-700", bg: "bg-emerald-100" },
        COMPLETED: { label: "Selesai", color: "text-emerald-700", bg: "bg-emerald-100" },
        CANCELLED: { label: "Dibatalkan", color: "text-red-700", bg: "bg-red-100" },
        RETURN_REQUESTED: { label: "Komplain Diajukan", color: "text-orange-700", bg: "bg-orange-100" },
        RETURN_REJECTED: { label: "Komplain Ditolak", color: "text-red-700", bg: "bg-red-100" },
        REFUNDED: { label: "Dana Dikembalikan", color: "text-slate-700", bg: "bg-slate-200" },
    };

    const statusInfo = statusConfig[order.status] || {
        label: order.status, color: "text-gray-600", bg: "bg-gray-100 border-gray-200"
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24 border-t border-gray-200">
            <div className="container mx-auto px-4 lg:px-6 max-w-5xl pt-8">

                {/* Header Back & Title */}
                <div className="mb-6">
                    <Link href="/orders" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-6">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Kembali ke Riwayat
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-gray-500 text-sm font-semibold">
                                    INV-{order.id.split('-')[0].toUpperCase()}
                                </span>
                                <span className="text-gray-300">•</span>
                                <span className="text-gray-500 text-sm font-medium">
                                    {new Date(order.created_at).toLocaleString('id-ID', {
                                        day: 'numeric', month: 'short', year: 'numeric',
                                        hour: '2-digit', minute: '2-digit'
                                    })}
                                </span>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                                Rincian Pesanan
                            </h1>
                        </div>

                        <div className={`px-3 py-1.5 rounded-md text-sm font-bold uppercase ${statusInfo.bg} ${statusInfo.color}`}>
                            {statusInfo.label}
                        </div>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Left Column: Tracking & Items */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Order Timeline Visual - Using HorizontalShippingTimeline Component */}
                        <HorizontalShippingTimeline order={order} />

                        {/* Order Items Detail */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-gray-400" /> Daftar Produk
                                </h2>
                            </div>

                            <div className="p-4 sm:p-6 flex flex-col gap-6">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {order.items?.map((item: any) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg border border-gray-200 overflow-hidden relative bg-white shrink-0">
                                            <Image src={item.product?.images?.[0] || '/images/sarung-placeholder.jpg'} alt={item.product?.name} fill className="object-cover" />
                                        </div>

                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <h4 className="font-semibold text-gray-900 text-base line-clamp-2">{item.product?.name || 'Produk Tidak Terdaftar'}</h4>
                                                <div className="text-sm font-medium text-gray-500 mt-1">
                                                    {item.quantity} Qty <span className="mx-1">•</span> {formatCurrency(item.price_at_purchase)}
                                                </div>
                                            </div>
                                            <div className="mt-2 text-right sm:text-left self-end sm:self-auto">
                                                <span className="block text-xs uppercase text-gray-400 font-bold mb-0.5">Subtotal</span>
                                                <span className="font-bold text-gray-900">
                                                    {formatCurrency(item.quantity * item.price_at_purchase)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Payment & Delivery Summary */}
                    <div className="space-y-6 lg:sticky lg:top-24 h-fit">

                        {/* Fake Payment Warning Box for MVP */}
                        {order.status === "PENDING" && (
                            <div className="bg-white rounded-xl p-6 border border-amber-200 shadow-sm relative overflow-hidden group mb-6">
                                <div className="absolute inset-x-0 top-0 h-1 bg-amber-400" />
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                                        <CreditCard className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Pembayaran</h3>
                                </div>
                                <p className="text-sm text-gray-600 mb-6 font-medium">
                                    Selesaikan pembayaran Anda agar pesanan segera dikirim.
                                </p>
                                <PayNowButton orderId={order.id} />
                            </div>
                        )}

                        {/* Complete Order Box for Shopper UI */}
                        {order.status === "SHIPPED" && (
                            <div className="mb-6">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <ComplaintButtonModal orderId={order.id} />
                                    <CompleteOrderButtonModal orderId={order.id} />
                                </div>
                            </div>
                        )}

                        {/* Invoice Summary */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Receipt className="w-5 h-5 text-gray-400" /> Ringkasan Transaksi
                                </h2>
                            </div>

                            <div className="p-6">
                                <div className="space-y-4 text-sm font-medium pb-6 mb-6 border-b border-gray-100">
                                    <div className="flex justify-between items-center text-gray-600">
                                        <span>Total Harga Produk</span>
                                        <span className="text-gray-900">{formatCurrency(order.total_amount - 15000)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-gray-600">
                                        <span>Ongkos Kirim</span>
                                        <span className="text-gray-900">{formatCurrency(15000)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-red-600 pt-2">
                                        <span className="font-semibold uppercase tracking-wide text-xs">Potongan Promo</span>
                                        <span className="font-bold">- {formatCurrency(0)}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 bg-gray-50 rounded-lg border border-gray-100 mb-6">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Total Tagihan</span>
                                    {/* Using break-all to prevent long amounts from overflowing */}
                                    <span className="font-bold text-blue-600 text-2xl tracking-tight break-all">
                                        {formatCurrency(order.total_amount)}
                                    </span>
                                </div>

                                <div>
                                    <h3 className="text-xs font-bold text-gray-500 flex items-center gap-1.5 uppercase tracking-wide mb-2">
                                        <MapPin className="w-3.5 h-3.5" /> Alamat Pengiriman
                                    </h3>
                                    <p className="text-sm font-medium text-gray-700 whitespace-pre-line leading-relaxed pl-5">
                                        {order.shipping_address}
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
