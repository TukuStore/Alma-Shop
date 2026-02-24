'use client';

import { OrderTabs } from "@/components/OrderTabs";
import { ShippingTimeline } from "@/components/ShippingTimeline";
import { formatCurrency } from "@/lib/constants";
import { getProductFromItem, type Order } from "@/types/orders";
import { ChevronDown, ChevronUp, Package, ShoppingBag, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { cancelOrder } from "../api/orders/actions";
import { ComplaintButtonModal } from "./ComplaintButtonModal";
import { CompleteOrderButtonModal } from "./CompleteOrderButtonModal";
import { ReviewButtonModal } from "./ReviewButtonModal";

// Tab configuration - Maps to Supabase statuses
const ORDER_TABS = [
    { value: "all", label: "Semua", icon: ShoppingBag },
    { value: "pending", label: "Belum Bayar", icon: Package },
    { value: "processing", label: "Sedang Dikemas", icon: Package },
    { value: "shipped", label: "Dikirim", icon: Package },
    { value: "completed", label: "Selesai", icon: Package },
    { value: "cancelled", label: "Dibatalkan", icon: XCircle },
    { value: "returns", label: "Pengembalian Barang", icon: Package },
];

// Status mapping for filtering
const STATUS_FILTER_MAP: Record<string, string[]> = {
    all: [], // No filter
    pending: ["PENDING"],
    processing: ["PAID", "PROCESSING"],
    shipped: ["SHIPPED"],
    completed: ["COMPLETED"],
    cancelled: ["CANCELLED"],
    returns: ["RETURN_REQUESTED", "RETURN_REJECTED", "REFUNDED"],
};

// Status config for badges (solid and clean standard colors)
const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    PENDING: { label: "Belum Bayar", color: "text-amber-700", bg: "bg-amber-100" },
    PAID: { label: "Dibayar", color: "text-blue-700", bg: "bg-blue-100" },
    PROCESSING: { label: "Dikemas", color: "text-indigo-700", bg: "bg-indigo-100" },
    SHIPPED: { label: "Dikirim", color: "text-emerald-700", bg: "bg-emerald-100" },
    COMPLETED: { label: "Selesai", color: "text-emerald-700", bg: "bg-emerald-100" },
    CANCELLED: { label: "Dibatalkan", color: "text-red-700", bg: "bg-red-100" },
    RETURN_REQUESTED: { label: "Komplain Diajukan", color: "text-orange-700", bg: "bg-orange-100" },
    RETURN_REJECTED: { label: "Komplain Ditolak", color: "text-red-700", bg: "bg-red-100" },
    REFUNDED: { label: "Terdana Kembali", color: "text-slate-700", bg: "bg-slate-200" },
};

