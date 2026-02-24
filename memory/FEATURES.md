# FEATURES - Detail Fitur dari Antigravity

## Ringkasan

Dokumen ini berisi detail fitur yang dirancang dan diimplementasikan dalam proyek **antigravity/static-feynman** - backend FastAPI untuk aplikasi percetakan/merch.

---

## 1. Authentication System

### Fitur
- **Email/Password Registration** - Registrasi dengan email dan password
- **Email/Password Login** - Login dengan email dan password
- **Google Sign-In** - OAuth dengan Google token verification
- **JWT Token** - JSON Web Token untuk authentication
- **Refresh Token** - Refresh token yang expired

### API Endpoints
```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/google
POST /api/v1/auth/refresh
GET  /api/v1/auth/me
```

### Models
```python
class User(Base):
    id: int (PK)
    email: str (unique, indexed)
    hashed_password: str (nullable)
    full_name: str (nullable)
    google_id: str (unique, nullable, indexed)
    is_active: bool = True
    is_admin: bool = False
    created_at: datetime
    updated_at: datetime
```

---

## 2. Catalog System

### Fitur
- **Product Management** - CRUD produk dengan pagination
- **Option Groups** - Grup opsi dengan is_required dan max_select
- **Option Values** - Nilai opsi dengan modifier price
- **Product Options Linking** - Hubungan produk dengan opsi

### API Endpoints
```
GET    /api/v1/products
GET    /api/v1/products/{id}
POST   /api/v1/products
PUT    /api/v1/products/{id}
DELETE /api/v1/products/{id}
GET    /api/v1/option-groups
POST   /api/v1/option-groups
PUT    /api/v1/option-groups/{id}
GET    /api/v1/products/{id}/options
POST   /api/v1/products/{id}/options
```

### Models
```python
class Product(Base):
    id: int (PK)
    name: str
    description: Text (nullable)
    base_price: Decimal(10, 2)
    is_active: bool = True

class QuantityTier(Base):
    id: int (PK)
    product_id: int (FK)
    min_qty: int
    max_qty: int (nullable)
    unit_price: Decimal(10, 2)

class OptionGroup(Base):
    id: int (PK)
    name: str
    description: str (nullable)
    is_required: bool = False
    max_select: int = 1

class OptionValue(Base):
    id: int (PK)
    option_group_id: int (FK)
    name: str
    modifier_price: Decimal(10, 2)
    is_active: bool = True
    sort_order: int = 0

class ProductOptionValue(Base):
    id: int (PK)
    product_id: int (FK)
    option_value_id: int (FK)
```

---

## 3. Pricing System

### Fitur
- **Quantity Tiers** - Harga berbeda berdasarkan jumlah
- **Option Modifiers** - Modifier harga FIXED per opsi
- **Dynamic Calculation** - Kalkulasi harga real-time
- **Price Breakdown** - Detail rincian harga

### Formula
```
base_unit_price = dari QuantityTier (min_qty <= qty AND (max_qty IS NULL OR max_qty >= qty))
modifiers_sum = SUM(OptionValue.modifier_price) untuk selected options
unit_price_final = base_unit_price + modifiers_sum
item_total = unit_price_final * quantity
```

### API Endpoints
```
POST /api/v1/pricing/quote
```

### Request/Response
```json
// Request
{
  "items": [
    {
      "product_id": 1,
      "quantity": 100,
      "selected_option_values": [1, 2, 3]
    }
  ]
}

// Response
{
  "items": [
    {
      "product_id": 1,
      "product_name": "Kartu Nama",
      "quantity": 100,
      "unit_price_base": 2500,
      "unit_price_modifiers": 500,
      "unit_price_final": 3000,
      "item_total": 300000,
      "applied_tier": {
        "min_qty": 50,
        "max_qty": 199,
        "unit_price": 2500
      }
    }
  ],
  "subtotal": 300000
}
```

---

## 4. Order System

### Fitur
- **Draft Orders** - Order dalam status draft
- **Order Submission** - Submit untuk payment
- **Order Snapshots** - Snapshot data produk dan opsi
- **Status Transitions** - DRAFT -> PENDING -> PAID -> PROCESSING -> SHIPPED -> COMPLETED

### Status Flow
```
DRAFT -> PENDING -> PAID -> PROCESSING -> SHIPPED -> COMPLETED
                     |
                     v
                  CANCELLED
```

### API Endpoints
```
POST   /api/v1/orders
GET    /api/v1/orders
GET    /api/v1/orders/{id}
PUT    /api/v1/orders/{id}
POST   /api/v1/orders/{id}/submit
DELETE /api/v1/orders/{id}
```

