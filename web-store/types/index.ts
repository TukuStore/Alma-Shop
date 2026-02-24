// ─── AlmaShop TypeScript Interfaces (Web Store) ─────────
// Matches the existing Supabase schema — copied from mobile app types
// Cleaned of React Native specific types (ImageSource → string)

export interface Review {
    id: string;
    user_id: string;
    product_id: string;
    order_id?: string;
    rating: number;
    comment: string;
    created_at: string;
    updated_at?: string;
    // Joined fields
    profile?: {
        full_name: string;
        avatar_url: string;
    };
    user_name?: string;
    user_avatar?: string;
    images?: string[];
}

export interface HeroSlider {
    id: string;
    type: "home" | "flash_sale";
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
}

export interface Product {
    id: string;
    name: string;
    description: string | null;
    price: number;
    stock: number;
    category_id: string;
    material: string | null;
    care_instructions?: string | null;
    images: string[];
    is_featured: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    // Joined
    category?: Category;
    reviews?: Review[];
    // Display / Computed fields
    original_price?: number;
    rating?: number;
    reviews_count?: number;
    sold_count?: number;
    total_stock_for_deal?: number;
}

export interface AuthUser {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
    phoneNumber?: string;
    role: "customer" | "admin";
}

export type User = AuthUser;

export interface CartItem {
    productId: string;
    name: string;
    price: number;
    discountPrice?: number;
    imageUrl: string;
    quantity: number;
}

export type OrderStatus =
    | "pending"
    | "paid"
    | "processing"
    | "shipped"
    | "completed"
    | "cancelled"
    | "return_requested"
    | "returned";

export interface Order {
    id: string;
    user_id: string;
    total_amount: number;
    status: OrderStatus;
    shipping_address: string | null;
    payment_proof_url: string | null;
    courier: string | null;
    tracking_number: string | null;
    shipped_at: string | null;
    created_at: string;
    updated_at: string;
    // Joined
    items?: OrderItem[];
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    price_at_purchase: number;
    // Joined
    product?: Product;
}

export interface ProductFilter {
    categorySlug?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    material?: string;
    rating?: number;
    sortBy: "newest" | "price_asc" | "price_desc" | "popular";
    page: number;
    limit: number;
}

export interface WishlistItem {
    id: string;
    product_id: string;
    user_id: string;
    created_at: string;
    product?: Product;
}

export interface Address {
    id: string;
    user_id: string;
    label: string;
    recipient_name: string;
    phone_number: string;
    address_line: string;
    city: string;
    province: string;
    postal_code: string;
    is_default: boolean;
    category?: string;
    created_at: string;
}

export interface Voucher {
    id: string;
    code: string;
    name: string;
    description?: string;
    discount_type: "percentage" | "fixed";
    discount_value: number;
    min_purchase: number;
    max_discount?: number;
    start_date: string;
    end_date?: string;
    is_active: boolean;
    is_used?: boolean;
    used_at?: string;
}

export interface Wallet {
    id: string;
    user_id: string;
    balance: number;
    currency: string;
    updated_at: string;
}

export interface Transaction {
    id: string;
    wallet_id: string;
    amount: number;
    type: "topup" | "payment" | "transfer" | "refund";
    status: "pending" | "completed" | "failed" | "cancelled";
    description: string;
    reference_id?: string;
    created_at: string;
}

export type NotificationType =
    | "order"
    | "promo"
    | "system"
    | "wallet"
    | "cart"
    | "wishlist";

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: NotificationType;
    is_read: boolean;
    action_url?: string;
    data?: Record<string, unknown>;
    created_at: string;
}

export type PaymentMethod =
    | "cod"
    | "qris"
    | "bank_transfer"
    | "ewallet"
    | "card"
    | "crypto";
