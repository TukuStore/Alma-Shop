-- ============================================================================
-- Fix RLS Policies for Admin Dashboards & Push Notifications
-- ============================================================================

-- Function to safely check if a user is an admin without triggering infinite recursion on `profiles`
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  is_admin_flag BOOLEAN;
BEGIN
  SELECT (role = 'admin') INTO is_admin_flag
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN coalesce(is_admin_flag, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Profiles: Admins can view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

-- 2. Notifications: Admins can insert notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can insert notifications" ON public.notifications;
CREATE POLICY "Admins can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (public.is_admin());

-- 3. Notifications: Admins can view notifications
DROP POLICY IF EXISTS "Admins can view notifications" ON public.notifications;
CREATE POLICY "Admins can view notifications" ON public.notifications
  FOR SELECT USING (public.is_admin());

-- 4. Push Tokens: Admins can view all tokens
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view all push tokens" ON public.push_tokens;
CREATE POLICY "Admins can view all push tokens" ON public.push_tokens
  FOR SELECT USING (public.is_admin());

-- 5. Push Tokens: Users can insert their own tokens
DROP POLICY IF EXISTS "Users can insert their own tokens" ON public.push_tokens;
CREATE POLICY "Users can insert their own tokens" ON public.push_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Push Tokens: Users can view their own tokens
DROP POLICY IF EXISTS "Users can view their own tokens" ON public.push_tokens;
CREATE POLICY "Users can view their own tokens" ON public.push_tokens
  FOR SELECT USING (auth.uid() = user_id);

-- 7. Push Tokens: Users can update their own tokens
DROP POLICY IF EXISTS "Users can update their own tokens" ON public.push_tokens;
CREATE POLICY "Users can update their own tokens" ON public.push_tokens
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 8. Push Tokens: Users can delete their own tokens
DROP POLICY IF EXISTS "Users can delete their own tokens" ON public.push_tokens;
CREATE POLICY "Users can delete their own tokens" ON public.push_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- 9. Notifications: Users can view their own notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

-- 10. Notifications: Users can update their own notifications
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

