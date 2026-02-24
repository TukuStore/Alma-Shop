-- Check current orders table structure
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- Check for constraints on orders table
SELECT
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.orders'::regclass;

-- Show current order status values
SELECT DISTINCT status FROM public.orders;

-- Count orders by status
SELECT status, COUNT(*) as count FROM public.orders GROUP BY status;
