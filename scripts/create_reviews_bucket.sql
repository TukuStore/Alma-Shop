-- Setup 'reviews' bucket in Supabase Storage

INSERT INTO storage.buckets (id, name, public) 
VALUES ('reviews', 'reviews', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow anyone to read review images
DROP POLICY IF EXISTS "Public Acces TO reviews bucket" ON storage.objects;
CREATE POLICY "Public Acces TO reviews bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'reviews');

-- Policy to allow authenticated users to upload review images
DROP POLICY IF EXISTS "Auth Users Upload TO reviews bucket" ON storage.objects;
CREATE POLICY "Auth Users Upload TO reviews bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'reviews');
