# 🚨 URGENT: Push Token Error - HARUS DIJALANKAN MANUAL

## Masalah
```
Error saving push token: {"code": "42501", "message": "new row violates row-level security policy"}
```

## ⚠️ PENTING: Script SQL BELUM OTOMATIS BERJALAN

SQL script yang sudah dibuat **TIDAK akan otomatis memperbaiki error**. Anda **HARUS** menjalankannya manual di Supabase!

---

## 🔧 SOLUSI - 3 LANGKAH MUDAH

### Step 1: Buka Supabase SQL Editor
1. Klik link ini: https://supabase.com/dashboard/project/fhkzfwebhcyxhrnojwra/sql/new
2. Login jika diminta
3. Anda akan melihat halaman SQL Editor

### Step 2: Copy & Paste SQL

**Copy SELURUH SQL di bawah ini:**

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

**Paste ke SQL Editor di Supabase**

### Step 3: RUN
1. Klik tombol **RUN** di pojok kanan atas
2. Tunggu 1-2 detik
3. Jika berhasil, Anda akan melihat hasil query

---

## ✅ VERIFIKASI - Pastikan Berhasil

Setelah klik RUN, Anda harus melihat tabel seperti ini:

| policyname | cmd |
|-----------|-----|
| Admins can view all push tokens | SELECT |
| Users can delete their own tokens | DELETE |
| Users can insert their own tokens | INSERT |
| Users can update their own tokens | UPDATE |
| Users can view their own tokens | SELECT |

**Jika Anda melihat 5 policies di atas = FIX BERHASIL! ✅**

---

## 🎯 FINAL STEP - Test di App

1. **Close app mobile** Anda sepenuhnya (swipe up/close from recent apps)
2. **Buka app lagi**
3. **Login**
4. **Allow notifications** saat diminta
5. ✅ **Push token harus tersimpan TANPA ERROR**

---

## ❓ FAQ

### Q: Saya sudah jalankan SQL tapi masih error?
**A:** Restart app mobile Anda. SQL sudah berjalan di server, tapi app masih menggunakan koneksi lama.

### Q: Error saat jalankan SQL "policy already exists"?
**A:** Normal saja! Script menggunakan `DROP POLICY IF EXISTS` jadi aman. Lanjutkan saja.

### Q: Saya tidak bisa akses Supabase Dashboard?
**A:** Pastikan Anda:
1. Login ke https://supabase.com/dashboard
2. Pilih project: **fhkzfwebhcyxhrnojwra**
3. Klik **SQL Editor** di sidebar kiri
4. Klik **New query**

---

## 📞 Butuh Bantuan?

Jika masih error setelah menjalankan SQL dan restart app:

1. **Cek apakah SQL sudah di-run:**
   - Buka Supabase SQL Editor lagi
   - Jalankan: `SELECT * FROM pg_policies WHERE tablename = 'push_tokens';`
   - Harus ada 5 policies

2. **Cek apakah user sudah login:**
   - Di Supabase SQL Editor, jalankan: `SELECT auth.uid();`
   - Harus return UUID (bukan NULL)

3. **Restart app:**
   - Close app sepenuhnya
   - Buka lagi
   - Login ulang

---

## 🎯 Summary

1. ✅ Buka: https://supabase.com/dashboard/project/fhkzfwebhcyxhrnojwra/sql/new
2. ✅ Copy SQL di atas
3. ✅ Paste & RUN
4. ✅ Close & buka app lagi
5. ✅ Test push token registration

**Estimasi waktu: 2 menit** ⏱️
