import { Colors } from '@/constants/theme';
import { useMedinaStore } from '@/store/useMedinaStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type PaymentMethodType = 'single' | 'group';

interface PaymentOption {
    id: string;
    name: string;
    description?: string;
    icon: keyof typeof Ionicons.glyphMap;
    type: PaymentMethodType;
    children?: PaymentSubOption[];
}

interface PaymentSubOption {
    id: string;
    name: string;
    logo?: string;
}

const PAYMENT_METHODS: PaymentOption[] = [
    {
        id: 'cod',
        name: 'Cash on Destination',
        description: 'Pay cash upon arrival at destination.',
        icon: 'cash-outline',
        type: 'single'
    },
    {
        id: 'qris',
        name: 'QRIS',
        description: 'Scan QRIS and easily pay your bills.',
        icon: 'qr-code-outline',
        type: 'single'
    },
    {
        id: 'bank_transfer',
        name: 'Bank Transfer',
        description: 'Transfer funds directly from your bank.',
        icon: 'business-outline',
        type: 'group',
        children: [
            { id: 'bca', name: 'Bank Central Asia' },
            { id: 'bni', name: 'Bank Nasional Indonesia' },
            { id: 'bri', name: 'Bank Rakyat Indonesia' },
            { id: 'cimb', name: 'CIMB Niaga' },
        ]
    },
    {
        id: 'ewallet',
        name: 'E-Wallet',
        description: 'Pay instantly with your digital wallet.',
        icon: 'wallet-outline',
        type: 'group',
        children: [
            { id: 'paypal', name: 'Paypal' },
            { id: 'dana', name: 'Dana' },
            { id: 'ovo', name: 'OVO' },
            { id: 'shopeepay', name: 'Shopee Pay' },
            { id: 'apple-pay', name: 'Apple Pay' },
        ]
    },
    {
        id: 'card',
        name: 'Credit or Debit Card',
        description: 'Use your card for secure payments.',
        icon: 'card-outline',
        type: 'group',
        children: [
            { id: 'mastercard', name: 'Master Card' },
            { id: 'visa', name: 'Visa' },
            { id: 'amex', name: 'American Express' },
        ]
    },
    {
        id: 'crypto',
        name: 'CryptoCurrency',
        description: 'Pay with crypto for fast transactions.',
        icon: 'logo-bitcoin',
        type: 'group',
        children: [
            { id: 'bitcoin', name: 'Bitcoin' },
            { id: 'ethereum', name: 'Ethereum' },
            { id: 'usdt', name: 'USDT' },
        ]
    }
];

export default function PaymentMethodScreen() {
    const router = useRouter();
    const setPaymentMethod = useMedinaStore((s) => s.setPaymentMethod);
    const existingMethod = useMedinaStore((s) => s.checkout.paymentMethod);

    // Initial state based on existing selection
    const [selectedId, setSelectedId] = useState<string>(existingMethod || '');

    // Determine which group should be expanded initially
    const getInitialExpanded = (): string[] => {
        if (!existingMethod) return ['bank_transfer']; // Default
        const parent = PAYMENT_METHODS.find(g => g.children?.some(c => c.id === existingMethod));
        return parent ? [parent.id] : [];
    };

    const [expandedGroups, setExpandedGroups] = useState<string[]>(getInitialExpanded());

    const toggleGroup = (id: string) => {
        setExpandedGroups(prev =>
            prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
        );
    };

    const handleSelect = (id: string, isGroup: boolean) => {
        if (isGroup) {
            toggleGroup(id);
        } else {
            setSelectedId(id);
        }
    };

    const handleSubSelect = (subId: string) => {
        setSelectedId(subId);
    };

    const handleSave = () => {
        if (selectedId) {
            setPaymentMethod(selectedId);
        }
        router.back();
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center gap-4 border-b border-neutral-100">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 bg-primary rounded-full items-center justify-center"
                >
                    <Ionicons name="arrow-back" size={20} color="white" />
                </TouchableOpacity>
                <Text className="flex-1 text-center text-xl font-inter-semibold text-neutral-900">
                    Payment Method
                </Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1 px-6 py-6" contentContainerStyle={{ gap: 24, paddingBottom: 100 }}>
                {PAYMENT_METHODS.map((method) => (
                    <View
                        key={method.id}
                        className={`rounded-[20px] border ${expandedGroups.includes(method.id) || selectedId === method.id ? 'border-neutral-100 bg-white' : 'border-neutral-100 bg-white'}`}
                    >
                        <TouchableOpacity
                            onPress={() => handleSelect(method.id, method.type === 'group')}
                            className="p-4 flex-row items-start gap-4"
                        >
                            <View className="w-10 h-10 items-center justify-center">
                                <Ionicons name={method.icon} size={24} color={Colors.primary.DEFAULT} />
                            </View>

                            <View className="flex-1 gap-0.5">
                                <Text className="text-sm font-inter-medium text-neutral-900">{method.name}</Text>
                                <Text className="text-xs font-inter-regular text-neutral-400">{method.description}</Text>
                            </View>

                            {method.type === 'single' ? (
                                <View className={`w-5 h-5 rounded-full border items-center justify-center ${selectedId === method.id ? 'border-primary' : 'border-neutral-300'}`}>
                                    {selectedId === method.id && <View className="w-3 h-3 rounded-full bg-primary" />}
                                </View>
                            ) : (
                                <Ionicons
                                    name={expandedGroups.includes(method.id) ? "chevron-up" : "chevron-down"}
                                    size={24}
                                    color={Colors.primary.DEFAULT}
                                />
                            )}
                        </TouchableOpacity>

                        {/* Sub Options */}
                        {method.type === 'group' && expandedGroups.includes(method.id) && method.children && (
                            <View className="px-4 pb-4 gap-4">
                                {method.children.map((child) => (
                                    <TouchableOpacity
                                        key={child.id}
                                        onPress={() => handleSubSelect(child.id)}
                                        className="flex-row items-center justify-between"
                                    >
                                        <View className="flex-row items-center gap-3">
                                            <View className="w-9 h-6 bg-neutral-100 rounded items-center justify-center">
                                                <Text className="text-[9px] font-inter-bold text-neutral-500">{child.name.substring(0, 3).toUpperCase()}</Text>
                                            </View>
                                            <Text className="text-sm font-inter text-neutral-600">{child.name}</Text>
                                        </View>

                                        <View className={`w-5 h-5 rounded-full border items-center justify-center ${selectedId === child.id ? 'border-primary' : 'border-neutral-300'}`}>
                                            {selectedId === child.id && <View className="w-3 h-3 rounded-full bg-primary" />}
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                ))}
            </ScrollView>

            {/* Bottom Button */}
            <View className="p-6 border-t border-neutral-100 bg-white">
                <TouchableOpacity
                    onPress={handleSave}
                    className="w-full py-4 bg-primary rounded-full items-center justify-center shadow-sm shadow-primary/20"
                >
                    <Text className="text-white text-base font-inter-semibold">Save Payment Method</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
