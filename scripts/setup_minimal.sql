-- ============================================================================
-- ALMA - MINIMAL SETUP (Cuma Tabel & RLS)
-- ============================================================================
-- Run ini dulu, kalau sukses baru lanjut
-- ============================================================================

-- Step 1: Tambah kolom data di tabel notifications
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS data JSONB;

-- Step 2: Buat tabel push_tokens
CREATE TABLE IF NOT EXISTS public.push_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
    device_info JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- Step 3: Indexes
CREATE INDEX IF NOT EXISTS idx_push_tokens_user ON public.push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_token ON public.push_tokens(token);

-- Step 4: Enable RLS
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;

-- Step 5: RLS Policies (DROP IF EXISTS dulu biar gak error)
DROP POLICY IF EXISTS "Users can view own tokens" ON public.push_tokens;
CREATE POLICY "Users can view own tokens" ON public.push_tokens
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own tokens" ON public.push_tokens;
CREATE POLICY "Users can insert own tokens" ON public.push_tokens
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own tokens" ON public.push_tokens;
CREATE POLICY "Users can update own tokens" ON public.push_tokens
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own tokens" ON public.push_tokens;
CREATE POLICY "Users can delete own tokens" ON public.push_tokens
    FOR DELETE USING (auth.uid() = user_id);

-- SELESAI! Cek dengan query ini:
SELECT table_name FROM information_schema.tables WHERE table_name = 'push_tokens';
