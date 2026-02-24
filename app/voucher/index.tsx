
import EmptyVoucherIllustration from '@/components/voucher/EmptyVoucherIllustration';
import { Colors } from '@/constants/theme';
import { voucherService } from '@/services/voucherService';
import type { Voucher } from '@/types';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VoucherScreen() {
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'available' | 'used'>('available');
    const [claimCode, setClaimCode] = useState('');
    const [claiming, setClaiming] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            loadVouchers();
        }, [])
    );

    const loadVouchers = async () => {
        try {
            setLoading(true);
            const data = await voucherService.fetchUserVouchers();
            setVouchers(data);
        } catch (error) {
            console.error('Error loading vouchers:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleClaim = async () => {
        if (!claimCode.trim()) return;
        try {
            setClaiming(true);
            await voucherService.claimVoucher(claimCode.toUpperCase());
            setClaimCode('');
            loadVouchers();
            alert('Voucher claimed successfully!');
        } catch (error: any) {
            alert(error.message || 'Failed to claim voucher');
        } finally {
            setClaiming(false);
        }
    };

    const filteredVouchers = vouchers.filter(v => {
        if (activeTab === 'available') return !v.is_used && (!v.end_date || new Date(v.end_date) > new Date());
        if (activeTab === 'used') return v.is_used || (v.end_date && new Date(v.end_date) <= new Date());
        return true;
    });

    const renderItem = ({ item }: { item: Voucher }) => (
        <View className="mx-6 mb-4 bg-neutral-50 rounded-2xl overflow-hidden border border-neutral-100">
            {/* Top Section */}
            <View className="p-4 flex-row items-center gap-4">
                {/* Icon Box */}
                <View className="w-10 h-10 bg-error/10 rounded-lg items-center justify-center">
                    <MaterialCommunityIcons name="ticket-percent-outline" size={24} color={Colors.primary.DEFAULT} />
                </View>

                {/* Text Info */}
                <View className="flex-1">
                    <Text className="text-neutral-900 text-base font-inter-medium leading-6">{item.name}</Text>
                    <Text className="text-neutral-400 text-sm font-inter leading-5">{item.description || 'Special offer for you'}</Text>
                </View>

                {/* Apply Button */}
                <TouchableOpacity className="px-3 py-1.5 rounded-full border border-primary items-center justify-center">
                    <Text className="text-primary text-xs font-inter-medium">Apply</Text>
                </TouchableOpacity>
            </View>

            {/* Divider with Cutouts */}
            <View className="relative h-4 flex-row items-center justify-center overflow-hidden">
                {/* Dashed Line */}
                <View className="w-[85%] h-[1px] border-t border-dashed border-neutral-200" />

                {/* Cutouts - using absolute positioning relative to this container */}
                <View className="absolute -left-2 w-4 h-4 bg-white rounded-full" />
                <View className="absolute -right-2 w-4 h-4 bg-white rounded-full" />
            </View>

            {/* Bottom Section */}
            <View className="px-4 pb-4 flex-row justify-between items-center">
                <View className="flex-row items-center">
                    <Text className="text-neutral-400 text-xs font-inter">Valid Until: </Text>
                    <Text className="text-neutral-900 text-xs font-inter">
                        {item.end_date ? new Date(item.end_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'No Expiry'}
                    </Text>
                </View>

                <View className="flex-row items-center gap-1">
                    <Text className="text-neutral-400 text-xs font-inter">Code :</Text>
                    <Text className="text-primary text-xs font-inter-medium uppercase">{item.code}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-neutral-50">
            <SafeAreaView className="flex-1" edges={['top']}>
                {/* Header - Figma Layer: Frame 37302 */}
                <View className="px-6 py-4 flex-row items-center justify-between border-b border-neutral-100 bg-white">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 items-center justify-center bg-primary rounded-full"
                    >
                        <Ionicons name="arrow-back" size={20} color="white" />
                    </TouchableOpacity>

                    <Text className="text-2xl text-neutral-900 font-inter-semibold text-center flex-1">
                        My Voucher
                    </Text>

                    {/* Placeholder for symmetry (right button opacity 0) */}
                    <View className="w-10 h-10 opacity-0" />
                </View>

                {/* Search Bar - Figma Layer: Frame 37062 -> Input */}
                <View className="p-6 bg-white">
                    <View className="flex-row items-center bg-white border border-neutral-200 rounded-full px-4 py-2.5 h-12 overflow-hidden">
                        <Ionicons name="search-outline" size={20} color={Colors.neutral[300]} style={{ marginRight: 12 }} />

                        <TextInput
                            className="flex-1 font-inter text-sm text-neutral-900 leading-5"
                            placeholder="Search voucher here"
                            placeholderTextColor={Colors.neutral[400]}
                            value={claimCode}
                            onChangeText={setClaimCode} // Using claimCode state for search temporarily
                            autoCapitalize="none"
                        />

                        <TouchableOpacity onPress={() => {/* Voice search placeholder */ }}>
                            <Ionicons name="mic-outline" size={20} color={Colors.neutral[300]} />
                        </TouchableOpacity>
                    </View>
                </View>


                {loading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
                    </View>
                ) : (
                    <FlatList
                        data={filteredVouchers}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={{ padding: 16, paddingBottom: 40, flexGrow: 1 }}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadVouchers(); }} tintColor={Colors.primary.DEFAULT} />
                        }
                        ListEmptyComponent={
                            <View className="flex-1 items-center justify-center py-12 px-6">
                                <EmptyVoucherIllustration />

                                <Text className="text-xl font-inter-bold text-neutral-900 text-center mt-8 mb-3">
                                    You don’t have any active{'\n'}vouchers right now.
                                </Text>
                                <Text className="text-sm font-inter text-neutral-500 text-center mb-10 leading-6">
                                    Start shopping to unlock special discounts,{'\n'}free shipping, and more!
                                </Text>

                                <View className="flex-row gap-3 w-full">
                                    <TouchableOpacity
                                        onPress={() => router.push('/')}
                                        className="flex-1 py-3 rounded-full border border-primary items-center justify-center"
                                    >
                                        <Text className="text-primary font-inter-semibold">Explore Products</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => {/* Logic to focus input or show modal could go here, for now simpler */ }}
                                        className="flex-1 py-3 rounded-full bg-primary items-center justify-center"
                                    >
                                        <Text className="text-white font-inter-semibold">Input Code Manually</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        }
                    />
                )}
            </SafeAreaView>
        </View>
    );
}
