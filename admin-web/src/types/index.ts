// ─── AlmaShop Admin TypeScript Types ─────────────

export interface AdminUser {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
    role: 'admin' | 'customer';
}

export interface HeroSlider {
    id: string;
    type: 'home' | 'flash_sale';
    title: string;
    subtitle?: string | null;
    cta_text?: string | null;
    cta_link?: string | null;
    image_url: string;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    image_url: string | null;
    created_at: string;
    description?: string;
    is_active?: boolean;
    product_count?: number;
}

export interface Product {
    id: string;
    name: string;
    description: string | null;
    price: number;
    original_price?: number;
    stock: number;
    category_id: string;
    material: string | null;
    images: string[];
    is_featured: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    category?: Category;
}

export type OrderStatus =
    | 'pending'
    | 'paid'
    | 'processing'
    | 'shipped'
    | 'completed'
    | 'cancelled'
    | 'return_requested'
    | 'returned';

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    price_at_purchase: number;
    product?: {
        id: string;
        name: string;
        images: string[];
        price: number;
    } | null;
}

export interface Order {
    id: string;
    user_id: string;
    total_amount: number;
    status: OrderStatus;
    shipping_address: string;
    payment_proof_url: string | null;
    courier: string | null;
    tracking_number: string | null;
    shipped_at: string | null;
    created_at: string;
    updated_at: string;
    order_items?: OrderItem[];
    profile?: {
        full_name: string;
        avatar_url: string | null;
        phone_number: string | null;
    } | null;
}

export interface Voucher {
    id: string;
    code: string;
    name: string;
    description?: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    min_purchase: number;
    max_discount?: number;
    start_date: string;
    end_date?: string;
    is_active: boolean;
    created_at?: string;
}

export interface UserProfile {
    user_id: string;
    full_name: string;
    avatar_url: string | null;
    phone_number: string | null;
    username: string | null;
    role: 'admin' | 'customer';
    created_at: string;
    email?: string;
    wallet_balance?: number;
    reward_points?: number;
    order_count?: number;
}

export interface Review {
    id: string;
    user_id: string;
    product_id: string;
    order_id?: string;
    rating: number;
    comment: string;
    created_at: string;
    profile?: {
        full_name: string;
        avatar_url: string | null;
    };
    product?: {
        id: string;
        name: string;
        images: string[];
    };
}

export interface ReturnRequest {
    id: string;
    order_id: string;
    user_id: string;
    reason: string;
    description: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    created_at: string;
    order?: Order;
    profile?: {
        full_name: string;
    };
}

export interface DashboardStats {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalUsers: number;
    pendingOrders: number;
    returnRequests: number;
    revenueChange: number;
    ordersChange: number;
}

export interface RevenuePoint {
    date: string;
    revenue: number;
    orders: number;
}

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: 'order' | 'promo' | 'system' | 'wallet';
    is_read: boolean;
    action_url?: string;
    created_at: string;
}
