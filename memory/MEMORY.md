# MEMORY - Sinkronisasi dari Proyek Antigravity

## Ringkasan Utama

Dokumen ini berisi ringkasan pengetahuan, rencana, dan pola dari proyek **antigravity/static-feynman** yang telah disinkronkan ke proyek **ALMA**.

**Tanggal Sinkronisasi Terakhir:** 2026-02-15
**Sumber:** `C:/Users/SyifaAnjay/.claude/projects/c--Users-SyifaAnjay--gemini-antigravity-playground-static-feynman/`

---

## Update Terbaru (2026-02-23)

### 1. Order Status ENUM Migration & Shipping Timeline (Web Store)
- **Database Migration:** `orders.status` column diubah dari TEXT ke ENUM type `order_status`
  - Status values: PENDING, PAID, PROCESSING, SHIPPED, COMPLETED, CANCELLED, RETURN_REQUESTED, RETURN_REJECTED, REFUNDED
  - Script: `scripts/ensure_orders_status_enum.sql` - menggunakan pendekatan add new column → copy data → swap columns
- **Timestamp Columns Added:** `paid_at`, `processed_at`, `cancelled_at`, `completed_at`, `return_requested_at`
  - Script: `scripts/add_order_timestamps.sql`
  - Trigger `handle_order_status_timestamps()` auto-set timestamps ketika status berubah
- **Shipping Timeline Component:** `web-store/components/ShippingTimeline.tsx`
  - Visual timeline showing order status progression
  - Relative time formatting dengan date-fns ("2 jam lalu", "kemarin")
  - Shows courier & tracking number
  - Different timeline flows per status (PENDING, PAID, PROCESSING, SHIPPED, COMPLETED, CANCELLED, RETURN_REQUESTED)

### 2. Order History Page (Web Store)
- **Tabbed Navigation:** 7 tabs - Semua, Belum Bayar, Sedang Dikemas, Dikirim, Selesai, Dibatalkan, Pengembalian Barang
- **Order List Page:** `web-store/app/orders/page.tsx` (server) + `page-client.tsx` (client)
- **Server Actions:** `web-store/app/api/orders/actions.ts`
  - `cancelOrder()` - Cancel pending orders
  - `markOrderAsCompleted()` - Mark shipped orders as completed
  - `requestReturn()` - Create return request
  - `getOrderActions()` - Get available actions for order
- **Order Types:** `web-store/types/orders.ts` dengan helper `getProductFromItem()`

### 3. Order Detail Page Updates (Web Store)
- **File:** `web-store/app/orders/[id]/page.tsx`
- **Updates:**
  - Replaced old hardcoded timeline dengan `ShippingTimeline` component
  - Fixed status comparisons menggunakan uppercase values (PENDING, PROCESSING, SHIPPED, etc.)
  - Status badge shows correct state
  - Payment warning box untuk PENDING orders
  - Complete order button untuk SHIPPED orders

### 4. Order Completion Flow & Unified Status System
- **Konsep:** Status `delivered` diganti sepenuhnya menjadi `completed` agar sesuai dengan flow user (Pesanan Diterima).
- **Supabase Edge Function:** `auto-complete-orders` Cron job yang berjalan harian untuk mengecek pesanan berstatus `shipped` selama lebih dari 3 hari. Jika lewat, di-update otomatis menjadi `completed`.
- **Database Notifications:** Sistem trigger notifikasi "Pesanan Selesai" sekarang dikirim ketika order berubah jadi `completed` (baik manual oleh user maupun otomatis via Edge Function).
- **Android App (Expo):**
  - Mengubah badge dan timeline `delivered` menjadi `completed`.
  - Menambahkan tombol prominent "Pesanan Selesai" di `order/[id].tsx` menggunakan konfirmasi Alertnative.
  - Review button baru muncul *setelah* status berubah ke `completed`.
