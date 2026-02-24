import InputField from '@/components/auth/InputField';
import { Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async () => {
        if (!fullName.trim() || !email.trim() || !password.trim()) {
            Alert.alert('Missing Fields', 'Please fill in all fields.');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Password Mismatch', 'Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Weak Password', 'Password must be at least 6 characters.');
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signUp({
                email: email.trim(),
                password,
                options: {
                    data: { full_name: fullName.trim() },
                },
            });

            if (error) throw error;

            Alert.alert(
                'Account Created!',
                'Please check your email for verification, then sign in.',
                [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
            );
        } catch (err: any) {
            Alert.alert('Registration Failed', err?.message ?? 'Something went wrong.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 24 }}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Back Button */}
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="self-start mt-4 mb-6 w-10 h-10 rounded-full bg-gray-50 items-center justify-center border border-gray-100"
                    >
                        <Ionicons name="chevron-back" size={24} color={Colors.text.DEFAULT} />
                    </TouchableOpacity>

                    {/* Header */}
                    <View className="mb-8">
                        <Text
                            className="text-3xl text-gray-900 mb-2"
                            style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
                        >
                            Create Account
                        </Text>
                        <Text
                            className="text-sm text-gray-500"
                            style={{ fontFamily: 'Inter_400Regular' }}
                        >
                            Join AlmaShop and discover premium sarongs.
                        </Text>
                    </View>

                    {/* Form */}
                    <View className="gap-2">
                        <InputField
                            icon="person-outline"
                            label="Full Name"
                            placeholder="Enter your full name"
                            value={fullName}
                            onChangeText={setFullName}
                            autoCapitalize="words"
                        />
                        <InputField
                            icon="mail-outline"
                            label="Email Address"
                            placeholder="you@example.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                        />
                        <InputField
                            icon="lock-closed-outline"
                            label="Password"
                            placeholder="Minimum 6 characters"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            showToggle
                        />
                        <InputField
                            icon="shield-checkmark-outline"
                            label="Confirm Password"
                            placeholder="Re-enter your password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            showToggle
                        />

                        {/* Register Button */}
                        <TouchableOpacity
                            className="bg-primary rounded-xl py-4 items-center mt-6 shadow-md shadow-primary/20"
                            onPress={handleRegister}
                            activeOpacity={0.9}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text
                                    className="text-white text-base font-bold"
                                    style={{ fontFamily: 'Inter_600SemiBold' }}
                                >
                                    Create Account
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Login Link */}
                    <View className="flex-row items-center justify-center mt-8 mb-8">
                        <Text
                            className="text-sm text-gray-500"
                            style={{ fontFamily: 'Inter_400Regular' }}
                        >
                            Already have an account?{' '}
                        </Text>
                        <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                            <Text
                                className="text-sm text-primary font-bold"
                                style={{ fontFamily: 'Inter_600SemiBold' }}
                            >
                                Sign In
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
