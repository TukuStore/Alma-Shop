import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyCartIllustration from './EmptyCartIllustration';

export default function EmptyCart() {
    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
            {/* Header */}
            <View className="px-5 py-3 flex-row items-center justify-between border-b border-gray-50/50">
                {/* Back Button */}
                <TouchableOpacity
                    onPress={() => router.canGoBack() && router.back()}
                    className="w-10 h-10 bg-[#FF6B57] rounded-full items-center justify-center shadow-sm"
                    activeOpacity={0.8}
                >
                    <Ionicons name="arrow-back" size={22} color="white" />
                </TouchableOpacity>

                {/* Title */}
                <Text className="text-[20px] font-inter-bold text-gray-900 absolute left-0 right-0 text-center -z-10">
                    My Cart
                </Text>

                {/* Spacer for layout balance */}
                <View className="w-10" />
            </View>

            {/* Content */}
            <View className="flex-1 items-center justify-center -mt-10 px-6">
                {/* Illustration */}
                <View className="mb-8 items-center justify-center">
                    <EmptyCartIllustration />
                </View>

                {/* Text Content */}
                <View className="mb-8 w-full items-center">
                    <Text className="text-[18px] font-inter-bold text-gray-900 text-center mb-3">
                        Oops, your cart’s feeling a little lonely!
                    </Text>
                    <Text className="text-[13px] font-inter text-gray-400 text-center leading-5 px-4">
                        You haven’t added anything yet. Found something you like? Let’s put it in here!
                    </Text>
                </View>

                {/* Buttons (Row) */}
                <View className="flex-row gap-3 w-full justify-center">
                    {/* Browse Products (Outline) */}
                    <TouchableOpacity
                        onPress={() => router.push('/(tabs)/categories')}
                        className="px-5 py-3 rounded-full border border-[#FF6B57] items-center justify-center flex-1 max-w-[160px]"
                        activeOpacity={0.7}
                    >
                        <Text className="text-[#FF6B57] text-[13px] font-inter-semibold">
                            Browse Products
                        </Text>
                    </TouchableOpacity>

                    {/* Go to Wishlist (Filled) */}
                    <TouchableOpacity
                        onPress={() => router.push('/wishlist' as any)}
                        className="px-5 py-3 rounded-full bg-[#FF6B57] items-center justify-center flex-1 max-w-[160px] shadow-sm shadow-orange-200"
                        activeOpacity={0.8}
                    >
                        <Text className="text-white text-[13px] font-inter-semibold">
                            Go to Wishlist
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}
