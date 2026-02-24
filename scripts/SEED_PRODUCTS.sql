-- ============================================================================
-- ALMASTORE - SEED PRODUCTS DATA
-- ============================================================================
-- Run this AFTER MASTER_MIGRATION.sql to populate products with sample data
-- Uses local product images from /assets/images/products/
-- ============================================================================

-- First, let's get all category IDs
DO $$
DECLARE
    v_category_id UUID;
BEGIN
    -- Get Sarung Tenun category
    SELECT id INTO v_category_id FROM public.categories WHERE slug = 'sarung-tenun' LIMIT 1;
    IF v_category_id IS NOT NULL THEN
        INSERT INTO public.products (name, description, price, stock, category_id, material, images, is_featured, is_active)
        VALUES
        ('Sarung Tenun Premium Hitam', 'Sarung tenun premium dengan motif tradisional khas. Bahan katun berkualitas tinggi, nyaman dipakai dan awet.', 150000, 50, v_category_id, 'Katun Tenun', ARRAY['/assets/images/products/sarung-1.jpg'], true, true),
        ('Sarung Tenun Premium Coklat', 'Sarung tenun dengan motif coklat elegan. Cocok untuk penggunaan sehari-hari maupun acara formal.', 145000, 45, v_category_id, 'Katun Tenun', ARRAY['/assets/images/products/sarung-2.jpg'], false, true),
        ('Sarung Tenun Classic Motif', 'Sarung tenun dengan motif klasik yang timeless. Bahan adem dan menyerap keringat.', 135000, 60, v_category_id, 'Katun Tenun', ARRAY['/assets/images/products/sarung-3.jpg'], false, true)
        ON CONFLICT DO NOTHING;
    END IF;

    -- Get Sarung Wadimor category
    SELECT id INTO v_category_id FROM public.categories WHERE slug = 'sarung-wadimor' LIMIT 1;
    IF v_category_id IS NOT NULL THEN
        INSERT INTO public.products (name, description, price, stock, category_id, material, images, is_featured, is_active)
        VALUES
        ('Sarung Wadimor Hitam Elegan', 'Sarung Wadimor Original dengan motif hitam elegan. Brand terkenal dengan kualitas terjamin.', 95000, 100, v_category_id, 'Polyester', ARRAY['/assets/images/products/sarung-1.jpg'], true, true),
        ('Sarung Wadimor Motif Modern', 'Sarung Wadimor dengan motif modern yang trendy. Tahan lama dan tidak mudah luntur.', 98000, 80, v_category_id, 'Polyester', ARRAY['/assets/images/products/sarung-2.jpg'], false, true),
        ('Sarung Wadimor Classic Brown', 'Sarung Wadimor warna coklat klasik. Favorit untuk penggunaan harian.', 89000, 90, v_category_id, 'Polyester', ARRAY['/assets/images/products/sarung-3.jpg'], false, true)
        ON CONFLICT DO NOTHING;
    END IF;

    -- Get Sarung Gajah category
    SELECT id INTO v_category_id FROM public.categories WHERE slug = 'sarung-gajah' LIMIT 1;
    IF v_category_id IS NOT NULL THEN
        INSERT INTO public.products (name, description, price, stock, category_id, material, images, is_featured, is_active)
        VALUES
        ('Sarung Gajah Duduk Premium', 'Sarung Gajah Duduk dengan kualitas premium. Motif tradisional yang sangat dicari.', 175000, 40, v_category_id, 'Katun Primisima', ARRAY['/assets/images/products/sarung-1.jpg'], true, true),
        ('Sarung Gajah Hitam Manis', 'Sarung Gajah warna hitam dengan kombinasi motif yang menawan. Sangat elegan.', 165000, 35, v_category_id, 'Katun Primisima', ARRAY['/assets/images/products/sarung-2.jpg'], false, true),
        ('Sarung Gajah Motif Laris', 'Sarung Gajah dengan motif laris dipasaran. Kualitas export dengan harga terjangkau.', 155000, 55, v_category_id, 'Katun Primisima', ARRAY['/assets/images/products/sarung-3.jpg'], false, true)
        ON CONFLICT DO NOTHING;
    END IF;

    -- Get Sarung Mangga category
    SELECT id INTO v_category_id FROM public.categories WHERE slug = 'sarung-mangga' LIMIT 1;
    IF v_category_id IS NOT NULL THEN
        INSERT INTO public.products (name, description, price, stock, category_id, material, images, is_featured, is_active)
        VALUES
        ('Sarung Mangga Gold Series', 'Sarung Mangga dari seri Gold dengan kualitas terbaik. Motif eksklusif dan limited edition.', 125000, 70, v_category_id, 'Katun', ARRAY['/assets/images/products/sarung-1.jpg'], true, true),
        ('Sarung Mangga Silver Edition', 'Sarung Mangga Silver Edition dengan motif elegan. Pilihan tepat untuk kado.', 115000, 65, v_category_id, 'Katun', ARRAY['/assets/images/products/sarung-2.jpg'], false, true),
        ('Sarung Mangga Classic', 'Sarung Mangga classic dengan motif tradisional. Awet dan tahan lama.', 105000, 85, v_category_id, 'Katun', ARRAY['/assets/images/products/sarung-3.jpg'], false, true)
        ON CONFLICT DO NOTHING;
    END IF;

    -- Get Sarung Atlas category
    SELECT id INTO v_category_id FROM public.categories WHERE slug = 'sarung-atlas' LIMIT 1;
    IF v_category_id IS NOT NULL THEN
        INSERT INTO public.products (name, description, price, stock, category_id, material, images, is_featured, is_active)
        VALUES
        ('Sarung Atlas Premium Quality', 'Sarung Atlas dengan kualitas premium. Brand ternama dengan jaminan kualitas.', 185000, 45, v_category_id, 'Katun Japan', ARRAY['/assets/images/products/sarung-1.jpg'], true, true),
        ('Sarung Atlas Flower Motif', 'Sarung Atlas dengan motif bunga yang cantik. Desain modern dan elegan.', 175000, 40, v_category_id, 'Katun Japan', ARRAY['/assets/images/products/sarung-2.jpg'], false, true),
        ('Sarung Atlas Exclusive Series', 'Sarung Atlas dari seri eksklusif. Limited edition dengan motif unik.', 195000, 30, v_category_id, 'Katun Japan', ARRAY['/assets/images/products/sarung-3.jpg'], false, true)
        ON CONFLICT DO NOTHING;
    END IF;

    -- Get Sarung Hitam category
    SELECT id INTO v_category_id FROM public.categories WHERE slug = 'sarung-hitam' LIMIT 1;
    IF v_category_id IS NOT NULL THEN
        INSERT INTO public.products (name, description, price, stock, category_id, material, images, is_featured, is_active)
        VALUES
        ('Sarung Hitam Wadimor Original', 'Sarung hitam Wadimor original. Paling laris dan paling dicari!', 99000, 120, v_category_id, 'Polyester', ARRAY['/assets/images/products/sarung-1.jpg'], true, true),
        ('Sarung Hitam Gajah Duduk', 'Sarung hitam Gajah Duduk dengan kombinasi motif yang elegan.', 169000, 75, v_category_id, 'Katun Primisima', ARRAY['/assets/images/products/sarung-2.jpg'], false, true),
        ('Sarung Hitam Atlas', 'Sarung hitam Atlas dengan kualitas premium. Pilihan para profesional.', 189000, 60, v_category_id, 'Katun Japan', ARRAY['/assets/images/products/sarung-3.jpg'], false, true),
        ('Sarung Hitam Mangga Gold', 'Sarung hitam Mangga dari seri Gold. Kualitas terjamin.', 129000, 85, v_category_id, 'Katun', ARRAY['/assets/images/products/sarung-1.jpg'], false, true)
        ON CONFLICT DO NOTHING;
    END IF;

    -- Get Sarung Putih category
    SELECT id INTO v_category_id FROM public.categories WHERE slug = 'sarung-putih' LIMIT 1;
    IF v_category_id IS NOT NULL THEN
        INSERT INTO public.products (name, description, price, stock, category_id, material, images, is_featured, is_active)
        VALUES
        ('Sarung Putih Wadimor Clean', 'Sarung putih Wadimor dengan warna putih bersih. Cocok untuk daily wear.', 95000, 95, v_category_id, 'Polyester', ARRAY['/assets/images/products/sarung-2.jpg'], true, true),
        ('Sarung Putih Gajah Premium', 'Sarung putih Gajah dengan kualitas premium. Nyaman dan elegan.', 165000, 50, v_category_id, 'Katun Primisima', ARRAY['/assets/images/products/sarung-3.jpg'], false, true),
        ('Sarung Putih Atlas Pure', 'Sarung putih Atlas dengan warna putih murni. Kualitas export.', 179000, 45, v_category_id, 'Katun Japan', ARRAY['/assets/images/products/sarung-1.jpg'], false, true)
        ON CONFLICT DO NOTHING;
    END IF;

    -- Get Sarung Motif category
    SELECT id INTO v_category_id FROM public.categories WHERE slug = 'sarung-motif' LIMIT 1;
    IF v_category_id IS NOT NULL THEN
        INSERT INTO public.products (name, description, price, stock, category_id, material, images, is_featured, is_active)
        VALUES
        ('Sarung Motif Modern Wadimor', 'Koleksi sarung motif modern dari Wadimor. Desain trendy dan up-to-date.', 105000, 80, v_category_id, 'Polyester', ARRAY['/assets/images/products/sarung-2.jpg'], true, true),
        ('Sarung Motif Tradisional Gajah', 'Sarung motif tradisional khas dari Gajah Duduk. Nilai seni tinggi.', 175000, 40, v_category_id, 'Katun Primisima', ARRAY['/assets/images/products/sarung-3.jpg'], false, true),
        ('Sarung Motif Eksklusif Atlas', 'Sarung motif eksklusif dari Atlas. Limited edition dengan desain unik.', 199000, 35, v_category_id, 'Katun Japan', ARRAY['/assets/images/products/sarung-1.jpg'], false, true),
        ('Sarung Motif Kombinasi Mangga', 'Sarung motif kombinasi modern dari Mangga. Warna dan motif yang menarik.', 135000, 60, v_category_id, 'Katun', ARRAY['/assets/images/products/sarung-2.jpg'], false, true)
        ON CONFLICT DO NOTHING;
    END IF;

    RAISE NOTICE 'Products seeded successfully for all categories!';
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Show products per category
SELECT
    c.name as category,
    COUNT(p.id) as product_count,
    SUM(CASE WHEN p.is_featured = true THEN 1 ELSE 0 END) as featured_count,
    MIN(p.price) as min_price,
    MAX(p.price) as max_price
FROM public.categories c
LEFT JOIN public.products p ON c.id = p.category_id
GROUP BY c.name, c.id
ORDER BY c.name;

-- Show total products
SELECT COUNT(*) as total_products FROM public.products;

-- Show featured products
SELECT
    p.name,
    p.price,
    p.stock,
    c.name as category,
    p.images[1] as image_url
FROM public.products p
JOIN public.categories c ON p.category_id = c.id
WHERE p.is_featured = true
ORDER BY c.name, p.name;

-- ============================================================================
-- SEED COMPLETE
-- ============================================================================
-- You now have 26 products across 8 categories
-- Each category has 3-4 products with various price points
-- All products use local images from /assets/images/products/
-- ============================================================================
