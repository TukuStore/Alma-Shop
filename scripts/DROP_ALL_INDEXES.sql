-- ============================================================================
-- DROP ALL INDEXES ON PROBLEMATIC TABLES
-- ============================================================================
-- Run this to clear all indexes before migration
-- ============================================================================

DROP INDEX IF EXISTS public.idx_orders_status CASCADE;
DROP INDEX IF EXISTS public.idx_orders_user CASCADE;
DROP INDEX IF EXISTS public.idx_returns_status CASCADE;
DROP INDEX IF EXISTS public.idx_returns_user CASCADE;
DROP INDEX IF EXISTS public.idx_returns_order CASCADE;
DROP INDEX IF EXISTS public.idx_transactions_status CASCADE;
DROP INDEX IF EXISTS public.idx_transactions_type CASCADE;
DROP INDEX IF EXISTS public.idx_transactions_wallet CASCADE;
