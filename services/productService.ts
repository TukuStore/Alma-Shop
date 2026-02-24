import { supabase } from '@/lib/supabase';
import type { Category, HeroSlider, Product, ProductFilter } from '@/types';

// ─── Categories ────────────────────────────────────
export async function fetchCategories(): Promise<Category[]> {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name');

        if (error) {
            console.warn('Supabase error fetching categories:', error.message);
            return [];
        }
        return data ?? [];
    } catch (err) {
        console.warn('Network error fetching categories:', err);
        return [];
    }
}

export async function fetchCategoryBySlug(slug: string): Promise<Category | null> {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) {
            console.warn('Supabase error fetching category by slug:', error.message);
            return null;
        }
        return data as Category;
    } catch (err) {
        console.warn('Network error fetching category by slug:', err);
        return null;
    }
}

// ─── Hero Sliders ────────────────────────────────────
export async function fetchHeroSliders(type?: 'home' | 'flash_sale', onlyActive: boolean = true): Promise<HeroSlider[]> {
    try {
        let query = supabase
            .from('hero_sliders')
            .select('*')
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: false });

        if (onlyActive) {
            query = query.eq('is_active', true);
        }

        if (type) {
            query = query.eq('type', type);
        }

        const { data, error } = await query;
        if (error) {
            console.warn('Supabase error fetching hero sliders:', error.message);
            return [];
        }
        return (data || []) as HeroSlider[];
    } catch (err) {
        console.warn('Network error fetching hero sliders:', err);
        return [];
    }
}

// ─── Products: Fetch All (with filters) ────────────
// Helper to generate a deterministic rating based on product ID
function getMockRating(id: string): number {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = ((hash << 5) - hash) + id.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }
    // Map to range 3.0 to 5.0
    const normalized = (Math.abs(hash) % 21) / 10 + 3.0; // 0..2.0 + 3.0 = 3.0..5.0
    return Math.round(normalized * 10) / 10;
}

export async function fetchProducts(filter?: Partial<ProductFilter>): Promise<Product[]> {
    let query = supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('is_active', true);

    if (filter?.categorySlug) {
        const { data: cat } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', filter.categorySlug)
            .single();

        if (cat) {
            query = query.eq('category_id', cat.id);
        }
    }

    if (filter?.search) {
        query = query.ilike('name', `%${filter.search}%`);
    }

    if (filter?.minPrice !== undefined && filter.minPrice > 0) {
        query = query.gte('price', filter.minPrice);
    }

    if (filter?.maxPrice !== undefined && filter.maxPrice > 0) {
        query = query.lte('price', filter.maxPrice);
    }

    if (filter?.material) {
        query = query.eq('material', filter.material);
    }

    // Sorting
    switch (filter?.sortBy) {
        case 'price_asc':
            query = query.order('price', { ascending: true });
            break;
        case 'price_desc':
            query = query.order('price', { ascending: false });
            break;
        case 'popular':
            query = query.order('is_featured', { ascending: false });
            break;
        case 'newest':
        default:
            query = query.order('created_at', { ascending: false });
            break;
    }

    // Pagination
    const page = filter?.page ?? 1;
    const limit = filter?.limit ?? 20;
    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    const { data, error } = await query;
    if (error) throw error;

    let products = (data as Product[]) ?? [];

    // Augment with mock rating
    products = products.map(p => ({
        ...p,
        rating: p.rating || getMockRating(p.id)
    }));

    // In-memory filtering for rating (since it's mocked)
    if (filter?.rating) {
        products = products.filter(p => (p.rating || 0) >= filter.rating!);
    }

    return products;
}

// ─── Products: Fetch by Category Slug ──────────────
export async function fetchProductsByCategory(slug: string): Promise<Product[]> {
    return fetchProducts({ categorySlug: slug });
}

// ─── Products: Fetch Featured ──────────────────────
export async function fetchFeaturedProducts(): Promise<Product[]> {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*, category:categories(*)')
            .eq('is_active', true)
            .eq('is_featured', true)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) {
            console.warn('Supabase error fetching featured products:', error.message);
            return [];
        }
        return (data as Product[]) ?? [];
    } catch (err) {
        console.warn('Network error fetching featured products:', err);
        return [];
    }
}

// ─── Products: Fetch by ID ─────────────────────────
export async function fetchProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data as Product | null;
}

// ─── Products: Fetch Reviews ───────────────────────
export async function fetchProductReviews(productId: string) {
    const { data: reviewsData, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

    if (error || !reviewsData || reviewsData.length === 0) {
        return [];
    }

    const userIds = [...new Set(reviewsData.map(r => r.user_id).filter(Boolean))];
    if (userIds.length > 0) {
        const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', userIds);

        const profilesMap = new Map();
        if (profilesData) {
            profilesData.forEach(p => profilesMap.set(p.id, p));
        }

        return reviewsData.map(r => ({
            ...r,
            user_name: profilesMap.get(r.user_id)?.full_name || 'Pembeli Rahasia',
            user_avatar: profilesMap.get(r.user_id)?.avatar_url || null
        }));
    }

    return reviewsData.map(r => ({
        ...r,
        user_name: 'Pembeli Rahasia',
        user_avatar: null
    }));
}

// ─── Products: Search ──────────────────────────────
export async function searchProducts(query: string): Promise<Product[]> {
    const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('is_active', true)
        .ilike('name', `%${query}%`)
        .order('name')
        .limit(20);

    if (error) throw error;
    return (data as Product[]) ?? [];
}

// ─── Dashboard Sections ────────────────────────────────

export async function fetchFlashDeals(): Promise<Product[]> {
    try {
        // For now, take random 5 products and mock 'sales' data
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .limit(20);

        if (error) throw error;

        return (data || []).map(p => ({
            ...p,
            original_price: Number(p.price) * 1.3, // Mock discount
            rating: 4.5 + Math.random() * 0.4,
            sold_count: Math.floor(Math.random() * 50) + 10,
            total_stock_for_deal: 100
        }));
    } catch (err) {
        console.warn('Error fetching flash deals:', err);
        return [];
    }
}



export async function fetchMostPopular(): Promise<Product[]> {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .order('price', { ascending: false }) // Expensive items as 'popular' for demo
            .limit(5);

        if (error) throw error;

        return (data || []).map(p => ({
            ...p,
            rating: 4.9,
            reviews_count: 100 + Math.floor(Math.random() * 500)
        }));
    } catch (err) {
        console.warn('Error fetching most popular:', err);
        return [];
    }
}

export async function fetchSpecialForYou(): Promise<Product[]> {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false }) // Newest
            .limit(10);

        if (error) throw error;

        return (data || []).map(p => ({
            ...p,
            rating: 4.7
        }));
    } catch (err) {
        console.warn('Error fetching special for you:', err);
        return [];
    }
}
