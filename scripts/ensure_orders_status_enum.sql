-- ============================================================================
-- Alternative approach: Add new column, copy data, swap columns
-- ============================================================================

-- Step 1: Drop the old CHECK constraint
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Step 2: Create the ENUM type (drop if exists first)
DROP TYPE IF EXISTS order_status CASCADE;
CREATE TYPE order_status AS ENUM (
    'PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED',
    'CANCELLED', 'RETURN_REQUESTED', 'RETURN_REJECTED', 'REFUNDED'
);

-- Step 3: Add a new temporary column with the ENUM type
ALTER TABLE public.orders ADD COLUMN status_new order_status;

-- Step 4: Copy data from old column to new column (with uppercase conversion)
UPDATE public.orders SET status_new = UPPER(status::text)::order_status;

-- Step 5: Drop the old column
ALTER TABLE public.orders DROP COLUMN status;

-- Step 6: Rename the new column to the original name
ALTER TABLE public.orders RENAME COLUMN status_new TO status;

-- Step 7: Set default value
ALTER TABLE public.orders ALTER COLUMN status SET DEFAULT 'PENDING'::order_status;

-- Verification
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'orders' AND column_name = 'status';
