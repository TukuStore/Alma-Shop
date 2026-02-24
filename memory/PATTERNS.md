# PATTERNS - Patterns dan Best Practices dari Antigravity

## Ringkasan

Dokumen ini berisi patterns, best practices, dan konvensi yang digunakan dalam proyek **antigravity/static-feynman**.

---

## 1. Project Structure Pattern

### Clean Architecture with Layer Separation

```
app/
├── models/          # Data layer (ORM)
├── schemas/         # Request/Response validation
├── repositories/    # Data access layer
├── services/        # Business logic layer
├── routers/         # API endpoints (presentation)
├── core/           # Core utilities (security, exceptions)
└── utils/          # Helper functions (s3, midtrans)
```

### Flow Request

```
Request
  -> Router (validation, auth check)
    -> Service (business logic)
      -> Repository (data access)
        -> Model (ORM)
  <- Response
```

---

## 2. Repository Pattern

### Base Repository

```python
# app/repositories/base.py
from typing import Generic, TypeVar, Type, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

ModelType = TypeVar("ModelType")

class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType], db: AsyncSession):
        self.model = model
        self.db = db

    async def get(self, id: int) -> Optional[ModelType]:
        result = await self.db.execute(
            select(self.model).where(self.model.id == id)
        )
        return result.scalar_one_or_none()

    async def get_all(
        self, skip: int = 0, limit: int = 100
    ) -> List[ModelType]:
        result = await self.db.execute(
            select(self.model).offset(skip).limit(limit)
        )
        return list(result.scalars().all())

    async def create(self, obj_in: dict) -> ModelType:
        db_obj = self.model(**obj_in)
        self.db.add(db_obj)
        await self.db.commit()
        await self.db.refresh(db_obj)
        return db_obj

    async def update(self, id: int, obj_in: dict) -> Optional[ModelType]:
        db_obj = await self.get(id)
        if db_obj:
            for field, value in obj_in.items():
                setattr(db_obj, field, value)
            await self.db.commit()
            await self.db.refresh(db_obj)
        return db_obj

    async def delete(self, id: int) -> bool:
        db_obj = await self.get(id)
        if db_obj:
            await self.db.delete(db_obj)
            await self.db.commit()
            return True
        return False
```

### Domain Repository

```python
# app/repositories/product_repository.py
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.product import Product, QuantityTier
from app.repositories.base import BaseRepository

class ProductRepository(BaseRepository[Product]):
    def __init__(self, db: AsyncSession):
        super().__init__(Product, db)

    async def get_with_tiers(self, id: int) -> Optional[Product]:
        result = await self.db.execute(
            select(Product)
            .where(Product.id == id)
            .options(selectinload(Product.quantity_tiers))
        )
        return result.scalar_one_or_none()

    async def get_active_products(
        self, skip: int = 0, limit: int = 20
    ) -> List[Product]:
        result = await self.db.execute(
            select(Product)
            .where(Product.is_active == True)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())
```

---

## 3. Service Pattern

### Business Logic in Services

```python
# app/services/pricing_service.py
from typing import List
from decimal import Decimal
from app.repositories.product_repository import ProductRepository
from app.repositories.option_repository import OptionValueRepository
from app.schemas.pricing import QuoteRequest, QuoteResponse

class PricingService:
    def __init__(
        self,
        product_repo: ProductRepository,
        option_repo: OptionValueRepository
    ):
        self.product_repo = product_repo
        self.option_repo = option_repo

    async def calculate_quote(
        self, items: List[QuoteRequest]
    ) -> QuoteResponse:
        """Calculate price for items"""
        item_quotes = []
        subtotal = Decimal(0)

        for item in items:
            # Get applicable tier
            tier = await self._get_applicable_tier(
                item.product_id, item.quantity
            )

            # Calculate modifiers
            modifiers_sum = await self._calculate_modifiers(
                item.selected_option_values
            )

            # Calculate final price
            unit_price_final = tier.unit_price + modifiers_sum
            item_total = unit_price_final * item.quantity

            item_quotes.append({
                "product_id": item.product_id,
                "quantity": item.quantity,
                "unit_price_base": tier.unit_price,
                "unit_price_modifiers": modifiers_sum,
                "unit_price_final": unit_price_final,
                "item_total": item_total,
                "applied_tier": {
                    "min_qty": tier.min_qty,
                    "max_qty": tier.max_qty,
                    "unit_price": tier.unit_price
                }
            })

            subtotal += item_total

        return QuoteResponse(items=item_quotes, subtotal=subtotal)

    async def _get_applicable_tier(
        self, product_id: int, quantity: int
    ) -> QuantityTier:
        """Get quantity tier for given quantity"""
        # Implementation here
        pass

    async def _calculate_modifiers(
        self, option_value_ids: List[int]
    ) -> Decimal:
        """Sum up modifier prices"""
        # Implementation here
        pass
```

