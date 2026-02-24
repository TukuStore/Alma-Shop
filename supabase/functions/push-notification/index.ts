// @ts-ignore
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

declare const Deno: any;

const EXPO_PUSH_ENDPOINT = "https://exp.host/--/api/v2/push/send";

serve(async (req: Request) => {
    try {
        // Parse the webhook payload
        const payload = await req.json();

        // Check if this is an INSERT operation on the notifications table
        if (payload.type !== "INSERT" || payload.table !== "notifications" || !payload.record) {
            return new Response(JSON.stringify({ error: "Invalid webhook payload" }), { status: 400 });
        }

        const notification = payload.record;
        console.log(`Processing notification ID: ${notification.id} for user: ${notification.user_id || "ALL"}`);

        // Initialize Supabase admin client
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error("Missing Supabase environment variables");
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        // Query active push tokens
        let query = supabaseAdmin
            .from("push_tokens")
            .select("token")
            .eq("is_active", true);

        if (notification.user_id) {
            query = query.eq("user_id", notification.user_id);
        }

        const { data: tokensData, error: tokensError } = await query;

        if (tokensError) throw tokensError;

        if (!tokensData || tokensData.length === 0) {
            return new Response(JSON.stringify({ message: "No active push tokens found for users" }), { status: 200 });
        }

        // Construct Expo Push API messages
        const messages = tokensData.map((t: { token: string }) => ({
            to: t.token,
            sound: "default",
            title: notification.title,
            body: notification.message,
            data: {
                type: notification.type,
                actionUrl: notification.action_url,
                notificationId: notification.id
            },
        }));

        console.log(`Sending ${messages.length} push notifications via Expo...`);

        // Send messages in batches of 100 (Expo limit)
        const batchSize = 100;
        let successCount = 0;
        let failureCount = 0;

        for (let i = 0; i < messages.length; i += batchSize) {
            const batch = messages.slice(i, i + batchSize);

            const response = await fetch(EXPO_PUSH_ENDPOINT, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(batch),
            });

            if (!response.ok) {
                console.error(`Failed to send batch ${i / batchSize + 1}: ${response.statusText}`);
                failureCount += batch.length;
                continue;
            }

            const result = await response.json();
            // Complex response handling isn't strictly necessary for a basic webhook,
            // but we might log standard Expo errors here.
            successCount += batch.length;
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: `Sent ${successCount} notifications. Failed ${failureCount}.`
            }),
            { headers: { "Content-Type": "application/json" } }
        );

    } catch (error: any) {
        console.error("Webhook processing error:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
});
