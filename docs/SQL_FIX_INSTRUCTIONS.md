# Database Migration Fix - Instructions

## Problem
Error: `column "status" does not exist` when running `create_missing_tables.sql`

## Root Cause
The original `orders` table constraint in `supabase_migration.sql` only included:
```sql
CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'))
```

It was **missing**:
- `return_requested`
- `returned`

## Solution Applied

### 1. Fixed `create_missing_tables.sql`

Changed the constraint update section to:
```sql
-- Drop existing constraint first
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'orders_status_check'
    ) THEN
        ALTER TABLE orders DROP CONSTRAINT orders_status_check;
    END IF;
END $$;

-- Add updated constraint with return statuses
ALTER TABLE orders
ADD CONSTRAINT orders_status_check
CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'return_requested', 'returned'));
```

### 2. Updated `supabase_migration.sql`

Changed the orders table definition to include return statuses:
```sql
CREATE TABLE IF NOT EXISTS public.orders (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    total_amount        NUMERIC(12, 2) NOT NULL DEFAULT 0,
    status              TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'return_requested', 'returned')),
    -- ...
);
```

## How to Run the Migration

### Option 1: Fresh Database (Recommended for new projects)
1. Open Supabase SQL Editor
2. Run `supabase_migration.sql` first (creates all base tables with correct schema)
3. Then run other table creation scripts:
   - `create_wallet_tables.sql`
   - `create_vouchers_table.sql`
   - `create_wishlist_table.sql`
   - `create_missing_tables.sql`

### Option 2: Existing Database (Update existing)
1. Open Supabase SQL Editor
2. Run ONLY section 7 from `create_missing_tables.sql`:
   ```sql
   -- ============================================================
   -- 7. ADD RETURN_REQUESTED STATUS TO ORDERS
   -- ============================================================

   DO $$
   BEGIN
       IF EXISTS (
           SELECT 1 FROM pg_constraint
           WHERE conname = 'orders_status_check'
       ) THEN
           ALTER TABLE orders DROP CONSTRAINT orders_status_check;
       END IF;
   END $$;

   ALTER TABLE orders
   ADD CONSTRAINT orders_status_check
   CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'return_requested', 'returned'));
   ```
3. Then continue with the rest of `create_missing_tables.sql`

## Verification

After running the migration, verify with:

```sql
-- Check orders table constraint
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.orders'::regclass
AND contype = 'c';

-- Should show:
-- orders_status_check | CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'return_requested', 'returned'))

-- Test inserting with return status
INSERT INTO orders (user_id, total_amount, status)
VALUES ('<test-user-id>', 0, 'return_requested');
-- Should succeed

-- Test invalid status
INSERT INTO orders (user_id, total_amount, status)
VALUES ('<test-user-id>', 0, 'invalid_status');
-- Should fail with constraint violation
```

## Files Updated

1. ✅ `scripts/create_missing_tables.sql` - Section 7 fixed
2. ✅ `scripts/supabase_migration.sql` - Orders table constraint updated

## Status: READY TO RUN

The SQL scripts are now ready. Run them in your Supabase SQL Editor in the order specified above.
