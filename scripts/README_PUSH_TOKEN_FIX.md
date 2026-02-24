# Fix Push Token Error

## Masalah
```
Error: "new row violates row-level security policy (USING expression) for table 'push_tokens'"
```

## Solusi

### 1. Buka Supabase SQL Editor
https://supabase.com/dashboard/project/fhkzfwebhcyxhrnojwra/sql/new

### 2. Copy & Run SQL Ini

```sql
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'push_tokens'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.push_tokens', policy_record.policyname);
    END LOOP;
END $$;

CREATE POLICY "Users can insert their own tokens" ON public.push_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own tokens" ON public.push_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens" ON public.push_tokens
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tokens" ON public.push_tokens
  FOR DELETE USING (auth.uid() = user_id);
```

### 3. Klik RUN

### 4. Close & Buka App Lagi

## Expected Result
Setelah RUN, harus ada **4 policies**:
- Users can insert their own tokens (INSERT)
- Users can view their own tokens (SELECT)
- Users can update their own tokens (UPDATE)
- Users can delete their own tokens (DELETE)
