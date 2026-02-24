-- ============================================================================
-- ALMASTORE - MASTER DATABASE MIGRATION
-- ============================================================================
-- This is the COMPLETE database schema for AlmaStore e-commerce app.
-- Run this ONCE in Supabase SQL Editor to set up everything.
-- SAFE TO RE-RUN (Idempotent)
-- ============================================================================
-- Version: 1.0.1
-- Last Updated: February 19, 2026
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PART 0: PRE-CLEANUP (Remove any conflicting objects)
-- ============================================================================
-- Drop old indexes that might conflict (safe to run, IF EXISTS checks)
DROP INDEX IF EXISTS public.idx_orders_status CASCADE;
DROP INDEX IF EXISTS public.idx_orders_user CASCADE;
DROP INDEX IF EXISTS public.idx_returns_status CASCADE;
DROP INDEX IF EXISTS public.idx_returns_user CASCADE;
DROP INDEX IF EXISTS public.idx_returns_order CASCADE;
DROP INDEX IF EXISTS public.idx_transactions_status CASCADE;
DROP INDEX IF EXISTS public.idx_transactions_type CASCADE;
DROP INDEX IF EXISTS public.idx_transactions_wallet CASCADE;

-- ============================================================================
-- PART 1: CORE TABLES
-- ============================================================================

-- --------------------------------------------------------
-- TABLE: profiles
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name   TEXT DEFAULT '',
    role        TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    avatar_url  TEXT DEFAULT '',
    phone_number TEXT DEFAULT '',
    push_token  TEXT DEFAULT '',
    address     TEXT DEFAULT '',
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'User profiles linked to Supabase Auth';

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- --------------------------------------------------------
-- TABLE: categories
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name       TEXT NOT NULL UNIQUE,
    slug       TEXT NOT NULL UNIQUE,
    image_url  TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.categories IS 'Product categories (8 Sarung types)';

-- --------------------------------------------------------
-- TABLE: products
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          TEXT NOT NULL,
    description   TEXT,
    price         NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
    stock         INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    category_id   UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    material      TEXT,
    images        TEXT[] NOT NULL DEFAULT '{}',
    is_featured   BOOLEAN NOT NULL DEFAULT false,
    is_active     BOOLEAN NOT NULL DEFAULT true,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_active   ON public.products(is_active) WHERE is_active = true;

COMMENT ON TABLE public.products IS 'Product catalog with images array and material info';

-- --------------------------------------------------------
-- TABLE: orders
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id            UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    total_amount       NUMERIC(12, 2) NOT NULL DEFAULT 0,
    status             TEXT NOT NULL DEFAULT 'pending'
                       CHECK (status IN (
                           'pending', 'paid', 'processing', 'shipped', 'completed',
                           'cancelled', 'return_requested', 'returned'
                       )),
    payment_proof_url  TEXT,
    payment_method     TEXT,
    shipping_address   JSONB,
    courier            TEXT,
    tracking_number    TEXT,
    shipped_at         TIMESTAMPTZ,
    created_at         TIMESTAMPTZ DEFAULT NOW(),
    updated_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_shipped_at ON public.orders(shipped_at) WHERE status = 'shipped';

COMMENT ON TABLE public.orders IS 'Customer orders with status tracking and order completion flow';
COMMENT ON COLUMN public.orders.shipped_at IS 'Auto-set when status changes to shipped. Used for 3-day auto-completion.';

-- --------------------------------------------------------
-- TABLE: order_items
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id          UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id        UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity          INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    price_at_purchase NUMERIC(12, 2) NOT NULL CHECK (price_at_purchase >= 0),
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

COMMENT ON TABLE public.order_items IS 'Individual items within an order';

