import { useTranslation } from '@/constants/i18n';
import { Colors } from '@/constants/theme';
import { Product } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { LayoutAnimation, Platform, Text, TouchableOpacity, UIManager, View } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const AccordionItem = ({ title, defaultOpen = false, children }: { title: string, defaultOpen?: boolean, children: React.ReactNode }) => {
    const [expanded, setExpanded] = useState(defaultOpen);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    return (
        <View className="border-b border-neutral-100">
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={toggleExpand}
                className="flex-row items-center justify-between py-4"
            >
                <Text className="text-base font-inter-bold text-neutral-900">{title}</Text>
                <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={20} color={Colors.neutral[400]} />
            </TouchableOpacity>
            {expanded && (
                <View className="pb-4">
                    {children}
                </View>
            )}
        </View>
    );
};

interface ProductAccordionProps {
    product: Product;
}

export default function ProductAccordion({ product }: ProductAccordionProps) {
    const { t } = useTranslation();

    return (
        <View className="px-5 pb-8 bg-white">
            <AccordionItem title="Deskripsi Produk" defaultOpen={true}>
                <Text className="text-sm font-inter text-neutral-600 leading-6">
                    {product.description || 'Tidak ada deskripsi.'}
                </Text>
            </AccordionItem>

            {(product.material || product.care_instructions) && (
                <AccordionItem title="Bahan & Perawatan">
                    <View className="gap-3 mt-1">
                        {product.material && (
                            <View className="flex-row">
                                <Text className="text-sm font-inter-semibold text-neutral-900 w-24">Bahan:</Text>
                                <Text className="flex-1 text-sm font-inter text-neutral-600 leading-5">{product.material}</Text>
                            </View>
                        )}
                        {product.care_instructions && (
                            <View className="flex-row">
                                <Text className="text-sm font-inter-semibold text-neutral-900 w-24">Perawatan:</Text>
                                <Text className="flex-1 text-sm font-inter text-neutral-600 leading-5">{product.care_instructions}</Text>
                            </View>
                        )}
                    </View>
                </AccordionItem>
            )}

            <AccordionItem title="Pengiriman & Garansi">
                <View className="gap-3 mt-1">
                    <View className="flex-row gap-2">
                        <Text className="text-sm font-inter-semibold text-neutral-900 w-24">Pengiriman:</Text>
                        <Text className="flex-1 text-sm font-inter text-neutral-600 leading-5">Tersedia Reguler (3-5 hari) dan Kilat (1-2 hari).</Text>
                    </View>
                    <View className="flex-row gap-2">
                        <Text className="text-sm font-inter-semibold text-neutral-900 w-24">Garansi:</Text>
                        <Text className="flex-1 text-sm font-inter text-neutral-600 leading-5">Tukar size/warna 7 hari sejak barang diterima. S&K berlaku.</Text>
                    </View>
                </View>
            </AccordionItem>
        </View>
    );
}
