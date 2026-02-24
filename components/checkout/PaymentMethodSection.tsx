import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

// Mock payment methods
const PAYMENT_METHODS = [
    { id: 'bank_transfer', name: 'Bank Transfer', icon: 'card-outline' },
    { id: 'ewallet', name: 'E-Wallet (GoPay, OVO)', icon: 'wallet-outline' },
    { id: 'cod', name: 'Cash on Delivery', icon: 'cash-outline' },
];

interface PaymentMethodSectionProps {
    selectedMethod: string;
    onSelect: (methodId: string) => void;
}

export default function PaymentMethodSection({ selectedMethod, onSelect }: PaymentMethodSectionProps) {
    return (
        <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-3 font-playfair">
                Payment Method
            </Text>
            <View className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {PAYMENT_METHODS.map((method, index) => (
                    <TouchableOpacity
                        key={method.id}
                        onPress={() => onSelect(method.id)}
                        className={`p-4 flex-row items-center justify-between ${index !== PAYMENT_METHODS.length - 1 ? 'border-b border-gray-100' : ''
                            } active:bg-gray-50`}
                    >
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-3">
                                <Ionicons name={method.icon as any} size={20} color={Colors.text.DEFAULT} />
                            </View>
                            <Text className="text-gray-900 font-medium">{method.name}</Text>
                        </View>
                        <View
                            className={`w-5 h-5 rounded-full border items-center justify-center ${selectedMethod === method.id
                                ? 'border-primary bg-primary'
                                : 'border-gray-300 bg-white'
                                }`}
                        >
                            {selectedMethod === method.id && (
                                <Ionicons name="checkmark" size={12} color="white" />
                            )}
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}
