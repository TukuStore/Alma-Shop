// Types for Order History Page

// Product info as returned by Supabase nested query
export interface ProductInfo {
    id?: string;
    name: string;
    images: string[];
}

// Order item with Supabase's array response format
export interface OrderItem {
    product_id?: string;
    quantity: number;
    price_at_purchase: number;
    product: ProductInfo | ProductInfo[]; // Supabase returns array for single relation
}

// Helper to get product from item (handles array format)
export function getProductFromItem(item: OrderItem): ProductInfo | null {
    if (!item.product) return null;
    if (Array.isArray(item.product)) {
        return item.product[0] || null;
    }
    return item.product;
}

export interface OrderTimestamps {
    created_at?: string;
    paid_at?: string;
    processed_at?: string;
    shipped_at?: string;
    completed_at?: string;
    cancelled_at?: string;
    return_requested_at?: string;
}

export interface OrderShippingInfo {
    courier?: string;
    tracking_number?: string;
}

export interface Order {
    id: string;
    total_amount: number;
    status: string;
    created_at: string;
    items: OrderItem[];
    // Timestamps for timeline
    paid_at?: string | null;
    processed_at?: string | null;
    shipped_at?: string | null;
    completed_at?: string | null;
    cancelled_at?: string | null;
    return_requested_at?: string | null;
    // Shipping info
    courier?: string | null;
    tracking_number?: string | null;
}

// Timeline step for UI
export interface TimelineStep {
    key: string;
    label: string;
    description: string;
    timestamp?: string | null;
    status: 'completed' | 'current' | 'pending';
    icon: string;
}

export type OrderStatus =
    | "PENDING"
    | "PAID"
    | "PROCESSING"
    | "SHIPPED"
    | "COMPLETED"
    | "CANCELLED"
    | "RETURN_REQUESTED"
    | "RETURN_REJECTED"
    | "REFUNDED";
