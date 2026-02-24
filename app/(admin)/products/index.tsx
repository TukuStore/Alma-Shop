import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminProductsScreen() {
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadProducts = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('products')
                .select('id, name, price, stock, is_active, images')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error('Fetch products error:', error);
            Alert.alert('Error', 'Failed to load products');
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadProducts();
        }, [])
    );

    const toggleProductStatus = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('products')
                .update({ is_active: !currentStatus })
                .eq('id', id);

            if (error) throw error;

            // Optimistic update
            setProducts(products.map(p =>
                p.id === id ? { ...p, is_active: !currentStatus } : p
            ));
        } catch (error) {
            console.error('Update status error:', error);
            Alert.alert('Error', 'Failed to update product status');
        }
    };

    const formatPrice = (price: number) => `Rp ${price.toLocaleString('id-ID')}`;

    if (isLoading && products.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="mt-4 font-inter-medium text-slate-500">Loading inventory...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center justify-between border-b border-slate-200 bg-white shadow-sm z-10" style={{ elevation: 2 }}>
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center border border-slate-200">
                    <Ionicons name="arrow-back" size={20} color="#334155" />
                </TouchableOpacity>
                <Text className="text-xl font-inter-black text-slate-800">Inventory</Text>
                <TouchableOpacity
                    className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center border border-blue-100 shadow-sm"
                    onPress={() => router.push('/(admin)/products/add')}
                >
                    <Ionicons name="add" size={24} color="#3B82F6" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={products}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl refreshing={isLoading && products.length > 0} onRefresh={loadProducts} colors={['#3B82F6']} />
                }
                ListHeaderComponent={
                    <View className="flex-row items-center justify-between mb-4 mt-2">
                        <Text className="text-sm font-inter-bold text-slate-500 uppercase tracking-widest">
                            Total Products ({products.length})
                        </Text>
                    </View>
                }
                ListEmptyComponent={
                    <View className="items-center justify-center py-10">
                        <Ionicons name="cube-outline" size={64} color="#CBD5E1" />
                        <Text className="font-inter-medium text-slate-500 mt-4 text-center">No products found in inventory.</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <View className="bg-white rounded-3xl p-4 mb-4 border border-slate-200 shadow-sm flex-row gap-4" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05 }}>
                        <View className="w-24 h-24 rounded-[20px] bg-slate-100 overflow-hidden border border-slate-200 items-center justify-center">
                            {item.images?.[0] ? (
                                <Image
                                    source={{ uri: item.images[0] }}
                                    style={{ width: '100%', height: '100%' }}
                                    contentFit="cover"
                                />
                            ) : (
                                <Ionicons name="image-outline" size={32} color="#94A3B8" />
                            )}
                        </View>

                        <View className="flex-1 justify-between py-1">
                            <View>
                                <Text className="text-base font-inter-black text-slate-800 mb-1 leading-5" numberOfLines={2}>
                                    {item.name}
                                </Text>
                                <Text className="text-sm font-inter-bold text-blue-600">
                                    {formatPrice(item.price)}
                                </Text>
                            </View>

                            <View className="flex-row items-end justify-between mt-2">
                                <View>
                                    <Text className="text-[10px] font-inter-bold text-slate-400 uppercase tracking-wider mb-0.5">Stock</Text>
                                    <Text className={`text-sm font-inter-black ${item.stock > 10 ? 'text-slate-700' : 'text-error'}`}>
                                        {item.stock} <Text className="text-xs font-inter-medium text-slate-500">pcs</Text>
                                    </Text>
                                </View>

                                <View className="flex-row items-center gap-2">
                                    <TouchableOpacity
                                        onPress={() => toggleProductStatus(item.id, item.is_active)}
                                        className={`px-2.5 py-1.5 rounded-lg border flex-row items-center gap-1 ${item.is_active ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}
                                        activeOpacity={0.7}
                                    >
                                        <View className={`w-2 h-2 rounded-full ${item.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                        <Text className={`text-[10px] uppercase font-inter-bold tracking-wider ${item.is_active ? 'text-emerald-700' : 'text-slate-500'}`}>
                                            {item.is_active ? 'Live' : 'Draft'}
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => router.push(`/(admin)/products/${item.id}`)}
                                        className="w-8 h-8 rounded-lg bg-slate-100 items-center justify-center border border-slate-200 shadow-sm"
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="pencil" size={14} color="#475569" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                )}
            />
        </SafeAreaView>
    );
}
