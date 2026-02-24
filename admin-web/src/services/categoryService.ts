import { supabase } from '../lib/supabase';
import type { Category } from '../types';

export async function getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
    if (error) throw error;
    return (data as Category[]) ?? [];
}

export async function updateCategory(
    id: string,
    input: { name?: string; description?: string; image_url?: string }
): Promise<Category> {
    const { data, error } = await supabase
        .from('categories')
        .update(input)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data as Category;
}

export async function uploadCategoryImage(file: File, categoryId: string): Promise<string> {
    const ext = file.name.split('.').pop();
    const path = `categories/${categoryId}.${ext}`;
    const { error } = await supabase.storage
        .from('product-images')
        .upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from('product-images').getPublicUrl(path);
    return data.publicUrl;
}
