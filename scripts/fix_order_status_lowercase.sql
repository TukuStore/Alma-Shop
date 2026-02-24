-- ============================================================================
-- FIX: Recreate order_status enum with LOWERCASE values
-- The app code uses lowercase ('pending', 'shipped', etc.)
-- but the current enum has UPPERCASE ('PENDING', 'SHIPPED', etc.)
-- ============================================================================

-- Step 1: Drop existing constraints and enum
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Step 2: Add temporary text column
ALTER TABLE public.orders ADD COLUMN status_temp text;

-- Step 3: Copy data (convert to lowercase)
UPDATE public.orders SET status_temp = LOWER(status::text);

-- Step 4: Drop old column (this also drops the old enum dependency)
ALTER TABLE public.orders DROP COLUMN status;

-- Step 5: Drop old enum type
DROP TYPE IF EXISTS order_status CASCADE;

-- Step 6: Create new enum with lowercase values
CREATE TYPE order_status AS ENUM (
    'pending', 'paid', 'processing', 'shipped', 'completed',
    'cancelled', 'return_requested', 'return_rejected', 'refunded'
);

-- Step 7: Add new status column with the lowercase enum
ALTER TABLE public.orders ADD COLUMN status order_status DEFAULT 'pending'::order_status;

-- Step 8: Copy data from temp to new column
UPDATE public.orders SET status = status_temp::order_status;

-- Step 9: Drop temporary column
ALTER TABLE public.orders DROP COLUMN status_temp;

-- Step 10: Recreate the timestamp trigger function with lowercase values
CREATE OR REPLACE FUNCTION handle_order_status_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
        NEW.paid_at = NOW();
    END IF;
    IF NEW.status = 'processing' AND (OLD.status IS NULL OR OLD.status != 'processing') THEN
        NEW.processing_at = NOW();
    END IF;
    IF NEW.status = 'shipped' AND (OLD.status IS NULL OR OLD.status != 'shipped') THEN
        NEW.shipped_at = NOW();
    END IF;
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        NEW.completed_at = NOW();
    END IF;
    IF NEW.status = 'cancelled' AND (OLD.status IS NULL OR OLD.status != 'cancelled') THEN
        NEW.cancelled_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 11: Recreate trigger
DROP TRIGGER IF EXISTS order_status_timestamps_trigger ON public.orders;
CREATE TRIGGER order_status_timestamps_trigger
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION handle_order_status_timestamps();

-- ============================================================================
-- VERIFICATION
-- ============================================================================
SELECT enumlabel as status_value
FROM pg_enum
WHERE enumtypid = 'order_status'::regtype
ORDER BY enumsortorder;

SELECT id, status, total_amount FROM public.orders ORDER BY created_at DESC LIMIT 5;
