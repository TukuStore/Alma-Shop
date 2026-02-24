-- ============================================================================
-- ALMASTORE - SAFE DATABASE CLEANUP
-- ============================================================================
-- This version uses DO blocks to safely drop objects without errors
-- ============================================================================

-- Drop indexes safely
DO $$
BEGIN
    EXECUTE 'DROP INDEX IF EXISTS public.idx_orders_status CASCADE';
    EXECUTE 'DROP INDEX IF EXISTS public.idx_orders_user CASCADE';
    EXECUTE 'DROP INDEX IF EXISTS public.idx_order_items_order CASCADE';
    EXECUTE 'DROP INDEX IF EXISTS public.idx_order_items_product CASCADE';
    EXECUTE 'DROP INDEX IF EXISTS public.idx_addresses_user CASCADE';
    EXECUTE 'DROP INDEX IF EXISTS public.idx_wishlist_items_user CASCADE';
    EXECUTE 'DROP INDEX IF EXISTS public.idx_wishlist_items_product CASCADE';
    EXECUTE 'DROP INDEX IF EXISTS public.idx_vouchers_code CASCADE';
    EXECUTE 'DROP INDEX IF EXISTS public.idx_vouchers_active CASCADE';
    EXECUTE 'DROP INDEX IF EXISTS public.idx_user_vouchers_user CASCADE';
    EXECUTE 'DROP INDEX IF EXISTS public.idx_user_vouchers_voucher CASCADE';
    EXECUTE 'DROP INDEX IF EXISTS public.idx_reviews_product CASCADE';
    EXECUTE 'DROP INDEX IF EXISTS public.idx_reviews_user CASCADE';
    EXECUTE 'DROP INDEX IF EXISTS public.idx_reviews_rating CASCADE';
    EXECUTE 'DROP INDEX IF EXISTS public.idx_wallets_user CASCADE';
    EXECUTE 'DROP INDEX IF EXISTS public.idx_transactions_wallet CASCADE';
    EXECUTE 'DROP INDEX IF EXISTS public.idx_transactions_type CASCADE';
    EXECUTE 'DROP INDEX IF EXISTS public.idx_transactions_status CASCADE';
    EXECUTE 'DROP INDEX IF EXISTS public.idx_reward_points_user CASCADE';
    EXECUTE 'DROP INDEX IF EXISTS public.idx_reward_points_tier CASCADE';
    EXECUTE 'DROP INDEX IF EXISTS public.idx_reward_points_points CASCADE';
    EXECUTE 'DROP INDEX IF EXISTS public.idx_points_history_user CASCADE';
    EXECUTE 'DROP INDEX IF EXISTS public.idx_points_history_source CASCADE';
    EXECUTE 'DROP INDEX IF EXISTS public.idx_points_history_created CASCADE';
    EXECUTE 'DROP INDEX IF EXISTS public.idx_returns_user CASCADE';
    EXECUTE 'DROP INDEX IF EXISTS public.idx_returns_order CASCADE';
    EXECUTE 'DROP INDEX IF EXISTS public.idx_returns_status CASCADE';
    EXECUTE 'DROP INDEX IF EXISTS public.idx_notifications_user CASCADE';
    EXECUTE 'DROP INDEX IF EXISTS public.idx_notifications_read CASCADE';
    EXECUTE 'DROP INDEX IF EXISTS public.idx_notifications_type CASCADE';
    EXECUTE 'DROP INDEX IF EXISTS public.idx_notification_preferences_user CASCADE';
    EXECUTE 'DROP INDEX IF EXISTS public.idx_push_tokens_user CASCADE';
    EXECUTE 'DROP INDEX IF EXISTS public.idx_search_history_user CASCADE';
    EXECUTE 'DROP INDEX IF EXISTS public.idx_search_history_created CASCADE';
    EXECUTE 'DROP INDEX IF EXISTS public.idx_products_category CASCADE';
    EXECUTE 'DROP INDEX IF EXISTS public.idx_products_featured CASCADE';
    EXECUTE 'DROP INDEX IF EXISTS public.idx_products_active CASCADE';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error dropping indexes: %', SQLERRM;
END $$;

-- Drop views safely
DO $$
BEGIN
    EXECUTE 'DROP VIEW IF EXISTS public.order_summary CASCADE';
    EXECUTE 'DROP VIEW IF EXISTS public.user_wallet_summary CASCADE';
    EXECUTE 'DROP VIEW IF EXISTS public.product_stats CASCADE';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error dropping views: %', SQLERRM;
END $$;

-- Drop functions safely
DO $$
BEGIN
    EXECUTE 'DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE';
    EXECUTE 'DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error dropping functions: %', SQLERRM;
END $$;

-- Drop tables safely
DO $$
BEGIN
    EXECUTE 'DROP TABLE IF EXISTS public.points_history CASCADE';
    EXECUTE 'DROP TABLE IF EXISTS public.reward_points CASCADE';
    EXECUTE 'DROP TABLE IF EXISTS public.transactions CASCADE';
    EXECUTE 'DROP TABLE IF EXISTS public.wallets CASCADE';
    EXECUTE 'DROP TABLE IF EXISTS public.returns CASCADE';
    EXECUTE 'DROP TABLE IF EXISTS public.order_items CASCADE';
    EXECUTE 'DROP TABLE IF EXISTS public.orders CASCADE';
    EXECUTE 'DROP TABLE IF EXISTS public.search_history CASCADE';
    EXECUTE 'DROP TABLE IF EXISTS public.push_tokens CASCADE';
    EXECUTE 'DROP TABLE IF EXISTS public.notification_preferences CASCADE';
    EXECUTE 'DROP TABLE IF EXISTS public.notifications CASCADE';
    EXECUTE 'DROP TABLE IF EXISTS public.reviews CASCADE';
    EXECUTE 'DROP TABLE IF EXISTS public.user_vouchers CASCADE';
    EXECUTE 'DROP TABLE IF EXISTS public.vouchers CASCADE';
    EXECUTE 'DROP TABLE IF EXISTS public.wishlist_items CASCADE';
    EXECUTE 'DROP TABLE IF EXISTS public.addresses CASCADE';
    EXECUTE 'DROP TABLE IF EXISTS public.products CASCADE';
    EXECUTE 'DROP TABLE IF EXISTS public.categories CASCADE';
    EXECUTE 'DROP TABLE IF EXISTS public.profiles CASCADE';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error dropping tables: %', SQLERRM;
END $$;

-- Drop trigger on auth.users
DO $$
BEGIN
    EXECUTE 'DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error dropping trigger: %', SQLERRM;
END $$;

-- ============================================================================
-- ✅ CLEANUP COMPLETE!
-- ============================================================================
-- Now run MASTER_MIGRATION.sql
-- ============================================================================
