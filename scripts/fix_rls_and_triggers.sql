-- 1. Update the handle_new_user trigger to create wallet and reward_points automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Create Profile
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');

  -- Create Wallet (if not exists)
  INSERT INTO public.wallets (user_id, balance)
  VALUES (new.id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Create Reward Points (if not exists)
  INSERT INTO public.reward_points (user_id, points)
  VALUES (new.id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
END;
$$;

-- 2. Add INSERT policies for wallets and reward_points (to allow manual repair/backfill from client if needed)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'wallets' AND policyname = 'Users can insert own wallet'
    ) THEN
        CREATE POLICY "Users can insert own wallet" ON public.wallets FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'reward_points' AND policyname = 'Users can insert own reward_points'
    ) THEN
        CREATE POLICY "Users can insert own reward_points" ON public.reward_points FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END
$$;

-- 3. Backfill missing wallets and reward_points for existing users
INSERT INTO public.wallets (user_id, balance)
SELECT id, 0 FROM public.profiles
WHERE id NOT IN (SELECT user_id FROM public.wallets);

INSERT INTO public.reward_points (user_id, points)
SELECT id, 0 FROM public.profiles
WHERE id NOT IN (SELECT user_id FROM public.reward_points);
