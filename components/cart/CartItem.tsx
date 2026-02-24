import Checkbox from '@/components/ui/Checkbox';
import { formatPrice } from '@/lib/currency';
import { CartItem as CartItemType } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface CartItemProps {
    item: CartItemType;
    isSelected: boolean;
    onSelect: (selected: boolean) => void;
    onUpdateQuantity: (productId: string, quantity: number) => void;
    onRemove: (productId: string) => void;
    onEdit?: (productId: string) => void;
}

export default function CartItem({
    item,
    isSelected,
    onSelect,
    onUpdateQuantity,
    onRemove,
    onEdit
}: CartItemProps) {
    return (
        <View className="mb-6">
            <View className="flex-row items-start gap-4">
                {/* Checkbox */}
                <View className="pt-9">
                    <Checkbox checked={isSelected} onChange={onSelect} size={20} />
                </View>

                {/* Image Container 96px (size-24) */}
                <View className="w-24 h-24 bg-neutral-50 rounded-2xl items-center justify-center overflow-hidden">
                    <Image
                        source={typeof item.imageUrl === 'string' ? { uri: item.imageUrl } : item.imageUrl}
                        style={{ width: 80, height: 80 }}
                        contentFit="cover"
                        transition={200}
                    />
                </View>

                {/* Content Column */}
                <View className="flex-1 gap-4">
                    {/* Title */}
                    <Text
                        className="text-base text-neutral-900 font-medium leading-6"
                        numberOfLines={2}
                        style={{ fontFamily: 'Inter_500Medium' }}
                    >
                        {item.name}
                    </Text>

                    {/* Variant Info */}
                    <View className="flex-row gap-2">
                        <View className="flex-row gap-1">
                            <Text className="text-sm text-neutral-400 font-inter">Size :</Text>
                            <Text className="text-sm text-neutral-900 font-inter">-</Text>
                        </View>
                        <View className="flex-row gap-1">
                            <Text className="text-sm text-neutral-400 font-inter">Color :</Text>
                            <Text className="text-sm text-neutral-900 font-inter">White</Text>
                        </View>
                    </View>

                    {/* Qty & Price Row */}
                    <View className="flex-row items-center justify-between">
                        {/* Qty Control */}
                        <View className="flex-row items-center gap-2">
                            <TouchableOpacity
                                onPress={() => onUpdateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                                className="w-6 h-6 bg-[#FF6B57] rounded-full items-center justify-center active:opacity-80"
                            >
                                <Ionicons name="remove" size={12} color="white" />
                            </TouchableOpacity>
                            <Text className="w-6 text-center text-base font-inter text-neutral-900 leading-6">
                                {item.quantity}
                            </Text>
                            <TouchableOpacity
                                onPress={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                                className="w-6 h-6 bg-[#FF6B57] rounded-full items-center justify-center active:opacity-80"
                            >
                                <Ionicons name="add" size={12} color="white" />
                            </TouchableOpacity>
                        </View>

                        {/* Price */}
                        <Text className="text-base font-inter text-neutral-900 leading-6">
                            {formatPrice(item.price)}
                        </Text>
                    </View>

                    {/* Divider */}
                    <View className="h-[1px] bg-neutral-200 w-full" />

                    {/* Actions Row */}
                    <View className="flex-row items-center gap-4">
                        <TouchableOpacity
                            onPress={() => onRemove(item.productId)}
                        >
                            <Ionicons name="trash" size={24} color="#CDD5DF" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => onEdit && onEdit(item.productId)}
                        >
                            <Ionicons name="create" size={24} color="#CDD5DF" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}
