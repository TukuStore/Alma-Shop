import { Colors } from '@/constants/theme';
import { useMedinaStore } from '@/store/useMedinaStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTranslation } from '@/constants/i18n';

type LanguageOption = {
    code: 'en' | 'id';
    label: string;
    flag: string; // Emoji for simplicity, can be replaced with Image
};

const LANGUAGES: LanguageOption[] = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' },
];

// ...

export default function LanguageScreen() {
    const router = useRouter();
    const { settings, setLanguage } = useMedinaStore();
    const { t } = useTranslation();

    const handleSelect = (code: 'en' | 'id') => {
        setLanguage(code);
        // Optional: Go back after selection
        // router.back(); 
    };

    return (
        <View className="flex-1 bg-neutral-50">
            <SafeAreaView className="flex-1" edges={['top']}>
                {/* Header */}
                <View className="px-5 py-3 flex-row items-center border-b border-neutral-200 bg-white shadow-sm shadow-neutral-100">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="mr-4 w-10 h-10 items-center justify-center rounded-full active:bg-neutral-100"
                    >
                        <Ionicons name="arrow-back" size={24} color={Colors.neutral[900]} />
                    </TouchableOpacity>
                    <Text className="text-xl text-neutral-900 font-inter-semibold">
                        {t('language')}
                    </Text>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
                    <Text className="text-sm font-inter-semibold text-neutral-500 mb-4 ml-1 uppercase">
                        {t('select_language')}
                    </Text>

                    <View className="bg-white rounded-2xl overflow-hidden border border-neutral-100">
                        {LANGUAGES.map((lang, index) => {
                            const isSelected = settings.language === lang.code;
                            const isLast = index === LANGUAGES.length - 1;

                            return (
                                <TouchableOpacity
                                    key={lang.code}
                                    onPress={() => handleSelect(lang.code)}
                                    className={`flex-row items-center justify-between p-4 ${!isLast ? 'border-b border-neutral-100' : ''} active:bg-neutral-50`}
                                >
                                    <View className="flex-row items-center gap-4">
                                        <Text className="text-2xl">{lang.flag}</Text>
                                        <Text className={`text-base font-inter-medium ${isSelected ? 'text-primary' : 'text-neutral-900'}`}>
                                            {lang.label}
                                        </Text>
                                    </View>

                                    {isSelected && (
                                        <Ionicons name="checkmark" size={24} color={Colors.primary.DEFAULT} />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
