import { Colors } from '@/constants/theme';
import { walletService } from '@/services/walletService';
import { useMedinaStore } from '@/store/useMedinaStore';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type Props = {
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
};

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000];

export default function TransferModal({ visible, onClose, onSuccess }: Props) {
    const user = useMedinaStore((s) => s.auth.user);
    const [recipientId, setRecipientId] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchResult, setSearchResult] = useState<{ id: string; name: string } | null>(null);
    const [searching, setSearching] = useState(false);

    const limits = walletService.getWalletLimits();

    const handleSearchUser = async () => {
        if (!recipientId.trim()) return;

        setSearching(true);
        setSearchResult(null);

        try {
            const result = await walletService.findUser(recipientId.trim());
            setSearchResult(result);
        } catch (error) {
            console.error('Search user error:', error);
        } finally {
            setSearching(false);
        }
    };

    const handleTransfer = async () => {
        if (!user || !searchResult) return;

        const transferAmount = parseInt(amount);
        if (!transferAmount || transferAmount < limits.minTransfer) {
            Alert.alert('Error', `Minimum transfer is Rp ${limits.minTransfer.toLocaleString('id-ID')}`);
            return;
        }

        if (transferAmount > limits.maxTransfer) {
            Alert.alert('Error', `Maximum transfer is Rp ${limits.maxTransfer.toLocaleString('id-ID')}`);
            return;
        }

        setLoading(true);
        try {
            const result = await walletService.transferToUser({
                recipientUserId: searchResult.id,
                amount: transferAmount,
                description: description || 'Transfer',
            });

            if (result.success) {
                Alert.alert('Success', result.message, [
                    { text: 'OK', onPress: () => {
                        onClose();
                        if (onSuccess) onSuccess();
                    }}
                ]);
            } else {
                Alert.alert('Transfer Failed', result.message);
            }
        } catch (error: any) {
            Alert.alert('Error', 'Transfer failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setRecipientId('');
        setAmount('');
        setDescription('');
        setSearchResult(null);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
            <Pressable className="flex-1 justify-end bg-black/50" onPress={handleClose}>
                <Pressable className="bg-white rounded-t-3xl w-full max-h-[80%]" onPress={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <View className="px-6 pt-5 pb-4 border-b border-neutral-100">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-xl font-inter-semibold text-neutral-900">Transfer Money</Text>
                            <TouchableOpacity onPress={handleClose}>
                                <Ionicons name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                        <Text className="text-sm font-inter text-neutral-500 mt-1">
                            Send money to other AlmaStore users
                        </Text>
                    </View>

                    <ScrollView className="px-6 py-4" showsVerticalScrollIndicator={false}>
                        {/* Search Recipient */}
                        <View className="mb-6">
                            <Text className="text-sm font-inter-semibold text-neutral-900 mb-2">
                                Recipient
                            </Text>
                            <View className="flex-row gap-2">
                                <TextInput
                                    className="flex-1 bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm"
                                    placeholder="Username or phone number"
                                    placeholderTextColor="#9CA3AF"
                                    value={recipientId}
                                    onChangeText={setRecipientId}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity
                                    onPress={handleSearchUser}
                                    disabled={searching || !recipientId.trim()}
                                    className="bg-primary px-4 rounded-xl items-center justify-center"
                                >
                                    {searching ? (
                                        <ActivityIndicator size="small" color="white" />
                                    ) : (
                                        <Ionicons name="search" size={20} color="white" />
                                    )}
                                </TouchableOpacity>
                            </View>

                            {searchResult && (
                                <View className="mt-2 bg-green-50 rounded-xl p-3 flex-row items-center gap-2">
                                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                                    <Text className="text-sm font-inter-medium text-green-900">
                                        {searchResult.name}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Amount */}
                        <View className="mb-6">
                            <Text className="text-sm font-inter-semibold text-neutral-900 mb-2">
                                Amount
                            </Text>
                            <View className="bg-white border border-neutral-200 rounded-xl px-4 py-3">
                                <Text className="text-neutral-400 text-sm mb-1">Rp</Text>
                                <TextInput
                                    className="text-2xl font-inter-bold text-neutral-900"
                                    placeholder="0"
                                    placeholderTextColor="#D1D5DB"
                                    value={amount}
                                    onChangeText={setAmount}
                                    keyboardType="numeric"
                                />
                            </View>

                            {/* Quick Amounts */}
                            <View className="flex-row gap-2 mt-3">
                                {QUICK_AMOUNTS.map((quickAmount) => (
                                    <TouchableOpacity
                                        key={quickAmount}
                                        onPress={() => setAmount(quickAmount.toString())}
                                        className="flex-1 py-2 bg-neutral-50 rounded-lg items-center"
                                    >
                                        <Text className="text-xs font-inter-medium text-neutral-700">
                                            {(quickAmount / 1000).toFixed(0)}k
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View className="flex-row gap-4 mt-3">
                                <Text className="text-xs text-neutral-500">
                                    Min: Rp {limits.minTransfer.toLocaleString('id-ID')}
                                </Text>
                                <Text className="text-xs text-neutral-500">
                                    Max: Rp {limits.maxTransfer.toLocaleString('id-ID')}
                                </Text>
                            </View>
                        </View>

                        {/* Description */}
                        <View className="mb-6">
                            <Text className="text-sm font-inter-semibold text-neutral-900 mb-2">
                                Note (Optional)
                            </Text>
                            <TextInput
                                className="bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm min-h-[80px]"
                                placeholder="Add a note..."
                                placeholderTextColor="#9CA3AF"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                textAlignVertical="top"
                                maxLength={100}
                            />
                        </View>

                        {/* Info */}
                        <View className="bg-blue-50 rounded-xl p-4 mb-6">
                            <View className="flex-row items-start gap-3">
                                <Ionicons name="information-circle" size={20} color="#3B82F6" />
                                <View className="flex-1">
                                    <Text className="text-sm font-inter-semibold text-blue-900 mb-1">
                                        Transfer Information
                                    </Text>
                                    <Text className="text-xs font-inter text-blue-700 leading-5">
                                        • Transfer is instant{'\n'}
                                        • Recipient will receive notification{'\n'}
                                        • Cannot be undone once sent
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Action Button */}
                        <TouchableOpacity
                            onPress={handleTransfer}
                            disabled={loading || !searchResult || !amount}
                            className={`w-full py-4 rounded-xl items-center ${
                                loading || !searchResult || !amount ? 'bg-neutral-300' : 'bg-primary'
                            }`}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Text className="text-white font-inter-semibold">
                                    Send Money
                                </Text>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </Pressable>
            </Pressable>
        </Modal>
    );
}
