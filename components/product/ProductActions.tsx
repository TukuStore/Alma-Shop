import { useTranslation } from '@/constants/i18n';
import { Colors } from '@/constants/theme';
import { formatPrice } from '@/lib/currency';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ProductActionsProps {
    price: number;
    onAddToCart: (quantity: number) => void;
    onBuyNow: (quantity: number) => void;
}

export default function ProductActions({ price, onAddToCart, onBuyNow }: ProductActionsProps) {
    const [quantity, setQuantity] = useState(1);
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();

    const increment = () => setQuantity((prev) => prev + 1);
    const decrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

    const total = price * quantity;

    return (
        <View
            className="absolute bottom-0 left-0 right-0 bg-white shadow-2xl px-5 pt-4 pb-4 border-t border-black/5"
            style={{
                paddingBottom: insets.bottom || 16,
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                backgroundColor: 'rgba(255,255,255,0.95)',
                elevation: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -10 },
                shadowOpacity: 0.1,
                shadowRadius: 20
            }}
        >
            <View className="flex-row items-center justify-between mb-4">
                <View>
                    <Text className="text-neutral-500 text-xs mb-0.5 font-inter-medium">
                        {t('total_price') === 'total_price' ? 'Total Harga' : t('total_price')}
                    </Text>
                    <Text className="text-[22px] font-inter-bold text-primary">
                        {formatPrice(total)}
                    </Text>
                </View>

                {/* Premium Quantity Controls */}
                <View className="flex-row items-center bg-neutral-100 rounded-full h-11 px-1">
                    <TouchableOpacity
                        onPress={decrement}
                        className="w-10 h-9 rounded-full bg-white items-center justify-center shadow-sm"
                        style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3 }}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="remove" size={18} color={Colors.neutral[800]} />
                    </TouchableOpacity>
                    <View className="w-10 items-center justify-center">
                        <Text className="text-base font-inter-bold text-neutral-900">{quantity}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={increment}
                        className="w-10 h-9 rounded-full bg-white items-center justify-center shadow-sm"
                        style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3 }}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="add" size={18} color={Colors.neutral[800]} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3">
                <TouchableOpacity
                    onPress={() => onAddToCart(quantity)}
                    className="flex-1 bg-primary/10 rounded-2xl py-3.5 flex-row items-center justify-center gap-2 active:bg-primary/20 transition-all border border-primary/20"
                    activeOpacity={0.8}
                >
                    <Ionicons name="cart-outline" size={20} color={Colors.primary.DEFAULT} />
                    <Text className="text-primary font-inter-bold text-[14px]">
                        + Keranjang
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => onBuyNow(quantity)}
                    className="flex-1 bg-primary rounded-2xl py-3.5 flex-row items-center justify-center gap-2 shadow-md active:opacity-90"
                    activeOpacity={0.8}
                    style={{ elevation: 4, shadowColor: Colors.primary.DEFAULT, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }}
                >
                    <Text className="text-white font-inter-bold text-[14px]">
                        Beli Sekarang
                    </Text>
                    <Ionicons name="arrow-forward" size={18} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );
}
