# CLAUDE.md — AlmaStore Project Memory

> Auto-loaded by Claude Code. Berisi konteks lengkap proyek AlmaStore untuk sesi baru.
> Last updated: 2026-02-21

---

## 🗂️ Struktur Monorepo

```
d:/AlmaStore/
├── app/                    # Expo Router (React Native) — Mobile app
├── admin-web/              # Vite + React + TypeScript — Admin Dashboard (WEB)
├── components/             # Shared RN components
├── services/               # Shared Supabase services (mobile)
├── store/                  # Zustand stores (mobile)
├── lib/                    # Utilities (currency, supabase, etc.)
├── constants/              # Theme, i18n, category images
├── memory/                 # Project memory files (sync Claude<->Antigravity)
├── supabase/               # Supabase config & migrations
└── scripts/                # SQL scripts
```

---

## 🔧 Tech Stack

### Mobile App (Expo/React Native)
| Layer | Tech |
|-------|------|
| Framework | Expo SDK 52, React Native |
| Router | Expo Router v4 (file-based) |
| Styling | NativeWind (Tailwind for RN) |
| State | Zustand |
| Backend | Supabase (JS client) |
| Auth | Supabase Auth |
| Payments | (Midtrans — planned) |

### Admin Web (`admin-web/`)
| Layer | Tech |
|-------|------|
| Framework | Vite 7 + React 19 + TypeScript |
| Routing | React Router v6 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| State | Zustand |
| Forms | React Hook Form + Zod v4 |
| Backend | Supabase JS |
| UI Extras | Lucide React, React Hot Toast, Recharts |
| Dev port | `localhost:5174` |

---

## 🗄️ Supabase

- **Project URL:** `https://fhkzfwebhcyxhrnojwra.supabase.co`
- **Project ID:** `fhkzfwebhcyxhrnojwra`
- **Region:** (Southeast Asia)
- **Auth:** Email+Password via Supabase Auth

### Key Tables

| Table | Description |
|-------|-------------|
| `profiles` | User profiles. Kolom: `user_id`, `full_name`, `avatar_url`, `phone_number`, `username`, `role` ('admin'\|'customer'), `created_at` |
| `products` | Produk sarung. Kolom: `id`, `name`, `description`, `price`, `original_price`, `stock`, `category_id`, `material`, `images[]`, `is_featured`, `is_active`, `created_at` |
| `categories` | Kategori produk. Kolom: `id`, `name`, `slug`, `image_url` |
| `orders` | Order. Kolom: `id`, `user_id`, `total_amount`, `status`, `shipping_address`, `payment_proof_url`, `created_at` |
| `order_items` | Item dalam order |
| `wallets` | Kolom: `user_id`, `balance` |
| `reward_points` | Kolom: `user_id`, `points` |
| `vouchers` | Voucher diskon |
| `reviews` | Review produk |
| `returns` | Return request |
| `hero_sliders` | Banner hero di halaman utama |
| `wishlists` / `wishlist_items` | Favorit user |

### RLS Notes
- `profiles` RLS: `auth.uid() = id` (bukan `user_id`!) — kolom `id` = UUID auth
- Admin check: query `profiles` where `user_id = auth_user_id AND role = 'admin'`
- `wallets` — ada masalah 406 error, pastikan RLS policy benar

### Product Categories (8 Sarung types)
- Sarung Songket, Batik Cap, Batik Tulis, Batik Kombinasi
- Batik Printing, Sutra/Spunsilk, Katun/Poliester, Goyor

---

## 🌐 Admin Web (`admin-web/`)

### Run Dev Server
```bash
cd admin-web
npm run dev
# Runs on localhost:5174 (5173 biasanya dipakai mobile)
```

### Auth Flow
1. `LoginPage` → Supabase `signInWithPassword`
2. Cek `profiles.role === 'admin'`
3. **PENTING:** Set `useAdminStore.setUser(admin)` SEBELUM `navigate()`
4. `ProtectedRoute` skip re-verify jika user sudah di store

### Pages (13 total)
| Route | Component |
|-------|-----------|
| `/login` | LoginPage |
| `/dashboard` | DashboardPage |
| `/products` | ProductListPage |
| `/products/new` | ProductFormPage |
| `/products/:id/edit` | ProductFormPage (edit mode) |
| `/categories` | CategoryListPage |
| `/orders` | OrderListPage |
| `/orders/:id` | OrderDetailPage |
| `/vouchers` | VoucherListPage |
| `/vouchers/new` | VoucherFormPage |
| `/vouchers/:id/edit` | VoucherFormPage |
| `/users` | UserListPage |
| `/users/:id` | UserDetailPage |
| `/reviews` | ReviewListPage |
| `/returns` | ReturnListPage |
| `/notifications/send` | SendNotificationPage |

