import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OrdersPageClient from "./page-client";

export default async function OrdersPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    // Fetch orders with items and timestamps for timeline
    const { data: orders, error } = await supabase
        .from("orders")
        .select(`
            id,
            total_amount,
            status,
            created_at,
            paid_at,
            processed_at,
            shipped_at,
            completed_at,
            cancelled_at,
            return_requested_at,
            courier,
            tracking_number,
            items:order_items(
                product_id,
                quantity,
                price_at_purchase,
                product:products(
                    id,
                    name,
                    images
                )
            )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching orders:", error);
    }

    // Pass data to client component
    return <OrdersPageClient initialOrders={orders || []} />;
}
