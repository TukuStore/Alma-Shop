# Fix Push Token Registration Error

## Problem
Error saat menyimpan push token:
```
Error saving push token: {"code": "42501", "message": "new row violates row-level security policy (USING expression) for table \"push_tokens\""}
```

## Solution
Jalankan SQL script berikut di **Supabase SQL Editor**:

### Quick Fix
Buka file: [`scripts/fix_push_tokens_rls.sql`](../scripts/fix_push_tokens_rls.sql)

Copy semua SQL-nya dan jalankan di Supabase SQL Editor.

### Manual Steps

1. Buka [Supabase SQL Editor](https://supabase.com/dashboard/project/fhkzfwebhcyxhrnojwra/sql/new)
2. Jalankan query berikut:

```sql
-- Drop existing problematic policy
DROP POLICY IF EXISTS "Users can manage their own tokens" ON public.push_tokens;

-- Create separate policies for each operation
CREATE POLICY "Users can insert their own tokens" ON public.push_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own tokens" ON public.push_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens" ON public.push_tokens
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tokens" ON public.push_tokens
  FOR DELETE USING (auth.uid() = user_id);
```

3. Klik **Run** untuk mengeksekusi

## Verification

Setelah menjalankan SQL, verifikasi dengan query ini:

```sql
SELECT
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'push_tokens';
```

Expected output:
- `Users can insert their own tokens` (INSERT)
- `Users can view their own tokens` (SELECT)
- `Users can update their own tokens` (UPDATE)
- `Users can delete their own tokens` (DELETE)
- `Admins can view all push tokens` (SELECT)

## Why This Fix Works

Policy `FOR ALL` dengan kombinasi `USING` dan `WITH CHECK` bisa menyebabkan masalah untuk operasi INSERT. Dengan memisahkan policy untuk setiap operasi (INSERT, SELECT, UPDATE, DELETE), kita lebih eksplisit tentang izin yang diberikan.

**Key Changes:**
- `FOR INSERT WITH CHECK` - Memastikan user hanya bisa insert token miliknya sendiri
- `FOR SELECT USING` - Memastikan user hanya bisa view token miliknya sendiri
- `FOR UPDATE USING ... WITH CHECK` - Memastikan user hanya bisa update token miliknya sendiri
- `FOR DELETE USING` - Memastikan user hanya bisa delete token miliknya sendiri

## Testing

Setelah fix, restart app dan coba:

1. Buka app mobile
2. Login
3. Grant permission untuk push notifications
4. Token harus berhasil tersimpan tanpa error

## Troubleshooting

Jika masih error:
1. Cek bahwa RLS enabled untuk tabel `push_tokens`:
   ```sql
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public' AND tablename = 'push_tokens';
   ```
   Result: `rowsecurity` harus `true`

2. Cek policy yang ada:
   ```sql
   SELECT * FROM pg_policies
   WHERE schemaname = 'public' AND tablename = 'push_tokens';
   ```

3. Pastikan `auth.uid()` tidak null:
   ```sql
   SELECT auth.uid();
   ```
   Result: Harus return UUID user yang sedang login
