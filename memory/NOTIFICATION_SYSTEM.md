# Notification System Implementation - ALMA

## Overview

Complete notification system implementation for ALMA app using **Expo Notifications SDK** with support for:
- ✅ Local notifications (in-app and system)
- ✅ Push notifications via Expo Push API
- ✅ Real-time notification sync with Supabase
- ✅ Notification center with badge counts
- ✅ Permission management
- ✅ Per-category notification settings
- ✅ Multi-language support (English/Indonesian)

---

## Installation Complete

### 1. Dependencies Installed
```bash
expo-notifications
expo-device
```

### 2. Configuration Updated
- **app.json**: Added notification permissions for iOS and Android
- **Notification channels**: Configured for orders, promos, wallet, cart, wishlist, system

---

## File Structure

```
ALMA/
├── lib/
│   └── notifications.ts                    # Core notification config & utilities
├── services/
│   ├── notificationService.ts              # Database notification service
│   ├── localNotificationService.ts         # Local notification templates
│   ├── pushNotificationService.ts          # Push notification management
│   └── notificationIntegration.ts          # Integration helpers
├── contexts/
│   └── NotificationContext.tsx             # Global notification provider
├── components/notifications/
│   ├── NotificationBadge.tsx               # Badge component for tabs
│   ├── NotificationToast.tsx               # In-app toast notifications
│   ├── NotificationCenter.tsx              # Dropdown notification center
│   └── NotificationPermissionPrompt.tsx    # Permission request UI
├── app/
│   ├── settings/notifications.tsx          # Notification settings screen
│   └── notifications/index.tsx             # Notifications list screen (existing)
├── scripts/
│   └── create_push_tokens_table.sql        # Push tokens database migration
└── types/
    └── index.ts                            # Updated with Notification interface
```

---

## Usage Guide

### 1. Basic Notification Integration

Import the integration helper in any screen/service:

```typescript
import {
  notifyCartItemAdded,
  notifyOrderPlaced,
  notifyPaymentSuccessful,
} from '@/services/notificationIntegration';

// Example: When item added to cart
await notifyCartItemAdded('Product Name', 'product-id-123');

// Example: When order placed
await notifyOrderPlaced('order-id-456');

// Example: When payment successful
await notifyPaymentSuccessful('IDR 150.000');
```

### 2. Using Notification Components

#### A. Notification Badge
Add to any icon to show unread count:

```tsx
import { NotificationBadge } from '@/components/notifications/NotificationBadge';

<View style={{ position: 'relative' }}>
  <Ionicons name="notifications" size={24} />
  <NotificationBadge size={18} position="top-right" />
</View>
```

#### B. Notification Toast
Show in-app toast notification:

```tsx
import { NotificationToast, useToast } from '@/components/notifications/NotificationToast';

const { toast, showToast, hideToast } = useToast();

// Show toast
showToast(
  'Success!',
  'Item added to cart',
  'success',
  () => console.log('Pressed')
);

// In render
<NotificationToast
  visible={toast.visible}
  title={toast.title}
  message={toast.message}
  type={toast.type}
  onDismiss={hideToast}
  onPress={toast.onPress}
/>
```

#### C. Notification Center
Show dropdown notification center:

```tsx
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

const [showCenter, setShowCenter] = useState(false);

<NotificationCenter
  visible={showCenter}
  onClose={() => setShowCenter(false)}
/>
```

#### D. Permission Prompt
Request notification permissions gracefully:

```tsx
import { NotificationPermissionPrompt } from '@/components/notifications/NotificationPermissionPrompt';

const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);

<NotificationPermissionPrompt
  visible={showPermissionPrompt}
  onDismiss={() => setShowPermissionPrompt(false)}
/>
```

### 3. Push Notifications

#### Register Push Token
```typescript
import { pushNotificationService } from '@/services/pushNotificationService';

// Register device for push notifications
const token = await pushNotificationService.registerForPushNotifications();
console.log('Push token:', token);
```

