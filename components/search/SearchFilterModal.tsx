import { Colors } from '@/constants/theme';
import { fetchCategories } from '@/services/productService';
import type { Category } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SearchFilterModalProps {
    visible: boolean;
    onClose: () => void;
    onApply: (filters: FilterState) => void;
}

export interface FilterState {
    minPrice: string;
    maxPrice: string;
    category: string;
    rating: number | null;
    sortBy: 'newest' | 'price_asc' | 'price_desc' | 'popular';
}

const RATINGS = [5, 4, 3, 2, 1];

export default function SearchFilterModal({ visible, onClose, onApply }: SearchFilterModalProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedRating, setSelectedRating] = useState<number | null>(null);
    const [selectedSort, setSelectedSort] = useState<FilterState['sortBy']>('newest');

    // Load categories dynamically
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const cats = await fetchCategories();
                setCategories(cats);
            } catch (err) {
                console.error('Failed to load categories:', err);
            }
        };
        if (visible && categories.length === 0) {
            loadCategories();
        }
    }, [visible]);

    const CATEGORIES = ['All', ...categories.map(c => c.name)];

    const handleApply = () => {
        onApply({
            minPrice,
            maxPrice,
            category: selectedCategory,
            rating: selectedRating,
            sortBy: selectedSort,
        });
        onClose();
    };

    const handleReset = () => {
        setMinPrice('');
        setMaxPrice('');
        setSelectedCategory('All');
        setSelectedRating(null);
        setSelectedSort('newest');
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 flex-row">
                <TouchableWithoutFeedback onPress={onClose}>
                    <View className="flex-1 bg-black/40" />
                </TouchableWithoutFeedback>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    className="w-[85%] h-full bg-white shadow-xl"
                >
                    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-white">
                        {/* Header */}
                        <View className="px-6 pt-2 pb-4 border-b border-neutral-100 flex-row items-center justify-between">
                            <Text className="text-xl font-inter font-bold text-neutral-900">
                                Filter
                            </Text>
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="close" size={24} color={Colors.neutral[900]} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="flex-1 p-6" contentContainerStyle={{ paddingBottom: 40 }}>
                            {/* Category */}
                            <View className="mb-8">
                                <Text className="text-base font-inter font-semibold text-neutral-900 mb-4">
                                    Kategori
                                </Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {CATEGORIES.map((cat) => {
                                        const label = cat === 'All' ? 'Semua Sarung' : cat;
                                        return (
                                            <TouchableOpacity
                                                key={cat}
                                                onPress={() => setSelectedCategory(cat)}
                                                className={`px-4 py-2 rounded-full border ${selectedCategory === cat
                                                    ? 'bg-primary border-primary'
                                                    : 'bg-white border-neutral-200'
                                                    }`}
                                            >
                                                <Text
                                                    className={`text-sm font-inter font-medium ${selectedCategory === cat ? 'text-white' : 'text-neutral-600'
                                                        }`}
                                                >
                                                    {label}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>

                            {/* Sort By */}
                            <View className="mb-8">
                                <Text className="text-base font-inter font-semibold text-neutral-900 mb-4">
                                    Urutkan
                                </Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {[
                                        { label: 'Terbaru', value: 'newest' },
                                        { label: 'Paling Laku', value: 'popular' },
                                        { label: 'Harga (Rendah ke Tinggi)', value: 'price_asc' },
                                        { label: 'Harga (Tinggi ke Rendah)', value: 'price_desc' },
                                    ].map((option) => (
                                        <TouchableOpacity
                                            key={option.value}
                                            onPress={() => setSelectedSort(option.value as any)}
                                            className={`px-4 py-2 rounded-full border ${selectedSort === option.value
                                                ? 'bg-primary border-primary'
                                                : 'bg-white border-neutral-200'
                                                }`}
                                        >
                                            <Text
                                                className={`text-sm font-inter font-medium ${selectedSort === option.value ? 'text-white' : 'text-neutral-600'
                                                    }`}
                                            >
                                                {option.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Price Range */}
                            <View className="mb-8">
                                <Text className="text-base font-inter font-semibold text-neutral-900 mb-4">
                                    Harga (Rp)
                                </Text>
                                <View className="flex-row items-center gap-4">
                                    <View className="flex-1">
                                        <View className="flex-row items-center border border-neutral-200 rounded-xl px-4 h-12 bg-white">
                                            <Text className="text-sm font-inter text-neutral-500 mr-2">Rp</Text>
                                            <TextInput
                                                className="flex-1 text-sm font-inter font-medium text-neutral-900"
                                                placeholder="Min"
                                                placeholderTextColor={Colors.neutral[400]}
                                                keyboardType="numeric"
                                                value={minPrice}
                                                onChangeText={setMinPrice}
                                            />
                                        </View>
                                    </View>
                                    <View className="w-4 h-[1px] bg-neutral-300" />
                                    <View className="flex-1">
                                        <View className="flex-row items-center border border-neutral-200 rounded-xl px-4 h-12 bg-white">
                                            <Text className="text-sm font-inter text-neutral-500 mr-2">Rp</Text>
                                            <TextInput
                                                className="flex-1 text-sm font-inter font-medium text-neutral-900"
                                                placeholder="Max"
                                                placeholderTextColor={Colors.neutral[400]}
                                                keyboardType="numeric"
                                                value={maxPrice}
                                                onChangeText={setMaxPrice}
                                            />
                                        </View>
                                    </View>
                                </View>
                            </View>

                        </ScrollView>

                        {/* Footer Buttons */}
                        <View className="px-6 py-4 border-t border-neutral-100 flex-row gap-4">
                            <TouchableOpacity
                                onPress={handleReset}
                                className="flex-1 h-12 border border-neutral-200 rounded-full items-center justify-center bg-white"
                            >
                                <Text className="text-neutral-900 font-inter font-bold text-base">
                                    Hapus Filter
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleApply}
                                className="flex-1 h-12 bg-primary rounded-full items-center justify-center shadow-sm"
                            >
                                <Text className="text-white font-inter font-bold text-base">
                                    Apply
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}
