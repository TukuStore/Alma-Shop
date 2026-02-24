import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminEditVoucherScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
    const [discountValue, setDiscountValue] = useState('');
    const [minPurchase, setMinPurchase] = useState('');
    const [maxDiscount, setMaxDiscount] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const loadVoucher = async () => {
            try {
                const { data, error } = await supabase
                    .from('vouchers')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                if (data) {
                    setName(data.name || '');
                    setCode(data.code || '');
                    setDescription(data.description || '');
                    setDiscountType(data.discount_type || 'percentage');
                    setDiscountValue(String(data.discount_value || ''));
                    setMinPurchase(String(data.min_purchase || ''));
                    setMaxDiscount(data.max_discount ? String(data.max_discount) : '');
                    setStartDate(data.start_date ? data.start_date.split('T')[0] : '');
                    setEndDate(data.end_date ? data.end_date.split('T')[0] : '');
                    setIsActive(data.is_active ?? true);
                }
            } catch (error) {
                console.error('Load voucher error:', error);
                Alert.alert('Error', 'Failed to load voucher');
            } finally {
                setIsLoading(false);
            }
        };
        if (id) loadVoucher();
    }, [id]);

    const handleSave = async () => {
        if (!name.trim()) return Alert.alert('Error', 'Name is required');
        if (!code.trim()) return Alert.alert('Error', 'Code is required');
        if (!discountValue || Number(discountValue) <= 0) return Alert.alert('Error', 'Valid discount value is required');

        setIsSaving(true);
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
                is_active: isActive,
            };

            const { error } = await supabase.from('vouchers').update(payload).eq('id', id);
            if (error) throw error;

            Alert.alert('Success', 'Voucher updated successfully!');
            router.back();
        } catch (error: any) {
            console.error('Update voucher error:', error);
            Alert.alert('Error', error.message || 'Failed to update voucher');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = () => {
        Alert.alert('Delete Voucher', 'This voucher will be permanently deleted.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    try {
                        const { error } = await supabase.from('vouchers').delete().eq('id', id);
                        if (error) throw error;
                        Alert.alert('Deleted', 'Voucher has been removed');
                        router.back();
                    } catch (error) {
                        console.error('Delete error:', error);
                        Alert.alert('Error', 'Failed to delete voucher');
                    }
                }
            },
        ]);
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

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center" edges={['top']}>
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text className="text-slate-500 font-inter mt-4">Loading voucher...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
            <View className="px-6 py-4 flex-row items-center justify-between border-b border-slate-200 bg-white" style={{ elevation: 2 }}>
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center border border-slate-200">
                    <Ionicons name="arrow-back" size={20} color="#334155" />
                </TouchableOpacity>
                <Text className="text-xl font-inter-black text-slate-800">Edit Voucher</Text>
                <View className="flex-row gap-2">
                    <TouchableOpacity
                        onPress={handleDelete}
                        className="w-10 h-10 bg-red-50 rounded-full items-center justify-center border border-red-200"
                    >
                        <Ionicons name="trash-outline" size={18} color="#DC2626" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={isSaving}
                        className="w-10 h-10 bg-violet-500 rounded-full items-center justify-center"
                        style={{ elevation: 2 }}
                    >
                        {isSaving ? <ActivityIndicator size="small" color="white" /> : <Ionicons name="checkmark" size={22} color="white" />}
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                <InputField label="Voucher Name" value={name} onChangeText={setName} placeholder="e.g. Summer Sale 20%" />

                <View className="mb-4">
                    <Text className="text-sm font-inter-bold text-slate-700 mb-2">Voucher Code</Text>
                    <TextInput
                        value={code}
                        onChangeText={(t) => setCode(t.toUpperCase())}
                        placeholder="e.g. SUMMER20"
                        className="bg-white border border-slate-200 rounded-xl px-4 py-3 font-inter text-slate-800 uppercase"
                        placeholderTextColor="#94A3B8"
                        autoCapitalize="characters"
                    />
                </View>

                <InputField label="Description (optional)" value={description} onChangeText={setDescription} placeholder="Brief description" multiline />

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

                {/* Active Toggle */}
                <View className="mb-6">
                    <Text className="text-sm font-inter-bold text-slate-700 mb-2">Status</Text>
                    <TouchableOpacity
                        onPress={() => setIsActive(!isActive)}
                        className={`flex-row items-center justify-between p-4 rounded-xl border ${isActive ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}
                    >
                        <View className="flex-row items-center gap-3">
                            <Ionicons name={isActive ? 'checkmark-circle' : 'close-circle'} size={24} color={isActive ? '#059669' : '#DC2626'} />
                            <Text className={`font-inter-bold ${isActive ? 'text-emerald-700' : 'text-red-700'}`}>
                                {isActive ? 'Active' : 'Inactive'}
                            </Text>
                        </View>
                        <View className={`w-12 h-7 rounded-full p-0.5 ${isActive ? 'bg-emerald-500' : 'bg-red-400'}`}>
                            <View
                                className="w-6 h-6 bg-white rounded-full shadow"
                                style={{ marginLeft: isActive ? 18 : 0 }}
                            />
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