### Services (`admin-web/src/services/`)
- `productService.ts` — CRUD products + image upload ke Supabase Storage
- `categoryService.ts` — CRUD categories
- `orderService.ts` — fetch/update orders
- `userService.ts` — getUsers, getUserById, getUserWalletBalance, getUserOrderCount, updateUserRole
- `voucherService.ts` — CRUD vouchers
- `reviewService.ts`, `returnService.ts`, `notificationService.ts`

### Zustand Store (`admin-web/src/store/useAdminStore.ts`)
```typescript
{
  user: AdminUser | null,     // null saat logout
  isAuthLoading: false,        // starts false, set true during check
  setUser(user),               // juga set isAuthLoading=false
  setAuthLoading(bool),
  sidebarOpen: boolean,
}
```

### Known Issues Fixed
- `ProtectedRoute` hang: karena `setAuthLoading(false)` tidak dipanggil → sudah fix dengan `try/finally` + 8s timeout
- `ProductFormPage` blank: `CreateProductInput` diimport sebagai value bukan `import type` → sudah fix
- Zod v4 `z.coerce.number()` → returns `unknown` type → fix dengan `z.preprocess()` + manual FormData type

### Important Patterns

**Zod v4 + react-hook-form:**
```typescript
// JANGAN: z.coerce.number() → type unknown di Zod v4
// PAKAI:
const toNum = (val: unknown) => val === '' ? undefined : Number(val);
const schema = z.object({
  price: z.preprocess(toNum, z.number().min(1)),
});
type FormData = { price: number; /* manual type */ };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
resolver: zodResolver(schema) as any,
```

**Supabase `.maybeSingle()` vs `.single()`:**
```typescript
// PAKAI maybeSingle() untuk mencegah 406 saat row tidak ada
const { data } = await supabase.from('profiles').select('*').eq('user_id', id).maybeSingle();
```

**Type-only imports:**
```typescript
// Service exports: export type CreateProductInput = {...}
// Import di page:
import { createProduct } from '../services/productService';
import type { CreateProductInput } from '../services/productService';
```

---

## 📱 Mobile App (`app/`)

### File-based Routing (Expo Router)
```
app/
├── (tabs)/           # Bottom tab navigator
│   ├── index.tsx    # Home
│   ├── search.tsx   # Search
│   ├── cart.tsx     # Cart
│   └── profile.tsx  # Profile
├── product/[id].tsx  # Product detail
├── order/[id]/       # Order detail + review
├── wishlist/         # Wishlist
├── checkout/         # Checkout flow
└── _layout.tsx       # Root layout
```

### Environment Variables
```bash
# .env (mobile — gunakan EXPO_PUBLIC_ prefix)
EXPO_PUBLIC_SUPABASE_URL=https://fhkzfwebhcyxhrnojwra.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=...

# admin-web/.env.local (admin — gunakan VITE_ prefix)
VITE_SUPABASE_URL=https://fhkzfwebhcyxhrnojwra.supabase.co
VITE_SUPABASE_ANON_KEY=...
```

---

## 🎨 Design System

### Theme Colors (dari `constants/theme.ts`)
- Primary: Indigo/Purple family (Sarung heritage aesthetic)
- Accent: Gold/amber
- Dark mode first

### Admin Web CSS Classes (`index.css`)
```css
/* Layout */
.card          /* bg card dengan border + rounded */
.table-container /* overflow-x-auto wrapper */
.table         /* full width, styled table */
.page-header   /* h1 styling */

/* Inputs */
.input         /* styled text input */
.select        /* styled select */
.label         /* form label */
.form-group    /* form field wrapper */

/* Buttons */
.btn-primary   /* primary action */
.btn-secondary /* secondary action */
.btn-ghost     /* ghost/icon btn */
.btn-icon      /* icon-only button (square) */

/* Misc */
.badge         /* status pill */
.sidebar-link  /* sidebar navigation item */
.sidebar-link.active /* active state */
```

---

## 💾 Memory Files (`memory/`)

| File | Content |
|------|---------|
| `MEMORY.md` | Sync dari proyek antigravity (FastAPI backend) |
| `FEATURES.md` | Detail fitur yang sudah diimplementasi |
| `PATTERNS.md` | Best practices dan pattern coding |
| `IMPROVEMENTS_SUMMARY.md` | Summary perbaikan dari sesi sebelumnya |
| `ADMIN_WEB.md` | **Memory khusus Admin Web** (file ini) |
| `NOTIFICATION_SYSTEM.md` | Sistem notifikasi push |
| `RECOMMENDATIONS.md` | Rekomendasi improvement |

---

## 🚀 Quick Commands

```bash
# Mobile dev
npx expo start

# Admin web dev
cd admin-web && npm run dev

# Admin web build check
cd admin-web && npx tsc --noEmit
cd admin-web && npx vite build

# Install admin web deps
cd admin-web && npm install
```

---

## 👤 Admin Account
- Email: `syifaanjay@gmail.com`
- Role: `admin` (di tabel `profiles`)
- `profiles.user_id` = `profiles.id` = `0cac73c4-9a68-49c1-8867-a40471425a0d`
