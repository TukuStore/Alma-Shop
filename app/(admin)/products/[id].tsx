import InputField from '@/components/auth/InputField';
import { Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { decode } from 'base64-arraybuffer/dist/base64-arraybuffer.es5.js';
import * as FileSystem from 'expo-file-system/legacy';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminEditProductScreen() {
    const { id } = useLocalSearchParams();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');
    const [material, setMaterial] = useState('');
    const [category, setCategory] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [isFeatured, setIsFeatured] = useState(false);

    // Images
    const [imageUris, setImageUris] = useState<string[]>([]); // New local URIs
    const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]); // URLs from DB

    const [categories, setCategories] = useState<any[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                // Fetch product
                const { data: product, error: pError } = await supabase
                    .from('products')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (pError) throw pError;

                if (product) {
                    setName(product.name);
                    setDescription(product.description || '');
                    setPrice(product.price.toString());
                    setMaterial(product.material || '');
                    setCategory(product.category_id);
                    setIsActive(product.is_active);
                    setIsFeatured(product.is_featured);

                    if (product.images && Array.isArray(product.images)) {
                        setExistingImageUrls(product.images);
                    }
                }

                // Fetch categories
                const { data: cats } = await supabase.from('categories').select('id, name');
                if (cats) setCategories(cats);

            } catch (error) {
                console.error('Load product error:', error);
                Alert.alert('Error', 'Failed to load product data');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) loadData();
    }, [id]);

    const pickImages = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsMultipleSelection: true,
                selectionLimit: 5 - (existingImageUrls.length + imageUris.length),
                quality: 0.8,
            });

            if (!result.canceled) {
                const newUris = result.assets.map(asset => asset.uri);
                setImageUris(prev => [...prev, ...newUris].slice(0, 5 - existingImageUrls.length));
            }
        } catch (error) {
            console.error('Pick images error:', error);
            Alert.alert('Error', 'Failed to pick images');
        }
    };

    const removeExistingImage = (url: string) => {
        setExistingImageUrls(prev => prev.filter(u => u !== url));
    };

    const removeNewImage = (index: number) => {
        setImageUris(prev => prev.filter((_, i) => i !== index));
    };

    const uploadFile = async (uri: string): Promise<string | null> => {
        try {
            const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpeg';
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `products/${fileName}`;

            const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
            const arrayBuffer = decode(base64);

            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(filePath, arrayBuffer, {
                    contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
                    upsert: true,
                });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('products').getPublicUrl(filePath);
            return data.publicUrl;
        } catch (error: any) {
            console.error(`Error uploading image:`, error);
            return null;
        }
    };

    const handleUpdate = async () => {
        if (!name.trim() || !price || !stock || !category) {
            Alert.alert('Validation Error', 'Please fill all required fields.');
            return;
        }

        setIsSaving(true);
        try {
            // Upload New Images
            const newUploadedUrls = await Promise.all(
                imageUris.map(uri => uploadFile(uri))
            );
            const validNewUrls = newUploadedUrls.filter(url => url !== null) as string[];

            const finalImages = [...existingImageUrls, ...validNewUrls];

            // Update Product
            const { error } = await supabase
                .from('products')
                .update({
                    name: name.trim(),
                    description: description.trim() || null,
                    price: parseFloat(price),
                    stock: parseInt(stock, 10),
                    material: material.trim() || null,
                    category_id: category,
                    images: finalImages,
                    is_active: isActive,
                    is_featured: isFeatured,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;

            Alert.alert('Success', 'Product updated successfully!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            console.error('Update product error:', error);
            Alert.alert('Error', error.message || 'Failed to update product');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Product',
            'Are you sure you want to delete this product? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setIsSaving(true);
                        try {
                            const { error } = await supabase
                                .from('products')
                                .delete()
                                .eq('id', id);

                            if (error) throw error;

                            Alert.alert('Deleted', 'Product has been removed.');
                            router.back();
                        } catch (err: any) {
                            Alert.alert('Error', err.message);
                        } finally {
                            setIsSaving(false);
                        }
                    }
                }
            ]
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color={Colors.primary.DEFAULT} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
            <View className="px-6 py-4 flex-row items-center justify-between border-b border-slate-200 bg-white shadow-sm z-10" style={{ elevation: 2 }}>
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center border border-slate-200">
                    <Ionicons name="close" size={20} color="#334155" />
                </TouchableOpacity>
                <Text className="text-xl font-inter-black text-slate-800">Edit Product</Text>
                <TouchableOpacity
                    onPress={handleDelete}
                    disabled={isSaving}
                    className="w-10 h-10 bg-red-50 rounded-full items-center justify-center border border-red-100"
                >
                    <Ionicons name="trash" size={20} color="#EF4444" />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>

                    <Text className="text-sm font-inter-bold text-slate-700 mb-2 uppercase tracking-wider">Product Images (Max 5)</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-6 py-1">
                        {/* Existing Images */}
                        {existingImageUrls.map((url, index) => (
                            <View key={`existing-${index}`} className="w-24 h-24 mr-3 rounded-xl overflow-hidden bg-neutral-100 relative">
                                <Image source={{ uri: url }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                                <TouchableOpacity
                                    onPress={() => removeExistingImage(url)}
                                    className="absolute top-1 right-1 bg-black/50 w-6 h-6 rounded-full items-center justify-center"
                                >
                                    <Ionicons name="close" size={14} color="white" />
                                </TouchableOpacity>
                            </View>
                        ))}
                        {/* New picked Images */}
                        {imageUris.map((uri, index) => (
                            <View key={`new-${index}`} className="w-24 h-24 mr-3 rounded-xl overflow-hidden bg-neutral-100 relative">
                                <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                                <View className="absolute top-1 left-1 bg-primary px-1 rounded">
                                    <Text className="text-[8px] text-white font-inter-bold">NEW</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => removeNewImage(index)}
                                    className="absolute top-1 right-1 bg-black/50 w-6 h-6 rounded-full items-center justify-center"
                                >
                                    <Ionicons name="close" size={14} color="white" />
                                </TouchableOpacity>
                            </View>
                        ))}
                        {existingImageUrls.length + imageUris.length < 5 && (
                            <TouchableOpacity
                                onPress={pickImages}
                                className="w-24 h-24 bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-xl items-center justify-center"
                            >
                                <Ionicons name="add" size={24} color={Colors.primary.DEFAULT} />
                                <Text className="text-[10px] text-neutral-400 font-inter mt-1">Add Image</Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>

                    <InputField
                        label="Product Name"
                        value={name}
                        onChangeText={setName}
                        placeholder="e.g. Modern Gamis Dress"
                        icon="pricetag-outline"
                    />

                    <View className="flex-row gap-4 mb-4">
                        <View className="flex-1">
                            <InputField
                                label="Price (Rp)"
                                value={price}
                                onChangeText={setPrice}
                                placeholder="0"
                                icon="cash-outline"
                                keyboardType="numeric"
                            />
                        </View>
                        <View className="flex-1">
                            <InputField
                                label="Stock"
                                value={stock}
                                onChangeText={setStock}
                                placeholder="0"
                                icon="layers-outline"
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    <View className="mb-4">
                        <Text className="text-sm text-gray-700 mb-2 font-inter-medium">Category</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row py-1">
                            {categories.map((cat) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    onPress={() => setCategory(cat.id)}
                                    className={`px-4 py-2 rounded-full border mr-2 ${category === cat.id ? 'bg-primary border-primary' : 'bg-white border-neutral-200'}`}
                                >
                                    <Text className={`font-inter-medium text-sm ${category === cat.id ? 'text-white' : 'text-neutral-700'}`}>
                                        {cat.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <InputField
                        label="Materials"
                        value={material}
                        onChangeText={setMaterial}
                        placeholder="e.g. Premium Cotton, Sutra"
                        icon="color-palette-outline"
                    />

                    <View className="mb-6">
                        <Text className="text-sm text-gray-700 mb-2 font-inter-medium">Description</Text>
                        <InputField
                            label=""
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Detailed description..."
                            icon="document-text-outline"
                        />
                    </View>

                    <View className="bg-neutral-50 rounded-xl p-4 mb-4 border border-neutral-100">
                        <View className="flex-row items-center justify-between mb-4">
                            <View>
                                <Text className="font-inter-semibold text-neutral-900">Active Status</Text>
                                <Text className="text-xs font-inter text-neutral-500">Is product visible to customer?</Text>
                            </View>
                            <Switch
                                value={isActive}
                                onValueChange={setIsActive}
                                trackColor={{ false: '#E5E7EB', true: Colors.primary.DEFAULT }}
                            />
                        </View>

                        <View className="flex-row items-center justify-between border-t border-neutral-200 pt-4">
                            <View>
                                <Text className="font-inter-semibold text-neutral-900">Featured Product</Text>
                                <Text className="text-xs font-inter text-neutral-500">Show in home screen slider?</Text>
                            </View>
                            <Switch
                                value={isFeatured}
                                onValueChange={setIsFeatured}
                                trackColor={{ false: '#E5E7EB', true: Colors.primary.DEFAULT }}
                            />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <View className="p-4 bg-white border-t border-slate-200 pb-8">
                <TouchableOpacity
                    onPress={handleUpdate}
                    disabled={isSaving}
                    className={`py-4 rounded-xl items-center justify-center shadow-sm ${isSaving ? 'bg-blue-300' : 'bg-blue-600'}`}
                >
                    {isSaving ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-inter-bold text-base">Update Product</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
