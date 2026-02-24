# RECOMMENDATIONS - Rekomendasi Implementasi untuk ALMA

## Ringkasan

Dokumen ini berisi rekomendasi cara mengimplementasikan fitur dan pattern dari proyek antigravity ke proyek ALMA.

---

## 1. Analisa Status Proyek ALMA

### Current State

Berdasarkan struktur file yang terlihat:

**Frontend (React Native + Expo):**
- `app/(tabs)/index.tsx` - Home screen
- `app/(tabs)/cart.tsx` - Cart screen
- `app/(tabs)/categories.tsx` - Categories screen
- `app/(tabs)/profile.tsx` - Profile screen
- `app/(auth)/` - Authentication screens
- `app/checkout.tsx` - Checkout screen
- `app/order/` - Order screens
- `app/product/` - Product detail screens
- `app/wishlist/` - Wishlist screens
- `app/address/` - Address management screens

**Komponen:**
- `components/cart/` - Cart components
- `components/checkout/` - Checkout components
- `components/product/` - Product components

**Services:**
- `services/` - API services (perlu dibuat)

**Store:**
- `store/` - State management (perlu dicek)

**Supabase:**
- `supabase/` - Supabase configuration (ada config)

**Backend yang Perlu Dibuat:**
- Authentication API (JWT + Google)
- Product/Catalog API
- Cart API
- Checkout/Order API
- Payment API (Midtrans)
- Shipping API
- Profile/User API

---

## 2. Rekomendasi Arsitektur

### Opsi A: Backend Terpisah (Recommended)

**Backend:** FastAPI + PostgreSQL (seperti antigravity)
**Frontend:** React Native + Expo (ALMA)

**Keuntungan:**
- Separation of concerns
- Backend dapat digunakan untuk web dashboard
- Scalability yang baik
- Testing yang lebih mudah

**Struktur:**
```
alma/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── routers/
│   ├── tests/
│   └── requirements.txt
└── frontend/             # React Native (ALMA)
    ├── app/
    ├── components/
    ├── services/
    └── ...
```

### Opsi B: Supabase (Sudah Ada Config)

Jika ALMA sudah menggunakan Supabase:

**Keuntungan:**
- Tidak perlu setup backend terpisah
- Real-time subscriptions
- Built-in auth
- File storage

**Kekurangan:**
- Lebih sulit untuk custom logic
- Dependency pada third-party
- Pricing logic lebih sulit diimplementasi

**Rekomendasi:** Gunakan Supabase untuk:
- Authentication (Google sign-in)
- File storage (design uploads)
- Real-time updates (order status)

Tetapi buat backend terpisah untuk:
- Complex pricing logic
- Payment integration (Midtrans)
- Order management
- Business rules

---

## 3. Rekomendasi Implementasi Backend

### Phase 1: Basic Setup (1-2 hari)

1. **Setup FastAPI Project**
```bash
mkdir alma-backend
cd alma-backend
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn sqlalchemy asyncpg alembic
pip install pydantic pydantic-settings
pip install python-jose passlib[bcrypt]
pip install python-multipart python-dotenv

# Create structure
mkdir -p app/{models,schemas,services,repositories,routers,core}
```

2. **Database Setup**
```bash
# Start PostgreSQL
docker run -d --name alma-postgres \
  -e POSTGRES_USER=alma \
  -e POSTGRES_PASSWORD=alma \
  -e POSTGRES_DB=alma \
  -p 5432:5432 \
  postgres:15

# Or use docker-compose
cat > docker-compose.yml << EOF
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: alma
      POSTGRES_PASSWORD: alma
      POSTGRES_DB: alma
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
volumes:
  postgres_data:
EOF

docker-compose up -d
```

3. **Environment Variables**
```bash
cat > .env << EOF
# Application
APP_NAME=ALMA
DEBUG=True
SECRET_KEY=your-secret-key-change-in-production

# Database
DATABASE_URL=postgresql+asyncpg://alma:alma@localhost:5432/alma

# JWT
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60
JWT_ALGORITHM=HS256

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Midtrans
MIDTRANS_PRODUCTION_MODE=False
MIDTRANS_SERVER_KEY=SB-mid-server-your-key
MIDTRANS_CLIENT_KEY=SB-mid-client-your-key

# CORS
CORS_ORIGINS=["http://localhost:8081","exp://192.168.1.1:8081"]

# Supabase (optional)
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-anon-key
EOF
```

