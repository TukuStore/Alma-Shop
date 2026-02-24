import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

interface DeleteAddressModalProps {
    visible: boolean;
    onCancel: () => void;
    onDelete: () => void;
}

export default function DeleteAddressModal({ visible, onCancel, onDelete }: DeleteAddressModalProps) {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onCancel}
        >
            <TouchableWithoutFeedback onPress={onCancel}>
                <View className="flex-1 bg-gray-900/30 justify-center items-center px-6">
                    <TouchableWithoutFeedback>
                        <View className="bg-white rounded-3xl p-6 w-full max-w-sm items-center shadow-lg">
                            {/* Icon Container with Close Button */}
                            <View className="w-full flex-row justify-between items-start mb-6">
                                {/* Invisible spacer for alignment */}
                                <View className="w-6 h-6 opacity-0" />

                                {/* Trash Icon Circle */}
                                <View className="w-16 h-16 bg-neutral-50 rounded-full items-center justify-center border border-neutral-100">
                                    <Ionicons name="trash-outline" size={32} color="#CDD5DF" />
                                </View>

                                {/* Close X */}
                                <TouchableOpacity onPress={onCancel} hitSlop={8}>
                                    <Ionicons name="close" size={24} color="#CDD5DF" />
                                </TouchableOpacity>
                            </View>

                            {/* Text Content */}
                            <View className="items-center mb-8 gap-2">
                                <Text className="text-xl font-inter-semibold text-gray-900 text-center">
                                    Delete Address
                                </Text>
                                <Text className="text-sm font-inter-regular text-neutral-400 text-center px-4">
                                    Are you sure to delete this address?
                                </Text>
                            </View>

                            {/* Buttons */}
                            <View className="flex-row gap-4 w-full">
                                <TouchableOpacity
                                    onPress={onCancel}
                                    className="flex-1 py-3 rounded-full border border-primary items-center justify-center active:opacity-70"
                                >
                                    <Text className="text-sm font-inter-medium text-primary">
                                        Cancel
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={onDelete}
                                    className="flex-1 py-3 rounded-full bg-primary items-center justify-center shadow-sm shadow-primary/30 active:opacity-80"
                                >
                                    <Text className="text-sm font-inter-medium text-white">
                                        Delete
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
