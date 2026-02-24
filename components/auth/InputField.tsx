import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View , KeyboardTypeOptions } from 'react-native';



interface InputFieldProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    secureTextEntry?: boolean;
    keyboardType?: KeyboardTypeOptions;
    autoCapitalize?: 'none' | 'words' | 'sentences' | 'characters';
    showToggle?: boolean;
    error?: string;
    editable?: boolean;
}

export default function InputField({
    icon,
    label,
    placeholder,
    value,
    onChangeText,
    secureTextEntry,
    keyboardType = 'default',
    autoCapitalize = 'none',
    showToggle,
    error,
    editable = true
}: InputFieldProps) {
    const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);
    const [isFocused, setIsFocused] = useState(false);

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    return (
        <View className="mb-4">
            <Text
                className="text-sm text-gray-700 mb-2 font-medium"
                style={{ fontFamily: 'Inter_500Medium' }}
            >
                {label}
            </Text>
            <View
                className={`flex-row items-center bg-white border rounded-xl px-4 transition-all ${error
                    ? 'border-red-500 bg-red-50/50'
                    : isFocused
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200'
                    }`}
                style={{ height: 52 }}
            >
                <Ionicons
                    name={icon}
                    size={20}
                    color={error ? Colors.error : isFocused ? Colors.primary.DEFAULT : Colors.text.muted}
                />
                <TextInput
                    className="flex-1 ml-3 text-sm text-gray-900 h-full"
                    style={{ fontFamily: 'Inter_400Regular' }}
                    placeholder={placeholder}
                    placeholderTextColor="#9CA3AF"
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry && !isPasswordVisible}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    autoCorrect={false}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    editable={editable}
                />
                {showToggle && (
                    <TouchableOpacity onPress={togglePasswordVisibility} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Ionicons
                            name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color={Colors.text.muted}
                        />
                    </TouchableOpacity>
                )}
            </View>
            {error && (
                <Text className="text-xs text-red-500 mt-1 ml-1" style={{ fontFamily: 'Inter_400Regular' }}>
                    {error}
                </Text>
            )}
        </View>
    );
}
