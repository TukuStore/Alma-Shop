
import SpecialForYouCard from '@/components/product/SpecialForYouCard';
import { Colors } from '@/constants/theme';
import { fetchCategoryBySlug, fetchProducts } from '@/services/productService';
import type { Category, Product } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CategoryProductsScreen() {
    const { slug } = useLocalSearchParams<{ slug: string }>();
    const router = useRouter();
    const [category, setCategory] = useState<Category | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (slug) {
            loadData();
        }
    }, [slug]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Fetch category details for the title/header
            const catData = await fetchCategoryBySlug(slug!);
            setCategory(catData);

            // Fetch products for this category
            const prodData = await fetchProducts({ categorySlug: slug });
            setProducts(prodData);
        } catch (error) {
            console.error('Error loading category products:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: Product }) => (
        <SpecialForYouCard item={item} />
    );

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="px-5 py-3 flex-row items-center gap-3 border-b border-neutral-100 bg-white">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center -ml-2">
                    <Ionicons name="arrow-back" size={24} color={Colors.text.DEFAULT} />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-lg text-neutral-900" style={{ fontFamily: 'PlayfairDisplay_700Bold' }}>
                        {loading ? 'Loading...' : category?.name || 'Category'}
                    </Text>
                    {!loading && category && (
                        <Text className="text-xs text-neutral-500 font-inter">
                            {products.length} Products
                        </Text>
                    )}
                </View>
                <TouchableOpacity onPress={() => router.push('/search')} className="w-10 h-10 items-center justify-center">
                    <Ionicons name="search-outline" size={24} color={Colors.text.DEFAULT} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
                </View>
            ) : (
                <FlatList
                    data={products}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                    columnWrapperStyle={{ gap: 16 }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View className="flex-1 items-center justify-center py-20 px-10">
                            <View className="w-16 h-16 bg-neutral-50 rounded-full items-center justify-center mb-4">
                                <Ionicons name="cube-outline" size={32} color={Colors.neutral[300]} />
                            </View>
                            <Text className="text-neutral-900 font-inter-medium text-lg text-center mb-2">
                                No Products Found
                            </Text>
                            <Text className="text-neutral-500 font-inter text-center">
                                We likely haven't added products to {category?.name} yet. Check back soon!
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}
