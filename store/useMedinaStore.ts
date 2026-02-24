import { supabase } from '@/lib/supabase';
import type { AuthUser, CartItem, Notification, ProductFilter } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// ─── Store Interface ───────────────────────────────
interface MedinaStore {
    // Auth Slice
    auth: {
        user: AuthUser | null;
        isAuthenticated: boolean;
        isLoading: boolean;
    };
    setUser: (user: AuthUser | null) => void;
    setAuthLoading: (loading: boolean) => void;
    logout: () => void;

    // Cart Slice
    cart: {
        items: CartItem[];
    };
    addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    getCartTotal: () => number;
    getCartItemCount: () => number;

    // Product Filter Slice
    filter: ProductFilter;
    setFilter: (filter: Partial<ProductFilter>) => void;
    resetFilter: () => void;

    // Wishlist Slice
    wishlist: {
        items: string[]; // Product IDs
    };
    toggleWishlist: (productId: string) => void;
    isInWishlist: (productId: string) => boolean;

    // UI Slice
    ui: {
        isFilterSheetOpen: boolean;
        isCartPreviewOpen: boolean;
        toastMessage: string | null;
        toastType: 'success' | 'error' | 'info';
    };
    setFilterSheetOpen: (open: boolean) => void;
    setCartPreviewOpen: (open: boolean) => void;
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
    hideToast: () => void;

    // Checkout Slice
    checkout: {
        addressId: string | null;
        deliveryMethod: string | null;
        paymentMethod: string | null;
        selectedItemIds: string[];
    };
    setCheckoutAddress: (addressId: string | null) => void;
    setDeliveryMethod: (method: string | null) => void;
    setPaymentMethod: (method: string | null) => void;
    setCheckoutItems: (ids: string[]) => void;
    placeOrder: () => Promise<string>; // Returns orderId

    // Recently Viewed Slice
    recentlyViewed: {
        items: import('@/types').Product[];
    };
    addToRecentlyViewed: (product: import('@/types').Product) => void;

    // Temp Address Location
    tempAddressLocation: { address: string; coordinates?: { lat: number; lng: number } } | null;
    setTempAddressLocation: (location: { address: string; coordinates?: { lat: number; lng: number } } | null) => void;

    // Settings Slice
    settings: {
        language: 'en' | 'id';
    };
    setLanguage: (language: 'en' | 'id') => void;

    // Notifications Slice
    notifications: {
        items: Notification[];
        unreadCount: number;
        permissionGranted: boolean;
    };
    setNotifications: (notifications: Notification[]) => void;
    addNotification: (notification: Notification) => void;
    markAsRead: (notificationId: string) => void;
    markAllAsRead: () => void;
    removeNotification: (id: string) => void;
    clearNotifications: () => void;
    setNotificationPermission: (granted: boolean) => void;
    incrementUnreadCount: () => void;
    decrementUnreadCount: () => void;
}

// ─── Defaults ──────────────────────────────────────
const DEFAULT_FILTER: ProductFilter = {
    sortBy: 'newest',
    page: 1,
    limit: 20,
};

