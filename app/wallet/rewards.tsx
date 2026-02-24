import { Colors } from '@/constants/theme';
import { walletService } from '@/services/walletService';
import { useMedinaStore } from '@/store/useMedinaStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type RewardTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

interface TierInfo {
    tier: RewardTier;
    pointsRequired: number;
    benefits: string[];
    color: string;
    icon: keyof typeof Ionicons.glyphMap;
}

const TIER_INFO: TierInfo[] = [
    {
        tier: 'Bronze',
        pointsRequired: 0,
        benefits: ['1% cashback on purchases', 'Birthday vouchers', 'Early access to sales'],
        color: '#CD7F32',
        icon: 'medal-outline',
    },
    {
        tier: 'Silver',
        pointsRequired: 2000,
        benefits: ['2% cashback on purchases', 'Free shipping vouchers', 'Priority support', 'Birthday vouchers'],
        color: '#C0C0C0',
        icon: 'medal-outline',
    },
    {
        tier: 'Gold',
        pointsRequired: 5000,
        benefits: ['3% cashback on purchases', 'Exclusive discounts', 'Dedicated support', 'Free shipping', 'Birthday vouchers'],
        color: '#FFD700',
        icon: 'medal',
    },
    {
        tier: 'Platinum',
        pointsRequired: 10000,
        benefits: ['5% cashback on purchases', 'VIP exclusive products', '24/7 support', 'Free shipping', 'Exclusive vouchers', 'Birthday vouchers'],
        color: '#E5E4E2',
        icon: 'diamond',
    },
];

const REWARD_OPTIONS = [
    { id: 'discount_5', points: 500, name: 'Rp 5.000 Voucher', tier: 'Bronze' },
    { id: 'discount_10', points: 1000, name: 'Rp 10.000 Voucher', tier: 'Bronze' },
    { id: 'discount_25', points: 2500, name: 'Rp 25.000 Voucher', tier: 'Silver' },
    { id: 'discount_50', points: 5000, name: 'Rp 50.000 Voucher', tier: 'Gold' },
    { id: 'discount_100', points: 10000, name: 'Rp 100.000 Voucher', tier: 'Platinum' },
    { id: 'shipping', points: 1500, name: 'Free Shipping', tier: 'Silver' },
];