---

## 4. Router Pattern

### FastAPI Router Structure

```python
# app/routers/pricing.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.pricing import QuoteRequest, QuoteResponse
from app.services.pricing_service import PricingService

router = APIRouter(prefix="/pricing", tags=["pricing"])

@router.post("/quote", response_model=QuoteResponse)
async def calculate_quote(
    request: QuoteRequest,
    db: AsyncSession = Depends(get_db)
):
    """Calculate price breakdown for items"""
    service = PricingService(
        product_repo=ProductRepository(db),
        option_repo=OptionValueRepository(db)
    )

    try:
        return await service.calculate_quote(request.items)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
```

---

## 5. Dependency Injection Pattern

### Database Session

```python
# app/database.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql+asyncpg://user:pass@localhost/db"

engine = create_async_engine(DATABASE_URL, echo=True)
async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def get_db() -> AsyncSession:
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()
```

### Auth Dependency

```python
# app/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import decode_token
from app.repositories.user_repository import UserRepository

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    token = credentials.credentials
    payload = decode_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

    user_repo = UserRepository(db)
    user = await user_repo.get(payload["user_id"])

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return user

async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current active user"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    return current_user
```

---

## 6. Schema Pattern

### Pydantic Schemas

```python
# app/schemas/product.py
from pydantic import BaseModel, Field
from typing import List, Optional
from decimal import Decimal

class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    base_price: Decimal = Field(..., ge=0)
    is_active: bool = True

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    base_price: Optional[Decimal] = Field(None, ge=0)
    is_active: Optional[bool] = None

class QuantityTierSchema(BaseModel):
    id: int
    min_qty: int
    max_qty: Optional[int]
    unit_price: Decimal

    class Config:
        from_attributes = True

class ProductResponse(ProductBase):
    id: int
    quantity_tiers: List[QuantityTierSchema] = []

    class Config:
        from_attributes = True

class ProductListResponse(BaseModel):
    items: List[ProductResponse]
    total: int
    page: int
    page_size: int
```

---

## 7. Error Handling Pattern

### Custom Exceptions

```python
# app/core/exceptions.py
from typing import Any

class AppException(Exception):
    """Base exception for application"""

    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

class NotFoundException(AppException):
    """Resource not found"""

    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, status_code=404)

class BadRequestException(AppException):
    """Bad request"""

    def __init__(self, message: str = "Bad request"):
        super().__init__(message, status_code=400)

class UnauthorizedException(AppException):
    """Unauthorized"""

    def __init__(self, message: str = "Unauthorized"):
        super().__init__(message, status_code=401)

class ForbiddenException(AppException):
    """Forbidden"""

    def __init__(self, message: str = "Forbidden"):
        super().__init__(message, status_code=403)
```

### Exception Handler

```python
# app/core/exceptions.py
from fastapi import Request, status
from fastapi.responses import JSONResponse

async def app_exception_handler(
    request: Request, exc: AppException
) -> JSONResponse:
    """Handle application exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.message}
    )

async def http_exception_handler(
    request: Request, exc: HTTPException
) -> JSONResponse:
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.detail}
    )

# Register in main.py
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)
```

---

## 8. Testing Pattern

### Pytest Fixtures

```python
# tests/conftest.py
import pytest
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from httpx import AsyncClient
from app.main import app

TEST_DATABASE_URL = "postgresql+asyncpg://test:test@localhost/test_db"

@pytest.fixture(scope="session")
async def engine():
    engine = create_async_engine(TEST_DATABASE_URL)
    yield engine
    await engine.dispose()

@pytest.fixture
async def db_session(engine):
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    async with async_session() as session:
        yield session
        await session.rollback()

@pytest.fixture
async def client(db_session):
    async with AsyncClient(
        app=app,
        base_url="http://test"
    ) as ac:
        yield ac
```

### Test Example

