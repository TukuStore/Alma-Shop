import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface MenuItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    subtitle?: string;
    onPress: () => void;
    color?: string;
    showBadge?: boolean;
    isLast?: boolean;
}

export default function MenuItem({ icon, label, subtitle, onPress, color, showBadge, isLast }: MenuItemProps) {
    const iconColor = color ?? Colors.primary.DEFAULT;
    const isDestructive = color === Colors.error;

    return (
        <View>
            <TouchableOpacity
                className="flex-row items-center py-4 px-1 active:bg-gray-50 rounded-lg -mx-1"
                onPress={onPress}
                activeOpacity={0.7}
            >
                <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: isDestructive ? '#FEF2F2' : '#F0F9FF' }} // Light red or light blue/primary
                >
                    <Ionicons name={icon} size={20} color={iconColor} />
                </View>
                <View className="flex-1">
                    <Text
                        className={`text-base ${isDestructive ? 'text-error' : 'text-gray-900'}`}
                        style={{ fontFamily: isDestructive ? 'Inter_600SemiBold' : 'Inter_500Medium' }}
                    >
                        {label}
                    </Text>
                    {subtitle && (
                        <Text
                            className="text-xs text-gray-500 mt-0.5"
                            style={{ fontFamily: 'Inter_400Regular' }}
                        >
                            {subtitle}
                        </Text>
                    )}
                </View>
                {showBadge && (
                    <View className="bg-error w-2 h-2 rounded-full mr-2" />
                )}
                {!isDestructive && (
                    <Ionicons name="chevron-forward" size={18} color={Colors.text.muted} />
                )}
            </TouchableOpacity>
            {!isLast && <View className="h-px bg-gray-100 ml-14" />}
        </View>
    );
}
