# 🚀 AlmaStore Database - Quick Start Guide

## 📋 Step-by-Step Setup

### Step 1: Run Master Migration
```sql
-- Di Supabase SQL Editor, run:
scripts/MASTER_MIGRATION.sql
```
✅ Creates: 18 tables, indexes, triggers, RLS policies, seed categories & vouchers

---

### Step 2: Run Product Seeder
```sql
-- Di Supabase SQL Editor, run:
scripts/SEED_PRODUCTS.sql
```
✅ Creates: 26 products across 8 categories with local images
📸 Images: Uses `/assets/images/products/sarung-1.jpg`, `sarung-2.jpg`, `sarung-3.jpg`

---

### Step 3: Update Category Images
```sql
-- Di Supabase SQL Editor, run:
scripts/UPDATE_CATEGORY_IMAGES.sql
```
✅ Updates: Categories with local image paths from `/assets/images/category/`

---

## 📊 What You'll Get

### Tables (18 total)
- ✅ **Core**: profiles, categories, products, orders, order_items, addresses, wishlist_items, vouchers, user_vouchers, reviews
- ✅ **Wallet**: wallets, transactions, reward_points, points_history, returns
- ✅ **Analytics**: notifications, notification_preferences, push_tokens, search_history

### Products (25+ items)
- **Sarung Tenun** - 3 produk (Rp 135K - 150K)
- **Sarung Wadimor** - 3 produk (Rp 89K - 98K)
- **Sarung Gajah** - 3 produk (Rp 155K - 175K)
- **Sarung Mangga** - 3 produk (Rp 105K - 125K)
- **Sarung Atlas** - 3 produk (Rp 175K - 195K)
- **Sarung Hitam** - 4 produk (Rp 99K - 189K) ⭐ Best Seller
- **Sarung Putih** - 3 produk (Rp 95K - 179K)
- **Sarung Motif** - 4 produk (Rp 105K - 199K)

### Categories (8 types)
Each category has:
- ✅ Image from local assets
- ✅ 3-4 products
- ✅ Price range indicators
- ✅ Stock availability

### Vouchers (4 active)
- WELCOME50 - 50% off for new users
- FREESHIP - Free shipping Rp 20K
- SARUNG10 - 10% off sarung products
- PAYMONGO - Rp 25K e-wallet bonus

---

## 🔧 Maintenance Scripts

### If you need to reset everything:
```sql
-- Drop all tables and data
scripts/CLEAN_EVERYTHING.sql

-- Then recreate everything
scripts/MASTER_MIGRATION.sql
scripts/SEED_PRODUCTS.sql
scripts/UPDATE_CATEGORY_IMAGES.sql
```

### If you just need to refresh products:
```sql
-- Delete all products first
DELETE FROM public.products;

-- Re-seed products
scripts/SEED_PRODUCTS.sql
```

---

## ✅ Verification Queries

### Check all tables exist:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```
Should return 18 tables.

### Check products per category:
```sql
SELECT
    c.name as category,
    COUNT(p.id) as product_count,
    MIN(p.price) as min_price,
    MAX(p.price) as max_price
FROM public.categories c
LEFT JOIN public.products p ON c.id = p.category_id
GROUP BY c.name
ORDER BY c.name;
```

### Check featured products:
```sql
SELECT
    p.name,
    p.price,
    p.stock,
    c.name as category
FROM public.products p
JOIN public.categories c ON p.category_id = c.id
WHERE p.is_featured = true
ORDER BY c.name, p.name;
```

---

## 📁 File Structure

```
scripts/
├── MASTER_MIGRATION.sql          ← RUN THIS FIRST!
├── SEED_PRODUCTS.sql              ← Run second
├── UPDATE_CATEGORY_IMAGES.sql     ← Run third
├── CLEAN_EVERYTHING.sql           ← Reset tool
├── CLEAN_SAFE.sql                 ← Alternative reset
├── FIX_BEFORE_MIGRATION.sql       ← Legacy
├── DROP_ALL_INDEXES.sql           ← Legacy
└── README.md                      ← Documentation
```

---

## 🎯 Next Steps

After setup, your app is ready to:

1. ✅ **User Registration** - Auto-creates profile & reward points
2. ✅ **Browse Products** - 25+ products across 8 categories
3. ✅ **Add to Cart** - Wishlist & cart functionality
4. ✅ **Checkout** - Order creation with payment proof
5. ✅ **Wallet** - Topup & payment system
6. ✅ **Rewards** - Points earning & tier system
7. ✅ **Vouchers** - Discount code system
8. ✅ **Reviews** - Product rating & reviews
9. ✅ **Notifications** - Push notification support
10. ✅ **Returns** - Order return requests

---

## 🎉 Done!

Your AlmaStore database is now fully configured with:
- ✅ Complete schema (18 tables)
- ✅ Sample data (25+ products)
- ✅ Security (RLS policies)
- ✅ Features (wallet, rewards, vouchers, reviews)

**"No drama, no error. Ready to sell!"** ✨🚀

---

*Last updated: February 19, 2026*
