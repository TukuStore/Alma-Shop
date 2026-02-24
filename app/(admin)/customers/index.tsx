import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Profile {
    id: string;
    full_name: string;
    avatar_url: string | null;
    role: string;
    created_at: string;
}

export default function AdminCustomersScreen() {
    const [customers, setCustomers] = useState<Profile[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCustomers(data || []);
        } catch (error) {
            console.error('Error fetching customers:', error);
            Alert.alert('Error', 'Failed to load customers data');
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const filteredCustomers = customers.filter(customer =>
        (customer.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
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
                <Text className="text-xl font-inter-black text-slate-800">Customers</Text>
                <View className="w-10" />
            </View>

            {/* Search Bar */}
            <View className="px-6 py-4 bg-white border-b border-slate-100">
                <View className="flex-row items-center bg-slate-100 rounded-xl px-4 py-2 border border-slate-200">
                    <Ionicons name="search" size={20} color="#94A3B8" />
                    <TextInput
                        className="flex-1 ml-2 font-inter-medium text-slate-700 h-8"
                        placeholder="Search by name..."
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
                    <ActivityIndicator size="large" color="#10b981" />
                    <Text className="mt-4 font-inter-medium text-slate-500">Loading customers...</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={isLoading && customers.length > 0} onRefresh={loadData} colors={['#10b981']} />
                    }
                >
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-sm font-inter-bold text-slate-500 uppercase tracking-widest">
                            Total Users ({filteredCustomers.length})
                        </Text>
                    </View>

                    {filteredCustomers.length === 0 ? (
                        <View className="items-center justify-center py-10">
                            <Ionicons name="people-outline" size={64} color="#CBD5E1" />
                            <Text className="font-inter-medium text-slate-500 mt-4 text-center">No customers found.</Text>
                        </View>
                    ) : (
                        <View className="gap-3">
                            {filteredCustomers.map((customer: Profile) => (
                                <TouchableOpacity
                                    key={customer.id}
                                    onPress={() => router.push({ pathname: '/(admin)/customers/[id]', params: { id: customer.id } })}
                                    className="bg-white p-4 rounded-2xl flex-row items-center justify-between border border-slate-200 shadow-sm"
                                    activeOpacity={0.7}
                                    style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05 }}
                                >
                                    <View className="flex-row items-center gap-4 flex-1 pr-2">
                                        <View className="w-12 h-12 bg-slate-100 rounded-full items-center justify-center overflow-hidden border border-slate-200">
                                            {customer.avatar_url ? (
                                                <Image source={{ uri: customer.avatar_url }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                                            ) : (
                                                <Ionicons name="person" size={20} color="#94A3B8" />
                                            )}
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-base font-inter-bold text-slate-800" numberOfLines={1}>{customer.full_name || 'Guest User'}</Text>
                                        </View>
                                    </View>

                                    <View className="items-end gap-2">
                                        <View className={`px-2 py-1 rounded-md border ${customer.role === 'admin' ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}>
                                            <Text className={`text-[10px] font-inter-bold uppercase tracking-wider ${customer.role === 'admin' ? 'text-indigo-600' : 'text-slate-600'}`}>
                                                {customer.role}
                                            </Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={12} color="#CBD5E1" />
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
