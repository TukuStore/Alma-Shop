import { supabase } from '@/lib/supabase';
import { useMedinaStore } from '@/store/useMedinaStore';
import type { Notification } from '@/types';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
// import * as Notifications from 'expo-notifications'; // Removed to avoid side-effects
import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

// Lazy load Notifications to avoid crash in certain edge cases, but allow it in Expo Go
let Notifications: any = null;
try {
  Notifications = require('expo-notifications');
} catch (e) {
  console.warn('Failed to require expo-notifications:', e);
}

// Configure notification handler to show alerts in foreground
if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

interface NotificationContextType {
  // Initialize notifications
  initialize: () => Promise<void>;

  // Request permissions
  requestPermissions: () => Promise<boolean>;

  // Send local notification
  sendLocalNotification: (title: string, message: string, data?: any) => Promise<void>;

  // Badge count
  badgeCount: number;
  setBadgeCount: (count: number) => Promise<void>;

  // Is ready
  isReady: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [badgeCount, setBadgeCountState] = useState(0);

  const {
    addNotification,
    setNotifications,
    markAsRead,
    setNotificationPermission,
    incrementUnreadCount,
  } = useMedinaStore();

  // Initialize notification system
  const initialize = async () => {
    try {
      // If Notifications module is not loaded (e.g. Expo Go), skip init
      if (!Notifications) {
        console.log('Notifications module not loaded, skipping initialization.');
        setIsReady(true);
        return;
      }

      // Check permission status
      let existingStatus = 'undetermined';
      try {
        const settings = await Notifications.getPermissionsAsync();
        existingStatus = settings.status;
      } catch (e) {
        console.warn('Failed to get permissions:', e);
      }

      setNotificationPermission(existingStatus === 'granted');

      // Set up notification listeners
      setupNotificationListeners();

      // Load initial notifications from database
      await loadNotifications();

      // Subscribe to real-time notifications
      if (existingStatus === 'granted') {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          subscribeToNotifications(user.id);
        }
      }

      // Get current badge count
      try {
        const count = await Notifications.getBadgeCountAsync();
        setBadgeCountState(count);
      } catch (e) {
        console.warn('Failed to get badge count:', e);
      }

      // Register for push token
      const token = await registerForPushNotificationsAsync();
      if (token) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          console.log('Expo Push Token:', token);
          await savePushToken(user.id, token);
        }
      }

      setIsReady(true);
    } catch (error) {
      console.error('Error initializing notifications:', error);
      // Ensure we still mark as ready so app doesn't hang if this fails
      setIsReady(true);
    }
  };

  // Save push token to database
  const savePushToken = async (userId: string, token: string) => {
    try {
      console.log('📱 Push Token - User ID:', userId);
      console.log('📱 Push Token - Token:', token.substring(0, 20) + '...');

      const { error } = await supabase.from('push_tokens').upsert(
        {
          user_id: userId,
          token: token,
          platform: Platform.OS,
          is_active: true,
          last_used_at: new Date().toISOString(),
        },
        { onConflict: 'token' }
      );

      if (error) {
        console.error('❌ Push Token Error Code:', error.code);
        console.error('❌ Push Token Error Message:', error.message);
        console.error('❌ Push Token Error Details:', error.details);
        console.error('❌ Push Token Error Hint:', error.hint);
        // Don't throw - allow app to continue even if push token fails
      } else {
        console.log('✅ Push Token saved successfully');
      }
    } catch (error: any) {
      console.error('❌ Push Token Exception:', error?.message || error);
      // Don't throw - allow app to continue even if push token fails
    }
  };

  const registerForPushNotificationsAsync = async () => {
    if (!Notifications) return;

    if (Platform.OS === 'android') {
      try {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'joyous_chime_notification.mp3', // crucial: must match filename in res/raw
        });
      } catch (error) {
        console.error('Error setting notification channel:', error);
      }
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Push notification permission not granted: ' + finalStatus);
        return;
      }

      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

      try {
        const pushTokenString = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
        return pushTokenString;
      } catch (e: any) {
        alert('Error getting push token: ' + (e.message || String(e)));
        console.error('Error getting expo push token', e);
      }
    }
  };

  // Load notifications from database
  const loadNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      if (data) {
        setNotifications(data as Notification[]);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  // Subscribe to real-time notification changes
  const subscribeToNotifications = async (userId: string) => {
    const subscription = supabase
      .channel('notifications-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const newNotification = payload.new as Notification;
            addNotification(newNotification);

            // Show in-app notification
            if (!newNotification.is_read) {
              incrementUnreadCount();
            }
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Notification;
            if (updated.is_read) {
              markAsRead(updated.id);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  };

  // Setup notification listeners
  const setupNotificationListeners = () => {
    if (!Notifications) return () => { };

    // Listen for notifications received while app is foregrounded
    const subscription1 = Notifications.addNotificationReceivedListener((notification: any) => {
      console.log('Notification received in foreground:', notification);
    });

    // Listen for user tapping on a notification
    const subscription2 = Notifications.addNotificationResponseReceivedListener((response: any) => {
      console.log('Notification tapped:', response);

      const { data } = response.notification.request.content;

      // Handle deep linking
      if (data?.actionUrl) {
        router.push(data.actionUrl as any);
      } else if (data?.orderId) {
        router.push(`/order/${data.orderId}`);
      } else if (data?.productId) {
        router.push(`/product/${data.productId}`);
      } else if (data?.voucherId) {
        router.push(`/voucher/${data.voucherId}`);
      }

      // Mark as read
      if (data?.notificationId) {
        markAsRead(String(data.notificationId));
      }
    });

    return () => {
      subscription1.remove();
      subscription2.remove();
    };
  };

  // Request notification permissions
  const requestPermissions = async (): Promise<boolean> => {
    if (!Notifications) return false;

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      const granted = finalStatus === 'granted';
      setNotificationPermission(granted);

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF6B57',
          sound: 'joyous_chime_notification.mp3',
        });
      }

      return granted;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  };

  // Send local notification
  const sendLocalNotification = async (title: string, message: string, data?: any) => {
    if (!Notifications) return;

    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== 'granted') {
          // alert('Permission not granted for notifications');
          return;
        }
        setNotificationPermission(true);
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: message,
          data,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  };

  // Set badge count
  const setBadgeCount = async (count: number) => {
    if (!Notifications) return;
    try {
      await Notifications.setBadgeCountAsync(count);
      setBadgeCountState(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  };

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, []);

  const value: NotificationContextType = {
    initialize,
    requestPermissions,
    sendLocalNotification,
    badgeCount,
    setBadgeCount,
    isReady,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// Custom hook to use notification context
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
