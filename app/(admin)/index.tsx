import { Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminDashboardScreen() {
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        totalProducts: 0,
        totalCustomers: 0,
    });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadAdminData = async () => {
        setIsLoading(true);
        try {
            // Check if admin
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.replace('/');
                return;
            }
            const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
            if (profile?.role !== 'admin') {
                router.replace('/');
                return;
            }

            // Load Orders
            const { data: orders, error } = await supabase
                .from('orders')
                .select('id, total_amount, status, created_at, profiles(full_name)')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (orders) {
                setRecentOrders(orders.slice(0, 5));

                const pending = orders.filter((o) => o.status === 'PENDING' || o.status === 'PAID').length;
                const revenue = orders.filter((o) => o.status !== 'CANCELLED').reduce((sum, o) => sum + o.total_amount, 0);

                setStats({
                    totalOrders: orders.length,
                    pendingOrders: pending,
                    totalRevenue: revenue,
                    totalProducts: 0,
                    totalCustomers: 0,
                });
            }

            // Load product count
            const { count: productCount } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true });

            // Load customer count
            const { count: customerCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            setStats(prev => ({
                ...prev,
                totalProducts: productCount || 0,
                totalCustomers: customerCount || 0,
            }));

        } catch (error) {
            console.error('Admin Load Error', error);
            Alert.alert('Error', 'Failed to load admin dashboard');
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadAdminData();
        }, [])
    );

    const formatPrice = (price: number) => `Rp ${price.toLocaleString('id-ID')}`;

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-neutral-50 items-center justify-center">
                <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-neutral-50" edges={['top']}>
            <View className="px-6 py-4 flex-row items-center justify-between border-b border-neutral-100 bg-white">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 border border-neutral-200 rounded-full items-center justify-center">
                    <Ionicons name="arrow-back" size={20} color={Colors.text.DEFAULT} />
                </TouchableOpacity>
                <Text className="text-xl font-inter-bold text-neutral-900">
                    Admin Dashboard
                </Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Stats Row */}
                <View className="flex-row gap-4 mb-6">
                    <View className="flex-1 bg-white p-4 rounded-2xl border border-neutral-100" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}>
                        <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center mb-3">
                            <Ionicons name="receipt-outline" size={20} color="#3B82F6" />
                        </View>
                        <Text className="text-2xl font-inter-bold text-neutral-900 mb-1">{stats.totalOrders}</Text>
                        <Text className="text-xs font-inter-medium text-neutral-500">Total Orders</Text>
                    </View>
                    <View className="flex-1 bg-white p-4 rounded-2xl border border-neutral-100" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}>
                        <View className="w-10 h-10 bg-orange-50 rounded-full items-center justify-center mb-3">
                            <Ionicons name="time-outline" size={20} color="#F97316" />
                        </View>
                        <Text className="text-2xl font-inter-bold text-neutral-900 mb-1">{stats.pendingOrders}</Text>
                        <Text className="text-xs font-inter-medium text-neutral-500">Pending</Text>
                    </View>
                </View>

                {/* Extra Stats Row */}
                <View className="flex-row gap-4 mb-6">
                    <View className="flex-1 bg-white p-4 rounded-2xl border border-neutral-100" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}>
                        <View className="w-10 h-10 bg-indigo-50 rounded-full items-center justify-center mb-3">
                            <Ionicons name="cube-outline" size={20} color="#6366f1" />
                        </View>
                        <Text className="text-2xl font-inter-bold text-neutral-900 mb-1">{stats.totalProducts}</Text>
                        <Text className="text-xs font-inter-medium text-neutral-500">Products</Text>
                    </View>
                    <View className="flex-1 bg-white p-4 rounded-2xl border border-neutral-100" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}>
                        <View className="w-10 h-10 bg-emerald-50 rounded-full items-center justify-center mb-3">
                            <Ionicons name="people-outline" size={20} color="#10b981" />
                        </View>
                        <Text className="text-2xl font-inter-bold text-neutral-900 mb-1">{stats.totalCustomers}</Text>
                        <Text className="text-xs font-inter-medium text-neutral-500">Customers</Text>
                    </View>
                </View>

                {/* Revenue Card */}
                <View className="bg-primary p-6 rounded-2xl mb-8" style={{ shadowColor: '#FF6B57', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }}>
                    <Text className="font-inter-medium mb-1" style={{ color: 'rgba(255,255,255,0.8)' }}>Total Revenue</Text>
                    <Text className="text-3xl font-inter-bold text-white">{formatPrice(stats.totalRevenue)}</Text>
                </View>

                {/* Management Section */}
                <Text className="text-lg font-inter-bold text-neutral-900 mb-4">Manage System</Text>

                <View className="flex-row flex-wrap gap-4 mb-4">
                    <TouchableOpacity
                        onPress={() => router.push('/(admin)/products')}
                        className="flex-[1_0_30%] bg-white border border-slate-100 p-4 rounded-2xl items-center justify-center"
                        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}
                    >
                        <View className="w-10 h-10 bg-indigo-50 rounded-full items-center justify-center mb-2">
                            <Ionicons name="grid-outline" size={20} color="#6366f1" />
                        </View>
                        <Text className="text-xs font-inter-bold text-slate-700">Products</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/(admin)/orders')}
                        className="flex-[1_0_30%] bg-white border border-slate-100 p-4 rounded-2xl items-center justify-center"
                        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}
                    >
                        <View className="w-10 h-10 bg-orange-50 rounded-full items-center justify-center mb-2">
                            <Ionicons name="cart-outline" size={20} color="#f97316" />
                        </View>
                        <Text className="text-xs font-inter-bold text-slate-700">Orders</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/(admin)/categories')}
                        className="flex-[1_0_30%] bg-white border border-slate-100 p-4 rounded-2xl items-center justify-center"
                        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}
                    >
                        <View className="w-10 h-10 bg-purple-50 rounded-full items-center justify-center mb-2">
                            <Ionicons name="list-outline" size={20} color="#a855f7" />
                        </View>
                        <Text className="text-xs font-inter-bold text-slate-700">Categories</Text>
                    </TouchableOpacity>
                </View>

                <View className="flex-row flex-wrap gap-4 mb-8">
                    <TouchableOpacity
                        onPress={() => router.push('/(admin)/banners')}
                        className="flex-[1_0_30%] bg-white border border-slate-100 p-4 rounded-2xl items-center justify-center"
                        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}
                    >
                        <View className="w-10 h-10 bg-pink-50 rounded-full items-center justify-center mb-2">
                            <Ionicons name="images-outline" size={20} color="#ec4899" />
                        </View>
                        <Text className="text-xs font-inter-bold text-slate-700">Banners</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/(admin)/customers')}
                        className="flex-[1_0_30%] bg-white border border-slate-100 p-4 rounded-2xl items-center justify-center shadow-sm"
                    >
                        <View className="w-10 h-10 bg-emerald-50 rounded-full items-center justify-center mb-2">
                            <Ionicons name="people-outline" size={20} color="#10b981" />
                        </View>
                        <Text className="text-xs font-inter-bold text-slate-700">Customers</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/(admin)/analytics')}
                        className="flex-[1_0_30%] bg-white border border-slate-100 p-4 rounded-2xl items-center justify-center shadow-sm"
                    >
                        <View className="w-10 h-10 bg-amber-50 rounded-full items-center justify-center mb-2">
                            <Ionicons name="bar-chart-outline" size={20} color="#f59e0b" />
                        </View>
                        <Text className="text-xs font-inter-bold text-slate-700">Analytics</Text>
                    </TouchableOpacity>
                </View>

                <View className="flex-row flex-wrap gap-4 mb-8">
                    <TouchableOpacity
                        onPress={() => router.push('/(admin)/vouchers' as any)}
                        className="flex-[1_0_30%] bg-white border border-slate-100 p-4 rounded-2xl items-center justify-center shadow-sm"
                    >
                        <View className="w-10 h-10 bg-violet-50 rounded-full items-center justify-center mb-2">
                            <Ionicons name="pricetag-outline" size={20} color="#8b5cf6" />
                        </View>
                        <Text className="text-xs font-inter-bold text-slate-700">Vouchers</Text>
                    </TouchableOpacity>

                    <View className="flex-[1_0_30%]" />
                    <View className="flex-[1_0_30%]" />
                </View>

                {/* Recent Orders */}
                <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-lg font-inter-bold text-neutral-900">Recent Orders</Text>
                    <TouchableOpacity onPress={() => router.push('/(admin)/orders')}>
                        <Text className="text-sm font-inter-medium text-primary">See All</Text>
                    </TouchableOpacity>
                </View>

                {recentOrders.length === 0 ? (
                    <Text className="text-neutral-500 font-inter text-center py-4">No recent orders found.</Text>
                ) : (
                    recentOrders.map((order) => (
                        <TouchableOpacity
                            key={order.id}
                            onPress={() => router.push(`/(admin)/orders/${order.id}`)}
                            className="bg-white p-4 rounded-xl border border-neutral-100 mb-3 flex-row items-center justify-between"
                            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}
                        >
                            <View>
                                <Text className="text-sm font-inter-bold text-neutral-900 mb-1">
                                    #{order.id.slice(0, 8).toUpperCase()}
                                </Text>
                                <Text className="text-xs font-inter-medium text-neutral-500">
                                    {order.profiles?.full_name || 'Customer'}
                                </Text>
                            </View>
                            <View className="items-end">
                                <Text className="text-sm font-inter-bold text-primary mb-1">
                                    {formatPrice(order.total_amount)}
                                </Text>
                                <View className={`px-2 py-1 rounded border ${order.status === 'PENDING' || order.status === 'PAID' ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
                                    <Text className={`text-[10px] uppercase font-inter-bold ${order.status === 'PENDING' || order.status === 'PAID' ? 'text-orange-600' : 'text-green-600'}`}>
                                        {order.status}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
