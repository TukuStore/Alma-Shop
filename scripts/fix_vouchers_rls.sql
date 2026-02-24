-- Fix Vouchers RLS Policies for Admin CRUD
-- Allows admin to fully manage vouchers (INSERT, UPDATE, DELETE)

-- 1. Vouchers: Keep everyone can view
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;

-- viewable by everyone (already exists, recreate to be safe)
DROP POLICY IF EXISTS "Vouchers are viewable by everyone" ON public.vouchers;
CREATE POLICY "Vouchers are viewable by everyone" ON public.vouchers
  FOR SELECT USING (true);

-- Admin can create vouchers
DROP POLICY IF EXISTS "Admins can insert vouchers" ON public.vouchers;
CREATE POLICY "Admins can insert vouchers" ON public.vouchers
  FOR INSERT WITH CHECK (public.is_admin());

-- Admin can update vouchers
DROP POLICY IF EXISTS "Admins can update vouchers" ON public.vouchers;
CREATE POLICY "Admins can update vouchers" ON public.vouchers
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Admin can delete vouchers
DROP POLICY IF EXISTS "Admins can delete vouchers" ON public.vouchers;
CREATE POLICY "Admins can delete vouchers" ON public.vouchers
  FOR DELETE USING (public.is_admin());

-- Verify
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'vouchers'
ORDER BY policyname;
