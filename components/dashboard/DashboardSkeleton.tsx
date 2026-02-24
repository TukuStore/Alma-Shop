/**
 * DashboardSkeleton.tsx
 * Skeleton loading component for the Dashboard screen.
 * Based on Figma node 1269:5713 – "19. Dashboard - Skelton Loading"
 *
 * Uses a shimmer-like pulsing animation on neutral-colored placeholder bars
 * to indicate data is loading.
 */

import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import SkeletonBone from '@/components/ui/SkeletonBone';

// ─── Section Skeleton ──────────────────────────────
const SectionHeaderSkeleton = ({
    titleWidth = 83,
    hasBadge = false,
    badgeWidth = 86,
}: {
    titleWidth?: number;
    hasBadge?: boolean;
    badgeWidth?: number;
}) => (
    <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-4">
            <SkeletonBone width={titleWidth} height={20} borderRadius={22} />
            {hasBadge && (
                <View
                    className="rounded-lg px-2 py-1 flex-row items-center gap-1"
                    style={{ backgroundColor: Colors.neutral[50] }}
                >
                    <SkeletonBone width={12} height={14} borderRadius={14} />
                    <SkeletonBone width={35} height={10} borderRadius={15} />
                </View>
            )}
        </View>
        <SkeletonBone width={40} height={16} borderRadius={20} />
    </View>
);

// Category Item Skeleton
const CategoryItemSkeleton = () => (
    <View className="items-center w-[86px] gap-2">
        <View
            className="w-[86px] h-[86px] rounded-2xl overflow-hidden items-center justify-center"
            style={{ backgroundColor: Colors.neutral[50] }}
        >
            <SkeletonBone width={64} height={64} borderRadius={0} />
        </View>
        <SkeletonBone width={60} height={9} borderRadius={12} />
    </View>
);

// Product Card Skeleton (for horizontal scroll sections)
const ProductCardSkeleton = () => (
    <View className="w-[160px]">
        <View
            className="w-[160px] h-[160px] rounded-2xl overflow-hidden items-center justify-center"
            style={{ backgroundColor: Colors.neutral[50] }}
        >
            <SkeletonBone width={120} height={120} borderRadius={0} />
            {/* Wishlist button placeholder */}
            <View
                className="absolute top-[10px] right-[10px] w-8 h-8 rounded-full items-center justify-center"
                style={{ backgroundColor: '#fff' }}
            >
                <SkeletonBone width={14} height={12} borderRadius={12} />
            </View>
        </View>
        <View className="mt-3 gap-2">
            <SkeletonBone width={98} height={14} borderRadius={17} />
            <SkeletonBone width={107} height={14} borderRadius={17} />
        </View>
        <View className="flex-row items-center justify-between mt-3">
            <View className="gap-1">
                <SkeletonBone width={78} height={12} borderRadius={15} />
                <SkeletonBone width={68} height={14} borderRadius={17} />
            </View>
            <View className="flex-row items-center gap-2">
                <SkeletonBone width={13} height={13} borderRadius={13} />
                <SkeletonBone width={15} height={10} borderRadius={15} />
            </View>
        </View>
        {/* Sold bar skeleton */}
        <View
            className="mt-3 h-6 w-full rounded-full overflow-hidden"
            style={{ backgroundColor: Colors.neutral[50] }}
        >
            <SkeletonBone width={44} height={10} borderRadius={15} style={{ alignSelf: 'center', marginTop: 4 }} />
        </View>
    </View>
);

// Recently Viewed Item Skeleton
const RecentlyViewedSkeleton = () => (
    <View className="flex-row gap-4 items-center">
        <View
            className="w-[120px] h-[120px] rounded-2xl overflow-hidden"
            style={{ backgroundColor: Colors.neutral[50] }}
        >
            <SkeletonBone width={120} height={120} borderRadius={0} />
            <View
                className="absolute top-2 right-2 w-8 h-8 rounded-full items-center justify-center"
                style={{ backgroundColor: '#fff' }}
            >
                <SkeletonBone width={14} height={12} borderRadius={12} />
            </View>
        </View>
        <View className="flex-1 gap-3">
            <SkeletonBone width={232} height={16} borderRadius={20} />
            <View className="gap-2">
                <View className="flex-row items-center gap-2">
                    <SkeletonBone width={13} height={13} borderRadius={13} />
                    <SkeletonBone width={17} height={12} borderRadius={17} />
                    <SkeletonBone width={94} height={12} borderRadius={17} />
                </View>
                <View className="flex-row items-center gap-2">
                    <SkeletonBone width={43} height={14} borderRadius={17} />
                    <SkeletonBone width={55} height={10} borderRadius={15} />
                </View>
            </View>
        </View>
    </View>
);

// Grid Product Card Skeleton (for Special For You section)
const GridProductCardSkeleton = () => (
    <View className="flex-1 min-w-0">
        <View
            className="w-full rounded-2xl overflow-hidden"
            style={{ backgroundColor: Colors.neutral[50], aspectRatio: 186 / 160 }}
        >
            <View
                className="absolute top-[10px] right-[10px] w-8 h-8 rounded-full items-center justify-center"
                style={{ backgroundColor: '#fff' }}
            >
                <SkeletonBone width={14} height={12} borderRadius={12} />
            </View>
        </View>
        <View className="mt-3 gap-2">
            <SkeletonBone width={142} height={14} borderRadius={17} />
            <SkeletonBone width={95} height={14} borderRadius={17} />
        </View>
        <View className="flex-row items-center justify-between mt-3">
            <SkeletonBone width={84} height={14} borderRadius={17} />
            <View className="flex-row items-center gap-2">
                <SkeletonBone width={13} height={13} borderRadius={13} />
                <SkeletonBone width={15} height={10} borderRadius={15} />
            </View>
        </View>
    </View>
);