### Models
```python
class Order(Base):
    id: int (PK)
    user_id: int (FK, indexed)
    status: Enum[OrderStatus]
    subtotal: Decimal(12, 2)
    shipping_cost: Decimal(10, 2) = 0
    tax: Decimal(10, 2) = 0
    discount: Decimal(10, 2) = 0
    total: Decimal(12, 2)
    currency: str = "IDR"
    shipping_address_snapshot: JSON
    shipping_provider: str (nullable)
    tracking_number: str (nullable, indexed)
    payment_token: str (nullable, indexed)
    paid_at: datetime (nullable)

class OrderItem(Base):
    id: int (PK)
    order_id: int (FK)
    product_id: int (FK)
    quantity: int
    unit_price_base: Decimal(10, 2)
    unit_price_modifiers: Decimal(10, 2)
    unit_price_final: Decimal(10, 2)
    item_total: Decimal(12, 2)
    product_name: str (snapshot)
    selected_options: JSON (snapshot)
```

---

## 5. Payment System

### Fitur
- **Midtrans Integration** - Payment gateway Indonesia
- **Payment Token** - Token untuk tracking payment
- **Webhook Handler** - Handle notification dari Midtrans
- **Payment Status** - PENDING, COMPLETED, FAILED, EXPIRED

### API Endpoints
```
POST /api/v1/payment/create
POST /webhooks/midtrans
```

### Request/Response
```json
// Create Payment Request
{
  "order_id": 123
}

// Create Payment Response
{
  "redirect_url": "https://app.midtrans.com/snap/v3/vtdirect...",
  "token": "..."
}

// Webhook Notification
{
  "transaction_status": "settlement",
  "order_id": "ORD-123",
  "gross_amount": 300000,
  "payment_type": "qris",
  "transaction_time": "2024-01-24 15:30:00",
  "signature_key": "..."
}
```

### Models
```python
class Payment(Base):
    id: int (PK)
    order_id: int (FK, unique, indexed)
    amount: Decimal(12, 2)
    payment_type: str  # "order", "revision_addon"
    provider: str = "midtrans"
    provider_token: str (unique, indexed)
    provider_redirect_url: str (nullable)
    status: Enum[PaymentStatus]
    paid_at: datetime (nullable)
```

---

## 6. Shipping System

### Fitur
- **Multi-Provider** - Abstraksi untuk multiple shipping provider
- **Shipping Rates** - Get rates dari multiple provider
- **Shipment Creation** - Create shipment setelah payment
- **Tracking** - Track status pengiriman

### Providers
- **JNE** - JNE Express
- **Sicepat** - Sicepat Express
- **Mock** - Untuk development/testing

### API Endpoints
```
GET  /api/v1/shipping/rates
POST /api/v1/shipping/create
GET  /api/v1/shipping/tracking/{order_id}
```

### Request/Response
```json
// Get Rates Request
?order_id=123&destination_address=...

// Get Rates Response
{
  "rates": [
    {
      "provider": "jne",
      "service": "YES",
      "cost": 12000,
      "etd": "2-3 days"
    },
    {
      "provider": "sicepat",
      "service": "REG",
      "cost": 14000,
      "etd": "1-2 days"
    }
  ]
}
```

---

## 7. Design Upload System

### Fitur
- **S3 Presigned URLs** - URL untuk upload langsung ke S3
- **Design Attachment** - Attach design ke order item
- **File Metadata** - Nama, size, content type

### API Endpoints
```
POST /api/v1/design/presigned
PUT  /api/v1/orders/{order_id}/items/{item_id}/design
```

### Request/Response
```json
// Presigned URL Request
{
  "file_name": "design.png",
  "content_type": "image/png"
}

// Presigned URL Response
{
  "upload_url": "https://s3.amazonaws.com/...",
  "file_key": "designs/user_123/1234567890_design.png",
  "expires_in": 3600
}

// Attach Design Request
{
  "file_key": "designs/user_123/1234567890_design.png",
  "file_name": "design.png",
  "file_size": 123456
}
```

### Models
```python
class Design(Base):
    id: int (PK)
    order_item_id: int (FK, unique)
    file_url: str
    file_key: str
    file_name: str
    file_size: int
    content_type: str
    uploaded_at: datetime
```

---

## 8. Revision System

### Fitur
- **Free Revisions** - 1x revisi gratis per order item
- **Paid Revisions** - Revisi selanjutnya berbayar
- **Revision Status** - PENDING, SUBMITTED, APPROVED, REJECTED
- **Addon Payment** - Payment untuk revisi berbayar

### Formula
```
revision_free_remaining = 1 (default)

Revisi ke-1: is_free = True, addon_payment_required = False
Revisi ke-2+: is_free = False, addon_payment_required = True
```

