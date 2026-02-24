-- ============================================================================
-- ALMASTORE - FIX EXISTING ORDERS TABLE
-- ============================================================================
-- Run this FIRST if you have existing orders table with broken status column
-- ============================================================================

-- Drop the broken orders table if it exists
DROP TABLE IF EXISTS public.orders CASCADE;

-- Drop the broken transactions table if it exists
DROP TABLE IF EXISTS public.transactions CASCADE;

-- Drop the broken returns table if it exists
DROP TABLE IF EXISTS public.returns CASCADE;

-- Drop order_items too (has foreign key to orders)
DROP TABLE IF EXISTS public.order_items CASCADE;

-- Tables dropped successfully! Now run MASTER_MIGRATION.sql to recreate them properly.
