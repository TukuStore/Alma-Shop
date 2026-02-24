import { supabase } from '../lib/supabase';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import type { Product } from '../types';

export type CreateProductInput = {
    name: string;
    description?: string;
    price: number;
    original_price?: number;
    stock: number;
    category_id: string;
    material?: string;
    images: string[];
    is_featured: boolean;
    is_active: boolean;
};

export async function getProducts(filters?: {
    search?: string;
    category_id?: string;
    is_active?: boolean;
    page?: number;
    limit?: number;
}): Promise<{ data: Product[]; count: number }> {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const from = (page - 1) * limit;

    let query = supabase
        .from('products')
        .select('*, category:categories(id, name, slug)', { count: 'exact' });

    if (filters?.search) query = query.ilike('name', `%${filters.search}%`);
    if (filters?.category_id) query = query.eq('category_id', filters.category_id);
    if (filters?.is_active !== undefined) query = query.eq('is_active', filters.is_active);

    query = query.order('created_at', { ascending: false }).range(from, from + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: (data as Product[]) ?? [], count: count ?? 0 };
}

export async function getProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('id', id)
        .single();
    if (error) throw error;
    return data as Product | null;
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
    const { data, error } = await supabase
        .from('products')
        .insert(input)
        .select()
        .single();
    if (error) throw error;
    return data as Product;
}

export async function updateProduct(id: string, input: Partial<CreateProductInput>): Promise<Product> {
    const { data, error } = await supabase
        .from('products')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data as Product;
}

export async function deleteProduct(id: string): Promise<void> {
    const client = supabaseAdmin || supabase;

    // Fetch product to get images before we try deleting
    const { data: product } = await client
        .from('products')
        .select('images')
        .eq('id', id)
        .single();

    // 1. Attempt to hard delete from database FIRST
    const { error } = await client
        .from('products')
        .delete()
        .eq('id', id);

    if (error) {
        // 23503 = foreign_key_violation in Postgres
        if (error.code === '23503') {
            // Fallback to soft delete
            const { error: softError } = await client
                .from('products')
                .update({ is_active: false })
                .eq('id', id);

            if (softError) throw softError;
            throw new Error('Product is linked to existing orders. It has been deactivated instead to preserve order history.');
        }
        console.error('Delete product error:', error);
        throw error;
    }

    // 2. Only if DB deletion succeeds, delete images from storage
    if (product?.images) {
        for (const imageUrl of product.images) {
            try {
                await deleteProductImage(imageUrl);
            } catch (err) {
                console.warn('Failed to delete image:', imageUrl, err);
            }
        }
    }
}

export async function deleteAllProducts(): Promise<void> {
    const client = supabaseAdmin || supabase;

    // Get all products
    const { data: products, error: fetchError } = await client
        .from('products')
        .select('id, images');

    if (fetchError) throw fetchError;
    if (!products || products.length === 0) return;

    // Delete all products from database (UUID > 0)
    const { error } = await client
        .from('products')
        .delete()
        .gte('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
        // If there's an FK violation, we cannot bulk 'hard delete' everything simply.
        if (error.code === '23503') {
            // Soft delete all active products instead
            const { error: softError } = await client
                .from('products')
                .update({ is_active: false })
                .neq('is_active', false);

            if (softError) throw softError;
            throw new Error('Some products are linked to orders and cannot be deleted. All products have been deactivated instead.');
        }
        throw error;
    }

    // Only if DB deletion succeeds, delete all associated images from storage
    for (const product of products) {
        if (product.images) {
            for (const imageUrl of product.images) {
                try {
                    await deleteProductImage(imageUrl);
                } catch (err) {
                    console.warn('Failed to delete image:', imageUrl, err);
                }
            }
        }
    }
}

export async function uploadProductImage(
    file: File,
    productId: string
): Promise<string> {
    const ext = file.name.split('.').pop();
    const path = `${productId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
        .from('product-images')
        .upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from('product-images').getPublicUrl(path);
    return data.publicUrl;
}

export async function deleteProductImage(url: string): Promise<void> {
    const path = url.split('/product-images/')[1];
    if (!path) return;
    await supabase.storage.from('product-images').remove([path]);
}
