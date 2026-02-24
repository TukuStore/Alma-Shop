import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PrivacyPolicyScreen() {
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
                        Privacy Policy
                    </Text>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24 }}>
                    <Text className="text-sm text-neutral-500 mb-6">Last updated: February 2026</Text>

                    <Section title="1. Information We Collect">
                        We collect information you provide directly to us when you create an account, make a purchase, or communicate with us. This may include your name, email address, phone number, shipping address, and payment information.
                    </Section>

                    <Section title="2. How We Use Your Information">
                        We use the information we collect to provider, maintain, and improve our services, to process your transactions, to send you related information including confirmations and invoices, and to communicate with you about products, services, offers, and events.
                    </Section>

                    <Section title="3. Information Sharing">
                        We do not share your personal information with third parties except as described in this privacy policy. We may share your information with third-party vendors, consultants, and other service providers who need access to such information to carry out work on our behalf.
                    </Section>

                    <Section title="4. Security">
                        We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
                    </Section>

                    <Section title="5. Contact Us">
                        If you have any questions about this Privacy Policy, please contact us at support@almashop.com.
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