-- --------------------------------------------------------
-- TABLE: addresses
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.addresses (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    label           TEXT NOT NULL DEFAULT 'Home',
    recipient_name  TEXT NOT NULL,
    phone_number    TEXT NOT NULL,
    address_line    TEXT NOT NULL,
    city            TEXT NOT NULL,
    province        TEXT NOT NULL,
    postal_code     TEXT NOT NULL,
    is_default      BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_addresses_user ON public.addresses(user_id);

-- Function to handle default address
CREATE OR REPLACE FUNCTION handle_default_address()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = TRUE THEN
        UPDATE public.addresses
        SET is_default = FALSE
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_handle_default_address ON public.addresses;
CREATE TRIGGER trg_handle_default_address
    BEFORE INSERT OR UPDATE ON public.addresses
    FOR EACH ROW EXECUTE FUNCTION handle_default_address();

COMMENT ON TABLE public.addresses IS 'User shipping addresses';

-- --------------------------------------------------------
-- TABLE: wishlist_items
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wishlist_items (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_user ON public.wishlist_items(user_id);

COMMENT ON TABLE public.wishlist_items IS 'User wishlist/favorites';

-- --------------------------------------------------------
-- TABLE: vouchers
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vouchers (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code            TEXT NOT NULL UNIQUE,
    name            TEXT NOT NULL,
    description     TEXT,
    discount_type   TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value  NUMERIC NOT NULL,
    min_purchase    NUMERIC DEFAULT 0,
    max_discount    NUMERIC,
    start_date      TIMESTAMPTZ DEFAULT NOW(),
    end_date        TIMESTAMPTZ,
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.vouchers IS 'Discount vouchers and coupons';

-- --------------------------------------------------------
-- TABLE: user_vouchers
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_vouchers (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    voucher_id UUID NOT NULL REFERENCES public.vouchers(id) ON DELETE CASCADE,
    status     TEXT DEFAULT 'available' CHECK (status IN ('available', 'used', 'expired')),
    used_at    TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, voucher_id)
);

CREATE INDEX IF NOT EXISTS idx_user_vouchers_user_id ON public.user_vouchers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_vouchers_voucher_id ON public.user_vouchers(voucher_id);
CREATE INDEX IF NOT EXISTS idx_user_vouchers_status ON public.user_vouchers(status);
CREATE INDEX IF NOT EXISTS idx_user_vouchers_expires_at ON public.user_vouchers(expires_at);

COMMENT ON TABLE public.user_vouchers IS 'User-specific voucher ownership';

-- --------------------------------------------------------
-- TABLE: reviews
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    order_id   UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    rating     INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment    TEXT NOT NULL,
    images     TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id, order_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON public.reviews(user_id);

COMMENT ON TABLE public.reviews IS 'Product reviews and ratings';

-- ============================================================================
-- PART 2: WALLET & REWARDS
-- ============================================================================

-- --------------------------------------------------------
-- TABLE: wallets
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wallets (
    id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id   UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    balance   NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallets_user ON public.wallets(user_id);

COMMENT ON TABLE public.wallets IS 'User wallet balances';

-- --------------------------------------------------------
-- TABLE: transactions
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transactions (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id   UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
    type        TEXT NOT NULL CHECK (type IN ('topup', 'payment', 'transfer', 'refund')),
    amount      NUMERIC(12, 2) NOT NULL,
    description TEXT,
    status      TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    metadata    JSONB,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON public.transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
-- Note: idx_transactions_status index removed to avoid conflicts with CHECK constraint

COMMENT ON TABLE public.transactions IS 'Wallet transaction history';

-- --------------------------------------------------------
-- TABLE: reward_points
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reward_points (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    points     INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
    tier       TEXT NOT NULL DEFAULT 'Bronze' CHECK (tier IN ('Bronze', 'Silver', 'Gold', 'Platinum')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reward_points_user ON public.reward_points(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_points_tier ON public.reward_points(tier);
CREATE INDEX IF NOT EXISTS idx_reward_points_points ON public.reward_points(points);

COMMENT ON TABLE public.reward_points IS 'User loyalty points and tier status';

-- --------------------------------------------------------
-- TABLE: points_history
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.points_history (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    points      INTEGER NOT NULL,
    source      TEXT NOT NULL CHECK (source IN ('Purchase', 'Review', 'Referral', 'Top Up', 'Bonus', 'Redemption')),
    description TEXT,
    reference_id TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_points_history_user ON public.points_history(user_id);
CREATE INDEX IF NOT EXISTS idx_points_history_source ON public.points_history(source);
CREATE INDEX IF NOT EXISTS idx_points_history_created ON public.points_history(created_at DESC);

COMMENT ON TABLE public.points_history IS 'Points earning and redemption history';

-- --------------------------------------------------------
-- TABLE: returns
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.returns (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id      UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason        TEXT NOT NULL,
    description   TEXT,
    status        TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'refunded')),
    refund_amount NUMERIC,
    refund_method TEXT,
    admin_notes   TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW(),
    completed_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_returns_user ON public.returns(user_id);
CREATE INDEX IF NOT EXISTS idx_returns_order ON public.returns(order_id);
-- Note: idx_returns_status index removed to avoid conflicts with CHECK constraint

COMMENT ON TABLE public.returns IS 'Order return requests';

-- ============================================================================
-- PART 3: NOTIFICATIONS & ANALYTICS
-- ============================================================================

-- --------------------------------------------------------
-- TABLE: notifications
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type        TEXT NOT NULL CHECK (type IN ('order', 'promo', 'wallet', 'system')),
    title       TEXT NOT NULL,
    message     TEXT NOT NULL,
    data        JSONB,
    read        BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

COMMENT ON TABLE public.notifications IS 'User notifications';

-- --------------------------------------------------------
-- TABLE: notification_preferences
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id           UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    orders_enabled    BOOLEAN DEFAULT TRUE,
    promotions_enabled BOOLEAN DEFAULT TRUE,
    wallet_enabled    BOOLEAN DEFAULT TRUE,
    system_enabled    BOOLEAN DEFAULT TRUE,
    push_enabled      BOOLEAN DEFAULT TRUE,
    email_enabled     BOOLEAN DEFAULT FALSE,
    sms_enabled       BOOLEAN DEFAULT FALSE,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON public.notification_preferences(user_id);

COMMENT ON TABLE public.notification_preferences IS 'User notification settings';

-- --------------------------------------------------------
-- TABLE: push_tokens
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.push_tokens (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    token       TEXT NOT NULL UNIQUE,
    platform    TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
    device_info JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active   BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_push_tokens_user ON public.push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_token ON public.push_tokens(token);

COMMENT ON TABLE public.push_tokens IS 'Push notification tokens for devices';

-- --------------------------------------------------------
-- TABLE: search_history
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.search_history (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    query            TEXT NOT NULL,
    filters          JSONB,
    results_count    INTEGER,
    clicked_product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_history_user ON public.search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created ON public.search_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_history_filters ON public.search_history USING GIN (filters);

COMMENT ON TABLE public.search_history IS 'Search analytics with filter tracking';

-- ============================================================================
-- PART 4: TRIGGERS & FUNCTIONS
-- ============================================================================

-- Auto-update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DO $$
DECLARE
    table_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY ARRAY[
        'profiles', 'products', 'orders', 'addresses', 'wallets',
        'reward_points', 'returns', 'notification_preferences'
    ]
    LOOP
        EXECUTE format(
            'DROP TRIGGER IF EXISTS update_%s_updated_at ON public.%s;
            CREATE TRIGGER update_%s_updated_at
                BEFORE UPDATE ON public.%s
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
            table_name, table_name, table_name, table_name
        );
    END LOOP;
END $$;

-- Auto-populate shipped_at when order status changes to 'shipped'
CREATE OR REPLACE FUNCTION handle_order_shipped()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'shipped' AND (OLD.status IS DISTINCT FROM 'shipped') THEN
        NEW.shipped_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_order_shipped ON public.orders;
CREATE TRIGGER trg_order_shipped
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION handle_order_shipped();

COMMENT ON FUNCTION handle_order_shipped() IS 'Auto-sets shipped_at when order status changes to shipped';

-- ============================================================================
-- PART 5: ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all user-specific tables
DO $$
DECLARE
    table_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY ARRAY[
        'profiles', 'addresses', 'wishlist_items', 'reviews',
        'wallets', 'transactions', 'reward_points', 'points_history',
        'returns', 'notifications', 'notification_preferences',
        'push_tokens', 'search_history', 'user_vouchers'
    ]
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    END LOOP;
END $$;

-- --------------------------------------------------------
-- POLICIES: profiles
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- --------------------------------------------------------
-- POLICIES: addresses
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Users manage own addresses" ON public.addresses;
CREATE POLICY "Users manage own addresses" ON public.addresses
    FOR ALL USING (auth.uid() = user_id);

-- --------------------------------------------------------
-- POLICIES: wishlist_items
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Users manage own wishlist" ON public.wishlist_items;
CREATE POLICY "Users manage own wishlist" ON public.wishlist_items
    FOR ALL USING (auth.uid() = user_id);

-- --------------------------------------------------------
-- POLICIES: reviews
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own reviews" ON public.reviews;
CREATE POLICY "Users can insert own reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- --------------------------------------------------------
-- POLICIES: vouchers
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Vouchers are viewable by everyone" ON public.vouchers;
CREATE POLICY "Vouchers are viewable by everyone" ON public.vouchers
    FOR SELECT USING (true);

-- --------------------------------------------------------
-- POLICIES: user_vouchers
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own vouchers" ON public.user_vouchers;
CREATE POLICY "Users can view own vouchers" ON public.user_vouchers
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own vouchers" ON public.user_vouchers;
CREATE POLICY "Users can insert own vouchers" ON public.user_vouchers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own vouchers" ON public.user_vouchers;
CREATE POLICY "Users can update own vouchers" ON public.user_vouchers
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can manage vouchers" ON public.user_vouchers;
CREATE POLICY "System can manage vouchers" ON public.user_vouchers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- --------------------------------------------------------
-- POLICIES: wallets & transactions
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own wallet" ON public.wallets;
CREATE POLICY "Users can view own wallet" ON public.wallets
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.wallets WHERE id = wallet_id));

-- --------------------------------------------------------
-- POLICIES: reward_points & points_history
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own reward points" ON public.reward_points;
CREATE POLICY "Users can view own reward points" ON public.reward_points
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own points history" ON public.points_history;
CREATE POLICY "Users can view own points history" ON public.points_history
    FOR SELECT USING (auth.uid() = user_id);

-- --------------------------------------------------------
-- POLICIES: returns
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own returns" ON public.returns;
CREATE POLICY "Users can view own returns" ON public.returns
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own returns" ON public.returns;
CREATE POLICY "Users can insert own returns" ON public.returns
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all returns" ON public.returns;
CREATE POLICY "Admins can view all returns" ON public.returns
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- --------------------------------------------------------
-- POLICIES: notifications
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);

-- --------------------------------------------------------
-- POLICIES: notification_preferences
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Users can manage own notification preferences" ON public.notification_preferences;
CREATE POLICY "Users can manage own notification preferences" ON public.notification_preferences
    FOR ALL USING (auth.uid() = user_id);

-- --------------------------------------------------------
-- POLICIES: push_tokens
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Users can manage own tokens" ON public.push_tokens;
CREATE POLICY "Users can manage own tokens" ON public.push_tokens
    FOR ALL USING (auth.uid() = user_id);

-- --------------------------------------------------------
-- POLICIES: search_history
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own search history" ON public.search_history;
CREATE POLICY "Users can view own search history" ON public.search_history
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own search history" ON public.search_history;
CREATE POLICY "Users can insert own search history" ON public.search_history
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Admins can view all search history" ON public.search_history;
CREATE POLICY "Admins can view all search history" ON public.search_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- ============================================================================
-- PART 6: SEED DATA
-- ============================================================================

-- Seed categories
INSERT INTO public.categories (name, slug, image_url)
VALUES
    ('Sarung Tenun', 'sarung-tenun', 'https://example.com/images/tenun.jpg'),
    ('Sarung Wadimor', 'sarung-wadimor', 'https://example.com/images/wadimor.jpg'),
    ('Sarung Gajah', 'sarung-gajah', 'https://example.com/images/gajah.jpg'),
    ('Sarung Mangga', 'sarung-mangga', 'https://example.com/images/mangga.jpg'),
    ('Sarung Atlas', 'sarung-atlas', 'https://example.com/images/atlas.jpg'),
    ('Sarung Hitam', 'sarung-hitam', 'https://example.com/images/hitam.jpg'),
    ('Sarung Putih', 'sarung-putih', 'https://example.com/images/putih.jpg'),
    ('Sarung Motif', 'sarung-motif', 'https://example.com/images/motif.jpg')
ON CONFLICT (slug) DO NOTHING;

-- Seed vouchers
INSERT INTO public.vouchers (code, name, description, discount_type, discount_value, min_purchase, end_date)
VALUES
    ('WELCOME50', 'New User Special', 'Get 50% off your first purchase', 'percentage', 50, 0, NOW() + INTERVAL '30 days'),
    ('FREESHIP', 'Free Shipping', 'Free shipping on orders over Rp 50.000', 'fixed', 20000, 50000, NOW() + INTERVAL '7 days'),
    ('SARUNG10', 'Sarung Discount', '10% off all sarung products', 'percentage', 10, 100000, NOW() + INTERVAL '14 days'),
    ('PAYMONGO', 'E-Wallet Bonus', 'Rp 25.000 discount for e-wallet payments', 'fixed', 25000, 150000, NOW() + INTERVAL '21 days')
ON CONFLICT (code) DO NOTHING;

-- Initialize reward points for existing users
INSERT INTO public.reward_points (user_id, points, tier)
SELECT id, 0, 'Bronze'
FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM public.reward_points WHERE reward_points.user_id = auth.users.id
);

-- Initialize notification preferences for existing users
INSERT INTO public.notification_preferences (user_id)
SELECT id
FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM public.notification_preferences WHERE notification_preferences.user_id = auth.users.id
);

-- ============================================================================
-- PART 7: VERIFICATION
-- ============================================================================

-- List all tables created
SELECT
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Count rows in key tables
SELECT
    'profiles' as table_name, COUNT(*) as row_count FROM public.profiles
UNION ALL
SELECT 'categories', COUNT(*) FROM public.categories
UNION ALL
SELECT 'products', COUNT(*) FROM public.products
UNION ALL
SELECT 'orders', COUNT(*) FROM public.orders
UNION ALL
SELECT 'wallets', COUNT(*) FROM public.wallets
UNION ALL
SELECT 'reward_points', COUNT(*) FROM public.reward_points
UNION ALL
SELECT 'vouchers', COUNT(*) FROM public.vouchers;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- All tables, indexes, triggers, RLS policies, and seed data are in place.
-- Your AlmaStore database is ready to use!
-- ============================================================================
