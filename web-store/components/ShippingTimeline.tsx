import type { TimelineStep } from "@/types/orders";
import { type Order } from "@/types/orders";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { AlertCircle, Check, Clock, Package, Truck, XCircle } from "lucide-react";

interface ShippingTimelineProps {
    order: Order;
    expanded?: boolean;
}

// Define timeline steps based on order status
export function getTimelineSteps(order: Order): TimelineStep[] {
    const steps: TimelineStep[] = [
        {
            key: "created",
            label: "Pesanan Dibuat",
            description: "Pesanan Anda telah berhasil dibuat",
            timestamp: order.created_at,
            status: "completed",
            icon: "Package",
        },
    ];

    // Add PAID step
    if (order.status === "PENDING") {
        steps.push({
            key: "paid",
            label: "Menunggu Pembayaran",
            description: "Silakan selesaikan pembayaran pesanan Anda",
            timestamp: order.paid_at,
            status: "current",
            icon: "Clock",
        });
    } else if (order.paid_at || ["PAID", "PROCESSING", "SHIPPED", "COMPLETED", "RETURN_REQUESTED", "RETURN_REJECTED", "REFUNDED"].includes(order.status)) {
        steps.push({
            key: "paid",
            label: "Pembayaran Dikonfirmasi",
            description: "Pembayaran Anda telah berhasil dikonfirmasi",
            timestamp: order.paid_at || order.created_at,
            status: "completed",
            icon: "Check",
        });
    }

    // Add PROCESSING step
    if (["PROCESSING", "SHIPPED", "COMPLETED", "RETURN_REQUESTED", "RETURN_REJECTED", "REFUNDED"].includes(order.status)) {
        steps.push({
            key: "processing",
            label: "Sedang Dikemas",
            description: "Pesanan sedang disiapkan oleh penjual",
            timestamp: order.processed_at,
            status: order.status === "PROCESSING" ? "current" : "completed",
            icon: "Package",
        });
    } else if (["PAID"].includes(order.status)) {
        steps.push({
            key: "processing",
            label: "Menunggu Pengiriman",
            description: "Pesanan akan segera dikemas",
            timestamp: null,
            status: "pending",
            icon: "Clock",
        });
    }

    // Add SHIPPED step
    if (["SHIPPED", "COMPLETED", "RETURN_REQUESTED", "RETURN_REJECTED", "REFUNDED"].includes(order.status)) {
        steps.push({
            key: "shipped",
            label: "Dikirim",
            description: order.courier && order.tracking_number
                ? `Pesanan dikirim via ${order.courier} (${order.tracking_number})`
                : "Pesanan sedang dalam perjalanan",
            timestamp: order.shipped_at,
            status: order.status === "SHIPPED" ? "current" : "completed",
            icon: "Truck",
        });
    } else if (["PROCESSING"].includes(order.status)) {
        steps.push({
            key: "shipped",
            label: "Menunggu Pengiriman",
            description: "Pesanan akan segera dikirim",
            timestamp: null,
            status: "pending",
            icon: "Clock",
        });
    }

    // Add COMPLETED step
    if (["COMPLETED"].includes(order.status)) {
        steps.push({
            key: "completed",
            label: "Pesanan Selesai",
            description: "Pesanan telah diterima",
            timestamp: order.completed_at,
            status: "completed",
            icon: "Check",
        });
    } else if (["SHIPPED"].includes(order.status)) {
        steps.push({
            key: "completed",
            label: "Menunggu Konfirmasi",
            description: "Konfirmasi setelah menerima pesanan",
            timestamp: null,
            status: "pending",
            icon: "Clock",
        });
    }

    // Add CANCELLED step (replaces normal flow)
    if (order.status === "CANCELLED") {
        return [
            {
                key: "created",
                label: "Pesanan Dibuat",
                description: "Pesanan Anda telah berhasil dibuat",
                timestamp: order.created_at,
                status: "completed",
                icon: "Package",
            },
            {
                key: "cancelled",
                label: "Pesanan Dibatalkan",
                description: "Pesanan telah dibatalkan",
                timestamp: order.cancelled_at,
                status: "current",
                icon: "XCircle",
            },
        ];
    }

    // Add RETURN steps
    if (["RETURN_REQUESTED", "RETURN_REJECTED", "REFUNDED"].includes(order.status)) {
        const lastStep = steps[steps.length - 1];
        if (lastStep) {
            lastStep.status = "completed";
        }

        if (order.status === "RETURN_REQUESTED") {
            steps.push({
                key: "return_requested",
                label: "Pengembalian Diajukan",
                description: "Permintaan pengembalian sedang diproses",
                timestamp: order.return_requested_at,
                status: "current",
                icon: "AlertCircle",
            });
        } else if (order.status === "RETURN_REJECTED") {
            steps.push({
                key: "return_rejected",
                label: "Pengembalian Ditolak",
                description: "Permintaan pengembalian ditolak",
                timestamp: order.return_requested_at,
                status: "current",
                icon: "XCircle",
            });
        } else if (order.status === "REFUNDED") {
            steps.push({
                key: "refunded",
                label: "Dikembalikan",
                description: "Pengembalian dana telah diproses",
                timestamp: order.return_requested_at,
                status: "completed",
                icon: "Check",
            });
        }
    }

    return steps;
}

