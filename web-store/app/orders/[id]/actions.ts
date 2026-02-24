"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function markOrderAsPaid(orderId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Unauthorized" };
    }

    // Verify ownership
    const { data: order } = await supabase
        .from("orders")
        .select("id, user_id, status")
        .eq("id", orderId)
        .single();

    if (!order || order.user_id !== user.id) {
        return { error: "Order not found" };
    }

    if (order.status !== "pending") {
        return { error: "Order already processed" };
    }

    const { error } = await supabase
        .from("orders")
        .update({ status: "paid", updated_at: new Date().toISOString() })
        .eq("id", orderId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath(`/orders/${orderId}`);
    revalidatePath("/orders");
    revalidatePath("/profile");

    return { success: true };
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Unauthorized" };
    }

    // Check if user is admin
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    // Allow admin to set any status, or allow user to mark their own as paid/completed
    const { data: order } = await supabase
        .from("orders")
        .select("id, user_id, status")
        .eq("id", orderId)
        .single();

    if (!order) {
        return { error: "Order not found" };
    }

    const isAdmin = profile?.role === "admin";
    const isOwner = order.user_id === user.id;

    if (!isAdmin && !isOwner) {
        return { error: "Access denied" };
    }

    // Customers can mark as paid (from pending) or completed (from shipped)
    if (!isAdmin) {
        if (newStatus === "paid" && order.status !== "pending") {
            return { error: "Can only mark pending orders as paid" };
        }
        if (newStatus === "completed" && order.status !== "shipped") {
            return { error: "Can only complete shipped orders" };
        }
        if (!["paid", "completed"].includes(newStatus)) {
            return { error: "Customers can only mark orders as paid or completed" };
        }
    }

    const validStatuses = ["pending", "paid", "processing", "shipped", "completed", "cancelled"];
    if (!validStatuses.includes(newStatus)) {
        return { error: "Invalid status" };
    }

    const { error } = await supabase
        .from("orders")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", orderId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath(`/orders/${orderId}`);
    revalidatePath("/orders");
    revalidatePath("/profile");

    return { success: true };
}

/**
 * Mark an order as completed (Pesanan Selesai).
 * Only the order owner can do this, and only when status is 'shipped'.
 */
export async function markOrderAsCompleted(orderId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Unauthorized" };
    }

    // Verify ownership and status
    const { data: order } = await supabase
        .from("orders")
        .select("id, user_id, status")
        .eq("id", orderId)
        .single();

    if (!order || order.user_id !== user.id) {
        return { error: "Order not found" };
    }

    if (order.status !== "shipped") {
        return { error: "Only shipped orders can be marked as completed" };
    }

    const { error } = await supabase
        .from("orders")
        .update({ status: "completed", updated_at: new Date().toISOString() })
        .eq("id", orderId);

    if (error) {
        return { error: error.message };
    }

    // Create a notification
    await supabase.from("notifications").insert({
        user_id: user.id,
        title: "Pesanan Selesai",
        message: `Pesanan #${orderId.slice(0, 8).toUpperCase()} telah selesai. Terima kasih telah berbelanja!`,
        type: "order",
        is_read: false,
        action_url: `/orders/${orderId}`,
    });

    revalidatePath(`/orders/${orderId}`);
    revalidatePath("/orders");
    revalidatePath("/profile");

    return { success: true };
}
