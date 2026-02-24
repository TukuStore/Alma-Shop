import { Colors } from '@/constants/theme';
import { useNotifications } from '@/contexts/NotificationContext';
import { useMedinaStore } from '@/store/useMedinaStore';
import { useTranslation } from '@/constants/i18n';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface NotificationPreferences {
  orders: boolean;
  promos: boolean;
  wallet: boolean;
  cart: boolean;
  wishlist: boolean;
  system: boolean;
}

export default function NotificationSettingsScreen() {
  const { t } = useTranslation();
  const { requestPermissions, badgeCount } = useNotifications();
  const { notifications, setNotificationPermission } = useMedinaStore();

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    orders: true,
    promos: true,
    wallet: true,
    cart: true,
    wishlist: true,
    system: true,
  });
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('08:00');

  useEffect(() => {
    // Load preferences from database or local storage
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    // TODO: Load from database
    // For now, use defaults
  };

  const handleTogglePermission = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (notifications.permissionGranted) {
      // Disable - we can't programmatically disable, so just show alert
      alert('To disable notifications, go to your device settings');
    } else {
      const granted = await requestPermissions();
      setNotificationPermission(granted);
    }
  };

  const handleTogglePreference = async (key: keyof NotificationPreferences) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));

    // TODO: Save to database
  };

  const notificationCategories = [
    {
      key: 'orders' as keyof NotificationPreferences,
      title: 'Orders',
      description: 'Updates on your order status & delivery',
      icon: 'cube-outline' as const,
      color: '#0076F5',
    },
    {
      key: 'cart' as keyof NotificationPreferences,
      title: 'Cart',
      description: 'Price drops & cart reminders',
      icon: 'cart-outline' as const,
      color: '#FF6B57',
    },
    {
      key: 'wishlist' as keyof NotificationPreferences,
      title: 'Wishlist',
      description: 'Back in stock & price drops',
      icon: 'heart-outline' as const,
      color: '#EC4899',
    },
    {
      key: 'wallet' as keyof NotificationPreferences,
      title: 'Wallet',
      description: 'Balance updates & vouchers',
      icon: 'wallet-outline' as const,
      color: '#00D79E',
    },
    {
      key: 'promos' as keyof NotificationPreferences,
      title: 'Promotions',
      description: 'Exclusive deals & flash sales',
      icon: 'pricetag-outline' as const,
      color: '#FFB13B',
    },
    {
      key: 'system' as keyof NotificationPreferences,
      title: 'System',
      description: 'Account updates & security',
      icon: 'information-circle-outline' as const,
      color: '#6B7280',
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="px-6 py-4 flex-row items-center gap-4 border-b border-neutral-100">
        <Pressable onPress={() => router.back()} className="w-10 h-10">
          <Ionicons name="arrow-back" size={24} color={Colors.text.DEFAULT} />
        </Pressable>
        <Text className="text-xl font-bold text-neutral-900 flex-1">
          {t('notification_settings')}
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Push Notification Toggle */}
        <View className="px-6 py-4 border-b border-neutral-100">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-base font-semibold text-neutral-900 mb-1">
                Push Notifications
              </Text>
              <Text className="text-sm text-neutral-500">
                {notifications.permissionGranted
                  ? `${badgeCount} unread notifications`
                  : 'Enable to receive notifications'}
              </Text>
            </View>
            <Switch
              value={notifications.permissionGranted}
              onValueChange={handleTogglePermission}
              trackColor={{ false: '#D1D5DB', true: Colors.primary.DEFAULT }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Notification Categories */}
        <View className="px-6 py-4">
          <Text className="text-sm font-semibold text-neutral-500 mb-3 uppercase">
            Notification Categories
          </Text>

          {notificationCategories.map((category) => (
            <View
              key={category.key}
              className="flex-row items-center py-3 border-b border-neutral-100"
            >
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: `${category.color}15` }}
              >
                <Ionicons name={category.icon} size={20} color={category.color} />
              </View>

              <View className="flex-1">
                <Text className="text-base font-medium text-neutral-900">
                  {category.title}
                </Text>
                <Text className="text-sm text-neutral-500">
                  {category.description}
                </Text>
              </View>

              <Switch
                value={preferences[category.key]}
                onValueChange={() => handleTogglePreference(category.key)}
                trackColor={{ false: '#D1D5DB', true: category.color }}
                thumbColor="#FFFFFF"
              />
            </View>
          ))}
        </View>

        {/* Quiet Hours */}
        <View className="px-6 py-4 border-t border-neutral-100">
          <Text className="text-sm font-semibold text-neutral-500 mb-3 uppercase">
            Quiet Hours
          </Text>

          <View className="flex-row items-center justify-between py-2">
            <View className="flex-1">
              <Text className="text-base font-medium text-neutral-900 mb-1">
                Do Not Disturb
              </Text>
              <Text className="text-sm text-neutral-500">
                {quietHoursEnabled
                  ? `Quiet from ${quietHoursStart} to ${quietHoursEnd}`
                  : 'Disable notifications during specific hours'}
              </Text>
            </View>
            <Switch
              value={quietHoursEnabled}
              onValueChange={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setQuietHoursEnabled(!quietHoursEnabled);
              }}
              trackColor={{ false: '#D1D5DB', true: Colors.primary.DEFAULT }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Info Box */}
        <View className="mx-6 mt-4 p-4 bg-neutral-50 rounded-xl">
          <View className="flex-row gap-3">
            <Ionicons name="information-circle" size={20} color={Colors.text.muted} />
            <View className="flex-1">
              <Text className="text-sm text-neutral-600 leading-5">
                To receive notifications, make sure they are enabled in your device settings as well.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
