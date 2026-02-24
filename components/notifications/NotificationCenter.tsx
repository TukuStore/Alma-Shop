import { Colors } from '@/constants/theme';
import { notificationService } from '@/services/notificationService';
import { useMedinaStore } from '@/store/useMedinaStore';
import type { Notification } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, Text, View } from 'react-native';

interface NotificationCenterProps {
  visible: boolean;
  onClose: () => void;
}

export function NotificationCenter({ visible, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const { markAsRead, markAllAsRead, notifications: storeNotifications } = useMedinaStore();
  const unreadCount = storeNotifications.unreadCount;

  useEffect(() => {
    if (visible) {
      loadNotifications();
    }
  }, [visible]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.fetchNotifications(10);
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationPress = async (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      await notificationService.markAsRead(notification.id);
      markAsRead(notification.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
      );
    }

    // Navigate to action URL
    if (notification.action_url) {
      router.push(notification.action_url as any);
    }

    onClose();
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getIconAndColor = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return { icon: 'cube-outline', color: '#0076F5', bgColor: '#EFF6FF' };
      case 'promo':
        return { icon: 'pricetag-outline', color: '#FFB13B', bgColor: '#FFF8E1' };
      case 'wallet':
        return { icon: 'wallet-outline', color: '#00D79E', bgColor: '#E8F5E9' };
      case 'cart':
        return { icon: 'cart-outline', color: '#FF6B57', bgColor: '#FFEBEE' };
      case 'wishlist':
        return { icon: 'heart-outline', color: '#EC4899', bgColor: '#FCE7F3' };
      default:
        return { icon: 'information-circle-outline', color: '#6B7280', bgColor: '#F3F4F6' };
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const { icon, color, bgColor } = getIconAndColor(item.type);

    return (
      <Pressable
        onPress={() => handleNotificationPress(item)}
        className={`p-3 border-b border-neutral-100 ${item.is_read ? 'bg-white' : 'bg-primary/5'}`}
      >
        <View className="flex-row gap-3">
          <View className={`w-10 h-10 rounded-full items-center justify-center`} style={{ backgroundColor: bgColor }}>
            <Ionicons name={icon as any} size={18} color={color} />
          </View>

          <View className="flex-1 gap-1">
            <View className="flex-row justify-between items-start">
              <Text className="flex-1 text-sm font-semibold text-neutral-900 mr-2" numberOfLines={1}>
                {item.title}
              </Text>
              <Text className="text-[10px] text-neutral-400">{formatTime(item.created_at)}</Text>
            </View>
            <Text className="text-xs text-neutral-500 leading-5" numberOfLines={2}>
              {item.message}
            </Text>
          </View>

          {!item.is_read && <View className="w-2 h-2 rounded-full bg-primary mt-2" />}
        </View>
      </Pressable>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        className="flex-1 bg-black/30"
        onPress={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <Pressable className="absolute right-0 top-0 w-full max-w-sm bg-white h-full shadow-2xl">
          {/* Header */}
          <View className="px-4 py-3 border-b border-neutral-100 flex-row items-center justify-between bg-white">
            <View className="flex-row items-center gap-2">
              <Text className="text-lg font-bold text-neutral-900">Notifications</Text>
              {unreadCount > 0 && (
                <View className="bg-primary px-2 py-0.5 rounded-full">
                  <Text className="text-xs font-semibold text-white">{unreadCount}</Text>
                </View>
              )}
            </View>
            <View className="flex-row items-center gap-2">
              {unreadCount > 0 && (
                <Pressable onPress={handleMarkAllRead} className="p-2">
                  <Ionicons name="checkmark-done-outline" size={20} color={Colors.primary.DEFAULT} />
                </Pressable>
              )}
              <Pressable onPress={onClose} className="p-2">
                <Ionicons name="close-outline" size={24} color={Colors.text.DEFAULT} />
              </Pressable>
            </View>
          </View>

          {/* Content */}
          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color={Colors.primary.DEFAULT} size="large" />
            </View>
          ) : notifications.length === 0 ? (
            <View className="flex-1 items-center justify-center px-6">
              <Ionicons name="notifications-off-outline" size={48} color={Colors.neutral[300]} />
              <Text className="text-neutral-900 font-semibold text-base mt-3">No Notifications</Text>
              <Text className="text-neutral-500 text-center text-xs mt-1">
                You're all caught up!
              </Text>
            </View>
          ) : (
            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id}
              renderItem={renderNotification}
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