### Phase 2: Core Models (2-3 hari)

1. **User Model**
```python
# app/models/user.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.models.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String)
    hashed_password = Column(String, nullable=True)
    google_id = Column(String, unique=True, index=True, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

2. **Product Model**
```python
# app/models/product.py
from sqlalchemy import Column, Integer, String, Text, Numeric, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    price = Column(Numeric(10, 2), nullable=False)
    compare_price = Column(Numeric(10, 2))
    cost_price = Column(Numeric(10, 2))
    sku = Column(String, unique=True)
    barcode = Column(String)
    is_active = Column(Boolean, default=True)
    stock = Column(Integer, default=0)
    category_id = Column(Integer, ForeignKey("categories.id"))
    images = Column(JSON)  # List of image URLs
```

3. **Category Model**
```python
# app/models/category.py
from sqlalchemy import Column, Integer, String, Text, Boolean
from app.models.base import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    slug = Column(String, unique=True)
    parent_id = Column(Integer, ForeignKey("categories.id"))
    is_active = Column(Boolean, default=True)
    image_url = Column(String)
    sort_order = Column(Integer, default=0)
```

4. **Cart Model**
```python
# app/models/cart.py
from sqlalchemy import Column, Integer, String, ForeignKey, JSON
from app.models.base import Base

class Cart(Base):
    __tablename__ = "carts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    session_id = Column(String, index=True)
    items = Column(JSON)  # [{"product_id": 1, "quantity": 2}, ...]
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
```

5. **Order Model**
```python
# app/models/order.py
from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Enum, Text, JSON
from app.models.base import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    status = Column(Enum(OrderStatus), default=OrderStatus.DRAFT)
    subtotal = Column(Numeric(12, 2))
    shipping_cost = Column(Numeric(10, 2), default=0)
    tax = Column(Numeric(10, 2), default=0)
    discount = Column(Numeric(10, 2), default=0)
    total = Column(Numeric(12, 2))
    currency = Column(String, default="IDR")

    # Shipping
    shipping_address = Column(JSON)
    shipping_provider = Column(String)
    tracking_number = Column(String)

    # Payment
    payment_token = Column(String, index=True)
    payment_method = Column(String)
    paid_at = Column(DateTime(timezone=True))

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"))
    product_name = Column(String)  # Snapshot
    product_price = Column(Numeric(10, 2))  # Snapshot
    quantity = Column(Integer)
    total = Column(Numeric(12, 2))
```

### Phase 3: API Endpoints (3-4 hari)

1. **Auth Router**
```python
# app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    """Register new user"""
    # Implementation
    pass

@router.post("/login", response_model=UserResponse)
async def login(credentials: UserLogin):
    """Login with email/password"""
    # Implementation
    pass

@router.post("/google", response_model=UserResponse)
async def google_login(token: str):
    """Login with Google"""
    # Implementation
    pass
```

2. **Products Router**
```python
# app/routers/products.py
from fastapi import APIRouter, Depends
from app.schemas.product import ProductListResponse, ProductResponse
from app.services.product_service import ProductService

router = APIRouter(prefix="/products", tags=["products"])

@router.get("", response_model=ProductListResponse)
async def list_products(
    skip: int = 0,
    limit: int = 20,
    category: int = None
):
    """List products"""
    # Implementation
    pass

@router.get("/{id}", response_model=ProductResponse)
async def get_product(id: int):
    """Get product detail"""
    # Implementation
    pass
```

3. **Cart Router**
```python
# app/routers/cart.py
from fastapi import APIRouter, Depends
from app.schemas.cart import CartResponse, CartUpdate
from app.services.cart_service import CartService

router = APIRouter(prefix="/cart", tags=["cart"])

@router.get("", response_model=CartResponse)
async def get_cart(user_id = Depends(get_current_user)):
    """Get user cart"""
    # Implementation
    pass

