# AlmaStore Database Scripts

## 📁 Folder Structure

Clean, organized SQL scripts for AlmaStore e-commerce app.

---

## 🚀 Quick Start

### **For Fresh Database - Run This:**

```sql
-- Open Supabase SQL Editor and run:
scripts/MASTER_MIGRATION.sql
```

This ONE file sets up EVERYTHING:
- ✅ 18 tables
- ✅ All indexes
- ✅ All triggers
- ✅ All RLS policies
- ✅ Seed data (categories, vouchers)
- ✅ Verification queries

**Done! No other files needed.**

---

## 📋 Files in This Folder

| File | Description | When to Use |
|------|-------------|-------------|
| **MASTER_MIGRATION.sql** | Complete database schema | ✅ **RUN THIS FIRST** |
| `fix_rls_policies.sql` | Fix RLS issues | If RLS broken |
| `setup_minimal.sql` | Quick minimal setup | For testing only |

---

## 🗄️ Database Schema

### Core Tables (10)
- `profiles` - User profiles
- `categories` - Product categories (8 sarung types)
- `products` - Product catalog
- `orders` - Customer orders (with return status)
- `order_items` - Items in orders
- `addresses` - Shipping addresses
- `wishlist_items` - User wishlist
- `vouchers` - Discount vouchers
- `user_vouchers` - User-specific vouchers
- `reviews` - Product reviews

### Wallet & Rewards (5)
- `wallets` - User wallet balances
- `transactions` - Transaction history
- `reward_points` - Loyalty points & tiers
- `points_history` - Points earning/redemption
- `returns` - Order return requests

### Notifications & Analytics (4)
- `notifications` - User notifications
- `notification_preferences` - Notification settings
- `push_tokens` - Push notification tokens
- `search_history` - Search analytics

---

## 📊 Order Status

Orders support these statuses:
```
pending          - Order placed, waiting payment
paid             - Payment received
processing       - Being prepared
shipped          - In transit
delivered        - Delivered to customer
cancelled        - Order cancelled
return_requested - Return requested by customer
returned         - Return completed
```

---

## 🔐 Row Level Security (RLS)

All tables have RLS enabled:
- ✅ Users see only their own data
- ✅ Admins can view all data
- ✅ Anonymous users can insert search history

---

## ✅ Verification

After migration, verify with:

```sql
-- List all tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Count rows
SELECT
    'profiles' as t, COUNT(*) FROM public.profiles
UNION ALL SELECT 'products', COUNT(*) FROM public.products
UNION ALL SELECT 'orders', COUNT(*) FROM public.orders
UNION ALL SELECT 'wallets', COUNT(*) FROM public.wallets
UNION ALL SELECT 'vouchers', COUNT(*) FROM public.vouchers;
```

---

## 🆘 Troubleshooting

### Error: "column status does not exist"
**Solution:** Re-run MASTER_MIGRATION.sql

### Error: "relation already exists"
**Solution:** Normal! Script uses IF NOT EXISTS

### RLS Issues
**Solution:** Run fix_rls_policies.sql

---

## 📝 Notes

**What Happened:**
- Cleaned up 10+ duplicate SQL files
- Consolidated everything into MASTER_MIGRATION.sql
- Only keep files that serve unique purpose

**What to Keep:**
- ✅ MASTER_MIGRATION.sql - Main migration
- ✅ fix_rls_policies.sql - Utility for RLS fixes
- ✅ setup_minimal.sql - Quick test setup

**What Was Deleted:**
- ❌ create_missing_tables.sql (merged)
- ❌ create_notifications_table.sql (merged)
- ❌ create_push_tokens_table.sql (merged)
- ❌ create_vouchers_table.sql (merged)
- ❌ create_wallet_tables.sql (merged)
- ❌ create_wishlist_table.sql (merged)
- ❌ supabase_migration.sql (merged)
- ❌ supabase_notifications_simple.sql (merged)
- ❌ setup_notifications_supabase.sql (merged)
- ❌ update_addresses_category.sql (merged)

---

## 🎯 Summary

**Just run MASTER_MIGRATION.sql and you're done!** 🚀

Everything else is reference or utility.
