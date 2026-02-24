import { getCategoryImage } from '@/constants/category-images';
import { fetchCategories } from '@/services/productService';
import type { Category } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminCategoriesScreen() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const data = await fetchCategories();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            Alert.alert('Error', 'Failed to load categories');
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center justify-between border-b border-slate-200 bg-white shadow-sm z-10" style={{ elevation: 2 }}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center border border-slate-200"
                >
                    <Ionicons name="arrow-back" size={20} color="#334155" />
                </TouchableOpacity>
                <Text className="text-xl font-inter-black text-slate-800">Categories</Text>
                <TouchableOpacity
                    className="w-10 h-10 bg-indigo-50 rounded-full items-center justify-center border border-indigo-100 shadow-sm"
                    onPress={() => router.push('/(admin)/categories/add')}
                >
                    <Ionicons name="add" size={24} color="#6366f1" />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View className="px-6 py-4 bg-white border-b border-slate-100">
                <View className="flex-row items-center bg-slate-100 rounded-xl px-4 py-2 border border-slate-200">
                    <Ionicons name="search" size={20} color="#94A3B8" />
                    <TextInput
                        className="flex-1 ml-2 font-inter-medium text-slate-700 h-8"
                        placeholder="Search categories..."
                        placeholderTextColor="#94A3B8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={18} color="#94A3B8" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Content Range */}
            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#6366f1" />
                    <Text className="mt-4 font-inter-medium text-slate-500">Loading categories...</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={isLoading && categories.length > 0} onRefresh={loadData} colors={['#6366f1']} />
                    }
                >
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-sm font-inter-bold text-slate-500 uppercase tracking-widest">
                            All Categories ({filteredCategories.length})
                        </Text>
                    </View>

                    {filteredCategories.length === 0 ? (
                        <View className="items-center justify-center py-10">
                            <Ionicons name="folder-open-outline" size={64} color="#CBD5E1" />
                            <Text className="font-inter-medium text-slate-500 mt-4 text-center">No categories found matching your search.</Text>
                        </View>
                    ) : (
                        <View className="gap-3">
                            {filteredCategories.map((cat) => {
                                const imageUrl = getCategoryImage(cat.slug, cat.image_url);
                                return (
                                    <TouchableOpacity
                                        key={cat.id}
                                        onPress={() => router.push({ pathname: '/(admin)/categories/[id]', params: { id: cat.id } })}
                                        className="bg-white p-4 rounded-2xl flex-row items-center border border-slate-200 shadow-sm"
                                        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05 }}
                                        activeOpacity={0.7}
                                    >
                                        <View className="w-14 h-14 bg-slate-50 rounded-xl items-center justify-center overflow-hidden border border-slate-100 mr-4">
                                            {imageUrl ? (
                                                <Image source={typeof imageUrl === 'string' ? { uri: imageUrl } : imageUrl} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                                            ) : (
                                                <Ionicons name="grid-outline" size={24} color="#94A3B8" />
                                            )}
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-base font-inter-bold text-slate-800">{cat.name}</Text>
                                            <Text className="text-xs font-inter-medium text-slate-500 mt-0.5">Slug: {cat.slug}</Text>
                                        </View>
                                        <View className="items-end gap-2">
                                            <View className="w-8 h-8 rounded-full bg-slate-50 items-center justify-center border border-slate-200">
                                                <Ionicons name="pencil" size={14} color="#64748B" />
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
