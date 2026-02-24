import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================
// ANALYTICS SERVICE
// ============================================================
// Track user behavior, search patterns, and product interactions

type AnalyticsEvent = {
    eventName: string;
    eventType: 'search' | 'view' | 'click' | 'add_to_cart' | 'purchase' | 'filter' | 'share';
    userId?: string;
    productId?: string;
    categoryId?: string;
    searchQuery?: string;
    filters?: Record<string, any>;
    metadata?: Record<string, any>;
    timestamp: string;
};

type SearchAnalytics = {
    query: string;
    filters?: Record<string, any>;
    resultCount: number;
    clickedProductId?: string;
    userId?: string;
    timestamp: string;
};

// ============================================================
// ANALYTICS STORAGE KEYS
// ============================================================
const ANALYTICS_CACHE_KEY = 'almastore_analytics_cache';
const MAX_CACHE_SIZE = 50; // Store up to 50 events before syncing

export const analyticsService = {
    // ============================================================
    // CACHE MANAGEMENT
    // ============================================================
    private: {
        cache: [] as AnalyticsEvent[],
        isInitialized: false,
    },

    async initialize(): Promise<void> {
        if (this.private.isInitialized) return;

        try {
            const cached = await AsyncStorage.getItem(ANALYTICS_CACHE_KEY);
            if (cached) {
                this.private.cache = JSON.parse(cached);
            }
            this.private.isInitialized = true;
        } catch (error) {
            console.error('Analytics init error:', error);
            this.private.cache = [];
        }
    },

    async saveCache(): Promise<void> {
        try {
            await AsyncStorage.setItem(ANALYTICS_CACHE_KEY, JSON.stringify(this.private.cache));
        } catch (error) {
            console.error('Analytics save cache error:', error);
        }
    },

    // ============================================================
    // EVENT TRACKING
    // ============================================================
    async trackEvent(event: Omit<AnalyticsEvent, 'timestamp'>): Promise<void> {
        await this.initialize();

        const newEvent: AnalyticsEvent = {
            ...event,
            timestamp: new Date().toISOString(),
        };

        // Add to cache
        this.private.cache.push(newEvent);

        // Trim cache if too large
        if (this.private.cache.length > MAX_CACHE_SIZE) {
            this.private.cache = this.private.cache.slice(-MAX_CACHE_SIZE);
        }

        // Save to local storage
        await this.saveCache();

        // Try to sync to server
        await this.syncEvents();
    },

    // ============================================================
    // SEARCH TRACKING
    // ============================================================
    async trackSearch(options: {
        query: string;
        filters?: Record<string, any>;
        resultCount: number;
        userId?: string;
    }): Promise<void> {
        await this.trackEvent({
            eventName: 'search',
            eventType: 'search',
            userId: options.userId,
            searchQuery: options.query,
            filters: options.filters,
            metadata: {
                resultCount: options.resultCount,
            },
        });

        // Also store in database for server-side analytics
        try {
            const { data: { user } } = await supabase.auth.getUser();

            await supabase.from('search_history').insert({
                user_id: user?.id || null,
                query: options.query,
                filters: options.filters || {},
                results_count: options.resultCount,
            });
        } catch (error) {
            // Silently fail - analytics shouldn't break the app
            console.debug('Search analytics DB error:', error);
        }
    },

    async trackSearchResultClick(searchQuery: string, productId: string): Promise<void> {
        await this.trackEvent({
            eventName: 'search_result_click',
            eventType: 'click',
            productId,
            searchQuery,
        });

        // Update search history with clicked product
        try {
            const { data: { user } } = await supabase.auth.getUser();

            await supabase
                .from('search_history')
                .update({ clicked_product_id: productId })
                .eq('user_id', user?.id)
                .eq('query', searchQuery)
                .order('created_at', { ascending: false })
                .limit(1)
                .select();
        } catch (error) {
            console.debug('Search click analytics error:', error);
        }
    },

    // ============================================================
    // PRODUCT INTERACTION TRACKING
    // ============================================================
    async trackProductView(productId: string, userId?: string): Promise<void> {
        await this.trackEvent({
            eventName: 'product_view',
            eventType: 'view',
            userId,
            productId,
        });
    },

    async trackAddToCart(productId: string, userId?: string, metadata?: { quantity?: number; price?: number }): Promise<void> {
        await this.trackEvent({
            eventName: 'add_to_cart',
            eventType: 'add_to_cart',
            userId,
            productId,
            metadata,
        });
    },

    async trackProductClick(productId: string, source?: 'search' | 'category' | 'home' | 'recommendation', userId?: string): Promise<void> {
        await this.trackEvent({
            eventName: 'product_click',
            eventType: 'click',
            userId,
            productId,
            metadata: { source },
        });
    },

    async trackShare(productId: string, method: 'link' | 'social', userId?: string): Promise<void> {
        await this.trackEvent({
            eventName: 'product_share',
            eventType: 'share',
            userId,
            productId,
            metadata: { method },
        });
    },

    // ============================================================
    // CATEGORY TRACKING
    // ============================================================
    async trackCategoryView(categoryId: string, categoryName: string, userId?: string): Promise<void> {
        await this.trackEvent({
            eventName: 'category_view',
            eventType: 'view',
            userId,
            categoryId,
            metadata: { categoryName },
        });
    },

    async trackFilterApply(filters: Record<string, any>, categoryId?: string, userId?: string): Promise<void> {
        await this.trackEvent({
            eventName: 'filter_apply',
            eventType: 'filter',
            userId,
            categoryId,
            filters,
        });
    },

    // ============================================================
    // PURCHASE TRACKING
    // ============================================================
    async trackPurchase(orderId: string, totalAmount: number, productIds: string[], userId?: string): Promise<void> {
        await this.trackEvent({
            eventName: 'purchase',
            eventType: 'purchase',
            userId,
            metadata: {
                orderId,
                totalAmount,
                productCount: productIds.length,
                productIds,
            },
        });
    },

    // ============================================================
    // ANALYTICS DATA RETRIEVAL
    // ============================================================
    async getRecentSearches(limit = 10): Promise<SearchAnalytics[]> {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                // Return local cache for anonymous users
                await this.initialize();
                return this.private.cache
                    .filter(e => e.eventType === 'search')
                    .slice(-limit)
                    .map(e => ({
                        query: e.searchQuery || '',
                        filters: e.filters,
                        resultCount: e.metadata?.resultCount || 0,
                        timestamp: e.timestamp,
                    }));
            }

            const { data, error } = await supabase
                .from('search_history')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;

            return (data as any[]).map(item => ({
                query: item.query,
                filters: item.filters,
                resultCount: item.results_count || 0,
                clickedProductId: item.clicked_product_id,
                userId: item.user_id,
                timestamp: item.created_at,
            }));

        } catch (error) {
            console.error('Get recent searches error:', error);
            return [];
        }
    },

    async getPopularSearches(limit = 10): Promise<Array<{ query: string; count: number }>> {
        try {
            const { data, error } = await supabase
                .from('search_history')
                .select('query')
                .not('query', 'is', null)
                .order('created_at', { ascending: false })
                .limit(1000); // Get recent searches for analysis

            if (error) throw error;

            // Count occurrences of each query
            const queryCounts = new Map<string, number>();
            (data as any[]).forEach(item => {
                const query = item.query?.toLowerCase().trim();
                if (query && query.length > 2) { // Only count meaningful searches
                    queryCounts.set(query, (queryCounts.get(query) || 0) + 1);
                }
            });

            // Sort by count and return top results
            return Array.from(queryCounts.entries())
                .map(([query, count]) => ({ query, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, limit);

        } catch (error) {
            console.error('Get popular searches error:', error);
            return [];
        }
    },

    // ============================================================
    // SYNC EVENTS TO SERVER
    // ============================================================
    async syncEvents(): Promise<void> {
        await this.initialize();

        if (this.private.cache.length === 0) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                // Don't sync if user not authenticated
                return;
            }

            // Upload events to analytics table (if it exists)
            // This is a placeholder - you'd create an analytics_events table
            /*
            await supabase.from('analytics_events').insert(
                this.private.cache.map(event => ({
                    user_id: user.id,
                    event_name: event.eventName,
                    event_type: event.eventType,
                    product_id: event.productId,
                    metadata: event,
                    created_at: event.timestamp,
                }))
            );
            */

            // Clear synced events from cache
            this.private.cache = [];
            await this.saveCache();

        } catch (error) {
            // Silently fail - analytics shouldn't break the app
            console.debug('Analytics sync error:', error);
        }
    },

    // ============================================================
    // CLEAR ANALYTICS DATA
    // ============================================================
    async clearCache(): Promise<void> {
        this.private.cache = [];
        await AsyncStorage.removeItem(ANALYTICS_CACHE_KEY);
    },

    // ============================================================
    // GET ANALYTICS SUMMARY
    // ============================================================
    async getAnalyticsSummary(userId: string): Promise<{
        totalSearches: number;
        totalProductViews: number;
        totalAddToCarts: number;
        totalPurchases: number;
        topCategories: Array<{ categoryId: string; count: number }>;
    }> {
        try {
            // Get analytics from database
            const [searches] = await Promise.all([
                supabase.from('search_history').select('id').eq('user_id', userId),
                // Add other queries when analytics_events table is created
            ]);

            return {
                totalSearches: searches.data?.length || 0,
                totalProductViews: 0, // From analytics_events table
                totalAddToCarts: 0,
                totalPurchases: 0,
                topCategories: [],
            };

        } catch (error) {
            console.error('Get analytics summary error:', error);
            return {
                totalSearches: 0,
                totalProductViews: 0,
                totalAddToCarts: 0,
                totalPurchases: 0,
                topCategories: [],
            };
        }
    },
};

// Export analytics service
export default analyticsService;
