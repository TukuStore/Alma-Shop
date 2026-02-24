-- ============================================================================
-- VERIFY: Orders Table Status ENUM
-- ============================================================================
-- Run this in Supabase SQL Editor to check/verify order status values
-- ============================================================================

-- Check current orders table structure
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'orders'
AND column_name = 'status';

-- Check distinct status values currently in use
SELECT DISTINCT status
FROM public.orders
ORDER BY status;

-- Check if there's an ENUM type for order status
SELECT
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname LIKE '%order%status%'
ORDER BY t.typname, e.enumsortorder;

-- Expected statuses should include:
-- PENDING, PAID, PROCESSING, SHIPPED, COMPLETED, CANCELLED
-- RETURN_REQUESTED, RETURN_REJECTED, REFUNDED (for returns)