#### Send Push to User
```typescript
// Send to specific user
await pushNotificationService.sendPushToUser(
  'user-id-123',
  'Order Shipped! 🚚',
  'Your order #12345 is on its way',
  { actionUrl: '/order/12345' }
);

// Send to multiple users
await pushNotificationService.sendPushToMultipleUsers(
  ['user-id-1', 'user-id-2'],
  'Flash Sale! ⚡',
  '50% off everything for 1 hour only!'
);

// Broadcast to all users
await pushNotificationService.sendBroadcastPush(
  'Maintenance Scheduled',
  'App will be under maintenance tonight at 23:00'
);
```

### 4. Store Integration

Access notification state from Zustand store:

```typescript
import { useMedinaStore } from '@/store/useMedinaStore';

function MyComponent() {
  const {
    notifications,
    unreadCount,
    permissionGranted,
    addNotification,
    markAsRead,
    markAllAsRead,
  } = useMedinaStore((s) => s.notifications);

  return (
    <View>
      <Text>Unread: {unreadCount}</Text>
      <Text>Permission: {permissionGranted ? 'Granted' : 'Denied'}</Text>
    </View>
  );
}
```

---

## Notification Types

The system supports 6 notification types:

| Type | Channel | Color | Icon | Use Case |
|------|---------|-------|------|----------|
| `order` | orders | #0076F5 | cube | Order updates, delivery status |
| `cart` | cart | #FF6B57 | cart | Cart reminders, price drops |
| `wishlist` | wishlist | #EC4899 | heart | Back in stock, price drops |
| `wallet` | wallet | #00D79E | wallet | Balance updates, vouchers |
| `promo` | promos | #FFB13B | tag | Flash sales, discounts |
| `system` | system | #9CA3AF | info | Account updates, security |

---

## Database Schema

### Notifications Table (existing)
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('order', 'promo', 'system', 'wallet', 'cart', 'wishlist')),
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Push Tokens Table (new)
```sql
CREATE TABLE push_tokens (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  token TEXT UNIQUE NOT NULL,
  platform TEXT CHECK (platform IN ('ios', 'android')),
  device_info JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_used_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);
```

---

## Notification Triggers

### Automatically Triggers On:

#### Cart Events
- Item added to cart
- Cart abandoned (30 min later)
- Price drop for cart item

#### Order Events
- Order placed → `notifyOrderPlaced(orderId)`
- Order paid → `notifyOrderPaid(orderId)`
- Order processing → `notifyOrderProcessing(orderId)`
- Order shipped → `notifyOrderShipped(orderId, courier)`
- Order delivered → `notifyOrderDelivered(orderId)`
- Order cancelled → `notifyOrderCancelled(orderId)`

#### Payment Events
- Payment successful → `notifyPaymentSuccessful(amount)`
- Payment failed → `notifyPaymentFailed(amount)`
- Refund processed → `notifyRefundProcessed(amount, orderId)`

#### Wishlist Events
- Back in stock → `notifyWishlistBackInStock(name, productId)`
- Price drop → `notifyWishlistPriceDrop(name, price, productId)`
- Flash sale → `notifyWishlistFlashSale(name, discount, productId)`

#### Wallet Events
- Top-up success → `notifyWalletTopupSuccess(amount)`
- Low balance → `notifyWalletLowBalance(balance)`
- Voucher received → `notifyWalletVoucherReceived(name, voucherId)`

#### Promo Events
- New voucher → `notifyPromoNewVoucher(name, discount, voucherId)`
- Flash sale starts → `notifyPromoFlashSaleStart(category, categoryId)`
- Personalized offer → `notifyPromoPersonalizedOffer(offer)`

---

## Setup Instructions

### 1. Run Database Migration

```bash
# Run the push tokens migration
psql -U your_user -d alma_db -f scripts/create_push_tokens_table.sql
```

### 2. Set Environment Variables

