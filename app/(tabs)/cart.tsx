import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import DeleteConfirmationModal from '@/components/cart/DeleteConfirmationModal';
import EmptyCart from '@/components/cart/EmptyCart';
import Checkbox from '@/components/ui/Checkbox';
import { useTranslation } from '@/constants/i18n';
import { createOptimizedFlatListProps } from '@/lib/performance';
import { useMedinaStore } from '@/store/useMedinaStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CartScreen() {
    const items = useMedinaStore((s) => s.cart.items);
    const updateQuantity = useMedinaStore((s) => s.updateQuantity);
    const removeFromCart = useMedinaStore((s) => s.removeFromCart);
    const clearCart = useMedinaStore((s) => s.clearCart);

    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const { t } = useTranslation();

    // Effect to cleanup selection if items are removed
    useEffect(() => {
        const currentIds = new Set(items.map(i => i.productId));
        setSelectedItems(prev => {
            const next = new Set(prev);
            for (const id of prev) {
                if (!currentIds.has(id)) {
                    next.delete(id);
                }
            }
            return next;
        });
    }, [items]);

    const toggleSelection = useCallback((id: string) => {
        setSelectedItems(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const toggleSelectAll = useCallback((checked: boolean) => {
        if (checked) {
            setSelectedItems(new Set(items.map(i => i.productId)));
        } else {
            setSelectedItems(new Set());
        }
    }, [items]);

    const confirmDelete = useCallback(() => {
        if (itemToDelete) {
            removeFromCart(itemToDelete);
            setItemToDelete(null);
        }
    }, [itemToDelete, removeFromCart]);

    const calculateSelectedTotal = useMemo(() => {
        return items.reduce((total, item) => {
            if (selectedItems.has(item.productId)) {
                return total + (item.price * item.quantity);
            }
            return total;
        }, 0);
    }, [items, selectedItems]);

    const isAllSelected = items.length > 0 && selectedItems.size === items.length;

    const renderItem = useCallback(({ item }: { item: any }) => (
        <CartItem
            item={item}
            isSelected={selectedItems.has(item.productId)}
            onSelect={() => toggleSelection(item.productId)}
            onUpdateQuantity={updateQuantity}
            onRemove={(id) => setItemToDelete(id)}
            onEdit={() => console.log('Edit', item.productId)}
        />
    ), [selectedItems, toggleSelection, updateQuantity]);

    const keyExtractor = useCallback((item: any) => item.productId, []);

    const handleCheckout = useCallback(() => {
        useMedinaStore.getState().setCheckoutItems(Array.from(selectedItems));
        router.push('/checkout');
    }, [selectedItems]);

    if (items.length === 0) {
        return <EmptyCart />;
    }

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            {/* Header */}
            <View className="p-6 border-b border-neutral-100 flex-row items-center justify-between">
                <TouchableOpacity
                    onPress={() => router.canGoBack() && router.back()}
                    className="w-10 h-10 bg-[#FF6B57] rounded-full items-center justify-center p-0"
                    activeOpacity={0.8}
                >
                    <Ionicons name="arrow-back" size={20} color="white" />
                </TouchableOpacity>
                <Text className="flex-1 text-center text-2xl font-inter-semibold text-gray-900 leading-8">
                    {t('my_cart')}
                </Text>
                {/* Ghost button placeholder to balance header */}
                <View className="w-10 h-10 opacity-0 bg-[#FF6B57] rounded-full items-center justify-center">
                    <Ionicons name="arrow-back" size={20} color="white" />
                </View>
            </View>

            {/* Select All Row */}
            <View className="p-6 flex-row items-center justify-between">
                <View className="flex-row items-center gap-2.5">
                    <Checkbox
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                        size={20}
                    />
                    <Text className="text-base text-neutral-900 font-inter leading-6">{t('select_all')}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                    <Text className="text-base text-neutral-400 font-inter leading-6">{t('total_item')}</Text>
                    <Text className="text-base text-gray-900 font-inter-medium leading-6">({items.length} {t('items_count')})</Text>
                </View>
            </View>

            {/* Cart Items */}
            <View className="flex-1">
                <FlatList
                    {...createOptimizedFlatListProps({
                        data: items,
                        renderItem,
                        itemHeight: 160,
                    })}
                    keyExtractor={keyExtractor}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16 }}
                    showsVerticalScrollIndicator={false}
                />
            </View>

            {/* Bottom Checkout Bar */}
            <CartSummary
                total={calculateSelectedTotal}
                onCheckout={handleCheckout}
                disabled={selectedItems.size === 0}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                visible={!!itemToDelete}
                onCancel={() => setItemToDelete(null)}
                onDelete={confirmDelete}
            />
        </SafeAreaView>
    );
}
