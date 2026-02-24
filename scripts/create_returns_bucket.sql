ALTER TABLE public.returns ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

INSERT INTO storage.buckets (id, name, public) 
VALUES ('returns', 'returns', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Acces TO returns bucket" ON storage.objects;
CREATE POLICY "Public Acces TO returns bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'returns');

DROP POLICY IF EXISTS "Auth Users Upload TO returns bucket" ON storage.objects;
CREATE POLICY "Auth Users Upload TO returns bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'returns');
