-- ============================================================================
-- ALMASTORE - UPDATE CATEGORY IMAGES
-- ============================================================================
-- Update categories with actual image URLs (using renamed local assets)
-- ============================================================================

-- Update category images using renamed files
UPDATE public.categories
SET image_url = '/assets/images/category/sarung-tenun.png'
WHERE slug = 'sarung-tenun';

UPDATE public.categories
SET image_url = '/assets/images/category/sarung-wadimor.jpg'
WHERE slug = 'sarung-wadimor';

UPDATE public.categories
SET image_url = '/assets/images/category/sarung-gajah.jpg'
WHERE slug = 'sarung-gajah';

UPDATE public.categories
SET image_url = '/assets/images/category/sarung-mangga.jpg'
WHERE slug = 'sarung-mangga';

UPDATE public.categories
SET image_url = '/assets/images/category/sarung-atlas.jpg'
WHERE slug = 'sarung-atlas';

UPDATE public.categories
SET image_url = '/assets/images/category/sarung-hitam.jpg'
WHERE slug = 'sarung-hitam';

UPDATE public.categories
SET image_url = '/assets/images/category/sarung-putih.jpg'
WHERE slug = 'sarung-putih';

UPDATE public.categories
SET image_url = '/assets/images/category/sarung-motif.jpg'
WHERE slug = 'sarung-motif';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT
    name,
    slug,
    image_url
FROM public.categories
ORDER BY name;

-- ============================================================================
-- COMPLETE
-- ============================================================================
-- Category images updated to use renamed local assets
-- Files renamed to match category slugs:
-- - sarung-tenun.png
-- - sarung-wadimor.jpg
-- - sarung-gajah.jpg
-- - sarung-mangga.jpg
-- - sarung-atlas.jpg
-- - sarung-hitam.jpg
-- - sarung-putih.jpg
-- - sarung-motif.jpg
-- ============================================================================
