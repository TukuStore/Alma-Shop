import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

interface SocialButtonProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
}

export default function SocialButton({ icon, label, onPress }: SocialButtonProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className="flex-row items-center justify-center bg-white border border-gray-200 rounded-xl py-3.5 shadow-sm active:bg-gray-50"
        >
            <Ionicons name={icon} size={20} color={Colors.text.DEFAULT} />
            <Text
                className="ml-3 text-sm text-gray-700 font-medium"
                style={{ fontFamily: 'Inter_500Medium' }}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}
