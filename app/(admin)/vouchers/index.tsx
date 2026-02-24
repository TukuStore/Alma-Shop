import { supabase } from '@/lib/supabase';
import type { Voucher } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const formatPrice = (price: number) => `Rp ${price.toLocaleString('id-ID')}`;

export default function AdminVouchersScreen() {
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('vouchers')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setVouchers(data || []);
        } catch (error) {
            console.error('Load vouchers error:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const toggleActive = async (id: string, current: boolean) => {
        try {
            const { error } = await supabase
                .from('vouchers')
                .update({ is_active: !current })
                .eq('id', id);
            if (error) throw error;
            setVouchers(prev => prev.map(v => v.id === id ? { ...v, is_active: !current } : v));
        } catch (error) {
            console.error('Toggle error:', error);
            Alert.alert('Error', 'Failed to update voucher status');
        }
    };

    const deleteVoucher = (id: string, name: string) => {
        Alert.alert('Delete Voucher', `Delete "${name}"? This cannot be undone.`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    try {
                        const { error } = await supabase.from('vouchers').delete().eq('id', id);
                        if (error) throw error;
                        setVouchers(prev => prev.filter(v => v.id !== id));
                        Alert.alert('Success', 'Voucher deleted');
                    } catch (error) {
                        console.error('Delete error:', error);
                        Alert.alert('Error', 'Failed to delete voucher');
                    }
                }
            },
        ]);
    };

    const getStatusBadge = (voucher: Voucher) => {
        const now = new Date();
        if (!voucher.is_active) return { label: 'Inactive', bg: '#FEE2E2', color: '#DC2626' };
        if (voucher.end_date && new Date(voucher.end_date) < now) return { label: 'Expired', bg: '#FEF3C7', color: '#D97706' };
        if (voucher.start_date && new Date(voucher.start_date) > now) return { label: 'Upcoming', bg: '#DBEAFE', color: '#2563EB' };
        return { label: 'Active', bg: '#D1FAE5', color: '#059669' };
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center justify-between border-b border-slate-200 bg-white" style={{ elevation: 2 }}>
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center border border-slate-200">
                    <Ionicons name="arrow-back" size={20} color="#334155" />
                </TouchableOpacity>
                <Text className="text-xl font-inter-black text-slate-800">Vouchers</Text>
                <TouchableOpacity
                    onPress={() => router.push('/(admin)/vouchers/add')}
                    className="w-10 h-10 bg-violet-500 rounded-full items-center justify-center"
                    style={{ elevation: 2 }}
                >
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {isLoading && vouchers.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#8B5CF6" />
                    <Text className="text-slate-500 font-inter mt-4">Loading vouchers...</Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={isLoading && vouchers.length > 0} onRefresh={loadData} colors={['#8B5CF6']} />
                    }
                >
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-sm font-inter-bold text-slate-500 uppercase tracking-widest">
                            All Vouchers ({vouchers.length})
                        </Text>
                    </View>

                    {vouchers.length === 0 ? (
                        <View className="items-center justify-center py-10">
                            <Ionicons name="pricetag-outline" size={64} color="#CBD5E1" />
                            <Text className="font-inter-medium text-slate-500 mt-4 text-center">No vouchers found.{'\n'}Create your first voucher!</Text>
                        </View>
                    ) : (
                        vouchers.map((voucher) => {
                            const badge = getStatusBadge(voucher);
                            return (
                                <TouchableOpacity
                                    key={voucher.id}
                                    onPress={() => router.push(`/(admin)/vouchers/${voucher.id}`)}
                                    className="bg-white rounded-2xl p-4 mb-3 border border-slate-100"
                                    style={{ elevation: 1 }}
                                    activeOpacity={0.7}
                                >
                                    <View className="flex-row items-start justify-between mb-3">
                                        <View className="flex-1 mr-3">
                                            <View className="flex-row items-center gap-2 mb-1">
                                                <View className="w-8 h-8 bg-violet-50 rounded-lg items-center justify-center">
                                                    <Ionicons name="pricetag" size={16} color="#8B5CF6" />
                                                </View>
                                                <Text className="text-base font-inter-bold text-slate-800 flex-1" numberOfLines={1}>{voucher.name}</Text>
                                            </View>
                                            <Text className="text-xs font-inter text-slate-400 ml-10" numberOfLines={1}>
                                                {voucher.description || 'No description'}
                                            </Text>
                                        </View>
                                        <View className="px-2 py-1 rounded-full" style={{ backgroundColor: badge.bg }}>
                                            <Text className="text-[10px] font-inter-bold uppercase" style={{ color: badge.color }}>{badge.label}</Text>
                                        </View>
                                    </View>

                                    {/* Info Row */}
                                    <View className="flex-row items-center gap-3 mb-3 ml-10">
                                        <View className="bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-100">
                                            <Text className="text-[10px] font-inter text-slate-400 uppercase">Code</Text>
                                            <Text className="text-xs font-inter-bold text-violet-600">{voucher.code}</Text>
                                        </View>
                                        <View className="bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-100">
                                            <Text className="text-[10px] font-inter text-slate-400 uppercase">Discount</Text>
                                            <Text className="text-xs font-inter-bold text-emerald-600">
                                                {voucher.discount_type === 'percentage' ? `${voucher.discount_value}%` : formatPrice(voucher.discount_value)}
                                            </Text>
                                        </View>
                                        <View className="bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-100">
                                            <Text className="text-[10px] font-inter text-slate-400 uppercase">Min. Purchase</Text>
                                            <Text className="text-xs font-inter-bold text-slate-700">{formatPrice(voucher.min_purchase)}</Text>
                                        </View>
                                    </View>

                                    {/* Actions */}
                                    <View className="flex-row items-center gap-2 ml-10">
                                        <TouchableOpacity
                                            onPress={() => toggleActive(voucher.id, voucher.is_active)}
                                            className={`flex-row items-center gap-1 px-3 py-1.5 rounded-full border ${voucher.is_active ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}
                                        >
                                            <Ionicons name={voucher.is_active ? 'checkmark-circle' : 'close-circle'} size={14} color={voucher.is_active ? '#059669' : '#DC2626'} />
                                            <Text className={`text-[10px] font-inter-bold ${voucher.is_active ? 'text-emerald-700' : 'text-red-700'}`}>
                                                {voucher.is_active ? 'Active' : 'Inactive'}
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => deleteVoucher(voucher.id, voucher.name)}
                                            className="flex-row items-center gap-1 px-3 py-1.5 rounded-full border border-red-200 bg-red-50"
                                        >
                                            <Ionicons name="trash-outline" size={14} color="#DC2626" />
                                            <Text className="text-[10px] font-inter-bold text-red-700">Delete</Text>
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