export default function OrdersPage({ initialOrders }: { initialOrders: Order[] }) {
    const [activeTab, setActiveTab] = useState("all");
    const [orders, setOrders] = useState(initialOrders);
    const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
    const [expandedTimeline, setExpandedTimeline] = useState<string | null>(null);

    // Filter orders based on active tab
    const filteredOrders = orders.filter((order) => {
        if (activeTab === "all") return true;
        const statusFilters = STATUS_FILTER_MAP[activeTab];
        return statusFilters.includes(order.status);
    });

    // Calculate counts for each tab
    const tabsWithCounts = ORDER_TABS.map((tab) => ({
        ...tab,
        count: tab.value === "all"
            ? orders.length
            : orders.filter((order) => {
                const filters = STATUS_FILTER_MAP[tab.value];
                return filters.includes(order.status);
            }).length,
    }));

    // Handler: Cancel Order
    const handleCancelOrder = async (orderId: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm("Batalkan pesanan ini?")) return;

        setProcessingOrderId(orderId);
        const result = await cancelOrder(orderId);

        if (result.success) {
            // Update local state
            setOrders(prev => prev.map(o =>
                o.id === orderId ? { ...o, status: "CANCELLED" } : o
            ));
            alert("Pesanan berhasil dibatalkan");
        } else {
            alert(result.error || "Gagal membatalkan pesanan");
        }
        setProcessingOrderId(null);
    };


    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <div className="container mx-auto px-4 lg:px-6 max-w-5xl pt-8">

                {/* Header */}
                <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            Riwayat Pesanan
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Pantau status pesanan dan kelola pembelian Anda.
                        </p>
                    </div>
                </div>

                {/* Tabbed Navigation */}
                <div className="mb-6">
                    <OrderTabs
                        tabs={tabsWithCounts}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    />
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm flex flex-col items-center mt-6">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <ShoppingBag className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            Tidak ada pesanan di sini
                        </h3>
                        <p className="text-gray-500 mb-6 text-sm max-w-sm">
                            {activeTab === "all"
                                ? "Koleksi sarung eksklusif kami sudah menunggu Anda. Yuk mulai belanja!"
                                : "Belum ada pesanan yang sesuai dengan status ini."
                            }
                        </p>
                        <Link
                            href="/products"
                            className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 px-6 text-sm font-semibold text-white transition-colors"
                        >
                            Mulai Belanja
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => {
                            const firstItem = order.items?.[0];
                            const firstProduct = firstItem ? getProductFromItem(firstItem) : null;
                            const remainingItemsCount = (order.items?.length || 0) - 1;
                            const statusInfo = statusConfig[order.status] || {
                                label: order.status,
                                color: "text-gray-700",
                                bg: "bg-gray-100",
                            };
                            const isTimelineExpanded = expandedTimeline === order.id;

                            return (
                                <div
                                    key={order.id}
                                    className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                                >
                                    {/* Order Header */}
                                    <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-200 rounded text-xs font-semibold text-gray-700 shadow-sm">
                                                <ShoppingBag className="w-3.5 h-3.5 text-gray-400" />
                                                <span className="uppercase">#{order.id.slice(0, 8)}</span>
                                            </div>
                                            <span className="text-gray-500 text-xs font-medium hidden sm:block">
                                                {new Date(order.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <div className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${statusInfo.bg} ${statusInfo.color}`}>
                                            {statusInfo.label}
                                        </div>
                                    </div>

                                    {/* Order Content */}
                                    <Link href={`/orders/${order.id}`} className="block p-4 hover:bg-gray-50/30 transition-colors">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                            {/* Product Thumbnail */}
                                            {firstProduct?.images?.[0] ? (
                                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden relative border border-gray-200 shrink-0 bg-white">
                                                    <Image
                                                        src={firstProduct.images[0]}
                                                        alt={firstProduct.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg border border-gray-200 shrink-0 bg-gray-50 flex items-center justify-center">
                                                    <Package className="w-6 h-6 text-gray-300" />
                                                </div>
                                            )}

                                            {/* Product Info */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-1 mb-1">
                                                    {firstProduct?.name || 'Produk'}
                                                </h4>
                                                <p className="text-xs sm:text-sm text-gray-500">
                                                    {firstItem?.quantity} barang × {formatCurrency(firstItem?.price_at_purchase || 0)}
                                                </p>
                                                {remainingItemsCount > 0 && (
                                                    <div className="mt-1 text-xs font-medium text-gray-400">
                                                        + {remainingItemsCount} produk lainnya
                                                    </div>
                                                )}
                                            </div>

                                            {/* Total */}
                                            <div className="sm:text-right border-t sm:border-0 border-gray-100 pt-3 sm:pt-0 w-full sm:w-auto mt-2 sm:mt-0">
                                                <span className="block text-xs text-gray-500 mb-0.5">Total Belanja</span>
                                                <span className="font-bold text-gray-900">
                                                    {formatCurrency(order.total_amount)}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>

                                    {/* Shipping Timeline Toggle */}
                                    {order.status !== "PENDING" && order.status !== "CANCELLED" && (
                                        <div className="px-4 pb-4">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setExpandedTimeline(isTimelineExpanded ? null : order.id);
                                                }}
                                                className="w-full py-2.5 flex items-center justify-center gap-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all text-sm font-semibold text-gray-700 outline-none"
                                            >
                                                {isTimelineExpanded ? (
                                                    <>Sembunyikan Status <ChevronUp className="w-4 h-4 ml-1" /></>
                                                ) : (
                                                    <>Lacak Pesanan <ChevronDown className="w-4 h-4 ml-1" /></>
                                                )}
                                            </button>
                                        </div>
                                    )}

                                    {/* Shipping Timeline (Expanded) */}
                                    {isTimelineExpanded && (
                                        <div className="px-4 pb-4">
                                            <ShippingTimeline order={order} expanded={true} />
                                        </div>
                                    )}

                                    {/* Action Buttons Area */}
                                    <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-white">
                                        {order.status === "PENDING" && (
                                            <>
                                                <button
                                                    onClick={(e) => handleCancelOrder(order.id, e)}
                                                    disabled={processingOrderId === order.id}
                                                    className="w-full sm:w-auto px-5 py-2 border border-gray-300 bg-white text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                                >
                                                    Batalkan Pesanan
                                                </button>
                                                <Link
                                                    href={`/orders/${order.id}`}
                                                    style={{ backgroundColor: '#121926', color: '#ffffff' }}
                                                    className="w-full sm:w-auto px-5 py-2 text-sm font-semibold rounded-lg shadow-sm transition-opacity hover:opacity-90 text-center"
                                                >
                                                    Bayar Sekarang
                                                </Link>
                                            </>
                                        )}

                                        {order.status === "SHIPPED" && (
                                            <>
                                                <ComplaintButtonModal orderId={order.id} />
                                                <CompleteOrderButtonModal orderId={order.id} />
                                            </>
                                        )}

                                        {order.status === "COMPLETED" && (
                                            <>
                                                <ReviewButtonModal order={order} />
                                                <Link
                                                    href={`/products`}
                                                    style={{ backgroundColor: '#121926', color: '#ffffff' }}
                                                    className="w-full sm:w-auto px-5 py-2 text-sm font-semibold rounded-lg shadow-sm transition-opacity hover:opacity-90 text-center"
                                                >
                                                    Beli Produk Lagi
                                                </Link>
                                            </>
                                        )}

                                        {order.status === "RETURN_REQUESTED" && (
                                            <Link
                                                href={`/orders/${order.id}`}
                                                className="w-full sm:w-auto px-5 py-2 border border-gray-300 bg-white text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors text-center"
                                            >
                                                Cek Status Pengembalian
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
