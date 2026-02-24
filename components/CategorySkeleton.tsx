import SkeletonBone from '@/components/ui/SkeletonBone';
import { Colors } from '@/constants/theme';
import React from 'react';
import { View } from 'react-native';

const CategoryCardSkeleton = () => (
    <View className="w-full bg-white rounded-2xl border border-neutral-200 p-3 items-center gap-3">
        <View
            className="w-full aspect-square rounded-xl overflow-hidden items-center justify-center relative"
            style={{ backgroundColor: Colors.neutral[50] }}
        >
            {/* Placeholder for Icon/Image */}
            <SkeletonBone width="50%" height={"50%" as any} borderRadius={12} />
        </View>
        <SkeletonBone width={80} height={14} borderRadius={4} />
    </View>
);

export default function CategorySkeleton() {
    return (
        <View className="flex-1 bg-white p-5">
            {/* Header */}
            <View className="mb-6 mt-2">
                <SkeletonBone width={140} height={32} borderRadius={8} />
                <View className="mt-2">
                    <SkeletonBone width={200} height={14} borderRadius={4} />
                </View>
            </View>

            {/* Grid */}
            <View className="flex-row flex-wrap" style={{ gap: 16 }}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <View key={i} style={{ width: '47%' }}>
                        <CategoryCardSkeleton />
                    </View>
                ))}
            </View>
        </View>
    );
}