- **Web Store (Next.js):**
  - Implementasi Server Actions `markOrderAsCompleted` dengan Revalidation path.
  - Tombol `<CompleteOrderButton />` dibuat interaktif dengan Shadcn UI `<Dialog />` untuk popup konfirmasi yang responsif, rapi, dan animated (menggantikan default confirm browser).
- **Admin Web (Vite):**
  - Admin Dashboard, Report, dan List Order beradaptasi dengan `completed`.
  - Tombol manual 'Set Delivered' bagi Admin ditiadakan untuk menjaga integritas flow agar action completion bergantung pada user/system timeout.

### 5. Dependencies Added
- **date-fns:** Installed via npm untuk tanggal formatting di Shipping Timeline

## Update Sebelumnya (2026-02-15)

### 1. Supabase Configuration Fixed
- **URL Baru:** `https://fhkzfwebhcyxhrnojwra.supabase.co`
- **Anon Key:** Updated dengan key yang valid
- **Status:** Koneksi berhasil, semua API endpoints berfungsi

### 2. Fitur yang Baru Diimplementasi

#### Order Review Screen
- **File:** `app/order/[id]/review.tsx`
- **Fitur:** Review produk setelah order selesai
- **Rating:** 1-5 bintang dengan input interaktif
- **Comment:** Text input untuk review
- **Submit:** Individual atau semua review sekaligus

#### Wishlist Database
- **SQL Script:** `scripts/create_wishlist_table.sql`
- **Tabel:** `wishlist_items` dengan RLS policies
- **Service:** `services/wishlistService.ts` sudah ada
- **Screen:** `app/wishlist/index.tsx` berfungsi

#### Search Screen Improvements
- **Dynamic Categories:** Categories dimuat dari Supabase
- **Filter Modal:** Updated dengan kategori dinamis
- **Popular Searches:** Sesuai dengan produk Sarung

---

## Topik yang Pernah Didiskusikan

---

## Topik yang Pernah Didiskusikan

### 1. Backend FastAPI untuk Aplikasi Percetakan/Merch

Proyek antigravity berfokus pada pembuatan backend FastAPI dengan PostgreSQL untuk aplikasi order percetakan/merch dengan fitur lengkap:

- **Sistem Autentikasi:** Email/password + Google Sign-In dengan JWT
- **Katalog Produk:** Produk dengan opsi dan tier harga
- **Sistem Pricing:** Harga dinamis berdasarkan quantity tiers + option modifiers
- **Manajemen Order:** Draft, pending, paid, processing, shipped
- **Integrasi Payment:** Midtrans payment gateway
- **Sistem Shipping:** Abstraksi provider dengan multiple opsi
- **Upload Design:** S3 presigned URLs untuk upload file
- **Sistem Revisi:** 1x revisi gratis, revisi selanjutnya berbayar
- **Admin Panel:** Manajemen order dan status

---

## Fitur/Task yang Sudah Dibuat

Berikut adalah daftar file dan komponen yang telah dibuat di proyek antigravity:

### Struktur Folder
```
static-feynman/
├── app/
│   ├── main.py                          # FastAPI app initialization
│   ├── config.py                        # Settings, environment variables
│   ├── dependencies.py                  # Auth dependencies, DB session
│   ├── database.py                      # Database engine, session factory
│   ├── models/                          # SQLAlchemy ORM models
│   ├── schemas/                         # Pydantic schemas
│   ├── routers/                         # API route handlers
│   ├── services/                        # Business logic layer
│   ├── repositories/                    # Data access layer
│   ├── api/v1/                          # API v1 prefix
│   ├── core/                            # Core utilities
│   └── utils/                           # Helper functions
├── tests/
├── alembic/
├── .env.example
├── .gitignore
├── alembic.ini
├── pyproject.toml
├── requirements.txt
├── README.md
└── docker-compose.yml
```

