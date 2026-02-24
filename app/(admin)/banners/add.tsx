import InputField from '@/components/auth/InputField';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { decode } from 'base64-arraybuffer/dist/base64-arraybuffer.es5.js';
import * as FileSystem from 'expo-file-system/legacy';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminAddBannerScreen() {
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [ctaText, setCtaText] = useState('');
    const [ctaLink, setCtaLink] = useState('');
    const [type, setType] = useState<'home' | 'flash_sale'>('home');
    const [isActive, setIsActive] = useState(true);
    const [sortOrder, setSortOrder] = useState('0');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert('Permission Required', 'You need to allow access to your photos to upload a banner image.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
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
            const fileName = `banners/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

            const { data, error } = await supabase.storage
                .from('hero-images')
                .upload(fileName, decode(base64), {
                    contentType: `image/${ext}`,
                    upsert: true
                });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('hero-images')
                .getPublicUrl(fileName);

            return publicUrl;
        } catch (error) {
            console.error("Error uploading image:", error);
            throw new Error('Failed to upload banner image.');
        }
    };

    const handleSave = async () => {
        if (!title.trim() || !imageUri) {
            Alert.alert('Validation Error', 'Banner title and image are required.');
            return;
        }

        setIsSaving(true);
        try {
            const imageUrl = await uploadImage(imageUri);

            const { error } = await supabase
                .from('hero_sliders')
                .insert({
                    title: title.trim(),
                    subtitle: subtitle.trim() || null,
                    cta_text: ctaText.trim() || null,
                    cta_link: ctaLink.trim() || null,
                    type,
                    image_url: imageUrl,
                    is_active: isActive,
                    sort_order: parseInt(sortOrder) || 0,
                });

            if (error) throw error;

            Alert.alert('Success', 'Banner added successfully!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            console.error('Save error:', error);
            Alert.alert('Error', error.message || 'Failed to add banner.');
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
                <Text className="text-xl font-inter-black text-slate-800">Add Banner</Text>
                <View className="w-10 h-10" />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>

                    <View className="mb-8">
                        <Text className="text-sm font-inter-bold text-slate-700 mb-4 uppercase tracking-wider">Banner Image (16:9)</Text>
                        <TouchableOpacity
                            onPress={pickImage}
                            className={`w-full h-48 rounded-3xl items-center justify-center overflow-hidden border-2 border-dashed ${imageUri ? 'border-transparent bg-slate-100' : 'border-pink-200 bg-pink-50'}`}
                        >
                            {imageUri ? (
                                <View className="w-full h-full relative">
                                    <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                                    <View className="absolute inset-0 items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
                                        <Ionicons name="camera" size={32} color="white" />
                                    </View>
                                </View>
                            ) : (
                                <View className="items-center">
                                    <Ionicons name="image-outline" size={48} color="#ec4899" />
                                    <Text className="font-inter-medium text-pink-500 mt-2">Upload Banner Image</Text>
                                    <Text className="font-inter text-pink-300 text-xs mt-1">Recommended size: 1600x900px</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    <InputField
                        label="Banner Title"
                        value={title}
                        onChangeText={setTitle}
                        placeholder="e.g., Ramadhan Super Sale"
                        icon="text-outline"
                    />

                    <InputField
                        label="Subtitle / Description"
                        value={subtitle}
                        onChangeText={setSubtitle}
                        placeholder="e.g., Up to 50% discount on all items"
                        icon="information-circle-outline"
                    />

                    <View className="flex-row gap-4 mb-4">
                        <View className="flex-1">
                            <InputField
                                label="Button Text"
                                value={ctaText}
                                onChangeText={setCtaText}
                                placeholder="e.g., Shop Now"
                                icon="radio-button-on-outline"
                            />
                        </View>
                        <View className="flex-1">
                            <InputField
                                label="Sort Order"
                                value={sortOrder}
                                onChangeText={setSortOrder}
                                placeholder="0"
                                icon="list-outline"
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    <InputField
                        label="CTA Link / Route"
                        value={ctaLink}
                        onChangeText={setCtaLink}
                        placeholder="e.g., /shop"
                        icon="link-outline"
                    />

                    <View className="flex-row items-center justify-between mb-4 mt-2">
                        <Text className="text-sm font-inter-bold text-slate-700 uppercase tracking-wider">Banner Type</Text>
                        <View className="flex-row bg-slate-100 p-1 rounded-xl">
                            <TouchableOpacity
                                onPress={() => setType('home')}
                                className={`px-4 py-2 rounded-lg ${type === 'home' ? 'bg-white' : ''}`}
                                style={type === 'home' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 } : undefined}
                            >
                                <Text className={`text-xs font-inter-bold ${type === 'home' ? 'text-indigo-600' : 'text-slate-500'}`}>Home</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setType('flash_sale')}
                                className={`px-4 py-2 rounded-lg ${type === 'flash_sale' ? 'bg-white' : ''}`}
                                style={type === 'flash_sale' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 } : undefined}
                            >
                                <Text className={`text-xs font-inter-bold ${type === 'flash_sale' ? 'text-indigo-600' : 'text-slate-500'}`}>Flash Sale</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="flex-row items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 mb-6" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}>
                        <View className="flex-row items-center">
                            <Ionicons name="eye-outline" size={20} color="#64748B" />
                            <Text className="ml-3 font-inter-bold text-slate-700">Display Active</Text>
                        </View>
                        <Switch
                            value={isActive}
                            onValueChange={setIsActive}
                            trackColor={{ false: '#CBD5E1', true: '#86EFAC' }}
                            thumbColor={isActive ? '#22C55E' : '#F1F5F9'}
                        />
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>

            <View className="p-4 bg-white border-t border-slate-200 pb-8">
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={isSaving}
                    className={`py-4 rounded-xl items-center justify-center ${isSaving ? 'bg-pink-300' : 'bg-pink-600'}`}
                    style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}
                >
                    {isSaving ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-inter-bold text-base">Save Banner</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
