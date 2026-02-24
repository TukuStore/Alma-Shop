-- 1. Add physical columns to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 2) DEFAULT 0.0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sold_count INTEGER DEFAULT 0;

-- 2. Trigger for Review Stats Update
CREATE OR REPLACE FUNCTION update_product_review_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE public.products
        SET 
            reviews_count = (SELECT count(*) FROM public.reviews WHERE product_id = NEW.product_id),
            rating = (SELECT COALESCE(avg(rating), 0.0) FROM public.reviews WHERE product_id = NEW.product_id)
        WHERE id = NEW.product_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.products
        SET 
            reviews_count = (SELECT count(*) FROM public.reviews WHERE product_id = OLD.product_id),
            rating = (SELECT COALESCE(avg(rating), 0.0) FROM public.reviews WHERE product_id = OLD.product_id)
        WHERE id = OLD.product_id;
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_product_review_stats ON public.reviews;
CREATE TRIGGER trigger_update_product_review_stats
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION update_product_review_stats();

-- 3. Trigger for Sold Count Update on Orders
CREATE OR REPLACE FUNCTION update_product_sold_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND NEW.status::text = 'COMPLETED' AND OLD.status::text != 'COMPLETED' THEN
        -- Increase sold_count for all matched order_items
        UPDATE public.products p
        SET sold_count = p.sold_count + i.quantity
        FROM public.order_items i
        WHERE i.order_id = NEW.id AND p.id = i.product_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_product_sold_count ON public.orders;
CREATE TRIGGER trigger_update_product_sold_count
AFTER UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION update_product_sold_count();

-- 4. Initial Sync (Backfill existing data)
UPDATE public.products p
SET 
    reviews_count = (SELECT count(*) FROM public.reviews r WHERE r.product_id = p.id),
    rating = (SELECT COALESCE(avg(rating), 0.0) FROM public.reviews r WHERE r.product_id = p.id),
    sold_count = COALESCE((
        SELECT sum(oi.quantity) 
        FROM public.order_items oi 
        JOIN public.orders o ON o.id = oi.order_id 
        WHERE oi.product_id = p.id AND o.status::text = 'COMPLETED'
    ), 0);
