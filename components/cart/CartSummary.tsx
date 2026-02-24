import { formatPrice } from '@/lib/currency';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CartSummaryProps {
    total: number;
    onCheckout: () => void;
    disabled?: boolean;
}

export default function CartSummary({ total, onCheckout, disabled = false }: CartSummaryProps) {
    const insets = useSafeAreaInsets();

    return (
        <View
            className="bg-white px-6 pt-6 border-t border-neutral-100 flex-row items-center justify-between"
            style={{ paddingBottom: Math.max(insets.bottom, 24) }}
        >
            {/* Total Charge */}
            <View className="flex-col gap-1">
                <Text className="text-sm text-neutral-400 font-inter leading-5">Total Charge</Text>
                <Text className="text-2xl font-inter-medium text-neutral-900 leading-8">
                    {formatPrice(total)}
                </Text>
            </View>

            {/* Checkout Button */}
            <TouchableOpacity
                onPress={onCheckout}
                disabled={disabled}
                className={`py-2.5 px-4 rounded-full flex-row items-center gap-2.5 ${disabled ? 'bg-neutral-100' : 'bg-[#FF6B57]'
                    }`}
                activeOpacity={0.8}
            >
                <Text
                    className={`text-sm font-inter-medium leading-5 ${disabled ? 'text-neutral-300' : 'text-white'
                        }`}
                >
                    Checkout Now
                </Text>
                <Ionicons
                    name="arrow-forward"
                    size={20}
                    color={disabled ? '#CDD5DF' : 'white'}
                />
            </TouchableOpacity>
        </View>
    );
}
