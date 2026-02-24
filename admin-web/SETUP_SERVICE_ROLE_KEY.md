# Setup Service Role Key for Admin Operations

## Why do we need Service Role Key?

The admin web application needs to perform operations that bypass Row Level Security (RLS) policies in Supabase, such as:
- Deleting products (which checks admin permissions via RLS)
- Deleting all products at once

## How to get Service Role Key

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (fhkzfwebhcyxhrnojwra)
3. Go to **Settings** → **API**
4. Scroll down to **Project API keys**
5. Copy the **service_role** key (starts with `eyJ...`)

## Add to .env.local

Add the service role key to your `.env.local` file:

```bash
VITE_SUPABASE_URL=https://fhkzfwebhcyxhrnojwra.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...paste-here
```

**Important**: Replace `your-service-role-key-here` with the actual service role key from Supabase.

## Important Security Notes

⚠️ **NEVER commit the service role key to Git!**

The service role key:
- Bypasses all RLS policies
- Has full admin access to your database
- Should ONLY be used in trusted admin interfaces

The `.env.local` file is already in `.gitignore`, so your key is safe.

## Restart Development Server

After adding the key, restart your dev server:

```bash
npm run dev
```

## Troubleshooting

### Warning: "Multiple GoTrueClient instances detected"

This warning appears if the service role key is not set or set to the placeholder value `your-service-role-key-here`.

**Solution**: Make sure you've replaced `your-service-role-key-here` with the actual service role key from Supabase Dashboard.

### Delete operations still don't work

1. Check that `VITE_SUPABASE_SERVICE_ROLE_KEY` is set correctly (not the placeholder)
2. Restart the dev server to load new environment variables
3. Check browser console for errors
4. Verify RLS policies in Supabase SQL Editor:

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Check existing policies
SELECT * FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'products';
```

## How it Works

The code now uses two Supabase clients:

1. **`supabase`** (lib/supabase.ts) - Regular client with anon key
   - Used for read operations
   - Respects RLS policies
   - Used for general queries

2. **`supabaseAdmin`** (lib/supabaseAdmin.ts) - Admin client with service role key
   - Only used for delete operations
   - Bypasses RLS policies
   - Only created if service role key is properly configured
   - Falls back to regular client if service role key is not set

This approach prevents the "Multiple GoTrueClient instances" warning when the service role key is properly configured.
