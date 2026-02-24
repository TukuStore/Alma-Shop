import { Colors } from '@/constants/theme';
import type { User } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ProfileCardProps {
    user: User;
    onEdit?: () => void;
}

export default function ProfileCard({ user, onEdit }: ProfileCardProps) {
    return (
        <View className="mx-5 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <View className="flex-row items-center gap-4">
                <View className="w-16 h-16 rounded-full bg-primary items-center justify-center overflow-hidden border-2 border-primary/10">
                    {user.avatarUrl ? (
                        <Image
                            source={{ uri: user.avatarUrl }}
                            style={{ width: '100%', height: '100%' }}
                            contentFit="cover"
                            transition={200}
                        />
                    ) : (
                        <Text
                            className="text-white text-2xl"
                            style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
                        >
                            {user.fullName?.charAt(0)?.toUpperCase() ?? 'A'}
                        </Text>
                    )}
                </View>
                <View className="flex-1">
                    <Text
                        className="text-lg text-gray-900"
                        style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
                    >
                        {user.fullName || 'User'}
                    </Text>
                    <Text
                        className="text-xs text-gray-500 mt-0.5"
                        style={{ fontFamily: 'Inter_400Regular' }}
                    >
                        {user.email}
                    </Text>
                    <View className="bg-primary/5 self-start rounded-md px-2 py-0.5 mt-1.5 border border-primary/10">
                        <Text
                            className="text-[10px] text-primary"
                            style={{ fontFamily: 'Inter_600SemiBold' }}
                        >
                            ⭐ {user.role === 'admin' ? 'ADMIN' : 'MEMBER'}
                        </Text>
                    </View>
                </View>
                {onEdit && (
                    <TouchableOpacity
                        onPress={onEdit}
                        className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center active:bg-gray-100"
                    >
                        <Ionicons name="create-outline" size={20} color={Colors.text.DEFAULT} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}
