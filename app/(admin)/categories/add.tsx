import InputField from '@/components/auth/InputField';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { decode } from 'base64-arraybuffer/dist/base64-arraybuffer.es5.js';
import * as FileSystem from 'expo-file-system/legacy';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminAddCategoryScreen() {
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Auto-generate slug from name
    const handleNameChange = (text: string) => {
        setName(text);
        setSlug(text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
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
            const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
            const ext = uri.substring(uri.lastIndexOf('.') + 1);
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
            const filePath = `category_images/${fileName}`;

            const { data, error } = await supabase.storage
                .from('product-images') // Reusing product-images bucket for simplicity, or create a new one if specified
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
            if (imageUri) {
                imageUrl = await uploadImage(imageUri);
            }

            const { error } = await supabase
                .from('categories')
                .insert({
                    name: name.trim(),
                    slug: slug.trim(),
                    image_url: imageUrl,
                });

            if (error) {
                if (error.code === '23505') { // Unique violation
                    throw new Error('A category with this name or slug already exists.');
                }
                throw error;
            }

            Alert.alert('Success', 'Category added successfully!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            console.error('Save error:', error);
            Alert.alert('Error', error.message || 'Failed to add category.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
            <View className="px-6 py-4 flex-row items-center justify-between border-b border-slate-200 bg-white z-10" style={{ elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 }}>
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center border border-slate-200">
                    <Ionicons name="close" size={20} color="#334155" />
                </TouchableOpacity>
                <Text className="text-xl font-inter-black text-slate-800">Add Category</Text>
                <View className="w-10 h-10" />
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
                        label="Slug (Auto-generated)"
                        value={slug}
                        onChangeText={setSlug}
                        placeholder="e.g., sarung-bhs"
                        icon="link-outline"
                    />

                    <View className="bg-blue-50 p-4 rounded-xl mt-4 border border-blue-100 flex-row items-start">
                        <Ionicons name="information-circle" size={20} color="#3B82F6" style={{ marginTop: 2 }} />
                        <Text className="font-inter-medium text-blue-800 ml-2 flex-1 text-xs">
                            Keep the slug simple. It will be used in URLs, e.g., <Text className="font-inter-bold">/category/{slug || 'sarung-bhs'}</Text>.
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
                        <Text className="text-white font-inter-bold text-base">Save Category</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
