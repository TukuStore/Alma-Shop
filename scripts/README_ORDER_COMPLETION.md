# Order Completion Flow — Supabase Setup Guide

## Overview
This guide covers the Supabase-side setup for the Order Completion flow:
- **SQL Migration** — Updates `orders` table schema  
- **Edge Function** — `auto-complete-orders` for daily auto-completion  
- **Cron Job** — Triggers the Edge Function every day at 00:00 UTC  

---

## Step 1: Run the SQL Migration

1. Open the **Supabase Dashboard** → SQL Editor
2. Paste the contents of `scripts/migrate_order_completion.sql`
3. Click **Run**
4. Verify the output shows:
   - `shipped_at` column exists with type `timestamp with time zone`
   - The CHECK constraint includes `completed` (not `delivered`)
   - Any previously `delivered` orders are now `completed`

---

## Step 2: Deploy the Edge Function

Run the following command from the project root:

```bash
supabase functions deploy auto-complete-orders --project-ref fhkzfwebhcyxhrnojwra
```

### Set the CRON_SECRET (optional but recommended)

```bash
supabase secrets set CRON_SECRET=your-secure-cron-secret-here --project-ref fhkzfwebhcyxhrnojwra
```

---

## Step 3: Set Up the Cron Job

### Option A: Supabase Dashboard (Recommended)

1. Go to **Supabase Dashboard** → **Database** → **Extensions**
2. Enable the `pg_cron` extension if not already enabled
3. Go to **SQL Editor** and run:

```sql
-- Create the cron job to run daily at midnight UTC
SELECT cron.schedule(
    'auto-complete-shipped-orders',    -- job name
    '0 0 * * *',                        -- cron schedule: daily at 00:00 UTC
    $$
    SELECT net.http_post(
        url := 'https://fhkzfwebhcyxhrnojwra.supabase.co/functions/v1/auto-complete-orders',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
        ),
        body := '{}'::jsonb
    ) AS request_id;
    $$
);
```

### Option B: Using pg_cron with direct SQL (no Edge Function)

If you prefer to skip the Edge Function and run the logic directly in PostgreSQL:

```sql
-- Enable pg_cron and pg_net extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
    'auto-complete-shipped-orders',
    '0 0 * * *',
    $$
    -- Auto-complete orders shipped more than 3 days ago
    WITH completed_orders AS (
        UPDATE public.orders
        SET status = 'completed', updated_at = NOW()
        WHERE status = 'shipped'
          AND shipped_at <= NOW() - INTERVAL '3 days'
        RETURNING id, user_id
    )
    INSERT INTO public.notifications (user_id, type, title, message, action_url, is_read)
    SELECT
        user_id,
        'order',
        'Pesanan Selesai Otomatis',
        'Pesanan #' || UPPER(LEFT(id::text, 8)) || ' telah selesai secara otomatis setelah 3 hari.',
        '/orders/' || id,
        false
    FROM completed_orders;
    $$
);
```

---

## Step 4: Verify the Cron Job

```sql
-- List all scheduled cron jobs
SELECT jobid, schedule, command, jobname FROM cron.job;

-- Check recent cron job execution history
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

---

## Step 5: Manual Testing

You can manually trigger the Edge Function to test:

```bash
curl -X POST \
  'https://fhkzfwebhcyxhrnojwra.supabase.co/functions/v1/auto-complete-orders' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json'
```

---

## Status Flow (Updated)

```
PENDING → PAID → PROCESSING → SHIPPED → COMPLETED
                                  ↓             ↓
                              (3 days)    (User clicks
                               auto       "Pesanan Selesai")
                              complete
```

- `SHIPPED` → User can click **"Pesanan Selesai"** to mark as `COMPLETED`
- If user forgets, the cron job auto-completes after **3 days** from `shipped_at`
- Once `COMPLETED`, user can leave a **review** ("Beri Ulasan")
