import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect } from 'react';
import { Animated, Modal, Pressable, Text, View } from 'react-native';

export interface NotificationToastProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onDismiss: () => void;
  onPress?: () => void;
}

export function NotificationToast({
  visible,
  title,
  message,
  type = 'info',
  duration = 3000,
  onDismiss,
  onPress,
}: NotificationToastProps) {
  const translateY = new Animated.Value(-100);
  const opacity = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Animate in
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      handleDismiss();
    }
  }, [visible]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return { icon: 'checkmark-circle', color: '#00D79E', bgColor: '#E8F5E9' };
      case 'error':
        return { icon: 'close-circle', color: '#FF6B57', bgColor: '#FFEBEE' };
      case 'warning':
        return { icon: 'warning', color: '#FFB13B', bgColor: '#FFF8E1' };
      default:
        return { icon: 'information-circle', color: '#0076F5', bgColor: '#E3F2FD' };
    }
  };

  const { icon, color, bgColor } = getIconAndColor();

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <Pressable
        style={{ flex: 1 }}
        onPress={(e) => {
          if (e.target === e.currentTarget) {
            handleDismiss();
          }
        }}
      >
        <Animated.View
          style={{
            transform: [{ translateY }],
            opacity,
          }}
        >
          <Pressable
            onPress={() => {
              handleDismiss();
              onPress?.();
            }}
            className="mx-4 mt-12 p-4 rounded-xl shadow-lg flex-row items-start gap-3"
            style={{ backgroundColor: bgColor }}
          >
            <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: `${color}20` }}>
              <Ionicons name={icon as any} size={20} color={color} />
            </View>

            <View className="flex-1 gap-1">
              <Text className="text-sm font-semibold" style={{ color: '#1F2937' }}>
                {title}
              </Text>
              <Text className="text-xs leading-5" style={{ color: '#6B7280' }}>
                {message}
              </Text>
            </View>

            <Pressable onPress={handleDismiss} className="p-1 -mr-1 -mt-1">
              <Ionicons name="close" size={16} color="#6B7280" />
            </Pressable>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

// Hook to manage toast state
export function useToast() {
  const [toast, setToast] = React.useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    onPress?: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showToast = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'info',
    onPress?: () => void
  ) => {
    setToast({ visible: true, title, message, type, onPress });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  return {
    toast,
    showToast,
    hideToast,
  };
}
