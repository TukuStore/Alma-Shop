
import { getProductImages } from '@/constants/local-images';
import { Colors } from '@/constants/theme';
import { formatPrice } from '@/lib/currency';
import type { Product } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

export default function MostPopularCard({ item, isGrid = false }: { item: Product, isGrid?: boolean }) {
    const router = useRouter();
    const images = getProductImages(item.name, item.images || []);
    const imageSource = images.length > 0 ? images[0] : null;

    return (
        <TouchableOpacity
            className={isGrid ? "flex-1 mb-4 max-w-[48%]" : "w-[150px] mr-4"}
            activeOpacity={0.8}
            onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id } })}
        >
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
                <TouchableOpacity
                    className="absolute top-[10px] right-[10px] w-8 h-8 bg-white rounded-full items-center justify-center"
                    activeOpacity={0.7}
                >
                    <Ionicons name="heart-outline" size={16} color={Colors.neutral[900]} />
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
                <Text className="text-sm text-neutral-400 font-inter" style={{ lineHeight: 20 }}>
                    {formatPrice(item.price)}
                </Text>
                <View className="flex-row items-center gap-2">
                    <Ionicons name="star" size={16} color="#FFB13B" />
                    <Text className="text-xs text-neutral-900 font-inter" style={{ lineHeight: 17 }}>
                        {item.rating?.toFixed(1) || '4.8'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}
