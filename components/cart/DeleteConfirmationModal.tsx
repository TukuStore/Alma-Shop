import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

interface DeleteConfirmationModalProps {
    visible: boolean;
    onCancel: () => void;
    onDelete: () => void;
}

export default function DeleteConfirmationModal({ visible, onCancel, onDelete }: DeleteConfirmationModalProps) {
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
                            {/* Close Button & Icon Container */}
                            <View className="w-full flex-row justify-between items-start mb-6">
                                {/* Spacer to balance the X icon if we wanted perfect center, but design has X absolute or flow. 
                                    Design: Space-between Frame 37371. Left: invisible X, Center: Icon, Right: Visible X.
                                    Actually simpler: Icon is centered in modal, X is absolute top right.
                                    Let's follow the flex row approach for simplicity or absolute.
                                */}
                                <View className="w-6 h-6 opacity-0" />

                                {/* Trash Icon Circle */}
                                <View className="w-16 h-16 bg-neutral-50 rounded-full items-center justify-center border border-neutral-100">
                                    <Ionicons name="trash" size={32} color="#CDD5DF" />
                                </View>

                                {/* Close X */}
                                <TouchableOpacity onPress={onCancel} hitSlop={8}>
                                    <Ionicons name="close" size={24} color="#CDD5DF" />
                                </TouchableOpacity>
                            </View>

                            {/* Text Content */}
                            <View className="items-center mb-8 gap-2">
                                <Text className="text-xl font-inter-medium text-gray-900 text-center leading-7">
                                    Remove Product
                                </Text>
                                <Text className="text-base font-inter text-neutral-400 text-center leading-6">
                                    Are you sure to remove the product from cart?
                                </Text>
                            </View>

                            {/* Buttons */}
                            <View className="flex-row gap-4 w-full">
                                <TouchableOpacity
                                    onPress={onCancel}
                                    className="flex-1 py-2.5 rounded-full border border-red-500 items-center justify-center active:opacity-70"
                                >
                                    <Text className="text-sm font-inter-medium text-red-500 leading-5">
                                        Cancel
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={onDelete}
                                    className="flex-1 py-2.5 rounded-full bg-red-500 items-center justify-center shadow-sm shadow-red-200 active:opacity-80"
                                >
                                    <Text className="text-sm font-inter-medium text-white leading-5">
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
