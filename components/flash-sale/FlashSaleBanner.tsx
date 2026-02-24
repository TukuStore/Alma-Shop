import { fetchHeroSliders } from '@/services/productService';
import type { HeroSlider } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Text, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - 40; // Horizontal padding 20 * 2

const GRADIENTS = [
    { colors: ['#00D79E', '#00C48C'] as const, buttonColor: '#00D79E' },
    { colors: ['#FFB13B', '#FF9F1C'] as const, buttonColor: '#FFB13B' },
    { colors: ['#FF3E38', '#E63530'] as const, buttonColor: '#FF3E38' },
    { colors: ['#8B5CF6', '#7C3AED'] as const, buttonColor: '#8B5CF6' }, // Purple
];

export default function FlashSaleBanner() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [banners, setBanners] = useState<HeroSlider[]>([]);
    const flatListRef = useRef<FlatList>(null);
    const router = useRouter();

    useEffect(() => {
        fetchHeroSliders('flash_sale').then(setBanners);
    }, []);

    // Auto-play
    useEffect(() => {
        if (banners.length <= 1) return;

        const interval = setInterval(() => {
            if (activeIndex < banners.length - 1) {
                flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
                setActiveIndex(activeIndex + 1);
            } else {
                flatListRef.current?.scrollToIndex({ index: 0, animated: true });
                setActiveIndex(0);
            }
        }, 5000); // 5 seconds

        return () => clearInterval(interval);
    }, [activeIndex]);

    const renderItem = useCallback(({ item, index }: { item: HeroSlider; index: number }) => {
        const gradient = GRADIENTS[index % GRADIENTS.length];
        return (
            <View style={{ width: SCREEN_WIDTH }} className="px-5">
                <LinearGradient
                    colors={gradient.colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="rounded-[24px] p-6 relative h-[180px] overflow-hidden flex-row"
                >
                    {/* Background Decoration */}
                    <View
                        className="absolute w-[300px] h-[300px] rounded-full border-[20px] border-white/10"
                        style={{ top: -100, left: -100 }}
                    />
                    <View
                        className="absolute w-[200px] h-[200px] rounded-full border-[20px] border-white/10"
                        style={{ bottom: -80, right: 40 }}
                    />

                    {/* Left Content */}
                    <View className="flex-1 justify-center z-10 gap-3">
                        <View>
                            <Text className="text-white text-2xl font-bold font-inter-bold leading-tight" numberOfLines={1}>
                                {item.title}
                            </Text>
                            <Text className="text-white text-md font-bold font-inter-bold leading-tight mt-1" numberOfLines={1}>
                                {item.subtitle}
                            </Text>
                        </View>

                        {item.cta_text && (
                            <TouchableOpacity
                                className="bg-white px-4 py-2 rounded-full self-start flex-row items-center gap-1 mt-1"
                                activeOpacity={0.8}
                                onPress={() => item.cta_link ? router.push(item.cta_link as any) : null}
                            >
                                <Text className="text-xs font-bold font-inter-bold" style={{ color: gradient.buttonColor }}>{item.cta_text}</Text>
                                <Ionicons name="arrow-forward" size={12} color={gradient.buttonColor} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Right Image */}
                    <View className="absolute right-[-20px] bottom-[-20px] w-[160px] h-[160px] z-10">
                        <Image
                            source={{ uri: item.image_url }}
                            style={{ width: '100%', height: '100%' }}
                            contentFit="contain"
                        />
                    </View>
                </LinearGradient>
            </View>
        );
    }, []);

    const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: any[] }) => {
        if (viewableItems.length > 0) {
            setActiveIndex(viewableItems[0].index || 0);
        }
    }).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current;

    return (
        <View className="mt-4 mb-6">
            <FlatList
                ref={flatListRef}
                data={banners}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
                snapToInterval={SCREEN_WIDTH}
                snapToAlignment="start"
                contentContainerStyle={{ paddingHorizontal: 0 }}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                getItemLayout={(_, index) => ({
                    length: SCREEN_WIDTH,
                    offset: SCREEN_WIDTH * index,
                    index,
                })}
            />

            {/* Pagination Dots */}
            <View className="flex-row justify-center gap-1.5 mt-4 absolute bottom-4 left-0 right-0">
                {banners.map((_, index) => (
                    <View
                        key={index}
                        className={`w-1.5 h-1.5 rounded-full ${index === activeIndex ? 'bg-white' : 'bg-white/40'}`}
                    />
                ))}
            </View>
        </View>
    );
}
