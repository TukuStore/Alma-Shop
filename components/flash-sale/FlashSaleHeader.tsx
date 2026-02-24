import { Colors } from '@/constants/theme';
import type { Product } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { FlatList, Text, TextInput, View } from 'react-native';
import FlashDealCard from '../product/FlashDealCard';
import FlashSaleBanner from './FlashSaleBanner';
import FlashSaleCountdown from './FlashSaleCountdown';

type Props = {
    latestDeals?: Product[];
};

export default function FlashSaleHeader({ latestDeals = [] }: Props) {
    return (
        <View className="bg-white pb-4">
            {/* Search Bar */}
            <View className="px-5 mb-2 mt-4">
                <View
                    className="h-[48px] bg-white border border-neutral-100 rounded-full flex-row items-center px-4 gap-3 shadow-sm"
                    style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}
                >
                    <Ionicons name="search-outline" size={20} color={Colors.neutral[400]} />
                    <TextInput
                        className="flex-1 font-inter text-sm text-neutral-900"
                        placeholder="Search Product Here"
                        placeholderTextColor={Colors.neutral[400]}
                    />
                    <Ionicons name="mic-outline" size={20} color={Colors.neutral[400]} />
                </View>
            </View>

            {/* Banner - Full Width */}
            <FlashSaleBanner />

            {/* Countdown */}
            <View className="px-5">
                <FlashSaleCountdown />
            </View>

            {/* Latest Deals Section */}
            {latestDeals.length > 0 && (
                <View className="mt-2 text-left">
                    <Text className="text-lg font-bold font-inter-bold text-neutral-900 px-5 mb-4 text-left">
                        Latest Deals
                    </Text>
                    <FlatList
                        horizontal
                        data={latestDeals}
                        renderItem={({ item }) => (
                            <View className="w-[160px] ml-5 last:mr-5">
                                <FlashDealCard item={item} />
                            </View>
                        )}
                        keyExtractor={(item) => item.id}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingRight: 20 }}
                    />
                </View>
            )}

            {/* Other Deals Title */}
            <View className="mt-8 px-5">
                <Text className="text-lg font-bold font-inter-bold text-neutral-900 text-left">
                    Other Flash Deals
                </Text>
            </View>
        </View>
    );
}
