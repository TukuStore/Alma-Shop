import { useTranslation } from '@/constants/i18n';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ProductTabsProps {
    activeTab: 'description' | 'reviews';
    onTabChange: (tab: 'description' | 'reviews') => void;
}

export default function ProductTabs({ activeTab, onTabChange }: ProductTabsProps) {
    const { t } = useTranslation();
    return (
        <View className="flex-row border-b border-neutral-100 mb-6">
            <TouchableOpacity
                onPress={() => onTabChange('description')}
                className={`py-3 px-4 border-b-2 ${activeTab === 'description' ? 'border-primary' : 'border-transparent'}`}
            >
                <Text
                    className={`font-semibold ${activeTab === 'description' ? 'text-primary' : 'text-neutral-500'}`}
                    style={{ fontFamily: activeTab === 'description' ? 'Inter_600SemiBold' : 'Inter_500Medium' }}
                >
                    {t('description_tab')}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => onTabChange('reviews')}
                className={`py-3 px-4 border-b-2 ${activeTab === 'reviews' ? 'border-primary' : 'border-transparent'}`}
            >
                <Text
                    className={`font-semibold ${activeTab === 'reviews' ? 'text-primary' : 'text-neutral-500'}`}
                    style={{ fontFamily: activeTab === 'reviews' ? 'Inter_600SemiBold' : 'Inter_500Medium' }}
                >
                    {t('reviews_tab')}
                </Text>
            </TouchableOpacity>
        </View>
    );
}
