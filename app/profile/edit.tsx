import InputField from '@/components/auth/InputField';
import { Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { notifyProfileUpdated } from '@/services/notificationIntegration';
import { useMedinaStore } from '@/store/useMedinaStore';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditProfileScreen() {
    const user = useMedinaStore((s) => s.auth.user);
    const setUser = useMedinaStore((s) => s.setUser);
    const [fullName, setFullName] = useState(user?.fullName || '');
    const [phone, setPhone] = useState(user?.phoneNumber || '');
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
    const [isLoading, setIsLoading] = useState(false);

    // Function to pick image
    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled) {
                setAvatarUrl(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Pick image error:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    // Helper to upload image
    const uploadAvatar = async (uri: string): Promise<string | null> => {
        try {
            // Validate file extension
            const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpeg';
            const allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            if (!allowedExts.includes(fileExt)) {
                throw new Error('Invalid image type. Please select a JPG or PNG image.');
            }

            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `${user?.id}/${fileName}`;

            // Read file as base64 using expo-file-system
            const base64 = await FileSystem.readAsStringAsync(uri, {
                encoding: 'base64',
            });

            // Convert base64 to ArrayBuffer
            const arrayBuffer = decode(base64);

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, arrayBuffer, {
                    contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
                    upsert: true,
                });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            return data.publicUrl;
        } catch (error: any) {
            console.error('Error uploading avatar:', error);
            throw new Error(error.message || 'Failed to upload avatar image');
        }
    };

    // Helper to decode base64 to ArrayBuffer
    const decode = (base64: string) => {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    };

    const handleSave = async () => {
        if (!user) {
            Alert.alert('Error', 'User not authenticated');
            return;
        }

        if (!fullName.trim()) {
            Alert.alert('Error', 'Full name is required');
            return;
        }

        setIsLoading(true);
        try {
            let finalAvatarUrl = avatarUrl; // Default to current state (which might be new local URI or old remote URL)

            // If avatarUrl is a local file URI (starts with file:// or content://), upload it
            if (avatarUrl && (avatarUrl.startsWith('file://') || avatarUrl.startsWith('content://'))) {
                const publicUrl = await uploadAvatar(avatarUrl);
                if (publicUrl) {
                    finalAvatarUrl = publicUrl;
                }
            }

            // Update profile di database
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName.trim(),
                    phone_number: phone.trim() || null,
                    avatar_url: finalAvatarUrl
                })
                .eq('id', user.id);

            if (error) throw error;

            // Update local store dengan data terbaru
            setUser({
                ...user,
                fullName: fullName.trim(),
                phoneNumber: phone.trim() || undefined,
                avatarUrl: finalAvatarUrl
            });

            // Kirim notifikasi
            await notifyProfileUpdated();

            Alert.alert('Success', 'Profile updated successfully');
            router.back();
        } catch (error: any) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', error.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <Text className="text-neutral-500">Please login to edit profile</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center gap-4 border-b border-neutral-100">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10">
                    <Ionicons name="arrow-back" size={24} color={Colors.text.DEFAULT} />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-neutral-900 flex-1">
                    Edit Profile
                </Text>
                <View className="w-10 h-10 opacity-0">
                    <Ionicons name="arrow-back" size={24} color={Colors.text.DEFAULT} />
                </View>
            </View>

            <ScrollView
                contentContainerStyle={{ padding: 24 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Avatar Section */}
                <View className="items-center mb-8">
                    <View className="relative">
                        <View className="w-24 h-24 rounded-full overflow-hidden bg-neutral-100 border-2 border-white shadow-sm">
                            <Image
                                source={{
                                    uri: avatarUrl || `https://api.dicebear.com/9.x/avataaars/png?seed=${user.fullName}`
                                }}
                                style={{ width: '100%', height: '100%' }}
                                contentFit="cover"
                            />
                        </View>
                        <TouchableOpacity
                            className="absolute bottom-0 right-0 bg-primary w-8 h-8 rounded-full items-center justify-center border-2 border-white shadow-sm"
                            onPress={pickImage}
                        >
                            <Ionicons name="camera-outline" size={16} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Form */}
                <View className="gap-5">
                    <InputField
                        label="Full Name"
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder="Enter your full name"
                        icon="person-outline"
                        autoCapitalize="words"
                    />

                    <InputField
                        label="Email"
                        value={user.email}
                        onChangeText={() => { }}
                        placeholder="Email"
                        icon="mail-outline"
                        keyboardType="email-address"
                        editable={false}
                    />

                    <InputField
                        label="Phone Number"
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="Enter your phone number"
                        icon="call-outline"
                        keyboardType="phone-pad"
                    />
                </View>

                {/* Info Box */}
                <View className="mt-6 p-4 bg-blue-50 rounded-xl">
                    <View className="flex-row gap-3">
                        <Ionicons name="information-circle" size={20} color="#0076F5" />
                        <View className="flex-1">
                            <Text className="text-sm text-neutral-700 leading-5">
                                Your profile information helps us provide a better shopping experience.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={isLoading || !fullName.trim()}
                    className={`mt-8 py-4 rounded-xl items-center justify-center shadow-sm ${isLoading || !fullName.trim() ? 'bg-neutral-300' : 'bg-primary'
                        }`}
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-base">
                            Save Changes
                        </Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
