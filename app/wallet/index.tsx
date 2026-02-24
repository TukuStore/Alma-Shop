
import WalletCard from '@/components/profile/WalletCard';
import TopUpModal from '@/components/wallet/TopUpModal';
import TransferModal from '@/components/wallet/TransferModal';
import { Colors } from '@/constants/theme';
import { walletService } from '@/services/walletService';
import { useMedinaStore } from '@/store/useMedinaStore';
import type { Transaction } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WalletScreen() {
    const user = useMedinaStore((s) => s.auth.user);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [isTopUpVisible, setIsTopUpVisible] = useState(false);
    const [isTransferVisible, setIsTransferVisible] = useState(false);
    const [rewardPoints, setRewardPoints] = useState<any>(null);

    useFocusEffect(
        React.useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        try {
            setLoading(true);
            const recent = await walletService.fetchTransactions(5);
            setTransactions(recent);

            // Load reward points
            if (user) {
                const points = await walletService.getRewardPoints(user.id);
                setRewardPoints(points);
            }
        } catch (error) {
            console.error('Error loading wallet data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTopUp = async (amount: number) => {
        try {
            setLoading(true);
            await walletService.performTopUp(amount);
            alert(`Successfully added Rp ${amount} to your wallet!`);
            setIsTopUpVisible(false);
            // Refresh data
            await loadData();
        } catch (error: any) {
            alert('Top Up Failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const renderTransactionItem = ({ item }: { item: Transaction }) => {
        const isCredit = item.type === 'topup' || item.type === 'refund';
        const iconName = item.type === 'topup' ? 'add' : item.type === 'payment' ? 'cart-outline' : item.type === 'transfer' ? 'paper-plane-outline' : 'refresh-outline';
        const color = isCredit ? Colors.success : Colors.text.DEFAULT;

        return (
            <View className="flex-row items-center justify-between py-4 border-b border-neutral-100">
                <View className="flex-row items-center gap-4">
                    <View className={`w-10 h-10 rounded-full items-center justify-center ${isCredit ? 'bg-green-50' : 'bg-neutral-50'}`}>
                        <Ionicons name={iconName} size={20} color={isCredit ? Colors.success : Colors.text.muted} />
                    </View>
                    <View>
                        <Text className="text-sm font-inter-semibold text-neutral-900">{item.description || item.type}</Text>
                        <Text className="text-xs font-inter-medium text-neutral-500">{new Date(item.created_at).toLocaleDateString()}</Text>
                    </View>
                </View>
                <Text className={`text-sm font-inter-bold ${isCredit ? 'text-green-600' : 'text-neutral-900'}`}>
                    {isCredit ? '+' : '-'} Rp {item.amount.toLocaleString('id-ID')}
                </Text>
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
                    My Wallet
                </Text>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Wallet Card Section */}
                <View className="p-6">
                    <WalletCard />
                </View>

                {/* Reward Points Card */}
                {rewardPoints && (
                    <View className="px-6 mb-6">
                        <View className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-4 border border-yellow-200">
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="flex-row items-center gap-2">
                                    <Ionicons name="trophy" size={24} color="#F59E0B" />
                                    <Text className="text-lg font-inter-bold text-neutral-900">Reward Points</Text>
                                </View>
                                <View className="bg-yellow-100 px-3 py-1 rounded-full">
                                    <Text className="text-xs font-inter-semibold text-yellow-800">{rewardPoints.currentTier}</Text>
                                </View>
                            </View>
                            <View className="flex-row items-end justify-between">
                                <View>
                                    <Text className="text-3xl font-inter-bold text-yellow-600">
                                        {rewardPoints.totalPoints.toLocaleString()}
                                    </Text>
                                    <Text className="text-xs font-inter text-neutral-500"> points</Text>
                                </View>
                                {rewardPoints.nextTier && (
                                    <TouchableOpacity onPress={() => router.push('/wallet/rewards')} className="flex-row items-center gap-1">
                                        <Text className="text-xs font-inter text-neutral-500">Next: {rewardPoints.nextTier}</Text>
                                        <Ionicons name="chevron-forward" size={16} color={Colors.primary.DEFAULT} />
                                    </TouchableOpacity>
                                )}
                            </View>
                            {rewardPoints.pointsToNextTier && (
                                <View className="mt-3">
                                    <View className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                                        <View
                                            className="h-full bg-yellow-500 rounded-full"
                                            style={{
                                                width: `${((rewardPoints.totalPoints / (rewardPoints.totalPoints + rewardPoints.pointsToNextTier)) * 100)}%`,
                                            }}
                                        />
                                    </View>
                                    <Text className="text-xs font-inter text-neutral-500 mt-1">
                                        {rewardPoints.pointsToNextTier} points to {rewardPoints.nextTier}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Quick Actions */}
                <View className="px-6 mb-8">
                    <Text className="text-lg font-inter-bold text-neutral-900 mb-4">Quick Actions</Text>
                    <View className="flex-row gap-4">
                        <TouchableOpacity
                            onPress={() => setIsTopUpVisible(true)}
                            className="flex-1 items-center gap-2 p-4 rounded-xl bg-neutral-50 border border-neutral-100"
                        >
                            <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
                                <Ionicons name="add" size={24} color={Colors.primary.DEFAULT} />
                            </View>
                            <Text className="text-sm font-inter-medium text-neutral-900">Top Up</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setIsTransferVisible(true)}
                            className="flex-1 items-center gap-2 p-4 rounded-xl bg-neutral-50 border border-neutral-100"
                        >
                            <View className="w-12 h-12 rounded-full bg-blue-50 items-center justify-center">
                                <Ionicons name="paper-plane-outline" size={22} color="#3B82F6" />
                            </View>
                            <Text className="text-sm font-inter-medium text-neutral-900">Transfer</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => router.push('/wallet/transactions')}
                            className="flex-1 items-center gap-2 p-4 rounded-xl bg-neutral-50 border border-neutral-100"
                        >
                            <View className="w-12 h-12 rounded-full bg-purple-50 items-center justify-center">
                                <Ionicons name="list-outline" size={22} color="#8B5CF6" />
                            </View>
                            <Text className="text-sm font-inter-medium text-neutral-900">History</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Recent Transactions */}
                <View className="px-6">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-lg font-inter-bold text-neutral-900">Recent Transactions</Text>
                        <TouchableOpacity onPress={() => router.push('/wallet/transactions')}>
                            <Text className="text-sm font-inter-medium text-primary">View All</Text>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <ActivityIndicator color={Colors.primary.DEFAULT} />
                    ) : transactions.length > 0 ? (
                        transactions.map(item => (
                            <View key={item.id}>
                                {renderTransactionItem({ item })}
                            </View>
                        ))
                    ) : (
                        <View className="py-8 items-center justify-center">
                            <Ionicons name="receipt-outline" size={48} color="#E5E7EB" />
                            <Text className="text-neutral-400 font-inter-medium mt-2">No transactions yet</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            <TopUpModal
                visible={isTopUpVisible}
                onClose={() => setIsTopUpVisible(false)}
                onTopUp={handleTopUp}
            />

            <TransferModal
                visible={isTransferVisible}
                onClose={() => setIsTransferVisible(false)}
                onSuccess={loadData}
            />
        </SafeAreaView>
    );
}
