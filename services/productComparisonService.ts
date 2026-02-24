/**
 * Product Comparison Service
 * Allows users to compare multiple products side by side
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Product } from '@/types';

const COMPARISON_LIST_KEY = '@alma_store:comparison_list';
const MAX_COMPARISON_ITEMS = 4;

// ─── Types ────────────────────────────────────────────

export interface ComparisonItem {
  product: Product;
  addedAt: number;
}

export interface ComparisonResult {
  items: ComparisonItem[];
  canAddMore: boolean;
}

// ─── Comparison List Management ────────────────────────

/**
 * Get current comparison list
 */
export async function getComparisonList(): Promise<ComparisonItem[]> {
  try {
    const data = await AsyncStorage.getItem(COMPARISON_LIST_KEY);
    if (data) {
      const items: ComparisonItem[] = JSON.parse(data);
      return items.sort((a, b) => a.addedAt - b.addedAt);
    }
    return [];
  } catch (error) {
    console.error('[ComparisonService] Failed to get comparison list:', error);
    return [];
  }
}

/**
 * Add product to comparison list
 */
export async function addToComparison(product: Product): Promise<ComparisonResult> {
  try {
    const items = await getComparisonList();

    // Check if already exists
    const exists = items.some((item) => item.product.id === product.id);
    if (exists) {
      return { items, canAddMore: items.length < MAX_COMPARISON_ITEMS };
    }

    // Check max limit
    if (items.length >= MAX_COMPARISON_ITEMS) {
      return { items, canAddMore: false };
    }

    // Add new item
    const newItem: ComparisonItem = {
      product,
      addedAt: Date.now(),
    };

    const updated = [...items, newItem];
    await AsyncStorage.setItem(COMPARISON_LIST_KEY, JSON.stringify(updated));

    return { items: updated, canAddMore: updated.length < MAX_COMPARISON_ITEMS };
  } catch (error) {
    console.error('[ComparisonService] Failed to add to comparison:', error);
    return { items: [], canAddMore: false };
  }
}

/**
 * Remove product from comparison list
 */
export async function removeFromComparison(productId: string): Promise<ComparisonItem[]> {
  try {
    const items = await getComparisonList();
    const filtered = items.filter((item) => item.product.id !== productId);
    await AsyncStorage.setItem(COMPARISON_LIST_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (error) {
    console.error('[ComparisonService] Failed to remove from comparison:', error);
    return [];
  }
}

/**
 * Clear entire comparison list
 */
export async function clearComparison(): Promise<void> {
  try {
    await AsyncStorage.removeItem(COMPARISON_LIST_KEY);
  } catch (error) {
    console.error('[ComparisonService] Failed to clear comparison:', error);
  }
}

/**
 * Check if product is in comparison list
 */
export async function isInComparison(productId: string): Promise<boolean> {
  try {
    const items = await getComparisonList();
    return items.some((item) => item.product.id === productId);
  } catch (error) {
    return false;
  }
}

/**
 * Get comparison count
 */
export async function getComparisonCount(): Promise<number> {
  try {
    const items = await getComparisonList();
    return items.length;
  } catch (error) {
    return 0;
  }
}

// ─── Comparison Features ───────────────────────────────

/**
 * Compare products by specific attribute
 */
export function compareByAttribute<T>(
  items: ComparisonItem[],
  accessor: (product: Product) => T
): T[] {
  return items.map((item) => accessor(item.product));
}

/**
 * Get differences between products
 */
export function getProductDifferences(items: ComparisonItem[]): {
  attribute: string;
  values: { productId: string; value: any }[];
  hasDifference: boolean;
}[] {
  if (items.length < 2) return [];

  const attributes = [
    { key: 'price', label: 'Price', format: (v: any) => `$${v.toFixed(2)}` },
    { key: 'rating', label: 'Rating', format: (v: any) => `${v?.toFixed(1) || 'N/A'}` },
    { key: 'category', label: 'Category', format: (v: any) => v || 'N/A' },
    { key: 'stock', label: 'Stock', format: (v: any) => v || 'N/A' },
  ];

  return attributes.map((attr) => {
    const values = items.map((item) => ({
      productId: item.product.id,
      value: attr.format((item.product as any)[attr.key]),
    }));

    const uniqueValues = new Set(values.map((v) => v.value));
    const hasDifference = uniqueValues.size > 1;

    return {
      attribute: attr.label,
      values,
      hasDifference,
    };
  });
}

/**
 * Get best product by attribute
 */
export function getBestByAttribute(
  items: ComparisonItem[],
  attribute: 'price' | 'rating' | 'stock'
): ComparisonItem | null {
  if (items.length === 0) return null;

  return items.reduce((best, current) => {
    const bestValue = (best.product as any)[attribute];
    const currentValue = (current.product as any)[attribute];

    if (attribute === 'price') {
      return currentValue < bestValue ? current : best;
    } else {
      return currentValue > bestValue ? current : best;
    }
  });
}

/**
 * Get comparison summary
 */
export function getComparisonSummary(items: ComparisonItem[]): {
  totalProducts: number;
  priceRange: { min: number; max: number; avg: number };
  bestRating: ComparisonItem | null;
  lowestPrice: ComparisonItem | null;
} {
  if (items.length === 0) {
    return {
      totalProducts: 0,
      priceRange: { min: 0, max: 0, avg: 0 },
      bestRating: null,
      lowestPrice: null,
    };
  }

  const prices = items.map((item) => item.product.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

  return {
    totalProducts: items.length,
    priceRange: {
      min: minPrice,
      max: maxPrice,
      avg: avgPrice,
    },
    bestRating: getBestByAttribute(items, 'rating'),
    lowestPrice: getBestByAttribute(items, 'price'),
  };
}

/**
 * Share comparison list
 */
export async function shareComparison(items: ComparisonItem[]): Promise<string> {
  const summary = getComparisonSummary(items);

  let text = `📊 Product Comparison (${items.length} items)\n\n`;

  items.forEach((item, index) => {
    text += `${index + 1}. ${item.product.name}\n`;
    text += `   Price: $${item.product.price.toFixed(2)}\n`;
    text += `   Rating: ${item.product.rating?.toFixed(1) || 'N/A'}⭐\n\n`;
  });

  text += `\n💰 Price Range: $${summary.priceRange.min.toFixed(2)} - $${summary.priceRange.max.toFixed(2)}`;
  text += `\n⭐ Best Rating: ${summary.bestRating?.product.name || 'N/A'}`;
  text += `\n💵 Lowest Price: ${summary.lowestPrice?.product.name || 'N/A'}`;

  return text;
}
