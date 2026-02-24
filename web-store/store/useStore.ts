import type { CartItem } from "@/types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// ─── Store Interface ───────────────────────────────
interface AlmaStore {
    // Cart Slice
    cart: {
        items: CartItem[];
    };
    addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    getCartTotal: () => number;
    getCartItemCount: () => number;

    // Wishlist Slice (client-side IDs, synced with Supabase on auth)
    wishlist: {
        items: string[]; // Product IDs
    };
    toggleWishlist: (productId: string) => void;
    isInWishlist: (productId: string) => boolean;
    setWishlistItems: (items: string[]) => void;

    // UI Slice
    ui: {
        toastMessage: string | null;
        toastType: "success" | "error" | "info";
        isMobileMenuOpen: boolean;
        isCartPreviewOpen: boolean;
    };
    showToast: (message: string, type?: "success" | "error" | "info") => void;
    hideToast: () => void;
    setMobileMenuOpen: (open: boolean) => void;
    setCartPreviewOpen: (open: boolean) => void;
}

// ─── Store ─────────────────────────────────────────
export const useStore = create<AlmaStore>()(
    persist(
        (set, get) => ({
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

            // ── Wishlist ─────────────────────────────────
            wishlist: { items: [] },

            toggleWishlist: (productId) =>
                set((s) => {
                    const exists = s.wishlist.items.includes(productId);
                    return {
                        wishlist: {
                            items: exists
                                ? s.wishlist.items.filter((id) => id !== productId)
                                : [...s.wishlist.items, productId],
                        },
                    };
                }),

            isInWishlist: (productId) => get().wishlist.items.includes(productId),

            setWishlistItems: (items) => set({ wishlist: { items } }),

            // ── UI ───────────────────────────────────────
            ui: {
                toastMessage: null,
                toastType: "info",
                isMobileMenuOpen: false,
                isCartPreviewOpen: false,
            },

            showToast: (message, type = "info") =>
                set((s) => ({
                    ui: { ...s.ui, toastMessage: message, toastType: type },
                })),

            hideToast: () =>
                set((s) => ({ ui: { ...s.ui, toastMessage: null } })),

            setMobileMenuOpen: (open) =>
                set((s) => ({ ui: { ...s.ui, isMobileMenuOpen: open } })),

            setCartPreviewOpen: (open) =>
                set((s) => ({ ui: { ...s.ui, isCartPreviewOpen: open } })),
        }),
        {
            name: "alma-web-store",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                cart: state.cart,
                wishlist: state.wishlist,
            }),
        }
    )
);
