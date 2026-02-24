-- ============================================================================
-- Add Order Status Timestamps for Shipping Timeline
-- ============================================================================

-- STEP 0: Drop old trigger functions that have lowercase enum values
DROP FUNCTION IF EXISTS handle_order_shipped() CASCADE;
DROP TRIGGER IF EXISTS handle_order_shipped_trigger ON public.orders;
DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;

-- STEP 1: Add timestamp columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'paid_at') THEN
        ALTER TABLE public.orders ADD COLUMN paid_at TIMESTAMPTZ;
        COMMENT ON COLUMN public.orders.paid_at IS 'Timestamp when order was marked as PAID';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'processed_at') THEN
        ALTER TABLE public.orders ADD COLUMN processed_at TIMESTAMPTZ;
        COMMENT ON COLUMN public.orders.processed_at IS 'Timestamp when order started processing';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'cancelled_at') THEN
        ALTER TABLE public.orders ADD COLUMN cancelled_at TIMESTAMPTZ;
        COMMENT ON COLUMN public.orders.cancelled_at IS 'Timestamp when order was cancelled';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'completed_at') THEN
        ALTER TABLE public.orders ADD COLUMN completed_at TIMESTAMPTZ;
        COMMENT ON COLUMN public.orders.completed_at IS 'Timestamp when order was completed';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'return_requested_at') THEN
        ALTER TABLE public.orders ADD COLUMN return_requested_at TIMESTAMPTZ;
        COMMENT ON COLUMN public.orders.return_requested_at IS 'Timestamp when return was requested';
    END IF;
END $$;

-- STEP 2: Create trigger function to auto-update timestamps on status change
CREATE OR REPLACE FUNCTION handle_order_status_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'PAID' AND OLD.status IS DISTINCT FROM NEW.status THEN
        NEW.paid_at = NOW();
    END IF;

    IF NEW.status = 'PROCESSING' AND OLD.status IS DISTINCT FROM NEW.status THEN
        NEW.processed_at = NOW();
    END IF;

    IF NEW.status = 'SHIPPED' AND OLD.status IS DISTINCT FROM NEW.status THEN
        NEW.shipped_at = NOW();
    END IF;

    IF NEW.status = 'COMPLETED' AND OLD.status IS DISTINCT FROM NEW.status THEN
        NEW.completed_at = NOW();
    END IF;

    IF NEW.status = 'CANCELLED' AND OLD.status IS DISTINCT FROM NEW.status THEN
        NEW.cancelled_at = NOW();
    END IF;

    IF NEW.status = 'RETURN_REQUESTED' AND OLD.status IS DISTINCT FROM NEW.status THEN
        NEW.return_requested_at = NOW();
    END IF;

    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- STEP 3: Add trigger to orders table
DROP TRIGGER IF EXISTS order_status_timestamps_trigger ON public.orders;
CREATE TRIGGER order_status_timestamps_trigger
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION handle_order_status_timestamps();

-- STEP 4: Backfill timestamps for existing orders
UPDATE public.orders
SET
    paid_at = CASE WHEN status::text IN ('PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'RETURN_REQUESTED', 'RETURN_REJECTED', 'REFUNDED')
                   THEN COALESCE(updated_at, created_at) ELSE paid_at END,
    processed_at = CASE WHEN status::text IN ('PROCESSING', 'SHIPPED', 'COMPLETED', 'RETURN_REQUESTED', 'RETURN_REJECTED', 'REFUNDED')
                        THEN COALESCE(updated_at, created_at) ELSE processed_at END,
    shipped_at = CASE WHEN status::text IN ('SHIPPED', 'COMPLETED', 'RETURN_REQUESTED', 'RETURN_REJECTED', 'REFUNDED')
                       THEN COALESCE(updated_at, created_at) ELSE shipped_at END,
    completed_at = CASE WHEN status::text = 'COMPLETED'
                         THEN COALESCE(updated_at, created_at) ELSE completed_at END,
    cancelled_at = CASE WHEN status::text = 'CANCELLED'
                         THEN COALESCE(updated_at, created_at) ELSE cancelled_at END,
    return_requested_at = CASE WHEN status::text IN ('RETURN_REQUESTED', 'RETURN_REJECTED', 'REFUNDED')
                               THEN COALESCE(updated_at, created_at) ELSE return_requested_at END;

-- Verification
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'orders' AND column_name LIKE '%_at';
