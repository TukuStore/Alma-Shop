import SpecialForYouCard from '@/components/product/SpecialForYouCard';
import EmptySearchIllustration from '@/components/search/EmptySearchIllustration';
import SearchFilterModal, { FilterState } from '@/components/search/SearchFilterModal';
import { Colors } from '@/constants/theme';
import { fetchCategories, fetchProducts } from '@/services/productService';
import type { Product, ProductFilter } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const POPULAR_SEARCHES = ['Songket', 'Batik', 'Sutra', 'Goyor', 'Tenun', 'Jacquard', 'Polos'];

export default function SearchScreen() {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState<string | null>(null);
    const [results, setResults] = useState<Product[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [filterVisible, setFilterVisible] = useState(false);
    const inputRef = useRef<TextInput>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Load categories for filter
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const cats = await fetchCategories();
                setCategories(cats);
            } catch (err) {
                console.error('Failed to load categories:', err);
            }
        };
        loadCategories();
    }, []);

    const handleApplyFilter = (filters: FilterState) => {
        console.log('Applied filters:', filters);
        const minPrice = filters.minPrice ? parseFloat(filters.minPrice) : undefined;
        const maxPrice = filters.maxPrice ? parseFloat(filters.maxPrice) : undefined;

        // Map Category Name to Slug - use dynamic categories
        const categoryMap: Record<string, string> = { 'All': '' };
        categories.forEach((cat) => {
            categoryMap[cat.name] = cat.slug;
        });

        const categorySlug = filters.category !== 'All' ? categoryMap[filters.category] : undefined;

        performSearch(query, {
            minPrice,
            maxPrice,
            categorySlug,
            rating: filters.rating || undefined,
            sortBy: filters.sortBy || 'newest',
        });

        // Update local state for display if needed (optional, or just rely on results)
        if (filters.category !== 'All') {
            setCategory(filters.category);
        } else {
            setCategory(null);
        }
    };

    const performSearch = useCallback(async (text: string, filters?: Partial<ProductFilter>) => {
        // If just text search and text is short, clear (unless filtering)
        if (!filters && text.trim().length < 2) {
            setResults([]);
            setHasSearched(false);
            return;
        }

        setIsSearching(true);
        setHasSearched(true);
        try {
            // Use fetchProducts which supports filters
            const data = await fetchProducts({
                search: text.trim(),
                ...filters,
                sortBy: 'newest', // Default sort
                page: 1,
                limit: 20
            });
            setResults(data);
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setIsSearching(false);
        }
    }, []);

    const handleChangeText = (text: string) => {
        setQuery(text);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => performSearch(text), 400);
    };

    const handlePopularSearch = (term: string) => {
        setQuery(term);
        performSearch(term);
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            {/* Header: Back + Search + Filter */}
            <View className="px-5 pt-2 pb-3 flex-row items-center gap-3 border-b border-neutral-100">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color={Colors.text.DEFAULT} />
                </TouchableOpacity>
                <View className="flex-1 flex-row items-center bg-white border border-neutral-200 rounded-full px-4 h-10 overflow-hidden shadow-sm">
                    <Ionicons name="search-outline" size={18} color={Colors.neutral[400]} />
                    <TextInput
                        ref={inputRef}
                        className="flex-1 py-0 ml-3 text-sm text-neutral-900"
                        style={{ fontFamily: 'Inter_400Regular', height: 40 }}
                        placeholder="Cari produk..."
                        placeholderTextColor={Colors.neutral[400]}
                        value={query}
                        onChangeText={handleChangeText}
                        autoFocus
                        returnKeyType="search"
                        onSubmitEditing={() => performSearch(query)}
                    />
                    {query.length > 0 && (
                        <TouchableOpacity
                            onPress={() => {
                                setQuery('');
                                setResults([]);
                                setHasSearched(false);
                                inputRef.current?.focus();
                            }}
                        >
                            <Ionicons name="close-circle" size={18} color={Colors.neutral[400]} />
                        </TouchableOpacity>
                    )}
                    <Ionicons name="mic-outline" size={20} color={Colors.neutral[400]} style={{ marginLeft: 8 }} />
                </View>
                <TouchableOpacity
                    className="w-10 h-10 items-center justify-center rounded-full bg-primary-DEFAULT"
                    onPress={() => setFilterVisible(true)}
                >
                    <Ionicons name="camera" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Content */}
            {!hasSearched ? (
                /* Initial State: Popular Searches */
                <View className="px-5 mt-4">
                    <Text
                        className="text-base text-neutral-900 mb-4"
                        style={{ fontFamily: 'Inter_600SemiBold' }}
                    >
                        Pencarian Populer
                    </Text>
                    <View className="flex-row flex-wrap gap-2.5">
                        {POPULAR_SEARCHES.map((term) => (
                            <TouchableOpacity
                                key={term}
                                className="bg-white border border-neutral-200 rounded-full px-4 py-2"
                                onPress={() => handlePopularSearch(term)}
                            >
                                <Text
                                    className="text-xs text-neutral-600"
                                    style={{ fontFamily: 'Inter_500Medium' }}
                                >
                                    {term}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            ) : isSearching ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
                </View>
            ) : results.length > 0 ? (
                /* Search Results Grid */
                <FlatList
                    data={results}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    columnWrapperStyle={{ gap: 16 }}
                    contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                    renderItem={({ item }) => <SpecialForYouCard item={item} />}
                    ListHeaderComponent={
                        <View className="mb-4 flex-row items-center justify-between">
                            <View className="flex-1 flex-row items-center flex-wrap">
                                <Text className="text-neutral-400 text-base font-inter mr-2">
                                    {category ? 'Menampilkan kategori' : 'Menampilkan hasil pencarian'}
                                </Text>
                                {category ? (
                                    <View className="flex-row items-center bg-white border border-neutral-100 rounded-full pl-1.5 pr-2 py-1 shadow-sm gap-1.5">
                                        <View className="w-5 h-5 bg-neutral-50 rounded-full items-center justify-center">
                                            <Ionicons name="shirt-outline" size={12} color={Colors.neutral[600]} />
                                        </View>
                                        <Text className="text-neutral-900 text-sm font-inter-medium">{category}</Text>
                                        <TouchableOpacity onPress={() => setCategory(null)}>
                                            <Ionicons name="close-circle" size={16} color={Colors.neutral[300]} />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <Text className="text-neutral-900 text-base font-inter-semibold">
                                        “{query}”
                                    </Text>
                                )}
                            </View>
                            <View className="flex-row items-center">
                                {!category && (
                                    <TouchableOpacity onPress={() => {
                                        setQuery('');
                                        setResults([]);
                                        setHasSearched(false);
                                    }}>
                                        <Ionicons name="close-circle" size={24} color={Colors.neutral[300]} />
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity onPress={() => setFilterVisible(true)} className="ml-2">
                                    <Ionicons name="funnel-outline" size={24} color={Colors.neutral[300]} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    }
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                /* No Results State */
                <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, paddingBottom: 100 }}>
                    {/* Header with X icon */}
                    <View className="flex-row items-center justify-between mb-8">
                        <View className="flex-1 flex-row flex-wrap items-center gap-1">
                            <Text className="text-neutral-400 text-base font-inter leading-6">Menampilkan hasil pencarian</Text>
                            <Text className="text-neutral-900 text-base font-inter-semibold leading-6">
                                “{query}”
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <TouchableOpacity onPress={() => {
                                setQuery('');
                                setResults([]);
                                setHasSearched(false);
                            }}>
                                <Ionicons name="close-circle" size={24} color={Colors.neutral[300]} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setFilterVisible(true)} className="ml-2">
                                <Ionicons name="funnel-outline" size={24} color={Colors.neutral[300]} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="flex-1 items-center justify-center gap-8">
                        <EmptySearchIllustration />

                        <View className="items-center gap-2">
                            <Text className="text-neutral-900 text-xl font-inter-semibold leading-7 text-center">
                                Oops! Kami tidak menemukan apapun.
                            </Text>
                            <Text className="text-neutral-400 text-sm font-inter leading-5 text-center px-4">
                                Sepertinya tidak ada produk yang cocok dengan pencarian Anda. Coba kata kunci lain atau jelajahi kategori populer di bawah.
                            </Text>
                        </View>

                        <View className="self-stretch bg-neutral-50 rounded-2xl p-4 gap-2">
                            <Text className="text-neutral-700 text-xs font-inter-medium leading-4 mb-1">Coba tips berikut :</Text>
                            <View className="gap-1 pl-1">
                                <Text className="text-neutral-500 text-xs font-inter leading-4">• Periksa kesalahan ketik</Text>
                                <Text className="text-neutral-500 text-xs font-inter leading-4">• Gunakan kata yang lebih umum</Text>
                                <Text className="text-neutral-500 text-xs font-inter leading-4">• Jelajahi kategori atau tren pencarian</Text>
                            </View>
                        </View>

                        <View className="flex-row gap-4 mt-2">
                            <TouchableOpacity
                                className="px-6 py-3 rounded-full border border-primary"
                                onPress={() => {
                                    setQuery('');
                                    setHasSearched(false);
                                }}
                            >
                                <Text className="text-primary text-sm font-inter-medium">Lihat yang Populer</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="px-8 py-3 rounded-full bg-primary shadow-sm"
                                onPress={() => {
                                    setQuery('');
                                    setResults([]);
                                    setHasSearched(false);
                                    inputRef.current?.focus();
                                }}
                            >
                                <Text className="text-white text-sm font-inter-medium">Coba Lagi</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            )}

            <SearchFilterModal
                visible={filterVisible}
                onClose={() => setFilterVisible(false)}
                onApply={handleApplyFilter}
            />
        </SafeAreaView>
    );
}
