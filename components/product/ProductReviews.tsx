import { useTranslation } from '@/constants/i18n';
import { Colors } from '@/constants/theme';
import { Review } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Modal, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface ProductReviewsProps {
    reviews: Review[];
    rating: number;
    reviewsCount: number;
}

export default function ProductReviews({ reviews, rating, reviewsCount }: ProductReviewsProps) {
    const { t } = useTranslation();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Calculate rating distribution
    const distribution = [5, 4, 3, 2, 1].map(star => {
        const count = reviews.filter(r => r.rating === star).length;
        const percentage = reviewsCount > 0 ? (count / reviewsCount) * 100 : 0;
        return { star, count, percentage };
    });

    if (!reviews || reviews.length === 0) {
        return (
            <View className="px-5 py-8 items-center justify-center">
                <Ionicons name="chatbubble-ellipses-outline" size={48} color={Colors.neutral[300]} />
                <Text className="mt-4 text-neutral-500 font-inter text-center">
                    {t('no_reviews')}
                </Text>
            </View>
        );
    }

    return (
        <View className="px-5 py-6">
            {/* Rating Summary with Distribution */}
            <View className="flex-row items-start gap-5 mb-6">
                {/* Average Rating */}
                <View className="items-center">
                    <Text className="text-4xl font-inter-bold text-neutral-900">{rating.toFixed(1)}</Text>
                    <View className="flex-row items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                            <Ionicons
                                key={i}
                                name={i < Math.round(rating) ? "star" : "star-outline"}
                                size={14}
                                color={i < Math.round(rating) ? "#FFB13B" : Colors.neutral[300]}
                            />
                        ))}
                    </View>
                    <Text className="text-xs text-neutral-400 font-inter mt-1">{reviewsCount} ulasan</Text>
                </View>

                {/* Distribution Bars */}
                <View className="flex-1 gap-1.5">
                    {distribution.map(({ star, count, percentage }) => (
                        <View key={star} className="flex-row items-center gap-2">
                            <Text className="text-xs text-neutral-500 font-inter w-4 text-right">{star}</Text>
                            <Ionicons name="star" size={10} color="#FFB13B" />
                            <View className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                                <View
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${percentage}%`,
                                        backgroundColor: '#FFB13B',
                                    }}
                                />
                            </View>
                            <Text className="text-xs text-neutral-400 font-inter w-6">{count}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Separator */}
            <View className="h-px bg-neutral-100 mb-6" />

            {/* Review List */}
            <View className="gap-6">
                {reviews.map((review) => (
                    <View key={review.id} className="border-b border-neutral-100 pb-6 last:border-0 last:pb-0">
                        <View className="flex-row items-center justify-between mb-3">
                            <View className="flex-row items-center gap-3">
                                <View className="w-10 h-10 bg-neutral-100 rounded-full items-center justify-center">
                                    <Text className="text-neutral-600 font-inter-bold">
                                        {(review.user_name || 'A').charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <View>
                                    <Text className="text-neutral-900 font-inter-semibold">
                                        {review.user_name || 'Anonim'}
                                    </Text>
                                    <Text className="text-xs text-neutral-400 font-inter mt-0.5">
                                        {new Date(review.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </Text>
                                </View>
                            </View>
                            <View className="flex-row items-center">
                                {[...Array(5)].map((_, i) => (
                                    <Ionicons
                                        key={i}
                                        name={i < review.rating ? "star" : "star-outline"}
                                        size={14}
                                        color={i < review.rating ? "#FFB13B" : Colors.neutral[300]}
                                    />
                                ))}
                            </View>
                        </View>
                        <Text className="text-neutral-600 font-inter leading-relaxed">
                            {review.comment}
                        </Text>
                        {/* Review Images */}
                        {review.images && review.images.length > 0 && (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
                                <View className="flex-row gap-2">
                                    {review.images.map((imageUrl, imgIdx) => (
                                        <TouchableOpacity
                                            key={imgIdx}
                                            className="w-16 h-16 rounded-lg overflow-hidden border border-neutral-200"
                                            activeOpacity={0.8}
                                            onPress={() => setSelectedImage(imageUrl)}
                                        >
                                            <Image
                                                source={{ uri: imageUrl }}
                                                style={{ width: '100%', height: '100%' }}
                                                contentFit="cover"
                                            />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        )}
                    </View>
                ))}
            </View>

            {/* Full Screen Image Modal */}
            <Modal
                visible={!!selectedImage}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setSelectedImage(null)}
            >
                <SafeAreaView className="flex-1 bg-black/95">
                    <View className="flex-1">
                        <View className="flex-row justify-end p-4">
                            <TouchableOpacity
                                onPress={() => setSelectedImage(null)}
                                className="w-10 h-10 items-center justify-center bg-white/10 rounded-full"
                            >
                                <Ionicons name="close" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                        {selectedImage && (
                            <Image
                                source={{ uri: selectedImage }}
                                style={{ flex: 1, width: '100%', height: '100%' }}
                                contentFit="contain"
                            />
                        )}
                    </View>
                </SafeAreaView>
            </Modal>
        </View>
    );
}
