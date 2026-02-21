import 'react-native-url-polyfill/auto';
import '../global.css';

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import {
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';

import AppSplashScreen from '@/components/AppSplashScreen';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { configureImageCache, setupImageMemoryCleanup } from '@/lib/image-cache';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    PlayfairDisplay_700Bold,
  });
  const [isSplashAnimationFinished, setIsSplashAnimationFinished] = React.useState(false);

  useEffect(() => {
    if (loaded) {
      // Hide the native splash screen immediately when fonts are loaded
      SplashScreen.hideAsync();

      // Configure image caching on app startup
      configureImageCache();

      // Setup memory cleanup
      const cleanup = setupImageMemoryCleanup();

      return () => {
        cleanup?.();
      };
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  if (!isSplashAnimationFinished) {
    return (
      <AppSplashScreen onAnimationFinish={() => setIsSplashAnimationFinished(true)} />
    );
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <NotificationProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(admin)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
            <Stack.Screen name="voucher/index" options={{ headerShown: false }} />
            <Stack.Screen name="order/index" options={{ headerShown: false }} />
            <Stack.Screen name="order/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="order/[id]/review" options={{ headerShown: false }} />
            <Stack.Screen name="notifications/index" options={{ headerShown: false }} />
            <Stack.Screen name="settings/index" options={{ headerShown: false }} />
            <Stack.Screen name="settings/profile" options={{ headerShown: false }} />
            <Stack.Screen name="settings/security" options={{ headerShown: false }} />
            <Stack.Screen name="profile/index" options={{ headerShown: false }} />
            <Stack.Screen name="profile/edit" options={{ headerShown: false }} />
            <Stack.Screen name="search" options={{ headerShown: false }} />
            <Stack.Screen name="chat" options={{ headerShown: false }} />
            <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="product/category/[slug]" options={{ headerShown: false }} />
            <Stack.Screen name="checkout" options={{ headerShown: false }} />
            <Stack.Screen name="address/index" options={{ headerShown: false }} />
            <Stack.Screen name="address/add" options={{ headerShown: false }} />
            <Stack.Screen name="address/edit" options={{ headerShown: false }} />
            <Stack.Screen name="payment/index" options={{ headerShown: false }} />
            <Stack.Screen name="wallet/index" options={{ headerShown: false }} />
            <Stack.Screen name="wallet/topup" options={{ headerShown: false }} />
            <Stack.Screen name="wishlist/index" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </NotificationProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
