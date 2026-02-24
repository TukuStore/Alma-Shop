import PaymentFailedModal from '@/components/wallet/PaymentFailedModal';
import PaymentSuccessModal from '@/components/wallet/PaymentSuccessModal';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PaymentDetailsScreen() {
    const { amount, method } = useLocalSearchParams<{ amount: string; method: string }>();
    const [timeLeft, setTimeLeft] = useState(3600); // 1 hour in seconds
    const [isGuideExpanded, setIsGuideExpanded] = useState(true);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showFailed, setShowFailed] = useState(false);

    // Mock Transaction Data
    const transactionId = "TP1892749";
    const transferTo = "218972125981234";

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setShowFailed(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return {
            h: h.toString().padStart(2, '0'),
            m: m.toString().padStart(2, '0'),
            s: s.toString().padStart(2, '0'),
        };
    };

    const time = formatTime(timeLeft);

    const handleCopy = async () => {
        await Clipboard.setStringAsync(transferTo);
        // In a real app, show a toast here
        alert('Account number copied!');
    };

    const handleBackToDashboard = () => {
        router.dismissAll(); // Go back to root
        router.replace('/(tabs)/profile'); // Ensure we are on profile/wallet tab basically
        // Or specifically for this flow:
        router.navigate('/wallet');
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
                    Top Up Payment
                </Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
                <View className="p-6 gap-6 items-center">

                    {/* Timer */}
                    <View className="flex-row items-center gap-4 bg-red-50 px-6 py-4 rounded-3xl">
                        <View className="items-center">
                            <Text className="text-xl font-manrope-semibold text-red-500">{time.h}</Text>
                            <Text className="text-xs font-manrope text-red-500">Hours</Text>
                        </View>
                        <Text className="text-sm font-manrope text-red-500">:</Text>
                        <View className="items-center">
                            <Text className="text-xl font-manrope-semibold text-red-500">{time.m}</Text>
                            <Text className="text-xs font-manrope text-red-500">Minutes</Text>
                        </View>
                        <Text className="text-sm font-manrope text-red-500">:</Text>
                        <View className="items-center">
                            <Text className="text-xl font-manrope-semibold text-red-500">{time.s}</Text>
                            <Text className="text-xs font-manrope text-red-500">Seconds</Text>
                        </View>
                    </View>

                    {/* Amount */}
                    <View className="items-center gap-2">
                        <Text className="text-base font-manrope text-neutral-400">Top Up Amount</Text>
                        <Text className="text-5xl font-manrope-semibold text-neutral-900">Rp {amount || '1000'}</Text>
                    </View>

                    {/* Details Card */}
                    <View className="w-full p-4 rounded-2xl border border-neutral-100 gap-4">
                        <View className="flex-row justify-between items-center">
                            <Text className="text-base font-inter text-neutral-400">Transaction ID :</Text>
                            <Text className="text-base font-inter-medium text-neutral-900">{transactionId}</Text>
                        </View>
                        <View className="flex-row justify-between items-center">
                            <Text className="text-base font-inter text-neutral-400">Transfer To :</Text>
                            <View className="flex-row items-center gap-2">
                                <Text className="text-base font-inter-medium text-neutral-900">{transferTo}</Text>
                                <TouchableOpacity onPress={handleCopy}>
                                    <Ionicons name="copy-outline" size={20} color={Colors.neutral[400]} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Instructions */}
                    <View className="w-full p-4 bg-neutral-50 rounded-2xl gap-6">
                        <TouchableOpacity
                            onPress={() => setIsGuideExpanded(!isGuideExpanded)}
                            className="flex-row justify-between items-center"
                        >
                            <Text className="text-base font-inter-medium text-neutral-900">Step-by-Step Guide</Text>
                            <Ionicons
                                name={isGuideExpanded ? "chevron-up" : "chevron-down"}
                                size={24}
                                color={Colors.neutral[300]}
                            />
                        </TouchableOpacity>

                        {isGuideExpanded && (
                            <View className="gap-6">
                                <StepItem
                                    step="1"
                                    title="Log in to Your BCA Account"
                                    desc="Open the BCA mobile app or visit a BCA ATM/Internet Banking nearest your location."
                                />
                                <StepItem
                                    step="2"
                                    title="Select Transfer Option"
                                    desc='Choose "Transfer" or "Send Money" and select "To Another Bank" or "To Virtual Account."'
                                />
                                <StepItem
                                    step="3"
                                    title="Enter Payment Details"
                                    desc={`Account Number: ${transferTo}\nBeneficiary Name: AlmaStore Wallet\nBank Name: BCA\nAmount: Rp ${amount || '1000'}`}
                                />
                                <StepItem
                                    step="4"
                                    title="Confirm and Transfer"
                                    desc="Verify the details, then confirm the transfer. Keep the receipt for your records."
                                />
                                <StepItem
                                    step="5"
                                    title="Check Payment Status"
                                    desc="Payment must be completed within 1 minute."
                                />
                            </View>
                        )}
                    </View>

                </View>
            </ScrollView>

            {/* Bottom Button */}
            <View className="p-6 border-t border-neutral-100 bg-white gap-3">
                <TouchableOpacity
                    onPress={() => setShowSuccess(true)}
                    className="w-full py-3 bg-green-50 border border-green-200 rounded-full items-center justify-center"
                >
                    <Text className="text-green-600 text-sm font-inter-medium">Simulate Payment Success</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleBackToDashboard}
                    className="w-full py-3 bg-white border border-primary rounded-full items-center justify-center"
                >
                    <Text className="text-primary text-sm font-inter-medium">Back to Dashboard</Text>
                </TouchableOpacity>
            </View>

            <PaymentSuccessModal
                visible={showSuccess}
                onDone={handleBackToDashboard}
            />

            <PaymentFailedModal
                visible={showFailed}
                onTryAgain={() => {
                    setShowFailed(false);
                    setTimeLeft(3600); // Reset timer
                }}
                onClose={() => setShowFailed(false)}
            />
        </SafeAreaView>
    );
}

function StepItem({ step, title, desc }: { step: string; title: string; desc: string }) {
    return (
        <View className="flex-row gap-3">
            <Text className="text-sm font-inter-medium text-primary mt-0.5">{step}.</Text>
            <View className="flex-1 gap-1">
                <Text className="text-sm font-inter-medium text-neutral-900">{title}</Text>
                <Text className="text-xs font-inter-regular text-neutral-500 leading-4">{desc}</Text>
            </View>
        </View>
    )
}
