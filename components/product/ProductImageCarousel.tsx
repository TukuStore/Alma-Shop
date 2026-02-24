import { Image } from 'expo-image';
import React, { useState } from 'react';
import { Dimensions, FlatList, View, ViewToken } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CAROUSEL_HEIGHT = SCREEN_HEIGHT * 0.52; // Takes up ~52% of the screen height

interface ProductImageCarouselProps {
    images: (string | number)[];
}

export default function ProductImageCarousel({ images }: ProductImageCarouselProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    const onViewableItemsChanged = ({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0) {
            setActiveIndex(viewableItems[0].index ?? 0);
        }
    };

    const viewabilityConfig = {
        itemVisiblePercentThreshold: 50,
    };

    if (!images || images.length === 0) {
        return <View style={{ width: SCREEN_WIDTH, height: CAROUSEL_HEIGHT }} className="bg-neutral-100" />;
    }

    return (
        <View className="relative bg-white" style={{ width: SCREEN_WIDTH, height: CAROUSEL_HEIGHT }}>
            <FlatList
                data={images}
                keyExtractor={(_, index) => index.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                bounces={false}
                renderItem={({ item }) => (
                    <View style={{ width: SCREEN_WIDTH, height: CAROUSEL_HEIGHT }}>
                        <Image
                            source={typeof item === 'string' ? { uri: item } : item}
                            style={{ width: '100%', height: '100%' }}
                            contentFit="cover"
                            transition={300}
                        />
                    </View>
                )}
            />
            {/* Premium Pagination Dots */}
            <View className="absolute bottom-6 flex-row justify-center w-full gap-2 px-6">
                {images.length > 1 && images.map((_, index) => {
                    const isActive = activeIndex === index;
                    return (
                        <View
                            key={index}
                            className={`transition-all duration-300 rounded-full ${isActive ? 'bg-primary' : 'bg-white/70'}`}
                            style={{
                                width: isActive ? 24 : 6,
                                height: 6,
                                elevation: isActive ? 2 : 0,
                                shadowColor: '#000',
                                shadowOpacity: isActive ? 0.3 : 0.1,
                                shadowRadius: 3,
                                shadowOffset: { width: 0, height: 1 }
                            }}
                        />
                    );
                })}
            </View>
        </View>
    );
}
