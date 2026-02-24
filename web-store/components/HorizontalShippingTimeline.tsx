import type { Order } from "@/types/orders";
import { AlertTriangle, Check, ClipboardList, CreditCard, Home, Package as PackageIcon, Truck } from "lucide-react";

interface HorizontalShippingTimelineProps {
    order: Order;
}

export function HorizontalShippingTimeline({ order }: HorizontalShippingTimelineProps) {
    const isCancelled = order.status === "CANCELLED";
    const isReturn = ["RETURN_REQUESTED", "RETURN_REJECTED", "REFUNDED"].includes(order.status);

    let activeIndex = 0;
    if (order.status === "COMPLETED") activeIndex = 4;
    else if (order.status === "SHIPPED") activeIndex = 3;
    else if (order.status === "PROCESSING") activeIndex = 2;
    else if (order.status === "PAID") activeIndex = 1;
    else activeIndex = 0; // PENDING

    const paymentLabel = order.status === "PENDING" ? "Menunggu\nPembayaran" : "Pembayaran\nDikonfirmasi";

    const visualSteps = [
        { label: "Pesanan\nDibuat", icon: ClipboardList },
        { label: paymentLabel, icon: CreditCard },
        { label: "Sedang\nDikemas", icon: PackageIcon },
        { label: "Dikirim", icon: Truck },
        { label: "Pesanan\nSelesai", icon: Home },
    ];

    const expectedArrival = order.completed_at
        ? new Date(order.completed_at).toLocaleDateString('id-ID', { year: '2-digit', month: '2-digit', day: '2-digit' })
        : order.shipped_at
            ? new Date(new Date(order.shipped_at).getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID', { year: '2-digit', month: '2-digit', day: '2-digit' })
            : '---';

    return (
        <div className="w-full bg-[#f4f6f8] rounded-2xl p-6 md:p-8 border border-gray-200 mt-2 mb-2">
            {/* Header section matching reference image */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <h3 className="font-extrabold text-gray-900 text-lg md:text-xl tracking-tight uppercase flex items-center gap-2">
                    ORDER <span className="text-[#0076F5]">#{order.id.split('-')[0].toUpperCase()}</span>
                </h3>

                <div className="text-left md:text-right flex flex-col gap-1">
                    <p className="text-sm font-medium text-gray-600">Expected Arrival <span className="text-gray-900 font-bold ml-1">{expectedArrival}</span></p>
                    <p className="text-sm font-medium text-gray-600 uppercase">
                        {order.courier || 'Kurir Reg'} <span className="text-gray-900 font-black tracking-wider ml-1">{order.tracking_number || '-'}</span>
                    </p>
                </div>
            </div>

            {isCancelled || isReturn ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-red-600">
                    <AlertTriangle className="w-12 h-12 mb-4" />
                    <h3 className="text-lg font-bold">Pesanan Bermasalah / Dibatalkan</h3>
                    <p className="text-sm text-gray-500 mt-2">Pesanan ini telah dibatalkan atau sedang dalam proses komplain.</p>
                </div>
            ) : (
                <div className="w-full max-w-5xl mx-auto py-6">
                    <div className="flex justify-between items-start w-full relative">
                        {visualSteps.map((step, idx) => {
                            const isCompleted = idx <= activeIndex;
                            const isLast = idx === visualSteps.length - 1;

                            return (
                                <div key={idx} className="flex flex-col items-center relative" style={{ width: `${100 / visualSteps.length}%` }}>

                                    {/* Connecting Line (drawn from the center of this item to the center of the next) */}
                                    {!isLast && (
                                        <div
                                            className="absolute top-[27px] left-1/2 w-full h-[4px] -z-0"
                                            style={{ backgroundColor: '#d1d5db' }}
                                        >
                                            <div
                                                className="h-full transition-all duration-700 ease-in-out"
                                                style={{
                                                    width: activeIndex > idx ? '100%' : '0%',
                                                    backgroundColor: '#7c3aed'
                                                }}
                                            />
                                        </div>
                                    )}

                                    {/* Circle Progress Indicator */}
                                    <div
                                        className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center border-[6px] transition-colors duration-500 shadow-sm"
                                        style={{
                                            backgroundColor: isCompleted ? '#7c3aed' : '#e5e7eb',
                                            borderColor: '#f4f6f8'
                                        }}
                                    >
                                        {isCompleted ? (
                                            <Check className="w-6 h-6 stroke-[4]" style={{ color: '#ffffff' }} />
                                        ) : (
                                            <div className="w-4 h-4 bg-[#f4f6f8] rounded-full shadow-inner opacity-75"></div>
                                        )}
                                    </div>

                                    {/* Stage Icon & Label underneath */}
                                    <div className="mt-6 flex flex-col items-center">
                                        <step.icon className="w-8 h-8 md:w-10 md:h-10 mb-3 transition-colors duration-500" style={{ color: isCompleted ? '#111827' : '#9ca3af' }} />
                                        <span className="text-[11px] sm:text-xs md:text-[13px] font-bold text-center leading-tight whitespace-pre-line transition-colors duration-500" style={{ color: isCompleted ? '#111827' : '#9ca3af' }}>
                                            {step.label}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
