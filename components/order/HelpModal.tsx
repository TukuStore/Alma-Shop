import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Linking, Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';

type Props = {
    visible: boolean;
    onClose: () => void;
};

export default function HelpModal({ visible, onClose }: Props) {
    const handleEmail = () => {
        Linking.openURL('mailto:cs@almastore.com').catch(() => { });
        onClose();
    };

    const handleWhatsApp = () => {
        Linking.openURL('https://wa.me/6281234567890').catch(() => { });
        onClose();
    };

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
                    className="bg-white rounded-3xl w-full p-6 items-center"
                    onPress={(e) => e.stopPropagation()}
                >
                    <View className="w-16 h-16 bg-blue-50 rounded-full items-center justify-center mb-4">
                        <Ionicons name="headset-outline" size={32} color="#3B82F6" />
                    </View>
                    <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
                        Butuh Bantuan?
                    </Text>
                    <Text className="text-sm text-gray-500 text-center mb-6 leading-5">
                        Tim dukungan kami siap membantu Anda. Kami akan merespons dalam 24 jam.
                    </Text>

                    <TouchableOpacity
                        onPress={handleWhatsApp}
                        className="w-full flex-row items-center bg-green-50 p-4 rounded-xl border border-green-100 mb-3 active:bg-green-100"
                    >
                        <Ionicons name="logo-whatsapp" size={24} color="#10B981" />
                        <View className="ml-3">
                            <Text className="font-bold text-gray-900">WhatsApp</Text>
                            <Text className="text-xs text-gray-500 mt-0.5">+62 812-3456-7890</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleEmail}
                        className="w-full flex-row items-center bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6 active:bg-blue-100"
                    >
                        <Ionicons name="mail-outline" size={24} color="#3B82F6" />
                        <View className="ml-3">
                            <Text className="font-bold text-gray-900">Email</Text>
                            <Text className="text-xs text-gray-500 mt-0.5">cs@almastore.com</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={onClose}
                        className="w-full py-3.5 bg-gray-900 rounded-xl items-center active:bg-gray-800"
                    >
                        <Text className="font-bold text-white">Tutup</Text>
                    </TouchableOpacity>
                </Pressable>
            </Pressable>
        </Modal>
    );
}
