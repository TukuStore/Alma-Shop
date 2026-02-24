import { Colors } from '@/constants/theme';
import { fetchOrderDetail } from '@/services/orderService';
import { useMedinaStore } from '@/store/useMedinaStore';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type OrderDetail = {
    id: string;
    total_amount: number;
    status: string;
    created_at: string;
    order_items: {
        quantity: number;
        price_at_purchase: number;
        product: {
            name: string;
            images: string[];
        } | null;
    }[];
};

function formatPrice(price: number): string {
    return `Rp ${price.toLocaleString('id-ID')}`;
}

export default function CheckoutSuccessScreen() {
    const { orderId } = useLocalSearchParams<{ orderId?: string }>();
    const user = useMedinaStore((s) => s.auth.user);
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (orderId) {
            fetchOrderDetail(orderId).then(setOrder).finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [orderId]);

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
            </SafeAreaView>
        );
    }

    const totalItems = order?.order_items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
                {/* Success Animation */}
                <View className="items-center mb-8 mt-4">
                    <View className="w-28 h-28 rounded-full bg-green-50 items-center justify-center mb-6 relative">
                        <View className="absolute w-full h-full rounded-full bg-green-100 animate-ping opacity-20" />
                        <Ionicons name="checkmark-circle" size={72} color={Colors.success} />
                    </View>
                    <Text
                        className="text-3xl text-text text-center mb-3"
                        style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
                    >
                        Pesanan Berhasil Dibuat!
                    </Text>
                    <Text
                        className="text-text-muted text-center text-base leading-6 px-4"
                        style={{ fontFamily: 'Inter_400Regular' }}
                    >
                        Terima kasih atas pembelian Anda. Pesanan telah diterima dan sedang diproses.
                    </Text>
                </View>

                {/* Order Summary Card */}
                {order && (
                    <View className="bg-neutral-50 rounded-2xl p-5 mb-6 border border-neutral-100">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-sm font-inter-semibold text-neutral-500">ID Pesanan</Text>
                            <Text className="text-sm font-inter-bold text-neutral-900">
                                #{order.id.slice(0, 8).toUpperCase()}
                            </Text>
                        </View>
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-sm font-inter-semibold text-neutral-500">Total Harga</Text>
                            <Text className="text-lg font-inter-bold text-primary">
                                {formatPrice(order.total_amount)}
                            </Text>
                        </View>
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-sm font-inter-semibold text-neutral-500">Barang</Text>
                            <Text className="text-sm font-inter-medium text-neutral-900">
                                {totalItems} barang
                            </Text>
                        </View>
                        <View className="flex-row items-center justify-between">
                            <Text className="text-sm font-inter-semibold text-neutral-500">Tanggal</Text>
                            <Text className="text-sm font-inter-medium text-neutral-900">
                                {new Date(order.created_at).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                })}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Order Items Preview */}
                {order && order.order_items && order.order_items.length > 0 && (
                    <View className="mb-6">
                        <Text className="text-lg font-inter-bold text-neutral-900 mb-3">
                            Barang yang Dipesan
                        </Text>
                        <View className="space-y-3">
                            {order.order_items.slice(0, 3).map((item, idx) => (
                                <View key={idx} className="flex-row items-center gap-3">
                                    {item.product?.images?.[0] && (
                                        <Image
                                            source={{ uri: item.product.images[0] }}
                                            className="w-16 h-16 rounded-xl bg-neutral-100"
                                            contentFit="cover"
                                        />
                                    )}
                                    <View className="flex-1">
                                        <Text
                                            className="text-sm font-inter-medium text-neutral-900"
                                            numberOfLines={1}
                                        >
                                            {item.product?.name || 'Produk'}
                                        </Text>
                                        <Text className="text-xs font-inter text-neutral-500">
                                            Jml: {item.quantity}
                                        </Text>
                                    </View>
                                    <Text className="text-sm font-inter-semibold text-neutral-900">
                                        {formatPrice(item.price_at_purchase * item.quantity)}
                                    </Text>
                                </View>
                            ))}
                            {order.order_items.length > 3 && (
                                <Text className="text-xs font-inter-medium text-primary text-center">
                                    +{order.order_items.length - 3} barang lainnya
                                </Text>
                            )}
                        </View>
                    </View>
                )}

                {/* Next Steps */}
                <View className="bg-blue-50 rounded-2xl p-5 mb-6">
                    <View className="flex-row items-start gap-3">
                        <Ionicons name="information-circle" size={24} color="#3B82F6" />
                        <View className="flex-1">
                            <Text className="text-base font-inter-semibold text-blue-900 mb-2">
                                Langkah Selanjutnya
                            </Text>
                            <Text className="text-sm font-inter text-blue-700 leading-6">
                                • Anda akan menerima update pesanan via notifikasi{'\n'}
                                • Lacak status pesanan di Pesanan Saya{'\n'}
                                • Hubungi kami jika ada pertanyaan
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View className="w-full gap-3 mb-8">
                    <TouchableOpacity
                        onPress={() => router.replace(`/order/${order?.id || ''}`)}
                        className="w-full bg-primary py-4 rounded-xl items-center shadow-sm shadow-primary/20 active:opacity-90"
                    >
                        <View className="flex-row items-center gap-2">
                            <Ionicons name="receipt-outline" size={20} color="white" />
                            <Text className="text-white font-bold text-base" style={{ fontFamily: 'Inter_600SemiBold' }}>
                                Lihat Detail Pesanan
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.replace('/order')}
                        className="w-full bg-white border-2 border-neutral-200 py-4 rounded-xl items-center active:bg-neutral-50"
                    >
                        <Text className="text-text font-bold text-base" style={{ fontFamily: 'Inter_600SemiBold' }}>
                            Lihat Pesanan Saya
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.replace('/(tabs)')}
                        className="w-full py-4 rounded-xl items-center"
                    >
                        <Text className="text-primary font-semibold text-base" style={{ fontFamily: 'Inter_600SemiBold' }}>
                            Lanjut Belanja
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
