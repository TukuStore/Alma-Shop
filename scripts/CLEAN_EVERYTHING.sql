-- ============================================================================
-- ALMASTORE - COMPLETE DATABASE RESET
-- ============================================================================
-- ⚠️  WARNING: This will DELETE ALL DATA in your database!
-- ⚠️  ONLY RUN THIS if you want a COMPLETE FRESH START!
-- ============================================================================
-- Run this BEFORE MASTER_MIGRATION.sql if you have ANY existing data
-- ============================================================================

-- Drop ALL indexes first (in any order)
DROP INDEX IF EXISTS public.idx_orders_status CASCADE;
DROP INDEX IF EXISTS public.idx_orders_user CASCADE;
DROP INDEX IF EXISTS public.idx_order_items_order CASCADE;
DROP INDEX IF EXISTS public.idx_order_items_product CASCADE;
DROP INDEX IF EXISTS public.idx_addresses_user CASCADE;
DROP INDEX IF EXISTS public.idx_wishlist_items_user CASCADE;
DROP INDEX IF EXISTS public.idx_wishlist_items_product CASCADE;
DROP INDEX IF EXISTS public.idx_vouchers_code CASCADE;
DROP INDEX IF EXISTS public.idx_vouchers_active CASCADE;
DROP INDEX IF EXISTS public.idx_user_vouchers_user CASCADE;
DROP INDEX IF EXISTS public.idx_user_vouchers_voucher CASCADE;
DROP INDEX IF EXISTS public.idx_reviews_product CASCADE;
DROP INDEX IF EXISTS public.idx_reviews_user CASCADE;
DROP INDEX IF EXISTS public.idx_reviews_rating CASCADE;
DROP INDEX IF EXISTS public.idx_wallets_user CASCADE;
DROP INDEX IF EXISTS public.idx_transactions_wallet CASCADE;
DROP INDEX IF EXISTS public.idx_transactions_type CASCADE;
DROP INDEX IF EXISTS public.idx_transactions_status CASCADE;
DROP INDEX IF EXISTS public.idx_reward_points_user CASCADE;
DROP INDEX IF EXISTS public.idx_reward_points_tier CASCADE;
DROP INDEX IF EXISTS public.idx_reward_points_points CASCADE;
DROP INDEX IF EXISTS public.idx_points_history_user CASCADE;
DROP INDEX IF EXISTS public.idx_points_history_source CASCADE;
DROP INDEX IF EXISTS public.idx_points_history_created CASCADE;
DROP INDEX IF EXISTS public.idx_returns_user CASCADE;
DROP INDEX IF EXISTS public.idx_returns_order CASCADE;
DROP INDEX IF EXISTS public.idx_returns_status CASCADE;
DROP INDEX IF EXISTS public.idx_notifications_user CASCADE;
DROP INDEX IF EXISTS public.idx_notifications_read CASCADE;
DROP INDEX IF EXISTS public.idx_notifications_type CASCADE;
DROP INDEX IF EXISTS public.idx_notification_preferences_user CASCADE;
DROP INDEX IF EXISTS public.idx_push_tokens_user CASCADE;
DROP INDEX IF EXISTS public.idx_search_history_user CASCADE;
DROP INDEX IF EXISTS public.idx_search_history_created CASCADE;
DROP INDEX IF EXISTS public.idx_products_category CASCADE;
DROP INDEX IF EXISTS public.idx_products_featured CASCADE;
DROP INDEX IF EXISTS public.idx_products_active CASCADE;

-- Drop ALL views (if any exist)
DROP VIEW IF EXISTS public.order_summary CASCADE;
DROP VIEW IF EXISTS public.user_wallet_summary CASCADE;
DROP VIEW IF EXISTS public.product_stats CASCADE;

-- Drop ALL functions (if any exist)
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Drop ALL tables FIRST (before triggers, since triggers reference tables)
-- This order is important - we can't drop triggers on tables that don't exist
DROP TABLE IF EXISTS public.points_history CASCADE;
DROP TABLE IF EXISTS public.reward_points CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.wallets CASCADE;
DROP TABLE IF EXISTS public.returns CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.search_history CASCADE;
DROP TABLE IF EXISTS public.push_tokens CASCADE;
DROP TABLE IF EXISTS public.notification_preferences CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.user_vouchers CASCADE;
DROP TABLE IF EXISTS public.vouchers CASCADE;
DROP TABLE IF EXISTS public.wishlist_items CASCADE;
DROP TABLE IF EXISTS public.addresses CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ============================================================================
-- ✅ COMPLETE RESET DONE!
-- ============================================================================
-- Now you can run MASTER_MIGRATION.sql for a fresh start
-- ============================================================================
