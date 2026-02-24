
import { Colors } from '@/constants/theme';
import { fetchAddress, updateAddress } from '@/services/addressService';
import { useMedinaStore } from '@/store/useMedinaStore';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EditAddressScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const insets = useSafeAreaInsets();

    const categories = ['Home', 'Office', 'Apartment', 'Other'];

    const [formData, setFormData] = useState({
        label: '',
        category: 'Home',
        recipient_name: '',
        phone_number: '',
        address_line: '',
        city: '',
        province: '',
        postal_code: '',
        is_default: false,
    });

    // Store for Map Picker
    const tempAddressLocation = useMedinaStore((s) => s.tempAddressLocation);
    // const setTempAddressLocation = useMedinaStore((s) => s.setTempAddressLocation); // Not strictly needed unless clearing

    useEffect(() => {
        if (tempAddressLocation) {
            setFormData(prev => ({ ...prev, address_line: tempAddressLocation.address }));
        }
    }, [tempAddressLocation]);

    useEffect(() => {
        if (id) {
            loadAddress(id);
        }
    }, [id]);

    const loadAddress = async (addressId: string) => {
        try {
            setLoading(true);
            const address = await fetchAddress(addressId);
            if (address) {
                setFormData({
                    label: address.label,
                    category: address.category || 'Home',
                    recipient_name: address.recipient_name,
                    phone_number: address.phone_number,
                    address_line: address.address_line,
                    city: address.city,
                    province: address.province,
                    postal_code: address.postal_code,
                    is_default: address.is_default,
                });
            } else {
                Alert.alert('Error', 'Address not found');
                router.back();
            }
        } catch (error) {
            console.error('Error loading address:', error);
            Alert.alert('Error', 'Failed to load address');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        if (!formData.recipient_name || !formData.phone_number || !formData.address_line || !formData.city) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        try {
            setSaving(true);
            const { category, ...updatePayload } = formData;
            await updateAddress(id!, updatePayload);
            Alert.alert('Success', 'Address updated successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error('Error updating address:', error);
            Alert.alert('Error', 'Failed to update address');
        } finally {
            setSaving(false);
        }
    };

    const InputField = ({ label, value, onChangeText, placeholder, keyboardType = 'default', multiline = false }: any) => (
        <View className="mb-4">
            <Text className="text-sm font-medium text-text mb-1.5" style={{ fontFamily: 'Inter_500Medium' }}>
                {label} <Text className="text-error">*</Text>
            </Text>
            <TextInput
                className={`bg-surface border border-border rounded-xl px-4 py-3 text-text ${multiline ? 'h-24 py-3' : ''}`}
                style={{ fontFamily: 'Inter_400Regular' }}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={Colors.text.muted}
                keyboardType={keyboardType}
                multiline={multiline}
                textAlignVertical={multiline ? 'top' : 'center'}
            />
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-bg items-center justify-center">
                <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
            {/* Header */}
            <View className="px-5 py-3 flex-row items-center justify-between border-b border-border bg-surface">
                <View className="flex-row items-center gap-3">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={Colors.text.DEFAULT} />
                    </TouchableOpacity>
                    <Text className="text-xl text-text font-bold" style={{ fontFamily: 'PlayfairDisplay_700Bold' }}>
                        Edit Address
                    </Text>
                </View>
            </View>

            <ScrollView className="flex-1 px-5 pt-5" showsVerticalScrollIndicator={false}>
                <InputField
                    label="Label (e.g., Home, Office)"
                    value={formData.label}
                    onChangeText={(t: string) => handleChange('label', t)}
                    placeholder="Home"
                />

                <View className="mb-6">
                    <Text className="text-sm font-medium text-text mb-2" style={{ fontFamily: 'Inter_500Medium' }}>Category</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {categories.map((cat) => {
                            const active = formData.category === cat;
                            return (
                                <TouchableOpacity
                                    key={cat}
                                    onPress={() => handleChange('category', cat)}
                                    className={`px-4 py-2 rounded-full border ${active ? 'bg-neutral-900 border-neutral-900' : 'bg-surface border-border'}`}
                                >
                                    <Text className={`text-xs font-inter-medium ${active ? 'text-white' : 'text-text-muted'}`}>
                                        {cat}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                <View className="flex-row gap-3">
                    <View className="flex-1">
                        <InputField
                            label="Recipient Name"
                            value={formData.recipient_name}
                            onChangeText={(t: string) => handleChange('recipient_name', t)}
                            placeholder="John Doe"
                        />
                    </View>
                </View>

                <InputField
                    label="Phone Number"
                    value={formData.phone_number}
                    onChangeText={(t: string) => handleChange('phone_number', t)}
                    placeholder="08123456789"
                    keyboardType="phone-pad"
                />

                <InputField
                    label="Full Address"
                    value={formData.address_line}
                    onChangeText={(t: string) => handleChange('address_line', t)}
                    placeholder="Street name, house number, etc."
                    multiline
                />

                {/* Pin Map Location */}
                <View className="mb-4 p-4 bg-surface border border-border rounded-2xl gap-2.5">
                    <View className="flex-row justify-between items-center">
                        <View>
                            <Text className="text-text text-sm font-medium" style={{ fontFamily: 'Inter_500Medium' }}>Pin Location</Text>
                            <Text className="text-text-muted text-xs">
                                {tempAddressLocation ? 'Location updated' : 'Tap map to change location'}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => router.push('/address/map-picker')}>
                            <Text className="text-primary text-sm font-medium">Change</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        className="h-40 rounded-xl overflow-hidden relative bg-neutral-200 items-center justify-center active:opacity-90"
                        onPress={() => router.push('/address/map-picker')}
                    >
                        <Image
                            source={{ uri: 'https://placehold.co/360x360/png?text=Map+Location' }}
                            className="w-full h-full opacity-90"
                            resizeMode="cover"
                        />
                        <View className="absolute items-center justify-center">
                            <Ionicons name="location" size={32} color={Colors.primary.DEFAULT} />
                        </View>
                    </TouchableOpacity>
                </View>


                <View className="flex-row gap-3">
                    <View className="flex-1">
                        <InputField
                            label="City"
                            value={formData.city}
                            onChangeText={(t: string) => handleChange('city', t)}
                            placeholder="Jakarta Selatan"
                        />
                    </View>
                    <View className="flex-1">
                        <InputField
                            label="Province"
                            value={formData.province}
                            onChangeText={(t: string) => handleChange('province', t)}
                            placeholder="DKI Jakarta"
                        />
                    </View>
                </View>

                <View className="w-1/2 pr-1.5">
                    <InputField
                        label="Postal Code"
                        value={formData.postal_code}
                        onChangeText={(t: string) => handleChange('postal_code', t)}
                        placeholder="12345"
                        keyboardType="numeric"
                    />
                </View>

                {/* Set Default Toggle */}
                <TouchableOpacity
                    className="flex-row items-center mb-8 mt-2"
                    onPress={() => handleChange('is_default', !formData.is_default)}
                    activeOpacity={0.8}
                >
                    <View className={`w-6 h-6 rounded border items-center justify-center mr-3 ${formData.is_default ? 'bg-primary border-primary' : 'border-text-muted bg-white'}`}>
                        {formData.is_default && <Ionicons name="checkmark" size={16} color="white" />}
                    </View>
                    <Text className="text-text font-medium" style={{ fontFamily: 'Inter_500Medium' }}>
                        Set as default address
                    </Text>
                </TouchableOpacity>

                <View className="h-24" />
            </ScrollView>

            {/* Bottom Button */}
            <View className="absolute bottom-0 left-0 right-0 p-5 bg-white border-t border-border" style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={saving}
                    className={`rounded-xl py-4 items-center justify-center shadow-sm ${saving ? 'bg-primary/70' : 'bg-primary'}`}
                >
                    {saving ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-base" style={{ fontFamily: 'PlayfairDisplay_700Bold' }}>
                            Save Changes
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