### API Endpoints
```
POST /api/v1/revisions
POST /api/v1/revisions/{id}/pay
PUT  /api/v1/revisions/{id}/submit
PUT  /api/v1/revisions/{id}/approve
PUT  /api/v1/revisions/{id}/reject
```

### Request/Response
```json
// Request Revision
{
  "order_item_id": 456,
  "notes": "Tolong ganti warna",
  "file_url": "https://s3.amazonaws.com/..."
}

// Response
{
  "revision_id": 789,
  "is_free": true,
  "addon_payment_required": false
}

// Jika addon required
{
  "revision_id": 790,
  "is_free": false,
  "addon_payment_required": true,
  "addon_payment_url": "https://app.midtrans.com/..."
}
```

### Models
```python
class Revision(Base):
    id: int (PK)
    order_item_id: int (FK, indexed)
    revision_number: int
    original_file_url: str
    revised_file_url: str (nullable)
    is_free: bool
    addon_payment_required: bool = False
    addon_payment_token: str (nullable)
    addon_paid: bool = False
    status: Enum[RevisionStatus]
    request_notes: Text (nullable)
    response_notes: Text (nullable)
```

---

## 9. Frontend Features (ALMA Application)

### Product Detail Page
- **Tabbed View**: User dapat berpindah antara "Description" dan "Reviews" tanpa reload halaman.
- **Expandable Description**: Deskripsi panjang dipotong dan dapat di-expand dengan tombol "Read More".
- **Visual Specifications**: Grid spesifikasi produk (Material, Stock, Weight, Condition) dengan ikon visual.
- **Sticky Actions**: Tombol aksi beli/keranjang yang selalu terlihat di bagian bawah layar.

### Home Screen
- **Dynamic Greeting**: Header menampilkan salam berdasarkan waktu (Pagi/Siang/Malam) dan nama user.
- **Flash Sale Timer**: Countdown visual untuk event flash sale.
- **search Bar**: Input pencarian yang persisten di header.

---

## 10. Admin Panel

### Fitur
- **Order List** - List semua order dengan filters
- **Order Detail** - Detail order lengkap
- **Status Update** - Update status order
- **Revision Management** - Manage revision requests

### API Endpoints
```
GET    /api/v1/admin/orders
GET    /api/v1/admin/orders/{id}
PATCH  /api/v1/admin/orders/{id}/status
GET    /api/v1/admin/revisions
PUT    /api/v1/admin/revisions/{id}/submit
PUT    /api/v1/admin/revisions/{id}/approve
PUT    /api/v1/admin/revisions/{id}/reject
```

---

## Mapping ke ALMA

### Fitur yang Relevan untuk ALMA

| Fitur Antigravity | Relevansi ke ALMA | Implementasi |
|-------------------|-------------------|-------------|
| Auth (JWT + Google) | High | Perlu backend |
| Product Catalog | Medium | Ada kategori |
| Pricing System | Low | Cart ada |
| Order System | High | Cart ada |
| Payment (Midtrans) | High | Checkout ada |
| Shipping Rates | Medium | Perlu backend |
| Design Upload | Low | N/A |
| Revision System | Low | N/A |
| Admin Panel | Medium | Profile ada |

### Prioritas Implementasi untuk ALMA

1. **Auth System** - Register, login, Google sign-in
2. **Cart API** - Sync cart frontend dengan backend
3. **Product API** - List products dengan kategori
4. **Checkout API** - Create order dari cart
5. **Payment API** - Midtrans integration
6. **Order API** - List user orders, order detail
7. **Profile API** - User profile management

---

## Environment Variables untuk ALMA

```bash
# Application
APP_NAME=ALMA
DEBUG=True
SECRET_KEY=your-secret-key

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/alma

# JWT
JWT_SECRET_KEY=your-jwt-secret
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Midtrans
MIDTRANS_PRODUCTION_MODE=False
MIDTRANS_SERVER_KEY=SB-mid-server-key
MIDTRANS_CLIENT_KEY=SB-mid-client-key

# CORS
CORS_ORIGINS=["http://localhost:8081", "exp://192.168.1.1:8081"]

# Shipping (optional)
RAJAONGKIR_API_KEY=your-rajaongkir-key
```

---

## Catatan

1. **Backend Terpisah** - Backend antigravity terpisah dari frontend ALMA (React Native)
2. **Midtrans** - Payment gateway yang direkomendasikan untuk Indonesia
3. **PostgreSQL** - Database yang direkomendasikan
4. **JWT** - Authentication method yang digunakan
5. **S3** - Untuk file upload (AWS S3 atau compatible)
