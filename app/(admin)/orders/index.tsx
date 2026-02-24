import { supabase } from '@/lib/supabase';
import { notificationService } from '@/services/notificationService';
import { pushNotificationService } from '@/services/pushNotificationService';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminOrdersScreen() {
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [tab, setTab] = useState<'all' | 'PENDING' | 'SHIPPED'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const loadOrders = async () => {
        setIsLoading(true);
        try {
            let query = supabase
                .from('orders')
                .select('id, total_amount, status, created_at, profiles(full_name)')
                .order('created_at', { ascending: false });

            if (tab === 'PENDING') {
                query = query.in('status', ['PENDING', 'PAID']);
            } else if (tab === 'SHIPPED') {
                query = query.eq('status', 'SHIPPED');
            }

            const { data, error } = await query;
            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Fetch orders error:', error);
            Alert.alert('Error', 'Failed to load orders');
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadOrders();
        }, [tab])
    );

    const filteredOrders = orders.filter(order =>
        (order.profiles?.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatPrice = (price: number) => `Rp ${price.toLocaleString('id-ID')}`;

    const updateOrderStatus = async (id: string, newStatus: string) => {
        setIsLoading(true);
        try {
            // First get user_id for push notification
            const { data: orderData } = await supabase
                .from('orders')
                .select('user_id')
                .eq('id', id)
                .single();

            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            // Send push notification to customer
            if (orderData?.user_id) {
                const statusMessages: Record<string, { title: string; body: string }> = {
                    paid: { title: '💰 Payment Confirmed', body: `Your order #${id.slice(0, 8).toUpperCase()} payment has been confirmed!` },
                    shipped: { title: '🚚 Order Shipped!', body: `Your order #${id.slice(0, 8).toUpperCase()} is on its way!` },
                    completed: { title: '📦 Pesanan Selesai', body: `Your order #${id.slice(0, 8).toUpperCase()} has been completed!` },
                };
                const msg = statusMessages[newStatus];
                if (msg) {
                    pushNotificationService.sendPushToUser(
                        orderData.user_id,
                        msg.title,
                        msg.body,
                        { orderId: id, status: newStatus, screen: 'order_detail' }
                    );
                }
                // Also create in-app notification
                notificationService.sendOrderStatusNotification(orderData.user_id, id, newStatus);
            }

            Alert.alert('Success', `Order status updated to ${newStatus}`);
            // Optimistic update
            setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
        } catch (error) {
            console.error('Update status error:', error);
            Alert.alert('Error', 'Failed to update order status');
        } finally {
            setIsLoading(false);
        }
    };

    const renderHeader = () => (
        <View className="mb-6">
            <View className="flex-row items-center bg-slate-100 rounded-2xl px-4 py-3 border border-slate-200 mb-6 shadow-sm">
                <Ionicons name="search" size={20} color="#94A3B8" />
                <TextInput
                    className="flex-1 ml-3 font-inter-medium text-slate-700"
                    placeholder="Search by ID or customer..."
                    placeholderTextColor="#94A3B8"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={18} color="#94A3B8" />
                    </TouchableOpacity>
                )}
            </View>

            <Text className="text-[10px] font-inter-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                Filter by Status
            </Text>
            <View className="flex-row items-center bg-slate-200/50 rounded-2xl p-1.5 border border-slate-200">
                <TouchableOpacity
                    onPress={() => setTab('all')}
                    className={`flex-1 py-3 rounded-xl items-center ${tab === 'all' ? 'bg-white shadow-sm border border-slate-100' : 'bg-transparent'}`}
                >
                    <Text className={`text-[11px] font-inter-black ${tab === 'all' ? 'text-slate-800' : 'text-slate-500'}`}>ALL</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setTab('PENDING')}
                    className={`flex-1 py-3 rounded-xl items-center mx-1 ${tab === 'PENDING' ? 'bg-orange-500 shadow-md' : 'bg-transparent'}`}
                >
                    <Text className={`text-[11px] font-inter-black ${tab === 'PENDING' ? 'text-white' : 'text-slate-500'}`}>PENDING</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setTab('SHIPPED')}
                    className={`flex-1 py-3 rounded-xl items-center ${tab === 'SHIPPED' ? 'bg-blue-600 shadow-md' : 'bg-transparent'}`}
                >
                    <Text className={`text-[11px] font-inter-black ${tab === 'SHIPPED' ? 'text-white' : 'text-slate-500'}`}>SHIPPED</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center justify-between border-b border-slate-200 bg-white shadow-sm z-10" style={{ elevation: 2 }}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center border border-slate-200"
                >
                    <Ionicons name="arrow-back" size={20} color="#334155" />
                </TouchableOpacity>
                <Text className="text-xl font-inter-black text-slate-800">Orders</Text>
                <TouchableOpacity
                    className="w-10 h-10 bg-orange-50 rounded-full items-center justify-center border border-orange-100"
                    onPress={() => loadOrders()}
                >
                    <Ionicons name="refresh" size={20} color="#F97316" />
                </TouchableOpacity>
            </View>

            {isLoading && orders.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#F97316" />
                    <Text className="mt-4 font-inter-medium text-slate-500">Loading orders...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredOrders}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                    refreshControl={
                        <RefreshControl refreshing={isLoading && orders.length > 0} onRefresh={loadOrders} colors={['#F97316']} />
                    }
                    ListHeaderComponent={renderHeader}
                    ListEmptyComponent={
                        <View className="items-center justify-center py-10">
                            <Ionicons name="receipt-outline" size={64} color="#CBD5E1" />
                            <Text className="font-inter-medium text-slate-500 mt-4 text-center">No orders found.</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => router.push({ pathname: '/(admin)/orders/[id]', params: { id: item.id } })}
                            activeOpacity={0.7}
                            className="bg-white rounded-[32px] p-6 mb-5 border border-slate-200 shadow-sm"
                            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05 }}
                        >
                            <View className="flex-row justify-between mb-5">
                                <View className="flex-1 pr-4">
                                    <View className="flex-row items-center gap-2.5 mb-2">
                                        <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center border border-slate-200">
                                            <Ionicons name="person" size={14} color="#64748B" />
                                        </View>
                                        <Text className="text-base font-inter-bold text-slate-800" numberOfLines={1}>
                                            {item.profiles?.full_name || 'Guest Customer'}
                                        </Text>
                                    </View>
                                    <Text className="text-xs font-inter-medium text-slate-400 ml-0.5">
                                        #{item.id.slice(0, 8).toUpperCase()} • {new Date(item.created_at).toLocaleDateString()}
                                    </Text>
                                </View>
                                <View className="items-end">
                                    <View className={`px-3 py-1.5 rounded-xl border-2 ${item.status === 'PENDING' || item.status === 'PAID' ? 'bg-orange-50 border-orange-100' :
                                        item.status === 'SHIPPED' ? 'bg-blue-50 border-blue-100' :
                                            item.status === 'COMPLETED' ? 'bg-emerald-50 border-emerald-100' :
                                                'bg-slate-50 border-slate-100'
                                        }`}>
                                        <Text className={`text-[10px] uppercase font-inter-black tracking-widest ${item.status === 'PENDING' || item.status === 'PAID' ? 'text-orange-600' :
                                            item.status === 'SHIPPED' ? 'text-blue-600' :
                                                item.status === 'COMPLETED' ? 'text-emerald-600' :
                                                    'text-slate-500'
                                            }`}>
                                            {item.status}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <View className="flex-row items-center justify-between mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <View>
                                    <Text className="text-[10px] font-inter-black text-slate-400 uppercase tracking-widest mb-1">Items Subtotal</Text>
                                    <Text className="text-xl font-inter-black text-slate-900">
                                        {formatPrice(item.total_amount)}
                                    </Text>
                                </View>
                                <View className="w-10 h-10 rounded-full bg-slate-200/50 items-center justify-center">
                                    <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                                </View>
                            </View>

                            <View className="flex-row gap-3">
                                {item.status === 'PENDING' ? (
                                    <TouchableOpacity
                                        onPress={() => updateOrderStatus(item.id, 'PAID')}
                                        className="flex-1 py-4 rounded-2xl flex-row items-center justify-center gap-2 bg-orange-500 shadow-md border border-orange-400"
                                    >
                                        <Ionicons name="wallet" size={18} color="white" />
                                        <Text className="text-sm font-inter-bold text-white">Mark Paid</Text>
                                    </TouchableOpacity>
                                ) : item.status === 'PAID' ? (
                                    <TouchableOpacity
                                        onPress={() => updateOrderStatus(item.id, 'SHIPPED')}
                                        className="flex-1 py-4 rounded-2xl flex-row items-center justify-center gap-2 bg-blue-600 shadow-md border border-blue-500"
                                    >
                                        <Ionicons name="paper-plane" size={18} color="white" />
                                        <Text className="text-sm font-inter-bold text-white">Ship Order</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View className="flex-1 py-4 rounded-2xl flex-row items-center justify-center gap-2 bg-slate-100 border border-slate-200">
                                        <Ionicons name="checkmark-circle" size={18} color="#94A3B8" />
                                        <Text className="text-sm font-inter-bold text-slate-400 capitalize">{item.status}</Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
        </SafeAreaView>
    );
}