@router.post("", response_model=CartResponse)
async def add_to_cart(
    item: CartUpdate,
    user_id = Depends(get_current_user)
):
    """Add item to cart"""
    # Implementation
    pass

@router.delete("/{item_id}")
async def remove_from_cart(
    item_id: int,
    user_id = Depends(get_current_user)
):
    """Remove item from cart"""
    # Implementation
    pass
```

4. **Orders Router**
```python
# app/routers/orders.py
from fastapi import APIRouter, Depends
from app.schemas.order import OrderResponse, OrderCreate
from app.services.order_service import OrderService

router = APIRouter(prefix="/orders", tags=["orders"])

@router.post("", response_model=OrderResponse)
async def create_order(
    order_data: OrderCreate,
    user_id = Depends(get_current_user)
):
    """Create order from cart"""
    # Implementation
    pass

@router.get("", response_model=list[OrderResponse])
async def list_orders(user_id = Depends(get_current_user)):
    """List user orders"""
    # Implementation
    pass

@router.get("/{id}", response_model=OrderResponse)
async def get_order(
    id: int,
    user_id = Depends(get_current_user)
):
    """Get order detail"""
    # Implementation
    pass
```

5. **Payment Router**
```python
# app/routers/payment.py
from fastapi import APIRouter, Depends
from app.schemas.payment import PaymentRequest, PaymentResponse
from app.services.payment_service import PaymentService

router = APIRouter(prefix="/payment", tags=["payment"])

@router.post("/create", response_model=PaymentResponse)
async def create_payment(
    payment_data: PaymentRequest,
    user_id = Depends(get_current_user)
):
    """Create Midtrans payment"""
    # Implementation
    pass

@router.post("/webhook/midtrans")
async def midtrans_webhook(notification: dict):
    """Handle Midtrans webhook"""
    # Implementation
    pass
```

### Phase 4: Frontend Integration (2-3 hari)

1. **API Service**
```typescript
// services/api.ts
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

2. **Auth Service**
```typescript
// services/authService.ts
import api from './api';

export interface LoginData {
  email: string;
  password: string;
}

export interface GoogleLoginData {
  token: string;
}

export const authService = {
  async login(data: LoginData) {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  async googleLogin(data: GoogleLoginData) {
    const response = await api.post('/auth/google', data);
    return response.data;
  },

  async register(data: any) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/auth/me');
    return response.data;
  },
};
```

3. **Product Service**
```typescript
// services/productService.ts
import api from './api';

export const productService = {
  async list(params?: any) {
    const response = await api.get('/products', { params });
    return response.data;
  },

  async getDetail(id: number) {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
};
```

4. **Cart Service**
```typescript
// services/cartService.ts
import api from './api';

export const cartService = {
  async get() {
    const response = await api.get('/cart');
    return response.data;
  },

  async add(productId: number, quantity: number) {
    const response = await api.post('/cart', {
      product_id: productId,
      quantity,
    });
    return response.data;
  },

  async remove(itemId: number) {
    const response = await api.delete(`/cart/${itemId}`);
    return response.data;
  },

  async update(itemId: number, quantity: number) {
    const response = await api.put(`/cart/${itemId}`, {
      quantity,
    });
    return response.data;
  },
};
```

### Phase 5: Payment Integration (1-2 hari)

1. **Midtrans Service**
```python
# app/services/midtrans_service.py
import httpx
from app.config import settings

class MidtransService:
    def __init__(self):
        self.base_url = settings.MIDTRANS_BASE_URL
        self.server_key = settings.MIDTRANS_SERVER_KEY

    async def create_payment(
        self,
        order_id: str,
        amount: int,
        customer_details: dict
    ) -> dict:
        """Create Midtrans payment"""
        payload = {
            "transaction_details": {
                "order_id": order_id,
                "gross_amount": amount
            },
            "customer_details": customer_details,
            "enabled_payments": [
                "qris", "gopay", "shopeepay",
                "bca_va", "bni_va", "bri_va"
            ]
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/transactions",
                json=payload,
                auth=(self.server_key, ""),
                headers={"Content-Type": "application/json"}
            )
            return response.json()

    def verify_webhook(self, notification: dict) -> bool:
        """Verify Midtrans webhook signature"""
        # Implementation
        pass
```

