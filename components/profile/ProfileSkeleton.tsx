import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, View } from 'react-native';

const { width, height } = Dimensions.get('window');

// Helper component for the gradient loading blocks
const SkeletonBlock = ({ className, style }: { className?: string, style?: any }) => (
    <LinearGradient
        colors={['rgba(226, 232, 240, 0.05)', '#e2e8f0']} // slate-200/5 to slate-200
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 0 }}
        className={className}
        style={style}
    />
);

export default function ProfileSkeleton() {
    return (
        <View className="flex-1 bg-neutral-100 overflow-hidden relative">
            {/* ─── Background Abstract Shapes (Layer 68) ─── */}
            {/* Rectangle 1 */}
            <SkeletonBlock
                style={{
                    position: 'absolute',
                    width: 734.72,
                    height: 1070.85,
                    left: -112.01,
                    top: 206.52,
                    borderRadius: 1070.85,
                    transform: [{ rotate: '40.92deg' }],
                    opacity: 0.5, // Adjusting for visual matching
                }}
            />
            {/* Rectangle 2 */}
            <SkeletonBlock
                style={{
                    position: 'absolute',
                    width: 804.13,
                    height: 876.51,
                    left: -157.77,
                    top: 177.95,
                    borderRadius: 876.51,
                    transform: [{ rotate: '40.92deg' }],
                    opacity: 0.5,
                }}
            />
            {/* Rectangle 3 */}
            <SkeletonBlock
                style={{
                    position: 'absolute',
                    width: 1171.98,
                    height: 676.22,
                    left: -367.64,
                    top: 459.60,
                    borderRadius: 676.22,
                    transform: [{ rotate: '40.92deg' }],
                    opacity: 0.5,
                }}
            />

            {/* ─── Header Content ─── */}
            {/* Top Bar Placeholders */}
            <View className="mt-12 px-6 flex-row items-center justify-between">
                {/* Back Button */}
                <View className="w-10 h-10 bg-white rounded-full items-center justify-center">
                    <SkeletonBlock className="w-[11px] h-[11px] rounded-full" />
                </View>
                {/* Title */}
                <SkeletonBlock className="w-48 h-5 rounded-[30px]" />
                {/* Right hidden button spacer */}
                <View className="w-10 h-10" />
            </View>

            {/* Profile Info Placeholder */}
            <View className="mx-6 mt-6 p-4 rounded-2xl flex-row items-center gap-4">
                {/* Avatar */}
                <View className="w-16 h-16 bg-neutral-200 rounded-full overflow-hidden items-center justify-center">
                    {/* Inner circle shimmer */}
                    <SkeletonBlock className="w-full h-full opacity-50" />
                </View>

                {/* Name/Text */}
                <View className="gap-2">
                    <SkeletonBlock className="w-40 h-3.5 rounded-[20px]" />
                    <SkeletonBlock className="w-44 h-4 rounded-3xl" />
                </View>

                {/* Edit Button */}
                <View className="ml-auto w-11 h-11 bg-white rounded-full items-center justify-center">
                    <SkeletonBlock className="w-[13px] h-[16px] rounded-[6px]" />
                </View>
            </View>

            {/* ─── Main Content Container (White Card) ─── */}
            <View className="flex-1 bg-white mt-8 rounded-t-[30px] pt-6 px-6">

                {/* Wallet Card Placeholder (Frame 1000002946) */}
                <View className="w-full h-52 bg-neutral-100 rounded-[30px] overflow-hidden relative mb-6">
                    {/* Abstract shapes inside wallet card */}
                    <SkeletonBlock className="absolute w-[559px] h-[559px] left-[54px] top-[172px] rounded-[559px] rotate-[40.92deg]" />
                    <SkeletonBlock className="absolute w-[457px] h-[457px] left-[30px] top-[157px] rounded-[457px] rotate-[40.92deg]" />

                    {/* Content inside wallet */}
                    <View className="p-6">
                        {/* Title Row */}
                        <View className="flex-row justify-between mb-8">
                            <SkeletonBlock className="w-24 h-4 rounded-3xl" />
                            <SkeletonBlock className="w-20 h-3.5 rounded-[20px]" />
                        </View>

                        {/* Balance */}
                        <SkeletonBlock className="w-48 h-6 mb-2 rounded-2xl" />
                        <SkeletonBlock className="w-40 h-3 rounded-2xl" />

                        {/* Buttons */}
                        <View className="flex-row gap-4 mt-8">
                            <View className="w-28 h-10 rounded-full bg-neutral-200 overflow-hidden">
                                <SkeletonBlock className="w-full h-full" />
                            </View>
                            <View className="w-28 h-10 rounded-full bg-neutral-200 overflow-hidden">
                                <SkeletonBlock className="w-full h-full" />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Purchase Icons Placeholder */}
                <View className="mb-8">
                    <View className="flex-row justify-between mb-4">
                        <SkeletonBlock className="w-24 h-4 rounded-3xl" />
                        <SkeletonBlock className="w-12 h-3.5 rounded-[20px] ml-auto" />
                    </View>
                    <View className="flex-row justify-between">
                        <View className="w-24 h-20 rounded-2xl bg-neutral-50 items-center justify-center gap-2">
                            <SkeletonBlock className="w-7 h-7 rounded-sm" />
                            <SkeletonBlock className="w-10 h-3 rounded-xl" />
                        </View>
                        <View className="w-24 h-20 rounded-2xl bg-neutral-50 items-center justify-center gap-2">
                            <SkeletonBlock className="w-7 h-7 rounded-sm" />
                            <SkeletonBlock className="w-14 h-3 rounded-xl" />
                        </View>
                        <View className="w-24 h-20 rounded-2xl bg-neutral-50 items-center justify-center gap-2">
                            <SkeletonBlock className="w-7 h-7 rounded-sm" />
                            <SkeletonBlock className="w-10 h-3 rounded-xl" />
                        </View>
                        <View className="w-24 h-20 rounded-2xl bg-neutral-50 items-center justify-center gap-2">
                            <SkeletonBlock className="w-7 h-7 rounded-sm" />
                            <SkeletonBlock className="w-10 h-3 rounded-xl" />
                        </View>
                    </View>
                </View>

                {/* Voucher Section Placeholder */}
                <View className="mb-6 h-36 bg-neutral-50 rounded-2xl p-4 overflow-hidden relative">
                    <SkeletonBlock className="w-48 h-3 rounded-2xl mb-2" />
                    <SkeletonBlock className="w-72 h-2.5 rounded-2xl mb-6" />
                    {/* Cutout circles mocked with layout */}

                    <View className="self-center mt-2">
                        <SkeletonBlock className="w-32 h-8 rounded-full" />
                    </View>
                </View>

                {/* Menu Items Placeholder */}
                <View className="gap-6">
                    <MenuItemSkeleton />
                    <MenuItemSkeleton />
                    <MenuItemSkeleton />
                    <MenuItemSkeleton isLast />
                </View>

            </View>
        </View>
    );
}

const MenuItemSkeleton = ({ isLast }: { isLast?: boolean }) => (
    <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-4">
            <View className="w-10 h-10 rounded-full bg-neutral-50 overflow-hidden items-center justify-center">
                <SkeletonBlock className="w-5 h-5 rounded-sm" />
            </View>
            <SkeletonBlock className="w-24 h-3.5 rounded-[20px]" />
        </View>
        <SkeletonBlock className="w-2 h-4 rounded-sm" />
    </View>
);
