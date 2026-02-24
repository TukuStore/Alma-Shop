
import EmptyWishlistIllustration from '@/components/wishlist/EmptyWishlistIllustration';
import { Colors } from '@/constants/theme';
import { formatPrice } from '@/lib/currency';
import { createOptimizedFlatListProps } from '@/lib/performance';
import { fetchWishlist, removeFromWishlist } from '@/services/wishlistService';
import { useMedinaStore } from '@/store/useMedinaStore';
import type { WishlistItem } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState, useMemo, memo } from 'react';
import { ActivityIndicator, Alert, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WishlistScreen() {
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const isAuthenticated = useMedinaStore((s) => s.auth.isAuthenticated);

    const loadWishlist = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            setLoading(true);
            const data = await fetchWishlist();
            setItems(data);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useFocusEffect(
        useCallback(() => {
            loadWishlist();
        }, [loadWishlist])
    );

    const handleRemove = useCallback(async (productId: string) => {
        try {
            await removeFromWishlist(productId);
            setItems((prev) => prev.filter((item) => item.product_id !== productId));
        } catch (error) {
            Alert.alert('Error', 'Failed to remove item from wishlist');
        }
    }, []);

    const WishlistCard = memo(({ item }: { item: WishlistItem }) => {
        const product = item.product;
        if (!product) return null;

        return (
            <TouchableOpacity
                className="flex-1 bg-neutral-50 rounded-2xl mb-4 overflow-hidden"
                onPress={() => router.push(`/product/${product.id}`)}
                activeOpacity={0.7}
                style={{ maxWidth: '48%' }}
            >
                {/* Image & Heart Button */}
                <View className="h-40 w-full relative bg-neutral-100">
                    <Image
                        source={{ uri: product.images?.[0] }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                        transition={200}
                    />
                    <TouchableOpacity
                        onPress={(e) => {
                            e.stopPropagation();
                            Alert.alert('Remove', 'Remove this item from wishlist?', [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Remove', style: 'destructive', onPress: () => handleRemove(item.product_id) }
                            ]);
                        }}
                        className="absolute top-2.5 right-2.5 w-8 h-8 bg-white rounded-full items-center justify-center"
                    >
                        <Ionicons name="heart" size={16} color={Colors.error} />
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <View className="p-3 gap-2">
                    <Text
                        className="text-neutral-900 text-sm font-inter-medium leading-5 h-10"
                        numberOfLines={2}
                    >
                        {product.name}
                    </Text>

                    <View className="flex-row items-center gap-2">
                        <Text className="flex-1 text-neutral-400 text-sm font-inter leading-5">
                            {formatPrice(product.price)}
                        </Text>
                        <View className="flex-row items-center gap-1">
                            <Ionicons name="star" size={14} color={Colors.warning} />
                            <Text className="text-neutral-900 text-xs font-inter leading-4">
                                {product.rating?.toFixed(1) ?? '0.0'}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }, (prev, next) => prev.item.id === next.item.id);

    if (!isAuthenticated) {
        return (
            <SafeAreaView className="flex-1 bg-bg items-center justify-center p-8">
                <Ionicons name="heart-outline" size={64} color={Colors.text.muted} />
                <Text className="text-lg text-text font-bold mt-4" style={{ fontFamily: 'PlayfairDisplay_700Bold' }}>
                    Sign in to view your wishlist
                </Text>
                <TouchableOpacity
                    onPress={() => router.push('/(auth)/login')}
                    className="bg-primary px-8 py-3 rounded-xl mt-6"
                >
                    <Text className="text-white font-bold">Sign In</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            {/* Header - Figma Frame 37302 */}
            <View className="px-6 py-4 flex-row items-center justify-between border-b border-neutral-100 bg-white">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 items-center justify-center bg-primary rounded-full"
                >
                    <Ionicons name="arrow-back" size={20} color="white" />
                </TouchableOpacity>

                <Text className="text-2xl text-neutral-900 font-inter-semibold text-center flex-1">
                    My Wishlist
                </Text>

                {/* Placeholder for symmetry (right button opacity 0) */}
                <View className="w-10 h-10 opacity-0 bg-primary/10 rounded-full border border-primary items-center justify-center">
                    <Ionicons name="add" size={20} color={Colors.primary.DEFAULT} />
                </View>
            </View>

            {/* Search Bar - Figma Frame 37062 */}
            <View className="px-6 py-6">
                <View className="flex-row items-center bg-white rounded-full border border-neutral-200 px-4 py-2.5 gap-3">
                    <Ionicons name="search" size={20} color={Colors.text.muted} />
                    <TextInput
                        placeholder="Search product here"
                        placeholderTextColor={Colors.text.muted}
                        className="flex-1 text-sm font-inter text-neutral-900 leading-5"
                    />
                    <Ionicons name="mic-outline" size={20} color={Colors.text.muted} />
                </View>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
                </View>
            ) : (
                <FlatList
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: 'space-between' }}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
                    ListEmptyComponent={
                        <View className="flex-1 items-center justify-center min-h-[500px]">
                            {/* Illustration */}
                            <EmptyWishlistIllustration />

                            {/* Text Content */}
                            <View className="items-center mt-8 px-8">
                                <Text className="text-xl font-inter-semibold text-neutral-900 text-center mb-3">
                                    You haven't added any items to your wishlist yet.
                                </Text>
                                <Text className="text-sm font-inter text-neutral-500 text-center mb-8 leading-6">
                                    Tap the heart icon on any card product to save it here, let's add your wishlist.
                                </Text>

                                {/* Button */}
                                <TouchableOpacity
                                    onPress={() => router.push('/')}
                                    className="bg-primary px-8 py-3.5 rounded-full shadow-sm shadow-primary/30"
                                >
                                    <Text className="text-white font-inter-semibold text-base">
                                        Explore Wishlist
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    }
                    keyExtractor={(item) => item.id}
                    {...createOptimizedFlatListProps({
                        data: items,
                        renderItem: ({ item }) => <WishlistCard item={item} />,
                        itemHeight: 280,
                    })}
                />
            )}
        </SafeAreaView>
    );
}
