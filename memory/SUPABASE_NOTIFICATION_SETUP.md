# Cara Setup Notification System di Supabase

## 📋 Langkah-Langkah Setup

### 1. Buka Supabase SQL Editor

1. Login ke [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project ALMA kamu
3. Klik menu **SQL Editor** di sidebar kiri
4. Klik tombol **+ New Query**

### 2. Jalankan Script Setup

**Copy seluruh isi file ini** dan paste ke SQL Editor:

```
scripts/setup_notifications_supabase.sql
```

Atau jalankan per bagian:

#### A. Update Table Notifications yang Sudah Ada

```sql
-- Tambah kolom data untuk additional payload
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS data JSONB;

-- Update type constraint untuk cart dan wishlist
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications
ADD CONSTRAINT notifications_type_check
CHECK (type IN ('order', 'promo', 'system', 'wallet', 'cart', 'wishlist'));
```

#### B. Create Table Push Tokens

```sql
CREATE TABLE IF NOT EXISTS public.push_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
    device_info JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_push_tokens_user ON public.push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_token ON public.push_tokens(token);
CREATE INDEX IF NOT EXISTS idx_push_tokens_active ON public.push_tokens(is_active);
```

#### C. Setup RLS Policies

```sql
-- Enable RLS
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own push tokens"
    ON public.push_tokens FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own push tokens"
    ON public.push_tokens FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own push tokens"
    ON public.push_tokens FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own push tokens"
    ON public.push_tokens FOR DELETE
    USING (auth.uid() = user_id);
```

#### D. Create Helper Functions

```sql
-- Function: Create Notification
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_title TEXT,
    p_message TEXT,
    p_type TEXT,
    p_action_url TEXT DEFAULT NULL,
    p_data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    INSERT INTO public.notifications (
        user_id, title, message, type, action_url, data, is_read
    )
    VALUES (
        p_user_id, p_title, p_message, p_type, p_action_url, p_data, false
    )
    RETURNING id INTO v_notification_id;

    RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Mark All as Read
CREATE OR REPLACE FUNCTION mark_all_notifications_read(
    p_user_id UUID
)
RETURNS INT AS $$
DECLARE
    v_count INT;
BEGIN
    UPDATE public.notifications
    SET is_read = true
    WHERE user_id = p_user_id AND is_read = false;

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get Unread Count
CREATE OR REPLACE FUNCTION get_unread_notification_count(
    p_user_id UUID
)
RETURNS INT AS $$
DECLARE
    v_count INT;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM public.notifications
    WHERE user_id = p_user_id AND is_read = false;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3. Klik **Run** atau tekan `Ctrl + Enter`

Tunggu sampai query selesai. Jika ada error, cek bagian mana yang error dan jalankan ulang per bagian.

---

## ✅ Verifikasi Setup

Setelah script selesai, jalankan query ini untuk memverifikasi:

```sql
-- Cek tabel notifications
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'notifications'
ORDER BY ordinal_position;

-- Cek tabel push_tokens
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'push_tokens'
ORDER BY ordinal_position;

-- Cek RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('notifications', 'push_tokens');

-- Cek functions
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%notification%'
ORDER BY routine_name;
```

---

## 🎯 Cara Pakai Helper Functions

### 1. Create Notification dari Backend

```sql
-- Contoh: Buat notifikasi order
SELECT create_notification(
    'user-id-uuid-here',  -- user_id
    'Order Placed ✅',     -- title
    'Your order #12345 has been confirmed', -- message
    'order',              -- type
    '/order/12345',       -- action_url
    '{"orderId": "12345"}'::jsonb -- data
);

-- Contoh: Buat notifikasi promo
SELECT create_notification(
    'user-id-uuid-here',
    'Flash Sale! ⚡',
    '50% off on all items',
    'promo',
    '/categories',
    NULL
);

-- Contoh: Buat notifikasi wallet
SELECT create_notification(
    'user-id-uuid-here',
    'Top Up Successful 💵',
    'Your wallet has been topped up with IDR 100.000',
    'wallet',
    '/wallet',
    '{"amount": 100000}'::jsonb
);
```

### 2. Mark All as Read

```sql
-- Tandai semua notifikasi user sebagai read
SELECT mark_all_notifications_read('user-id-uuid-here');
```

### 3. Get Unread Count

```sql
-- Dapatkan jumlah notifikasi unread
SELECT get_unread_notification_count('user-id-uuid-here');
```

---

## 🔧 Maintenance

### Cleanup Old Notifications (Optional)

```sql
-- Hapus notifikasi read yang lebih dari 90 hari
SELECT cleanup_old_notifications(90);
```

### Cleanup Inactive Push Tokens (Optional)

```sql
-- Deactivate token yang tidak dipakai 30 hari
-- Delete token yang inactive lebih dari 90 hari
SELECT cleanup_inactive_push_tokens();
```

---

## 📱 Cara Test Notification

### 1. Test via SQL Editor

```sql
-- Buat test notification untuk user kamu
SELECT create_notification(
    (SELECT id FROM public.profiles LIMIT 1), -- pakai user ID kamu
    'Test Notification 🧪',
    'This is a test notification from Supabase',
    'system',
    NULL,
    NULL
);
```

### 2. Test dari App

```typescript
// Di app, panggil helper function
import { notifyOrderPlaced } from '@/services/notificationIntegration';

await notifyOrderPlaced('TEST-ORDER-123');
```

### 3. Cek di Database

```sql
-- Lihat semua notifikasi user
SELECT * FROM public.notifications
WHERE user_id = 'your-user-id'
ORDER BY created_at DESC;

-- Lihat notifikasi unread
SELECT * FROM public.notifications
WHERE user_id = 'your-user-id'
  AND is_read = false
ORDER BY created_at DESC;
```

---

## 🐛 Troubleshooting

### Error: "relation public.notifications does not exist"

**Solusi**: Pastikan tabel `notifications` sudah ada. Jika belum, jalankan:

```sql
-- Buat tabel notifications dari awal
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('order', 'promo', 'system', 'wallet', 'cart', 'wishlist')),
    is_read BOOLEAN NOT NULL DEFAULT false,
    action_url TEXT,
    data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(is_read);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
```

### Error: "function create_notification does not exist"

**Solusi**: Jalankan ulang bagian **D. Create Helper Functions** di atas.

### Error: "permission denied for table notifications"

**Solusi**: Pastikan RLS policies sudah dibuat. Cek:

```sql
SELECT * FROM pg_policies WHERE tablename = 'notifications';
```

Jika kosong, jalankan ulang bagian **C. Setup RLS Policies**.

---

## ✅ Checklist Setup

- [ ] Jalankan script setup di Supabase SQL Editor
- [ ] Verifikasi tabel `notifications` sudah update (ada kolom `data`)
- [ ] Verifikasi tabel `push_tokens` sudah dibuat
- [ ] Verifikasi RLS policies sudah aktif
- [ ] Verifikasi helper functions sudah dibuat
- [ ] Test buat notifikasi dari SQL
- [ ] Test notifikasi muncul di app
- [ ] Test mark as read
- [ ] Test unread count

---

## 📚 Dokumentasi Lengkap

Lihat file `memory/NOTIFICATION_SYSTEM.md` untuk dokumentasi lengkap notification system.

---

**Last Updated**: 2026-02-18
**Status**: ✅ Ready for Production
