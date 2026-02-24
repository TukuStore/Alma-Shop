import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Profile {
    id: string;
    full_name: string;
    avatar_url: string | null;
    role: string;
    phone_number: string | null;
    address: string | null;
    created_at: string;
}

interface OrderSummary {
    id: string;
    total_amount: number;
    status: string;
    created_at: string;
}

export default function AdminCustomerDetailScreen() {
    const { id } = useLocalSearchParams();
    const [customer, setCustomer] = useState<Profile | null>(null);
    const [orders, setOrders] = useState<OrderSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Fetch Profile
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', id)
                .single();

            if (profileError) throw profileError;
            setCustomer(profile);

            // Fetch recent orders
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select('id, total_amount, status, created_at')
                .eq('user_id', id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (ordersError) throw ordersError;
            setOrders(ordersData || []);

        } catch (error: any) {
            console.error('Error fetching customer details:', error);
            Alert.alert('Error', error.message || 'Failed to load customer details');
            router.back();
        } finally {
            setIsLoading(false);
        }
    };

    const handleCall = () => {
        if (customer?.phone_number) {
            Linking.openURL(`tel:${customer.phone_number}`);
        } else {
            Alert.alert('Not Available', 'Phone number not provided by customer.');
        }
    };

    const handleWhatsApp = () => {
        if (customer?.phone_number) {
            // Clean phone number: remove non-numeric
            const cleanPhone = customer.phone_number.replace(/[^0-9]/g, '');
            // Simple check: if starts with 0, replace with 62
            const waPhone = cleanPhone.startsWith('0') ? `62${cleanPhone.substring(1)}` : cleanPhone;
            Linking.openURL(`https://wa.me/${waPhone}`);
        } else {
            Alert.alert('Not Available', 'Phone number not provided by customer.');
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-slate-50 justify-center items-center" edges={['top']}>
                <ActivityIndicator size="large" color="#10b981" />
            </SafeAreaView>
        );
    }

    if (!customer) return null;

    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center justify-between border-b border-slate-200 bg-white shadow-sm z-10" style={{ elevation: 2 }}>
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center border border-slate-200">
                    <Ionicons name="arrow-back" size={20} color="#334155" />
                </TouchableOpacity>
                <Text className="text-xl font-inter-black text-slate-800">Customer Details</Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Profile Section */}
                <View className="bg-white p-8 items-center border-b border-slate-200">
                    <View className="w-24 h-24 bg-slate-100 rounded-full items-center justify-center overflow-hidden border-4 border-white shadow-md">
                        {customer.avatar_url ? (
                            <Image source={{ uri: customer.avatar_url }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                        ) : (
                            <Ionicons name="person" size={48} color="#CBD5E1" />
                        )}
                    </View>
                    <Text className="text-2xl font-inter-black text-slate-800 mt-4">{customer.full_name || 'Guest User'}</Text>
                    <View className={`mt-2 px-3 py-1 rounded-full border ${customer.role === 'admin' ? 'bg-indigo-50 border-indigo-200' : 'bg-emerald-50 border-emerald-200'}`}>
                        <Text className={`text-xs font-inter-bold uppercase tracking-widest ${customer.role === 'admin' ? 'text-indigo-600' : 'text-emerald-600'}`}>
                            {customer.role}
                        </Text>
                    </View>
                </View>

                {/* Info Cards */}
                <View className="p-6 gap-4">
                    <Text className="text-sm font-inter-bold text-slate-500 uppercase tracking-widest mb-1">Contact Information</Text>

                    <View className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                        <View className="flex-row items-center mb-4">
                            <View className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center border border-slate-100">
                                <Ionicons name="call-outline" size={18} color="#64748B" />
                            </View>
                            <View className="ml-4 flex-1">
                                <Text className="text-xs font-inter-medium text-slate-400">Phone Number</Text>
                                <Text className="text-base font-inter-bold text-slate-700">{customer.phone_number || 'Not Set'}</Text>
                            </View>
                            {customer.phone_number && (
                                <View className="flex-row gap-2">
                                    <TouchableOpacity onPress={handleWhatsApp} className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center border border-emerald-100">
                                        <Ionicons name="logo-whatsapp" size={18} color="#10b981" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={handleCall} className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center border border-blue-100">
                                        <Ionicons name="call" size={18} color="#3B82F6" />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        <View className="flex-row items-center mt-2">
                            <View className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center border border-slate-100">
                                <Ionicons name="location-outline" size={18} color="#64748B" />
                            </View>
                            <View className="ml-4 flex-1">
                                <Text className="text-xs font-inter-medium text-slate-400">Default Address</Text>
                                <Text className="text-sm font-inter-medium text-slate-700 leading-5 mt-0.5">
                                    {customer.address || 'No address saved yet.'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <Text className="text-sm font-inter-bold text-slate-500 uppercase tracking-widest mt-4 mb-1">Recent Activity</Text>

                    <View className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <View className="p-5 border-b border-slate-100 flex-row justify-between items-center bg-slate-50/50">
                            <Text className="font-inter-bold text-slate-700">Order History</Text>
                            <TouchableOpacity onPress={() => router.push('/(admin)/orders')}>
                                <Text className="text-xs font-inter-bold text-indigo-600">View All</Text>
                            </TouchableOpacity>
                        </View>

                        {orders.length === 0 ? (
                            <View className="p-8 items-center">
                                <Ionicons name="basket-outline" size={32} color="#CBD5E1" />
                                <Text className="font-inter-medium text-slate-400 mt-2">No orders found.</Text>
                            </View>
                        ) : (
                            orders.map((order) => (
                                <TouchableOpacity
                                    key={order.id}
                                    className="p-4 border-b border-slate-50 flex-row items-center justify-between"
                                    onPress={() => router.push({ pathname: '/(admin)/orders/[id]', params: { id: order.id } })}
                                >
                                    <View>
                                        <Text className="text-sm font-inter-bold text-slate-800">Order #{order.id.split('-')[0].toUpperCase()}</Text>
                                        <Text className="text-[10px] font-inter-medium text-slate-400 mt-0.5">{new Date(order.created_at).toLocaleDateString()}</Text>
                                    </View>
                                    <View className="items-end">
                                        <Text className="text-sm font-inter-bold text-slate-800">Rp {order.total_amount.toLocaleString()}</Text>
                                        <View className={`px-2 py-0.5 rounded-md mt-1 ${order.status === 'COMPLETED' ? 'bg-emerald-50' :
                                            order.status === 'SHIPPED' ? 'bg-blue-50' :
                                                order.status === 'CANCELLED' ? 'bg-red-50' :
                                                    'bg-orange-50'
                                            }`}>
                                            <Text className={`text-[9px] font-inter-bold uppercase tracking-tighter ${order.status === 'COMPLETED' ? 'text-emerald-600' :
                                                order.status === 'SHIPPED' ? 'text-blue-600' :
                                                    order.status === 'CANCELLED' ? 'text-red-600' :
                                                        'text-orange-600'
                                                }`}>{order.status}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>

                    <View className="bg-slate-100 p-4 rounded-2xl mt-4">
                        <Text className="text-[10px] font-inter-medium text-slate-400 text-center uppercase tracking-widest">
                            Customer since {new Date(customer.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
