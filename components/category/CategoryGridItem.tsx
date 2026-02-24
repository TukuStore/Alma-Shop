import { getCategoryImage } from '@/constants/category-images';
import { Colors } from '@/constants/theme';
import type { Category } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

export default function CategoryGridItem({ item }: { item: Category }) {
    const router = useRouter();
    const imageUrl = getCategoryImage(item.slug, item.image_url);

    return (
        <TouchableOpacity
            className="items-center mb-6 flex-1"
            activeOpacity={0.7}
            onPress={() => router.push({ pathname: '/search', params: { q: item.name } })}
        >
            <View
                className="w-[86px] h-[86px] rounded-2xl overflow-hidden items-center justify-center bg-neutral-50 mb-2"
            >
                {imageUrl ? (
                    <Image
                        source={typeof imageUrl === 'string' ? { uri: imageUrl } : imageUrl}
                        style={{ width: 64, height: 64 }}
                        contentFit="cover"
                    />
                ) : (
                    <Ionicons name="grid-outline" size={32} color={Colors.neutral[400]} />
                )}
            </View>
            <Text
                className="text-xs text-center text-neutral-900 font-inter-medium"
                style={{ lineHeight: 16 }}
                numberOfLines={2}
            >
                {item.name}
            </Text>
        </TouchableOpacity>
    );
}