export default function RewardsScreen() {
    const user = useMedinaStore((s) => s.auth.user);
    const [rewardData, setRewardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [redeeming, setRedeeming] = useState(false);

    useEffect(() => {
        loadRewardData();
    }, []);

    const loadRewardData = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const data = await walletService.getRewardPoints(user.id);
            setRewardData(data);
        } catch (error) {
            console.error('Error loading reward data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRedeem = async (points: number, reward: string, tier: string) => {
        if (!user) return;

        // Check tier requirement
        const tierIndex = TIER_INFO.findIndex(t => t.tier === tier);
        const userTierIndex = TIER_INFO.findIndex(t => t.tier === rewardData.currentTier);

        if (userTierIndex < tierIndex) {
            Alert.alert('Tier Required', `This reward requires ${tier} tier. You need ${TIER_INFO[tierIndex].pointsRequired} points to unlock ${tier} tier.`);
            return;
        }

        setRedeeming(true);
        try {
            const result = await walletService.redeemPoints(user.id, points, reward);
            if (result.success) {
                Alert.alert('Success', result.message || 'Reward redeemed successfully', [
                    { text: 'OK', onPress: () => loadRewardData() }
                ]);
            } else {
                Alert.alert('Redemption Failed', result.message);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to redeem reward. Please try again.');
        } finally {
            setRedeeming(false);
        }
    };

    const getTierProgress = (tierInfo: TierInfo) => {
        if (!rewardData) return 0;
        const currentPoints = rewardData.totalPoints;
        const tierPoints = tierInfo.pointsRequired;
        if (currentPoints >= tierPoints) return 100;
        return Math.floor((currentPoints / tierPoints) * 100);
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center gap-4 border-b border-neutral-100">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 border border-neutral-200 rounded-full items-center justify-center">
                    <Ionicons name="arrow-back" size={20} color={Colors.text.DEFAULT} />
                </TouchableOpacity>
                <Text className="flex-1 text-center text-xl font-inter-semibold text-neutral-900">
                    Rewards & Tiers
                </Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
                {/* Current Points */}
                {rewardData && (
                    <View className="mb-6">
                        <Text className="text-sm font-inter-semibold text-neutral-500 mb-3">YOUR POINTS</Text>
                        <View className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-5 border border-yellow-200">
                            <View className="flex-row items-center justify-between">
                                <View>
                                    <Text className="text-4xl font-inter-bold text-yellow-600">
                                        {rewardData.totalPoints.toLocaleString()}
                                    </Text>
                                    <Text className="text-sm font-inter text-neutral-700">points</Text>
                                </View>
                                <View className="bg-yellow-100 px-4 py-2 rounded-full">
                                    <Text className="text-sm font-inter-semibold text-yellow-800">
                                        {rewardData.currentTier}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                {/* Tier Progress */}
                <View className="mb-6">
                    <Text className="text-sm font-inter-semibold text-neutral-500 mb-3">YOUR PROGRESS</Text>
                    {TIER_INFO.map((tier, index) => {
                        const progress = getTierProgress(tier);
                        const isUnlocked = rewardData?.totalPoints >= tier.pointsRequired;
                        const isCurrentTier = tier.tier === rewardData?.currentTier;

                        return (
                            <View key={tier.tier} className="mb-3">
                                <View className="flex-row items-center justify-between mb-2">
                                    <View className="flex-row items-center gap-2">
                                        <Ionicons
                                            name={isUnlocked ? tier.icon : 'lock-closed-outline'}
                                            size={20}
                                            color={isUnlocked ? tier.color : '#9CA3AF'}
                                        />
                                        <Text
                                            className={`text-sm font-inter-semibold ${isUnlocked ? 'text-neutral-900' : 'text-neutral-400'
                                                }`}
                                        >
                                            {tier.tier} Tier
                                        </Text>
                                    </View>
                                    <Text className="text-xs font-inter text-neutral-500">
                                        {tier.pointsRequired.toLocaleString()} pts
                                    </Text>
                                </View>

                                {/* Progress Bar */}
                                <View className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden mb-2">
                                    <View
                                        className="h-full rounded-full"
                                        style={{
                                            backgroundColor: isUnlocked ? tier.color : '#E5E7EB',
                                            width: `${progress}%`,
                                        }}
                                    />
                                </View>

                                {/* Benefits Preview */}
                                {isCurrentTier && (
                                    <View className="bg-neutral-50 rounded-lg p-3">
                                        <Text className="text-xs font-inter-semibold text-neutral-700 mb-1">
                                            Your Benefits:
                                        </Text>
                                        <Text className="text-xs font-inter text-neutral-500">
                                            {tier.benefits.slice(0, 2).join(' • ')}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>

                {/* Tier Breakdown */}
                <View className="mb-6">
                    <Text className="text-sm font-inter-semibold text-neutral-500 mb-3">TIERS & BENEFITS</Text>
                    {TIER_INFO.map((tier) => {
                        const isUnlocked = rewardData?.totalPoints >= tier.pointsRequired;

                        return (
                            <TouchableOpacity
                                key={tier.tier}
                                disabled={!isUnlocked}
                                className={`mb-3 p-4 rounded-xl border ${isUnlocked ? 'border-neutral-200 bg-white' : 'border-neutral-100 bg-neutral-50'
                                    }`}
                            >
                                <View className="flex-row items-center justify-between mb-3">
                                    <View className="flex-row items-center gap-2">
                                        <Ionicons
                                            name={tier.icon}
                                            size={24}
                                            color={isUnlocked ? tier.color : '#9CA3AF'}
                                        />
                                        <Text
                                            className={`text-base font-inter-bold ${isUnlocked ? 'text-neutral-900' : 'text-neutral-400'
                                                }`}
                                        >
                                            {tier.tier}
                                        </Text>
                                    </View>
                                    {!isUnlocked && (
                                        <Ionicons name="lock-closed" size={20} color="#9CA3AF" />
                                    )}
                                </View>

                                <View className="flex-row gap-2 mb-3">
                                    <Text className="text-xs font-inter text-neutral-500">
                                        Required:
                                    </Text>
                                    <Text className="text-xs font-inter-bold text-neutral-900">
                                        {tier.pointsRequired.toLocaleString()} pts
                                    </Text>
                                </View>

                                <View className="space-y-1">
                                    {tier.benefits.map((benefit, idx) => (
                                        <View key={idx} className="flex-row items-start gap-2">
                                            <Ionicons name="checkmark-circle" size={16} color={isUnlocked ? tier.color : '#9CA3AF'} />
                                            <Text className={`text-xs font-inter flex-1 ${isUnlocked ? 'text-neutral-700' : 'text-neutral-400'}`}>
                                                {benefit}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Redeem Rewards */}
                <View className="mb-6">
                    <Text className="text-sm font-inter-semibold text-neutral-500 mb-3">REDEEM POINTS</Text>
                    <View className="space-y-3">
                        {REWARD_OPTIONS.map((reward) => {
                            const canRedeem = rewardData?.totalPoints >= reward.points;
                            const tierInfo = TIER_INFO.find(t => t.tier === reward.tier);
                            const isTierUnlocked = rewardData?.currentTier === reward.tier;

                            return (
                                <TouchableOpacity
                                    key={reward.id}
                                    disabled={!canRedeem || !isTierUnlocked || redeeming}
                                    onPress={() => handleRedeem(reward.points, reward.name, reward.tier)}
                                    className={`p-4 rounded-xl border flex-row items-center justify-between ${canRedeem && isTierUnlocked
                                        ? 'border-primary bg-primary/5'
                                        : 'border-neutral-200 bg-white opacity-60'
                                        }`}
                                >
                                    <View className="flex-1">
                                        <Text
                                            className={`text-sm font-inter-semibold ${canRedeem && isTierUnlocked ? 'text-neutral-900' : 'text-neutral-400'
                                                }`}
                                        >
                                            {reward.name}
                                        </Text>
                                        <View className="flex-row items-center gap-2 mt-1">
                                            <Text
                                                className={`text-xs font-inter ${canRedeem && isTierUnlocked ? 'text-neutral-600' : 'text-neutral-400'
                                                    }`}
                                            >
                                                {reward.points.toLocaleString()} pts
                                            </Text>
                                            <View
                                                className={`px-2 py-0.5 rounded ${canRedeem && isTierUnlocked ? 'bg-primary/20' : 'bg-neutral-200'
                                                    }`}
                                            >
                                                <Text className={`text-[10px] font-inter-bold ${canRedeem && isTierUnlocked ? 'text-primary' : 'text-neutral-500'
                                                    }`}>
                                                    {reward.tier}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        disabled={!canRedeem || !isTierUnlocked || redeeming}
                                        onPress={() => handleRedeem(reward.points, reward.name, reward.tier)}
                                        className={`px-4 py-2 rounded-lg ${canRedeem && isTierUnlocked ? 'bg-primary' : 'bg-neutral-300'
                                            }`}
                                    >
                                        {redeeming ? (
                                            <ActivityIndicator size="small" color="white" />
                                        ) : (
                                            <Text
                                                className={`text-xs font-inter-semibold ${canRedeem && isTierUnlocked ? 'text-white' : 'text-neutral-500'
                                                    }`}
                                            >
                                                Redeem
                                            </Text>
                                        )}
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* How to Earn */}
                <View className="bg-blue-50 rounded-xl p-4 mb-6">
                    <View className="flex-row items-start gap-3">
                        <Ionicons name="bulb" size={24} color="#3B82F6" />
                        <View className="flex-1">
                            <Text className="text-sm font-inter-semibold text-blue-900 mb-2">
                                How to Earn Points
                            </Text>
                            <Text className="text-xs font-inter text-blue-700 leading-5">
                                • <Text className="font-semibold">Rp 1.000</Text> spent = <Text className="font-semibold">1 point</Text>{'\n'}
                                • Write reviews = <Text className="font-semibold">50 points</Text> per review{'\n'}
                                • Refer a friend = <Text className="font-semibold">100 points</Text>{'\n'}
                                • Top up wallet = <Text className="font-semibold">1 point</Text> per Rp 1.000
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
