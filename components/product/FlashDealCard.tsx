
import { getProductImages } from '@/constants/local-images';
import { Colors } from '@/constants/theme';
import { formatPrice } from '@/lib/currency';
import type { Product } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

type FlashDealCardProps = {
    item: Product;
    soldBarColor?: string;
    soldBarBg?: string;
    isGrid?: boolean;
};

export default function FlashDealCard({
    item,
    soldBarColor = '#00D79E',
    soldBarBg = '#CCF7EC',
    isGrid = false,
}: FlashDealCardProps) {
    const router = useRouter();
    const sold = item.sold_count || 0;
    const total = item.total_stock_for_deal || 100;
    const soldPercentage = Math.min((sold / total) * 100, 100);
    const images = getProductImages(item.name, item.images || []);
    const imageSource = images.length > 0 ? images[0] : null;

    // Calculate discount percentage
    const discount = item.original_price && item.price < item.original_price
        ? Math.round(((item.original_price - item.price) / item.original_price) * 100)
        : 0;

    // Dynamic color logic if not provided
    let finalBarColor = soldBarColor;
    let finalBarBg = soldBarBg;

    if (soldBarColor === '#00D79E' && soldBarBg === '#CCF7EC') {
        if (soldPercentage >= 85) { // Fixed: using soldPercentage directly
            finalBarColor = '#FF3E38'; // danger
            finalBarBg = '#FFD8D7';
        } else if (soldPercentage >= 40) { // Fixed: using soldPercentage directly
            finalBarColor = '#FFB13B'; // warning
            finalBarBg = '#FFF1D8';
        }
    }

    return (
        <TouchableOpacity
            className={isGrid ? "flex-1 mb-4" : "w-[150px]"}
            activeOpacity={0.8}
            onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id } })}
        >
            {/* Image */}
            <View
                className={isGrid
                    ? "w-full aspect-square rounded-2xl overflow-hidden items-center justify-center bg-neutral-50 relative"
                    : "w-[150px] h-[160px] rounded-[20px] overflow-hidden items-center justify-center bg-neutral-50 border border-neutral-100 relative"
                }
            >
                {imageSource ? (
                    <Image
                        source={typeof imageSource === 'string' ? { uri: imageSource } : imageSource}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                    />
                ) : (
                    <Ionicons name="image-outline" size={48} color={Colors.neutral[300]} />
                )}

                {/* Discount Badge */}
                {discount > 0 && (
                    <View className="absolute top-2 left-2 bg-red-500 rounded px-1.5 py-0.5 z-10">
                        <Text className="text-[10px] font-bold text-white font-inter-bold">
                            -{discount}%
                        </Text>
                    </View>
                )}

                {/* Wishlist */}
                <TouchableOpacity
                    className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full items-center justify-center shadow-sm"
                    activeOpacity={0.7}
                >
                    <Ionicons name="heart-outline" size={16} color={Colors.neutral[900]} />
                </TouchableOpacity>
            </View>

            {/* Product name */}
            <Text
                className="mt-2 text-sm text-neutral-900 font-inter-medium"
                style={{ lineHeight: 20 }}
                numberOfLines={2}
            >
                {item.name}
            </Text>

            {/* Price + Review */}
            <View className="flex-row items-center justify-between mt-1">
                <View className="gap-0.5 flex-1">
                    <Text
                        className="text-sm text-neutral-900 font-bold font-inter-bold"
                        style={{ lineHeight: 20 }}
                    >
                        {formatPrice(item.price)}
                    </Text>
                    {item.original_price && item.original_price > item.price && (
                        <Text
                            className="text-[10px] text-neutral-400 line-through font-inter"
                            style={{ lineHeight: 14 }}
                        >
                            {formatPrice(item.original_price)}
                        </Text>
                    )}
                </View>
                <View className="flex-row items-center gap-1">
                    <Ionicons name="star" size={12} color="#FFB13B" />
                    <Text className="text-xs text-neutral-700 font-inter-medium" style={{ lineHeight: 16 }}>
                        {item.rating?.toFixed(1) || '4.5'}
                    </Text>
                </View>
            </View>

            {/* Sold Progress Bar */}
            <View
                className="mt-2 h-4 w-full rounded-full overflow-hidden relative border border-neutral-100"
                style={{ backgroundColor: finalBarBg }}
            >
                <View
                    className="absolute left-0 top-0 bottom-0 rounded-full"
                    style={{
                        backgroundColor: finalBarColor,
                        width: `${soldPercentage}%`,
                    }}
                />
                <Text
                    className="text-[10px] text-neutral-700 font-inter-medium absolute w-full text-center"
                    style={{ lineHeight: 16 }}
                >
                    {sold} Sold
                </Text>
            </View>
        </TouchableOpacity>
    );
}
