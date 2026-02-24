import CategoryGridItem from '@/components/category/CategoryGridItem';
import FlashSaleHeader from '@/components/flash-sale/FlashSaleHeader';
import FlashDealCard from '@/components/product/FlashDealCard';
import MostPopularCard from '@/components/product/MostPopularCard';
import RecentlyViewedCard from '@/components/product/RecentlyViewedCard';
import SpecialForYouCard from '@/components/product/SpecialForYouCard';
import { Colors } from '@/constants/theme';
import { fetchCategories, fetchFlashDeals, fetchMostPopular, fetchSpecialForYou } from '@/services/productService';
import { useMedinaStore } from '@/store/useMedinaStore';
import type { Category, Product } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type SectionType = 'history' | 'flash-deals' | 'popular' | 'special' | 'categories';

const SECTION_TITLES: Record<SectionType, string> = {
    history: 'Terakhir Dilihat',
    'flash-deals': 'Flash Sale',
    popular: 'Koleksi Terlaris',
    special: 'Eksplorasi Sarung Alma',
    categories: 'Semua Kategori',
};

export default function SectionScreen() {
    const { type } = useLocalSearchParams<{ type: SectionType }>();
    const router = useRouter();
    const [data, setData] = useState<(Product | Category)[]>([]);
    const [loading, setLoading] = useState(true);
    const title = type ? SECTION_TITLES[type] : 'Products';

    console.log('Rendering SectionScreen type:', type);

    useEffect(() => {
        loadData();
    }, [type]);

    const loadData = async () => {
        if (!type) return;
        setLoading(true);
        try {
            let result: (Product | Category)[] = [];
            switch (type) {
                case 'flash-deals':
                    result = await fetchFlashDeals();
                    break;

                case 'popular':
                    result = await fetchMostPopular();
                    break;
                case 'special':
                    result = await fetchSpecialForYou();
                    break;
                case 'history':
                    // Use store data
                    // Note: This is synchronous, but we're inside an async function so it's fine.
                    // We might want to set data directly if we weren't using a shared loadData structure,
                    // but for consistency we'll just return it.
                    {
                        const historyItems = useMedinaStore.getState().recentlyViewed.items;
                        result = historyItems;
                    }
                    break;
                case 'categories':
                    result = await fetchCategories();
                    break;
            }
            setData(result);
        } catch (error) {
            console.error('Error loading section data:', error);
        } finally {
            setLoading(false);
        }
    };

    const isListLayout = type === 'history';
    const isCategoryGrid = type === 'categories';
    const isFlashDeals = type === 'flash-deals';

    // Split data for flash deals
    const latestDeals = isFlashDeals ? data.slice(0, 5) : [];
    const mainData = isFlashDeals ? data.slice(5) : data;

    const renderItem = ({ item }: { item: Product | Category }) => {
        if (type === 'categories') {
            return <CategoryGridItem item={item as Category} />;
        }

        const product = item as Product;
        switch (type) {
            case 'history':
                return <RecentlyViewedCard item={product} />;
            case 'flash-deals':
                return <FlashDealCard item={product} isGrid={true} />;

            case 'popular':
                return <MostPopularCard item={product} isGrid={true} />;
            case 'special':
                return <SpecialForYouCard item={product} />;
            default:
                return <SpecialForYouCard item={product} />;
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <View className="px-5 py-3 flex-row items-center gap-3 bg-white">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full bg-[#FF6B57] shadow-sm">
                    <Ionicons name="arrow-back" size={24} color={'white'} />
                </TouchableOpacity>
                <Text className="flex-1 text-center text-lg text-neutral-900 font-bold" style={{ fontFamily: 'PlayfairDisplay_700Bold' }}>
                    {type === 'flash-deals' ? 'Our Flash Sale' : title}
                </Text>
                {/* Balance spacing */}
                <View className="w-10" />
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
                </View>
            ) : (
                <FlatList
                    key={isListLayout ? 'list' : isCategoryGrid ? 'cat-grid' : 'grid'}
                    data={mainData}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    ListHeaderComponent={isFlashDeals ? <FlashSaleHeader latestDeals={latestDeals as Product[]} /> : null}
                    numColumns={isListLayout ? 1 : isCategoryGrid ? 3 : 2}
                    contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 0 }} // Remove horizontal padding
                    columnWrapperStyle={isListLayout ? undefined : { gap: 16, paddingHorizontal: 20 }} // Add padding to grid rows
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View className="flex-1 items-center justify-center py-20 px-5">
                            <Ionicons name="cube-outline" size={48} color={Colors.neutral[300]} />
                            <Text className="text-neutral-400 mt-4 text-sm font-inter">No items found</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

