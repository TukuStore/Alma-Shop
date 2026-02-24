// @ts-ignore
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

declare const Deno: any;

/**
 * Auto-Complete Orders Edge Function
 * ===================================
 * Runs daily via Supabase Cron Job.
 * 
 * Logic:
 *   1. Find all orders WHERE status = 'shipped' AND shipped_at <= NOW() - 3 days
 *   2. Update their status to 'completed'
 *   3. Create a notification for each affected user
 * 
 * Trigger:
 *   - Supabase Dashboard → Database → Extensions → pg_cron
 *   - Or via Supabase Cron Jobs in the dashboard (Integrations → Cron)
 *   - Schedule: daily at 00:00 UTC
 *   - HTTP POST to this function URL
 * 
 * Security:
 *   - Validates Authorization header with CRON_SECRET or service role key
 *   - Uses SUPABASE_SERVICE_ROLE_KEY for database operations (bypasses RLS)
 */

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AUTO_COMPLETE_DAYS = 3;

serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: CORS_HEADERS });
    }

    try {
        // ─── Security: Validate the request ───
        const authHeader = req.headers.get("Authorization");
        const cronSecret = Deno.env.get("CRON_SECRET");
        const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        // Allow either: Bearer <CRON_SECRET>, Bearer <SERVICE_ROLE_KEY>, or apikey header
        const token = authHeader?.replace("Bearer ", "");
        const isAuthorized =
            token === cronSecret ||
            token === serviceRoleKey ||
            req.headers.get("apikey") === serviceRoleKey;

        if (!isAuthorized) {
            console.warn("Unauthorized request to auto-complete-orders");
            return new Response(
                JSON.stringify({ error: "Unauthorized" }),
                { status: 401, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
            );
        }

        // ─── Initialize Supabase Admin Client ───
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
            auth: { persistSession: false },
        });

        // ─── Find eligible orders ───
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - AUTO_COMPLETE_DAYS);
        const cutoffISO = cutoffDate.toISOString();

        console.log(`[auto-complete-orders] Looking for shipped orders older than ${AUTO_COMPLETE_DAYS} days (cutoff: ${cutoffISO})`);

        const { data: eligibleOrders, error: fetchError } = await supabaseAdmin
            .from("orders")
            .select("id, user_id, shipped_at, total_amount")
            .eq("status", "shipped")
            .lte("shipped_at", cutoffISO);

        if (fetchError) {
            throw new Error(`Failed to fetch eligible orders: ${fetchError.message}`);
        }

        if (!eligibleOrders || eligibleOrders.length === 0) {
            console.log("[auto-complete-orders] No orders to auto-complete.");
            return new Response(
                JSON.stringify({
                    success: true,
                    message: "No orders to auto-complete",
                    completed_count: 0,
                    checked_at: new Date().toISOString(),
                }),
                { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
            );
        }

        console.log(`[auto-complete-orders] Found ${eligibleOrders.length} orders to auto-complete.`);

        // ─── Batch update status to 'completed' ───
        const orderIds = eligibleOrders.map((o: any) => o.id);
        const now = new Date().toISOString();

        const { error: updateError } = await supabaseAdmin
            .from("orders")
            .update({
                status: "completed",
                updated_at: now,
            })
            .in("id", orderIds);

        if (updateError) {
            throw new Error(`Failed to update orders: ${updateError.message}`);
        }

        console.log(`[auto-complete-orders] Updated ${orderIds.length} orders to 'completed'.`);

        // ─── Create notifications for each user ───
        const notifications = eligibleOrders.map((order: any) => ({
            user_id: order.user_id,
            type: "order",
            title: "Pesanan Selesai Otomatis",
            message: `Pesanan #${order.id.slice(0, 8).toUpperCase()} telah selesai secara otomatis setelah ${AUTO_COMPLETE_DAYS} hari. Terima kasih telah berbelanja di AlmaStore!`,
            is_read: false,
            action_url: `/orders/${order.id}`,
        }));

        const { error: notifError } = await supabaseAdmin
            .from("notifications")
            .insert(notifications);

        if (notifError) {
            // Non-fatal: log but don't fail the whole operation
            console.error(`[auto-complete-orders] Warning: Failed to create notifications: ${notifError.message}`);
        } else {
            console.log(`[auto-complete-orders] Created ${notifications.length} notifications.`);
        }

        // ─── Return summary ───
        const summary = {
            success: true,
            completed_count: orderIds.length,
            order_ids: orderIds,
            checked_at: now,
            cutoff_date: cutoffISO,
            notifications_created: !notifError,
        };

        console.log(`[auto-complete-orders] Complete:`, JSON.stringify(summary));

        return new Response(
            JSON.stringify(summary),
            { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );

    } catch (error: any) {
        console.error("[auto-complete-orders] Error:", error.message);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
    }
});
