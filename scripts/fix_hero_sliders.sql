-- Comprehensive Fix for hero_sliders and storage
-- 1. Ensure bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('hero-images', 'hero-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Add 'type' column if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='hero_sliders' AND column_name='type') THEN
        ALTER TABLE public.hero_sliders ADD COLUMN type TEXT NOT NULL DEFAULT 'home';
    END IF;
END $$;

-- 3. Fix RLS policies for hero_sliders (profiles link)
ALTER TABLE public.hero_sliders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view hero sliders" ON public.hero_sliders;
CREATE POLICY "Public can view hero sliders" 
    ON public.hero_sliders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can insert hero sliders" ON public.hero_sliders;
CREATE POLICY "Admin can insert hero sliders" 
    ON public.hero_sliders FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admin can update hero sliders" ON public.hero_sliders;
CREATE POLICY "Admin can update hero sliders" 
    ON public.hero_sliders FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admin can delete hero sliders" ON public.hero_sliders;
CREATE POLICY "Admin can delete hero sliders" 
    ON public.hero_sliders FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
        )
    );

-- 4. Fix Storage Policies for 'hero-images'
DROP POLICY IF EXISTS "Public can read hero images" ON storage.objects;
CREATE POLICY "Public can read hero images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'hero-images');

DROP POLICY IF EXISTS "Admin can insert hero images" ON storage.objects;
CREATE POLICY "Admin can insert hero images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'hero-images' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admin can update hero images" ON storage.objects;
CREATE POLICY "Admin can update hero images"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'hero-images' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admin can delete hero images" ON storage.objects;
CREATE POLICY "Admin can delete hero images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'hero-images' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
        )
    );
