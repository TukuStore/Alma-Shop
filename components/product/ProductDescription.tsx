import { useTranslation } from '@/constants/i18n';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ProductDescriptionProps {
    description: string | null;
}

export default function ProductDescription({ description }: ProductDescriptionProps) {
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const { t } = useTranslation();

    return (
        <View className="px-5 mb-8">
            <Text
                className="text-neutral-600 leading-7 text-base"
                style={{ fontFamily: 'Inter_400Regular', lineHeight: 26 }}
                numberOfLines={isDescriptionExpanded ? undefined : 4}
            >
                {description || t('no_description')}
            </Text>
            {description && description.length > 150 && (
                <TouchableOpacity
                    onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="mt-3 flex-row items-center"
                >
                    <Text className="text-primary font-bold mr-1" style={{ fontFamily: 'Inter_600SemiBold' }}>
                        {isDescriptionExpanded ? t('read_less') : t('read_more')}
                    </Text>
                    <Ionicons
                        name={isDescriptionExpanded ? "chevron-up" : "chevron-down"}
                        size={16}
                        color={Colors.primary.DEFAULT}
                    />
                </TouchableOpacity>
            )}
        </View>
    );
}
