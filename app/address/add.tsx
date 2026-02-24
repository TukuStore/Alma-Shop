import { CITIES, KECAMATAN, PROVINCES } from '@/constants/indonesia';
import { Colors } from '@/constants/theme';
import { addAddress } from '@/services/addressService';
import { useMedinaStore } from '@/store/useMedinaStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AddAddressScreen() {
    const [loading, setLoading] = useState(false);
    const insets = useSafeAreaInsets();

    // Store for Map Picker
    const tempAddressLocation = useMedinaStore((s) => s.tempAddressLocation);
    const setTempAddressLocation = useMedinaStore((s) => s.setTempAddressLocation);

    const [formData, setFormData] = useState({
        label: '',
        category: 'Home',
        recipient_name: '',
        phone_number: '',
        address_line: '',
        province_id: '',
        province_name: '',
        city_id: '',
        city_name: '',
        district_id: '',
        district_name: '',
        postal_code: '',
        is_default: false,
    });

    const categories = ['Home', 'Office', 'Apartment', 'Other'];

    // Selection Modals State
    const [modalType, setModalType] = useState<'province' | 'city' | 'district' | null>(null);
    const [searchText, setSearchText] = useState('');

    // Initial load - Check if coming from map picker or fresh
    useEffect(() => {
        // If we want to clear fields on mount only if not coming back from map... 
        // For now, we rely on React's state retention in navigation stack unless unmounted.
    }, []);

    // Update form when location changes from Map Picker
    useEffect(() => {
        if (tempAddressLocation) {
            setFormData(prev => ({
                ...prev,
                address_line: tempAddressLocation.address,
            }));
        }
    }, [tempAddressLocation]);

    const handleChange = (key: string, value: any) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        // Validation
        if (!formData.label || !formData.recipient_name || !formData.phone_number || !formData.address_line || !formData.province_name || !formData.city_name || !formData.district_name) {
            Alert.alert('Missing Fields', 'Please fill in all required fields (inc. Province, City, District).');
            return;
        }

        try {
            setLoading(true);

            // Construct address object matching DB expectation
            const addressData = {
                label: formData.label,
                recipient_name: formData.recipient_name,
                phone_number: formData.phone_number,
                address_line: formData.address_line,
                city: `${formData.city_name}, ${formData.district_name}`, // Concatenate for storage
                province: formData.province_name,
                postal_code: formData.postal_code,
                is_default: formData.is_default,
            };

            await addAddress(addressData);

            // Clear temp location
            setTempAddressLocation(null);

            Alert.alert('Success', 'Address added successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error('Error adding address:', error);
            Alert.alert('Error', 'Failed to save address. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Selection Handlers
    const handleSelectProvince = (item: typeof PROVINCES[0]) => {
        setFormData(prev => ({
            ...prev,
            province_id: item.id,
            province_name: item.name,
            city_id: '',
            city_name: '',
            district_id: '',
            district_name: '',
        }));
        setModalType(null);
        setSearchText('');
    };

    const handleSelectCity = (item: { id: string; name: string }) => {
        setFormData(prev => ({
            ...prev,
            city_id: item.id,
            city_name: item.name,
            district_id: '',
            district_name: '',
        }));
        setModalType(null);
        setSearchText('');
    };

    const handleSelectDistrict = (item: { id: string; name: string }) => {
        setFormData(prev => ({
            ...prev,
            district_id: item.id,
            district_name: item.name,
        }));
        setModalType(null);
        setSearchText('');
    };

    // Render Items for Modals
    const renderModalContent = () => {
        let title = '';
        let data: any[] = [];
        let emptyStateMsg = '';

        if (modalType === 'province') {
            title = 'Select Province';
            data = PROVINCES;
        } else if (modalType === 'city') {
            title = 'Select City / Regency';
            data = formData.province_id ? (CITIES as any)[formData.province_id] || [] : [];
            if (!formData.province_id) emptyStateMsg = 'Please select a Province first.';
        } else if (modalType === 'district') {
            title = 'Select District (Kecamatan)';
            data = formData.city_id ? ((KECAMATAN as any)[formData.city_id] || (KECAMATAN as any)['default']) : [];
            if (!formData.city_id) emptyStateMsg = 'Please select a City first.';
        }

        // Filter based on search text
        const filteredData = data.filter(item =>
            item.name.toLowerCase().includes(searchText.toLowerCase())
        );

        return (
            <View className="flex-1 bg-black/50 justify-end">
                <View className="bg-white rounded-t-3xl h-[80%]">
                    <View className="p-4 border-b border-neutral-100 flex-row justify-between items-center">
                        <Text className="text-lg font-inter-bold text-neutral-900">{title}</Text>
                        <TouchableOpacity onPress={() => { setModalType(null); setSearchText(''); }} className="p-2">
                            <Ionicons name="close" size={24} color="#9AA4B2" />
                        </TouchableOpacity>
                    </View>

                    {/* Search Bar */}
                    {!emptyStateMsg && (
                        <View className="px-4 py-2 border-b border-neutral-100 bg-white">
                            <View className="flex-row items-center bg-neutral-50 px-3 py-2.5 rounded-xl border border-neutral-200">
                                <Ionicons name="search" size={20} color="#9AA4B2" />
                                <TextInput
                                    className="flex-1 ml-3 font-inter-medium text-neutral-900 text-sm"
                                    placeholder="Search..."
                                    placeholderTextColor="#9AA4B2"
                                    value={searchText}
                                    onChangeText={setSearchText}
                                    autoCorrect={false}
                                />
                                {searchText.length > 0 && (
                                    <TouchableOpacity onPress={() => setSearchText('')}>
                                        <Ionicons name="close-circle" size={18} color="#9AA4B2" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    )}

                    {emptyStateMsg ? (
                        <View className="flex-1 items-center justify-center p-8">
                            <Ionicons name="alert-circle-outline" size={48} color="#CDD5DF" />
                            <Text className="text-neutral-400 font-inter-medium text-center mt-4">Calculated based on Selection.</Text>
                            <Text className="text-neutral-900 font-inter-semibold text-center mt-1">{emptyStateMsg}</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={filteredData}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    className="p-4 border-b border-neutral-50 active:bg-neutral-50"
                                    onPress={() => {
                                        if (modalType === 'province') handleSelectProvince(item);
                                        else if (modalType === 'city') handleSelectCity(item);
                                        else if (modalType === 'district') handleSelectDistrict(item);
                                    }}
                                >
                                    <Text className="text-base font-inter-medium text-neutral-900">{item.name}</Text>
                                </TouchableOpacity>
                            )}
                            contentContainerStyle={{ paddingBottom: 40 }}
                            ListEmptyComponent={
                                <View className="p-8 items-center">
                                    <Text className="text-neutral-400 font-inter-medium">No results found.</Text>
                                </View>
                            }
                        />
                    )}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            {/* Header */}
            <View className="px-6 pt-2 pb-4 flex-row items-center gap-4 border-b border-neutral-100">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 border border-neutral-200 rounded-full items-center justify-center"
                >
                    <Ionicons name="arrow-back" size={20} color={Colors.text.DEFAULT} />
                </TouchableOpacity>
                <Text className="text-xl font-inter-bold text-neutral-900">
                    Add Address
                </Text>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 120 }}>
                {/* 1. Recipient Details */}
                <Text className="text-sm font-inter-bold text-neutral-900 mb-4 uppercase tracking-wider opacity-70">Contact Info</Text>

                <View className="bg-white rounded-2xl border border-neutral-200 overflow-hidden mb-6">
                    <TextInput
                        className="px-4 py-3.5 text-sm font-inter-medium text-neutral-900 border-b border-neutral-100"
                        placeholder="Full Name"
                        placeholderTextColor="#9AA4B2"
                        value={formData.recipient_name}
                        onChangeText={(t) => handleChange('recipient_name', t)}
                    />
                    <TextInput
                        className="px-4 py-3.5 text-sm font-inter-medium text-neutral-900"
                        placeholder="Phone Number (+62...)"
                        placeholderTextColor="#9AA4B2"
                        keyboardType="phone-pad"
                        value={formData.phone_number}
                        onChangeText={(t) => handleChange('phone_number', t)}
                    />
                </View>

                {/* 2. Address Details */}
                <Text className="text-sm font-inter-bold text-neutral-900 mb-4 uppercase tracking-wider opacity-70">Location Details</Text>

                {/* Label & Category */}
                <View className="mb-4">
                    <Text className="text-xs font-inter-medium text-neutral-500 mb-2">Address Title (e.g. Home, Office)</Text>
                    <TextInput
                        className="bg-neutral-50 rounded-xl px-4 py-3 text-sm font-inter-medium text-neutral-900 border border-neutral-200"
                        placeholder="Label this address"
                        value={formData.label}
                        onChangeText={(t) => handleChange('label', t)}
                    />
                </View>

                <View className="mb-6">
                    <Text className="text-xs font-inter-medium text-neutral-500 mb-2">Category</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {categories.map((cat) => {
                            const active = formData.category === cat;
                            return (
                                <TouchableOpacity
                                    key={cat}
                                    onPress={() => handleChange('category', cat)}
                                    className={`px-4 py-2 rounded-full border ${active ? 'bg-neutral-900 border-neutral-900' : 'bg-white border-neutral-200'}`}
                                >
                                    <Text className={`text-xs font-inter-medium ${active ? 'text-white' : 'text-neutral-600'}`}>
                                        {cat}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Region Selection */}
                <View className="mb-4 gap-3">
                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            className="flex-1 bg-white border border-neutral-200 rounded-xl px-4 py-3 justify-center"
                            onPress={() => setModalType('province')}
                        >
                            <Text className="text-xs text-neutral-400 font-inter-medium mb-0.5">Province</Text>
                            <Text className={`text-sm font-inter-semibold ${formData.province_name || ''}`} numberOfLines={1} style={{ color: formData.province_name ? Colors.text.DEFAULT : '#D1D5DB' }}>
                                {formData.province_name || 'Select Select'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-1 bg-white border border-neutral-200 rounded-xl px-4 py-3 justify-center"
                            onPress={() => setModalType('city')}
                        >
                            <Text className="text-xs text-neutral-400 font-inter-medium mb-0.5">City / Kota</Text>
                            <Text className={`text-sm font-inter-semibold ${formData.city_name || ''}`} numberOfLines={1} style={{ color: formData.city_name ? Colors.text.DEFAULT : '#D1D5DB' }}>
                                {formData.city_name || 'Select City'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 justify-center"
                        onPress={() => setModalType('district')}
                    >
                        <Text className="text-xs text-neutral-400 font-inter-medium mb-0.5">District / Kecamatan</Text>
                        <Text className={`text-sm font-inter-semibold ${formData.district_name || ''}`} numberOfLines={1} style={{ color: formData.district_name ? Colors.text.DEFAULT : '#D1D5DB' }}>
                            {formData.district_name || 'Select District'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Full Address */}
                <View className="mb-4">
                    <Text className="text-xs font-inter-medium text-neutral-500 mb-2">Full Address</Text>
                    <TextInput
                        className="bg-neutral-50 rounded-xl px-4 py-3 text-sm font-inter-regular text-neutral-900 border border-neutral-200 min-h-[80px]"
                        placeholder="Street name, block, house number..."
                        multiline
                        textAlignVertical="top"
                        value={formData.address_line}
                        onChangeText={(t) => handleChange('address_line', t)}
                    />
                </View>

                {/* Postal Code */}
                <View className="mb-6">
                    <Text className="text-xs font-inter-medium text-neutral-500 mb-2">Postal Code</Text>
                    <TextInput
                        className="bg-neutral-50 rounded-xl px-4 py-3 text-sm font-inter-medium text-neutral-900 border border-neutral-200 w-1/2"
                        placeholder="00000"
                        keyboardType="numeric"
                        value={formData.postal_code}
                        onChangeText={(t) => handleChange('postal_code', t)}
                    />
                </View>

                {/* Map Integration */}
                <Text className="text-sm font-inter-bold text-neutral-900 mb-4 uppercase tracking-wider opacity-70">Pin Point</Text>

                <TouchableOpacity
                    className="h-48 rounded-2xl overflow-hidden relative bg-neutral-100 items-center justify-center border border-neutral-200 active:opacity-95 mb-6"
                    onPress={() => router.push('/address/map-picker')}
                >
                    {/* Placeholder Map Image */}
                    <Image
                        source={{ uri: 'https://placehold.co/600x400/png?text=Open+Map' }}
                        className="w-full h-full opacity-60"
                        resizeMode="cover"
                    />

                    <View className="absolute bg-white/90 backdrop-blur-sm px-4 py-3 rounded-full flex-row items-center gap-2 shadow-sm">
                        <Ionicons name="location" size={20} color="#EF4444" />
                        <Text className="text-sm font-inter-semibold text-neutral-900">
                            {tempAddressLocation ? 'Location Set' : 'Set Location on Map'}
                        </Text>
                    </View>

                    {tempAddressLocation && (
                        <View className="absolute bottom-3 left-3 right-3 bg-black/75 px-3 py-2 rounded-lg">
                            <Text className="text-white text-[10px] font-inter-regular text-center" numberOfLines={1}>
                                {tempAddressLocation.address}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>

            </ScrollView>

            {/* Bottom Actions */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-6 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
                <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-sm font-inter-medium text-neutral-600">Set as Primary Address</Text>
                    <TouchableOpacity
                        onPress={() => handleChange('is_default', !formData.is_default)}
                        className={`w-12 h-7 rounded-full ${formData.is_default ? 'bg-neutral-900' : 'bg-neutral-200'} justify-center px-1`}
                    >
                        <View className={`w-5 h-5 rounded-full bg-white shadow-sm ${formData.is_default ? 'self-end' : 'self-start'}`} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    onPress={handleSave}
                    disabled={loading}
                    className="w-full h-14 rounded-full items-center justify-center bg-primary shadow-xl shadow-primary/30"
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white text-base font-inter-bold">
                            Save Address
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Modals */}
            <Modal visible={modalType !== null} animationType="slide" transparent>
                {renderModalContent()}
            </Modal>
        </SafeAreaView>
    );
}
