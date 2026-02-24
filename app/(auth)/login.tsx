import InputField from '@/components/auth/InputField';
import SocialButton from '@/components/auth/SocialButton';
import { Elevation } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useMedinaStore } from '@/store/useMedinaStore';
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

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const setUser = useMedinaStore((s) => s.setUser);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Missing Fields', 'Please enter both email and password.');
            return;
        }

        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            });

            if (error) throw error;

            if (data.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name, avatar_url, role')
                    .eq('id', data.user.id)
                    .single();

                setUser({
                    id: data.user.id,
                    email: data.user.email ?? '',
                    fullName: profile?.full_name ?? '',
                    avatarUrl: profile?.avatar_url ?? undefined,
                    role: profile?.role ?? 'customer',
                });

                router.replace('/(tabs)');
            }
        } catch (err: any) {
            Alert.alert('Login Failed', err?.message ?? 'Something went wrong. Please try again.');
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
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 }}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Brand Header */}
                    <View className="items-center mb-10">
                        <View className="w-16 h-16 bg-primary rounded-2xl items-center justify-center mb-6 shadow-primary/20" style={Elevation.md}>
                            <Text className="text-white text-3xl font-bold" style={{ fontFamily: 'PlayfairDisplay_700Bold' }}>A</Text>
                        </View>
                        <Text
                            className="text-3xl text-gray-900 mb-2"
                            style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
                        >
                            Welcome Back
                        </Text>
                        <Text
                            className="text-sm text-gray-500 text-center px-4"
                            style={{ fontFamily: 'Inter_400Regular' }}
                        >
                            Sign in to continue to AlmaShop
                        </Text>
                    </View>

                    {/* Form */}
                    <View className="gap-2">
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
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            showToggle
                        />

                        {/* Forgot Password */}
                        <TouchableOpacity className="self-end mt-1">
                            <Text
                                className="text-sm text-primary font-medium"
                                style={{ fontFamily: 'Inter_500Medium' }}
                            >
                                Forgot Password?
                            </Text>
                        </TouchableOpacity>

                        {/* Login Button */}
                        <TouchableOpacity
                            className="bg-primary rounded-xl py-4 items-center mt-6 shadow-md shadow-primary/20"
                            onPress={handleLogin}
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
                                    Sign In
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Divider */}
                    <View className="flex-row items-center mt-8 mb-6">
                        <View className="flex-1 h-px bg-gray-200" />
                        <Text
                            className="text-xs text-gray-400 mx-4 uppercase tracking-wider"
                            style={{ fontFamily: 'Inter_500Medium' }}
                        >
                            Or continue with
                        </Text>
                        <View className="flex-1 h-px bg-gray-200" />
                    </View>

                    {/* Social Login */}
                    <SocialButton
                        icon="logo-google"
                        label="Continue with Google"
                        onPress={() => { /* Implement Google Sign In */ }}
                    />

                    {/* Register Link */}
                    <View className="flex-row items-center justify-center mt-8">
                        <Text
                            className="text-sm text-gray-500"
                            style={{ fontFamily: 'Inter_400Regular' }}
                        >
                            Don&apos;t have an account?{' '}
                        </Text>
                        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                            <Text
                                className="text-sm text-primary font-bold"
                                style={{ fontFamily: 'Inter_600SemiBold' }}
                            >
                                Sign Up
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
