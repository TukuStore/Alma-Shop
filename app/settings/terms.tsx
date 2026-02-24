import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TermsOfServiceScreen() {
    const router = useRouter();

    return (
        <View className="flex-1 bg-white">
            <SafeAreaView className="flex-1" edges={['top']}>
                {/* Header */}
                <View className="px-5 py-3 flex-row items-center border-b border-neutral-100 bg-white">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="mr-4 w-10 h-10 items-center justify-center rounded-full active:bg-neutral-50"
                    >
                        <Ionicons name="arrow-back" size={24} color={Colors.neutral[900]} />
                    </TouchableOpacity>
                    <Text className="text-xl text-neutral-900 font-inter-semibold">
                        Terms of Service
                    </Text>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24 }}>
                    <Text className="text-sm text-neutral-500 mb-6">Last updated: February 2026</Text>

                    <Section title="1. Acceptance of Terms">
                        By accessing or using the AlmaShop mobile application, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                    </Section>

                    <Section title="2. Use License">
                        Permission is granted to temporarily download one copy of the materials (information or software) on AlmaShop's application for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
                    </Section>

                    <Section title="3. User Account">
                        To access certain features of the application, you may be required to create an account. You are responsible for maintaining the confidentiality of your account and password and for restricting access to your device.
                    </Section>

                    <Section title="4. Product Purchases">
                        All purchases through our application are subject to product availability. We reserve the right to discontinue any product at any time. Prices for our products are subject to change without notice.
                    </Section>

                    <Section title="5. Governing Law">
                        These terms and conditions are governed by and construed in accordance with the laws of Indonesia and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
                    </Section>

                    <View className="h-8" />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <View className="mb-6">
            <Text className="text-lg font-inter-semibold text-neutral-900 mb-2">{title}</Text>
            <Text className="text-base text-neutral-600 font-inter leading-6">{children}</Text>
        </View>
    );
}
