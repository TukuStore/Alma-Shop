import { supabase } from '@/lib/supabase';
import type { Product } from '@/types';

type StockCheckResult = {
    productId: string;
    productName: string;
    requestedQuantity: number;
    availableStock: number;
    inStock: boolean;
};

type ValidationResult = {
    valid: boolean;
    message: string;
    outOfStockItems: StockCheckResult[];
};

// ============================================
// STOCK VALIDATION SERVICE
// ============================================
export const stockService = {
    // ============================================
    // CHECK STOCK FOR MULTIPLE PRODUCTS
    // ============================================
    async checkStock(items: Array<{ productId: string; quantity: number }>): Promise<ValidationResult> {
        try {
            const productIds = items.map(item => item.productId);

            // Fetch current stock for all products
            const { data: products, error } = await supabase
                .from('products')
                .select('id, name, stock')
                .in('id', productIds);

            if (error) throw error;

            if (!products || products.length === 0) {
                return {
                    valid: false,
                    message: 'Products not found',
                    outOfStockItems: [],
                };
            }

            // Check each item
            const outOfStockItems: StockCheckResult[] = [];
            let allInStock = true;

            for (const item of items) {
                const product = products.find(p => p.id === item.productId);

                if (!product) {
                    outOfStockItems.push({
                        productId: item.productId,
                        productName: 'Unknown Product',
                        requestedQuantity: item.quantity,
                        availableStock: 0,
                        inStock: false,
                    });
                    allInStock = false;
                    continue;
                }

                const inStock = (product.stock || 0) >= item.quantity;

                if (!inStock) {
                    outOfStockItems.push({
                        productId: product.id,
                        productName: product.name,
                        requestedQuantity: item.quantity,
                        availableStock: product.stock || 0,
                        inStock: false,
                    });
                    allInStock = false;
                }
            }

            return {
                valid: allInStock,
                message: allInStock
                    ? 'All items are in stock'
                    : ` ${outOfStockItems.length} item(s) out of stock`,
                outOfStockItems,
            };

        } catch (error) {
            console.error('Stock check error:', error);
            return {
                valid: false,
                message: 'Failed to check stock availability',
                outOfStockItems: [],
            };
        }
    },

    // ============================================
    // GET REAL-TIME STOCK STATUS
    // ============================================
    async getProductStock(productId: string): Promise<number> {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('stock')
                .eq('id', productId)
                .single();

            if (error || !data) {
                console.error('Error fetching product stock:', error);
                return 0;
            }

            return data.stock || 0;

        } catch (error) {
            console.error('Product stock fetch error:', error);
            return 0;
        }
    },

    // ============================================
    // UPDATE STOCK AFTER ORDER
    // ============================================
    async updateStockAfterOrder(
        items: Array<{ productId: string; quantity: number }>
    ): Promise<{ success: boolean; message: string }> {
        try {
            // Update stock for each item
            for (const item of items) {
                // Get current stock
                const { data: product } = await supabase
                    .from('products')
                    .select('stock')
                    .eq('id', item.productId)
                    .single();

                if (!product) continue;

                const newStock = Math.max(0, (product.stock || 0) - item.quantity);

                // Update stock
                const { error } = await supabase
                    .from('products')
                    .update({ stock: newStock })
                    .eq('id', item.productId);

                if (error) {
                    console.error(`Error updating stock for ${item.productId}:`, error);
                }
            }

            return { success: true, message: 'Stock updated successfully' };

        } catch (error) {
            console.error('Stock update error:', error);
            return { success: false, message: 'Failed to update stock' };
        }
    },

    // ============================================
    // RESTORE STOCK (for cancelled orders)
    // ============================================
    async restoreStock(
        items: Array<{ productId: string; quantity: number }>
    ): Promise<{ success: boolean; message: string }> {
        try {
            for (const item of items) {
                // Get current stock
                const { data: product } = await supabase
                    .from('products')
                    .select('stock')
                    .eq('id', item.productId)
                    .single();

                if (!product) continue;

                const newStock = (product.stock || 0) + item.quantity;

                // Update stock
                await supabase
                    .from('products')
                    .update({ stock: newStock })
                    .eq('id', item.productId);
            }

            return { success: true, message: 'Stock restored successfully' };

        } catch (error) {
            console.error('Stock restore error:', error);
            return { success: false, message: 'Failed to restore stock' };
        }
    },

    // ============================================
    // CHECK LOW STOCK
    // ============================================
    async checkLowStock(threshold: number = 5): Promise<Product[]> {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .lte('stock', threshold)
                .gte('stock', 0)
                .order('stock', { ascending: true });

            if (error) throw error;
            return (data as Product[]) ?? [];

        } catch (error) {
            console.error('Low stock check error:', error);
            return [];
        }
    },

    // ============================================
    // GET STOCK STATUS FOR UI
    // ============================================
    getStockStatus(stock: number): {
        status: 'in_stock' | 'low_stock' | 'out_of_stock';
        message: string;
        color: string;
    } {
        if (stock === 0) {
            return {
                status: 'out_of_stock',
                message: 'Out of Stock',
                color: '#EF4444',
            };
        } else if (stock < 5) {
            return {
                status: 'low_stock',
                message: `Only ${stock} left`,
                color: '#F59E0B',
            };
        } else {
            return {
                status: 'in_stock',
                message: 'In Stock',
                color: '#10B981',
            };
        }
    },
};
