# Add Product Details for Sarung Products

## Summary
Menambahkan kolom-kolom detail produk untuk sarung di form tambah produk admin.

## Kolom Baru yang Ditambahkan

### 1. **Size** (Ukuran)
- Input field text
- Contoh: S, M, L, XL, XXL
- Icon: `resize-outline`

### 2. **Color** (Warna)
- Input field text
- Contoh: Hitam, Maroon, Putih, Coklat
- Icon: `color-palette-outline`

### 3. **Weight** (Berat)
- Input field numeric (dalam gram)
- Contoh: 250, 300, 350
- Icon: `fitness-outline`

### 4. **Origin** (Asal)
- Toggle button: Lokal / Import
- Default: Lokal
- UI: 2 tombol berdampingan

### 5. **Pattern** (Motif)
- Multi-select button: Polos, Batik, Songket, Kombinasi
- UI: 4 tombol rounded dengan border
- Bisa pilih salah satu atau kosong

### 6. **Condition** (Kondisi)
- Toggle button: Baru / Bekas
- Default: Baru
- UI: 2 tombol berdampingan

### 7. **Original Price** (Harga Asli)
- Input field numeric (opsional)
- Untuk display harga coret (diskon)
- Icon: `pricetag-outline`

## Database Migration

Jalankan script SQL berikut di **Supabase SQL Editor**:

File: [`scripts/add_product_details_columns.sql`](../scripts/add_product_details_columns.sql)

```sql
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS size TEXT,
ADD COLUMN IF NOT EXISTS color TEXT,
ADD COLUMN IF NOT EXISTS weight INTEGER,
ADD COLUMN IF NOT EXISTS origin TEXT,
ADD COLUMN IF NOT EXISTS pattern TEXT,
ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'Baru';

-- Add constraints
ALTER TABLE public.products
ADD CONSTRAINT products_condition_check
CHECK (condition IN ('Baru', 'Bekas'));

ALTER TABLE public.products
ADD CONSTRAINT products_origin_check
CHECK (origin IN ('Lokal', 'Import'));
```

## Files Modified

### Mobile App
- [`app\(admin)\products\add.tsx`](../app/(admin)/products/add.tsx)
  - Added state variables for new fields
  - Added UI components for new fields
  - Updated `handleSave` to include new fields in database insert

### Admin Web (Optional - Need to Update)
- `admin-web/src/pages/ProductFormPage.tsx` - Need to add these fields
- `admin-web/src/pages/ProductListPage.tsx` - Display new fields in table
- `admin-web/src/pages/ProductDetailPage.tsx` - Display new fields in detail view

## UI Layout

### Form Layout (Admin Add Product)
```
[Product Images - Scrollable]
┌─────────────────────────────────┐
│ Price (Rp) | Original Price (Rp) │
├─────────────────────────────────┤
│ Stock      | Weight (gram)       │
├─────────────────────────────────┤
│ Category - Horizontal Scroll    │
├─────────────────────────────────┤
│ Size       | Color               │
├─────────────────────────────────┤
│ Origin - Lokal | Import          │
├─────────────────────────────────┤
│ Pattern - Polos | Batik | Songket│
├─────────────────────────────────┤
│ Condition - Baru | Bekas         │
├─────────────────────────────────┤
│ Materials                        │
├─────────────────────────────────┤
│ Description                      │
├─────────────────────────────────┤
│ Active Status | Featured Product │
└─────────────────────────────────┘
```

## Data Structure

### Database Schema
```typescript
interface Product {
    id: string;
    name: string;
    description: string | null;
    price: number;
    original_price: number | null;
    stock: number;
    category_id: string;
    material: string | null;
    images: string[];

    // New fields
    size: string | null;           // e.g., "XL"
    color: string | null;          // e.g., "Hitam"
    weight: number | null;         // in grams
    origin: 'Lokal' | 'Import' | null;
    pattern: string | null;        // e.g., "Batik"
    condition: 'Baru' | 'Bekas' | null;

    is_active: boolean;
    is_featured: boolean;
    created_at: string;
    updated_at: string | null;
}
```

## Testing Checklist

### Form Validation
- [ ] All fields accept appropriate input types
- [ ] Required fields show validation errors
- [ ] Toggle buttons work correctly (Origin, Condition)
- [ ] Pattern selection works (can select/deselect)

### Database Operations
- [ ] Run migration SQL in Supabase
- [ ] Verify columns added to `products` table
- [ ] Test insert with all new fields
- [ ] Test insert with only required fields (new fields null)
- [ ] Verify constraints work (condition, origin)

### UI Testing
- [ ] Form renders correctly
- [ ] All input fields are accessible
- [ ] Toggle buttons show correct selected state
- [ ] Pattern buttons show correct selected state
- [ ] Form submits successfully
- [ ] Success navigation works

## Next Steps

1. **Run Migration SQL** in Supabase SQL Editor
2. **Test Admin Add Product** with new fields
3. **Update Product Detail Page** (mobile) to display new fields
4. **Update Admin Web** pages to support new fields:
   - ProductFormPage.tsx
   - ProductListPage.tsx
   - ProductDetailPage.tsx
5. **Update Product Types** in `types/index.ts`

## Notes

- All new fields are **optional** (nullable) except `condition` which has default
- Form validation only checks **required fields**: name, price, stock, category
- Toggle buttons use native styling with primary color for selected state
- Pattern uses multi-select style (but only allows one selection for now)
- Weight is stored in **grams** for consistency
