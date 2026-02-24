# ADMIN_WEB.md — AlmaStore Admin Dashboard Memory

> Memory file khusus untuk `admin-web/` — Vite + React + TypeScript Admin Dashboard.
> Last updated: 2026-02-21

---

## Status: ✅ Fully Functional

Semua halaman utama sudah berfungsi. Dev server: `localhost:5174`

---

## Struktur File

```
admin-web/
├── src/
│   ├── App.tsx                    # Router setup (React Router v6, lazy loading)
│   ├── main.tsx                   # Entry point dengan try/catch error display
│   ├── index.css                  # Tailwind v4 + custom CSS classes
│   ├── components/
│   │   ├── ProtectedRoute.tsx     # Auth guard (try/finally + 8s timeout)
│   │   ├── DashboardLayout.tsx    # Shell: sidebar + header + outlet
│   │   └── Sidebar.tsx            # Navigation sidebar
│   ├── pages/
│   │   ├── LoginPage.tsx          # Login + admin role check
│   │   ├── DashboardPage.tsx      # Stats, charts (Recharts)
│   │   ├── ProductListPage.tsx    # CRUD product table
│   │   ├── ProductFormPage.tsx    # Create + Edit product form
│   │   ├── CategoryListPage.tsx
│   │   ├── OrderListPage.tsx
│   │   ├── OrderDetailPage.tsx
│   │   ├── VoucherListPage.tsx
│   │   ├── VoucherFormPage.tsx
│   │   ├── UserListPage.tsx
│   │   ├── UserDetailPage.tsx     # Profile + wallet + orders + role toggle
│   │   ├── ReviewListPage.tsx
│   │   ├── ReturnListPage.tsx
│   │   └── SendNotificationPage.tsx
│   ├── services/
│   │   ├── productService.ts
│   │   ├── categoryService.ts
│   │   ├── orderService.ts
│   │   ├── userService.ts
│   │   ├── voucherService.ts
│   │   ├── reviewService.ts
│   │   ├── returnService.ts
│   │   └── notificationService.ts
│   ├── store/
│   │   └── useAdminStore.ts       # Zustand: user, isAuthLoading, sidebarOpen
│   ├── lib/
│   │   ├── supabase.ts            # Supabase client (VITE_ env vars)
│   │   └── utils.ts               # cn(), formatCurrency(), formatDate(), formatDateShort()
│   └── types/
│       └── index.ts               # TypeScript types
├── .env.local                     # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
├── vite.config.ts                 # @tailwindcss/vite plugin
├── tailwind.config.js             # (tidak dipakai di v4)
└── package.json
```

---

## Dependency Versions

```json
{
  "react": "^19",
  "react-router-dom": "^6",
  "zustand": "^5",
  "@supabase/supabase-js": "^2",
  "react-hook-form": "^7",
  "zod": "^4.3.6",
  "@hookform/resolvers": "^5.2.2",
  "recharts": "^2",
  "lucide-react": "^0.x",
  "react-hot-toast": "^2",
  "clsx": "^2",
  "tailwind-merge": "^3",
  "tailwindcss": "^4"
}
```

---

## Auth Architecture

```
LoginPage
  → supabase.signInWithPassword()
  → query profiles.maybeSingle() untuk role check
  → setUser(admin) di Zustand       ← WAJIB sebelum navigate!
  → navigate('/dashboard')

ProtectedRoute (mounted sekali per layout)
  → if (user !== null) skip re-verify  ← Hindari flash spinner
  → else: getSession() + resolveAdminUser()
  → try/finally: ALWAYS setAuthLoading(false)
  → 8s timeout fallback → setUser(null) + redirect login
```

---

## Types (`src/types/index.ts`)

```typescript
interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: 'admin';
}

interface UserProfile {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  phone_number: string | null;
  username: string | null;
  role: 'admin' | 'customer';
  created_at: string;
  email?: string;
  wallet_balance?: number;
  reward_points?: number;
  order_count?: number;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  stock: number;
  category_id: string;
  material?: string;
  images: string[];
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  category?: Category;
}

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: OrderStatus;     // 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  shipping_address: string;
  payment_proof_url: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  profile?: { full_name: string; avatar_url: string | null; phone_number: string | null } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url?: string;
}
```

