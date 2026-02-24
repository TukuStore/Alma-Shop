
import { Colors } from '@/constants/theme';
import { formatPrice } from '@/lib/currency';
import { fetchProducts } from '@/services/productService';
import { useMedinaStore } from '@/store/useMedinaStore';
import type { Category, Product } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

interface CategorySectionProps {
    category: Category;
    index: number;
}

export default function CategorySection({ category, index }: CategorySectionProps) {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Mock stats based on category ID to be deterministic
    const productCount = Math.floor((category.id.charCodeAt(0) * 100) + (category.id.charCodeAt(1) * 10));
    const rating = (4.0 + (category.id.charCodeAt(0) % 10) / 10).toFixed(1);
    const reviewCount = Math.floor(productCount * 15.5).toLocaleString();

    useEffect(() => {
        let isMounted = true;

        async function loadProducts() {
            try {
                // Fetch only 5 products for preview
                const data = await fetchProducts({
                    categorySlug: category.slug,
                    limit: 5
                });
                if (isMounted) {
                    setProducts(data);
                }
            } catch (err) {
                console.warn('Failed to load category products:', err);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }

        loadProducts();
        return () => { isMounted = false; };
    }, [category.slug]);

    const handleViewAll = () => {
        router.push({
            pathname: '/product/category/[slug]',
            params: { slug: category.slug }
        });
    };

    if (isLoading || products.length === 0) {
        // Render nothing or skeleton if loading/empty? 
        // Design implies we show categories. If empty, maybe skip rendering this section?
        // For now, render skeleton or just return null if loaded and empty.
        if (!isLoading && products.length === 0) return null;

        // Simple loading skeleton structure could go here, but returning null for now to avoid flicker of emptiness
        return null;
    }

    return (
        <View className="mb-8">
            {/* Header Section */}
            <View className="flex-row items-center justify-between px-5 mb-4">
                <View className="flex-row items-center flex-1 gap-3">
                    <View className="w-12 h-12 bg-neutral-50 rounded-full items-center justify-center overflow-hidden border border-neutral-100">
                        {category.image_url ? (
                            <Image source={{ uri: category.image_url }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                        ) : (
                            <Ionicons name="grid-outline" size={20} color={Colors.neutral[400]} />
                        )}
                    </View>
                    <View>
                        <Text className="text-lg text-neutral-900 font-inter-semibold">
                            {category.name}
                        </Text>
                        <Text className="text-xs text-neutral-500 font-inter">
                            {productCount} Products
                        </Text>
                    </View>
                </View>

                <View className="items-end">
                    <View className="flex-row items-center gap-1">
                        <Ionicons name="star" size={16} color="#FFB13B" />
                        <Text className="text-sm text-neutral-900 font-inter-semibold">{rating}</Text>
                    </View>
                    <Text className="text-[10px] text-neutral-400 font-inter">
                        ({reviewCount}+)
                    </Text>
                </View>
            </View>

            {/* Horizontal Product List */}
            <FlatList
                data={products}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <CategoryProductCard item={item} />}
            />

            {/* View All Button */}
            <View className="px-5 mt-4">
                <TouchableOpacity
                    className="w-full border border-primary/20 rounded-full py-3 flex-row items-center justify-center active:bg-primary/5"
                    onPress={handleViewAll}
                >
                    <Text className="text-sm text-primary font-inter-medium mr-1">
                        View All Products
                    </Text>
                    <Ionicons name="arrow-forward" size={16} color={Colors.primary.DEFAULT} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

function CategoryProductCard({ item }: { item: Product }) {
    const router = useRouter();
    const isInWishlist = useMedinaStore((s) => s.isInWishlist(item.id));
    const toggleWishlist = useMedinaStore((s) => s.toggleWishlist);

    return (
        <TouchableOpacity
            className="w-[160px]"
            activeOpacity={0.8}
            onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id } })}
        >
            <View className="w-full aspect-square rounded-2xl bg-neutral-50 overflow-hidden mb-2 border border-neutral-100/50">
                <Image
                    source={{ uri: item.images[0] }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                />
                <TouchableOpacity
                    className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full items-center justify-center shadow-sm"
                    onPress={() => toggleWishlist(item.id)}
                >
                    <Ionicons
                        name={isInWishlist ? "heart" : "heart-outline"}
                        size={14}
                        color={isInWishlist ? "#EF4444" : Colors.neutral[900]}
                    />
                </TouchableOpacity>
            </View>

            <Text
                className="text-sm text-neutral-900 font-inter-medium leading-5 mb-1"
                numberOfLines={1}
            >
                {item.name}
            </Text>

            <View className="flex-row items-center justify-between">
                <Text className="text-sm text-neutral-500 font-inter">
                    {formatPrice(item.price)}
                </Text>
                <View className="flex-row items-center gap-1">
                    <Ionicons name="star" size={12} color="#FFB13B" />
                    <Text className="text-xs text-neutral-900 font-inter-medium">
                        {item.rating?.toFixed(1) || '4.5'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}
