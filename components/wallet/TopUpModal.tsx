import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface TopUpModalProps {
    visible: boolean;
    onClose: () => void;
    onTopUp?: (amount: number) => void;
}

const PRESET_AMOUNTS = [100, 200, 300, 400, 500, 600, 700, 800];

export default function TopUpModal({ visible, onClose, onTopUp }: TopUpModalProps) {
    const [amount, setAmount] = useState<string>('1000'); // Default matching Figma
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

    const handleSelectAmount = (value: number) => {
        setAmount(value.toString());
        setSelectedAmount(value);
    };

    const handleConfirm = () => {
        const value = parseInt(amount.replace(/[^0-9]/g, ''), 10);
        if (value > 0) {
            onClose();
            router.push(`/wallet/payment-methods?amount=${value}`);
        } else {
            alert('Please enter a valid amount');
        }
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-neutral-900/40">
                <View className="bg-white rounded-t-3xl p-6 pb-10 gap-8">
                    {/* Header */}
                    <View className="flex-row justify-between items-center">
                        <Text className="text-2xl font-inter-semibold text-neutral-900">Top Up</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={Colors.neutral[400]} />
                        </TouchableOpacity>
                    </View>

                    {/* Amount Display */}
                    <View className="items-center gap-4">
                        <Text className="text-neutral-400 text-base font-inter">Top Up Amount</Text>
                        <View className="flex-row items-baseline gap-2">
                            <Text className="text-5xl font-inter-medium text-neutral-900">$</Text>
                            <TextInput
                                className="text-5xl font-inter-medium text-neutral-900 min-w-[100px] text-center"
                                value={amount}
                                onChangeText={(text) => {
                                    setAmount(text);
                                    setSelectedAmount(null); // Clear preset selection on manual edit
                                }}
                                keyboardType="numeric"
                                placeholder="0"
                            />
                        </View>
                        <View className="h-[1px] w-16 bg-neutral-900 transform rotate-90" />
                    </View>

                    {/* Preset Amounts Grid */}
                    <View className="flex-row flex-wrap gap-4">
                        {PRESET_AMOUNTS.map((value) => (
                            <TouchableOpacity
                                key={value}
                                onPress={() => handleSelectAmount(value)}
                                className={`flex-grow basis-[20%] py-3 px-4 rounded-3xl border items-center justify-center ${selectedAmount === value
                                    ? 'border-primary bg-primary/5'
                                    : 'border-neutral-100 bg-white'
                                    }`}
                            >
                                <Text
                                    className={`text-base font-inter ${selectedAmount === value
                                        ? 'text-primary font-inter-medium'
                                        : 'text-neutral-500'
                                        }`}
                                >
                                    ${value}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Payment Button */}
                    <TouchableOpacity
                        onPress={handleConfirm}
                        className="w-full h-12 bg-primary rounded-full flex-row items-center justify-center gap-2 shadow-sm shadow-black/5"
                    >
                        <Text className="text-white text-sm font-inter-medium">Select Payment Method</Text>
                        <Ionicons name="arrow-forward" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