### File Konfigurasi
- `.env.example` - Template environment variables
- `.gitignore` - Git ignore rules
- `docker-compose.yml` - PostgreSQL configuration
- `alembic.ini` - Alembic configuration
- `requirements.txt` - Python dependencies
- `pyproject.toml` - Poetry configuration

### File Core Application
- `app/main.py` - FastAPI app initialization
- `app/config.py` - Settings, environment variables
- `app/dependencies.py` - Auth dependencies, DB session
- `app/database.py` - Database engine, session factory

### File Core Utilities
- `app/core/security.py` - JWT, password hashing
- `app/core/exceptions.py` - Custom exceptions
- `app/core/middleware.py` - Auth middleware
- `app/utils/constants.py` - Enums, magic numbers

### Database Models
- `app/models/base.py` - Base model class
- `app/models/user.py` - User model
- `app/models/product.py` - Product, QuantityTier
- `app/models/option.py` - OptionGroup, OptionValue, ProductOptionValue
- `app/models/order.py` - Order, OrderItem
- `app/models/design.py` - Design
- `app/models/revision.py` - Revision, RevisionStatus
- `app/models/payment.py` - Payment, PaymentStatus

### Pydantic Schemas
- `app/schemas/user.py`
- `app/schemas/product.py`
- `app/schemas/option.py`
- `app/schemas/order.py`
- `app/schemas/design.py`
- `app/schemas/revision.py`
- `app/schemas/payment.py`
- `app/schemas/pricing.py`

### Repositories
- `app/repositories/base.py` - Base repository with CRUD
- `app/repositories/user_repository.py`
- `app/repositories/product_repository.py`
- `app/repositories/option_repository.py`
- `app/repositories/order_repository.py`
- `app/repositories/design_repository.py`
- `app/repositories/revision_repository.py`
- `app/repositories/payment_repository.py`

### Services (Business Logic)
- `app/services/pricing_service.py` - Price calculations, tier logic
- `app/services/revision_service.py` - Revision count, addon logic
- `app/services/auth_service.py` - JWT, Google verification
- `app/services/order_service.py` - Order creation, status transitions
- `app/services/payment_service.py` - Midtrans integration
- `app/services/shipping_service.py` - Provider abstraction
- `app/services/design_service.py` - S3 presigned URLs
- `app/services/admin_service.py` - Order filtering, status updates

### Utility Helpers
- `app/utils/s3.py` - S3 client, presigned URLs
- `app/utils/midtrans.py` - Midtrans API client

### API Routers
- `app/routers/pricing.py` - POST /pricing/quote
- `app/routers/auth.py` - Login, register, Google sign-in
- `app/routers/catalog.py` - Products, options CRUD
- `app/routers/orders.py` - Order creation, management
- `app/routers/payment.py` - Midtrans, webhooks
- `app/routers/shipping.py` - Rates, create, tracking
- `app/routers/design.py` - Presigned URLs, submission
- `app/routers/revisions.py` - Revision logic, addon payments
- `app/routers/admin.py` - Order status management

### API Router Structure
- `app/api/v1/router.py` - Main API router

### Tests
- `tests/conftest.py` - pytest fixtures
- `tests/test_pricing_service.py` - Pricing quote tests
- `tests/test_revision_service.py` - Revision addon tests
- `tests/test_auth.py`
- `tests/test_orders.py`
- `tests/test_shipping.py`

### Documentation
- `README.md` - Setup and usage instructions

---

## Fitur yang Masih dalam Progress

Berdasarkan data antigravity, implementasi sedang berlangsung namun terdapat beberapa hal yang perlu diselesaikan:

1. **Service Stubs** - Beberapa service masih memerlukan implementasi lengkap
2. **Router Implementations** - Sebagian router masih stub
3. **Testing** - Unit tests perlu ditulis lengkap
4. **Alembic Migrations** - Konfigurasi migrations perlu disesuaikan

---

## Status Implementasi Frontend ALMA (Current)

Berikut adalah status implementasi Frontend ALMA (React Native + Expo) per tanggal sinkronisasi:

