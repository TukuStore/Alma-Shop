import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

interface PaymentFailedModalProps {
    visible: boolean;
    onTryAgain: () => void;
    onClose: () => void;
}

export default function PaymentFailedModal({ visible, onTryAgain, onClose }: PaymentFailedModalProps) {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-center items-center bg-neutral-900/60 px-6">
                <View className="w-full bg-white rounded-3xl p-6 items-center gap-6 relative">
                    {/* Close Button */}
                    <TouchableOpacity
                        onPress={onClose}
                        className="absolute right-4 top-4 z-10"
                    >
                        <Ionicons name="close" size={24} color={Colors.neutral[400]} />
                    </TouchableOpacity>

                    {/* Icon */}
                    <View className="w-16 h-16 bg-neutral-100 rounded-full items-center justify-center">
                        <Ionicons name="time" size={32} color={Colors.neutral[500]} />
                    </View>

                    {/* Text */}
                    <View className="items-center gap-2">
                        <Text className="text-xl font-inter-medium text-neutral-900 text-center">
                            Payment Time Out
                        </Text>
                        <Text className="text-base font-inter-regular text-neutral-400 text-center px-4">
                            Ooops, unfortunately your payment deadline is time out, try again to done your payment
                        </Text>
                    </View>

                    {/* Button */}
                    <TouchableOpacity
                        onPress={onTryAgain}
                        className="w-full py-3 bg-primary rounded-full items-center justify-center"
                    >
                        <Text className="text-white text-sm font-inter-medium">Try Again</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
