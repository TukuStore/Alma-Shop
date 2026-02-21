import { useTranslation } from '@/constants/i18n';
import { useMedinaStore } from '@/store/useMedinaStore';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function CartBadge() {
  const itemCount = useMedinaStore((s) => s.getCartItemCount());
  if (itemCount === 0) return null;
  return (
    <View
      className="absolute -top-1 -right-2 bg-accent rounded-full min-w-[18px] h-[18px] items-center justify-center px-1"
    >
      <Text
        className="text-white text-[10px]"
        style={{ fontFamily: 'Inter_700Bold' }}
      >
        {itemCount > 99 ? '99+' : itemCount}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4E342E',
        tabBarInactiveTintColor: '#8B8B8B',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E8E2DA',
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'android' ? 8 : 8 + insets.bottom, // Add insets.bottom on iOS usually handled automatically, but on Android edge-to-edge we might need manual handling if translucent
          height: 64 + (Platform.OS === 'android' ? 0 : insets.bottom), // Adjust height similarly
          // Use safe area context to properly handle bottom padding
          ...((Platform.OS === 'android') && {
            height: 70 + insets.bottom,
            paddingBottom: 12 + insets.bottom,
          })
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 11,
          marginBottom: Platform.OS === 'android' ? 4 : 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: t('categories'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: t('cart'),
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="bag-outline" size={24} color={color} />
              <CartBadge />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
