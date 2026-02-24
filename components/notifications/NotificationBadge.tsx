import { useMedinaStore } from '@/store/useMedinaStore';
import { View, Text } from 'react-native';

interface NotificationBadgeProps {
  size?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export function NotificationBadge({ size = 18, position = 'top-right' }: NotificationBadgeProps) {
  const unreadCount = useMedinaStore((s) => s.notifications.unreadCount);

  if (unreadCount === 0) return null;

  const displayCount = unreadCount > 99 ? '99+' : unreadCount.toString();

  return (
    <View
      style={{
        position: 'absolute',
        minWidth: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#FF6B57',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        ...(position === 'top-right' && { top: -4, right: -4 }),
        ...(position === 'top-left' && { top: -4, left: -4 }),
        ...(position === 'bottom-right' && { bottom: -4, right: -4 }),
        ...(position === 'bottom-left' && { bottom: -4, left: -4 }),
      }}
    >
      <Text
        style={{
          color: 'white',
          fontSize: unreadCount > 99 ? 8 : 10,
          fontWeight: '700',
          paddingHorizontal: unreadCount > 99 ? 2 : 0,
        }}
        numberOfLines={1}
      >
        {displayCount}
      </Text>
    </View>
  );
}
