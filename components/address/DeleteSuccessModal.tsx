import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

interface DeleteSuccessModalProps {
    visible: boolean;
    onDone: () => void;
}

export default function DeleteSuccessModal({ visible, onDone }: DeleteSuccessModalProps) {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onDone}
        >
            <TouchableWithoutFeedback onPress={onDone}>
                <View className="flex-1 bg-gray-900/30 justify-center items-center px-6">
                    <TouchableWithoutFeedback>
                        <View className="bg-white rounded-3xl p-6 w-full max-w-sm items-center shadow-lg">
                            {/* Icon Container with Close Button */}
                            <View className="w-full flex-row justify-between items-start mb-6">
                                {/* Invisible spacer for alignment */}
                                <View className="w-6 h-6 opacity-0" />

                                {/* Success Icon Circle */}
                                <View className="w-16 h-16 bg-success-50 rounded-full items-center justify-center">
                                    <Ionicons name="checkmark" size={32} color="#00D79E" />{/* Success-400 */}
                                </View>

                                {/* Close X */}
                                <TouchableOpacity onPress={onDone} hitSlop={8}>
                                    <Ionicons name="close" size={24} color="#CDD5DF" />
                                </TouchableOpacity>
                            </View>

                            {/* Text Content */}
                            <View className="items-center mb-8 gap-2">
                                <Text className="text-xl font-inter-semibold text-gray-900 text-center">
                                    Delete Address Success
                                </Text>
                                <Text className="text-sm font-inter-regular text-neutral-400 text-center px-2">
                                    Your address successfully deleted, check it out
                                </Text>
                            </View>

                            {/* Buttons */}
                            <View className="w-full">
                                <TouchableOpacity
                                    onPress={onDone}
                                    className="w-full py-3 rounded-full bg-primary items-center justify-center shadow-sm shadow-primary/30 active:opacity-80"
                                >
                                    <Text className="text-sm font-inter-medium text-white">
                                        Done
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}
