/**
 * Advanced Search Service
 * Provides search suggestions, recent searches, and advanced filtering
 */

import type { Product, ProductFilter } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchProducts } from './productService';

// ─── Constants ────────────────────────────────────────

const RECENT_SEARCHES_KEY = '@alma_store:recent_searches';
const MAX_RECENT_SEARCHES = 10;
const MAX_SUGGESTIONS = 5;

// ─── Types ────────────────────────────────────────────

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'product' | 'category' | 'recent';
  product?: Product;
}

export interface RecentSearch {
  query: string;
  timestamp: number;
}

export interface AdvancedFilterOptions extends ProductFilter {
  inStock?: boolean;
  onSale?: boolean;
  freeShipping?: boolean;
  minRating?: number;
}

// ─── Recent Searches Management ────────────────────────

/**
 * Get recent searches from storage
 */
export async function getRecentSearches(): Promise<RecentSearch[]> {
  try {
    const data = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
    if (data) {
      const searches: RecentSearch[] = JSON.parse(data);
      // Sort by timestamp descending and return
      return searches.sort((a, b) => b.timestamp - a.timestamp);
    }
    return [];
  } catch (error) {
    console.error('[SearchService] Failed to get recent searches:', error);
    return [];
  }
}

/**
 * Save a search query to recent searches
 */
export async function saveRecentSearch(query: string): Promise<void> {
  if (!query.trim()) return;

  try {
    const searches = await getRecentSearches();

    // Remove if already exists (to move to top)
    const filtered = searches.filter((s) => s.query !== query);

    // Add new search to the beginning
    const newSearch: RecentSearch = {
      query: query.trim(),
      timestamp: Date.now(),
    };

    const updated = [newSearch, ...filtered].slice(0, MAX_RECENT_SEARCHES);

    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('[SearchService] Failed to save recent search:', error);
  }
}

/**
 * Clear a single recent search
 */
export async function removeRecentSearch(query: string): Promise<void> {
  try {
    const searches = await getRecentSearches();
    const filtered = searches.filter((s) => s.query !== query);
    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('[SearchService] Failed to remove recent search:', error);
  }
}

/**
 * Clear all recent searches
 */
export async function clearRecentSearches(): Promise<void> {
  try {
    await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch (error) {
    console.error('[SearchService] Failed to clear recent searches:', error);
  }
}

// ─── Search Suggestions ───────────────────────────────

/**
 * Get search suggestions based on query
 */
export async function getSearchSuggestions(
  query: string,
  allProducts?: Product[]
): Promise<SearchSuggestion[]> {
  const suggestions: SearchSuggestion[] = [];
  const trimmedQuery = query.trim().toLowerCase();

  if (!trimmedQuery) {
    // Add recent searches as suggestions when query is empty
    const recent = await getRecentSearches();
    suggestions.push(
      ...recent.slice(0, MAX_SUGGESTIONS).map((r) => ({
        id: `recent-${r.query}`,
        text: r.query,
        type: 'recent' as const,
      }))
    );
    return suggestions;
  }

  // If we have product data, filter for suggestions
  if (allProducts) {
    // Product name matches
    const productMatches = allProducts
      .filter((p) => p.name.toLowerCase().includes(trimmedQuery))
      .slice(0, MAX_SUGGESTIONS);

    productMatches.forEach((product) => {
      suggestions.push({
        id: `product-${product.id}`,
        text: product.name,
        type: 'product',
        product,
      });
    });

    // If no product matches, add the query itself as a suggestion
    if (suggestions.length === 0) {
      suggestions.push({
        id: `query-${query}`,
        text: query,
        type: 'product',
      });
    }
  }

  return suggestions.slice(0, MAX_SUGGESTIONS);
}

// ─── Advanced Search ─────────────────────────────────

/**
 * Perform advanced search with filters
 */
export async function advancedSearch(
  query: string,
  filters?: AdvancedFilterOptions
): Promise<Product[]> {
  try {
    const results = await fetchProducts({
      search: query.trim(),
      ...filters,
      page: 1,
      limit: 50,
    });

    // Save to recent searches
    await saveRecentSearch(query);

    return results;
  } catch (error) {
    console.error('[SearchService] Advanced search failed:', error);
    throw error;
  }
}

/**
 * Quick search (instant search as you type)
 */
export async function quickSearch(
  query: string,
  allProducts?: Product[]
): Promise<Product[]> {
  if (!query.trim() || !allProducts) return [];

  const trimmedQuery = query.trim().toLowerCase();

  return allProducts.filter((product) => {
    return (
      product.name.toLowerCase().includes(trimmedQuery) ||
      product.description?.toLowerCase().includes(trimmedQuery) ||
      product.category?.name?.toLowerCase().includes(trimmedQuery)
    );
  }).slice(0, 10); // Limit to 10 results for quick search
}

// ─── Search Analytics ────────────────────────────────

/**
 * Track search query for analytics (optional)
 */
export async function trackSearch(query: string, resultsCount: number): Promise<void> {
  // This can be integrated with your analytics service
  // For now, just log in development
  if (__DEV__) {
    console.log(`[SearchAnalytics] Query: "${query}", Results: ${resultsCount}`);
  }

  // TODO: Send to analytics service
  // await analytics.track('search_performed', {
  //   query,
  //   results_count: resultsCount,
  //   timestamp: Date.now(),
  // });
}

// ─── Trending Searches ───────────────────────────────

/**
 * Get trending searches (can be from API or local storage)
 */
export async function getTrendingSearches(): Promise<string[]> {
  // For now, return static trending searches
  // In production, this should come from your API
  return [
    'iPhone 16',
    'Samsung Galaxy',
    'MacBook Pro',
    'AirPods Pro',
    'iPad Air',
    'Smart Watch',
    'Laptop Gaming',
    'Wireless Earbuds',
  ];
}

// ─── Search History Export ───────────────────────────

/**
 * Export search history as JSON
 */
export async function exportSearchHistory(): Promise<string> {
  const searches = await getRecentSearches();
  return JSON.stringify(searches, null, 2);
}

// ─── Search Optimizations ────────────────────────────

/**
 * Debounce search input
 */
export function debounceSearch(
  searchFn: (query: string) => void,
  delay: number = 300
): (query: string) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (query: string) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => searchFn(query), delay);
  };
}

/**
 * Throttle search results
 */
export function throttleSearchResults<T>(
  results: T[],
  maxResults: number = 50
): T[] {
  return results.slice(0, maxResults);
}