---

## Known Bugs (All Fixed)

### ✅ Bug 1: ProtectedRoute Infinite "Verifying access..."
**Cause:** `setAuthLoading(false)` tidak pernah dipanggil saat `getSession()` / profile query gagal.  
**Fix:** Semua async auth dalam `try/finally`, plus 8-second safety timeout.

### ✅ Bug 2: LoginPage tidak set store
**Cause:** `navigate('/dashboard')` dipanggil tanpa set Zustand store, menyebabkan ProtectedRoute re-verify setiap navigasi.  
**Fix:** `setUser(admin)` + `setAuthLoading(false)` SEBELUM `navigate()`.

### ✅ Bug 3: ProductFormPage blank screen
**Cause:** `CreateProductInput` (type-only export) diimport sebagai value, menyebabkan Vite lazy chunk gagal load.  
**Fix:**
```typescript
// SEBELUM (salah):
import { createProduct, CreateProductInput, ... } from '../services/productService';
// SESUDAH (benar):
import { createProduct, ... } from '../services/productService';
import type { CreateProductInput } from '../services/productService';
```

### ✅ Bug 4: Zod v4 `z.coerce.number()` type error
**Cause:** Zod v4 `z.coerce.number()` mengembalikan type `unknown`, breaking zodResolver inference.  
**Fix:** Gunakan `z.preprocess()` + define FormData type secara manual.

---

## ProductFormPage Pattern (Zod v4)

```typescript
// Zod v4 preprocess pattern untuk number input dari HTML
const toNum = (val: unknown) =>
  (val === '' || val === null || val === undefined ? undefined : Number(val));

const schema = z.object({
  price: z.preprocess(toNum, z.number().min(1, 'Price required')),
  original_price: z.preprocess(toNum, z.number().optional()),
  stock: z.preprocess(toNum, z.number().min(0)),
  // ...
});

// Type manual karena z.preprocess output = unknown
type FormData = {
  price: number;
  original_price?: number;
  stock: number;
  // ...
};

// Cast resolver untuk compatibility
const { register, handleSubmit } = useForm<FormData>({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolver: zodResolver(schema) as any,
});
```

---

## Checklist Features

### ✅ Implemented & Working
- [x] Login page dengan admin role check
- [x] Dashboard dengan stats cards + Recharts line chart
- [x] Product list: search, filter category, sort, pagination (20/page)
- [x] Product form: create + edit + image upload ke Supabase Storage
- [x] Product toggle active/inactive per row
- [x] Category list: view categories
- [x] Order list: filter status, search by customer
- [x] Order detail: ubah status order
- [x] User list: search, filter role, pagination
- [x] User detail: profile + wallet + reward points + total orders + order history + role toggle
- [x] Voucher list + form (create/edit)
- [x] Review list: table semua review
- [x] Return list: handling return requests
- [x] Send notification page
- [x] Sidebar collapsible
- [x] React Hot Toast untuk feedback

### 🔲 Future Improvements
- [ ] Loading skeletons (shimmer effect)
- [ ] Responsive mobile sidebar
- [ ] Dashboard charts data from real Supabase queries
- [ ] Category form (create/edit categories)
- [ ] Bulk actions (delete multiple, export CSV)
- [ ] Hero slider management page
- [ ] Analytics/reports page

---

## CSS Utility Classes (index.css)

```css
/* Cards */
.card            → rounded-xl bg, border, p-6
.stat-card       → card variant for dashboard stats

/* Tables */  
.table-container → overflow wrapper
.table           → full-width styled table

/* Forms */
.input           → styled input/textarea
.select          → styled select
.label           → form label
.form-group      → flex-col gap-1.5 wrapper

/* Buttons */
.btn-primary     → solid primary button
.btn-secondary   → outline/ghost button
.btn-ghost       → no bg, hover only
.btn-icon        → square icon button (p-1.5)

/* Text */
.page-header     → h1 with font-bold text-2xl
.text-muted-foreground → subdued text

/* Badges */
.badge           → inline pill (border + rounded-full)
```
