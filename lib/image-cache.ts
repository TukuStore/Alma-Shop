/**
 * Image Caching Strategy
 * Provides optimized image loading with caching for expo-image
 */

import { Image } from 'expo-image';

// ─── Image Cache Configuration ───────────────────────────

/**
 * Configure global image caching settings for expo-image
 */
export function configureImageCache() {
  // Enable automatic caching with memory and disk cache
  // expo-image 2.0+ handles caching automatically
  // No global configuration needed for basic caching
}

// ─── Preload Images ─────────────────────────────────────

/**
 * Preload a list of image URLs for faster access
 */
export async function preloadImages(urls: string[]): Promise<void> {
  try {
    await Image.prefetch(urls);
    if (__DEV__) {
      console.log(`[ImageCache] Preloaded ${urls.length} images`);
    }
  } catch (error) {
    console.error('[ImageCache] Failed to preload images:', error);
  }
}

/**
 * Preload a single image
 */
export async function preloadImage(url: string): Promise<void> {
  try {
    await Image.prefetch(url);
    if (__DEV__) {
      console.log(`[ImageCache] Preloaded: ${url}`);
    }
  } catch (error) {
    console.error(`[ImageCache] Failed to preload ${url}:`, error);
  }
}

// ─── Clear Cache ────────────────────────────────────────

/**
 * Clear the image cache (useful for logout or storage management)
 */
export async function clearImageCache(): Promise<void> {
  try {
    await Image.clearMemoryCache();
    await Image.clearDiskCache();
    if (__DEV__) {
      console.log('[ImageCache] Cache cleared');
    }
  } catch (error) {
    console.error('[ImageCache] Failed to clear cache:', error);
  }
}

// ─── Image Source Helper ────────────────────────────────

/**
 * Create an optimized image source with cache strategy
 */
export function createCachedImageSource(uri: string, cacheKey?: string) {
  return {
    uri,
    cache: 'memory-disk' as const,
    ...(cacheKey && { cacheKey }),
  };
}

// ─── Progressive Image Loading ───────────────────────────

/**
 * Load image progressively with quality levels
 */
export function createProgressiveImageSource(
  uri: string,
  options?: {
    lowQualityUri?: string;
    cacheKey?: string;
  }
) {
  const { lowQualityUri, cacheKey } = options || {};

  return {
    uri,
    ...(lowQualityUri && { src: lowQualityUri }),
    cache: 'memory-disk' as const,
    ...(cacheKey && { cacheKey }),
  };
}

// ─── Image Size Optimization ─────────────────────────────

/**
 * Get optimized image URL with size parameters
 * Works with Unsplash, Supabase Storage, and similar CDNs
 */
export function getOptimizedImageUrl(
  baseUrl: string,
  options?: {
    width?: number;
    quality?: number;
    format?: 'jpg' | 'png' | 'webp';
  }
): string {
  const { width = 400, quality = 80, format = 'webp' } = options || {};

  try {
    const url = new URL(baseUrl);

    // Unsplash optimization
    if (url.hostname.includes('unsplash.com')) {
      url.searchParams.set('w', width.toString());
      url.searchParams.set('q', quality.toString());
      url.searchParams.set('fm', format);
      return url.toString();
    }

    // Supabase Storage optimization
    if (url.hostname.includes('supabase.co')) {
      url.searchParams.set('width', width.toString());
      url.searchParams.set('quality', quality.toString());
      return url.toString();
    }

    // Default: return original URL
    return baseUrl;
  } catch {
    // If URL parsing fails, return original
    return baseUrl;
  }
}

// ─── Batch Image Preloading ─────────────────────────────

/**
 * Batch preload images with concurrency limit
 */
export async function batchPreloadImages(
  urls: string[],
  concurrency: number = 5
): Promise<void> {
  const batches: string[][] = [];

  // Split into batches
  for (let i = 0; i < urls.length; i += concurrency) {
    batches.push(urls.slice(i, i + concurrency));
  }

  // Process batches sequentially
  for (const batch of batches) {
    await Promise.allSettled(
      batch.map((url) =>
        Image.prefetch(url).catch((error) => {
          console.warn(`[ImageCache] Failed to preload ${url}:`, error);
        })
      )
    );
  }

  if (__DEV__) {
    console.log(`[ImageCache] Batch preloaded ${urls.length} images`);
  }
}

// ─── Image Memory Management ────────────────────────────

/**
 * Cleanup image memory when app goes to background
 */
export function setupImageMemoryCleanup(): () => void {
  const subscription = AppState.addEventListener('change', (nextAppState) => {
    if (nextAppState === 'background' || nextAppState === 'inactive') {
      // Clear memory cache when app goes to background
      Image.clearMemoryCache();
      if (__DEV__) {
        console.log('[ImageCache] Memory cache cleared on background');
      }
    }
  });

  return () => {
    subscription.remove();
  };
}

import { AppState } from 'react-native';

