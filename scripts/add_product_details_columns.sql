-- ============================================================================
-- Add Product Detail Columns for Sarung Products
-- ============================================================================
-- Run this script in Supabase SQL Editor to add new columns to products table
-- ============================================================================

-- Add new columns to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS size TEXT,
ADD COLUMN IF NOT EXISTS color TEXT,
ADD COLUMN IF NOT EXISTS weight INTEGER,
ADD COLUMN IF NOT EXISTS origin TEXT,
ADD COLUMN IF NOT EXISTS pattern TEXT,
ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'Baru';

-- Add comments for documentation
COMMENT ON COLUMN public.products.size IS 'Product size (e.g., S, M, L, XL, XXL)';
COMMENT ON COLUMN public.products.color IS 'Product color (e.g., Hitam, Maroon, Putih)';
COMMENT ON COLUMN public.products.weight IS 'Product weight in grams';
COMMENT ON COLUMN public.products.origin IS 'Product origin (Lokal/Import)';
COMMENT ON COLUMN public.products.pattern IS 'Product pattern (Polos/Batik/Songket/Kombinasi)';
COMMENT ON COLUMN public.products.condition IS 'Product condition (Baru/Bekas)';

-- Add check constraint for condition
ALTER TABLE public.products
DROP CONSTRAINT IF EXISTS products_condition_check;
ALTER TABLE public.products
ADD CONSTRAINT products_condition_check
CHECK (condition IN ('Baru', 'Bekas'));

-- Add check constraint for origin
ALTER TABLE public.products
DROP CONSTRAINT IF EXISTS products_origin_check;
ALTER TABLE public.products
ADD CONSTRAINT products_origin_check
CHECK (origin IN ('Lokal', 'Import'));

-- Verify columns were added
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'products'
AND column_name IN ('size', 'color', 'weight', 'origin', 'pattern', 'condition')
ORDER BY ordinal_position;
