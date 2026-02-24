import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Configure notification channels for Android
export async function configureNotificationChannels() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('orders', {
      name: 'Orders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0076F5',
    });

    await Notifications.setNotificationChannelAsync('promos', {
      name: 'Promotions',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FFB13B',
    });

    await Notifications.setNotificationChannelAsync('wallet', {
      name: 'Wallet',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#00D79E',
    });

    await Notifications.setNotificationChannelAsync('system', {
      name: 'System',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#9CA3AF',
    });

    await Notifications.setNotificationChannelAsync('cart', {
      name: 'Cart',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B57',
    });

    await Notifications.setNotificationChannelAsync('wishlist', {
      name: 'Wishlist',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#EC4899',
    });
  }
}

// Get notification channel ID based on type
export function getChannelId(type: NotificationType): string {
  const channelMap: Record<NotificationType, string> = {
    order: 'orders',
    promo: 'promos',
    wallet: 'wallet',
    system: 'system',
    cart: 'cart',
    wishlist: 'wishlist',
  };
  return channelMap[type] || 'system';
}

// Notification type definition
export type NotificationType = 'order' | 'promo' | 'wallet' | 'system' | 'cart' | 'wishlist';

// Notification data interface
export interface NotificationData {
  type: NotificationType;
  actionUrl?: string;
  orderId?: string;
  productId?: string;
  voucherId?: string;
  [key: string]: any;
}

// Schedule a local notification
export async function scheduleLocalNotification({
  title,
  body,
  data,
  seconds = 0,
  channelId,
}: {
  title: string;
  body: string;
  data: NotificationData;
  seconds?: number;
  channelId?: string;
}) {
  const channel = channelId || getChannelId(data.type);

  if (seconds === 0) {
    // Show immediately
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        channelId: channel,
      } as any,
      trigger: null, // Show immediately
    });
  } else {
    // Schedule for later
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        channelId: channel,
      } as any,
      trigger: {
        seconds,
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      },
    });
  }
}

// Cancel all scheduled notifications
export async function cancelAllScheduledNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Cancel specific notification
export async function cancelNotification(notificationId: string) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

// Get badge count
export async function getBadgeCountAsync(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

// Set badge count
export async function setBadgeCountAsync(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

// Request notification permissions
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

// Check if permissions are granted
export async function checkNotificationPermissions(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}
