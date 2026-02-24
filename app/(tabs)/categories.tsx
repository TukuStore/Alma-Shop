import CategorySection from '@/components/category/CategorySection';
import { useTranslation } from '@/constants/i18n';
import { Colors } from '@/constants/theme';
import { createOptimizedFlatListProps } from '@/lib/performance';
import { fetchCategories } from '@/services/productService';
import type { Category } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CategoriesScreen() {
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { t } = useTranslation();

    const loadData = useCallback(async () => {
        try {
            const data = await fetchCategories();
            setAllCategories(data);
            setFilteredCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredCategories(allCategories);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = allCategories.filter(cat =>
                cat.name.toLowerCase().includes(query)
            );
            setFilteredCategories(filtered);
        }
    }, [searchQuery, allCategories]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData();
    }, [loadData]);

    const renderItem = useCallback(({ item, index }: { item: Category; index: number }) => (
        <CategorySection category={item} index={index} />
    ), []);

    const keyExtractor = useCallback((item: Category) => item.id, []);

    const ListEmptyComponent = useMemo(() => (
        <View className="items-center justify-center py-20 px-10">
            {!isLoading && (
                <>
                    <View className="w-16 h-16 bg-neutral-50 rounded-full items-center justify-center mb-4">
                        <Ionicons name="search" size={32} color={Colors.neutral[300]} />
                    </View>
                    <Text className="text-neutral-900 font-inter-medium text-lg text-center mb-2">
                        {t('no_categories_found')}
                    </Text>
                    <Text className="text-neutral-500 font-inter text-center">
                        {t('no_categories_match')} "{searchQuery}"
                    </Text>
                </>
            )}
        </View>
    ), [isLoading, searchQuery, t]);

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            {/* Header Section */}
            <View className="px-5 pt-2 pb-4 bg-white border-b border-neutral-100 z-10">
                {/* Title Row */}
                <View className="flex-row items-center justify-between mb-4">
                    <TouchableOpacity
                        className="w-10 h-10 bg-primary rounded-full items-center justify-center active:bg-primary/90"
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={20} color="white" />
                    </TouchableOpacity>

                    <Text className="text-xl text-neutral-900 font-inter-semibold flex-1 text-center">
                        {t('all_categories')}
                    </Text>

                    {/* Placeholder for symmetry or other action */}
                    <View className="w-10" />
                </View>

                {/* Search Bar */}
                <View className="flex-row items-center bg-white border border-neutral-200 rounded-full px-4 h-12 shadow-sm">
                    <Ionicons name="search-outline" size={20} color={Colors.neutral[400]} />
                    <TextInput
                        className="flex-1 ml-3 text-neutral-900 font-inter text-sm h-full"
                        placeholder={t('search_categories_placeholder')}
                        placeholderTextColor={Colors.neutral[400]}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 ? (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={18} color={Colors.neutral[400]} />
                        </TouchableOpacity>
                    ) : (
                        <Ionicons name="mic-outline" size={20} color={Colors.neutral[400]} />
                    )}
                </View>
            </View>

            {/* Content List */}
            <FlatList
                {...createOptimizedFlatListProps({
                    data: filteredCategories,
                    renderItem,
                    itemHeight: 80,
                })}
                keyExtractor={keyExtractor}
                contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary.DEFAULT} />
                }
                ListEmptyComponent={ListEmptyComponent}
            />
        </SafeAreaView>
    );
}
