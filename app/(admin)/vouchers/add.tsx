import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminAddVoucherScreen() {
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
    const [discountValue, setDiscountValue] = useState('');
    const [minPurchase, setMinPurchase] = useState('');
    const [maxDiscount, setMaxDiscount] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = 'ALM-';
        for (let i = 0; i < 6; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
        setCode(result);
    };

    const handleSave = async () => {
        if (!name.trim()) return Alert.alert('Error', 'Name is required');
        if (!code.trim()) return Alert.alert('Error', 'Code is required');
        if (!discountValue || Number(discountValue) <= 0) return Alert.alert('Error', 'Valid discount value is required');

        setIsLoading(true);
        try {
            const payload: any = {
                name: name.trim(),
                code: code.trim().toUpperCase(),
                description: description.trim() || null,
                discount_type: discountType,
                discount_value: Number(discountValue),
                min_purchase: Number(minPurchase) || 0,
                max_discount: maxDiscount ? Number(maxDiscount) : null,
                start_date: startDate || new Date().toISOString(),
                end_date: endDate || null,
                is_active: true,
            };

            const { error } = await supabase.from('vouchers').insert(payload);
            if (error) throw error;

            Alert.alert('Success', 'Voucher created successfully!');
            router.back();
        } catch (error: any) {
            console.error('Save voucher error:', error);
            Alert.alert('Error', error.message || 'Failed to create voucher');
        } finally {
            setIsLoading(false);
        }
    };

    const InputField = ({ label, value, onChangeText, placeholder, keyboardType, multiline }: any) => (
        <View className="mb-4">
            <Text className="text-sm font-inter-bold text-slate-700 mb-2">{label}</Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                keyboardType={keyboardType || 'default'}
                multiline={multiline}
                className="bg-white border border-slate-200 rounded-xl px-4 py-3 font-inter text-slate-800"
                placeholderTextColor="#94A3B8"
                style={multiline ? { minHeight: 80, textAlignVertical: 'top' } : {}}
            />
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
            <View className="px-6 py-4 flex-row items-center justify-between border-b border-slate-200 bg-white" style={{ elevation: 2 }}>
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center border border-slate-200">
                    <Ionicons name="arrow-back" size={20} color="#334155" />
                </TouchableOpacity>
                <Text className="text-xl font-inter-black text-slate-800">Add Voucher</Text>
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={isLoading}
                    className="w-10 h-10 bg-violet-500 rounded-full items-center justify-center"
                    style={{ elevation: 2 }}
                >
                    {isLoading ? <ActivityIndicator size="small" color="white" /> : <Ionicons name="checkmark" size={22} color="white" />}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                <InputField label="Voucher Name" value={name} onChangeText={setName} placeholder="e.g. Summer Sale 20%" />

                {/* Code with generate */}
                <View className="mb-4">
                    <Text className="text-sm font-inter-bold text-slate-700 mb-2">Voucher Code</Text>
                    <View className="flex-row gap-2">
                        <TextInput
                            value={code}
                            onChangeText={(t) => setCode(t.toUpperCase())}
                            placeholder="e.g. SUMMER20"
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 font-inter text-slate-800 uppercase"
                            placeholderTextColor="#94A3B8"
                            autoCapitalize="characters"
                        />
                        <TouchableOpacity
                            onPress={generateCode}
                            className="bg-violet-100 px-4 rounded-xl items-center justify-center border border-violet-200"
                        >
                            <Ionicons name="shuffle" size={20} color="#7C3AED" />
                        </TouchableOpacity>
                    </View>
                </View>

                <InputField label="Description (optional)" value={description} onChangeText={setDescription} placeholder="Brief description of the voucher" multiline />

                {/* Discount Type */}
                <View className="mb-4">
                    <Text className="text-sm font-inter-bold text-slate-700 mb-2">Discount Type</Text>
                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            onPress={() => setDiscountType('percentage')}
                            className={`flex-1 py-3 rounded-xl border items-center ${discountType === 'percentage' ? 'bg-violet-500 border-violet-500' : 'bg-white border-slate-200'}`}
                        >
                            <Text className={`font-inter-bold ${discountType === 'percentage' ? 'text-white' : 'text-slate-600'}`}>% Percentage</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setDiscountType('fixed')}
                            className={`flex-1 py-3 rounded-xl border items-center ${discountType === 'fixed' ? 'bg-violet-500 border-violet-500' : 'bg-white border-slate-200'}`}
                        >
                            <Text className={`font-inter-bold ${discountType === 'fixed' ? 'text-white' : 'text-slate-600'}`}>Rp Fixed</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <InputField
                    label={discountType === 'percentage' ? 'Discount (%)' : 'Discount Amount (Rp)'}
                    value={discountValue}
                    onChangeText={setDiscountValue}
                    placeholder={discountType === 'percentage' ? 'e.g. 20' : 'e.g. 50000'}
                    keyboardType="numeric"
                />
                <InputField label="Minimum Purchase (Rp)" value={minPurchase} onChangeText={setMinPurchase} placeholder="e.g. 100000" keyboardType="numeric" />

                {discountType === 'percentage' && (
                    <InputField label="Max Discount (Rp) - optional" value={maxDiscount} onChangeText={setMaxDiscount} placeholder="e.g. 50000" keyboardType="numeric" />
                )}

                {/* Dates */}
                <View className="mb-4">
                    <Text className="text-sm font-inter-bold text-slate-700 mb-2">Valid Period</Text>
                    <View className="flex-row gap-3">
                        <View className="flex-1">
                            <Text className="text-xs font-inter text-slate-400 mb-1">Start Date</Text>
                            <TextInput
                                value={startDate}
                                onChangeText={setStartDate}
                                placeholder="YYYY-MM-DD"
                                className="bg-white border border-slate-200 rounded-xl px-4 py-3 font-inter text-slate-800"
                                placeholderTextColor="#94A3B8"
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-xs font-inter text-slate-400 mb-1">End Date (optional)</Text>
                            <TextInput
                                value={endDate}
                                onChangeText={setEndDate}
                                placeholder="YYYY-MM-DD"
                                className="bg-white border border-slate-200 rounded-xl px-4 py-3 font-inter text-slate-800"
                                placeholderTextColor="#94A3B8"
                            />
                        </View>
                    </View>
                </View>

                {/* Preview Card */}
                {name || code ? (
                    <View className="mt-4">
                        <Text className="text-sm font-inter-bold text-slate-500 uppercase tracking-widest mb-3">Preview</Text>
                        <View className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-5 border border-violet-200" style={{ backgroundColor: '#7C3AED' }}>
                            <View className="flex-row items-center justify-between mb-3">
                                <Text className="text-white font-inter-bold text-lg" numberOfLines={1}>{name || 'Voucher Name'}</Text>
                                <View className="bg-white/20 px-3 py-1 rounded-full">
                                    <Text className="text-white text-xs font-inter-bold">
                                        {discountType === 'percentage' ? `${discountValue || '0'}% OFF` : `Rp ${Number(discountValue || 0).toLocaleString('id-ID')} OFF`}
                                    </Text>
                                </View>
                            </View>
                            <View className="flex-row items-center gap-2">
                                <View className="bg-white/20 px-3 py-1.5 rounded-lg">
                                    <Text className="text-white text-sm font-inter-bold">{code || 'CODE'}</Text>
                                </View>
                                <Text className="text-white/70 text-xs font-inter">Min. {minPurchase ? `Rp ${Number(minPurchase).toLocaleString('id-ID')}` : 'No minimum'}</Text>
                            </View>
                        </View>
                    </View>
                ) : null}
            </ScrollView>
        </SafeAreaView>
    );
}
