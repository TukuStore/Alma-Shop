-- ============================================================================
-- FINAL VERIFICATION
-- ============================================================================

-- Check all timestamp columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'orders' AND column_name LIKE '%_at'
ORDER BY column_name;

-- Check the trigger exists
SELECT
    tgname AS trigger_name,
    pg_get_triggerdef(oid) AS trigger_definition
FROM pg_trigger
WHERE tgrelid = 'public.orders'::regclass AND tgname = 'order_status_timestamps_trigger';

-- Show sample orders with timestamps
SELECT
    id,
    status,
    created_at,
    paid_at,
    processed_at,
    shipped_at,
    completed_at,
    cancelled_at
FROM public.orders
ORDER BY created_at DESC
LIMIT 5;
