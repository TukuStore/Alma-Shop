import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: "Format request tidak valid. Harap sediakan array messages." },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // Context Loading (Lightweight)
        let contextString = "Kamu adalah AI Assistant untuk Alma Shop, toko e-commerce yang menjual sarung premium bergaya 'Heritage Modernity'.\n";
        contextString += "Bantulah customer dengan sopan, berikan informasi terkait produk, fitur, dan proses pemesanan.\n";
        contextString += "Alma Shop memadukan nilai tradisional Nusantara dengan gaya hidup masa kini.\n";

        // Grab up to 5 highest featured products to know about
        const { data: featured } = await supabase
            .from("products")
            .select("name, price, material, description")
            .eq("is_featured", true)
            .limit(5);

        if (featured && featured.length > 0) {
            contextString += "\nBeberapa produk unggulan kami (bisa dijadikan referensi rekomendasi):\n";
            featured.forEach(p => {
                contextString += `- ${p.name} (Material: ${p.material || 'Premium'}) - Rp ${p.price.toLocaleString('id-ID')}\n  Deskripsi: ${p.description || 'Sarung tenun premium'}\n`;
            });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: contextString,
        });

        // Formatting messages from {role: 'user'|'assistant', content: string} to Gemini format {role: 'user'|'model', parts: [{text: string}]}
        const geminiHistory = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        const latestMessage = messages[messages.length - 1].content;

        const chat = model.startChat({
            history: geminiHistory,
        });

        const result = await chat.sendMessage(latestMessage);
        const responseText = result.response.text();

        return NextResponse.json({ reply: responseText });

    } catch (error) {
        console.error("Chat API Error:", error);
        return NextResponse.json(
            { error: "Terjadi kesalahan internal saat memproses chat." },
            { status: 500 }
        );
    }
}
