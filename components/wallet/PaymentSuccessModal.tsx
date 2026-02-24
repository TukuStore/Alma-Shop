import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

interface PaymentSuccessModalProps {
    visible: boolean;
    onDone: () => void;
}

export default function PaymentSuccessModal({ visible, onDone }: PaymentSuccessModalProps) {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onDone}
        >
            <View className="flex-1 justify-center items-center bg-neutral-900/60 px-6">
                <View className="w-full bg-white rounded-3xl p-6 items-center gap-6">
                    {/* Icon */}
                    <View className="w-16 h-16 bg-green-500 rounded-full items-center justify-center">
                        <Ionicons name="checkmark" size={32} color="white" />
                    </View>

                    {/* Text */}
                    <View className="items-center gap-2">
                        <Text className="text-xl font-inter-medium text-neutral-900 text-center">
                            Top Up Transaction Success
                        </Text>
                        <Text className="text-base font-inter-regular text-neutral-400 text-center">
                            Your top up transaction successfully added
                        </Text>
                    </View>

                    {/* Button */}
                    <TouchableOpacity
                        onPress={onDone}
                        className="w-full py-3 bg-primary rounded-full items-center justify-center"
                    >
                        <Text className="text-white text-sm font-inter-medium">Done</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
