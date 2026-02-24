-- Add the 'type' column to hero_sliders to support separating home and flash sale banners
ALTER TABLE public.hero_sliders 
ADD COLUMN type TEXT NOT NULL DEFAULT 'home' 
CHECK (type IN ('home', 'flash_sale'));

-- Reload PostgREST schema cache so the API recognizes the new column
NOTIFY pgrst, 'reload schema';