// ─── Main Skeleton Component ───────────────────────
export default function DashboardSkeleton() {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} scrollEnabled={false}>
                {/* ─── Header Skeleton ──────────────────── */}
                <View className="px-6 py-6 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-4">
                        {/* Avatar */}
                        <SkeletonBone width={48} height={48} borderRadius={24} />
                        {/* Name lines */}
                        <View className="gap-3">
                            <SkeletonBone width={171} height={12} borderRadius={17} />
                            <SkeletonBone width={191} height={14} borderRadius={20} />
                        </View>
                    </View>
                    {/* Icons */}
                    <View className="flex-row gap-4 items-center">
                        <Ionicons name="chatbubble-ellipses-outline" size={24} color={Colors.neutral[200]} />
                        <Ionicons name="cart-outline" size={24} color={Colors.neutral[200]} />
                        <Ionicons name="notifications-outline" size={24} color={Colors.neutral[200]} />
                    </View>
                </View>

                {/* ─── Banner Skeleton ──────────────────── */}
                <View className="mx-6">
                    <View
                        className="w-full h-[200px] rounded-[20px] overflow-hidden"
                        style={{ backgroundColor: Colors.neutral[400] }}
                    >
                        {/* Text lines skeleton */}
                        <View className="absolute left-4 top-4 gap-3 w-[190px]">
                            <SkeletonBone width={114} height={21} borderRadius={30} />
                            <SkeletonBone width={146} height={21} borderRadius={30} />
                            <SkeletonBone width={134} height={10} borderRadius={15} />
                            <SkeletonBone width={180} height={10} borderRadius={15} />
                        </View>
                        {/* Button skeleton */}
                        <View
                            className="absolute left-4 bottom-[33px] w-[111px] h-[33px] rounded-full"
                            style={{ backgroundColor: '#fff' }}
                        >
                            <View className="flex-row items-center gap-1 px-3 py-2">
                                <SkeletonBone width={47} height={10} borderRadius={15} />
                            </View>
                        </View>
                        {/* Dots */}
                        <View className="absolute bottom-4 self-center flex-row gap-1 left-0 right-0 justify-center">
                            {[0, 1, 2, 3, 4, 5].map((i) => (
                                <SkeletonBone key={i} width={4} height={4} borderRadius={100} />
                            ))}
                        </View>
                    </View>
                </View>

                {/* ─── Search Bar Skeleton ──────────────── */}
                <View className="mx-6 mt-8 flex-row gap-4">
                    <View
                        className="flex-1 h-[40px] rounded-full flex-row items-center px-4 gap-3"
                        style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: Colors.neutral[200] }}
                    >
                        <SkeletonBone width={16} height={16} borderRadius={16} />
                        <SkeletonBone width={203} height={12} borderRadius={17} />
                    </View>
                    <View
                        className="w-[40px] h-[40px] rounded-full items-center justify-center"
                        style={{ backgroundColor: Colors.neutral[200] }}
                    >
                        <SkeletonBone width={17} height={15} borderRadius={15} />
                    </View>
                </View>

                {/* ─── Categories Skeleton ──────────────── */}
                <View className="mt-8 px-6">
                    <SectionHeaderSkeleton titleWidth={83} />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View className="flex-row" style={{ gap: 10 }}>
                            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                                <CategoryItemSkeleton key={i} />
                            ))}
                        </View>
                    </ScrollView>
                </View>

                {/* ─── Recently Viewed Skeleton ─────────── */}
                <View className="mt-8 px-6">
                    <SectionHeaderSkeleton titleWidth={113} />
                    <RecentlyViewedSkeleton />
                    {/* Dots */}
                    <View className="flex-row justify-center gap-2 mt-4">
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                            <SkeletonBone key={i} width={8} height={8} borderRadius={100} />
                        ))}
                    </View>
                </View>

                {/* ─── Flash Deals Skeleton ─────────────── */}
                <View className="mt-8 px-6">
                    <SectionHeaderSkeleton titleWidth={55} hasBadge badgeWidth={86} />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View className="flex-row" style={{ gap: 20 }}>
                            {[0, 1, 2].map((i) => (
                                <ProductCardSkeleton key={i} />
                            ))}
                        </View>
                    </ScrollView>
                </View>

                {/* ─── Best Seller Skeleton ─────────────── */}
                <View className="mt-8 px-6">
                    <SectionHeaderSkeleton titleWidth={75} hasBadge badgeWidth={86} />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View className="flex-row" style={{ gap: 20 }}>
                            {[0, 1, 2].map((i) => (
                                <ProductCardSkeleton key={i} />
                            ))}
                        </View>
                    </ScrollView>
                </View>

                {/* ─── Most Popular Skeleton ────────────── */}
                <View className="mt-8 px-6">
                    <SectionHeaderSkeleton titleWidth={78} hasBadge badgeWidth={86} />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View className="flex-row" style={{ gap: 20 }}>
                            {[0, 1, 2].map((i) => (
                                <ProductCardSkeleton key={i} />
                            ))}
                        </View>
                    </ScrollView>
                </View>

                {/* ─── Special For You Skeleton ─────────── */}
                <View className="mt-8 px-6">
                    <SectionHeaderSkeleton titleWidth={96} />
                    <View className="flex-row gap-5 mb-4">
                        <GridProductCardSkeleton />
                        <GridProductCardSkeleton />
                    </View>
                    <View className="flex-row gap-5 mb-4">
                        <GridProductCardSkeleton />
                        <GridProductCardSkeleton />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
