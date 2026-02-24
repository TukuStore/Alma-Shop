import { fetchHeroSliders } from '@/services/productService';
import type { HeroSlider } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminBannersScreen() {
    const [banners, setBanners] = useState<HeroSlider[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Fetch all banners for admin
            const data = await fetchHeroSliders(undefined, false);
            setBanners(data);
        } catch (error) {
            console.error('Error fetching banners:', error);
            Alert.alert('Error', 'Failed to load banners');
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center justify-between border-b border-slate-200 bg-white z-10" style={{ elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 }}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center border border-slate-200"
                >
                    <Ionicons name="arrow-back" size={20} color="#334155" />
                </TouchableOpacity>
                <Text className="text-xl font-inter-black text-slate-800">Hero Banners</Text>
                <TouchableOpacity
                    className="w-10 h-10 bg-pink-50 rounded-full items-center justify-center border border-pink-100"
                    style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}
                    onPress={() => router.push('/(admin)/banners/add')}
                >
                    <Ionicons name="add" size={24} color="#ec4899" />
                </TouchableOpacity>
            </View>

            {/* Content Range */}
            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#ec4899" />
                    <Text className="mt-4 font-inter-medium text-slate-500">Loading banners...</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={isLoading && banners.length > 0} onRefresh={loadData} colors={['#ec4899']} />
                    }
                >
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-sm font-inter-bold text-slate-500 uppercase tracking-widest">
                            Active Banners ({banners.length})
                        </Text>
                    </View>

                    {banners.length === 0 ? (
                        <View className="items-center justify-center py-10">
                            <Ionicons name="images-outline" size={64} color="#CBD5E1" />
                            <Text className="font-inter-medium text-slate-500 mt-4 text-center">No promotional banners active.</Text>
                        </View>
                    ) : (
                        <View className="gap-6">
                            {banners.map((banner) => (
                                <View key={banner.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}>
                                    <View className="h-40 w-full bg-slate-100 relative">
                                        {banner.image_url ? (
                                            <Image source={{ uri: banner.image_url }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                                        ) : (
                                            <View className="flex-1 items-center justify-center">
                                                <Ionicons name="image-outline" size={48} color="#94A3B8" />
                                            </View>
                                        )}
                                        <View className="absolute top-3 right-3 px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.9)', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}>
                                            <Text className="text-[10px] font-inter-bold text-slate-700 uppercase">{banner.type}</Text>
                                        </View>
                                    </View>

                                    <View className="p-5 flex-row items-center justify-between">
                                        <View className="flex-1 pr-4">
                                            <View className="flex-row items-center gap-2 mb-1">
                                                <Text className="text-lg font-inter-bold text-slate-800" numberOfLines={1}>{banner.title}</Text>
                                                {!banner.is_active && (
                                                    <View className="bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                                        <Text className="text-[10px] font-inter-bold text-slate-400">INACTIVE</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <Text className="text-sm font-inter-medium text-slate-500" numberOfLines={2}>{banner.subtitle}</Text>
                                            <View className="flex-row items-center mt-2 gap-3">
                                                <View className="flex-row items-center">
                                                    <Ionicons name="layers-outline" size={12} color="#94A3B8" />
                                                    <Text className="text-[11px] font-inter-medium text-slate-400 ml-1">Order: {banner.sort_order}</Text>
                                                </View>
                                                {banner.cta_text && (
                                                    <View className="flex-row items-center">
                                                        <Ionicons name="radio-button-on-outline" size={12} color="#94A3B8" />
                                                        <Text className="text-[11px] font-inter-medium text-slate-400 ml-1">{banner.cta_text}</Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                        <View className="flex-row items-center gap-2">
                                            <TouchableOpacity
                                                onPress={() => router.push({ pathname: '/(admin)/banners/[id]', params: { id: banner.id } })}
                                                className="w-10 h-10 rounded-full bg-pink-50 items-center justify-center border border-pink-100"
                                                style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}
                                            >
                                                <Ionicons name="pencil" size={16} color="#ec4899" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
