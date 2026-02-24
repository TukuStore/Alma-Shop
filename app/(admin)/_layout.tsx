import { supabase } from '@/lib/supabase';
import { useMedinaStore } from '@/store/useMedinaStore';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminLayout() {
    const user = useMedinaStore((s) => s.auth.user);
    const isAuthenticated = useMedinaStore((s) => s.auth.isAuthenticated);
    const [isVerifying, setIsVerifying] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const verifyAdmin = async () => {
            try {
                // Double-check against the database, not just local state
                // This prevents manipulated local state from bypassing auth
                const { data: { user: authUser } } = await supabase.auth.getUser();

                if (!authUser) {
                    setIsAdmin(false);
                    setIsVerifying(false);
                    return;
                }

                // Verify role from profiles table
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', authUser.id)
                    .single();

                if (error || !profile) {
                    console.warn('[Admin Guard] Failed to verify admin role:', error);
                    setIsAdmin(false);
                } else {
                    setIsAdmin(profile.role === 'admin');
                }
            } catch (error) {
                console.error('[Admin Guard] Verification error:', error);
                setIsAdmin(false);
            } finally {
                setIsVerifying(false);
            }
        };

        verifyAdmin();
    }, [user?.id]);

    // Loading state — verifying admin credentials
    if (isVerifying) {
        return (
            <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center" edges={['top']}>
                <ActivityIndicator size="large" color="#6366F1" />
                <Text className="text-slate-500 font-inter mt-4">Verifying admin access...</Text>
            </SafeAreaView>
        );
    }

    // Not authenticated — redirect to login
    if (!isAuthenticated || !user) {
        return <Redirect href="/(auth)/login" />;
    }

    // Not admin — show access denied
    if (!isAdmin) {
        return (
            <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center px-8" edges={['top']}>
                <View className="w-24 h-24 bg-red-50 rounded-full items-center justify-center mb-6">
                    <Ionicons name="shield-outline" size={48} color="#EF4444" />
                </View>
                <Text className="text-2xl font-inter-black text-slate-800 text-center mb-3">Access Denied</Text>
                <Text className="text-base font-inter text-slate-500 text-center leading-6 mb-8">
                    You don't have administrator privileges.{'\n'}
                    Contact support if you believe this is an error.
                </Text>
                <View className="bg-red-50 border border-red-200 rounded-2xl p-4 w-full mb-8">
                    <View className="flex-row items-center gap-3">
                        <Ionicons name="information-circle" size={20} color="#EF4444" />
                        <Text className="text-sm font-inter-medium text-red-700 flex-1">
                            Logged in as: {user.email}
                        </Text>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    // Admin verified — render admin pages
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#FAF8F5' },
                animation: 'slide_from_right',
            }}
        />
    );
}
