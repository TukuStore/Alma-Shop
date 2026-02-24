import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

type CancelReason = {
    id: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
};

const CANCEL_REASONS: CancelReason[] = [
    { id: 'wrong_item', label: 'Ordered wrong item', icon: 'alert-circle-outline' },
    { id: 'found_cheaper', label: 'Found cheaper elsewhere', icon: 'pricetag-outline' },
    { id: 'long_delivery', label: 'Delivery too long', icon: 'time-outline' },
    { id: 'no_longer_needed', label: 'No longer needed', icon: 'close-circle-outline' },
    { id: 'payment_issue', label: 'Payment issue', icon: 'card-outline' },
    { id: 'other', label: 'Other reason', icon: 'ellipsis-horizontal-circle-outline' },
];

type Props = {
    visible: boolean;
    onClose: () => void;
    onConfirm: (reason: string, description: string) => void;
    isLoading?: boolean;
};

export default function CancelOrderModal({ visible, onClose, onConfirm, isLoading = false }: Props) {
    const [selectedReason, setSelectedReason] = React.useState<string>('');
    const [description, setDescription] = React.useState('');

    const handleConfirm = () => {
        if (!selectedReason) return;
        onConfirm(selectedReason, description);
        // Reset form
        setSelectedReason('');
        setDescription('');
    };

    const handleClose = () => {
        setSelectedReason('');
        setDescription('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <Pressable
                className="flex-1 justify-end bg-black/50"
                onPress={handleClose}
            >
                <Pressable className="bg-white rounded-t-3xl w-full max-h-[80%]" onPress={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <View className="px-6 pt-5 pb-4 border-b border-neutral-100">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-xl font-inter-semibold text-neutral-900">
                                Cancel Order
                            </Text>
                            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <Ionicons name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                        <Text className="text-sm font-inter text-neutral-500 mt-2">
                            Please let us know why you want to cancel
                        </Text>
                    </View>

                    <ScrollView className="px-6 py-4" showsVerticalScrollIndicator={false}>
                        {/* Cancel Reasons */}
                        <Text className="text-sm font-inter-semibold text-neutral-900 mb-3">
                            Reason for Cancellation
                        </Text>
                        <View className="gap-2 mb-6">
                            {CANCEL_REASONS.map((reason) => {
                                const isSelected = selectedReason === reason.id;
                                return (
                                    <TouchableOpacity
                                        key={reason.id}
                                        onPress={() => setSelectedReason(reason.id)}
                                        className={`flex-row items-center p-4 rounded-xl border-2 ${isSelected ? 'border-primary bg-primary/5' : 'border-neutral-200 bg-white'
                                            }`}
                                    >
                                        <View className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${isSelected ? 'border-primary' : 'border-neutral-300'
                                            }`}>
                                            {isSelected && (
                                                <View className="w-2.5 h-2.5 rounded-full bg-primary" />
                                            )}
                                        </View>
                                        <Ionicons
                                            name={reason.icon}
                                            size={20}
                                            color={isSelected ? Colors.primary.DEFAULT : '#9CA3AF'}
                                        />
                                        <Text className={`flex-1 ml-3 text-sm font-inter-medium ${isSelected ? 'text-primary' : 'text-neutral-700'
                                            }`}>
                                            {reason.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Additional Details */}
                        <Text className="text-sm font-inter-semibold text-neutral-900 mb-3">
                            Additional Details (Optional)
                        </Text>
                        <View className="bg-neutral-50 rounded-xl border border-neutral-200 p-4 mb-6">
                            <TextInput
                                className="text-sm font-inter text-neutral-900 min-h-[80px]"
                                placeholder="Tell us more about your cancellation..."
                                placeholderTextColor="#9CA3AF"
                                multiline
                                textAlignVertical="top"
                                value={description}
                                onChangeText={setDescription}
                            />
                        </View>

                        {/* Warning Notice */}
                        <View className="bg-red-50 rounded-xl p-4 mb-6 flex-row items-start gap-3">
                            <Ionicons name="information-circle-outline" size={20} color={Colors.error} />
                            <View className="flex-1">
                                <Text className="text-sm font-inter-semibold text-red-900 mb-1">
                                    Cancellation Policy
                                </Text>
                                <Text className="text-xs font-inter text-red-700 leading-5">
                                    You can only cancel orders with status: Pending, Paid, or Processing.
                                    Once cancelled, this action cannot be undone.
                                </Text>
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View className="flex-row gap-3 pb-6">
                            <TouchableOpacity
                                onPress={handleClose}
                                disabled={isLoading}
                                className="flex-1 py-3.5 rounded-xl border border-neutral-300 items-center justify-center"
                            >
                                <Text className="text-sm font-inter-semibold text-neutral-700">
                                    Keep Order
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleConfirm}
                                disabled={!selectedReason || isLoading}
                                className={`flex-1 py-3.5 rounded-xl items-center justify-center ${!selectedReason || isLoading ? 'bg-neutral-300' : 'bg-error'
                                    }`}
                            >
                                {isLoading ? (
                                    <Text className="text-sm font-inter-semibold text-white">
                                        Cancelling...
                                    </Text>
                                ) : (
                                    <Text className="text-sm font-inter-semibold text-white">
                                        Cancel Order
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </Pressable>
            </Pressable>
        </Modal>
    );
}
