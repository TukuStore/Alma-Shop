-- ============================================================================
-- VERIFICATION: Check orders table status column
-- ============================================================================

SELECT
    column_name,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_name = 'orders'
AND column_name = 'status';

-- Show all possible ENUM values
SELECT enumlabel as possible_status
FROM pg_enum
WHERE enumtypid = 'order_status'::regtype
ORDER BY enumsortorder;

-- Show current orders with their status
SELECT id, status, total_amount FROM public.orders ORDER BY created_at DESC LIMIT 5;
