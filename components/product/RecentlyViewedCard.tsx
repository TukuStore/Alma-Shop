
import { getProductImages } from '@/constants/local-images';
import { Colors } from '@/constants/theme';
import { formatPrice } from '@/lib/currency';
import type { Product } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Text, TouchableOpacity, View } from 'react-native';

export default function RecentlyViewedCard({ item }: { item: Product }) {
    const images = getProductImages(item.name, item.images || []);
    const imageSource = images.length > 0 ? images[0] : null;
    const reviewCount = item.reviews_count ?? (Array.isArray(item.reviews) ? item.reviews.length : 0);

    return (
        <View className="w-[320px] flex-row gap-4 items-center mb-4 bg-white p-2 rounded-xl mr-4" style={{ elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 }}>
            {/* Image */}
            <View
                className="w-[120px] h-[120px] rounded-2xl overflow-hidden"
                style={{ backgroundColor: Colors.neutral[50] }}
            >
                {imageSource ? (
                    <Image
                        source={typeof imageSource === 'string' ? { uri: imageSource } : imageSource}
                        style={{ width: 120, height: 120 }}
                        contentFit="cover"
                    />
                ) : (
                    <View className="flex-1 items-center justify-center">
                        <Ionicons name="image-outline" size={48} color={Colors.neutral[300]} />
                    </View>
                )}
                <TouchableOpacity
                    className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full items-center justify-center"
                    activeOpacity={0.7}
                >
                    <Ionicons name="heart-outline" size={16} color={Colors.neutral[900]} />
                </TouchableOpacity>
            </View>

            {/* Info */}
            <View className="flex-1 gap-4">
                <Text
                    className="text-base text-neutral-900 font-inter-medium"
                    style={{ lineHeight: 22 }}
                    numberOfLines={1}
                >
                    {item.name}
                </Text>
                <View className="flex-row items-center gap-2">
                    <View className="flex-1 gap-2">
                        {/* Star + Reviews */}
                        <View className="flex-row items-center gap-2">
                            <Ionicons name="star" size={16} color="#FFB13B" />
                            <Text className="text-sm text-neutral-900 font-inter" style={{ lineHeight: 20 }}>
                                {item.rating?.toFixed(1) || '4.5'}
                            </Text>
                            <Text className="text-sm text-neutral-400 font-inter" style={{ lineHeight: 20 }}>
                                ({reviewCount.toLocaleString()} reviews)
                            </Text>
                        </View>
                        {/* Price */}
                        <View className="flex-row items-center gap-1">
                            <Text className="text-sm text-neutral-900 font-inter" style={{ lineHeight: 20 }}>
                                {formatPrice(item.price)}
                            </Text>
                            {item.original_price && item.original_price > item.price && (
                                <Text className="text-xs text-neutral-300 line-through" style={{ lineHeight: 17 }}>
                                    {formatPrice(item.original_price)}
                                </Text>
                            )}
                        </View>
                    </View>
                    {/* Cart Button */}
                    <TouchableOpacity
                        className="w-10 h-10 rounded-full items-center justify-center border"
                        style={{ borderColor: Colors.primary.DEFAULT }}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="cart-outline" size={20} color={Colors.primary.DEFAULT} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