// Icon component mapper
function TimelineIcon({ icon, status }: { icon: string; status: "completed" | "current" | "pending" }) {
    const iconClass = status === "completed"
        ? "text-emerald-600 bg-emerald-100"
        : status === "current"
            ? "text-[#5a7bed] bg-[#5a7bed]/10"
            : "text-gray-400 bg-gray-100";

    const icons = {
        Package: <Package className={`w-5 h-5 ${status === "completed" ? "text-emerald-600" : status === "current" ? "text-[#5a7bed]" : "text-gray-400"}`} />,
        Truck: <Truck className={`w-5 h-5 ${status === "completed" ? "text-emerald-600" : status === "current" ? "text-[#5a7bed]" : "text-gray-400"}`} />,
        Check: <Check className={`w-5 h-5 ${status === "completed" ? "text-emerald-600" : status === "current" ? "text-[#5a7bed]" : "text-gray-400"}`} />,
        Clock: <Clock className={`w-5 h-5 ${status === "completed" ? "text-emerald-600" : status === "current" ? "text-[#5a7bed]" : "text-gray-400"}`} />,
        XCircle: <XCircle className={`w-5 h-5 text-red-600`} />,
        AlertCircle: <AlertCircle className={`w-5 h-5 text-orange-600`} />,
    };

    return (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconClass}`}>
            {icons[icon as keyof typeof icons] || icons.Package}
        </div>
    );
}

// Format timestamp to relative time
function formatTimestamp(timestamp: string | null | undefined): string {
    if (!timestamp) return "";
    try {
        return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: id });
    } catch {
        return "";
    }
}

export function ShippingTimeline({ order, expanded = true }: ShippingTimelineProps) {
    const steps = getTimelineSteps(order);

    return (
        <div className={`bg-white rounded-[20px] border border-gray-100 overflow-hidden ${expanded ? "" : "max-h-16"}`}>
            {/* Header - always visible */}
            <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">Status Pengiriman</h3>
                    {order.tracking_number && (
                        <div className="text-xs text-gray-500">
                            <span className="font-semibold">No. Resi:</span> {order.tracking_number}
                        </div>
                    )}
                </div>
                {order.courier && (
                    <div className="text-xs text-gray-500 mt-1">
                        Kurir: <span className="font-semibold">{order.courier}</span>
                    </div>
                )}
            </div>

            {/* Timeline steps */}
            {expanded && (
                <div className="p-4">
                    <div className="relative">
                        {/* Vertical line */}
                        <div className="absolute left-5 top-10 bottom-10 w-0.5 bg-gray-200" />

                        {/* Steps */}
                        {steps.map((step, index) => (
                            <div key={step.key} className="relative flex items-start gap-4 pb-8 last:pb-0">
                                {/* Icon */}
                                <div className="relative z-10">
                                    <TimelineIcon icon={step.icon} status={step.status} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 pt-1">
                                    <div className="flex items-center justify-between gap-4">
                                        <h4 className={`font-semibold ${step.status === "current" ? "text-[#5a7bed]" : step.status === "completed" ? "text-gray-900" : "text-gray-500"}`}>
                                            {step.label}
                                        </h4>
                                        {step.timestamp && (
                                            <span className="text-xs text-gray-400 whitespace-nowrap">
                                                {formatTimestamp(step.timestamp)}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-0.5">{step.description}</p>
                                    {step.timestamp && step.status === "current" && (
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(step.timestamp).toLocaleString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
