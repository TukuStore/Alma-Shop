
import { Colors } from '@/constants/theme';
import { voucherService } from '@/services/voucherService';
import type { Voucher } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VoucherDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [voucher, setVoucher] = useState<Voucher | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadVoucher();
    }, [id]);

    const loadVoucher = async () => {
        try {
            setLoading(true);
            const vouchers = await voucherService.fetchUserVouchers();
            const found = vouchers.find(v => v.id === id);
            setVoucher(found || null);
        } catch (error) {
            console.error('Error loading voucher:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
            </View>
        );
    }

    if (!voucher) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center" edges={['top']}>
                <Text className="text-neutral-500 font-inter">Voucher not found</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4">
                    <Text className="text-primary font-inter-medium">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <View className="flex-1 bg-primary">
            <SafeAreaView className="flex-1" edges={['top']}>
                <View className="px-5 py-3 flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full bg-white/20">
                        <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-xl text-white font-inter-bold ml-4">
                        Voucher Details
                    </Text>
                </View>

                <View className="flex-1 bg-white rounded-t-[30px] mt-4 p-8 items-center">
                    <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-6">
                        <Ionicons name="gift-outline" size={40} color={Colors.primary.DEFAULT} />
                    </View>

                    <Text className="text-2xl font-inter-bold text-neutral-900 text-center mb-2">
                        {voucher.name}
                    </Text>
                    <Text className="text-neutral-500 font-inter text-center mb-8 leading-6">
                        {voucher.description}
                    </Text>

                    <View className="w-full bg-neutral-50 rounded-xl p-4 border border-dashed border-neutral-300 items-center mb-8">
                        <Text className="text-xs text-neutral-400 font-inter-medium uppercase tracking-widest mb-1">Voucher Code</Text>
                        <Text className="text-xl font-mono text-neutral-900 select-all">{voucher.code}</Text>
                    </View>

                    <View className="w-full gap-4">
                        <DetailRow label="Min. Purchase" value={`Rp ${voucher.min_purchase.toLocaleString()}`} />
                        <DetailRow label="Valid Until" value={voucher.end_date ? new Date(voucher.end_date).toLocaleDateString() : 'Forever'} />
                        <DetailRow label="Status" value={voucher.is_used ? 'Used' : 'Available'} valueColor={voucher.is_used ? 'text-neutral-500' : 'text-success'} />
                    </View>

                    <TouchableOpacity
                        className={`w-full py-4 rounded-full mt-auto mb-4 ${voucher.is_used ? 'bg-neutral-200' : 'bg-primary'}`}
                        onPress={() => router.push('/')}
                        disabled={voucher.is_used}
                    >
                        <Text className={`text-center font-inter-bold ${voucher.is_used ? 'text-neutral-500' : 'text-white'}`}>
                            {voucher.is_used ? 'Voucher Used' : 'Use Voucher Now'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

function DetailRow({ label, value, valueColor = 'text-neutral-900' }: { label: string; value: string; valueColor?: string }) {
    return (
        <View className="flex-row justify-between items-center py-3 border-b border-neutral-100">
            <Text className="text-neutral-500 font-inter">{label}</Text>
            <Text className={`font-inter-semibold ${valueColor}`}>{value}</Text>
        </View>
    );
}
