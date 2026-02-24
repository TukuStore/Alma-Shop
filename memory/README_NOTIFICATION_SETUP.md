# 🚀 Setup Cepat Notification System - ALMA

## ⚡ Quick Start (3 Langkah)

### 1️⃣ Copy Script SQL
Buka file: `scripts/setup_notifications_supabase.sql`

### 2️⃣ Paste di Supabase
1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project ALMA
3. Klik **SQL Editor** → **New Query**
4. Paste script dari langkah 1
5. Klik **Run** ▶️

### 3️⃣ Test di App
```typescript
// Test notification
import { notifyOrderPlaced } from '@/services/notificationIntegration';

await notifyOrderPlaced('ORDER-123');
```

**✅ Done!** Notification system sudah aktif.

---

## 📦 Apa yang Di-setup?

### Databases
- ✅ Table `notifications` (update dengan kolom `data`)
- ✅ Table `push_tokens` (baru untuk Expo Push)
- ✅ Indexes untuk performance
- ✅ RLS policies untuk security

### Functions
- ✅ `create_notification()` - Buat notifikasi
- ✅ `mark_all_notifications_read()` - Tandai semua read
- ✅ `get_unread_notification_count()` - Hitung unread

### Triggers
- ✅ Auto-update `last_used_at` untuk push tokens

---

## 🧪 Test Query (Copy-Paste di Supabase SQL Editor)

```sql
-- Test 1: Buat notifikasi
SELECT create_notification(
    (SELECT id FROM public.profiles LIMIT 1),
    'Test Notification 🧪',
    'Ini test notification dari Supabase',
    'system',
    NULL,
    NULL
);

-- Test 2: Lihat semua notifikasi
SELECT * FROM public.notifications
ORDER BY created_at DESC
LIMIT 10;

-- Test 3: Hitung unread
SELECT get_unread_notification_count(
    (SELECT id FROM public.profiles LIMIT 1)
);

-- Test 4: Mark all read
SELECT mark_all_notifications_read(
    (SELECT id FROM public.profiles LIMIT 1)
);
```

---

## 📱 Contoh Penggunaan di App

### Order Notification
```typescript
import { notifyOrderPlaced } from '@/services/notificationIntegration';

await notifyOrderPlaced('ORD-12345');
// → User dapat notifikasi: "Order Confirmed ✅"
```

### Cart Notification
```typescript
import { notifyCartItemAdded } from '@/services/notificationIntegration';

await notifyCartItemAdded('Kemeja Batik', 'prod-123');
// → User dapat notifikasi: "Added to Cart 🛒"
```

### Payment Notification
```typescript
import { notifyPaymentSuccessful } from '@/services/notificationIntegration';

await notifyPaymentSuccessful('IDR 150.000');
// → User dapat notifikasi: "Payment Successful ✅"
```

### Push Notification (Broadcast)
```typescript
import { pushNotificationService } from '@/services/pushNotificationService';

await pushNotificationService.sendBroadcastPush(
    'Flash Sale! ⚡',
    '50% off semua produk, hanya 1 jam!'
);
// → Semua user dapat push notification
```

---

## 🔧 Verifikasi Setup

Jalankan query ini di Supabase SQL Editor:

```sql
-- Checklist verification query
SELECT
    'notifications table' as item,
    COUNT(*) as status
FROM information_schema.columns
WHERE table_name = 'notifications'
UNION ALL
SELECT
    'push_tokens table',
    COUNT(*)
FROM information_schema.columns
WHERE table_name = 'push_tokens'
UNION ALL
SELECT
    'RLS policies',
    COUNT(*)
FROM pg_policies
WHERE tablename IN ('notifications', 'push_tokens')
UNION ALL
SELECT
    'Helper functions',
    COUNT(*)
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%notification%';
```

Hasil harus menunjukkan semua item > 0.

---

## 📚 Dokumentasi Lengkap

### File yang Perlu Dibaca:
1. **`memory/SUPABASE_NOTIFICATION_SETUP.md`** - Setup detail Supabase
2. **`memory/NOTIFICATION_SYSTEM.md`** - Dokumentasi lengkap sistem
3. **`scripts/setup_notifications_supabase.sql`** - Script SQL lengkap

### File Implementasi:
- `lib/notifications.ts` - Core config
- `services/localNotificationService.ts` - Local notifications
- `services/pushNotificationService.ts` - Push notifications
- `services/notificationIntegration.ts` - Helper functions
- `contexts/NotificationContext.tsx` - Provider
- `components/notifications/` - UI components

---

## ❓ FAQ

### Q: Apakah perlu restart app?
A: Tidak perlu. Cukup refresh browser jika testing di web.

### Q: Push notification tidak muncul?
A: Pastikan test di **physical device** (bukan emulator/simulator). Push notification tidak work di simulator.

### Q: Error "relation public.notifications does not exist"?
A: Jalankan query dari file `scripts/create_notifications_table.sql` dulu untuk buat table awal.

### Q: Notifikasi tidak muncul di app?
A: Cek:
1. Permission sudah granted? (Settings → Notifications)
2. User sudah login?
3. Cek database: `SELECT * FROM notifications WHERE user_id = 'your-id'`

---

## 🎉 Setelah Setup Berhasil

Notification system sudah siap dengan fitur:

✅ **Local Notifications** - Muncul di app & notification center
✅ **Push Notifications** - Via Expo Push API
✅ **Real-time Sync** - Supabase realtime subscription
✅ **Badge Counts** - Jumlah unread di tabs
✅ **Settings Screen** - User bisa atur preferensi
✅ **Multi-language** - English & Indonesian
✅ **Deep Linking** - Tap notification → navigate ke screen

---

## 💡 Tips Best Practices

1. **Jangan spam** - Max 1-2 notifications per event
2. **Relevan** - Setiap notification harus有价值
3. **Actionable** - Sertakan action_url untuk deep link
4. **Personal** - Pakai nama user jika mungkin
5. **Timing** - Jangan kirim di jam tidur (kecuali urgent)

---

**Need Help?**
- Cek `memory/SUPABASE_NOTIFICATION_SETUP.md` untuk troubleshooting
- Cek `memory/NOTIFICATION_SYSTEM.md` untuk dokumentasi lengkap

**Status**: ✅ Ready to Use
**Last Updated**: 2026-02-18
