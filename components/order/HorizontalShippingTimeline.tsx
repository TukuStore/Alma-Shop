import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

type OrderType = {
    id: string;
    status: string;
    created_at: string;
    courier?: string | null;
    tracking_number?: string | null;
    shipped_at?: string | null;
    completed_at?: string | null;
};

interface HorizontalShippingTimelineProps {
    order: OrderType;
}

export default function HorizontalShippingTimeline({ order }: HorizontalShippingTimelineProps) {
    const isCancelled = order.status === 'CANCELLED';
    const isReturn = ['RETURN_REQUESTED', 'RETURN_REJECTED', 'REFUNDED'].includes(order.status);

    let activeIndex = 0;
    if (order.status === 'COMPLETED') activeIndex = 4;
    else if (order.status === 'SHIPPED') activeIndex = 3;
    else if (order.status === 'PROCESSING') activeIndex = 2;
    else if (order.status === 'PAID') activeIndex = 1;
    else activeIndex = 0; // PENDING

    const paymentLabel = order.status === 'PENDING' ? 'Menunggu\nPembayaran' : 'Pembayaran\nDikonfirmasi';

    const visualSteps: { label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
        { label: 'Pesanan\nDibuat', icon: 'clipboard-outline' },
        { label: paymentLabel, icon: 'card-outline' },
        { label: 'Sedang\nDikemas', icon: 'cube-outline' },
        { label: 'Dikirim', icon: 'airplane-outline' },
        { label: 'Pesanan\nSelesai', icon: 'home-outline' },
    ];

    // Estimate expected arrival explicitly similar to the web-store
    let expectedArrival = '---';
    if (order.completed_at) {
        expectedArrival = new Date(order.completed_at).toLocaleDateString('id-ID', { year: '2-digit', month: '2-digit', day: '2-digit' });
    } else if (order.shipped_at) {
        expectedArrival = new Date(new Date(order.shipped_at).getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID', { year: '2-digit', month: '2-digit', day: '2-digit' });
    } else {
        // Fallback: 5 days from creation
        expectedArrival = new Date(new Date(order.created_at).getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID', { year: '2-digit', month: '2-digit', day: '2-digit' });
    }

    return (
        <View className="w-full bg-[#f4f6f8] rounded-2xl p-5 border border-gray-200 mt-2 mb-4">
            {/* Header section */}
            <View className="flex-row justify-between items-start mb-6">
                <Text className="font-extrabold text-gray-900 text-lg uppercase">
                    ORDER <Text style={{ color: '#0076F5' }}>#{order.id.split('-')[0].toUpperCase()}</Text>
                </Text>

                <View className="items-end shrink-0 pl-4">
                    <Text className="text-xs font-medium text-gray-600 mb-1">
                        Tiba Estimasi: <Text className="text-gray-900 font-bold">{expectedArrival}</Text>
                    </Text>
                    <Text className="text-[11px] font-bold text-gray-500 uppercase">
                        {order.courier || 'Kurir Reg'} <Text className="text-gray-900 font-extrabold tracking-wider">{order.tracking_number || '-'}</Text>
                    </Text>
                </View>
            </View>

            {isCancelled || isReturn ? (
                <View className="items-center justify-center py-6">
                    <Ionicons name="warning-outline" size={40} color="#dc2626" className="mb-2" />
                    <Text className="text-base font-bold text-red-600 mb-1">Pesanan Bermasalah / Dibatalkan</Text>
                    <Text className="text-xs text-gray-500 text-center px-4">Pesanan ini telah dibatalkan atau sedang dalam proses komplain.</Text>
                </View>
            ) : (
                <View className="w-full py-4 mt-2">
                    <View className="flex-row justify-between items-start relative px-1">
                        {visualSteps.map((step, idx) => {
                            const isCompleted = idx <= activeIndex;
                            const isLast = idx === visualSteps.length - 1;

                            return (
                                <View key={idx} className="items-center relative z-10" style={{ width: `${100 / visualSteps.length}%` }}>

                                    {/* Connecting Line */}
                                    {!isLast && (
                                        <View
                                            className="absolute top-[22px] left-1/2 w-full h-[3px] -z-10"
                                            style={{ backgroundColor: '#d1d5db' }}
                                        >
                                            <View
                                                className="h-full"
                                                style={{
                                                    width: activeIndex > idx ? '100%' : '0%',
                                                    backgroundColor: '#7c3aed'
                                                }}
                                            />
                                        </View>
                                    )}

                                    {/* Circle Progress Indicator */}
                                    <View
                                        className="items-center justify-center rounded-full border-[4px]"
                                        style={{
                                            width: 44,
                                            height: 44,
                                            backgroundColor: isCompleted ? '#7c3aed' : '#e5e7eb',
                                            borderColor: '#f4f6f8'
                                        }}
                                    >
                                        {isCompleted ? (
                                            <Ionicons name="checkmark" size={20} color="#ffffff" />
                                        ) : (
                                            <View className="w-3 h-3 bg-[#f4f6f8] rounded-full opacity-75" />
                                        )}
                                    </View>

                                    {/* Stage Icon & Label */}
                                    <View className="mt-4 items-center">
                                        <Ionicons
                                            name={step.icon}
                                            size={24}
                                            color={isCompleted ? '#111827' : '#9ca3af'}
                                            style={{ marginBottom: 6 }}
                                        />
                                        <Text
                                            className="font-bold text-center leading-tight text-[10px]"
                                            style={{ color: isCompleted ? '#111827' : '#9ca3af', height: 28 }}
                                        >
                                            {step.label}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>
            )}
        </View>
    );
}
