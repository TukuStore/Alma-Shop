# 🚨 FIX: Push Token Registration Error

## Masalah
```
Error saving push token: {"code": "42501", "message": "new row violates row-level security policy (USING expression) for table 'push_tokens'"}
```

## 🔧 Solusi - Step by Step

### Langkah 1: Buka Supabase SQL Editor
1. Buka browser dan kunjungi: https://supabase.com/dashboard/project/fhkzfwebhcyxhrnojwra/sql/new
2. Anda akan melihat SQL Editor dengan textarea kosong

### Langkah 2: Copy SQL Script
Copy seluruh isi dari file ini:
**File:** [`scripts/fix_push_tokens_rls.sql`](../scripts/fix_push_tokens_rls.sql)

Atau copy langsung di sini:

```sql
-- Drop ALL existing user policies for push_tokens (if any)
DROP POLICY IF EXISTS "Users can manage their own tokens" ON public.push_tokens;
DROP POLICY IF EXISTS "Users can insert their own tokens" ON public.push_tokens;
DROP POLICY IF EXISTS "Users can view their own tokens" ON public.push_tokens;
DROP POLICY IF EXISTS "Users can update their own tokens" ON public.push_tokens;
DROP POLICY IF EXISTS "Users can delete their own tokens" ON public.push_tokens;

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

### Langkah 3: Paste & Run
1. **Paste** SQL script ke textarea SQL Editor
2. Klik tombol **Run** (atau tekan `Ctrl + Enter`)
3. Tunggu proses selesai (biasanya < 1 detik)

### Langkah 4: Verifikasi
Setelah script berhasil dijalankan, Anda akan melihat hasil query di bawah:

| policyname | cmd |
|-----------|-----|
| Users can insert their own tokens | INSERT |
| Users can view their own tokens | SELECT |
| Users can update their own tokens | UPDATE |
| Users can delete their own tokens | DELETE |
| Admins can view all push tokens | SELECT |

**✅ Jika Anda melihat 5 policies seperti di atas, berarti FIX berhasil!**

### Langkah 5: Test
1. **Restart app mobile** Anda (close dan buka lagi)
2. **Login** ke app
3. **Grant permission** untuk notifications saat diminta
4. Push token harus tersimpan **tanpa error**

## 🎯 Cara Kerja Fix

### Masalah Utama
Policy lama menggunakan `FOR ALL` yang tidak eksplisit:
```sql
-- ❌ POLICY LAMA (Bermasalah)
CREATE POLICY "Users can manage their own tokens" ON public.push_tokens
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

Masalah:
- `FOR ALL` mencakup SELECT, INSERT, UPDATE, DELETE
- Kombinasi `USING` + `WITH CHECK` menyebabkan konflik untuk INSERT
- PostgreSQL mengharuskan policy INSERT menggunakan `WITH CHECK` saja

### Solusi
Pisahkan policy untuk setiap operasi:
```sql
-- ✅ POLICY BARU (Fix)
CREATE POLICY "Users can insert their own tokens" ON public.push_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own tokens" ON public.push_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens" ON public.push_tokens
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tokens" ON public.push_tokens
  FOR DELETE USING (auth.uid() = user_id);
```

Keuntungan:
- ✅ Lebih eksplisit dan mudah di-debug
- ✅ Setiap operasi memiliki policy tersendiri
- ✅ Tidak ada konflik antara `USING` dan `WITH CHECK`

## 🐛 Troubleshooting

### Masalah: SQL Error saat menjalankan script

**Error:** `policy "Users can manage their own tokens" does not exist`

**Solusi:** Ini normal! Script menggunakan `DROP POLICY IF EXISTS` jadi tidak masalah jika policy tidak ada. Lanjutkan saja.

### Masalah: Masih error setelah menjalankan SQL

**Cek 1:** Pastikan RLS enabled
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'push_tokens';
```
Expected: `rowsecurity` harus `true`

**Cek 2:** Pastikan user sudah login
```sql
SELECT auth.uid();
```
Expected: Harus return UUID (bukan NULL)

**Cek 3:** Cek policy yang ada
```sql
SELECT policyname, cmd FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'push_tokens';
```
Expected: Harus ada 5 policies (seperti di Langkah 4)

### Masalah: Tidak bisa akses Supabase Dashboard

**Solusi:**
1. Pastikan Anda login ke Supabase
2. Pastikan Anda memilih project yang benar: `fhkzfwebhcyxhrnojwra`
3. Pastikan Anda punya akses owner/admin

## 📋 Checklist

Sebelum menjalankan SQL script:
- [ ] Login ke Supabase Dashboard
- [ ] Pilih project yang benar (fhkzfwebhcyxhrnojwra)
- [ ] Buka SQL Editor

Setelah menjalankan SQL script:
- [ ] Script berhasil dijalankan tanpa error
- [ ] Verifikasi 5 policies ter-create (Langkah 4)
- [ ] Restart mobile app
- [ ] Test push token registration
- [ ] Tidak ada error lagi

## 📚 Referensi

- **SQL Script:** [`scripts/fix_push_tokens_rls_complete.sql`](../scripts/fix_push_tokens_rls_complete.sql)
- **Full Fix Script:** [`scripts/fix_admin_push_rls.sql`](../scripts/fix_admin_push_rls.sql)
- **Dokumentasi Lengkap:** [`docs/FIX_PUSH_TOKENS_RLS.md`](FIX_PUSH_TOKENS_RLS.md)

## ⚡ Quick Fix (Copy-Paste)

Langsung copy ini ke Supabase SQL Editor:

```sql
-- Drop ALL existing user policies for push_tokens (if any)
DROP POLICY IF EXISTS "Users can manage their own tokens" ON public.push_tokens;
DROP POLICY IF EXISTS "Users can insert their own tokens" ON public.push_tokens;
DROP POLICY IF EXISTS "Users can view their own tokens" ON public.push_tokens;
DROP POLICY IF EXISTS "Users can update their own tokens" ON public.push_tokens;
DROP POLICY IF EXISTS "Users can delete their own tokens" ON public.push_tokens;

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

**Kemudian klik RUN!** 🚀

### ✅ Keuntungan Script Ini
Script ini **idempoten** - bisa dijalankan berkali-kali tanpa error:
- `DROP POLICY IF EXISTS` - Hapus policy jika ada dulu
- `CREATE POLICY` - Buat policy baru (aman karena sudah di-drop)
