# Implementation Plan - AlmaStore

Dokumen ini merangkum **Implementation Plan saat ini** dari AlmaStore, dengan fokus utama pada pembaruan arsitektur aliran pesanan (Order Completion Flow) dan langkah-langkah selanjutnya yang akan dieksekusi.

---

## 🟢 Fase 1: Supabase & Database Logic (Selesai)
- **SQL Migration (`scripts/migrate_order_completion.sql`)**:
  - Menambahkan kolom `shipped_at` dengan tipe `timestamp with time zone`.
  - Mengubah constraint validasi dari status `delivered` menjadi `completed`.
  - Mengubah rekam jejak pesanan lama menjadi `completed`.
- **Edge Function (`auto-complete-orders`)**:
  - Logika pengecekan otomatis (cron) untuk mengubah pesanan yang sudah `shipped` melebihi batas waktu (3 hari) menjadi `completed`.
- **Database Trigger (Notifikasi)**:
  - Menyuntikkan logika untuk memberikan notifikasi otomatis ke user ("Pesanan Selesai") ketika pesanan berstatus `completed`.

## 🟢 Fase 2: Aplikasi Android (Expo) (Selesai)
- **UI Order Detail (`app/order/[id].tsx`)**:
  - Sinkronisasi badge dan timeline status dengan parameter baru `completed`.
  - Pembuatan tombol prominent "Pesanan Selesai" (warna hijau) yang bisa diklik user jika status pengiriman adalah `shipped`.
  - Menyembunyikan tombol "Beri Ulasan" sebelum status pesanan resmi berubah menjadi `completed`.
- **State Management & List**:
  - Penyesuaian filter "Belum Dinilai" mengarah pada status `completed`.
- **Admin App View (`app/(admin)/...`)**:
  - Menghapus kontrol manual "Set Delivered" oleh admin, murni mengandalkan trigger pelanggan atau batas waktu sistem.

## 🟢 Fase 3: Web Store (Next.js) (Selesai)
- **Komponen Konfirmasi Order (`CompleteOrderButton.tsx`)**:
  - Mengembangkan Server Action `markOrderAsCompleted` dengan Revalidation Path penuh.
  - Implementasi UX interaktif dengan **Shadcn UI `<Dialog />`** yang responsif (max w-400px), mulus, serta *user-friendly* tanpa harus menggunakan native browser prompt.
- **Tampilan Daftar Pesanan (`app/orders/page.tsx`)**:
  - Menambahkan dukungan badge dan riwayat untuk status `completed`.

## 🟢 Fase 4: Admin Web (Vite + React) (Selesai)
- **Dashboard & Analitik Web (`src/pages/DashboardPage.tsx`)**:
  - Perbaikan diagram dan mapping logika pendapatan (Revenue) menyesuaikan `completed`.
- **Manajemen Pesanan (`src/pages/OrderDetailPage.tsx`)**:
  - Membersihkan tombol "Mark as Delivered" manual di panel Admin (sekarang murni auto-complete / by customer trigger).
- **Styling (`index.css`)**:
  - Pembaruan CSS classes dari `badge-delivered` menjadi `badge-completed`.
- **Validasi Build**:
  - Eksekusi stabil tanpa TypeScript ataupun ESLint Error.

## 🟢 Fase 5: Refaktor Status Database & Timeline Visual (Baru Saja Selesai)
- **Migrasi ENUM Database (`scripts/ensure_orders_status_enum.sql`)**:
  - Kolom `orders.status` diubah dari tipe `TEXT` menjadi `ENUM` dengan validasi ketat status uppercase (`PENDING`, `COMPLETED`, dll).
- **Penambahan Kolom Timestamp (`scripts/add_order_timestamps.sql`)**:
  - Menyuntikkan _timestamp tracking_ yang akurat (`paid_at`, `shipped_at`, dsb) via trigger database ketika status berubah.
- **Komponen Visual Timeline (`web-store/components/ShippingTimeline.tsx`)**:
  - Integrasi komponen interaktif `ShippingTimeline` di detail pesanan menggantikan status timeline lama yang statis.
- **Daftar & Detail Pesanan (Web Store)**:
  - Tampilan daftar pesanan dengan dukungan navigasi 7 tipe tab.
  - Perbaikan perbandingan status dari _lowercase_ menjadi _UPPERCASE_ bawaan fitur ENUM database.

---

## 🟡 Fase 6: Next Steps & Future Plans (On-Going / Scheduled)
Langkah-langkah strategis selanjutnya dari arsitektur aplikasi:
1. **Midtrans Payment Gateway Integration**:
   - Menselaraskan status `PAID` dengan event trigger Midtrans.
2. **Review & Return Flow Validation**:
   - Memastikan aliran UX retur dan ulasan berfungsi aman tanpa bypass status pesanan.
3. **Optimasi Frontend Rendering**:
   - React Query Integration (opsional) atau pendalaman cache Zustand untuk real-time badge di tab navigasi Mobile App.

---
**Status Dokumen**: Updated & Valid.
**Sinkronisasi ke Memory**: Tersalin dengan baik dari pipeline instruksi sebelumnya untuk dokumentasi riwayat (Audit Trail) AlmaStore.
