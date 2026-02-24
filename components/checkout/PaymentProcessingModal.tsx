import { paymentService } from '@/services/paymentService';
import type { PaymentMethod } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React from 'react';
import {
    Alert,
    Modal,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type Props = {
    visible: boolean;
    onClose: () => void;
    orderId: string;
    amount: number;
    method: PaymentMethod;
    userId: string;
    onSuccess?: () => void;
};

type BankInfo = {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
};

export default function PaymentProcessingModal({
    visible,
    onClose,
    orderId,
    amount,
    method,
    userId,
    onSuccess,
}: Props) {
    const [processing, setProcessing] = React.useState(false);
    const [paymentResult, setPaymentResult] = React.useState<any>(null);
    const [bankDetails, setBankDetails] = React.useState<BankInfo[]>([]);

    const formatPrice = (price: number) => `Rp ${price.toLocaleString('id-ID')}`;

    const handleProcessPayment = async () => {
        setProcessing(true);
        try {
            const result = await paymentService.processPayment({
                orderId,
                amount,
                method,
                userId,
            });

            setPaymentResult(result);

            if (result.status === 'success' && onSuccess) {
                setTimeout(() => {
                    onSuccess();
                }, 2000);
            }

            if (method === 'bank_transfer') {
                setBankDetails(paymentService.getBankTransferDetails(amount));
            }
        } catch (error) {
            console.error('Payment error:', error);
        } finally {
            setProcessing(false);
        }
    };

    const copyToClipboard = async (text: string) => {
        await Clipboard.setStringAsync(text);
        Alert.alert('Copied', 'Bank information copied to clipboard');
    };

    const getMethodInfo = () => {
        switch (method) {
            case 'cod':
                return {
                    title: 'Cash on Delivery',
                    icon: 'cash-outline',
                    color: '#10B981',
                    description: 'Pay cash when your order arrives at your location.',
                };
            case 'qris':
                return {
                    title: 'QRIS Payment',
                    icon: 'qr-code-outline',
                    color: '#3B82F6',
                    description: 'Scan the QR code below to complete your payment.',
                };
            case 'bank_transfer':
                return {
                    title: 'Bank Transfer',
                    icon: 'swap-horizontal-outline',
                    color: '#8B5CF6',
                    description: 'Transfer to one of the following bank accounts:',
                };
            case 'ewallet':
                return {
                    title: 'E-Wallet',
                    icon: 'wallet-outline',
                    color: '#F59E0B',
                    description: 'Select your e-wallet provider to continue:',
                };
            case 'card':
                return {
                    title: 'Card Payment',
                    icon: 'card-outline',
                    color: '#EF4444',
                    description: 'Secure payment with your credit or debit card.',
                };
            case 'crypto':
                return {
                    title: 'Cryptocurrency',
                    icon: 'logo-bitcoin',
                    color: '#F97316',
                    description: 'Pay with cryptocurrency - fast and secure.',
                };
            default:
                return {
                    title: 'Unknown Payment',
                    icon: 'cash-outline',
                    color: '#9CA3AF',
                    description: 'Unknown payment method',
                };
        }
    };

    const methodInfo = getMethodInfo();

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <Pressable className="flex-1 justify-end bg-black/50" onPress={onClose}>
                <Pressable
                    className="bg-white rounded-t-3xl w-full max-h-[90%]"
                    onPress={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <View className="px-6 pt-5 pb-4 border-b border-neutral-100">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-xl font-inter-semibold text-neutral-900">
                                Payment
                            </Text>
                            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <Ionicons name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <ScrollView className="px-6 py-4" showsVerticalScrollIndicator={false}>
                        {/* Order Summary */}
                        <View className="bg-neutral-50 rounded-xl p-4 mb-6">
                            <View className="flex-row items-center justify-between mb-2">
                                <Text className="text-sm font-inter-semibold text-neutral-500">Order ID</Text>
                                <Text className="text-sm font-inter-bold text-neutral-900">
                                    #{orderId.slice(0, 8).toUpperCase()}
                                </Text>
                            </View>
                            <View className="flex-row items-center justify-between">
                                <Text className="text-sm font-inter-semibold text-neutral-500">Total Amount</Text>
                                <Text className="text-lg font-inter-bold text-primary">
                                    {formatPrice(amount)}
                                </Text>
                            </View>
                        </View>

                        {!paymentResult ? (
                            // Initial State - Show payment method info
                            <>
                                <View className="flex-row items-center gap-3 mb-6">
                                    <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: `${methodInfo.color}15` }}>
                                        <Ionicons name={methodInfo.icon as any} size={24} color={methodInfo.color} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-base font-inter-semibold text-neutral-900">
                                            {methodInfo.title}
                                        </Text>
                                        <Text className="text-sm font-inter text-neutral-500">
                                            {methodInfo.description}
                                        </Text>
                                    </View>
                                </View>

                                {/* QR Code Display for QRIS */}
                                {method === 'qris' && (
                                    <View className="bg-white border-2 border-neutral-200 rounded-2xl p-6 mb-6 items-center">
                                        <View className="w-48 h-48 bg-neutral-100 rounded-xl items-center justify-center mb-4">
                                            <Ionicons name="qr-code-outline" size={120} color="#6B7280" />
                                        </View>
                                        <Text className="text-sm font-inter-medium text-neutral-900 mb-2">
                                            Scan QRIS Code
                                        </Text>
                                        <Text className="text-xs font-inter text-neutral-500 text-center">
                                            Use any QRIS-compatible app to scan
                                        </Text>
                                    </View>
                                )}

                                {/* Bank Transfer Details */}
                                {method === 'bank_transfer' && (
                                    <View className="space-y-3 mb-6">
                                        {['BCA', 'BNI', 'BRI', 'Mandiri'].map((bank) => (
                                            <TouchableOpacity
                                                key={bank}
                                                className="bg-white border border-neutral-200 rounded-xl p-4 flex-row items-center justify-between"
                                                onPress={() => copyToClipboard(bank)}
                                            >
                                                <View className="flex-row items-center gap-3">
                                                    <View className="w-10 h-10 bg-neutral-100 rounded-lg items-center justify-center">
                                                        <Text className="text-xs font-bold text-neutral-700">{bank.slice(0, 2)}</Text>
                                                    </View>
                                                    <View>
                                                        <Text className="text-sm font-inter-semibold text-neutral-900">{bank}</Text>
                                                        <Text className="text-xs font-inter text-neutral-500">
                                                            AlmaStore Indonesia
                                                        </Text>
                                                    </View>
                                                </View>
                                                <Ionicons name="copy-outline" size={18} color="#6B7280" />
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}

                                {/* Processing Button */}
                                <TouchableOpacity
                                    onPress={handleProcessPayment}
                                    disabled={processing}
                                    className={`w-full py-4 rounded-xl items-center ${processing ? 'bg-neutral-300' : 'bg-primary'}`}
                                >
                                    {processing ? (
                                        <Text className="text-white font-inter-semibold">Processing...</Text>
                                    ) : (
                                        <Text className="text-white font-inter-semibold">Confirm Payment</Text>
                                    )}
                                </TouchableOpacity>
                            </>
                        ) : (
                            // Payment Result
                            <View className="items-center py-8">
                                <View
                                    className={`w-20 h-20 rounded-full items-center justify-center mb-4 ${paymentResult.success ? 'bg-green-100' : 'bg-red-100'
                                        }`}
                                >
                                    <Ionicons
                                        name={paymentResult.success ? 'checkmark-circle' : 'close-circle'}
                                        size={48}
                                        color={paymentResult.success ? '#10B981' : '#EF4444'}
                                    />
                                </View>
                                <Text
                                    className={`text-xl font-inter-semibold text-center mb-2 ${paymentResult.success ? 'text-green-900' : 'text-red-900'
                                        }`}
                                >
                                    {paymentResult.success ? 'Payment Successful!' : 'Payment Failed'}
                                </Text>
                                <Text className="text-sm font-inter text-neutral-500 text-center mb-6">
                                    {paymentResult.message}
                                </Text>

                                {paymentResult.transactionId && (
                                    <View className="bg-neutral-50 rounded-xl p-4 w-full mb-6">
                                        <Text className="text-xs font-inter-semibold text-neutral-500 mb-1">
                                            Transaction ID
                                        </Text>
                                        <Text className="text-sm font-inter-mono text-neutral-900">
                                            {paymentResult.transactionId}
                                        </Text>
                                    </View>
                                )}

                                <TouchableOpacity
                                    onPress={() => {
                                        onClose();
                                        if (paymentResult.success && onSuccess) onSuccess();
                                    }}
                                    className="w-full bg-primary py-4 rounded-xl items-center"
                                >
                                    <Text className="text-white font-inter-semibold">Continue</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </ScrollView>
                </Pressable>
            </Pressable>
        </Modal>
    );
}
