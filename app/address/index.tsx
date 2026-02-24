import { Colors } from '@/constants/theme';
import { deleteAddress, fetchAddresses } from '@/services/addressService';
import { useMedinaStore } from '@/store/useMedinaStore';
import type { Address } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import DeleteAddressModal from '@/components/address/DeleteAddressModal';
import DeleteSuccessModal from '@/components/address/DeleteSuccessModal';

export default function AddressScreen() {
    const { mode } = useLocalSearchParams<{ mode: string }>();
    const insets = useSafeAreaInsets();
    const isSelectionMode = mode === 'select';

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [addressToDeleteId, setAddressToDeleteId] = useState<string | null>(null);

    const isAuthenticated = useMedinaStore((s) => s.auth.isAuthenticated);
    const setCheckoutAddress = useMedinaStore((s) => s.setCheckoutAddress);
    const selectedAddressId = useMedinaStore((s) => s.checkout.addressId);

    // For local selection state before confirming
    const [localSelectedId, setLocalSelectedId] = useState<string | null>(selectedAddressId);

    const loadAddresses = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            setLoading(true);
            const data = await fetchAddresses();
            setAddresses(data);

            // If in selection mode and we have a stored ID, ensure it's selected locally if not already
            if (isSelectionMode && selectedAddressId) {
                setLocalSelectedId(selectedAddressId);
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, isSelectionMode, selectedAddressId]);

    useFocusEffect(
        useCallback(() => {
            loadAddresses();
        }, [loadAddresses])
    );

    const handleDelete = (id: string) => {
        setAddressToDeleteId(id);
        setDeleteModalVisible(true);
    };

    const confirmDelete = async () => {
        if (!addressToDeleteId) return;
        try {
            await deleteAddress(addressToDeleteId);
            setAddresses((prev) => prev.filter((a) => a.id !== addressToDeleteId));
            setDeleteModalVisible(false);

            // If we deleted the selected address, clear selection
            if (localSelectedId === addressToDeleteId) {
                setLocalSelectedId(null);
            }

            setTimeout(() => setSuccessModalVisible(true), 200);
        } catch (error) {
            setDeleteModalVisible(false);
            Alert.alert('Error', 'Failed to delete address');
        }
    };

    const handleSuccessDone = () => {
        setSuccessModalVisible(false);
        setAddressToDeleteId(null);
    };

    const handleSelect = (id: string) => {
        if (isSelectionMode) {
            setLocalSelectedId(id);
        }
    };

    const handleSaveSelection = () => {
        if (isSelectionMode) {
            if (localSelectedId) {
                setCheckoutAddress(localSelectedId);
                router.back();
            } else {
                Alert.alert('Selection Required', 'Please select an address to proceed.');
            }
        } else {
            router.back();
        }
    };

    const renderItem = ({ item }: { item: Address }) => {
        const isSelected = isSelectionMode && localSelectedId === item.id;
        const isDefault = item.is_default;

        return (
            <TouchableOpacity
                className={`flex-row p-4 rounded-2xl mb-4 items-start gap-3 border bg-white ${isSelected ? 'border-primary bg-primary/5' : 'border-neutral-100'
                    }`}
                onPress={() => isSelectionMode ? handleSelect(item.id) : null}
                activeOpacity={0.7}
                style={!isSelected ? {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 2
                } : {}}
            >
                {/* Icon / Selection Indicator */}
                <View className="mt-1">
                    {isSelectionMode ? (
                        <TouchableOpacity onPress={() => handleSelect(item.id)}>
                            <View className={`w-5 h-5 rounded-full border items-center justify-center ${isSelected ? 'border-primary bg-primary' : 'border-neutral-300'}`}>
                                {isSelected && <View className="w-2.5 h-2.5 rounded-full bg-white" />}
                            </View>
                        </TouchableOpacity>
                    ) : (
                        <View className={`w-10 h-10 rounded-full items-center justify-center ${isDefault ? 'bg-primary/10' : 'bg-neutral-50'}`}>
                            <Ionicons
                                name={isDefault ? "home" : "location-outline"}
                                size={20}
                                color={isDefault ? Colors.primary.DEFAULT : Colors.neutral[500]}
                            />
                        </View>
                    )}
                </View>

                {/* Content */}
                <View className="flex-1">
                    {/* Header: Label + Actions */}
                    <View className="flex-row justify-between items-center mb-1">
                        <View className="flex-row items-center gap-2 flex-1">
                            <Text className="text-neutral-900 text-base font-inter-semibold" numberOfLines={1}>{item.label}</Text>
                            {isDefault && (
                                <View className="bg-primary/10 px-2 py-0.5 rounded-md">
                                    <Text className="text-primary text-[10px] font-inter-medium">Default</Text>
                                </View>
                            )}
                        </View>

                        {/* Actions (Only show in view mode) */}
                        {!isSelectionMode && (
                            <View className="flex-row gap-2 ml-2">
                                <TouchableOpacity
                                    onPress={() => router.push({ pathname: '/address/edit', params: { id: item.id } })}
                                    className="p-1.5 rounded-full bg-neutral-50"
                                >
                                    <Ionicons name="pencil" size={16} color={Colors.neutral[500]} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => handleDelete(item.id)}
                                    className="p-1.5 rounded-full bg-red-50"
                                >
                                    <Ionicons name="trash-outline" size={16} color={Colors.error} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Recipient info */}
                    <Text className="text-neutral-900 text-sm font-inter-medium mb-0.5">
                        {item.recipient_name}
                    </Text>

                    <Text className="text-neutral-500 text-xs font-inter leading-5">
                        {item.address_line}, {item.city}, {item.province} {item.postal_code}
                    </Text>

                    {item.phone_number && (
                        <Text className="text-neutral-500 text-xs font-inter mt-1">
                            {item.phone_number}
                        </Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    if (!isAuthenticated) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center p-8">
                <Ionicons name="location-outline" size={64} color={Colors.text.muted} />
                <Text className="text-lg text-neutral-900 font-inter-bold mt-4">
                    Sign in to manage addresses
                </Text>
                <TouchableOpacity
                    onPress={() => router.push('/(auth)/login')}
                    className="bg-primary px-8 py-3 rounded-full mt-6 shadow-lg shadow-primary/30"
                >
                    <Text className="text-white font-inter-bold">Sign In</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-neutral-50" edges={['top']}>
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center justify-between bg-white border-b border-neutral-100">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 border border-neutral-200 rounded-full items-center justify-center"
                >
                    <Ionicons name="arrow-back" size={20} color={Colors.text.DEFAULT} />
                </TouchableOpacity>
                <Text className="text-lg font-inter-semibold text-neutral-900">
                    {isSelectionMode ? 'Select Address' : 'My Address'}
                </Text>
                <TouchableOpacity
                    onPress={() => router.push('/address/add')}
                    className="w-10 h-10 items-center justify-center"
                >
                    <Ionicons name="add" size={24} color={Colors.primary.DEFAULT} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
                </View>
            ) : (
                <View className="flex-1">
                    <FlatList
                        data={addresses}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
                        ListEmptyComponent={
                            <View className="items-center justify-center py-20">
                                <View className="w-20 h-20 bg-neutral-100 rounded-full items-center justify-center mb-4">
                                    <Ionicons name="location-outline" size={40} color={Colors.text.muted} />
                                </View>
                                <Text className="text-neutral-900 text-lg font-inter-semibold">No addresses yet</Text>
                                <Text className="text-neutral-500 text-sm font-inter text-center mt-2 px-10">
                                    Add your delivery address to start shopping
                                </Text>
                                <TouchableOpacity
                                    onPress={() => router.push('/address/add')}
                                    className="mt-6 flex-row items-center gap-2 bg-white border border-primary px-6 py-3 rounded-full shadow-sm"
                                >
                                    <Ionicons name="add" size={20} color={Colors.primary.DEFAULT} />
                                    <Text className="text-primary font-inter-medium">Add New Address</Text>
                                </TouchableOpacity>
                            </View>
                        }
                    />
                </View>
            )}

            {/* Bottom Button (Confirm Selection) */}
            {isSelectionMode && (
                <View className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-neutral-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]" style={{ paddingBottom: Math.max(insets.bottom, 24) }}>
                    <TouchableOpacity
                        onPress={handleSaveSelection}
                        className={`w-full py-4 rounded-full items-center justify-center shadow-lg ${localSelectedId ? 'bg-primary shadow-primary/30' : 'bg-neutral-200 shadow-none'
                            }`}
                        activeOpacity={0.9}
                        disabled={!localSelectedId}
                        style={{ elevation: 4 }}
                    >
                        <Text className={`text-base font-inter-semibold ${localSelectedId ? 'text-white' : 'text-neutral-400'}`}>
                            Confirm Selection
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Delete Confirmation & Success Modals */}
            <DeleteAddressModal
                visible={deleteModalVisible}
                onCancel={() => setDeleteModalVisible(false)}
                onDelete={confirmDelete}
            />
            <DeleteSuccessModal
                visible={successModalVisible}
                onDone={handleSuccessDone}
            />
        </SafeAreaView>
    );
}
