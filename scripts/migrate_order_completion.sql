-- ============================================================================
-- ALMASTORE - ORDER COMPLETION FLOW MIGRATION
-- ============================================================================
-- This migration adds the "Order Completion" flow:
--   1. Adds 'completed' to the order status enum (replaces 'delivered')
--   2. Adds 'shipped_at' timestamp column
--   3. Creates a trigger to auto-populate 'shipped_at' when status → 'shipped'
--   4. Migrates existing 'delivered' orders to 'completed'
--   5. Adds indexes for the auto-complete cron job performance
-- ============================================================================
-- SAFE TO RE-RUN (Idempotent)
-- Run this in the Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- STEP 1: Add 'shipped_at' column (if not exists)
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'orders'
          AND column_name = 'shipped_at'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN shipped_at TIMESTAMPTZ;
        COMMENT ON COLUMN public.orders.shipped_at IS 'Timestamp when the order was shipped (tracking number entered). Used for auto-completion after 3 days.';
    END IF;
END $$;

-- ============================================================================
-- STEP 2: Add 'courier' and 'tracking_number' columns (if not exists)
-- These may already exist from a prior migration, but we ensure they're here.
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'orders'
          AND column_name = 'courier'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN courier TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'orders'
          AND column_name = 'tracking_number'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN tracking_number TEXT;
    END IF;
END $$;

-- ============================================================================
-- STEP 3: Update the CHECK constraint to include 'completed' and remove 'delivered'
-- ============================================================================
-- First, drop the existing CHECK constraint on status
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    -- Find the existing CHECK constraint on the status column
    SELECT con.conname INTO constraint_name
    FROM pg_constraint con
    JOIN pg_attribute att ON att.attnum = ANY(con.conkey) AND att.attrelid = con.conrelid
    WHERE con.conrelid = 'public.orders'::regclass
      AND con.contype = 'c'
      AND att.attname = 'status'
    LIMIT 1;

    -- Drop it if found
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE public.orders DROP CONSTRAINT %I', constraint_name);
        RAISE NOTICE 'Dropped existing constraint: %', constraint_name;
    END IF;
END $$;

-- Migrate any existing 'delivered' rows to 'completed' BEFORE adding the new constraint
UPDATE public.orders SET status = 'completed' WHERE status = 'delivered';

-- Now add the new constraint with 'completed' replacing 'delivered'
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check
    CHECK (status IN (
        'pending', 'paid', 'processing', 'shipped', 'completed',
        'cancelled', 'return_requested', 'returned'
    ));

-- ============================================================================
-- STEP 4: Backfill 'shipped_at' for existing shipped/completed orders
-- ============================================================================
-- For orders already in 'shipped' or 'completed' status that don't have shipped_at,
-- use updated_at as a fallback
UPDATE public.orders
SET shipped_at = COALESCE(updated_at, created_at)
WHERE status IN ('shipped', 'completed')
  AND shipped_at IS NULL;

-- ============================================================================
-- STEP 5: Create trigger to auto-populate 'shipped_at' on status → 'shipped'
-- ============================================================================
CREATE OR REPLACE FUNCTION handle_order_shipped()
RETURNS TRIGGER AS $$
BEGIN
    -- When status changes TO 'shipped', record the timestamp
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
-- STEP 6: Add indexes for auto-complete cron job performance
-- ============================================================================
-- This index will make the daily cron job query fast:
-- WHERE status = 'shipped' AND shipped_at < NOW() - INTERVAL '3 days'
CREATE INDEX IF NOT EXISTS idx_orders_shipped_at
    ON public.orders(shipped_at)
    WHERE status = 'shipped';

CREATE INDEX IF NOT EXISTS idx_orders_status
    ON public.orders(status);

-- ============================================================================
-- STEP 7: Verification
-- ============================================================================

-- Verify the new column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'orders'
  AND column_name IN ('shipped_at', 'status', 'courier', 'tracking_number')
ORDER BY column_name;

-- Verify the new CHECK constraint
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.orders'::regclass
  AND contype = 'c';

-- Show current order status distribution
SELECT status, COUNT(*) as count
FROM public.orders
GROUP BY status
ORDER BY count DESC;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Next steps:
--   1. Deploy the 'auto-complete-orders' Edge Function
--   2. Set up pg_cron or Supabase Cron to invoke it daily
--   3. Update all 3 frontends (Android, Web Store, Admin Web)
-- ============================================================================
