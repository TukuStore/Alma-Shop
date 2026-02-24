// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.24.1";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log("Chat Assistant Function Initialized");

serve(async (req: any) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { message } = await req.json();

        if (!message) {
            return new Response(
                JSON.stringify({ error: 'Message is required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // @ts-ignore
        const apiKey = Deno.env.get('GEMINI_API_KEY');
        if (!apiKey) {
            console.error("GEMINI_API_KEY is missing");
            return new Response(
                JSON.stringify({ error: 'Server configuration error' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: "Kamu adalah asisten virtual (Customer Service) yang ramah untuk toko Medina. Kami menjual 8 jenis kain: Sarung Songket, Batik Cap, Batik Tulis, Batik Kombinasi, Batik Printing, Sutra/Spunsilk, Katun/Poliester, dan Goyor. Jawablah pertanyaan pelanggan dengan singkat (maksimal 3 kalimat), informatif, dan gunakan bahasa Indonesia yang santai tapi sopan."
        });

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: "Halo" }],
                },
                {
                    role: "model",
                    parts: [{ text: "Halo! Selamat datang di Medina Store. Ada yang bisa saya bantu hari ini? 😊" }],
                },
            ],
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        return new Response(
            JSON.stringify({ reply: responseText }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error: any) {
        console.error("Error processing chat:", error);
        return new Response(
            JSON.stringify({
                error: error.message || 'Unknown error',
                details: JSON.stringify(error, Object.getOwnPropertyNames(error))
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
