-- --------------------------------------------------------
-- TABLE: hero_sliders
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hero_sliders (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title       TEXT NOT NULL,
    subtitle    TEXT,
    cta_text    TEXT,
    cta_link    TEXT,
    image_url   TEXT NOT NULL,
    is_active   BOOLEAN NOT NULL DEFAULT true,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for updated_at
CREATE TRIGGER set_updated_at_hero_sliders
    BEFORE UPDATE ON public.hero_sliders
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Enable RLS
ALTER TABLE public.hero_sliders ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------
-- RLS POLICIES FOR hero_sliders
-- --------------------------------------------------------

-- Policy: Anyone can read active or all sliders (public readable)
CREATE POLICY "Public can view hero sliders" 
    ON public.hero_sliders 
    FOR SELECT 
    USING (true);

-- Policy: Admin can insert
CREATE POLICY "Admin can insert hero sliders" 
    ON public.hero_sliders 
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.user_id = auth.uid()
              AND profiles.role = 'admin'
        )
    );

-- Policy: Admin can update
CREATE POLICY "Admin can update hero sliders" 
    ON public.hero_sliders 
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.user_id = auth.uid()
              AND profiles.role = 'admin'
        )
    );

-- Policy: Admin can delete
CREATE POLICY "Admin can delete hero sliders" 
    ON public.hero_sliders 
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.user_id = auth.uid()
              AND profiles.role = 'admin'
        )
    );

-- --------------------------------------------------------
-- STORAGE BUCKET: hero-images
-- --------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) 
VALUES ('hero-images', 'hero-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for 'hero-images'

-- Public can read images
CREATE POLICY "Public can read hero images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'hero-images');

-- Admin can insert images
CREATE POLICY "Admin can insert hero images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'hero-images' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.user_id = auth.uid()
              AND profiles.role = 'admin'
        )
    );

-- Admin can update images
CREATE POLICY "Admin can update hero images"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'hero-images' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.user_id = auth.uid()
              AND profiles.role = 'admin'
        )
    );

-- Admin can delete images
CREATE POLICY "Admin can delete hero images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'hero-images' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.user_id = auth.uid()
              AND profiles.role = 'admin'
        )
    );