// ─── Store ─────────────────────────────────────────
export const useMedinaStore = create<MedinaStore>()(
    persist(
        (set, get) => ({
            // ── Auth ─────────────────────────────────────
            auth: { user: null, isAuthenticated: false, isLoading: true },
            setUser: (user) =>
                set({ auth: { user, isAuthenticated: !!user, isLoading: false } }),
            setAuthLoading: (loading) =>
                set((s) => ({ auth: { ...s.auth, isLoading: loading } })),
            logout: () =>
                set({
                    auth: { user: null, isAuthenticated: false, isLoading: false },
                    cart: { items: [] },
                    wishlist: { items: [] },
                }),

            // ── Cart ─────────────────────────────────────
            cart: { items: [] },
            addToCart: (item, quantity = 1) =>
                set((s) => {
                    const existing = s.cart.items.find(
                        (i) => i.productId === item.productId
                    );
                    if (existing) {
                        return {
                            cart: {
                                items: s.cart.items.map((i) =>
                                    i.productId === item.productId
                                        ? { ...i, quantity: i.quantity + quantity }
                                        : i
                                ),
                            },
                        };
                    }
                    return { cart: { items: [...s.cart.items, { ...item, quantity }] } };
                }),
            removeFromCart: (productId) =>
                set((s) => ({
                    cart: {
                        items: s.cart.items.filter((i) => i.productId !== productId),
                    },
                })),
            updateQuantity: (productId, quantity) =>
                set((s) => ({
                    cart: {
                        items:
                            quantity <= 0
                                ? s.cart.items.filter((i) => i.productId !== productId)
                                : s.cart.items.map((i) =>
                                    i.productId === productId ? { ...i, quantity } : i
                                ),
                    },
                })),
            clearCart: () => set({ cart: { items: [] } }),
            getCartTotal: () =>
                get().cart.items.reduce(
                    (sum, i) => sum + (i.discountPrice ?? i.price) * i.quantity,
                    0
                ),
            getCartItemCount: () =>
                get().cart.items.reduce((sum, i) => sum + i.quantity, 0),

            // ── Filter ───────────────────────────────────
            filter: DEFAULT_FILTER,
            setFilter: (partial) =>
                set((s) => ({ filter: { ...s.filter, ...partial, page: 1 } })),
            resetFilter: () => set({ filter: DEFAULT_FILTER }),

            // ── Wishlist ─────────────────────────────────
            wishlist: { items: [] },
            toggleWishlist: (productId) =>
                set((s) => {
                    const exists = s.wishlist.items.includes(productId);
                    const newItems = exists
                        ? s.wishlist.items.filter((id) => id !== productId)
                        : [...s.wishlist.items, productId];

                    // Optional: Show toast
                    const msg = exists ? 'Removed from Wishlist' : 'Added to Wishlist';
                    // We can access ShowToast via get() or just construct state update, 
                    // but calling action inside action is tricky with set.
                    // Let's just update state.
                    return { wishlist: { items: newItems } };
                }),
            isInWishlist: (productId) => get().wishlist.items.includes(productId),

            // ── UI ───────────────────────────────────────
            ui: {
                isFilterSheetOpen: false,
                isCartPreviewOpen: false,
                toastMessage: null,
                toastType: 'info',
            },
            setFilterSheetOpen: (open) =>
                set((s) => ({ ui: { ...s.ui, isFilterSheetOpen: open } })),
            setCartPreviewOpen: (open) =>
                set((s) => ({ ui: { ...s.ui, isCartPreviewOpen: open } })),
            showToast: (message, type = 'info') =>
                set((s) => ({
                    ui: { ...s.ui, toastMessage: message, toastType: type },
                })),
            hideToast: () =>
                set((s) => ({ ui: { ...s.ui, toastMessage: null } })),

            // ─── Checkout ─────────────────────────────────
            checkout: {
                addressId: null,
                deliveryMethod: null,
                paymentMethod: null,
                selectedItemIds: [], // Track selected items for checkout
            },
            setCheckoutAddress: (addressId) =>
                set((s) => ({ checkout: { ...s.checkout, addressId } })),
            setDeliveryMethod: (deliveryMethod) =>
                set((s) => ({ checkout: { ...s.checkout, deliveryMethod } })),
            setPaymentMethod: (paymentMethod) =>
                set((s) => ({ checkout: { ...s.checkout, paymentMethod } })),
            setCheckoutItems: (ids) =>
                set((s) => ({ checkout: { ...s.checkout, selectedItemIds: ids } })),

            placeOrder: async () => {
                const { auth, cart, checkout, getCartTotal, clearCart } = get();
                const { user } = auth;
                const { addressId, deliveryMethod, paymentMethod, selectedItemIds } = checkout;

                if (!user) throw new Error('User not logged in');

                // Filter items to be ordered
                const orderItemsList = cart.items.filter(i => selectedItemIds.includes(i.productId));

                if (orderItemsList.length === 0) throw new Error('No items selected for checkout');
                if (!addressId) throw new Error('Delivery address required');
                if (!deliveryMethod) throw new Error('Delivery method required');
                if (!paymentMethod) throw new Error('Payment method required');

                // Calculate Total for specific items
                const itemsTotal = orderItemsList.reduce(
                    (sum, i) => sum + (i.discountPrice ?? i.price) * i.quantity,
                    0
                );

                let deliveryFee = 0;
                if (deliveryMethod === 'instant') deliveryFee = 20;
                else if (deliveryMethod === 'fast') deliveryFee = 12;
                else if (deliveryMethod === 'regular') deliveryFee = 5;

                const total = itemsTotal + deliveryFee;

                try {
                    // Fetch full address details to store as text
                    const { data: addressData, error: addressError } = await supabase
                        .from('addresses')
                        .select('*')
                        .eq('id', addressId)
                        .single();

                    if (addressError || !addressData) {
                        throw new Error('Gagal mengambil data alamat pengiriman');
                    }

                    const fullAddress = `${addressData.recipient_name} (${addressData.phone_number})\n${addressData.address_line}\n${addressData.city}, ${addressData.postal_code}`;

                    // 1. Create Order
                    const { data: order, error: orderError } = await supabase
                        .from('orders')
                        .insert({
                            user_id: user.id,
                            total_amount: total,
                            status: 'PENDING',
                            shipping_address: fullAddress
                        })
                        .select()
                        .single();

                    if (orderError) throw orderError;
                    if (!order) throw new Error('Failed to create order');

                    // 2. Create Order Items
                    const orderItemsPayload = orderItemsList.map(item => ({
                        order_id: order.id,
                        product_id: item.productId,
                        quantity: item.quantity,
                        price_at_purchase: item.discountPrice ?? item.price
                    }));

                    const { error: itemsError } = await supabase
                        .from('order_items')
                        .insert(orderItemsPayload);

                    if (itemsError) throw itemsError;

                    // 3. Remove Purchased Items from Cart
                    // We don't want to clear the whole cart if there are other items left
                    set((s) => ({
                        cart: {
                            items: s.cart.items.filter(i => !selectedItemIds.includes(i.productId))
                        }
                    }));

                    return order.id;
                } catch (error) {
                    console.error('Place Order Error:', error);
                    throw error;
                }
            },

            // ─── Recently Viewed ─────────────────────────
            recentlyViewed: { items: [] },
            addToRecentlyViewed: (product) =>
                set((s) => {
                    // Remove if exists to move to top
                    const filtered = s.recentlyViewed.items.filter((i) => i.id !== product.id);
                    return {
                        recentlyViewed: {
                            items: [product, ...filtered].slice(0, 20),
                        },
                    };
                }),

            // ─── Temp Address Location (For Map Picker) ──
            tempAddressLocation: null,
            setTempAddressLocation: (location) => set({ tempAddressLocation: location }),

            // ─── Settings ────────────────────────────────
            settings: { language: 'en' },
            setLanguage: (language) => set((s) => ({ settings: { ...s.settings, language } })),

            // ─── Notifications ───────────────────────────
            notifications: { items: [], unreadCount: 0, permissionGranted: false },
            setNotifications: (notifications) =>
                set((s) => ({
                    notifications: {
                        ...s.notifications,
                        items: notifications,
                        unreadCount: notifications.filter((n) => !n.is_read).length,
                    },
                })),
            addNotification: (notification) =>
                set((s) => ({
                    notifications: {
                        items: [notification, ...s.notifications.items],
                        unreadCount: notification.is_read ? s.notifications.unreadCount : s.notifications.unreadCount + 1,
                        permissionGranted: s.notifications.permissionGranted,
                    },
                })),
            markAsRead: (notificationId) =>
                set((s) => {
                    const updated = s.notifications.items.map((n) =>
                        n.id === notificationId ? { ...n, is_read: true } : n
                    );
                    return {
                        notifications: {
                            items: updated,
                            unreadCount: Math.max(0, s.notifications.unreadCount - 1),
                            permissionGranted: s.notifications.permissionGranted,
                        },
                    };
                }),
            markAllAsRead: () =>
                set((s) => ({
                    notifications: {
                        items: s.notifications.items.map((n) => ({ ...n, is_read: true })),
                        unreadCount: 0,
                        permissionGranted: s.notifications.permissionGranted,
                    },
                })),
            removeNotification: (id) =>
                set((s) => ({
                    notifications: {
                        items: s.notifications.items.filter((n) => n.id !== id),
                        unreadCount: s.notifications.items.find((n) => n.id === id && !n.is_read)
                            ? Math.max(0, s.notifications.unreadCount - 1)
                            : s.notifications.unreadCount,
                        permissionGranted: s.notifications.permissionGranted,
                    },
                })),
            clearNotifications: () =>
                set((s) => ({
                    notifications: { items: [], unreadCount: 0, permissionGranted: s.notifications.permissionGranted },
                })),
            setNotificationPermission: (granted) =>
                set((s) => ({
                    notifications: { ...s.notifications, permissionGranted: granted },
                })),
            incrementUnreadCount: () =>
                set((s) => ({
                    notifications: {
                        ...s.notifications,
                        unreadCount: s.notifications.unreadCount + 1,
                    },
                })),
            decrementUnreadCount: () =>
                set((s) => ({
                    notifications: {
                        ...s.notifications,
                        unreadCount: Math.max(0, s.notifications.unreadCount - 1),
                    },
                })),
        }),
        {
            name: 'medina-store',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                wishlist: state.wishlist,
                checkout: state.checkout,
                recentlyViewed: state.recentlyViewed,
                settings: state.settings,
            }),
        }
    )
);
