
import { Colors } from '@/constants/theme';
import { walletService } from '@/services/walletService';
import type { Transaction } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type TabType = 'all' | 'topup' | 'payment' | 'refund';

const TABS: { id: TabType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'topup', label: 'Top Up' },
    { id: 'payment', label: 'Payment' },
    { id: 'refund', label: 'Refunds' },
];

export default function TransactionsScreen() {
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTransactions();
    }, [activeTab]);

    const loadTransactions = async () => {
        try {
            setLoading(true);
            const filter = activeTab === 'all' ? undefined : activeTab;
            const data = await walletService.fetchTransactions(50, filter);
            setTransactions(data);
        } catch (error) {
            console.error('Error loading transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: Transaction }) => {
        const isCredit = item.type === 'topup' || item.type === 'refund';
        const iconName = item.type === 'topup' ? 'add' : item.type === 'payment' ? 'cart-outline' : item.type === 'transfer' ? 'paper-plane-outline' : 'refresh-outline';

        return (
            <View className="flex-row items-center justify-between py-4 px-6 border-b border-neutral-100 bg-white">
                <View className="flex-row items-center gap-4">
                    <View className={`w-10 h-10 rounded-full items-center justify-center ${isCredit ? 'bg-green-50' : 'bg-neutral-50'}`}>
                        <Ionicons name={iconName} size={20} color={isCredit ? Colors.success : Colors.text.muted} />
                    </View>
                    <View>
                        <Text className="text-sm font-inter-semibold text-neutral-900">{item.description}</Text>
                        <Text className="text-xs font-inter-medium text-neutral-500">
                            {new Date(item.created_at).toLocaleDateString()} • {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                </View>
                <View className="items-end">
                    <Text className={`text-sm font-inter-bold ${isCredit ? 'text-green-600' : 'text-neutral-900'}`}>
                        {isCredit ? '+' : '-'} Rp {item.amount.toLocaleString('id-ID')}
                    </Text>
                    <Text className={`text-[10px] font-inter-medium uppercase ${item.status === 'completed' ? 'text-green-600' : 'text-neutral-400'}`}>
                        {item.status}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center gap-4 border-b border-neutral-100">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 border border-neutral-200 rounded-full items-center justify-center"
                >
                    <Ionicons name="arrow-back" size={20} color={Colors.text.DEFAULT} />
                </TouchableOpacity>
                <Text className="text-xl font-inter-bold text-neutral-900">
                    Transaction History
                </Text>
            </View>

            {/* Tabs */}
            <View className="flex-row p-4 border-b border-neutral-100">
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={TABS}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ gap: 8 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => setActiveTab(item.id)}
                            className={`px-5 py-2 rounded-full border ${activeTab === item.id ? 'bg-neutral-900 border-neutral-900' : 'bg-white border-neutral-200'}`}
                        >
                            <Text className={`text-sm font-inter-medium ${activeTab === item.id ? 'text-white' : 'text-neutral-600'}`}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* List */}
            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color={Colors.primary.DEFAULT} size="large" />
                </View>
            ) : (
                <FlatList
                    data={transactions}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    ListEmptyComponent={
                        <View className="flex-1 items-center justify-center py-20">
                            <Ionicons name="receipt-outline" size={64} color="#E5E7EB" />
                            <Text className="text-neutral-400 font-inter-medium mt-4">No transactions found</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}
