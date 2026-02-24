
import { getProductImages } from '@/constants/local-images';
import { Colors } from '@/constants/theme';
import { formatPrice } from '@/lib/currency';
import { useMedinaStore } from '@/store/useMedinaStore';
import type { Product } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

export default function SpecialForYouCard({ item }: { item: Product }) {
    const router = useRouter();
    const isInWishlist = useMedinaStore((s) => s.isInWishlist(item.id));
    const toggleWishlist = useMedinaStore((s) => s.toggleWishlist);
    const images = getProductImages(item.name, item.images || []);
    const imageSource = images.length > 0 ? images[0] : null;

    return (
        <TouchableOpacity
            className="flex-1 mb-4 max-w-[48%]"
            activeOpacity={0.8}
            onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id } })}
        >
            <View
                className="w-full rounded-2xl overflow-hidden bg-neutral-50"
                style={{ aspectRatio: 186 / 160 }}
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
                    className="absolute top-[10px] right-[10px] w-8 h-8 bg-white rounded-full items-center justify-center"
                    activeOpacity={0.7}
                    onPress={() => toggleWishlist(item.id)}
                >
                    <Ionicons
                        name={isInWishlist ? "heart" : "heart-outline"}
                        size={16}
                        color={isInWishlist ? "#EF4444" : Colors.neutral[900]}
                    />
                </TouchableOpacity>
            </View>
            <Text
                className="mt-3 text-sm text-neutral-900 font-inter-medium"
                style={{ lineHeight: 20 }}
                numberOfLines={2}
            >
                {item.name}
            </Text>
            <View className="flex-row items-center justify-between mt-2">
                <Text className="flex-1 text-sm text-neutral-400 font-inter" style={{ lineHeight: 20 }}>
                    {formatPrice(item.price)}
                </Text>
                <View className="flex-row items-center gap-2">
                    <Ionicons name="star" size={16} color="#FFB13B" />
                    <Text className="text-xs text-neutral-900 font-inter" style={{ lineHeight: 17 }}>
                        {item.rating?.toFixed(1) || '4.7'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}
