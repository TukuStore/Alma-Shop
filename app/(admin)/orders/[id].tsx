import { Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { notificationService } from '@/services/notificationService';
import { pushNotificationService } from '@/services/pushNotificationService';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AdminOrderDetailScreen() {
    const { id } = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const [order, setOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const fetchOrderDetail = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    profiles(full_name),
                    order_items(
                        *,
                        products(name, images)
                    )
                `)
                .eq('id', id)
                .single();

            if (error) throw error;
            setOrder(data);
        } catch (error) {
            console.error('Fetch order detail error:', error);
            Alert.alert('Error', 'Failed to load order details');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchOrderDetail();
    }, [id]);

    const updateStatus = async (newStatus: string) => {
        setIsActionLoading(true);
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            // Send push notification to customer
            if (order?.user_id) {
                const statusMessages: Record<string, { title: string; body: string }> = {
                    paid: { title: '💰 Payment Confirmed', body: `Your order #${String(id).slice(0, 8).toUpperCase()} payment has been confirmed!` },
                    shipped: { title: '🚚 Order Shipped!', body: `Your order #${String(id).slice(0, 8).toUpperCase()} is on its way!` },
                    completed: { title: '📦 Pesanan Selesai', body: `Your order #${String(id).slice(0, 8).toUpperCase()} has been completed!` },
                    cancelled: { title: '❌ Order Cancelled', body: `Your order #${String(id).slice(0, 8).toUpperCase()} has been cancelled.` },
                };
                const msg = statusMessages[newStatus];
                if (msg) {
                    pushNotificationService.sendPushToUser(
                        order.user_id,
                        msg.title,
                        msg.body,
                        { orderId: id, status: newStatus, screen: 'order_detail' }
                    );
                }
                // Also create in-app notification
                notificationService.sendOrderStatusNotification(order.user_id, String(id), newStatus);
            }

            Alert.alert('Success', `Order status updated to ${newStatus}`);
            fetchOrderDetail(); // Refresh data
        } catch (error: any) {
            console.error('Update status error:', error);
            Alert.alert('Error', error.message || 'Failed to update status');
        } finally {
            setIsActionLoading(false);
        }
    };

    const formatPrice = (price: number) => `Rp ${price.toLocaleString('id-ID')}`;

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-neutral-50 items-center justify-center">
                <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
            </SafeAreaView>
        );
    }

    if (!order) {
        return (
            <SafeAreaView className="flex-1 bg-neutral-50 items-center justify-center">
                <Text className="text-neutral-500">Order not found</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4">
                    <Text className="text-primary font-inter-bold">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-neutral-50" edges={['top']}>
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center justify-between border-b border-neutral-100 bg-white shadow-sm">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 border border-neutral-200 rounded-full items-center justify-center">
                    <Ionicons name="arrow-back" size={20} color={Colors.text.DEFAULT} />
                </TouchableOpacity>
                <Text className="text-xl font-inter-bold text-neutral-900">
                    Order Details
                </Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                {/* Status Card */}
                <View className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm mb-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <View>
                            <Text className="text-xs font-inter-medium text-neutral-500 mb-1">Order ID</Text>
                            <Text className="text-base font-inter-bold text-neutral-900">#{order.id.slice(0, 8).toUpperCase()}</Text>
                        </View>
                        <View className={`px-4 py-2 rounded-full border ${order.status === 'PENDING' || order.status === 'PAID' ? 'bg-orange-50 border-orange-200' :
                            order.status === 'CANCELLED' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                            }`}>
                            <Text className={`text-xs font-inter-bold uppercase ${order.status === 'PENDING' || order.status === 'PAID' ? 'text-orange-600' :
                                order.status === 'CANCELLED' ? 'text-red-600' : 'text-green-600'
                                }`}>
                                {order.status}
                            </Text>
                        </View>
                    </View>
                    <View className="pt-4 border-t border-neutral-50">
                        <Text className="text-xs font-inter-medium text-neutral-500 mb-1">Placed On</Text>
                        <Text className="text-sm font-inter text-neutral-900">
                            {new Date(order.created_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </Text>
                    </View>
                </View>

                {/* Customer Info */}
                <View className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm mb-6">
                    <View className="flex-row items-center gap-2 mb-4">
                        <Ionicons name="person-circle-outline" size={24} color={Colors.primary.DEFAULT} />
                        <Text className="text-lg font-inter-bold text-neutral-900">Customer Info</Text>
                    </View>
                    <View className="gap-3">
                        <View>
                            <Text className="text-xs font-inter-medium text-neutral-500">Name</Text>
                            <Text className="text-sm font-inter-semibold text-neutral-900">{order.profiles?.full_name}</Text>
                        </View>
                    </View>
                </View>

                {/* Order Items */}
                <View className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm mb-6">
                    <Text className="text-lg font-inter-bold text-neutral-900 mb-4">Order Items</Text>
                    <View className="gap-4">
                        {order.order_items?.map((item: any) => (
                            <View key={item.id} className="flex-row gap-4">
                                <View className="w-16 h-16 rounded-xl bg-neutral-50 overflow-hidden">
                                    <Image
                                        source={{ uri: item.products?.images?.[0] }}
                                        style={{ width: '100%', height: '100%' }}
                                        contentFit="cover"
                                    />
                                </View>
                                <View className="flex-1 justify-center">
                                    <Text className="text-sm font-inter-bold text-neutral-900" numberOfLines={1}>
                                        {item.products?.name}
                                    </Text>
                                    <Text className="text-xs font-inter text-neutral-500 mt-1">
                                        {item.quantity} x {formatPrice(item.price_at_purchase)}
                                    </Text>
                                </View>
                                <View className="justify-center">
                                    <Text className="text-sm font-inter-bold text-primary">
                                        {formatPrice(item.quantity * item.price_at_purchase)}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                    <View className="mt-6 pt-6 border-t border-neutral-50 flex-row justify-between items-center">
                        <Text className="text-sm font-inter-medium text-neutral-500">Total Amount</Text>
                        <Text className="text-xl font-inter-bold text-primary">{formatPrice(order.total_amount)}</Text>
                    </View>
                </View>

                {/* Shipping Details Placeholder (Assuming we have it in order object or joined) */}
                {/* For now we just show a placeholder since we might need the addresses table join */}
                <View className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm mb-6">
                    <View className="flex-row items-center gap-2 mb-4">
                        <Ionicons name="location-outline" size={24} color={Colors.primary.DEFAULT} />
                        <Text className="text-lg font-inter-bold text-neutral-900">Shipping Address</Text>
                    </View>
                    <Text className="text-sm font-inter text-neutral-600 leading-5">
                        {/* We'd normally join with an address table here */}
                        Order processed for immediate delivery.
                    </Text>
                </View>
            </ScrollView>

            {/* Action Bar */}
            <View className="absolute bottom-0 left-0 right-0 bg-white p-6 border-t border-neutral-100 flex-row gap-3" style={{ paddingBottom: Math.max(insets.bottom, 24) }}>
                {order.status === 'PENDING' && (
                    <TouchableOpacity
                        onPress={() => updateStatus('PAID')}
                        disabled={isActionLoading}
                        className="flex-1 bg-orange-500 py-4 rounded-xl items-center flex-row justify-center gap-2"
                    >
                        {isActionLoading ? <ActivityIndicator color="white" /> : (
                            <>
                                <Ionicons name="card-outline" size={20} color="white" />
                                <Text className="text-white font-inter-bold">Mark Paid</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}

                {order.status === 'PAID' && (
                    <TouchableOpacity
                        onPress={() => updateStatus('SHIPPED')}
                        disabled={isActionLoading}
                        className="flex-1 bg-blue-500 py-4 rounded-xl items-center flex-row justify-center gap-2"
                    >
                        {isActionLoading ? <ActivityIndicator color="white" /> : (
                            <>
                                <Ionicons name="paper-plane-outline" size={20} color="white" />
                                <Text className="text-white font-inter-bold">Set Shipped</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}

                {order.status === 'SHIPPED' && (
                    <View className="flex-1 bg-purple-50 py-4 rounded-xl items-center flex-row justify-center gap-2 border border-purple-200">
                        <Ionicons name="time-outline" size={20} color="#8B5CF6" />
                        <Text className="text-purple-600 font-inter-bold text-sm">Waiting for Customer</Text>
                    </View>
                )}

                {order.status === 'COMPLETED' && (
                    <View className="flex-1 bg-green-50 py-4 rounded-xl items-center flex-row justify-center gap-2 border border-green-200">
                        <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                        <Text className="text-green-600 font-inter-bold text-sm">Completed</Text>
                    </View>
                )}

                {(order.status === 'PENDING' || order.status === 'PAID') && (
                    <TouchableOpacity
                        onPress={() => updateStatus('CANCELLED')}
                        disabled={isActionLoading}
                        className="bg-red-50 px-6 py-4 rounded-xl items-center flex-row justify-center"
                    >
                        <Text className="text-red-600 font-inter-bold text-sm">Cancel</Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}
