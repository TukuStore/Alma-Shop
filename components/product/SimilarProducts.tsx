import { getProductImages } from '@/constants/local-images';
import { Colors } from '@/constants/theme';
import { formatPrice } from '@/lib/currency';
import { useMedinaStore } from '@/store/useMedinaStore';
import type { Product } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface SimilarProductsProps {
    products: Product[];
    categoryName?: string;
}

function SimilarProductCard({ item }: { item: Product }) {
    const router = useRouter();
    const isInWishlist = useMedinaStore((s) => s.isInWishlist(item.id));
    const toggleWishlist = useMedinaStore((s) => s.toggleWishlist);
    const images = getProductImages(item.name, item.images || []);
    const imageSource = images.length > 0 ? images[0] : null;

    return (
        <TouchableOpacity
            className="w-[150px] mr-4 bg-white rounded-3xl p-3 shadow-sm border border-neutral-100"
            activeOpacity={0.8}
            onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id } })}
        >
            <View
                className="w-full rounded-2xl overflow-hidden bg-neutral-50 mb-3"
                style={{ aspectRatio: 1 }}
            >
                {imageSource ? (
                    <Image
                        source={typeof imageSource === 'string' ? { uri: imageSource } : imageSource}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                    />
                ) : (
                    <View className="flex-1 items-center justify-center">
                        <Ionicons name="image-outline" size={48} color={Colors.neutral[300]} />
                    </View>
                )}
                <TouchableOpacity
                    className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full items-center justify-center shadow-sm"
                    activeOpacity={0.7}
                    onPress={() => toggleWishlist(item.id)}
                    style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3 }}
                >
                    <Ionicons
                        name={isInWishlist ? "heart" : "heart-outline"}
                        size={16}
                        color={isInWishlist ? "#EF4444" : Colors.neutral[900]}
                    />
                </TouchableOpacity>
            </View>
            <Text
                className="text-sm text-neutral-900 font-inter-semibold px-1"
                style={{ lineHeight: 20 }}
                numberOfLines={2}
            >
                {item.name}
            </Text>
            <View className="flex-row items-center justify-between mt-2 px-1 pb-1">
                <Text className="flex-1 text-sm text-primary font-inter-bold">
                    {formatPrice(item.price)}
                </Text>
                <View className="flex-row items-center gap-1">
                    <Ionicons name="star" size={14} color="#FFB13B" />
                    <Text className="text-xs text-neutral-600 font-inter-medium">
                        {item.rating?.toFixed(1) || '4.7'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

export default function SimilarProducts({ products, categoryName }: SimilarProductsProps) {
    if (!products || products.length === 0) return null;

    return (
        <View className="bg-neutral-50 pt-8 pb-10 mt-6 border-t border-neutral-100">
            <View className="px-5 mb-5 flex-row justify-between items-center">
                <Text
                    className="text-[20px] text-neutral-900"
                    style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
                >
                    Pilihan {categoryName || 'Produk'} Lainnya
                </Text>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20 }}
            >
                {products.map((product) => (
                    <SimilarProductCard key={product.id} item={product} />
                ))}
            </ScrollView>
        </View>
    );
}
