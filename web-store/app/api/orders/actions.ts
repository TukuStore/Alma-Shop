'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ============================================================================
// ORDER ACTIONS - Server Actions for Cross-App Sync
// ============================================================================

/**
 * Cancel Order - Updates status to CANCELLED
 * Syncs across: Web Store, Mobile App, Admin Web
 */
export async function cancelOrder(orderId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    // Verify order belongs to user
    const { data: order } = await supabase
        .from("orders")
        .select("user_id, status")
        .eq("id", orderId)
        .single();

    if (!order) {
        return { success: false, error: "Order not found" };
    }

    if (order.user_id !== user.id) {
        return { success: false, error: "Unauthorized" };
    }

    // Only allow cancel for PENDING orders
    if (order.status !== "PENDING") {
        return { success: false, error: "Can only cancel pending orders" };
    }

    // Update status to CANCELLED
    const { error } = await supabase
        .from("orders")
        .update({ status: "CANCELLED", cancelled_at: new Date().toISOString() })
        .eq("id", orderId);

    if (error) {
        return { success: false, error: error.message };
    }

    // Revalidate to refresh UI across all apps
    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);

    return { success: true };
}

/**
 * Mark Order as Completed - Updates status to COMPLETED
 * User-triggered action (usually after receiving shipment)
 * Syncs across: Web Store, Mobile App, Admin Web
 */
export async function markOrderAsCompleted(orderId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    // Verify order belongs to user
    const { data: order } = await supabase
        .from("orders")
        .select("user_id, status")
        .eq("id", orderId)
        .single();

    if (!order) {
        return { success: false, error: "Order not found" };
    }

    if (order.user_id !== user.id) {
        return { success: false, error: "Unauthorized" };
    }

    // Only allow complete for SHIPPED orders
    if (order.status !== "SHIPPED") {
        return { success: false, error: "Can only complete shipped orders" };
    }

    // Update status to COMPLETED
    const { error } = await supabase
        .from("orders")
        .update({ status: "COMPLETED", completed_at: new Date().toISOString() })
        .eq("id", orderId);

    if (error) {
        return { success: false, error: error.message };
    }

    // Revalidate to refresh UI across all apps
    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);

    // Trigger notification (optional - would use Supabase Realtime or Edge Function)
    // This would send a notification to admin that order was completed

    return { success: true };
}

/**
 * Request Return - Initiates a return request
 * Updates status to RETURN_REQUESTED
 * Syncs across: Web Store, Mobile App, Admin Web
 */
export async function requestReturn(orderId: string, reason: string, description: string = '', images: string[] = []) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    // Verify order belongs to user
    const { data: order } = await supabase
        .from("orders")
        .select("user_id, status")
        .eq("id", orderId)
        .single();

    if (!order) {
        return { success: false, error: "Order not found" };
    }

    if (order.user_id !== user.id) {
        return { success: false, error: "Unauthorized" };
    }

    // Only allow return for SHIPPED orders
    if (order.status !== "SHIPPED") {
        return { success: false, error: "Pesanan hanya bisa dikomplain saat berstatus SHIPPED" };
    }

    // Removed return window check because we moved complaint to SHIPPED status, thus completed_at won't exist yet

    // Create return request
    const { error: returnError } = await supabase
        .from("returns")
        .insert({
            order_id: orderId,
            user_id: user.id,
            reason,
            description,
            status: "PENDING",
            images,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });

    if (returnError) {
        return { success: false, error: returnError.message };
    }

    // Update order status
    const { error: orderError } = await supabase
        .from("orders")
        .update({ status: "RETURN_REQUESTED" })
        .eq("id", orderId);

    if (orderError) {
        return { success: false, error: orderError.message };
    }

    // Revalidate to refresh UI across all apps
    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);

    return { success: true };
}

/**
 * Get Order Actions - Returns available actions for an order
 * Used to conditionally render action buttons
 */
export async function getOrderActions(orderId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { actions: [], canAccess: false };
    }

    const { data: order } = await supabase
        .from("orders")
        .select("id, status, user_id")
        .eq("id", orderId)
        .single();

    if (!order || order.user_id !== user.id) {
        return { actions: [], canAccess: false };
    }

    // Define available actions per status
    const actionMap: Record<string, string[]> = {
        PENDING: ["pay", "cancel"],
        PAID: ["cancel"],
        PROCESSING: [],
        SHIPPED: ["complete", "track", "complain"],
        COMPLETED: ["reorder", "review"],
        CANCELLED: ["reorder"],
        RETURN_REQUESTED: ["return_details"],
        RETURN_REJECTED: ["reorder"],
        REFUNDED: ["reorder"],
    };

    return {
        actions: actionMap[order.status] || [],
        canAccess: true,
        status: order.status,
    };
}
