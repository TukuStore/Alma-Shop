import { supabase } from '../lib/supabase';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import type { HeroSlider } from '../types';

export type CreateHeroSliderInput = {
    title: string;
    subtitle?: string | null;
    cta_text?: string | null;
    cta_link?: string | null;
    image_url: string;
    is_active: boolean;
    sort_order: number;
};

export async function getHeroSliders(): Promise<HeroSlider[]> {
    const { data, error } = await supabase
        .from('hero_sliders')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as HeroSlider[];
}

export async function getHeroSliderById(id: string): Promise<HeroSlider | null> {
    const { data, error } = await supabase
        .from('hero_sliders')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data as HeroSlider;
}

export async function createHeroSlider(input: CreateHeroSliderInput): Promise<HeroSlider> {
    const { data, error } = await supabase
        .from('hero_sliders')
        .insert(input)
        .select()
        .single();

    if (error) throw error;
    return data as HeroSlider;
}

export async function updateHeroSlider(id: string, input: Partial<CreateHeroSliderInput>): Promise<HeroSlider> {
    const { data, error } = await supabase
        .from('hero_sliders')
        .update(input)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as HeroSlider;
}

export async function deleteHeroSlider(id: string): Promise<void> {
    const client = supabaseAdmin || supabase;

    // Fetch the slider to get the image URL
    const { data: slider } = await client
        .from('hero_sliders')
        .select('image_url')
        .eq('id', id)
        .single();

    // Delete from DB first
    const { error } = await client
        .from('hero_sliders')
        .delete()
        .eq('id', id);

    if (error) throw error;

    // Delete associated image
    if (slider?.image_url) {
        try {
            await deleteHeroImage(slider.image_url);
        } catch (err) {
            console.warn('Failed to delete hero image:', err);
        }
    }
}

export async function uploadHeroImage(file: File): Promise<string> {
    const ext = file.name.split('.').pop();
    const path = `banners/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

    const { error } = await supabase.storage
        .from('hero-images')
        .upload(path, file, { upsert: true });

    if (error) throw error;

    const { data } = supabase.storage.from('hero-images').getPublicUrl(path);
    return data.publicUrl;
}

export async function deleteHeroImage(url: string): Promise<void> {
    const parts = url.split('/hero-images/');
    if (parts.length < 2) return;
    const path = parts[1];

    await supabase.storage.from('hero-images').remove([path]);
}
