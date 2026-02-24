
import { Colors } from '@/constants/theme';
import { notifyPasswordChanged } from '@/services/notificationIntegration';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChangePasswordScreen() {
    // State for the flow
    // step 1: Verify Old Password
    // step 2: Input New Password
    const [step, setStep] = useState<1 | 2>(1);

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleVerifyOldPassword = async () => {
        if (!oldPassword) {
            Alert.alert('Error', 'Please enter your current password');
            return;
        }

        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || !user.email) throw new Error('User not authenticated');

            // Attempt to sign in with the old password to verify it
            const { error } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: oldPassword,
            });

            if (error) {
                Alert.alert('Incorrect Password', 'The password you entered is incorrect. Please try again.');
                return;
            }

            // If successful, move to next step
            setStep(2);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters long');
            return;
        }

        try {
            setLoading(true);
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            // Kirim notifikasi password changed
            await notifyPasswordChanged();

            Alert.alert('Success', 'Your password has been updated successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center gap-4 border-b border-neutral-100">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 border border-neutral-200 rounded-full items-center justify-center"
                >
                    <Ionicons name="arrow-back" size={20} color={Colors.text.DEFAULT} />
                </TouchableOpacity>
                <Text className="text-xl font-inter-bold text-neutral-900">
                    Change Password
                </Text>
            </View>

            <View className="p-6 flex-1">
                {step === 1 ? (
                    /* Step 1: Verify Old Password */
                    <View className="gap-6">
                        <View>
                            <Text className="text-lg font-inter-semibold text-neutral-900 mb-2">
                                Enter Current Password
                            </Text>
                            <Text className="text-sm text-neutral-500 font-inter">
                                For your security, please enter your current password to proceed.
                            </Text>
                        </View>

                        <View>
                            <Text className="text-sm font-inter-medium text-neutral-700 mb-2">Current Password</Text>
                            <View className="flex-row items-center border border-neutral-200 rounded-xl px-4 h-12 bg-neutral-50 focus:border-primary">
                                <Ionicons name="lock-closed-outline" size={20} color={Colors.neutral[400]} />
                                <TextInput
                                    className="flex-1 ml-3 font-inter text-neutral-900"
                                    placeholder="Enter your current password"
                                    placeholderTextColor={Colors.neutral[400]}
                                    secureTextEntry={!showPassword}
                                    value={oldPassword}
                                    onChangeText={setOldPassword}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={Colors.neutral[400]} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={handleVerifyOldPassword}
                            disabled={loading}
                            className={`h-12 rounded-full items-center justify-center mt-4 ${loading ? 'bg-primary/70' : 'bg-primary'}`}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-inter-bold text-base">Verify</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                ) : (
                    /* Step 2: New Password */
                    <View className="gap-6">
                        <View>
                            <Text className="text-lg font-inter-semibold text-neutral-900 mb-2">
                                Create New Password
                            </Text>
                            <Text className="text-sm text-neutral-500 font-inter">
                                Please enter your new password below.
                            </Text>
                        </View>

                        <View>
                            <Text className="text-sm font-inter-medium text-neutral-700 mb-2">New Password</Text>
                            <View className="flex-row items-center border border-neutral-200 rounded-xl px-4 h-12 bg-neutral-50 focus:border-primary">
                                <Ionicons name="lock-closed-outline" size={20} color={Colors.neutral[400]} />
                                <TextInput
                                    className="flex-1 ml-3 font-inter text-neutral-900"
                                    placeholder="Enter new password"
                                    placeholderTextColor={Colors.neutral[400]}
                                    secureTextEntry={!showPassword}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={Colors.neutral[400]} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View>
                            <Text className="text-sm font-inter-medium text-neutral-700 mb-2">Confirm New Password</Text>
                            <View className="flex-row items-center border border-neutral-200 rounded-xl px-4 h-12 bg-neutral-50 focus:border-primary">
                                <Ionicons name="lock-closed-outline" size={20} color={Colors.neutral[400]} />
                                <TextInput
                                    className="flex-1 ml-3 font-inter text-neutral-900"
                                    placeholder="Re-enter new password"
                                    placeholderTextColor={Colors.neutral[400]}
                                    secureTextEntry={!showPassword}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={handleChangePassword}
                            disabled={loading}
                            className={`h-12 rounded-full items-center justify-center mt-4 ${loading ? 'bg-primary/70' : 'bg-primary'}`}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-inter-bold text-base">Update Password</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}
