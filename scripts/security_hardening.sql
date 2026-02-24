-- ============================================================================
-- ALMASTORE - COMPREHENSIVE SECURITY HARDENING
-- ============================================================================
-- This script fixes ALL known RLS policy gaps across every table.
-- It is IDEMPOTENT — safe to re-run multiple times.
-- Run after MASTER_MIGRATION.sql and fix_admin_push_rls.sql
-- ============================================================================
-- Version: 1.0.0
-- Last Updated: February 22, 2026
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- STEP 0: Ensure is_admin() function exists (SECURITY DEFINER)
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  is_admin_flag BOOLEAN;
BEGIN
  SELECT (role = 'admin') INTO is_admin_flag
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN coalesce(is_admin_flag, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ────────────────────────────────────────────────────────────────────────────
-- STEP 1: Enable RLS on ALL tables (including public ones)
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TABLE: profiles
-- Security: Users can view/update own. Admins can view all.
-- ============================================================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

-- SECURITY: Users CANNOT change their own role
-- The profile UPDATE policy doesn't restrict columns, but we add a trigger
CREATE OR REPLACE FUNCTION prevent_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role != OLD.role AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can change user roles';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_role_change ON public.profiles;
CREATE TRIGGER trg_prevent_role_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION prevent_role_change();

-- ============================================================================
-- TABLE: categories
-- Security: Everyone can view. Only admins can manage.
-- ============================================================================
DROP POLICY IF EXISTS "Everyone can view categories" ON public.categories;
CREATE POLICY "Everyone can view categories" ON public.categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can manage categories" ON public.categories;
-- Don't use FOR ALL for admin on categories since it would conflict with public SELECT

DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
CREATE POLICY "Admins can insert categories" ON public.categories
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
CREATE POLICY "Admins can update categories" ON public.categories
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;
CREATE POLICY "Admins can delete categories" ON public.categories
  FOR DELETE USING (public.is_admin());

-- ============================================================================
-- TABLE: products
-- Security: Everyone can view active. Admins can view all + manage.
-- ============================================================================
DROP POLICY IF EXISTS "Everyone can view active products" ON public.products;
CREATE POLICY "Everyone can view active products" ON public.products
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
CREATE POLICY "Admins can view all products" ON public.products
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Only admins can manage products" ON public.products;
-- Split into specific operations for clarity

DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products" ON public.products
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products" ON public.products
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products" ON public.products
  FOR DELETE USING (public.is_admin());

-- ============================================================================
-- TABLE: orders
-- Security: Users can view/create own. Admins can view/update all.
-- ============================================================================
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
CREATE POLICY "Users can create own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update order status" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================================
-- TABLE: order_items
-- Security: Users can view/create their own order's items. Admins can view all.
-- ============================================================================
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create order items for their orders" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert own order items" ON public.order_items;
CREATE POLICY "Users can insert own order items" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;
CREATE POLICY "Admins can view all order items" ON public.order_items
  FOR SELECT USING (public.is_admin());

-- ============================================================================
-- TABLE: addresses
-- Security: Users can fully manage own addresses only.
-- ============================================================================
DROP POLICY IF EXISTS "Users manage own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can manage their own addresses" ON public.addresses;
CREATE POLICY "Users manage own addresses" ON public.addresses
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- TABLE: wishlist_items
-- Security: Users can fully manage own wishlist only.
-- ============================================================================
DROP POLICY IF EXISTS "Users manage own wishlist" ON public.wishlist_items;
DROP POLICY IF EXISTS "Users can manage their own wishlists" ON public.wishlist_items;
CREATE POLICY "Users manage own wishlist" ON public.wishlist_items
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- TABLE: vouchers
-- Security: Everyone can view. Only admins can manage.
-- ============================================================================
DROP POLICY IF EXISTS "Vouchers are viewable by everyone" ON public.vouchers;
CREATE POLICY "Vouchers are viewable by everyone" ON public.vouchers
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert vouchers" ON public.vouchers;
CREATE POLICY "Admins can insert vouchers" ON public.vouchers
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update vouchers" ON public.vouchers;
CREATE POLICY "Admins can update vouchers" ON public.vouchers
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete vouchers" ON public.vouchers;
CREATE POLICY "Admins can delete vouchers" ON public.vouchers
  FOR DELETE USING (public.is_admin());

-- ============================================================================
-- TABLE: user_vouchers
-- Security: Users can view/insert/update own. Admins can manage all.
-- ============================================================================
DROP POLICY IF EXISTS "Users can view own vouchers" ON public.user_vouchers;
CREATE POLICY "Users can view own vouchers" ON public.user_vouchers
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own vouchers" ON public.user_vouchers;
CREATE POLICY "Users can insert own vouchers" ON public.user_vouchers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own vouchers" ON public.user_vouchers;
CREATE POLICY "Users can update own vouchers" ON public.user_vouchers
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can manage vouchers" ON public.user_vouchers;
CREATE POLICY "Admins can manage all user vouchers" ON public.user_vouchers
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================================
-- TABLE: reviews
-- Security: Everyone can view. Users can insert own.
-- ============================================================================
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own reviews" ON public.reviews;
CREATE POLICY "Users can insert own reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
CREATE POLICY "Users can update own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own reviews" ON public.reviews;
CREATE POLICY "Users can delete own reviews" ON public.reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Admins can delete inappropriate reviews
DROP POLICY IF EXISTS "Admins can delete reviews" ON public.reviews;
CREATE POLICY "Admins can delete reviews" ON public.reviews
  FOR DELETE USING (public.is_admin());

-- ============================================================================
-- TABLE: wallets
-- Security: Users can view own. Admins can view all.
-- No direct user INSERT/UPDATE to prevent balance manipulation.
-- ============================================================================
DROP POLICY IF EXISTS "Users can view own wallet" ON public.wallets;
CREATE POLICY "Users can view own wallet" ON public.wallets
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all wallets" ON public.wallets;
CREATE POLICY "Admins can view all wallets" ON public.wallets
  FOR SELECT USING (public.is_admin());

-- IMPORTANT: No INSERT/UPDATE policy for users on wallets!
-- Wallet balance changes should only happen through server-side functions.

-- ============================================================================
-- TABLE: transactions
-- Security: Users can view own. No direct INSERT by client.
-- ============================================================================
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM public.wallets WHERE id = wallet_id)
  );

DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
CREATE POLICY "Admins can view all transactions" ON public.transactions
  FOR SELECT USING (public.is_admin());

-- ============================================================================
-- TABLE: reward_points
-- Security: Users can view own. No direct client modification.
-- ============================================================================
DROP POLICY IF EXISTS "Users can view own reward points" ON public.reward_points;
CREATE POLICY "Users can view own reward points" ON public.reward_points
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all reward points" ON public.reward_points;
CREATE POLICY "Admins can view all reward points" ON public.reward_points
  FOR SELECT USING (public.is_admin());

-- ============================================================================
-- TABLE: points_history
-- Security: Users can view own.
-- ============================================================================
DROP POLICY IF EXISTS "Users can view own points history" ON public.points_history;
CREATE POLICY "Users can view own points history" ON public.points_history
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- TABLE: returns
-- Security: Users can view/insert own. Admins can view/update all.
-- ============================================================================
DROP POLICY IF EXISTS "Users can view own returns" ON public.returns;
CREATE POLICY "Users can view own returns" ON public.returns
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own returns" ON public.returns;
CREATE POLICY "Users can insert own returns" ON public.returns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all returns" ON public.returns;
CREATE POLICY "Admins can view all returns" ON public.returns
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update returns" ON public.returns;
CREATE POLICY "Admins can update returns" ON public.returns
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================================
-- TABLE: notifications
-- Security: Users can view/update own (mark as read). Admins can insert/view.
-- ============================================================================
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can insert notifications" ON public.notifications;
CREATE POLICY "Admins can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can view notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON public.notifications;
CREATE POLICY "Admins can view all notifications" ON public.notifications
  FOR SELECT USING (public.is_admin());

-- ============================================================================
-- TABLE: notification_preferences
-- Security: Users can fully manage own.
-- ============================================================================
DROP POLICY IF EXISTS "Users can manage own notification preferences" ON public.notification_preferences;
CREATE POLICY "Users manage own notification preferences" ON public.notification_preferences
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- TABLE: push_tokens
-- Security: Users can manage own. Admins can view all (to send push notifs).
-- ============================================================================
DROP POLICY IF EXISTS "Users can manage own tokens" ON public.push_tokens;

