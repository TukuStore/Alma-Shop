import { Colors } from '@/constants/theme';
import { useNotifications } from '@/contexts/NotificationContext';
import { useTranslation } from '@/constants/i18n';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

interface NotificationPermissionPromptProps {
  visible: boolean;
  onDismiss: () => void;
}

export function NotificationPermissionPrompt({
  visible,
  onDismiss,
}: NotificationPermissionPromptProps) {
  const { requestPermissions } = useNotifications();
  const { t } = useTranslation();

  const handleEnable = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const granted = await requestPermissions();
    if (granted) {
      onDismiss();
    }
  };

  const handleMaybeLater = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDismiss();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <Pressable
        className="flex-1 bg-black/50 justify-center items-center px-6"
        onPress={(e) => {
          if (e.target === e.currentTarget) {
            handleMaybeLater();
          }
        }}
      >
        <View className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
          {/* Icon */}
          <View className="items-center mb-4">
            <View
              className="w-16 h-16 rounded-full items-center justify-center"
              style={{ backgroundColor: `${Colors.primary.DEFAULT}15` }}
            >
              <Ionicons name="notifications" size={32} color={Colors.primary.DEFAULT} />
            </View>
          </View>

          {/* Title & Description */}
          <Text className="text-xl font-bold text-neutral-900 text-center mb-2">
            {t('notifications_permission_title') || 'Stay Updated'}
          </Text>
          <Text className="text-sm text-neutral-500 text-center leading-6 mb-6">
            {t('notifications_permission_message') ||
              'Allow notifications to receive updates about your orders, promotions, and more'}
          </Text>

          {/* What You'll Get */}
          <View className="mb-6 gap-3">
            <View className="flex-row items-center gap-3">
              <View className="w-6 h-6 rounded-full bg-blue-50 items-center justify-center">
                <Ionicons name="cube-outline" size={14} color="#0076F5" />
              </View>
              <Text className="text-sm text-neutral-700 flex-1">Order updates & delivery status</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <View className="w-6 h-6 rounded-full bg-orange-50 items-center justify-center">
                <Ionicons name="pricetag-outline" size={14} color="#FFB13B" />
              </View>
              <Text className="text-sm text-neutral-700 flex-1">Exclusive deals & flash sales</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <View className="w-6 h-6 rounded-full bg-green-50 items-center justify-center">
                <Ionicons name="wallet-outline" size={14} color="#00D79E" />
              </View>
              <Text className="text-sm text-neutral-700 flex-1">Wallet activity & rewards</Text>
            </View>
          </View>

          {/* Buttons */}
          <View className="gap-3">
            <Pressable
              onPress={handleEnable}
              className="bg-primary py-3 rounded-xl items-center"
            >
              <Text className="text-white font-semibold text-base">Enable Notifications</Text>
            </Pressable>
            <Pressable onPress={handleMaybeLater} className="py-3 rounded-xl items-center">
              <Text className="text-neutral-500 font-medium text-sm">Maybe Later</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

// Hook to manage permission prompt
export function useNotificationPermissionPrompt() {
  const [showPrompt, setShowPrompt] = React.useState(false);
  const [hasShownBefore, setHasShownBefore] = React.useState(false);

  const shouldShowPrompt = !hasShownBefore;

  const show = () => {
    if (shouldShowPrompt) {
      setShowPrompt(true);
      setHasShownBefore(true);
    }
  };

  const hide = () => {
    setShowPrompt(false);
  };

  return {
    showPrompt,
    show,
    hide,
    shouldShowPrompt,
  };
}
