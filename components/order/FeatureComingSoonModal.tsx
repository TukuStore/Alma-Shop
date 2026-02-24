import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';

type Props = {
    visible: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
};

export default function FeatureComingSoonModal({
    visible,
    onClose,
    title = 'Segera Hadir!',
    description = 'Fitur ini sedang dalam tahap pengembangan dan akan segera tersedia. Terima kasih atas kesabarannya!'
}: Props) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable
                className="flex-1 justify-center items-center bg-black/50 px-6"
                onPress={onClose}
            >
                <Pressable
                    className="bg-white rounded-3xl w-full p-8 items-center"
                    onPress={(e) => e.stopPropagation()}
                >
                    <View className="w-20 h-20 bg-amber-50 rounded-full items-center justify-center mb-5 border-[6px] border-amber-100/50">
                        <Ionicons name="construct-outline" size={36} color="#F59E0B" />
                    </View>
                    <Text className="text-2xl font-black text-gray-900 mb-3 text-center tracking-tight">
                        {title}
                    </Text>
                    <Text className="text-[15px] font-medium text-gray-500 text-center mb-8 leading-relaxed">
                        {description}
                    </Text>

                    <TouchableOpacity
                        onPress={onClose}
                        className="w-full py-4 bg-gray-900 rounded-2xl items-center active:scale-95 flex-row justify-center gap-2"
                    >
                        <Text className="text-base font-bold text-white">Saya Mengerti</Text>
                    </TouchableOpacity>
                </Pressable>
            </Pressable>
        </Modal>
    );
}
