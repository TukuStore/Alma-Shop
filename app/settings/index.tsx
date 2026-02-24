import { useTranslation } from '@/constants/i18n';
import { Colors } from '@/constants/theme';
import { useNotifications } from '@/contexts/NotificationContext';
import { useMedinaStore } from '@/store/useMedinaStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
    const router = useRouter();
    const { requestPermissions, sendLocalNotification } = useNotifications();
    const { notifications, setNotificationPermission } = useMedinaStore();
    const [notificationsEnabled, setNotificationsEnabled] = useState(notifications.permissionGranted);
    const [emailUpdates, setEmailUpdates] = useState(true);

    const { settings } = useMedinaStore();

    const toggleNotifications = async (value: boolean) => {
        if (value) {
            const granted = await requestPermissions();
            setNotificationsEnabled(granted);
            setNotificationPermission(granted);
        } else {
            setNotificationsEnabled(false);
            setNotificationPermission(false);
            // In a real app, you might want to open system settings
            // Linking.openSettings();
        }
    };
    const { t } = useTranslation();

    return (
        <View className="flex-1 bg-neutral-50">
            <SafeAreaView className="flex-1" edges={['top']}>
                {/* Header */}
                <View className="px-5 py-3 flex-row items-center border-b border-neutral-200 bg-white shadow-sm shadow-neutral-100">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4 w-10 h-10 items-center justify-center rounded-full active:bg-neutral-100">
                        <Ionicons name="arrow-back" size={24} color={Colors.neutral[900]} />
                    </TouchableOpacity>
                    <Text className="text-xl text-neutral-900 font-inter-semibold">
                        {t('settings_title')}
                    </Text>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>

                    {/* Account Settings */}
                    <Text className="text-sm font-inter-semibold text-neutral-500 mb-4 ml-1 uppercase">{t('account')}</Text>
                    <View className="bg-white rounded-2xl mb-8 overflow-hidden border border-neutral-100">
                        <SettingItem
                            icon="person-outline"
                            label={t('personal_information')}
                            onPress={() => router.push('/profile/edit')}
                        />
                        <SettingItem
                            icon="shield-checkmark-outline"
                            label={t('security_password')}
                            onPress={() => router.push('/profile/change-password')}
                        />
                        <SettingItem
                            icon="notifications-outline"
                            label={t('push_notifications')}
                            isSwitch
                            value={notificationsEnabled}
                            onValueChange={toggleNotifications}
                        />
                        <SettingItem
                            icon="mail-outline"
                            label={t('email_updates')}
                            isSwitch
                            value={emailUpdates}
                            onValueChange={setEmailUpdates}
                            isLast
                        />
                        <SettingItem
                            icon="notifications-circle-outline"
                            label="Tes Notifikasi Lokal"
                            onPress={() => sendLocalNotification('Tes', 'Ini adalah tes notifikasi dari Pengaturan')}
                        />
                    </View>

                    {/* App Settings */}
                    <Text className="text-sm font-inter-semibold text-neutral-500 mb-4 ml-1 uppercase">{t('app')}</Text>
                    <View className="bg-white rounded-2xl mb-8 overflow-hidden border border-neutral-100">
                        <SettingItem
                            icon="language-outline"
                            label={t('language')}
                            valueText={settings.language === 'id' ? 'Bahasa Indonesia' : 'English'}
                            onPress={() => router.push('/settings/language')}
                        />
                        <SettingItem
                            icon="moon-outline"
                            label={t('dark_mode')}
                            valueText="Sistem"
                            onPress={() => { }}
                            isLast
                        />
                    </View>

                    {/* Support */}
                    <Text className="text-sm font-inter-semibold text-neutral-500 mb-4 ml-1 uppercase">{t('support')}</Text>
                    <View className="bg-white rounded-2xl mb-8 overflow-hidden border border-neutral-100">
                        <SettingItem
                            icon="help-circle-outline"
                            label={t('help_center')}
                            onPress={() => router.push('/chat')}
                        />
                        <SettingItem
                            icon="document-text-outline"
                            label={t('terms_of_service')}
                            onPress={() => router.push('/settings/terms')}
                        />
                        <SettingItem
                            icon="lock-closed-outline"
                            label={t('privacy_policy')}
                            onPress={() => router.push('/settings/privacy')}
                            isLast
                        />
                    </View>

                    <Text className="text-center text-xs text-neutral-400 font-inter mt-4">
                        {t('version')} 1.0.0 (Build 2026.02)
                    </Text>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

interface SettingItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress?: () => void;
    isLast?: boolean;
    isSwitch?: boolean;
    value?: boolean;
    onValueChange?: (value: boolean) => void;
    valueText?: string;
}

function SettingItem({ icon, label, onPress, isLast, isSwitch, value, onValueChange, valueText }: SettingItemProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isSwitch}
            className={`flex-row items-center justify-between p-4 ${!isLast ? 'border-b border-neutral-100' : ''} active:bg-neutral-50`}
        >
            <View className="flex-row items-center gap-4">
                <View className="w-9 h-9 items-center justify-center bg-neutral-50 rounded-full text-neutral-600">
                    <Ionicons name={icon} size={20} color={Colors.neutral[600]} />
                </View>
                <Text className="text-base font-inter-medium text-neutral-900">{label}</Text>
            </View>

            {isSwitch ? (
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    trackColor={{ false: Colors.neutral[200], true: Colors.primary.light }}
                    thumbColor={value ? Colors.primary.DEFAULT : '#f4f3f4'}
                />
            ) : (
                <View className="flex-row items-center gap-2">
                    {valueText && (
                        <Text className="text-sm text-neutral-400 font-inter">{valueText}</Text>
                    )}
                    <Ionicons name="chevron-forward" size={20} color={Colors.neutral[300]} />
                </View>
            )}
        </TouchableOpacity>
    );
}
