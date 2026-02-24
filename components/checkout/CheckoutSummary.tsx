import { formatPrice } from '@/lib/currency';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface CheckoutSummaryProps {
    subtotal: number;
    shipping: number;
    total: number;
    onPlaceOrder: () => void;
    disabled?: boolean;
}

export default function CheckoutSummary({ subtotal, shipping, total, onPlaceOrder, disabled }: CheckoutSummaryProps) {
    return (
        <View className="bg-white p-5 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] border-t border-gray-100">
            <View className="gap-2 mb-4">
                <View className="flex-row justify-between">
                    <Text className="text-gray-500">Subtotal</Text>
                    <Text className="font-bold text-gray-900">{formatPrice(subtotal)}</Text>
                </View>
                <View className="flex-row justify-between">
                    <Text className="text-gray-500">Shipping</Text>
                    <Text className={`font-bold ${shipping === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                        {shipping === 0 ? 'Free' : formatPrice(shipping)}
                    </Text>
                </View>
                {/* Tax or other fees can go here */}
                <View className="flex-row justify-between">
                    <Text className="text-gray-500">Tax (11%)</Text>
                    <Text className="font-bold text-gray-900">{formatPrice(subtotal * 0.11)}</Text>
                </View>
                <View className="h-px bg-gray-200 my-2" />
                <View className="flex-row justify-between items-center">
                    <Text className="text-lg font-bold text-gray-900">Total Payment</Text>
                    <Text className="text-xl font-bold text-primary font-playfair">
                        {formatPrice(total + (subtotal * 0.11))}
                    </Text>
                </View>
            </View>

            <TouchableOpacity
                onPress={onPlaceOrder}
                disabled={disabled}
                className={`rounded-xl py-4 flex-row items-center justify-center gap-2 shadow-sm ${disabled ? 'bg-gray-300' : 'bg-primary'
                    }`}
                activeOpacity={0.9}
            >
                <Text className="text-white font-bold text-lg font-playfair">Place Order</Text>
                <Ionicons name="checkmark-circle-outline" size={20} color="white" />
            </TouchableOpacity>
        </View>
    );
}
