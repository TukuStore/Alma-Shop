/**
 * Push Notification Service
 * Manages Expo Push Tokens and sends push notifications
 */

import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { supabase } from '@/lib/supabase';
import { Platform } from 'react-native';

// Push token interface
export interface PushToken {
  id: string;
  user_id: string;
  token: string;
  platform: 'ios' | 'android';
  device_info?: any;
  created_at: string;
  last_used_at: string;
  is_active: boolean;
}

class PushNotificationService {
  private currentPushToken: string | null = null;

  // Register for push notifications
  async registerForPushNotifications(): Promise<string | null> {
    try {
      // Check if device is physical
      if (!Device.isDevice) {
        console.warn('Push notifications only work on physical devices');
        return null;
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Failed to get push token for push notification!');
        return null;
      }

      // Get Expo push token
      const projectId = process.env.EXPO_PUBLIC_PROJECT_ID || 'default-project-id';
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      const token = tokenData.data;

      // Store the token
      this.currentPushToken = token;

      // Save to database
      await this.savePushToken(token);

      console.log('Push token registered:', token);
      return token;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  // Save push token to database
  async savePushToken(token: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('User not authenticated, cannot save push token');
        return;
      }

      const deviceInfo = {
        platform: Platform.OS,
        model: Device.modelName,
        osVersion: Platform.Version,
      };

      // Check if token already exists
      const { data: existing } = await supabase
        .from('push_tokens')
        .select('*')
        .eq('token', token)
        .single();

      if (existing) {
        // Update last_used_at
        await supabase
          .from('push_tokens')
          .update({
            last_used_at: new Date().toISOString(),
            is_active: true,
          })
          .eq('token', token);
      } else {
        // Insert new token
        await supabase.from('push_tokens').insert({
          user_id: user.id,
          token,
          platform: Platform.OS === 'ios' ? 'ios' : 'android',
          device_info: deviceInfo,
        });
      }

      console.log('Push token saved to database');
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  }

  // Get current push token
  async getPushToken(): Promise<string | null> {
    if (this.currentPushToken) {
      return this.currentPushToken;
    }

    // Try to get from database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from('push_tokens')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('last_used_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        this.currentPushToken = data.token;
        return data.token;
      }
    } catch (error) {
      console.error('Error getting push token from database:', error);
    }

    return null;
  }

  // Send push notification to specific user
  async sendPushToUser(userId: string, title: string, message: string, data?: any) {
    try {
      // Get user's push tokens
      const { data: tokens } = await supabase
        .from('push_tokens')
        .select('token')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (!tokens || tokens.length === 0) {
        console.warn('No active push tokens found for user:', userId);
        return;
      }

      // Send to all user's tokens
      const messages = tokens.map((t) => ({
        to: t.token,
        sound: 'default',
        title,
        body: message,
        data,
      }));

      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      });

      console.log(`Push notification sent to ${tokens.length} devices`);
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  // Send push notification to multiple users
  async sendPushToMultipleUsers(
    userIds: string[],
    title: string,
    message: string,
    data?: any
  ) {
    try {
      // Get all push tokens for users
      const { data: tokens } = await supabase
        .from('push_tokens')
        .select('token')
        .in('user_id', userIds)
        .eq('is_active', true);

      if (!tokens || tokens.length === 0) {
        console.warn('No active push tokens found for users');
        return;
      }

      // Send to all tokens
      const messages = tokens.map((t) => ({
        to: t.token,
        sound: 'default',
        title,
        body: message,
        data,
      }));

      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messages),
      });

      console.log(`Push notification sent to ${tokens.length} devices`);
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  // Send broadcast push notification to all users
  async sendBroadcastPush(title: string, message: string, data?: any) {
    try {
      // Get all active push tokens
      const { data: tokens } = await supabase
        .from('push_tokens')
        .select('token')
        .eq('is_active', true);

      if (!tokens || tokens.length === 0) {
        console.warn('No active push tokens found');
        return;
      }

      // Send in batches (Expo allows up to 100 messages per request)
      const batchSize = 100;
      for (let i = 0; i < tokens.length; i += batchSize) {
        const batch = tokens.slice(i, i + batchSize);
        const messages = batch.map((t) => ({
          to: t.token,
          sound: 'default',
          title,
          body: message,
          data,
        }));

        await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messages),
        });
      }

      console.log(`Broadcast push notification sent to ${tokens.length} devices`);
    } catch (error) {
      console.error('Error sending broadcast push notification:', error);
    }
  }

  // Unregister push token
  async unregisterPushToken() {
    try {
      if (!this.currentPushToken) return;

      await supabase
        .from('push_tokens')
        .update({ is_active: false })
        .eq('token', this.currentPushToken);

      this.currentPushToken = null;
      console.log('Push token unregistered');
    } catch (error) {
      console.error('Error unregistering push token:', error);
    }
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();