DROP POLICY IF EXISTS "Users can insert their own tokens" ON public.push_tokens;
CREATE POLICY "Users can insert own tokens" ON public.push_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own tokens" ON public.push_tokens;
CREATE POLICY "Users can view own tokens" ON public.push_tokens
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own tokens" ON public.push_tokens;
CREATE POLICY "Users can update own tokens" ON public.push_tokens
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own tokens" ON public.push_tokens;
CREATE POLICY "Users can delete own tokens" ON public.push_tokens
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all push tokens" ON public.push_tokens;
CREATE POLICY "Admins can view all push tokens" ON public.push_tokens
  FOR SELECT USING (public.is_admin());

-- ============================================================================
-- TABLE: search_history
-- Security: Users can view/insert own. Admins can view all.
-- ============================================================================
DROP POLICY IF EXISTS "Users can view own search history" ON public.search_history;
CREATE POLICY "Users can view own search history" ON public.search_history
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own search history" ON public.search_history;
CREATE POLICY "Users can insert own search history" ON public.search_history
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Admins can view all search history" ON public.search_history;
CREATE POLICY "Admins can view all search history" ON public.search_history
  FOR SELECT USING (public.is_admin());

-- ============================================================================
-- TABLE: hero_sliders (if exists)
-- Security: Everyone can view. Only admins can manage.
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'hero_sliders') THEN
    ALTER TABLE public.hero_sliders ENABLE ROW LEVEL SECURITY;
    
    EXECUTE 'DROP POLICY IF EXISTS "Public can view hero sliders" ON public.hero_sliders';
    EXECUTE 'CREATE POLICY "Public can view hero sliders" ON public.hero_sliders FOR SELECT USING (true)';
    
    EXECUTE 'DROP POLICY IF EXISTS "Admin can insert hero sliders" ON public.hero_sliders';
    EXECUTE 'CREATE POLICY "Admin can insert hero sliders" ON public.hero_sliders FOR INSERT WITH CHECK (public.is_admin())';
    
    EXECUTE 'DROP POLICY IF EXISTS "Admin can update hero sliders" ON public.hero_sliders';
    EXECUTE 'CREATE POLICY "Admin can update hero sliders" ON public.hero_sliders FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin())';
    
    EXECUTE 'DROP POLICY IF EXISTS "Admin can delete hero sliders" ON public.hero_sliders';
    EXECUTE 'CREATE POLICY "Admin can delete hero sliders" ON public.hero_sliders FOR DELETE USING (public.is_admin())';
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION: List all RLS policies
-- ============================================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  CASE WHEN roles = '{public}' THEN 'public' ELSE array_to_string(roles, ',') END as roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================
-- VERIFICATION: Ensure RLS is enabled on all tables
-- ============================================================================
SELECT 
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  c.relforcerowsecurity AS rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' 
  AND c.relkind = 'r'
ORDER BY c.relname;

-- ============================================================================
-- SECURITY HARDENING COMPLETE
-- ============================================================================
-- Summary of what this migration covers:
-- 
-- 1. ✅ is_admin() function (SECURITY DEFINER)
-- 2. ✅ RLS enabled on ALL tables
-- 3. ✅ Role-change prevention trigger on profiles
-- 4. ✅ Proper admin CRUD policies for:
--    - categories, products, vouchers, hero_sliders
-- 5. ✅ User data isolation for:
--    - profiles, orders, order_items, addresses, wishlist_items,
--      user_vouchers, reviews, wallets, transactions, reward_points,
--      points_history, returns, notifications, notification_preferences,
--      push_tokens, search_history
-- 6. ✅ Admin read-only access for analytics:
--    - orders, order_items, profiles, wallets, transactions,
--      reward_points, returns, push_tokens, search_history
-- 7. ✅ Admin INSERT on notifications (for push notifications)
-- 8. ✅ No direct client INSERT/UPDATE on wallets (server-side only)
-- 9. ✅ Public read access for: categories, products (active only), 
--    vouchers, reviews, hero_sliders
-- ============================================================================