```python
# tests/test_pricing_service.py
import pytest
from app.services.pricing_service import PricingService
from app.repositories.product_repository import ProductRepository

@pytest.mark.asyncio
async def test_quote_single_item_no_options(db_session):
    """Test pricing with just base tier"""
    # Arrange
    product_repo = ProductRepository(db_session)
    option_repo = OptionValueRepository(db_session)
    service = PricingService(product_repo, option_repo)

    # Create test product with tier
    # ...

    # Act
    request = QuoteRequest(items=[
        QuoteItemRequest(product_id=1, quantity=50, selected_option_values=[])
    ])
    result = await service.calculate_quote(request.items)

    # Assert
    assert len(result.items) == 1
    assert result.items[0].quantity == 50
    assert result.items[0].item_total > 0
```

---

## 9. Configuration Pattern

### Settings with Pydantic

```python
# app/config.py
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # App
    APP_NAME: str = "ALMA"
    DEBUG: bool = False
    SECRET_KEY: str

    # Database
    DATABASE_URL: str

    # JWT
    JWT_SECRET_KEY: str
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_ALGORITHM: str = "HS256"

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:8081"]

    # Google OAuth
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str

    # Midtrans
    MIDTRANS_PRODUCTION_MODE: bool = False
    MIDTRANS_SERVER_KEY: str
    MIDTRANS_CLIENT_KEY: str

    # AWS S3
    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str
    AWS_REGION: str = "ap-southeast-1"
    AWS_S3_BUCKET: str

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
```

---

## 10. Logging Pattern

### Structured Logging

```python
# app/core/logging.py
import logging
import sys
from pythonjsonlogger import jsonlogger

def setup_logging(app_name: str, debug: bool = False):
    """Setup structured logging"""
    logger = logging.getLogger(app_name)
    logger.setLevel(logging.DEBUG if debug else logging.INFO)

    handler = logging.StreamHandler(sys.stdout)
    formatter = jsonlogger.JsonFormatter(
        '%(asctime)s %(name)s %(levelname)s %(message)s'
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)

    return logger

logger = setup_logging(settings.APP_NAME, settings.DEBUG)
```

---

## 11. Frontend Patterns (React Native)

### Component Composition
Memecah layar kompleks menjadi komponen-komponen kecil yang terfokus.

**Contoh pada Product Detail:**
- `ProductDetailScreen` (Parent/Container)
  - `ProductImageCarousel` (Display Images)
  - `ProductInfo` (Display Core Info & Specs)
  - `ProductTabs` (Navigation Control)
  - `ProductDescription` (Content A)
  - `ProductReviews` (Content B)
  - `ProductActions` (Interaction)

### Container/Presenter Pattern
- **Container**: Screen (`app/product/[id].tsx`) menangani logic fetching data, state tabs, dan navigasi.
- **Presenter**: Components (`components/product/*`) hanya menerima props dan merender UI. Mereka tidak melakukan fetch data sendiri.

### Atomic Design (Adapted)
- **Atoms**: `Typography` (Text variants), `Icons` (Ionicons wrapper), `Buttons`.
- **Molecules**: `ProductCard`, `ReviewItem`, `SpecGridItem`.
- **Organisms**: `ProductReviews`, `ProductInfo`.
- **Templates**: `ProductDetailScreen`.

---

## Rekomendasi untuk ALMA

### Pola yang Dapat Diadopsi

1. **Repository Pattern** - Untuk data access layer
2. **Service Pattern** - Untuk business logic
3. **Dependency Injection** - Untuk database session dan auth
4. **Schema Validation** - Menggunakan Pydantic untuk request/response
5. **Error Handling** - Custom exceptions dengan proper status codes
6. **Configuration** - Environment variables dengan Pydantic Settings

### Struktur Backend untuk ALMA

```
backend/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── dependencies.py
│   ├── models/
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── cart.py
│   │   └── order.py
│   ├── schemas/
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── cart.py
│   │   └── order.py
│   ├── repositories/
│   │   ├── user_repository.py
│   │   ├── product_repository.py
│   │   └── order_repository.py
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── cart_service.py
│   │   └── order_service.py
│   └── routers/
│       ├── auth.py
│       ├── products.py
│       ├── cart.py
│       └── orders.py
├── tests/
├── .env.example
├── requirements.txt
└── README.md
```

---

## Catatan

1. **Async/Await** - Gunakan async/await untuk semua database operation
2. **Type Hints** - Selalu gunakan type hints untuk clarity
3. **Validation** - Gunakan Pydantic untuk validasi input
4. **Error Handling** - Return proper HTTP status codes
5. **Testing** - Tulis test untuk critical business logic
6. **Documentation** - Gunakan OpenAPI/Swagger untuk API docs