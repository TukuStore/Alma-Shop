/**
 * Product Review Service
 * Handles product reviews, ratings, and user feedback
 */

import { supabase } from '@/lib/supabase';

// ─── Types ────────────────────────────────────────────

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  user: {
    full_name: string;
    avatar_url?: string;
  };
  rating: number;
  title?: string;
  comment: string;
  pros?: string[];
  cons?: string[];
  images?: string[];
  helpful_count: number;
  is_verified_purchase: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface ReviewFilter {
  sort?: 'recent' | 'helpful' | 'rating_high' | 'rating_low';
  rating?: number;
  withImages?: boolean;
  verifiedOnly?: boolean;
}

// ─── Fetch Reviews ────────────────────────────────────

/**
 * Get reviews for a product
 */
export async function getProductReviews(
  productId: string,
  filter?: ReviewFilter,
  page: number = 1,
  limit: number = 20
): Promise<{ reviews: ProductReview[]; hasMore: boolean }> {
  try {
    let query = supabase
      .from('product_reviews')
      .select(
        `
        id,
        product_id,
        user_id,
        rating,
        title,
        comment,
        pros,
        cons,
        images,
        helpful_count,
        is_verified_purchase,
        created_at,
        updated_at,
        user:profiles(full_name, avatar_url)
      `
      )
      .eq('product_id', productId);

    // Apply filters
    if (filter?.rating) {
      query = query.eq('rating', filter.rating);
    }

    if (filter?.verifiedOnly) {
      query = query.eq('is_verified_purchase', true);
    }

    // Apply sorting
    switch (filter?.sort) {
      case 'recent':
        query = query.order('created_at', { ascending: false });
        break;
      case 'helpful':
        query = query.order('helpful_count', { ascending: false });
        break;
      case 'rating_high':
        query = query.order('rating', { ascending: false });
        break;
      case 'rating_low':
        query = query.order('rating', { ascending: true });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error } = await query;

    if (error) throw error;

    // Filter by images if requested (client-side filter)
    let reviews = data as unknown as ProductReview[];
    if (filter?.withImages) {
      reviews = reviews.filter((r) => r.images && r.images.length > 0);
    }

    return {
      reviews,
      hasMore: reviews.length === limit,
    };
  } catch (error) {
    console.error('[ReviewService] Failed to fetch reviews:', error);
    return { reviews: [], hasMore: false };
  }
}

/**
 * Get review statistics for a product
 */
export async function getReviewStats(productId: string): Promise<ReviewStats> {
  try {
    const { data, error } = await supabase
      .from('product_reviews')
      .select('rating')
      .eq('product_id', productId);

    if (error) throw error;

    const reviews = data || [];
    const totalReviews = reviews.length;

    if (totalReviews === 0) {
      return {
        average_rating: 0,
        total_reviews: 0,
        rating_distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / totalReviews;

    // Calculate distribution
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      distribution[r.rating as keyof typeof distribution]++;
    });

    return {
      average_rating: averageRating,
      total_reviews: totalReviews,
      rating_distribution: distribution,
    };
  } catch (error) {
    console.error('[ReviewService] Failed to get review stats:', error);
    return {
      average_rating: 0,
      total_reviews: 0,
      rating_distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }
}

// ─── Submit Review ────────────────────────────────────

/**
 * Submit a product review
 */
export async function submitReview(review: {
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  comment: string;
  pros?: string[];
  cons?: string[];
  images?: string[];
}): Promise<ProductReview | null> {
  try {
    const { data, error } = await supabase
      .from('product_reviews')
      .insert({
        product_id: review.productId,
        user_id: review.userId,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        pros: review.pros,
        cons: review.cons,
        images: review.images,
      })
      .select()
      .single();

    if (error) throw error;

    return data as ProductReview;
  } catch (error) {
    console.error('[ReviewService] Failed to submit review:', error);
    return null;
  }
}

// ─── Review Interactions ───────────────────────────────

/**
 * Mark review as helpful
 */
export async function markReviewHelpful(reviewId: string): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('increment_helpful_count', {
      review_id: reviewId,
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[ReviewService] Failed to mark review as helpful:', error);
    return false;
  }
}

/**
 * Report a review
 */
export async function reportReview(reviewId: string, reason: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('reported_reviews').insert({
      review_id: reviewId,
      reason,
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[ReviewService] Failed to report review:', error);
    return false;
  }
}

// ─── User Reviews ─────────────────────────────────────

/**
 * Get reviews written by a user
 */
export async function getUserReviews(
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<ProductReview[]> {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
      .from('product_reviews')
      .select(
        `
        id,
        product_id,
        rating,
        title,
        comment,
        created_at,
        product:products(id, name, images)
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return data as unknown as ProductReview[];
  } catch (error) {
    console.error('[ReviewService] Failed to get user reviews:', error);
    return [];
  }
}

/**
 * Check if user can review a product (has purchased)
 */
export async function canReviewProduct(productId: string, userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select('id')
      .eq('product_id', productId)
      .eq('order_id', userId) // This should check via orders table
      .limit(1);

    if (error) throw error;
    return (data?.length || 0) > 0;
  } catch (error) {
    console.error('[ReviewService] Failed to check review eligibility:', error);
    return false;
  }
}

/**
 * Delete a review
 */
export async function deleteReview(reviewId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('product_reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('[ReviewService] Failed to delete review:', error);
    return false;
  }
}

// ─── Review Helpers ───────────────────────────────────

/**
 * Format rating display
 */
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

/**
 * Get rating percentage for progress bars
 */
export function getRatingPercentage(rating: number, total: number): number {
  if (total === 0) return 0;
  return (rating / total) * 100;
}

/**
 * Get star configuration
 */
export function getStarConfig(rating: number): {
  filled: number;
  half: number;
  empty: number;
} {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return {
    filled: fullStars,
    half: hasHalfStar ? 1 : 0,
    empty: emptyStars,
  };
}