```env
# Add to .env
EXPO_PUBLIC_PROJECT_ID=your-expo-project-id
```

### 3. Test Notification System

```typescript
// Test local notification
import { localNotificationService } from '@/services/localNotificationService';

await localNotificationService.notifyWelcome('John Doe');

// Test push notification
import { pushNotificationService } from '@/services/pushNotificationService';

await pushNotificationService.registerForPushNotifications();
```

---

## Advanced Features

### Real-time Notifications
The system automatically subscribes to Supabase realtime for new notifications:

```typescript
// Automatically handled in NotificationContext
supabase
  .channel('notifications-channel')
  .on('postgres_changes', { event: 'INSERT', table: 'notifications' }, (payload) => {
    // Auto-adds to store and shows notification
  })
  .subscribe();
```

### Deep Linking
Notifications can navigate to specific screens:

```typescript
await scheduleLocalNotification({
  title: 'Order Shipped',
  body: 'Your order is on its way',
  data: {
    type: 'order',
    actionUrl: '/order/12345',
    orderId: '12345',
  }
});
```

### Badge Management
```typescript
import { getBadgeCountAsync, setBadgeCountAsync } from '@/lib/notifications';

// Get current badge count
const count = await getBadgeCountAsync();

// Set badge count
await setBadgeCountAsync(5);

// Clear badge
await setBadgeCountAsync(0);
```

---

## Translation Keys

Added to `constants/i18n.ts`:

```typescript
notifications_title: 'Notifications' / 'Notifikasi'
no_notifications: 'No Notifications' / 'Tidak Ada Notifikasi'
mark_all_read: 'Mark All as Read' / 'Tandai Semua Dibaca'
notification_settings: 'Notification Settings' / 'Pengaturan Notifikasi'
enable_notifications: 'Enable Notifications' / 'Aktifkan Notifikasi'
notifications_permission_title: 'Stay Updated' / 'Tetap Terupdate'
notifications_permission_message: 'Allow notifications...' / 'Izinkan notifikasi...'
```

---

## Troubleshooting

### Notifications Not Showing

1. **Check Permissions**: Ensure permission granted
   ```typescript
   const { status } = await Notifications.getPermissionsAsync();
   console.log('Permission status:', status);
   ```

2. **Check Channels (Android)**: Channels must be configured
   ```typescript
   await configureNotificationChannels();
   ```

3. **Check Device**: Physical device required for push notifications
   ```typescript
   console.log('Is physical device:', Device.isDevice);
   ```

### Push Notifications Not Working

1. **Verify Token**: Check token is registered in database
2. **Check Expo Project ID**: Ensure EXPO_PUBLIC_PROJECT_ID is set
3. **Test with Expo Tool**: Use Expo Push Notification Tool

### Database Sync Issues

1. **Check RLS Policies**: Ensure policies allow read/write
2. **Verify User Auth**: Check user is authenticated
3. **Test Subscription**: Verify realtime channel is connected

---

## Best Practices

1. **Ask Permission at Right Time**: Show permission prompt after user sees value
2. **Group Notifications**: Don't spam, batch similar updates
3. **Use Quiet Hours**: Respect user's do-not-disturb settings
4. **Provide Value**: Every notification should be actionable
5. **Test Thoroughly**: Test on both iOS and Android physical devices

---

## Next Steps

1. ✅ **Phase 1-7 Complete**: Core notification system implemented
2. **Phase 8 Testing**: Test all notification scenarios
3. **Backend Integration**: Set up Supabase Edge Functions for server-side push
4. **Analytics**: Track notification open rates and engagement
5. **A/B Testing**: Test different notification templates

---

## Support

For issues or questions, refer to:
- [Expo Notifications Docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- Internal documentation: `memory/NOTIFICATION_SYSTEM.md`

---

**Implementation Date**: 2026-02-18
**Status**: ✅ Complete & Ready for Testing
**Files Created**: 15 new files
**Files Modified**: 5 files
