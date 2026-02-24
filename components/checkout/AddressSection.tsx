import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface AddressSectionProps {
    address?: {
        name: string;
        phone: string;
        fullAddress: string;
        label: string;
    };
    onChange: () => void;
}

export default function AddressSection({ address, onChange }: AddressSectionProps) {
    return (
        <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-3 font-playfair">
                Shipping Address
            </Text>
            <TouchableOpacity
                onPress={onChange}
                className="bg-white p-4 rounded-xl border border-gray-200 flex-row items-center justify-between active:bg-gray-50"
            >
                <View className="flex-1 mr-4">
                    {address ? (
                        <>
                            <View className="flex-row items-center mb-1">
                                <Ionicons name="location" size={16} color={Colors.primary.DEFAULT} />
                                <Text className="font-bold text-gray-900 ml-1.5">
                                    {address.label}
                                </Text>
                            </View>
                            <Text className="text-gray-900 font-medium mb-0.5">
                                {address.name} <Text className="text-gray-500 font-normal">({address.phone})</Text>
                            </Text>
                            <Text className="text-gray-500 text-sm leading-5">
                                {address.fullAddress}
                            </Text>
                        </>
                    ) : (
                        <View className="flex-row items-center">
                            <Ionicons name="add-circle-outline" size={24} color={Colors.primary.DEFAULT} />
                            <Text className="text-gray-500 ml-2">Add Shipping Address</Text>
                        </View>
                    )}
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.text.muted} />
            </TouchableOpacity>
        </View>
    );
}
