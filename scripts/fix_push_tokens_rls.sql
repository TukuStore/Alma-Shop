-- ============================================================================
-- FIX: Push Token RLS Error
-- ============================================================================
-- Link: https://supabase.com/dashboard/project/fhkzfwebhcyxhrnojwra/sql/new
-- ============================================================================

-- Drop semua policy lama
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

-- Buat policy baru
CREATE POLICY "Users can insert their own tokens" ON public.push_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own tokens" ON public.push_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens" ON public.push_tokens
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tokens" ON public.push_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- Verifikasi
SELECT policyname, cmd FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'push_tokens'
ORDER BY policyname;