2. **React Native Midtrans SDK**
```typescript
// components/midtrans/MidtransPayment.tsx
import { MidtransSDK } from 'midtrans-react-native';

export const MidtransPayment = ({ token, onFinished }) => {
  const handlePayment = async () => {
    try {
      const result = await MidtransSDK.startPayment({
        clientKey: CLIENT_KEY,
        token: token,
      });

      if (result.transaction_status === 'settlement') {
        onFinished(true);
      }
    } catch (error) {
      onFinished(false);
    }
  };

  return (
    <Button title="Bayar Sekarang" onPress={handlePayment} />
  );
};
```

---

## 4. Prioritas Implementasi

### Sprint 1 (Minggu 1-2)
1. Setup backend FastAPI
2. Database models dan migrations
3. Auth API (register, login, Google)
4. Product API (list, detail)

### Sprint 2 (Minggu 2-3)
1. Cart API (CRUD)
2. Frontend integration untuk auth
3. Frontend integration untuk products
4. Frontend integration untuk cart

### Sprint 3 (Minggu 3-4)
1. Order API (create, list, detail)
2. Frontend integration untuk orders
3. Checkout flow

### Sprint 4 (Minggu 4-5)
1. Midtrans payment integration
2. Payment webhook
3. Order status updates

### Sprint 5 (Minggu 5-6)
1. Shipping integration (opsional)
2. Profile management
3. Address management
4. Testing dan bug fixes

---

## 5. Testing Strategy

### Unit Tests
- Services (auth, cart, order, payment)
- Repositories (CRUD operations)
- Utilities (JWT, pricing)

### Integration Tests
- API endpoints
- Database operations
- Payment flow

### E2E Tests (React Native)
- Login flow
- Add to cart
- Checkout
- Payment

---

## 6. Deployment

### Backend
- **Server:** AWS EC2, DigitalOcean, atau Heroku
- **Database:** AWS RDS, DigitalOcean Managed DB
- **Reverse Proxy:** Nginx
- **Process Manager:** systemd atau PM2

### Frontend
- **Build:** EAS Build
- **Deploy:** App Store, Google Play

---

## 7. Checklist Implementasi

- [ ] Setup FastAPI backend
- [ ] Setup PostgreSQL database
- [ ] Create database models
- [ ] Create Alembic migrations
- [ ] Implement Auth service
- [ ] Implement Product service
- [ ] Implement Cart service
- [ ] Implement Order service
- [ ] Implement Payment service
- [ ] Create API routers
- [ ] Setup CORS
- [ ] Setup Midtrans
- [ ] Create API services di React Native
- [ ] Implement Auth di React Native
- [ ] Implement Product list/detail
- [ ] Implement Cart
- [ ] Implement Checkout
- [ ] Implement Orders
- [ ] Implement Payment
- [ ] Testing
- [ ] Deployment

---

## 8. Resources

### Dokumentasi
- `D:\ALMA\memory\MEMORY.md` - Memory utama
- `D:\ALMA\memory\FEATURES.md` - Detail fitur
- `D:\ALMA\memory\PATTERNS.md` - Patterns dan best practices

### Code Reference (Antigravity)
- Pricing logic: `app/services/pricing_service.py`
- Order logic: `app/services/order_service.py`
- Payment logic: `app/services/payment_service.py`
- Auth logic: `app/services/auth_service.py`

---

## Catatan Penting

1. **Security**
   - Selalu gunakan HTTPS di production
   - Validasi token JWT di setiap request
   - Hash password dengan bcrypt
   - Validate input dengan Pydantic

2. **Error Handling**
   - Return proper HTTP status codes
   - Log error untuk debugging
   - Show user-friendly error messages

3. **Performance**
   - Gunakan pagination untuk list endpoints
   - Cache data yang sering diakses
   - Optimize database queries

4. **Testing**
   - Tulis test untuk critical paths
   - Test payment flow dengan Midtrans sandbox
   - Test error scenarios

5. **Documentation**
   - Update OpenAPI docs
   - Comment complex logic
   - README dengan setup instructions