### 1. Product Detail Screen
- **Redesign UI**: Menggunakan layout 2 kolom untuk spesifikasi.
- **Typography**: Playfair Display untuk judul, Inter untuk body text.
- **Tabbed Interface**: Implementasi `ProductTabs` untuk memisahkan Deskripsi dan Review.
- **Components**:
  - `ProductImageCarousel`: Horizontal image slider.
  - `ProductInfo`: Menampilkan harga, rating, dan spesifikasi core.
  - `ProductDescription`: Deskripsi dengan fitur expand/collapse.
  - `ProductReviews`: List review user dengan mock data.
  - `ProductActions`: Sticky bottom bar untuk "Add to Cart" dan "Buy Now".

### 2. Home Screen
- **Hero Slider**: Banner promosi utama.
- **Flash Sales**: Banner countdown dan horizontal product list.
- **Categories**: Grid visual kategori produk.
- **Product Sections**: "Special for You", "Most Popular", "New Arrivals".

---

## Knowledge dan Pattern Penting

### 1. Pricing Model Logic

**Formula Pricing:**
```
base_unit_price = dari QuantityTier (berdasarkan quantity)
modifiers_sum = SUM(OptionValue.modifier_price) untuk selected options
unit_price_final = base_unit_price + modifiers_sum
item_total = unit_price_final * quantity
```

**Quantity Tier Selection:**
- Cari tier WHERE `min_qty <= quantity` AND (`max_qty IS NULL` OR `max_qty >= quantity`)
- Jika tidak ada tier yang cocok, raise error

### 2. Revision Logic

- `revision_free_remaining = 1` (default)
- Revisi ke-1: **gratis**
- Revisi ke-2 dst: **wajib bayar addon** EXTRA_REVISION via Midtrans
- Setelah bayar addon, baru bisa request revision

### 3. Environment Variables Required

```bash
# Application
APP_NAME=StaticFeynmanAPI
DEBUG=False
SECRET_KEY=change-this-in-production

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/static_feynman

# JWT
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AWS S3
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=static-feynman-designs

# Midtrans
MIDTRANS_PRODUCTION_MODE=False
MIDTRANS_SERVER_KEY=SB-mid-server-your-key
MIDTRANS_CLIENT_KEY=SB-mid-client-your-key

# CORS
CORS_ORIGINS=["http://localhost:3000"]

# Revision Settings
DEFAULT_FREE_REVISIONS=1
EXTRA_REVISION_PRODUCT_ID=999
```

