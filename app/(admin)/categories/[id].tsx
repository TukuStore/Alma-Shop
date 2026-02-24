import InputField from '@/components/auth/InputField';
import { getCategoryImage } from '@/constants/category-images';
import { supabase } from '@/lib/supabase';
import type { Category } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { decode } from 'base64-arraybuffer/dist/base64-arraybuffer.es5.js';
import * as FileSystem from 'expo-file-system/legacy';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminEditCategoryScreen() {
    const { id } = useLocalSearchParams();
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (id) {
            loadCategory();
        }
    }, [id]);

    const loadCategory = async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            const cat = data as Category;
            setName(cat.name);
            setSlug(cat.slug);

            const imageUrl = getCategoryImage(cat.slug, cat.image_url);
            if (imageUrl) {
                setImageUri(typeof imageUrl === 'string' ? imageUrl : null); // We don't want local static images for edit previews
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to load category.');
            router.back();
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-generate slug from name if empty or changed completely maybe, but safer not to auto-update existing
    const handleNameChange = (text: string) => {
        setName(text);
        // Only auto-generate if slug is empty or they explicitly clear it (though typically better to leave existig alone)
        if (!slug) {
            setSlug(text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
        }
    };

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert('Permission Required', 'You need to allow access to your photos to upload a category image.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImageUri(result.assets[0].uri);
        }
    };

    const uploadImage = async (uri: string): Promise<string> => {
        try {
            // If it's already a public URL, don't re-upload
            if (uri.startsWith('http')) return uri;

            const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
            const ext = uri.substring(uri.lastIndexOf('.') + 1);
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
            const filePath = `category_images/${fileName}`;

            const { data, error } = await supabase.storage
                .from('product-images')
                .upload(filePath, decode(base64), {
                    contentType: `image/${ext}`,
                    upsert: true
                });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error) {
            console.error("Error uploading image:", error);
            throw new Error('Failed to upload category image.');
        }
    };

    const handleSave = async () => {
        if (!name.trim() || !slug.trim()) {
            Alert.alert('Validation Error', 'Category name and slug are required.');
            return;
        }

        setIsSaving(true);
        try {
            let imageUrl = null;
            if (imageUri && !imageUri.startsWith('http')) {
                imageUrl = await uploadImage(imageUri);
            } else if (imageUri?.startsWith('http') && !imageUri.includes('category-images')) {
                // Only save custom URL if it doesn't match local asset pattern, wait we want to preserve old urls
                imageUrl = imageUri;
            }

            const updateData: any = {
                name: name.trim(),
                slug: slug.trim(),
            };
            if (imageUrl) {
                updateData.image_url = imageUrl;
            }

            const { error } = await supabase
                .from('categories')
                .update(updateData)
                .eq('id', id);

            if (error) {
                if (error.code === '23505') {
                    throw new Error('A category with this name or slug already exists.');
                }
                throw error;
            }

            Alert.alert('Success', 'Category updated successfully!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            console.error('Save error:', error);
            Alert.alert('Error', error.message || 'Failed to update category.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        Alert.alert(
            'Delete Category',
            'Are you sure you want to delete this category? Products using this category will NOT be deleted but their relations might fail if Restricted.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setIsDeleting(true);
                        try {
                            // Check if products exist for this category
                            const { count, error: countError } = await supabase
                                .from('products')
                                .select('*', { count: 'exact', head: true })
                                .eq('category_id', id);

                            if (countError) throw countError;

                            if (count && count > 0) {
                                Alert.alert('Cannot Delete', `There are ${count} products associated with this category. Please reassign or delete them first.`);
                                setIsDeleting(false);
                                return;
                            }

                            const { error } = await supabase
                                .from('categories')
                                .delete()
                                .eq('id', id);

                            if (error) throw error;

                            Alert.alert('Deleted', 'Category has been deleted.', [
                                { text: 'OK', onPress: () => router.back() }
                            ]);
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to delete category.');
                        } finally {
                            setIsDeleting(false);
                        }
                    },
                },
            ]
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-slate-50 justify-center items-center" edges={['top']}>
                <ActivityIndicator size="large" color="#6366f1" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
            <View className="px-6 py-4 flex-row items-center justify-between border-b border-slate-200 bg-white z-10" style={{ elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 }}>
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center border border-slate-200">
                    <Ionicons name="arrow-back" size={20} color="#334155" />
                </TouchableOpacity>
                <Text className="text-xl font-inter-black text-slate-800">Edit Category</Text>
                <TouchableOpacity onPress={handleDelete} disabled={isDeleting} className="w-10 h-10 bg-red-50 rounded-full items-center justify-center border border-red-100">
                    <Ionicons name="trash" size={20} color="#ef4444" />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>

                    <View className="items-center mb-8">
                        <Text className="text-sm font-inter-bold text-slate-700 mb-4 uppercase tracking-wider self-start">Category Image</Text>
                        <TouchableOpacity
                            onPress={pickImage}
                            className={`w-32 h-32 rounded-3xl items-center justify-center overflow-hidden border-2 border-dashed ${imageUri ? 'border-transparent bg-slate-100' : 'border-indigo-200 bg-indigo-50'}`}
                        >
                            {imageUri ? (
                                <View className="w-full h-full relative">
                                    <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                                    <View className="absolute inset-0 items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
                                        <Ionicons name="camera" size={24} color="white" />
                                    </View>
                                </View>
                            ) : (
                                <View className="items-center">
                                    <Ionicons name="cloud-upload-outline" size={32} color="#6366f1" />
                                    <Text className="font-inter-medium text-indigo-500 mt-2 text-xs">Upload Image</Text>
                                    <Text className="font-inter text-indigo-300 text-[10px] mt-1">(Optional)</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    <InputField
                        label="Category Name"
                        value={name}
                        onChangeText={handleNameChange}
                        placeholder="e.g., Sarung BHS"
                        icon="pricetag-outline"
                    />

                    <InputField
                        label="Slug"
                        value={slug}
                        onChangeText={setSlug}
                        placeholder="e.g., sarung-bhs"
                        icon="link-outline"
                    />

                    <View className="bg-amber-50 p-4 rounded-xl mt-4 border border-amber-100 flex-row items-start">
                        <Ionicons name="warning-outline" size={20} color="#D97706" style={{ marginTop: 2 }} />
                        <Text className="font-inter-medium text-amber-800 ml-2 flex-1 text-xs">
                            Changing the slug might break existing links to this category. Only change it if necessary.
                        </Text>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>

            <View className="p-4 bg-white border-t border-slate-200 pb-8">
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={isSaving}
                    className={`py-4 rounded-xl items-center justify-center ${isSaving ? 'bg-indigo-300' : 'bg-indigo-600'}`}
                    style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}
                >
                    {isSaving ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-inter-bold text-base">Save Changes</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
