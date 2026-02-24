-- 1. Create the product-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create the hero-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('hero-images', 'hero-images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Set up RLS for product-images (Using unique policy names)
CREATE POLICY "Public Access Products" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'product-images' );

CREATE POLICY "Auth Upload Products" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'product-images' AND auth.role() = 'authenticated' );

CREATE POLICY "Auth Update Products" 
ON storage.objects FOR UPDATE 
USING ( bucket_id = 'product-images' AND auth.role() = 'authenticated' );

CREATE POLICY "Auth Delete Products" 
ON storage.objects FOR DELETE 
USING ( bucket_id = 'product-images' AND auth.role() = 'authenticated' );

-- 4. Set up RLS for hero-images (Using unique policy names)
CREATE POLICY "Public Access Heroes" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'hero-images' );

CREATE POLICY "Auth Upload Heroes" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'hero-images' AND auth.role() = 'authenticated' );

CREATE POLICY "Auth Update Heroes" 
ON storage.objects FOR UPDATE 
USING ( bucket_id = 'hero-images' AND auth.role() = 'authenticated' );

CREATE POLICY "Auth Delete Heroes" 
ON storage.objects FOR DELETE 
USING ( bucket_id = 'hero-images' AND auth.role() = 'authenticated' );