### 4. Dependencies Utama

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
pydantic-settings==2.1.0
sqlalchemy==2.0.23
asyncpg==0.29.0
alembic==1.12.1
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
google-auth==2.23.3
httpx==0.25.2
boto3==1.29.0
python-dotenv==1.0.0
pytest==7.4.3
pytest-asyncio==0.21.1
pytest-cov==4.1.0
faker==20.0.0
```

### 5. API Endpoints Structure

**Authentication:**
- POST /api/v1/auth/register - Email/password registration
- POST /api/v1/auth/login - Email/password login (returns JWT)
- POST /api/v1/auth/google - Google token verification (returns JWT)
- GET /api/v1/auth/me - Get current user profile

**Catalog:**
- GET /api/v1/products - List products (paginated)
- GET /api/v1/products/{id} - Get product with options & tiers
- POST /api/v1/products - Create product (admin)
- PUT /api/v1/products/{id} - Update product (admin)

**Pricing:**
- POST /api/v1/pricing/quote - Calculate price breakdown

**Orders:**
- POST /api/v1/orders - Create order (draft)
- GET /api/v1/orders - List user's orders
- GET /api/v1/orders/{id} - Get order detail
- PUT /api/v1/orders/{id} - Update order (add/remove items, address)
- POST /api/v1/orders/{id}/submit - Submit for payment (DRAFT -> PENDING)

**Payment:**
- POST /api/v1/payment/create - Create Midtrans payment
- POST /webhooks/midtrans - Midtrans webhook handler (set order PAID)

**Shipping:**
- GET /api/v1/shipping/rates - Get shipping rates
- POST /api/v1/shipping/create - Create shipment
- GET /api/v1/shipping/tracking/{order_id} - Get tracking status

**Design:**
- POST /api/v1/design/presigned - Generate S3 presigned upload URL
- PUT /api/v1/orders/{order_id}/items/{item_id}/design - Attach design

**Revisions:**
- POST /api/v1/revisions - Request revision (cek free/paid)
- POST /api/v1/revisions/{id}/pay - Create addon payment (if required)
- PUT /api/v1/revisions/{id}/submit - Admin submits revised design

**Admin:**
- GET /api/v1/admin/orders - List all orders with filters
- GET /api/v1/admin/orders/{id} - Get order detail
- PATCH /api/v1/admin/orders/{id}/status - Update order status

---

## Rekomendasi untuk Proyek ALMA

Berdasarkan analisis proyek antigravity, berikut adalah rekomendasi untuk proyek ALMA:

### 1. Struktur Proyek

Proyek ALMA adalah aplikasi React Native dengan Expo yang memerlukan backend. Struktur dari antigravity dapat diadopsi untuk backend ALMA.

### 2. Komponen yang Dapat Diadopsi

**Dari Antigravity ke ALMA:**

| Komponen | Antigravity | ALMA | Status |
|-----------|--------------|-------|--------|
| Backend API | FastAPI + PostgreSQL | Perlu dibuat | Pending |
| Auth System | JWT + Google | Perlu dibuat | Pending |
| Product Catalog | Products with options | Cart, Categories | Ada frontend |
| Pricing | Dynamic tiers + modifiers | Perlu backend logic | Pending |
| Order System | Draft -> Paid -> Shipped | Cart -> Checkout | Partial |
| Payment | Midtrans | Perlu integrasi | Pending |
| Shipping | Multi-provider | Perlu backend | Pending |
| Design Upload | S3 presigned URLs | Perlu backend | Pending |

### 3. Next Steps yang Disarankan

1. **Backend Setup**
   - Buat backend FastAPI terpisah untuk ALMA
   - Implementasi endpoint untuk Cart, Checkout, Orders
   - Integrasi Midtrans untuk payment

2. **Sync Frontend dengan Backend**
   - Update frontend ALMA untuk consume API backend
   - Implementasi state management untuk cart, orders
   - Handle auth flow dengan JWT

3. **Prioritas Implementasi**
   - Auth API (register, login, Google)
   - Product/Catalog API
   - Cart API (localStorage sync)
   - Checkout & Order API
   - Payment integration (Midtrans)
   - Shipping rates API

### 4. File dari Antigravity yang Dapat Dipakai

File-file berikut dapat dijadikan referensi atau dimodifikasi untuk ALMA:

- `app/services/pricing_service.py` - Untuk logika harga
- `app/services/order_service.py` - Untuk logika order
- `app/services/payment_service.py` - Untuk integrasi Midtrans
- `app/models/order.py` - Untuk struktur data order
- `app/schemas/pricing.py` - Untuk request/response pricing

---

## Catatan Penting

1. **Percakapan dihentikan oleh user** - Sesi antigravity berakhir dengan "[Request interrupted by user]"
2. **Project masih dalam pengembangan** - Tidak semua fitur telah selesai diimplementasi
3. **Focus pada backend FastAPI** - Frontend React Native tidak dibahas di antigravity
4. **Midtrans integration** - Payment gateway yang direkomendasikan untuk aplikasi Indonesia

---

## File Terkait

- `D:\ALMA\memory\antigravity_extracted.json` - Data lengkap dalam format JSON
- `D:\ALMA\memory\FEATURES.md` - Detail fitur dan implementasi
- `D:\ALMA\memory\PATTERNS.md` - Pattern dan best practices
