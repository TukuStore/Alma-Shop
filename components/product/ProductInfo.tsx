import { useTranslation } from '@/constants/i18n';
import { formatPrice } from '@/lib/currency';
import { Product } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

interface ProductInfoProps {
    product: Product;
}

export default function ProductInfo({ product }: ProductInfoProps) {
    const { t } = useTranslation();
    const [selectedColor, setSelectedColor] = useState(0);
    const [selectedSize, setSelectedSize] = useState(1);

    const mockColors = ['#1a1a1a', '#e5e5e5', '#8c7a6b', '#3b4b59'];
    const mockSizes = ['S', 'M', 'L', 'XL'];

    const discountPercentage =
        product.original_price && product.original_price > product.price
            ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
            : 0;

    return (
        <View className="bg-white px-5 py-6">
            {/* Badges */}
            <View className="flex-row flex-wrap items-center gap-2 mb-3">
                {product.is_featured && (
                    <View className="px-2.5 py-1 rounded-md" style={{ backgroundColor: '#FFB13B' }}>
                        <Text className="text-[10px] sm:text-xs text-white" style={{ fontFamily: 'Inter_600SemiBold', letterSpacing: 0.5 }}>
                            ✦ Rekomendasi Teratas
                        </Text>
                    </View>
                )}
                {product.category && (
                    <View className="px-2.5 py-1 rounded-md border" style={{ backgroundColor: 'rgba(255,107,87,0.1)', borderColor: 'rgba(255,107,87,0.25)' }}>
                        <Text className="text-[10px] sm:text-xs" style={{ color: '#FF6B57', fontFamily: 'Inter_600SemiBold' }}>
                            {product.category.name}
                        </Text>
                    </View>
                )}
            </View>

            {/* Title & Rating */}
            <View className="mb-4">
                <Text
                    className="text-2xl text-neutral-900 font-bold mb-3"
                    style={{ fontFamily: 'PlayfairDisplay_700Bold', lineHeight: 32 }}
                >
                    {product.name}
                </Text>

                <View className="flex-row items-center gap-3">
                    <View className="flex-row items-center px-2 py-1 rounded-md" style={{ backgroundColor: 'rgba(255,177,59,0.12)' }}>
                        <Ionicons name="star" size={14} color="#FFB13B" />
                        <Text className="ml-1 text-xs" style={{ color: '#FFB13B', fontFamily: 'Inter_700Bold' }}>
                            {product.rating ? product.rating.toFixed(1) : t('new') || 'Baru'}
                        </Text>
                    </View>
                    <Text className="text-neutral-300 text-xs font-bold">•</Text>
                    <Text className="text-neutral-500 text-xs font-medium" style={{ fontFamily: 'Inter_500Medium' }}>
                        Terjual <Text className="text-neutral-900 font-bold">{product.sold_count || 0}</Text>
                    </Text>
                </View>
            </View>

            {/* Price section replicating web store Grouping */}
            <View className="flex-row items-end gap-3 mb-8 p-4 rounded-2xl border" style={{ backgroundColor: 'rgba(248,250,252,0.6)', borderColor: 'rgba(227,232,239,0.5)' }}>
                <Text
                    className="text-3xl font-bold text-neutral-900"
                    style={{ fontFamily: 'Inter_700Bold', letterSpacing: -0.5 }}
                >
                    {formatPrice(product.price)}
                </Text>
                {discountPercentage > 0 && product.original_price && (
                    <View className="flex-col pb-0.5 justify-end">
                        <View className="px-1.5 py-0.5 rounded self-start mb-0.5" style={{ backgroundColor: 'rgba(255,62,56,0.1)' }}>
                            <Text className="text-[10px]" style={{ color: '#FF3E38', fontFamily: 'Inter_700Bold' }}>
                                Hemat {discountPercentage}%
                            </Text>
                        </View>
                        <Text className="text-xs text-neutral-400 font-medium" style={{ fontFamily: 'Inter_500Medium', textDecorationLine: 'line-through' }}>
                            {formatPrice(product.original_price)}
                        </Text>
                    </View>
                )}
            </View>

            {/* Guarantee Badges */}
            <View className="p-4 bg-[#F8FAFC] rounded-2xl border" style={{ borderColor: 'rgba(227,232,239,0.5)' }}>
                <View className="flex-row flex-wrap gap-y-4">
                    <View className="flex-row items-center w-1/2">
                        <Ionicons name="shield-checkmark-outline" size={16} color="#FF6B57" />
                        <Text className="text-[11px] text-neutral-600 ml-2" style={{ fontFamily: 'Inter_500Medium' }}>Jaminan 100% Asli</Text>
                    </View>
                    <View className="flex-row items-center w-1/2">
                        <Ionicons name="swap-horizontal-outline" size={16} color="#FF6B57" />
                        <Text className="text-[11px] text-neutral-600 ml-2" style={{ fontFamily: 'Inter_500Medium' }}>Tukar Size 7 Hari</Text>
                    </View>
                    <View className="flex-row items-center w-1/2">
                        <Ionicons name="flash-outline" size={16} color="#FF6B57" />
                        <Text className="text-[11px] text-neutral-600 ml-2" style={{ fontFamily: 'Inter_500Medium' }}>Pengiriman Cepat</Text>
                    </View>
                    <View className="flex-row items-center w-1/2">
                        <Ionicons name="lock-closed-outline" size={16} color="#FF6B57" />
                        <Text className="text-[11px] text-neutral-600 ml-2" style={{ fontFamily: 'Inter_500Medium' }}>Pembayaran Aman</Text>
                    </View>
                </View>
            </View>

        </View>
    );
}
